export default {
    id: '18-06',
    title: 'Рефакторинг проекта на Echo',
    description: 'Переносим REST API с net/http+chi на Echo: роутинг, middleware, группы',
    estimatedTime: 40,
    xpReward: 35,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Зачем мигрировать с chi на Echo?</h2>
                <p>Chi — отличный роутер, Echo — более полноценный фреймворк. Echo добавляет:</p>
                <ul>
                    <li>Встроенный Binding и Validation</li>
                    <li>Богатый набор готовых middleware</li>
                    <li>Удобный echo.Context с хелперами</li>
                    <li>Автоматическое восстановление от паник</li>
                    <li>Better error handling</li>
                </ul>
                <p>Мигрировать можно постепенно. Посмотрим как наш GoNetwork API выглядел бы на Echo.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Структура Echo-приложения',
            code: `// Структура проекта
// cmd/server/main.go
// internal/
//   handler/    — HTTP обработчики (echo.HandlerFunc)
//   service/    — бизнес-логика
//   repository/ — работа с БД
//   middleware/ — кастомные middleware
//   model/      — структуры данных

// cmd/server/main.go
package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "os/signal"
    "time"

    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
    "github.com/go-playground/validator/v10"
)

func main() {
    e := echo.New()
    e.HideBanner = true // убираем ASCII баннер

    // Validator
    e.Validator = &AppValidator{validator: validator.New()}

    // Глобальные middleware
    e.Use(middleware.Recover())
    e.Use(middleware.RequestID())
    e.Use(middleware.Logger())
    e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
        AllowOrigins: []string{"*"},
        AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE},
        AllowHeaders: []string{"Content-Type", "Authorization"},
    }))

    // Health check
    e.GET("/health", func(c echo.Context) error {
        return c.JSON(http.StatusOK, map[string]string{
            "status":  "ok",
            "version": "1.0.0",
        })
    })

    // API v1
    v1 := e.Group("/api/v1")
    registerRoutes(v1)

    // Graceful shutdown
    go func() {
        if err := e.Start(":8080"); err != nil && err != http.ErrServerClosed {
            log.Fatal("shutdown:", err)
        }
    }()

    quit := make(chan os.Signal, 1)
    signal.Notify(quit, os.Interrupt)
    <-quit

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    e.Shutdown(ctx)
    log.Println("Server gracefully stopped")
}

type AppValidator struct {
    validator *validator.Validate
}

func (av *AppValidator) Validate(i interface{}) error {
    if err := av.validator.Struct(i); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, err.Error())
    }
    return nil
}`,
            explanation: 'HideBanner убирает ASCII Gopher при старте. RequestID() генерирует X-Request-ID для трейсинга. Graceful shutdown — даём 10 секунд обработать текущие запросы перед остановкой.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Роутинг и обработчики',
            code: `// internal/handler/user_handler.go
package handler

import (
    "net/http"

    "github.com/labstack/echo/v4"
    "myapp/internal/service"
)

type UserHandler struct {
    svc *service.UserService
}

func NewUserHandler(svc *service.UserService) *UserHandler {
    return &UserHandler{svc: svc}
}

type CreateUserRequest struct {
    Username string \`json:"username" validate:"required,min=3,alphanum"\`
    Email    string \`json:"email"    validate:"required,email"\`
    Password string \`json:"password" validate:"required,min=8"\`
}

func (h *UserHandler) Create(c echo.Context) error {
    var req CreateUserRequest
    if err := c.Bind(&req); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, "invalid request")
    }
    if err := c.Validate(req); err != nil {
        return err
    }

    user, err := h.svc.CreateUser(c.Request().Context(), service.CreateUserInput{
        Username: req.Username,
        Email:    req.Email,
        Password: req.Password,
    })
    if err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
    }

    return c.JSON(http.StatusCreated, user)
}

func (h *UserHandler) GetByID(c echo.Context) error {
    id := c.Param("id")
    user, err := h.svc.GetUser(c.Request().Context(), id)
    if err != nil {
        return echo.NewHTTPError(http.StatusNotFound, "user not found")
    }
    return c.JSON(http.StatusOK, user)
}

func (h *UserHandler) List(c echo.Context) error {
    page := c.QueryParamDefault("page", "1")
    size := c.QueryParamDefault("size", "20")
    // ...
    return c.JSON(200, map[string]interface{}{
        "users": []string{"alice", "bob"},
        "page": page,
        "size": size,
    })
}

// routes.go
func registerRoutes(api *echo.Group) {
    // Инициализация зависимостей (упрощённо)
    userSvc := service.NewUserService(nil)
    userHandler := handler.NewUserHandler(userSvc)

    // Публичные роуты
    auth := api.Group("/auth")
    auth.POST("/register", userHandler.Create)
    auth.POST("/login", authHandler.Login)

    // Защищённые роуты (нужен JWT)
    users := api.Group("/users")
    users.Use(JWTMiddleware)
    users.GET("", userHandler.List)
    users.GET("/:id", userHandler.GetByID)
    users.PUT("/:id", userHandler.Update)
    users.DELETE("/:id", userHandler.Delete)

    // Роуты для текущего пользователя
    me := api.Group("/me")
    me.Use(JWTMiddleware)
    me.GET("", userHandler.GetMe)
    me.PUT("", userHandler.UpdateMe)
}`,
            explanation: 'Каждый handler — метод структуры (не функция), что позволяет внедрять зависимости. Разделение на группы: /auth (публично) и /users (JWT). Структура handler → service → repository сохраняется.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Error handling в Echo',
            code: `package main

import (
    "errors"
    "net/http"

    "github.com/labstack/echo/v4"
)

// Кастомные ошибки приложения
var (
    ErrNotFound   = errors.New("not found")
    ErrForbidden  = errors.New("forbidden")
    ErrDuplicate  = errors.New("already exists")
)

// Кастомный HTTPErrorHandler — единая точка обработки ошибок
func customErrorHandler(err error, c echo.Context) {
    var code int
    var message interface{}

    var he *echo.HTTPError
    if errors.As(err, &he) {
        code = he.Code
        message = he.Message
    } else {
        switch {
        case errors.Is(err, ErrNotFound):
            code = http.StatusNotFound
            message = "Resource not found"
        case errors.Is(err, ErrForbidden):
            code = http.StatusForbidden
            message = "Access denied"
        case errors.Is(err, ErrDuplicate):
            code = http.StatusConflict
            message = "Resource already exists"
        default:
            code = http.StatusInternalServerError
            message = "Internal server error"
            // Логируем детали в продакшне
            c.Logger().Error(err)
        }
    }

    // Унифицированный формат ошибок
    if !c.Response().Committed {
        c.JSON(code, map[string]interface{}{
            "error":      message,
            "request_id": c.Response().Header().Get(echo.HeaderXRequestID),
        })
    }
}

func main() {
    e := echo.New()
    e.HTTPErrorHandler = customErrorHandler

    e.GET("/users/:id", func(c echo.Context) error {
        id := c.Param("id")
        if id == "99" {
            return ErrNotFound // простой return — кастомный handler поймает
        }
        if id == "0" {
            return echo.NewHTTPError(http.StatusBadRequest, "invalid id")
        }
        return c.JSON(200, map[string]string{"id": id})
    })

    e.Start(":8080")
}`,
            explanation: 'customErrorHandler — единая точка обработки всех ошибок. errors.As проверяет тип ошибки. errors.Is проверяет конкретное значение. Это позволяет возвращать ошибки из любого слоя без HTTP-зависимости.'
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph LR
    REQ[HTTP Request] --> MW[Middleware Chain]
    MW --> R[Router]
    R --> H[Handler]
    H --> SVC[Service]
    SVC --> REPO[Repository]
    REPO --> DB[(PostgreSQL)]
    REPO --> CACHE[(Redis)]
    H --> ERR[Error Handler]
    ERR --> RESP[HTTP Response]
    style REQ fill:#1e3a5f,color:#60a5fa
    style H fill:#374151,color:#f9fafb
    style ERR fill:#3a1a1a,color:#f87171`,
            caption: 'Echo приложение: запрос проходит middleware → роутер → handler → service → repo. Ошибки централизованно обрабатываются через customErrorHandler.'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что делает e.HTTPErrorHandler в Echo?',
                    options: [
                        'Обрабатывает все ошибки в единой точке — форматирует ответ об ошибке',
                        'Логирует ошибки в файл',
                        'Автоматически повторяет запросы при ошибке',
                        'Отправляет ошибки на Sentry'
                    ],
                    correct: 0,
                    explanation: 'e.HTTPErrorHandler = customFunc — переопределяет стандартный обработчик ошибок. Все ошибки (из обработчиков и middleware) попадают сюда. Удобно для единого формата ответов об ошибках.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'e.Group("/api") создаёт...',
                    options: [
                        'Группу роутов с общим префиксом и возможностью добавить общие middleware',
                        'Отдельный HTTP сервер',
                        'Пространство имён для типов',
                        'Горутину для обработки запросов'
                    ],
                    correct: 0,
                    explanation: 'Group создаёт подгруппу роутов с общим prefix. api.GET("/users") = GET /api/users. К группе можно применить middleware: api.Use(JWTMiddleware).'
                }
            ]
        }
    ]
};
