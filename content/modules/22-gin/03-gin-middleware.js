export default {
    id: '22-03',
    title: 'Middleware в Gin',
    description: 'Написание middleware, цепочки, готовые middleware, abort',
    estimatedTime: 25,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `<h2>Middleware в Gin</h2>
<p>Middleware — это функции, которые выполняются до/после обработчика. Gin использует <strong>цепочку обработчиков</strong> — каждый роут может иметь несколько middleware + финальный обработчик.</p>`
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `sequenceDiagram
    participant Client
    participant Logger
    participant Auth
    participant RateLimit
    participant Handler
    Client->>Logger: Request
    Logger->>Auth: c.Next()
    Auth->>RateLimit: c.Next()
    RateLimit->>Handler: c.Next()
    Handler-->>RateLimit: Response
    RateLimit-->>Auth: (после c.Next())
    Auth-->>Logger: (после c.Next())
    Logger-->>Client: Response`,
            caption: 'Middleware выполняются как матрёшка: до c.Next() — входящие, после c.Next() — исходящие'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Написание своего middleware',
            code: `package middleware

import (
    "log"
    "net/http"
    "time"
    "github.com/gin-gonic/gin"
)

// ─── Logger middleware ─────────────────────────
func Logger() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        path := c.Request.URL.Path

        // Выполняем следующий обработчик в цепочке
        c.Next()

        // После обработки запроса
        latency := time.Since(start)
        status := c.Writer.Status()

        log.Printf("[%d] %s %s — %v", status, c.Request.Method, path, latency)
    }
}

// ─── Auth middleware (JWT) ─────────────────────
func Auth(secret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")

        if token == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
                "error": "authorization header required",
            })
            return // c.Abort() уже вызван — return просто для ясности
        }

        // Валидируем токен (упрощённо)
        userID, err := validateToken(token, secret)
        if err != nil {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
                "error": "invalid token",
            })
            return
        }

        // Передаём данные следующим обработчикам
        c.Set("user_id", userID)
        c.Next()
    }
}

// ─── Rate Limiter (упрощённый) ─────────────────
func RateLimit(rps int) gin.HandlerFunc {
    limiter := make(chan struct{}, rps)

    return func(c *gin.Context) {
        select {
        case limiter <- struct{}{}:
            defer func() { <-limiter }()
            c.Next()
        default:
            c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
                "error": "rate limit exceeded",
            })
        }
    }
}

// ─── CORS middleware ───────────────────────────
func CORS() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "*")
        c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Content-Type,Authorization")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(http.StatusNoContent)
            return
        }
        c.Next()
    }
}`,
            explanation: 'c.Abort() останавливает цепочку — следующие middleware и обработчик не вызываются. c.Set/c.Get — передача данных между middleware в рамках одного запроса. Всегда возвращай HandlerFunc из функции — это позволяет параметризировать middleware.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Применение middleware',
            code: `func main() {
    r := gin.New() // Без дефолтных middleware

    // Глобальные middleware (для всех роутов)
    r.Use(middleware.Logger())
    r.Use(middleware.CORS())

    // Публичные роуты
    public := r.Group("/api")
    {
        public.POST("/auth/login", handlers.Login)
        public.POST("/auth/register", handlers.Register)
    }

    // Защищённые роуты
    protected := r.Group("/api")
    protected.Use(middleware.Auth("my-secret"))
    {
        protected.GET("/profile", handlers.GetProfile)
        protected.PUT("/profile", handlers.UpdateProfile)
    }

    // Admin с несколькими middleware
    admin := r.Group("/admin")
    admin.Use(
        middleware.Auth("my-secret"),
        middleware.RateLimit(10),
        middleware.AdminOnly(),
    )
    {
        admin.GET("/users", handlers.ListAllUsers)
        admin.DELETE("/users/:id", handlers.DeleteUser)
    }

    r.Run(":8080")
}`,
            explanation: 'Middleware применяются в порядке добавления. Для группы — только к роутам этой группы. r.Use() — глобально ко всем роутам.'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q2203-1',
                    type: 'single',
                    question: 'Что делает c.Abort() в middleware?',
                    options: [
                        'Завершает HTTP соединение',
                        'Останавливает выполнение следующих обработчиков в цепочке',
                        'Возвращает ошибку 500',
                        'Закрывает программу'
                    ],
                    correct: 1,
                    explanation: 'c.Abort() предотвращает вызов следующих middleware и финального обработчика. Текущий middleware продолжает выполняться. Обычно используется вместе с c.JSON() для ответа с ошибкой.'
                }
            ]
        }
    ]
};
