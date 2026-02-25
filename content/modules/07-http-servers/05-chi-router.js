export default {
    id: '07-05',
    title: 'Роутер chi',
    description: 'Установка chi, параметры пути, группировка маршрутов, встроенные middleware',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>chi — идиоматичный роутер Go</h2>
                <p><strong>chi</strong> — лёгкий и быстрый роутер, совместимый со стандартным <code>net/http</code>.</p>
                <p>Преимущества перед стандартным ServeMux:</p>
                <ul>
                    <li>Параметры пути: <code>/users/{id}</code></li>
                    <li>Группировка маршрутов</li>
                    <li>Встроенные middleware (logger, recoverer, cors)</li>
                    <li>Wildcards и regex параметры</li>
                    <li>Совместим с net/http Handler</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Установка',
            code: `go get github.com/go-chi/chi/v5`,
            explanation: 'chi v5 — актуальная версия. Совместима со стандартным http.Handler.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Базовый chi роутер',
            code: `package main

import (
    "encoding/json"
    "net/http"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
)

func main() {
    r := chi.NewRouter()

    // Встроенные middleware
    r.Use(middleware.Logger)      // логирование
    r.Use(middleware.Recoverer)   // panic recovery
    r.Use(middleware.RealIP)      // X-Forwarded-For
    r.Use(middleware.RequestID)   // X-Request-ID

    // Маршруты
    r.Get("/", homeHandler)
    r.Get("/health", healthHandler)

    // Группа с префиксом /api
    r.Route("/api", func(r chi.Router) {
        r.Use(middleware.SetHeader("Content-Type", "application/json"))

        r.Route("/users", func(r chi.Router) {
            r.Get("/", listUsersHandler)
            r.Post("/", createUserHandler)
            r.Get("/{id}", getUserHandler)
            r.Put("/{id}", updateUserHandler)
            r.Delete("/{id}", deleteUserHandler)
        })
    })

    http.ListenAndServe(":8080", r)
}`,
            explanation: 'r.Use — middleware для всех маршрутов роутера. r.Route — группа с префиксом, может иметь свои middleware. chi совместим с http.ListenAndServe.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Параметры пути',
            code: `package main

import (
    "fmt"
    "net/http"
    "strconv"

    "github.com/go-chi/chi/v5"
)

func getUserHandler(w http.ResponseWriter, r *http.Request) {
    // Извлечение параметра {id}
    idStr := chi.URLParam(r, "id")

    id, err := strconv.Atoi(idStr)
    if err != nil {
        http.Error(w, "invalid id", http.StatusBadRequest)
        return
    }

    user, err := findUser(id)
    if err != nil {
        http.Error(w, "not found", http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}

// Несколько параметров
// r.Get("/orgs/{orgID}/teams/{teamID}", func(w http.ResponseWriter, r *http.Request) {
//     orgID  := chi.URLParam(r, "orgID")
//     teamID := chi.URLParam(r, "teamID")
// })

// Wildcards
// r.Get("/files/*", func(w http.ResponseWriter, r *http.Request) {
//     path := chi.URLParam(r, "*")  // всё после /files/
// })`,
            explanation: 'chi.URLParam(r, "paramName") — получить параметр пути. Параметр всегда строка — конвертируйте сами. Всегда проверяйте ошибку конвертации.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Middleware только для группы',
            code: `package main

import (
    "net/http"
    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
)

func main() {
    r := chi.NewRouter()
    r.Use(middleware.Logger)

    // Публичные маршруты
    r.Group(func(r chi.Router) {
        r.Get("/health", healthHandler)
        r.Post("/login", loginHandler)
        r.Post("/register", registerHandler)
    })

    // Защищённые маршруты (требуют JWT)
    r.Group(func(r chi.Router) {
        r.Use(AuthMiddleware)  // только для этой группы

        r.Get("/profile", profileHandler)
        r.Route("/users", func(r chi.Router) {
            r.Get("/", listUsersHandler)
            r.Get("/{id}", getUserHandler)
        })
    })

    // Маршруты только для администраторов
    r.Group(func(r chi.Router) {
        r.Use(AuthMiddleware)
        r.Use(AdminOnlyMiddleware)

        r.Delete("/users/{id}", deleteUserHandler)
        r.Post("/admin/reset", resetHandler)
    })

    http.ListenAndServe(":8080", r)
}`,
            explanation: 'r.Group создаёт группу без изменения префикса. Middleware в группе не влияет на другие группы. Идеально для разделения публичных и защищённых маршрутов.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Важно из опыта:</strong> Регистрируйте статические маршруты (/me, /profile) ДО параметрических (/{id}). Иначе chi совпадёт "me" с параметром id.</p>
            <pre><code>r.Get("/me", getMeHandler)    // сначала!
r.Get("/{id}", getUserHandler) // потом</code></pre>`
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph TD
    A["chi.Router"] --> B["r.Use: Logger, Recoverer"]
    A --> C["GET /health"]
    A --> D["r.Route /api"]
    D --> E["r.Use: Auth"]
    D --> F["GET /users"]
    D --> G["POST /users"]
    D --> H["GET /users/{id}"]
    style A fill:#00add8,color:#fff
    style D fill:#d97706,color:#fff
    style E fill:#8b5cf6,color:#fff`,
            caption: 'Структура chi: глобальные и групповые middleware'
        },
        {
            type: 'editor',
            title: 'Практика: chi CRUD API',
            instructions: 'Создайте chi роутер с группой /api/books. Реализуйте маршруты: GET /api/books, POST /api/books, GET /api/books/{id}.',
            starterCode: `package main

import (
    "encoding/json"
    "net/http"
    "strconv"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
)

type Book struct {
    ID     int    \`json:"id"\`
    Title  string \`json:"title"\`
    Author string \`json:"author"\`
}

var books = []Book{
    {1, "The Go Programming Language", "Donovan & Kernighan"},
    {2, "Concurrency in Go", "Katherine Cox-Buday"},
}

func main() {
    r := chi.NewRouter()
    r.Use(middleware.Logger)

    // Создайте группу /api/books с тремя маршрутами
    // Используйте chi.URLParam для получения {id}

    http.ListenAndServe(":8080", r)
}`,
            hints: [
                'r.Route("/api/books", func(r chi.Router) { ... })',
                'r.Get("/", func(w http.ResponseWriter, r *http.Request) { json.NewEncoder(w).Encode(books) })',
                'r.Get("/{id}", func(w http.ResponseWriter, r *http.Request) { id, _ := strconv.Atoi(chi.URLParam(r, "id")) ... })',
                'w.Header().Set("Content-Type", "application/json") перед Encode'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Как получить параметр {id} из пути в chi?',
                    options: [
                        'chi.URLParam(r, "id")',
                        'r.PathValue("id")',
                        'r.Params["id"]',
                        'chi.Param(r, "id")'
                    ],
                    correct: 0,
                    explanation: 'chi.URLParam(r, "paramName") — стандартный способ в chi. r.PathValue — для Go 1.22+ стандартного ServeMux.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Разница между r.Route и r.Group в chi?',
                    options: [
                        'r.Route добавляет префикс пути, r.Group — нет',
                        'r.Group быстрее',
                        'r.Route только для GET',
                        'Нет разницы'
                    ],
                    correct: 0,
                    explanation: 'r.Route("/api", ...) — все внутренние маршруты получат префикс /api. r.Group — группирует без изменения пути (только для middleware).'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'middleware.Recoverer в chi делает:',
                    options: [
                        'Перехватывает панику и возвращает 500',
                        'Восстанавливает соединение после ошибки',
                        'Кэширует ответы',
                        'Сжимает тело ответа'
                    ],
                    correct: 0,
                    explanation: 'Recoverer — встроенный middleware chi, аналог нашего Recovery. Ловит panic, логирует stack trace, возвращает 500 Internal Server Error.'
                }
            ]
        }
    ]
};
