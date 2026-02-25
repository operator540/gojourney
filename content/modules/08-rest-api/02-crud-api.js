export default {
    id: '08-02',
    title: 'Полный CRUD API',
    description: 'Полный Users API: структура проекта, слоёная архитектура, роутинг, in-memory хранилище, все пять операций CRUD с тестированием через curl',
    estimatedTime: 35,
    xpReward: 30,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: картотека в офисе</h2>
                <p>Представьте офис с картотекой сотрудников. Есть три роли:</p>
                <ul>
                    <li><strong>Секретарь (Handler)</strong> — принимает запросы от посетителей, проверяет документы, выдаёт ответы. Не знает, где физически лежат карточки.</li>
                    <li><strong>Менеджер (Service)</strong> — принимает решения: кого можно уволить, кого нельзя нанять дважды. Не занимается бумажной работой.</li>
                    <li><strong>Архивариус (Repository)</strong> — физически ищет, добавляет и удаляет карточки в картотеке. Не знает бизнес-правил.</li>
                </ul>
                <p>Это <strong>3-слойная архитектура</strong>. Каждый слой знает только о следующем. Заменить картотеку на компьютер (PostgreSQL) — только архивариус меняется, менеджер и секретарь не знают об этом.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Структура проекта и контракты между слоями</h2>
                <p>Профессиональный Go API организован так:</p>
                <pre style="background:var(--surface-2); padding:16px; border-radius:8px; overflow-x:auto;"><code>users-api/
├── cmd/
│   └── server/
│       └── main.go          ← точка входа, сборка зависимостей
├── internal/
│   ├── domain/
│   │   └── user.go          ← модели, ошибки, интерфейсы
│   ├── repository/
│   │   └── memory.go        ← реализация хранилища
│   ├── service/
│   │   └── user.go          ← бизнес-логика
│   └── handler/
│       └── user.go          ← HTTP обработчики
└── go.mod</code></pre>

                <p>Слои связаны <strong>интерфейсами</strong> — не конкретными типами. Это позволяет тестировать каждый слой отдельно:</p>

                <table style="width:100%; border-collapse:collapse; margin:16px 0;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="padding:10px 14px; border:1px solid var(--border); color:var(--accent);">Слой</th>
                            <th style="padding:10px 14px; border:1px solid var(--border);">Ответственность</th>
                            <th style="padding:10px 14px; border:1px solid var(--border);">Знает о</th>
                            <th style="padding:10px 14px; border:1px solid var(--border);">НЕ знает о</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><strong>Handler</strong></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">HTTP, JSON, статус-коды</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Service interface</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">SQL, БД, бизнес-правила</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:8px 14px; border:1px solid var(--border);"><strong>Service</strong></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Бизнес-логика, валидация</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Repository interface</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">HTTP, JSON, SQL</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><strong>Repository</strong></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">CRUD операции с данными</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">БД / in-memory</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">HTTP, бизнес-правила</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'domain/user.go — модели, интерфейсы, ошибки',
            code: `package domain

import (
    "errors"
    "time"
)

// ===== МОДЕЛИ =====

type User struct {
    ID        int       \`json:"id"\`
    Name      string    \`json:"name"\`
    Email     string    \`json:"email"\`
    Role      string    \`json:"role"\`
    Active    bool      \`json:"active"\`
    CreatedAt time.Time \`json:"created_at"\`
    UpdatedAt time.Time \`json:"updated_at"\`
}

// DTO для создания — без ID, дат, только то что передаёт клиент
type CreateUserInput struct {
    Name  string \`json:"name"\`
    Email string \`json:"email"\`
    Role  string \`json:"role"\`
}

// DTO для обновления — все поля опциональны (указатели)
type UpdateUserInput struct {
    Name  *string \`json:"name"\`
    Email *string \`json:"email"\`
    Role  *string \`json:"role"\`
}

// ===== SENTINEL ОШИБКИ =====

var (
    ErrNotFound      = errors.New("user not found")
    ErrEmailExists   = errors.New("email already exists")
    ErrInvalidInput  = errors.New("invalid input")
)

// ===== ИНТЕРФЕЙС РЕПОЗИТОРИЯ =====
// Сервис работает через этот интерфейс — не знает о реализации

type UserRepository interface {
    FindAll() ([]*User, error)
    FindByID(id int) (*User, error)
    FindByEmail(email string) (*User, error)
    Create(user *User) error
    Update(user *User) error
    Delete(id int) error
}

// ===== ИНТЕРФЕЙС СЕРВИСА =====
// Хендлер работает через этот интерфейс

type UserService interface {
    List() ([]*User, error)
    GetByID(id int) (*User, error)
    Create(input CreateUserInput) (*User, error)
    Update(id int, input UpdateUserInput) (*User, error)
    Delete(id int) error
}`,
            explanation: 'domain пакет — сердце приложения. Он не зависит ни от чего внешнего. UpdateUserInput использует указатели (*string) чтобы различить "поле не передано" от "передано пустое значение" — partial update.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'repository/memory.go — in-memory хранилище с RWMutex',
            code: `package repository

import (
    "sync"
    "time"
    "users-api/internal/domain"
)

type memoryUserRepo struct {
    mu     sync.RWMutex
    users  map[int]*domain.User
    nextID int
}

func NewMemoryUserRepo() domain.UserRepository {
    return &memoryUserRepo{
        users:  make(map[int]*domain.User),
        nextID: 1,
    }
}

func (r *memoryUserRepo) FindAll() ([]*domain.User, error) {
    r.mu.RLock()                    // Множество горутин могут читать одновременно
    defer r.mu.RUnlock()

    users := make([]*domain.User, 0, len(r.users))
    for _, u := range r.users {
        // Копируем чтобы внешний код не изменил внутренние данные
        copy := *u
        users = append(users, &copy)
    }
    return users, nil
}

func (r *memoryUserRepo) FindByID(id int) (*domain.User, error) {
    r.mu.RLock()
    defer r.mu.RUnlock()

    u, ok := r.users[id]
    if !ok {
        return nil, domain.ErrNotFound
    }
    copy := *u
    return &copy, nil
}

func (r *memoryUserRepo) FindByEmail(email string) (*domain.User, error) {
    r.mu.RLock()
    defer r.mu.RUnlock()

    for _, u := range r.users {
        if u.Email == email {
            copy := *u
            return &copy, nil
        }
    }
    return nil, domain.ErrNotFound
}

func (r *memoryUserRepo) Create(user *domain.User) error {
    r.mu.Lock()                     // Эксклюзивная блокировка для записи
    defer r.mu.Unlock()

    user.ID = r.nextID
    r.nextID++
    user.CreatedAt = time.Now()
    user.UpdatedAt = time.Now()

    // Сохраняем копию
    copy := *user
    r.users[user.ID] = &copy
    return nil
}

func (r *memoryUserRepo) Update(user *domain.User) error {
    r.mu.Lock()
    defer r.mu.Unlock()

    if _, ok := r.users[user.ID]; !ok {
        return domain.ErrNotFound
    }
    user.UpdatedAt = time.Now()
    copy := *user
    r.users[user.ID] = &copy
    return nil
}

func (r *memoryUserRepo) Delete(id int) error {
    r.mu.Lock()
    defer r.mu.Unlock()

    if _, ok := r.users[id]; !ok {
        return domain.ErrNotFound
    }
    delete(r.users, id)
    return nil
}`,
            explanation: 'RWMutex: RLock позволяет многим горутинам читать параллельно. Lock — эксклюзивная блокировка, блокирует и чтение и запись. Всегда копируем объект при возврате — защита от гонок данных.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'service/user.go — бизнес-логика',
            code: `package service

import (
    "errors"
    "fmt"
    "strings"
    "users-api/internal/domain"
)

type userService struct {
    repo domain.UserRepository
}

func NewUserService(repo domain.UserRepository) domain.UserService {
    return &userService{repo: repo}
}

func (s *userService) List() ([]*domain.User, error) {
    return s.repo.FindAll()
}

func (s *userService) GetByID(id int) (*domain.User, error) {
    user, err := s.repo.FindByID(id)
    if err != nil {
        return nil, err   // domain.ErrNotFound пробрасываем как есть
    }
    return user, nil
}

func (s *userService) Create(input domain.CreateUserInput) (*domain.User, error) {
    // === БИЗНЕС-ВАЛИДАЦИЯ ===
    input.Name = strings.TrimSpace(input.Name)
    input.Email = strings.TrimSpace(strings.ToLower(input.Email))

    if input.Name == "" {
        return nil, fmt.Errorf("%w: name is required", domain.ErrInvalidInput)
    }
    if len(input.Name) < 2 || len(input.Name) > 100 {
        return nil, fmt.Errorf("%w: name must be 2-100 chars", domain.ErrInvalidInput)
    }
    if input.Email == "" {
        return nil, fmt.Errorf("%w: email is required", domain.ErrInvalidInput)
    }

    // Проверяем допустимые роли
    validRoles := map[string]bool{"user": true, "admin": true, "moderator": true}
    if input.Role == "" {
        input.Role = "user"  // значение по умолчанию
    }
    if !validRoles[input.Role] {
        return nil, fmt.Errorf("%w: role must be user/admin/moderator", domain.ErrInvalidInput)
    }

    // === БИЗНЕС-ПРАВИЛА ===
    // Email должен быть уникальным
    existing, err := s.repo.FindByEmail(input.Email)
    if err != nil && !errors.Is(err, domain.ErrNotFound) {
        return nil, fmt.Errorf("check email: %w", err)
    }
    if existing != nil {
        return nil, domain.ErrEmailExists
    }

    user := &domain.User{
        Name:   input.Name,
        Email:  input.Email,
        Role:   input.Role,
        Active: true,
    }

    if err := s.repo.Create(user); err != nil {
        return nil, fmt.Errorf("create user: %w", err)
    }
    return user, nil
}

func (s *userService) Update(id int, input domain.UpdateUserInput) (*domain.User, error) {
    user, err := s.repo.FindByID(id)
    if err != nil {
        return nil, err
    }

    // Partial update — обновляем только переданные поля
    if input.Name != nil {
        name := strings.TrimSpace(*input.Name)
        if len(name) < 2 || len(name) > 100 {
            return nil, fmt.Errorf("%w: name must be 2-100 chars", domain.ErrInvalidInput)
        }
        user.Name = name
    }
    if input.Email != nil {
        email := strings.TrimSpace(strings.ToLower(*input.Email))
        // Проверяем что email не занят другим пользователем
        existing, err := s.repo.FindByEmail(email)
        if err != nil && !errors.Is(err, domain.ErrNotFound) {
            return nil, fmt.Errorf("check email: %w", err)
        }
        if existing != nil && existing.ID != id {
            return nil, domain.ErrEmailExists
        }
        user.Email = email
    }
    if input.Role != nil {
        user.Role = *input.Role
    }

    if err := s.repo.Update(user); err != nil {
        return nil, fmt.Errorf("update user: %w", err)
    }
    return user, nil
}

func (s *userService) Delete(id int) error {
    return s.repo.Delete(id)
}`,
            explanation: 'Сервис — единственное место с бизнес-правилами. fmt.Errorf("%w: ...", domain.ErrInvalidInput) — оборачивание sentinel ошибок для errors.Is(). Partial update через указатели: nil = не обновлять поле.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'handler/user.go — HTTP слой',
            code: `package handler

import (
    "encoding/json"
    "errors"
    "net/http"
    "strconv"
    "users-api/internal/domain"

    "github.com/go-chi/chi/v5"
)

type UserHandler struct {
    svc domain.UserService
}

func NewUserHandler(svc domain.UserService) *UserHandler {
    return &UserHandler{svc: svc}
}

func (h *UserHandler) Routes() chi.Router {
    r := chi.NewRouter()
    r.Get("/", h.List)
    r.Post("/", h.Create)
    r.Get("/{id}", h.GetByID)
    r.Patch("/{id}", h.Update)     // PATCH = partial update
    r.Delete("/{id}", h.Delete)
    return r
}

// ===== HELPERS =====

func writeJSON(w http.ResponseWriter, status int, data any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
    writeJSON(w, status, map[string]string{"error": message})
}

func parseID(r *http.Request) (int, error) {
    return strconv.Atoi(chi.URLParam(r, "id"))
}

// ===== HANDLERS =====

// GET /users — список всех пользователей
func (h *UserHandler) List(w http.ResponseWriter, r *http.Request) {
    users, err := h.svc.List()
    if err != nil {
        writeError(w, http.StatusInternalServerError, "internal error")
        return
    }
    // Никогда не отдавайте null для массивов — отдавайте []
    if users == nil {
        users = []*domain.User{}
    }
    writeJSON(w, http.StatusOK, users)
}

// POST /users — создать пользователя
func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
    var input domain.CreateUserInput
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        writeError(w, http.StatusBadRequest, "invalid JSON body")
        return
    }

    user, err := h.svc.Create(input)
    if err != nil {
        switch {
        case errors.Is(err, domain.ErrInvalidInput):
            writeError(w, http.StatusUnprocessableEntity, err.Error())
        case errors.Is(err, domain.ErrEmailExists):
            writeError(w, http.StatusConflict, "email already registered")
        default:
            writeError(w, http.StatusInternalServerError, "internal error")
        }
        return
    }

    writeJSON(w, http.StatusCreated, user)
}

// GET /users/{id} — получить пользователя
func (h *UserHandler) GetByID(w http.ResponseWriter, r *http.Request) {
    id, err := parseID(r)
    if err != nil {
        writeError(w, http.StatusBadRequest, "id must be a positive integer")
        return
    }

    user, err := h.svc.GetByID(id)
    if err != nil {
        if errors.Is(err, domain.ErrNotFound) {
            writeError(w, http.StatusNotFound, "user not found")
            return
        }
        writeError(w, http.StatusInternalServerError, "internal error")
        return
    }

    writeJSON(w, http.StatusOK, user)
}

// PATCH /users/{id} — частичное обновление
func (h *UserHandler) Update(w http.ResponseWriter, r *http.Request) {
    id, err := parseID(r)
    if err != nil {
        writeError(w, http.StatusBadRequest, "id must be a positive integer")
        return
    }

    var input domain.UpdateUserInput
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        writeError(w, http.StatusBadRequest, "invalid JSON body")
        return
    }

    user, err := h.svc.Update(id, input)
    if err != nil {
        switch {
        case errors.Is(err, domain.ErrNotFound):
            writeError(w, http.StatusNotFound, "user not found")
        case errors.Is(err, domain.ErrInvalidInput):
            writeError(w, http.StatusUnprocessableEntity, err.Error())
        case errors.Is(err, domain.ErrEmailExists):
            writeError(w, http.StatusConflict, "email already registered")
        default:
            writeError(w, http.StatusInternalServerError, "internal error")
        }
        return
    }

    writeJSON(w, http.StatusOK, user)
}

// DELETE /users/{id} — удалить
func (h *UserHandler) Delete(w http.ResponseWriter, r *http.Request) {
    id, err := parseID(r)
    if err != nil {
        writeError(w, http.StatusBadRequest, "id must be a positive integer")
        return
    }

    if err := h.svc.Delete(id); err != nil {
        if errors.Is(err, domain.ErrNotFound) {
            writeError(w, http.StatusNotFound, "user not found")
            return
        }
        writeError(w, http.StatusInternalServerError, "internal error")
        return
    }

    w.WriteHeader(http.StatusNoContent) // 204 — без тела ответа
}`,
            explanation: 'Handler тонкий: только HTTP-детали. Вся логика — в сервисе. errors.Is работает через цепочку обёрнутых ошибок. PATCH возвращает 200 с обновлённым объектом, DELETE возвращает 204 без тела.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'cmd/server/main.go — сборка приложения',
            code: `package main

import (
    "log"
    "net/http"
    "users-api/internal/handler"
    "users-api/internal/repository"
    "users-api/internal/service"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
)

func main() {
    // Dependency Injection — вручную, снизу вверх
    repo    := repository.NewMemoryUserRepo()
    svc     := service.NewUserService(repo)
    h       := handler.NewUserHandler(svc)

    r := chi.NewRouter()
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)
    r.Use(middleware.RequestID)

    // Монтируем все маршруты users
    r.Mount("/api/v1/users", h.Routes())

    // Healthcheck
    r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        w.Write([]byte(\`{"status":"ok"}\`))
    })

    log.Println("Server started on :8080")
    if err := http.ListenAndServe(":8080", r); err != nil {
        log.Fatal(err)
    }
}`,
            explanation: 'Dependency Injection вручную: repo → svc → handler. Зависимости создаются в main, не в конструкторах — это упрощает тестирование и управление жизненным циклом.'
        },
        {
            type: 'theory',
            content: `
                <h2>Тестирование через curl</h2>
                <p>После запуска сервера (<code>go run ./cmd/server</code>) проверяем все операции:</p>

                <pre style="background:var(--surface-2); padding:16px; border-radius:8px; overflow-x:auto;"><code># CREATE — создать пользователя
curl -X POST http://localhost:8080/api/v1/users \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Alice","email":"alice@example.com","role":"admin"}'
# → 201 Created {"id":1,"name":"Alice","email":"alice@example.com",...}

# LIST — список всех
curl http://localhost:8080/api/v1/users
# → 200 OK [{"id":1,...}]

# READ — один пользователь
curl http://localhost:8080/api/v1/users/1
# → 200 OK {"id":1,...}

# UPDATE — обновить только имя (partial)
curl -X PATCH http://localhost:8080/api/v1/users/1 \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Alice Smith"}'
# → 200 OK {"id":1,"name":"Alice Smith",...}

# DELETE — удалить
curl -X DELETE http://localhost:8080/api/v1/users/1
# → 204 No Content

# NOT FOUND
curl http://localhost:8080/api/v1/users/999
# → 404 {"error":"user not found"}

# CONFLICT — дублирующийся email
curl -X POST http://localhost:8080/api/v1/users \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Bob","email":"alice@example.com"}'
# → 409 {"error":"email already registered"}</code></pre>

                <table style="width:100%; border-collapse:collapse; margin:16px 0;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="padding:10px 14px; border:1px solid var(--border); color:var(--accent);">Метод</th>
                            <th style="padding:10px 14px; border:1px solid var(--border);">Путь</th>
                            <th style="padding:10px 14px; border:1px solid var(--border);">Успех</th>
                            <th style="padding:10px 14px; border:1px solid var(--border);">Тело ответа</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>GET</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>/users</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">200</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Массив пользователей</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>POST</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>/users</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">201</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Созданный объект</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>GET</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>/users/{id}</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">200</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Объект пользователя</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>PATCH</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>/users/{id}</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">200</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Обновлённый объект</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>DELETE</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>/users/{id}</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">204</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Нет тела</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<strong>PUT vs PATCH — в чём разница?</strong>
            <ul>
                <li><strong>PUT</strong> — полная замена. Клиент отправляет весь объект. Поля не переданные в теле — обнуляются. Идемпотентен.</li>
                <li><strong>PATCH</strong> — частичное обновление. Клиент отправляет только изменяемые поля. Остальные поля не трогаются.</li>
            </ul>
            <p>Для большинства API PATCH удобнее — не нужно передавать весь объект ради изменения одного поля. В Go реализуется через указатели (<code>*string</code>): <code>nil</code> = поле не передано = не обновлять.</p>`
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<strong>Типичные ошибки при CRUD API:</strong>
            <ul>
                <li>Возвращать <code>null</code> вместо <code>[]</code> для пустых массивов — фронт получит <code>null.map is not a function</code></li>
                <li>Не копировать объекты из map — горутина может изменить данные пока они читаются</li>
                <li>Использовать PUT там где нужен PATCH — клиент забывает передать поле и оно обнуляется в БД</li>
                <li>Возвращать 200 вместо 201 при создании ресурса</li>
                <li>Не проверять уникальность на уровне сервиса — дубликаты в БД</li>
            </ul>`
        },
        {
            type: 'editor',
            title: 'Практика: добавьте фильтрацию по роли',
            instructions: 'Реализуйте GET /users?role=admin — фильтрацию пользователей по роли. Добавьте в List хендлер чтение query параметра role и фильтрацию результата.',
            starterCode: `package handler

import (
    "net/http"
    "users-api/internal/domain"
)

// Текущий List — возвращает всех
func (h *UserHandler) List(w http.ResponseWriter, r *http.Request) {
    users, err := h.svc.List()
    if err != nil {
        writeError(w, http.StatusInternalServerError, "internal error")
        return
    }
    if users == nil {
        users = []*domain.User{}
    }
    writeJSON(w, http.StatusOK, users)
}

// Задача: прочитайте query параметр "role" из URL
// Если role передан — отфильтруйте users по полю Role
// Пример: GET /users?role=admin → только admin пользователи
// Если role не передан — возвращайте всех как раньше`,
            hints: [
                'role := r.URL.Query().Get("role") — читаем query параметр',
                'Если role == "" — возвращаем всех',
                'filtered := make([]*domain.User, 0) — создаём пустой слайс',
                'for _, u := range users { if u.Role == role { filtered = append(filtered, u) } }',
                'writeJSON(w, http.StatusOK, filtered)'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Зачем в UpdateUserInput поля объявлены как *string (указатели), а не string?',
                    options: [
                        'Для экономии памяти',
                        'Чтобы различить "поле не передано" (nil) от "передано пустое значение" ("")',
                        'Указатели быстрее передаются по сети',
                        'Это требование JSON стандарта'
                    ],
                    correct: 1,
                    explanation: 'При PATCH клиент передаёт только изменяемые поля. Если Name не передано — json.Decoder не тронет поле, оно останется nil. Если передано пустое "" — это другая ситуация. string нельзя различить: "" и "не передано" — одинаково.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Зачем копировать объект (*copy = *u) при возврате из in-memory репозитория?',
                    options: [
                        'Для сортировки данных',
                        'Чтобы внешний код не мог изменить внутренние данные через указатель — защита от гонок',
                        'Копирование делает код быстрее',
                        'Это требование chi роутера'
                    ],
                    correct: 1,
                    explanation: 'Если вернуть указатель на внутренний объект map, вызывающий код может изменить объект без блокировки. Это data race. Возврат копии гарантирует что внутренние данные защищены мьютексом.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Какой HTTP статус код возвращает успешное создание ресурса?',
                    options: [
                        '200 OK',
                        '201 Created',
                        '202 Accepted',
                        '204 No Content'
                    ],
                    correct: 1,
                    explanation: '201 Created — стандартный ответ при POST создании нового ресурса. 200 OK — для чтения/обновления. 204 No Content — для DELETE без тела. 202 Accepted — для асинхронных операций.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Почему не нужно возвращать null для пустого списка пользователей?',
                    options: [
                        'null занимает больше байт в JSON',
                        'Go не умеет сериализовать null',
                        'Клиентский код обычно вызывает .map/.forEach на результате — null вызовет TypeError',
                        'REST запрещает null в ответах'
                    ],
                    correct: 2,
                    explanation: 'Фронтенд-код обычно делает users.map(...) или users.forEach(...). Если API вернёт null вместо [] — получим "Cannot read properties of null". Всегда инициализируйте: if users == nil { users = []*domain.User{} }'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Где должна происходить проверка уникальности email?',
                    options: [
                        'В Handler — сразу после парсинга JSON',
                        'В Repository — перед записью в хранилище',
                        'В Service — это бизнес-правило',
                        'В middleware'
                    ],
                    correct: 2,
                    explanation: '"Email должен быть уникальным" — это бизнес-правило, не HTTP-логика и не деталь хранилища. Service проверяет email через FindByEmail() перед созданием. Repository просто хранит данные без бизнес-правил.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'В чём разница между PUT и PATCH?',
                    options: [
                        'PUT быстрее PATCH',
                        'PUT — полная замена ресурса, PATCH — частичное обновление',
                        'PATCH создаёт ресурс, PUT обновляет',
                        'Нет разницы, оба обновляют ресурс'
                    ],
                    correct: 1,
                    explanation: 'PUT заменяет весь ресурс: не переданные поля обнуляются. PATCH обновляет только переданные поля. Для большинства API PATCH предпочтительнее — безопаснее для клиента.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Что означает middleware.Recoverer в chi?',
                    options: [
                        'Восстанавливает соединение при разрыве сети',
                        'Перехватывает panic и возвращает 500 вместо падения сервера',
                        'Кэширует ответы для повторных запросов',
                        'Восстанавливает данные из backup'
                    ],
                    correct: 1,
                    explanation: 'Recoverer — middleware, который оборачивает каждый хендлер в recover(). Если в хендлере случится panic — сервер не упадёт, клиент получит 500 Internal Server Error, а в лог запишется стек вызовов.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Какой HTTP код и тело при успешном DELETE /users/5?',
                    options: [
                        '200 OK с {"success":true}',
                        '200 OK с удалённым объектом',
                        '204 No Content без тела',
                        '202 Accepted'
                    ],
                    correct: 2,
                    explanation: '204 No Content — стандарт для DELETE. Ресурс удалён, тела нет — нечего возвращать. Важно: не вызывать writeJSON после w.WriteHeader(204) — это приведёт к ошибке "superfluous response.WriteHeader call".'
                }
            ]
        }
    ]
};
