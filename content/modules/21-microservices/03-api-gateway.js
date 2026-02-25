export default {
    id: '21-03',
    title: 'API Gateway паттерн',
    description: 'Единая точка входа, роутинг, rate limiting, auth на уровне gateway',
    estimatedTime: 25,
    xpReward: 22,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>API Gateway — входная точка микросервисов</h2>
                <p>API Gateway — сервис между клиентами и микросервисами. Решает "кросс-функциональные" задачи:</p>
                <ul>
                    <li>🔒 <strong>Аутентификация и авторизация</strong> — проверяем токены один раз, не в каждом сервисе</li>
                    <li>🚦 <strong>Rate limiting</strong> — ограничиваем запросы</li>
                    <li>📊 <strong>Логирование и метрики</strong> — трейсинг всех запросов</li>
                    <li>🔀 <strong>Роутинг</strong> — /api/users → user-service, /api/orders → order-service</li>
                    <li>⚡ <strong>Load balancing</strong> — между инстансами сервиса</li>
                    <li>🔄 <strong>Protocol translation</strong> — HTTP снаружи, gRPC внутри</li>
                </ul>
            `
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph LR
    Client[Client App] --> GW[API Gateway :8080]
    Mobile[Mobile App] --> GW

    GW --> |/api/users| US[User Service :8081]
    GW --> |/api/orders| OS[Order Service :8082]
    GW --> |/api/payments| PS[Payment Service :8083]

    US --> UDB[(Users DB)]
    OS --> ODB[(Orders DB)]
    PS --> PDB[(Payments DB)]

    GW --> Redis[(Redis Cache)]
    GW --> |metrics| Prom[Prometheus]

    style GW fill:#1e3a5f,color:#60a5fa
    style Redis fill:#2d1b69,color:#a78bfa`,
            caption: 'API Gateway — единая точка входа. Клиенты знают только gateway адрес, не знают о внутренних сервисах.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Простой API Gateway на Echo',
            code: `package main

import (
    "context"
    "io"
    "net/http"
    "net/http/httputil"
    "net/url"
    "strings"
    "time"

    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
    "github.com/redis/go-redis/v9"
)

type ServiceConfig struct {
    Name    string
    URL     string
    Prefix  string
}

var services = []ServiceConfig{
    {Name: "users",    URL: "http://user-service:8081",    Prefix: "/api/users"},
    {Name: "orders",   URL: "http://order-service:8082",   Prefix: "/api/orders"},
    {Name: "payments", URL: "http://payment-service:8083", Prefix: "/api/payments"},
}

func createProxy(target string) echo.HandlerFunc {
    targetURL, _ := url.Parse(target)
    proxy := httputil.NewSingleHostReverseProxy(targetURL)
    return func(c echo.Context) error {
        req := c.Request()
        req.URL.Host = targetURL.Host
        req.URL.Scheme = targetURL.Scheme
        req.Header.Set("X-Forwarded-Host", req.Host)
        req.Host = targetURL.Host
        proxy.ServeHTTP(c.Response(), req)
        return nil
    }
}

// JWT Auth middleware на уровне gateway
func GatewayAuth(next echo.HandlerFunc) echo.HandlerFunc {
    return func(c echo.Context) error {
        // Пропускаем публичные пути
        path := c.Request().URL.Path
        if path == "/health" || strings.HasPrefix(path, "/api/auth") {
            return next(c)
        }

        token := c.Request().Header.Get("Authorization")
        if token == "" {
            return c.JSON(http.StatusUnauthorized, map[string]string{
                "error": "unauthorized",
            })
        }

        // Проверяем токен (упрощённо)
        // В реальности: jwt.Parse(token, ...)
        userID := validateJWT(token)
        if userID == 0 {
            return c.JSON(http.StatusUnauthorized, map[string]string{
                "error": "invalid token",
            })
        }

        // Передаём user_id внутренним сервисам через заголовок
        c.Request().Header.Set("X-User-ID", fmt.Sprint(userID))
        return next(c)
    }
}

func validateJWT(token string) int64 {
    if token == "Bearer valid-token" {
        return 42
    }
    return 0
}

func main() {
    rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
    _ = rdb

    e := echo.New()
    e.Use(middleware.Recover())
    e.Use(middleware.RequestID())
    e.Use(middleware.Logger())
    e.Use(middleware.TimeoutWithConfig(middleware.TimeoutConfig{
        Timeout: 30 * time.Second,
    }))
    e.Use(GatewayAuth)
    e.Use(middleware.RateLimiter(
        middleware.NewRateLimiterMemoryStore(100),
    ))

    e.GET("/health", func(c echo.Context) error {
        return c.JSON(200, map[string]string{"status": "ok"})
    })

    // Регистрируем proxy для каждого сервиса
    for _, svc := range services {
        prefix := svc.Prefix
        target := svc.URL
        e.Any(prefix+"/*", createProxy(target))
        e.Any(prefix, createProxy(target))
    }

    e.Start(":8080")
}`,
            explanation: 'Gateway проверяет auth один раз и передаёт X-User-ID внутренним сервисам — они доверяют этому заголовку. httputil.NewSingleHostReverseProxy — стандартный proxy из stdlib.'
        },
        {
            type: 'theory',
            content: `
                <h2>Популярные API Gateway решения</h2>
                <p>Писать свой gateway с нуля — редко нужно. Есть готовые решения:</p>
                <ul>
                    <li><strong>Kong</strong> — мощный, много плагинов, Lua/Go плагины</li>
                    <li><strong>NGINX</strong> — простой проксинг, rate limiting, высокая нагрузка</li>
                    <li><strong>Traefik</strong> — автоматическая конфигурация через Docker labels</li>
                    <li><strong>AWS API Gateway / GCP Apigee</strong> — managed решения</li>
                    <li><strong>go-micro</strong> — Go-specific микросервисный фреймворк с gateway</li>
                </ul>
                <p>Собственный gateway оправдан если нужна специфическая бизнес-логика на уровне роутинга.</p>
            `
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'multiple',
                    question: 'Какие задачи решает API Gateway?',
                    options: [
                        'Аутентификация и авторизация',
                        'Роутинг запросов к сервисам',
                        'Хранение бизнес-данных',
                        'Rate limiting',
                        'Protocol translation (HTTP → gRPC)'
                    ],
                    correct: [0, 1, 3, 4],
                    explanation: 'Gateway: auth, routing, rate limiting, protocol translation, logging, load balancing. НЕ хранит бизнес-данные — это задача domain-сервисов.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Зачем gateway передаёт X-User-ID заголовок внутренним сервисам?',
                    options: [
                        'Чтобы сервисы знали кто делает запрос без повторной проверки токена',
                        'Для логирования',
                        'Для rate limiting',
                        'Для балансировки нагрузки'
                    ],
                    correct: 0,
                    explanation: 'Gateway проверяет JWT один раз, извлекает user_id и передаёт как заголовок. Внутренние сервисы доверяют этому заголовку (они в приватной сети). Не нужно проверять токен в каждом сервисе.'
                }
            ]
        }
    ]
};
