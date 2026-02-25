export default {
    id: '18-03',
    title: 'Middleware в Echo',
    description: 'Встроенные middleware, создание собственных, порядок выполнения, группировка',
    estimatedTime: 25,
    xpReward: 22,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Middleware — конвейер обработки запросов</h2>
                <p>Middleware — функция, которая оборачивает обработчик запроса и выполняется до/после него. Это цепочка: каждый middleware передаёт управление следующему через <code>next(c)</code>.</p>
                <p>Типичные задачи middleware:</p>
                <ul>
                    <li>Логирование запросов</li>
                    <li>Аутентификация и авторизация</li>
                    <li>CORS заголовки</li>
                    <li>Rate limiting</li>
                    <li>Recover (перехват паник)</li>
                    <li>Request ID и tracing</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Встроенные middleware Echo',
            code: `package main

import (
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
)

func main() {
    e := echo.New()

    // Logger — логирует каждый запрос
    // [2024-01-15 10:30:45] GET /users 200 1.234ms
    e.Use(middleware.Logger())

    // Recover — перехватывает panic, возвращает 500
    e.Use(middleware.Recover())

    // CORS — разрешает кросс-доменные запросы
    e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
        AllowOrigins: []string{"https://example.com", "http://localhost:3000"},
        AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE},
        AllowHeaders: []string{"Content-Type", "Authorization"},
    }))

    // RequestID — генерирует X-Request-ID для каждого запроса
    e.Use(middleware.RequestID())

    // Gzip сжатие ответов
    e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
        Level: 5, // 1-9
    }))

    // Rate limiting — 20 запросов/сек
    e.Use(middleware.RateLimiter(
        middleware.NewRateLimiterMemoryStore(20),
    ))

    // Body size limit
    e.Use(middleware.BodyLimit("2M"))

    e.GET("/health", func(c echo.Context) error {
        return c.JSON(200, map[string]string{"status": "ok"})
    })

    e.Start(":8080")
}`,
            explanation: 'e.Use() применяет middleware глобально ко всем роутам. Порядок важен: Recover должен быть первым (перехватит паники из других middleware). Logger обычно идёт вторым.'
        },
        {
            type: 'theory',
            content: `
                <h2>Создание собственного middleware</h2>
                <p>Подпись middleware в Echo: <code>func(next echo.HandlerFunc) echo.HandlerFunc</code>. Функция принимает следующий обработчик и возвращает новый обработчик.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Кастомный middleware: аутентификация JWT',
            code: `package main

import (
    "net/http"
    "strings"
    "time"

    "github.com/labstack/echo/v4"
)

// AuthMiddleware проверяет JWT токен
func AuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
    return func(c echo.Context) error {
        // 1. Извлекаем токен из заголовка
        auth := c.Request().Header.Get("Authorization")
        if auth == "" {
            return c.JSON(http.StatusUnauthorized, map[string]string{
                "error": "Authorization header required",
            })
        }

        // 2. Проверяем формат "Bearer <token>"
        parts := strings.SplitN(auth, " ", 2)
        if len(parts) != 2 || parts[0] != "Bearer" {
            return c.JSON(http.StatusUnauthorized, map[string]string{
                "error": "Invalid authorization format",
            })
        }

        token := parts[1]

        // 3. Валидируем токен (упрощённо, в реальности — JWT библиотека)
        userID, err := validateToken(token)
        if err != nil {
            return c.JSON(http.StatusUnauthorized, map[string]string{
                "error": "Invalid token",
            })
        }

        // 4. Кладём данные пользователя в контекст
        c.Set("user_id", userID)
        c.Set("authenticated_at", time.Now())

        // 5. Передаём управление следующему обработчику
        return next(c)
    }
}

func validateToken(token string) (int, error) {
    // Упрощённо. В реальности: jwt.Parse(token, ...)
    if token == "valid-token-42" {
        return 42, nil
    }
    return 0, echo.ErrUnauthorized
}

// RequestLoggerMiddleware — логирует детали запроса
func RequestLoggerMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
    return func(c echo.Context) error {
        start := time.Now()

        // Выполняем следующий обработчик
        err := next(c)

        // После обработки — логируем
        c.Logger().Infof("%s %s %d %v",
            c.Request().Method,
            c.Request().URL.Path,
            c.Response().Status,
            time.Since(start),
        )

        return err
    }
}

func main() {
    e := echo.New()
    e.Use(RequestLoggerMiddleware)

    // Публичные роуты
    e.POST("/login", func(c echo.Context) error {
        return c.JSON(200, map[string]string{"token": "valid-token-42"})
    })

    // Защищённая группа
    api := e.Group("/api")
    api.Use(AuthMiddleware)

    api.GET("/profile", func(c echo.Context) error {
        userID := c.Get("user_id").(int)
        return c.JSON(200, map[string]interface{}{
            "user_id": userID,
            "message": "Hello!",
        })
    })

    e.Start(":8080")
}`,
            explanation: 'c.Set()/c.Get() — хранилище данных в рамках одного запроса. AuthMiddleware кладёт user_id, обработчик его читает. next(c) — вызов следующего в цепочке.'
        },
        {
            type: 'theory',
            content: `
                <h2>Порядок выполнения middleware</h2>
                <p>Middleware выполняются в порядке добавления "снаружи внутрь" для запроса, и в обратном порядке для ответа:</p>
                <pre><code>e.Use(A)  // первый
e.Use(B)  // второй
e.Use(C)  // третий

// Запрос: A → B → C → Handler
// Ответ:  Handler → C → B → A</code></pre>
                <p>Это похоже на луковицу — каждый слой оборачивает следующий.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Middleware для групп и конкретных роутов',
            code: `package main

import (
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
)

func AdminOnly(next echo.HandlerFunc) echo.HandlerFunc {
    return func(c echo.Context) error {
        // Проверяем роль из контекста (предполагаем что AuthMiddleware уже отработал)
        role, _ := c.Get("role").(string)
        if role != "admin" {
            return echo.ErrForbidden
        }
        return next(c)
    }
}

func main() {
    e := echo.New()
    e.Use(middleware.Recover())
    e.Use(middleware.Logger())

    // Публичное API — без аутентификации
    public := e.Group("/public")
    public.GET("/articles", func(c echo.Context) error {
        return c.JSON(200, []string{"article1", "article2"})
    })

    // API с аутентификацией
    api := e.Group("/api")
    api.Use(middleware.JWT([]byte("secret"))) // JWT middleware

    api.GET("/profile", func(c echo.Context) error {
        return c.JSON(200, map[string]string{"name": "Alice"})
    })

    // Admin панель — требует роль admin
    admin := api.Group("/admin")
    admin.Use(AdminOnly)

    admin.GET("/users", func(c echo.Context) error {
        return c.JSON(200, []string{"user1", "user2"})
    })
    admin.DELETE("/users/:id", func(c echo.Context) error {
        return c.JSON(200, map[string]string{"deleted": c.Param("id")})
    })

    // Middleware для одного роута
    e.GET("/special",
        func(c echo.Context) error {
            return c.String(200, "special endpoint")
        },
        middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(5)),
    )

    e.Start(":8080")
}`,
            explanation: 'Группы с middleware: public — открыто, api — JWT, api/admin — JWT + AdminOnly. Middleware применяются последовательно для группы. Отдельный middleware для роута — третий аргумент HandlerFunc.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Порядок middleware:</strong> Всегда ставьте Recover() первым — он перехватит паники в любом другом middleware. Logger() обычно идёт вторым. Auth middleware — перед бизнес-логикой.</p>`
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Как middleware передаёт управление следующему обработчику?',
                    options: [
                        'Вызывает next(c)',
                        'Возвращает nil',
                        'Вызывает c.Next()',
                        'Автоматически после return'
                    ],
                    correct: 0,
                    explanation: 'next(c) — явный вызов следующего обработчика в цепочке. Без него запрос не будет обработан. Код после next(c) выполняется после ответа.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Почему Recover() должен быть первым middleware?',
                    options: [
                        'Чтобы перехватывать паники в других middleware и обработчиках',
                        'Из-за требований Echo фреймворка',
                        'Для лучшей производительности',
                        'Recover работает одинаково в любой позиции'
                    ],
                    correct: 0,
                    explanation: 'Recover оборачивает всю цепочку. Если Logger стоит до Recover и Logger паникует — Recover не перехватит. Первый middleware — самый "внешний" и видит всё.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Как передать данные из middleware в обработчик?',
                    options: [
                        'c.Set("key", value) в middleware, c.Get("key") в обработчике',
                        'Через глобальную переменную',
                        'Через заголовок запроса',
                        'Через context.WithValue'
                    ],
                    correct: 0,
                    explanation: 'echo.Context — хранилище данных в рамках одного запроса. c.Set() кладёт, c.Get() берёт. Это потокобезопасно в контексте одного запроса.'
                }
            ]
        }
    ]
};
