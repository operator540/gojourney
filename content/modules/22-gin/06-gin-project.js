export default {
    id: '22-06',
    title: 'Практика: REST API на Gin',
    description: 'Полный CRUD для задач: структура проекта, все эндпоинты, middleware',
    estimatedTime: 40,
    xpReward: 50,

    sections: [
        {
            type: 'theory',
            content: `<h2>Собираем всё вместе</h2>
<p>Создадим полноценный REST API для управления задачами (Todo API) — это стандартный тест знания фреймворка. Используем всё что изучили: роутинг, middleware, binding, ответы.</p>

<h3>Структура проекта</h3>
<pre style="background:var(--surface-2);padding:1rem;border-radius:8px;overflow-x:auto"><code>todo-api/
├── main.go
├── handlers/
│   └── todo.go
├── middleware/
│   └── auth.go
├── models/
│   └── todo.go
└── storage/
    └── memory.go</code></pre>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'models/todo.go',
            code: `package models

import "time"

type Todo struct {
    ID        int       \`json:"id"\`
    Title     string    \`json:"title"\`
    Done      bool      \`json:"done"\`
    CreatedAt time.Time \`json:"created_at"\`
}

type CreateTodoRequest struct {
    Title string \`json:"title" binding:"required,min=1,max=200"\`
}

type UpdateTodoRequest struct {
    Title *string \`json:"title" binding:"omitempty,min=1,max=200"\`
    Done  *bool   \`json:"done"\`
}`,
            explanation: 'Указатели *string и *bool в UpdateTodoRequest позволяют отличить "поле не передано" от "передано пустое значение" (PATCH-семантика). Если Title == nil — не обновляем, если Title == &"" — обновляем на пустую строку.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'storage/memory.go',
            code: `package storage

import (
    "errors"
    "sync"
    "time"
    "todo-api/models"
)

var ErrNotFound = errors.New("todo not found")

type MemoryStore struct {
    mu      sync.RWMutex
    todos   map[int]*models.Todo
    counter int
}

func NewMemoryStore() *MemoryStore {
    return &MemoryStore{todos: make(map[int]*models.Todo)}
}

func (s *MemoryStore) GetAll() []*models.Todo {
    s.mu.RLock()
    defer s.mu.RUnlock()
    result := make([]*models.Todo, 0, len(s.todos))
    for _, t := range s.todos {
        result = append(result, t)
    }
    return result
}

func (s *MemoryStore) Create(title string) *models.Todo {
    s.mu.Lock()
    defer s.mu.Unlock()
    s.counter++
    todo := &models.Todo{ID: s.counter, Title: title, CreatedAt: time.Now()}
    s.todos[s.counter] = todo
    return todo
}

func (s *MemoryStore) GetByID(id int) (*models.Todo, error) {
    s.mu.RLock()
    defer s.mu.RUnlock()
    if t, ok := s.todos[id]; ok {
        return t, nil
    }
    return nil, ErrNotFound
}

func (s *MemoryStore) Update(id int, req models.UpdateTodoRequest) (*models.Todo, error) {
    s.mu.Lock()
    defer s.mu.Unlock()
    t, ok := s.todos[id]
    if !ok {
        return nil, ErrNotFound
    }
    if req.Title != nil { t.Title = *req.Title }
    if req.Done != nil  { t.Done  = *req.Done  }
    return t, nil
}

func (s *MemoryStore) Delete(id int) error {
    s.mu.Lock()
    defer s.mu.Unlock()
    if _, ok := s.todos[id]; !ok {
        return ErrNotFound
    }
    delete(s.todos, id)
    return nil
}`,
            explanation: 'sync.RWMutex позволяет параллельное чтение (RLock) и эксклюзивную запись (Lock). В реальном проекте замените MemoryStore на PostgreSQL-репозиторий с тем же интерфейсом.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'handlers/todo.go',
            code: `package handlers

import (
    "errors"
    "net/http"
    "strconv"
    "todo-api/models"
    "todo-api/storage"
    "github.com/gin-gonic/gin"
)

type TodoHandler struct {
    store *storage.MemoryStore
}

func NewTodoHandler(store *storage.MemoryStore) *TodoHandler {
    return &TodoHandler{store: store}
}

func (h *TodoHandler) List(c *gin.Context) {
    todos := h.store.GetAll()
    c.JSON(http.StatusOK, gin.H{
        "data":  todos,
        "count": len(todos),
    })
}

func (h *TodoHandler) Create(c *gin.Context) {
    var req models.CreateTodoRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    todo := h.store.Create(req.Title)
    c.JSON(http.StatusCreated, gin.H{"data": todo})
}

func (h *TodoHandler) Get(c *gin.Context) {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }
    todo, err := h.store.GetByID(id)
    if err != nil {
        if errors.Is(err, storage.ErrNotFound) {
            c.JSON(http.StatusNotFound, gin.H{"error": "todo not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": todo})
}

func (h *TodoHandler) Update(c *gin.Context) {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }
    var req models.UpdateTodoRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    todo, err := h.store.Update(id, req)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "todo not found"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": todo})
}

func (h *TodoHandler) Delete(c *gin.Context) {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }
    if err := h.store.Delete(id); err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "todo not found"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}`,
            explanation: 'Handler-структура (не функции) позволяет внедрять зависимости (store, logger, config) без глобальных переменных. Это делает код тестируемым — можно передать mock-store в тестах.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'main.go — собираем всё',
            code: `package main

import (
    "todo-api/handlers"
    "todo-api/middleware"
    "todo-api/storage"
    "github.com/gin-gonic/gin"
)

func main() {
    // Зависимости
    store := storage.NewMemoryStore()
    todoHandler := handlers.NewTodoHandler(store)

    // Роутер
    r := gin.New()
    r.Use(gin.Logger())
    r.Use(gin.Recovery())
    r.Use(middleware.CORS())

    // ─── API v1 ──────────────────────────────────
    v1 := r.Group("/api/v1")

    // Публичные роуты
    v1.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "ok"})
    })

    // Защищённые роуты
    todos := v1.Group("/todos")
    todos.Use(middleware.Auth("my-secret-key"))
    {
        todos.GET("",         todoHandler.List)   // GET  /api/v1/todos
        todos.POST("",        todoHandler.Create) // POST /api/v1/todos
        todos.GET("/:id",     todoHandler.Get)    // GET  /api/v1/todos/1
        todos.PATCH("/:id",   todoHandler.Update) // PATCH /api/v1/todos/1
        todos.DELETE("/:id",  todoHandler.Delete) // DELETE /api/v1/todos/1
    }

    r.Run(":8080")
}`,
            explanation: 'Это стандартная структура Gin-приложения. Зависимости инжектируются через конструкторы, роуты сгруппированы, middleware применяются к нужным группам. Такую структуру легко масштабировать — добавь новую фичу в 3 шага: модель → хендлер → роуты.'
        },
        {
            type: 'editor',
            title: 'Практика: Добавь поиск по задачам',
            starterCode: `package handlers

import (
    "net/http"
    "strings"
    "github.com/gin-gonic/gin"
)

// TODO: Реализуй эндпоинт поиска
// GET /api/v1/todos/search?q=текст
// Должен возвращать все задачи, где title содержит q (регистронезависимо)

type TodoHandler struct {
    todos []string // упрощённо для примера
}

func (h *TodoHandler) Search(c *gin.Context) {
    // 1. Получи query-параметр "q" с помощью c.Query
    // 2. Если q пустой — верни ошибку 400
    // 3. Отфильтруй h.todos используя strings.Contains и strings.ToLower
    // 4. Верни отфильтрованный список с кодом 200
}`,
            hints: [
                'q := c.Query("q") — получить query-параметр',
                'if q == "" { c.JSON(400, ...) }',
                'strings.Contains(strings.ToLower(todo), strings.ToLower(q))',
                'c.JSON(200, gin.H{"data": results, "count": len(results)})'
            ]
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<strong>Следующие шаги после этого проекта:</strong><br>
1. Замени MemoryStore на PostgreSQL через pgx или GORM<br>
2. Добавь настоящую JWT-аутентификацию (golang-jwt/jwt)<br>
3. Добавь логирование через zap или slog<br>
4. Напиши интеграционные тесты с httptest.NewRecorder()<br>
5. Добавь Dockerfile и docker-compose.yml`
        }
    ]
};
