export default {
    id: '07-06',
    title: 'JSON API',
    description: 'encoding/json, теги структур, кастомная сериализация, ошибки API, паттерны ответов',
    estimatedTime: 25,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>JSON в Go</h2>
                <p>Пакет <code>encoding/json</code> — стандартный инструмент для работы с JSON.</p>
                <ul>
                    <li><code>json.Marshal</code> / <code>json.Unmarshal</code> — байты</li>
                    <li><code>json.NewEncoder</code> / <code>json.NewDecoder</code> — потоки (HTTP)</li>
                    <li>Теги структур управляют сериализацией</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Теги структур',
            code: `package main

import (
    "encoding/json"
    "fmt"
    "time"
)

type User struct {
    ID        int       \`json:"id"\`
    FirstName string    \`json:"first_name"\`          // snake_case в JSON
    LastName  string    \`json:"last_name"\`
    Email     string    \`json:"email"\`
    Password  string    \`json:"-"\`                   // никогда не в JSON
    Age       int       \`json:"age,omitempty"\`       // пропустить если 0
    CreatedAt time.Time \`json:"created_at"\`
    UpdatedAt time.Time \`json:"updated_at,omitempty"\`
}

func main() {
    user := User{
        ID:        1,
        FirstName: "Alice",
        LastName:  "Smith",
        Email:     "alice@example.com",
        Password:  "secret",  // не попадёт в JSON!
        // Age: 0 — пропустится из-за omitempty
    }

    data, _ := json.MarshalIndent(user, "", "  ")
    fmt.Println(string(data))
    // {
    //   "id": 1,
    //   "first_name": "Alice",
    //   "last_name": "Smith",
    //   "email": "alice@example.com",
    //   "created_at": "0001-01-01T00:00:00Z"
    // }
}`,
            explanation: '"-" полностью исключает поле. "omitempty" пропускает нулевые значения (0, "", nil, false). Теги — строки в backticks.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Паттерны API-ответов',
            code: `package main

import (
    "encoding/json"
    "net/http"
)

// Стандартная структура ответа
type APIResponse struct {
    Data    any    \`json:"data,omitempty"\`
    Error   string \`json:"error,omitempty"\`
    Message string \`json:"message,omitempty"\`
}

// Хелпер для JSON-ответов
func writeJSON(w http.ResponseWriter, status int, v any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
    writeJSON(w, status, APIResponse{Error: msg})
}

func getUserHandler(w http.ResponseWriter, r *http.Request) {
    user, err := findUser(1)
    if err != nil {
        writeError(w, http.StatusNotFound, "user not found")
        return
    }
    writeJSON(w, http.StatusOK, APIResponse{Data: user})
}

// Или с pagination
type PaginatedResponse struct {
    Data     any \`json:"data"\`
    Total    int \`json:"total"\`
    Page     int \`json:"page"\`
    PageSize int \`json:"page_size"\`
}`,
            explanation: 'Единый формат ответа упрощает работу с API. Data для успеха, Error для ошибок, Message для информационных ответов.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Безопасное декодирование',
            code: `package main

import (
    "encoding/json"
    "errors"
    "net/http"
)

// Безопасный декодер с защитой от больших запросов
func decodeJSON(r *http.Request, v any) error {
    // Ограничение размера тела (1 МБ)
    r.Body = http.MaxBytesReader(nil, r.Body, 1<<20)

    dec := json.NewDecoder(r.Body)
    dec.DisallowUnknownFields() // ошибка при неизвестных полях

    if err := dec.Decode(v); err != nil {
        var syntaxErr *json.SyntaxError
        var unmarshalErr *json.UnmarshalTypeError

        switch {
        case errors.As(err, &syntaxErr):
            return fmt.Errorf("invalid JSON at offset %d", syntaxErr.Offset)
        case errors.As(err, &unmarshalErr):
            return fmt.Errorf("invalid type for field %s", unmarshalErr.Field)
        default:
            return err
        }
    }

    // Проверка, что прочитали только один объект
    if dec.More() {
        return errors.New("body must contain a single JSON object")
    }
    return nil
}

func createUserHandler(w http.ResponseWriter, r *http.Request) {
    var input struct {
        Name  string \`json:"name"\`
        Email string \`json:"email"\`
    }

    if err := decodeJSON(r, &input); err != nil {
        writeError(w, http.StatusBadRequest, err.Error())
        return
    }

    // Дальнейшая обработка
    writeJSON(w, http.StatusCreated, map[string]any{"name": input.Name})
}`,
            explanation: 'MaxBytesReader защищает от DoS. DisallowUnknownFields — строгое декодирование. Проверка dec.More() — защита от нескольких JSON-объектов.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Кастомная сериализация',
            code: `package main

import (
    "encoding/json"
    "fmt"
    "strings"
)

// Тип с кастомным JSON
type Role string

const (
    RoleAdmin  Role = "admin"
    RoleUser   Role = "user"
    RoleMod    Role = "moderator"
)

type Money struct {
    Amount   int    // в копейках
    Currency string
}

// Кастомный MarshalJSON
func (m Money) MarshalJSON() ([]byte, error) {
    return json.Marshal(fmt.Sprintf("%.2f %s", float64(m.Amount)/100, m.Currency))
}

// Кастомный UnmarshalJSON
func (m *Money) UnmarshalJSON(data []byte) error {
    var s string
    if err := json.Unmarshal(data, &s); err != nil {
        return err
    }
    parts := strings.Fields(s)
    if len(parts) != 2 {
        return fmt.Errorf("invalid money format: %s", s)
    }
    var amount float64
    fmt.Sscanf(parts[0], "%f", &amount)
    m.Amount = int(amount * 100)
    m.Currency = parts[1]
    return nil
}`,
            explanation: 'Реализуйте json.Marshaler и json.Unmarshaler для кастомной сериализации. Полезно для Money, Time, Enum-типов с особым форматом.'
        },
        {
            type: 'editor',
            title: 'Практика: JSON API эндпоинт',
            instructions: 'Создайте POST /tasks обработчик: принимает JSON {"title","priority"}, возвращает созданную задачу с id и created_at. priority должно быть "low","medium","high".',
            starterCode: `package main

import (
    "encoding/json"
    "net/http"
    "time"
)

type Priority string

const (
    PriorityLow    Priority = "low"
    PriorityMedium Priority = "medium"
    PriorityHigh   Priority = "high"
)

type Task struct {
    ID        int       \`json:"id"\`
    Title     string    \`json:"title"\`
    Priority  Priority  \`json:"priority"\`
    CreatedAt time.Time \`json:"created_at"\`
}

var tasks []Task
var nextID = 1

func createTaskHandler(w http.ResponseWriter, r *http.Request) {
    var input struct {
        Title    string   \`json:"title"\`
        Priority Priority \`json:"priority"\`
    }

    // Декодируйте JSON
    // Валидируйте: title не пустой, priority одно из допустимых
    // Создайте задачу, добавьте в slice
    // Верните 201 с задачей

    w.Header().Set("Content-Type", "application/json")
    _ = input
}

func main() {
    http.HandleFunc("/tasks", createTaskHandler)
    http.ListenAndServe(":8080", nil)
}`,
            hints: [
                'json.NewDecoder(r.Body).Decode(&input)',
                'if input.Title == "" { writeError(w, 400, "title required") }',
                'valid priorities: PriorityLow, PriorityMedium, PriorityHigh',
                'task := Task{ID: nextID, Title: input.Title, Priority: input.Priority, CreatedAt: time.Now()}'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что означает тег json:"-"?',
                    options: [
                        'Поле никогда не включается в JSON',
                        'Имя поля в JSON — дефис',
                        'Поле пропускается при пустом значении',
                        'Поле только для чтения'
                    ],
                    correct: 0,
                    explanation: '"-" полностью исключает поле из сериализации/десериализации. Для имени "-" используйте json:"-,": struct{ F string `json:"-,"` }'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Чем json.NewEncoder(w).Encode(v) лучше json.Marshal?',
                    options: [
                        'Пишет напрямую в ResponseWriter без промежуточного буфера',
                        'Быстрее обрабатывает большие структуры',
                        'Поддерживает больше типов',
                        'Автоматически устанавливает Content-Type'
                    ],
                    correct: 0,
                    explanation: 'Encoder пишет в io.Writer потоково — не нужен промежуточный []byte буфер. Для HTTP-ответов это эффективнее и проще.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Для чего dec.DisallowUnknownFields()?',
                    options: [
                        'Возвращать ошибку при неизвестных полях в JSON',
                        'Запретить null значения',
                        'Ограничить размер запроса',
                        'Запретить вложенные объекты'
                    ],
                    correct: 0,
                    explanation: 'По умолчанию Go игнорирует неизвестные поля. DisallowUnknownFields() заставит вернуть ошибку — полезно для строгой валидации API.'
                }
            ]
        }
    ]
};
