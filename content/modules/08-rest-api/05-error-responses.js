export default {
    id: '08-05',
    title: 'Обработка ошибок в API',
    description: 'Структурированные ошибки, коды ошибок, проблемная нотация RFC 7807, централизованная обработка',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Стандартный формат ошибок</h2>
                <p>Хаотичные ошибки — проблема для клиентов API. Нужен единый формат.</p>
                <p>Варианты стандартов:</p>
                <ul>
                    <li><strong>RFC 7807</strong> (Problem Details) — официальный стандарт</li>
                    <li><strong>Простой JSON</strong> — {"error": "message"}</li>
                    <li><strong>Структурированный</strong> — {"code": "USER_NOT_FOUND", "message": "..."}</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Структурированные ошибки API',
            code: `package api

import (
    "encoding/json"
    "net/http"
)

// APIError — стандартный формат ошибки
type APIError struct {
    Code    string      \`json:"code"\`              // машиночитаемый код
    Message string      \`json:"message"\`           // человекочитаемое описание
    Details interface{} \`json:"details,omitempty"\` // доп. данные (ошибки валидации)
    Status  int         \`json:"-"\`                 // HTTP код (не в JSON)
}

func (e *APIError) Error() string {
    return e.Message
}

// Предопределённые ошибки
var (
    ErrNotFound   = &APIError{Code: "NOT_FOUND",    Message: "resource not found",    Status: 404}
    ErrBadRequest = &APIError{Code: "BAD_REQUEST",  Message: "invalid request data",  Status: 400}
    ErrUnauth     = &APIError{Code: "UNAUTHORIZED",  Message: "authentication required", Status: 401}
    ErrForbidden  = &APIError{Code: "FORBIDDEN",    Message: "insufficient permissions", Status: 403}
    ErrConflict   = &APIError{Code: "CONFLICT",     Message: "resource already exists", Status: 409}
    ErrInternal   = &APIError{Code: "INTERNAL_ERROR", Message: "internal server error", Status: 500}
)

func WriteError(w http.ResponseWriter, err *APIError) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(err.Status)
    json.NewEncoder(w).Encode(err)
}

func WriteValidationError(w http.ResponseWriter, details interface{}) {
    WriteError(w, &APIError{
        Code:    "VALIDATION_ERROR",
        Message: "validation failed",
        Details: details,
        Status:  http.StatusUnprocessableEntity,
    })
}`,
            explanation: 'Машиночитаемые коды (NOT_FOUND, VALIDATION_ERROR) позволяют клиентам реагировать на конкретные ошибки. Status не в JSON — только HTTP-код.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Централизованная обработка ошибок',
            code: `package api

import (
    "errors"
    "net/http"
)

// AppError — ошибка с HTTP-кодом
type AppError struct {
    HTTPStatus int
    Code       string
    Message    string
    Cause      error
}

func (e *AppError) Error() string { return e.Message }
func (e *AppError) Unwrap() error  { return e.Cause }

// Конструкторы
func NotFound(msg string) *AppError {
    return &AppError{HTTPStatus: 404, Code: "NOT_FOUND", Message: msg}
}
func BadRequest(msg string) *AppError {
    return &AppError{HTTPStatus: 400, Code: "BAD_REQUEST", Message: msg}
}

// Централизованный обработчик ошибок
func HandleError(w http.ResponseWriter, err error) {
    var appErr *AppError
    if errors.As(err, &appErr) {
        WriteError(w, &APIError{
            Code:    appErr.Code,
            Message: appErr.Message,
            Status:  appErr.HTTPStatus,
        })
        return
    }

    // Неизвестная ошибка — не раскрываем детали
    // В реальном коде: логируем err
    WriteError(w, ErrInternal)
}

// Использование в хендлере
func getUserHandler(w http.ResponseWriter, r *http.Request) {
    id := 123
    user, err := service.GetUser(id)
    if err != nil {
        HandleError(w, err) // один вызов для любой ошибки
        return
    }
    WriteJSON(w, http.StatusOK, user)
}`,
            explanation: 'HandleError централизует логику: AppError → конкретный код, остальное → 500. Никогда не возвращайте внутренние ошибки клиенту (утечка информации).'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'RFC 7807 Problem Details',
            code: `package api

import (
    "encoding/json"
    "net/http"
)

// RFC 7807 формат
type Problem struct {
    Type     string \`json:"type"\`               // URI типа проблемы
    Title    string \`json:"title"\`              // короткое описание
    Status   int    \`json:"status"\`             // HTTP код
    Detail   string \`json:"detail,omitempty"\`   // детальное описание
    Instance string \`json:"instance,omitempty"\` // URI конкретного случая
}

func WriteProblem(w http.ResponseWriter, p *Problem) {
    w.Header().Set("Content-Type", "application/problem+json") // специальный MIME
    w.WriteHeader(p.Status)
    json.NewEncoder(w).Encode(p)
}

// Пример
// {
//   "type": "https://myapi.com/errors/not-found",
//   "title": "Resource Not Found",
//   "status": 404,
//   "detail": "User with ID 42 does not exist",
//   "instance": "/users/42"
// }`,
            explanation: 'RFC 7807 — официальный стандарт для HTTP API ошибок. Content-Type: application/problem+json. type — URI документации ошибки.'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<p><strong>Никогда не возвращайте:</strong></p>
            <ul>
                <li>Stack traces в продакшен API</li>
                <li>Сообщения SQL ошибок ("duplicate key value violates unique constraint")</li>
                <li>Внутренние имена функций и файлов</li>
            </ul>
            <p>Логируйте на сервере, клиенту — только безопасное сообщение + request ID для корреляции.</p>`
        },
        {
            type: 'editor',
            title: 'Практика: обработчик с ошибками',
            instructions: 'Реализуйте обработчик GET /users/{id}, который возвращает разные ошибки: 400 если id нечисловой, 404 если пользователь не найден, 200 иначе.',
            starterCode: `package main

import (
    "encoding/json"
    "net/http"
    "strconv"

    "github.com/go-chi/chi/v5"
)

type APIError struct {
    Code    string \`json:"code"\`
    Message string \`json:"message"\`
}

func writeAPIError(w http.ResponseWriter, status int, code, msg string) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(APIError{Code: code, Message: msg})
}

var users = map[int]string{1: "Alice", 2: "Bob"}

func getUserHandler(w http.ResponseWriter, r *http.Request) {
    idStr := chi.URLParam(r, "id")

    // Обработайте случаи:
    // 1. id не число → 400 BAD_REQUEST
    // 2. пользователь не найден → 404 NOT_FOUND
    // 3. успех → 200 {"id": id, "name": name}

    _ = strconv.Atoi
    _ = idStr
}

func main() {
    r := chi.NewRouter()
    r.Get("/users/{id}", getUserHandler)
    http.ListenAndServe(":8080", r)
}`,
            hints: [
                'id, err := strconv.Atoi(idStr); if err != nil { writeAPIError(w, 400, "BAD_REQUEST", "invalid id") }',
                'name, ok := users[id]; if !ok { writeAPIError(w, 404, "NOT_FOUND", "user not found") }',
                'w.Header().Set("Content-Type", "application/json")',
                'json.NewEncoder(w).Encode(map[string]any{"id": id, "name": name})'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Чем машиночитаемый код ошибки лучше просто сообщения?',
                    options: [
                        'Клиент может реагировать на конкретные ошибки программно',
                        'Занимает меньше места',
                        'Быстрее обрабатывается сервером',
                        'Не требует документации'
                    ],
                    correct: 0,
                    explanation: '"NOT_FOUND" позволяет клиенту if err.Code == "NOT_FOUND" { ... }. Текстовое сообщение может меняться, код — контракт.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Почему нельзя возвращать SQL ошибки в API ответе?',
                    options: [
                        'Утечка информации о схеме БД (таблицы, поля) — уязвимость',
                        'Клиент не понимает SQL',
                        'Это замедляет ответ',
                        'Запрещено RFC'
                    ],
                    correct: 0,
                    explanation: 'SQL ошибки раскрывают имена таблиц, полей, constraints — это помогает атакующему. Логируйте внутри, клиенту — только "internal error".'
                }
            ]
        }
    ]
};
