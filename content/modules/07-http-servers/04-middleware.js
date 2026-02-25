export default {
    id: '07-04',
    title: 'Middleware',
    description: 'Паттерн middleware, цепочки, логирование, аутентификация, CORS, recovery',
    estimatedTime: 25,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Middleware (промежуточное ПО)</h2>
                <p>Middleware — функция, которая оборачивает Handler, выполняя код <em>до</em> и/или <em>после</em> него.</p>
                <p>Типичная сигнатура: <code>func(next http.Handler) http.Handler</code></p>
                <p>Применения:</p>
                <ul>
                    <li>Логирование запросов</li>
                    <li>Аутентификация и авторизация</li>
                    <li>CORS заголовки</li>
                    <li>Сжатие (gzip)</li>
                    <li>Rate limiting</li>
                    <li>Panic recovery</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Простейший middleware',
            code: `package main

import (
    "log"
    "net/http"
    "time"
)

// Middleware логирует время запроса
func Logger(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        // Код ДО обработчика
        log.Printf("→ %s %s", r.Method, r.URL.Path)

        next.ServeHTTP(w, r) // вызов следующего обработчика

        // Код ПОСЛЕ обработчика
        log.Printf("← %s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
    w.Write([]byte("Hello!"))
}

func main() {
    handler := Logger(http.HandlerFunc(helloHandler))
    http.ListenAndServe(":8080", handler)
}`,
            explanation: 'Middleware возвращает новый Handler. next.ServeHTTP вызывает следующее звено. Код до = preprocessing, код после = postprocessing.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Цепочка middleware',
            code: `package main

import "net/http"

// Применяем несколько middleware
func Chain(h http.Handler, middlewares ...func(http.Handler) http.Handler) http.Handler {
    // Применяем в обратном порядке, чтобы первый middleware был внешним
    for i := len(middlewares) - 1; i >= 0; i-- {
        h = middlewares[i](h)
    }
    return h
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/api/users", usersHandler)

    // Logger → Auth → CORS → usersHandler
    handler := Chain(mux, Logger, Auth, CORS)

    http.ListenAndServe(":8080", handler)
}

// Или применяем поочерёдно (читается снизу вверх)
func main2() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", homeHandler)

    var h http.Handler = mux
    h = Recovery(h)   // внешний — первый вызывается, последний завершается
    h = Logger(h)
    h = Auth(h)       // внутренний — последний вызывается, первый завершается

    http.ListenAndServe(":8080", h)
}`,
            explanation: 'Порядок middleware важен. Recovery должен быть самым внешним — ловит паники из всей цепочки. Logger обычно тоже снаружи.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Middleware аутентификации',
            code: `package main

import (
    "context"
    "net/http"
    "strings"
)

type contextKey string
const userKey contextKey = "user"

func Auth(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Извлекаем токен из заголовка Authorization: Bearer <token>
        authHeader := r.Header.Get("Authorization")
        if !strings.HasPrefix(authHeader, "Bearer ") {
            http.Error(w, "missing token", http.StatusUnauthorized)
            return
        }

        token := strings.TrimPrefix(authHeader, "Bearer ")
        user, err := validateToken(token)
        if err != nil {
            http.Error(w, "invalid token", http.StatusUnauthorized)
            return
        }

        // Передаём данные пользователя через контекст
        ctx := context.WithValue(r.Context(), userKey, user)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// В обработчике достаём из контекста
func protectedHandler(w http.ResponseWriter, r *http.Request) {
    user := r.Context().Value(userKey).(*User)
    w.Write([]byte("Hello, " + user.Name))
}`,
            explanation: 'context.WithValue передаёт данные между middleware и обработчиком. Используйте кастомный тип для ключа (избегаем коллизий). r.WithContext создаёт новый запрос с контекстом.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Middleware CORS и Recovery',
            code: `package main

import (
    "log"
    "net/http"
)

// CORS для SPA-приложений
func CORS(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

        // Preflight запрос браузера
        if r.Method == http.MethodOptions {
            w.WriteHeader(http.StatusNoContent)
            return
        }

        next.ServeHTTP(w, r)
    })
}

// Recovery — ловит паники, возвращает 500
func Recovery(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                log.Printf("PANIC: %v", err)
                http.Error(w, "internal server error", http.StatusInternalServerError)
            }
        }()
        next.ServeHTTP(w, r)
    })
}`,
            explanation: 'CORS необходим для браузерных запросов с другого домена. Preflight (OPTIONS) — предварительный запрос браузера. Recovery предотвращает падение сервера при панике в обработчике.'
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `sequenceDiagram
    participant C as Client
    participant R as Recovery
    participant L as Logger
    participant A as Auth
    participant H as Handler

    C->>R: Request
    R->>L: next(w,r)
    L->>A: next(w,r)
    A->>A: Проверка токена
    A->>H: next(w,r) + context
    H-->>A: Response
    A-->>L: done
    L->>L: Логирование
    L-->>R: done
    R-->>C: Response`,
            caption: 'Цепочка middleware: каждый оборачивает следующий'
        },
        {
            type: 'editor',
            title: 'Практика: middleware логирования',
            instructions: 'Напишите middleware RequestID, который добавляет уникальный ID запроса (UUID/random) в заголовок X-Request-ID и передаёт его через контекст.',
            starterCode: `package main

import (
    "context"
    "fmt"
    "math/rand"
    "net/http"
)

type ctxKey string
const reqIDKey ctxKey = "requestID"

func RequestID(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Генерируйте ID: fmt.Sprintf("%x", rand.Int63())
        // Установите заголовок X-Request-ID
        // Добавьте ID в контекст через context.WithValue
        // Вызовите next

        _ = fmt.Sprintf // убираем ошибку импорта
        _ = rand.Int63
    })
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        id := r.Context().Value(reqIDKey).(string)
        fmt.Fprintf(w, "Request ID: %s", id)
    })

    http.ListenAndServe(":8080", RequestID(mux))
}`,
            hints: [
                'id := fmt.Sprintf("%x", rand.Int63())',
                'w.Header().Set("X-Request-ID", id)',
                'ctx := context.WithValue(r.Context(), reqIDKey, id)',
                'next.ServeHTTP(w, r.WithContext(ctx))'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Сигнатура middleware в Go:',
                    options: [
                        'func(next http.Handler) http.Handler',
                        'func(w http.ResponseWriter, r *http.Request)',
                        'func(http.Handler) error',
                        'middleware func(next)'
                    ],
                    correct: 0,
                    explanation: 'Middleware принимает Handler и возвращает новый Handler. Внутри — вызов next.ServeHTTP(w, r) для передачи управления.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Как передать данные из middleware в обработчик?',
                    options: [
                        'Через context.WithValue и r.WithContext',
                        'Через глобальные переменные',
                        'Через заголовки ответа',
                        'Через файлы'
                    ],
                    correct: 0,
                    explanation: 'context.WithValue(r.Context(), key, value) — добавляет значение. r.WithContext(ctx) — создаёт новый Request с контекстом. В обработчике: r.Context().Value(key).'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Почему Recovery middleware должен быть самым внешним?',
                    options: [
                        'Чтобы ловить паники из всех вложенных обработчиков и middleware',
                        'Для лучшей производительности',
                        'Это требование net/http',
                        'Не важно где он стоит'
                    ],
                    correct: 0,
                    explanation: 'defer recover() ловит паники только в своей горутине. Если Recovery внутри, он не поймает паники из внешних middleware. Снаружи — защищает всё.'
                }
            ]
        }
    ]
};
