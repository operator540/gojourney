export default {
    id: '14-07',
    title: 'Финальный проект: деплой',
    description: 'Docker Compose, Makefile, запуск GoNetwork в продакшн',
    estimatedTime: 25,
    xpReward: 30,

    sections: [
        {
            type: 'code-example',
            language: 'go',
            title: 'Dockerfile для Go приложения',
            code: `# Dockerfile
# Multi-stage build: уменьшает итоговый образ

# Stage 1: Builder
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Копируем зависимости отдельно (Docker cache)
COPY go.mod go.sum ./
RUN go mod download

# Копируем код
COPY . .

# Собираем статический бинарник
RUN CGO_ENABLED=0 GOOS=linux go build \\
    -ldflags="-s -w -X main.Version=$(git describe --tags --always)" \\
    -o /bin/server ./cmd/server

# Stage 2: Production image (минимальный)
FROM scratch
# или FROM alpine:3.19 если нужен shell для отладки

# Копируем только бинарник из builder
COPY --from=builder /bin/server /bin/server

# Сертификаты для HTTPS запросов
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Без root (безопасность)
USER 65534

EXPOSE 8080

ENTRYPOINT ["/bin/server"]`,
            explanation: 'Multi-stage build: builder использует golang:alpine (~400МБ), финальный образ from scratch (~10МБ). CGO_ENABLED=0 — статический бинарник без libc зависимостей. USER 65534 — nobody, не root.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'docker-compose.yml',
            code: `# docker-compose.yml
version: '3.9'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://gonetwork:secret@postgres:5432/gonetwork?sslmode=disable
      REDIS_URL: redis://redis:6379
      JWT_SECRET: \${JWT_SECRET:-change-me-in-production}
      PORT: "8080"
      ENVIRONMENT: production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: gonetwork
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: gonetwork
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"  # для локальной разработки
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gonetwork"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes  # включаем персистентность

  migrate:
    image: migrate/migrate
    volumes:
      - ./migrations:/migrations
    command: [
      "-path", "/migrations",
      "-database", "postgres://gonetwork:secret@postgres:5432/gonetwork?sslmode=disable",
      "up"
    ]
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
  redis_data:`,
            explanation: 'healthcheck + depends_on condition — app стартует только когда postgres готов принимать запросы. migrate сервис — отдельный контейнер для миграций. Персистентные volumes — данные выживают при рестарте.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Makefile',
            code: `# Makefile
.PHONY: build run test lint docker-up docker-down migrate

# Переменные
APP_NAME := gonetwork
BUILD_DIR := ./bin
MAIN_FILE := ./cmd/server/main.go
VERSION := $(shell git describe --tags --always 2>/dev/null || echo "dev")

## build: собрать бинарник
build:
	@echo "Building $(APP_NAME) $(VERSION)..."
	@go build -ldflags="-s -w -X main.Version=$(VERSION)" -o $(BUILD_DIR)/$(APP_NAME) $(MAIN_FILE)

## run: запустить локально
run:
	@go run $(MAIN_FILE)

## test: запустить тесты
test:
	@go test -v -race -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html

## test-integration: интеграционные тесты
test-integration:
	@go test -v -tags integration ./...

## lint: проверка кода
lint:
	@golangci-lint run ./...
	@go vet ./...

## fmt: форматирование
fmt:
	@gofmt -s -w .
	@goimports -w .

## docker-up: запустить все сервисы
docker-up:
	@docker compose up -d
	@echo "Waiting for services..."
	@sleep 3
	@make migrate

## docker-down: остановить сервисы
docker-down:
	@docker compose down

## migrate: применить миграции
migrate:
	@docker compose run --rm migrate

## migrate-down: откатить последнюю миграцию
migrate-down:
	@docker compose run --rm migrate down 1

## clean: удалить артефакты
clean:
	@rm -rf $(BUILD_DIR) coverage.out coverage.html

## help: показать эту справку
help:
	@grep -E '^## ' Makefile | sed 's/## //'`,
            explanation: 'make docker-up запускает всё включая миграции. make test запускает с -race — ловит race conditions. @echo без @ — команда не выводится в терминал.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'main.go — собираем всё вместе',
            code: `// cmd/server/main.go
package main

import (
    "context"
    "database/sql"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/go-playground/validator/v10"
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
    "github.com/redis/go-redis/v9"
    _ "github.com/lib/pq"

    "gonetwork/internal/config"
    "gonetwork/internal/handler"
    "gonetwork/internal/repository"
    "gonetwork/internal/service"
)

var Version = "dev" // задаётся через ldflags

func main() {
    cfg := config.Load()
    log.Printf("Starting GoNetwork %s (env=%s)", Version, cfg.Environment)

    // База данных
    db, err := sql.Open("postgres", cfg.DatabaseURL)
    if err != nil {
        log.Fatal("DB connect:", err)
    }
    defer db.Close()
    db.SetMaxOpenConns(25)
    db.SetMaxIdleConns(5)
    db.SetConnMaxLifetime(5 * time.Minute)

    if err := db.PingContext(context.Background()); err != nil {
        log.Fatal("DB ping:", err)
    }
    log.Println("PostgreSQL connected")

    // Redis
    rdb := redis.NewClient(&redis.Options{
        Addr: cfg.RedisURL,
    })
    if _, err := rdb.Ping(context.Background()).Result(); err != nil {
        log.Fatal("Redis connect:", err)
    }
    log.Println("Redis connected")

    // Wire: repo → service → handler
    userRepo := repository.NewUserRepository(db)
    postRepo := repository.NewPostRepository(db)
    feedRepo := repository.NewFeedRepository(db, rdb)

    userSvc := service.NewUserService(userRepo)
    postSvc := service.NewPostService(postRepo, feedRepo)

    authHandler  := handler.NewAuthHandler(userSvc, []byte(cfg.JWTSecret))
    postHandler  := handler.NewPostHandler(postSvc)

    // Echo
    e := echo.New()
    e.HideBanner = true
    e.Validator = &AppValidator{validator: validator.New()}
    e.HTTPErrorHandler = handler.ErrorHandler

    e.Use(middleware.Recover())
    e.Use(middleware.RequestID())
    e.Use(middleware.Logger())

    // Routes
    e.GET("/health", func(c echo.Context) error {
        return c.JSON(200, map[string]string{
            "status": "ok", "version": Version,
        })
    })

    auth := e.Group("/auth")
    auth.POST("/register", authHandler.Register)
    auth.POST("/login", authHandler.Login)

    api := e.Group("/api")
    api.Use(handler.JWTMiddleware(cfg.JWTSecret))
    api.POST("/posts", postHandler.Create)
    api.POST("/posts/:id/like", postHandler.Like)
    api.GET("/feed", postHandler.GetFeed)

    // Graceful shutdown
    go func() {
        if err := e.Start(":" + cfg.ServerPort); err != nil && err != http.ErrServerClosed {
            log.Fatal("server error:", err)
        }
    }()

    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    if err := e.Shutdown(ctx); err != nil {
        log.Fatal("Shutdown error:", err)
    }
    log.Println("Server stopped gracefully")
}

type AppValidator struct{ validator *validator.Validate }
func (v *AppValidator) Validate(i interface{}) error {
    return v.validator.Struct(i)
}`,
            explanation: 'Wire зависимостей: repo → service → handler. db.SetMaxOpenConns(25) — connection pool. SIGTERM — docker stop. SIGINT — Ctrl+C. Graceful shutdown: 10 секунд на завершение текущих запросов.'
        },
        {
            type: 'theory',
            content: `
                <h2>🎉 GoNetwork готов!</h2>
                <p>Вы создали полноценное Go приложение. Что дальше можно добавить:</p>
                <ul>
                    <li>Тесты (unit + integration) — модуль 6</li>
                    <li>Swagger документация</li>
                    <li>Prometheus метрики + Grafana дашборд</li>
                    <li>Загрузка аватаров (S3)</li>
                    <li>WebSocket для real-time уведомлений</li>
                    <li>gRPC между сервисами</li>
                </ul>
                <p>Проект можно разместить на GitHub и показать на собеседовании — это готовый портфолио проект!</p>
            `
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Зачем в Dockerfile используется multi-stage build?',
                    options: [
                        'Финальный образ содержит только бинарник, без компилятора Go (~10МБ вместо ~400МБ)',
                        'Для параллельной сборки',
                        'Для Windows совместимости',
                        'Без него Docker не работает'
                    ],
                    correct: 0,
                    explanation: 'Multi-stage: Stage 1 (builder) — golang:alpine с компилятором. Stage 2 (scratch) — только скомпилированный бинарник. Итог: ~10МБ vs ~400МБ. Меньше поверхность атаки, быстрее pull.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что делает db.SetMaxOpenConns(25)?',
                    options: [
                        'Ограничивает пул соединений с БД до 25 одновременных',
                        'Устанавливает таймаут 25 секунд',
                        'Создаёт 25 параллельных горутин',
                        'Это не Go стандарт'
                    ],
                    correct: 0,
                    explanation: 'Connection pool: Go держит открытые соединения с БД. SetMaxOpenConns(25) — не более 25 одновременных. PostgreSQL рекомендует (2 × CPU cores). Без ограничения — возможен database overload.'
                }
            ]
        }
    ]
};
