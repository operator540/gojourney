export default {
    id: '21-01',
    title: 'Монолит vs Микросервисы',
    description: 'Когда нужны микросервисы, плюсы/минусы, паттерны декомпозиции',
    estimatedTime: 25,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Монолит — не плохое слово</h2>
                <p>Начните с монолита. Серьёзно. <strong>Большинство успешных компаний начинали с монолита</strong> и мигрировали на микросервисы только когда монолит стал проблемой.</p>
                <p>Монолит:</p>
                <ul>
                    <li>✅ Простой деплой — один бинарник</li>
                    <li>✅ Нет сетевых задержек между компонентами</li>
                    <li>✅ Легче отлаживать и тестировать</li>
                    <li>✅ Транзакции работают "из коробки"</li>
                    <li>❌ Трудно масштабировать отдельные части</li>
                    <li>❌ Одна упавшая часть = весь сервис упал</li>
                    <li>❌ Большая команда — конфликты в коде</li>
                </ul>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Когда переходить на микросервисы?</h2>
                <p>Признаки что монолит стал проблемой:</p>
                <ul>
                    <li>Деплой занимает часы и страшно его делать</li>
                    <li>Разные части системы требуют разного масштабирования</li>
                    <li>10+ команд разработки мешают друг другу</li>
                    <li>Хотите разные технологии для разных частей</li>
                    <li>Требования к SLA: один модуль не должен ронять всё остальное</li>
                </ul>
                <p>Правило Мартина Фаулера: <em>"Не начинайте с микросервисов — начните с монолита, а потом разбейте его"</em></p>
            `
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph TB
    subgraph Монолит
        A[API Layer] --> B[Business Logic]
        B --> C[Data Layer]
        C --> DB[(Single DB)]
    end
    subgraph Микросервисы
        GW[API Gateway] --> US[User Service]
        GW --> OS[Order Service]
        GW --> PS[Payment Service]
        US --> UDB[(Users DB)]
        OS --> ODB[(Orders DB)]
        PS --> PDB[(Payments DB)]
        US <-.->|Events| MQ[Message Queue]
        OS <-.->|Events| MQ
        PS <-.->|Events| MQ
    end
    style GW fill:#1e3a5f,color:#60a5fa
    style MQ fill:#2d1b69,color:#a78bfa`,
            caption: 'Монолит: один деплой, одна БД. Микросервисы: отдельные сервисы с собственными БД, коммуникация через API или events.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Структура Go микросервиса',
            code: `// Типичная структура микросервиса на Go
//
// user-service/
// ├── cmd/
// │   └── server/
// │       └── main.go          // точка входа
// ├── internal/
// │   ├── domain/              // бизнес-сущности
// │   │   └── user.go
// │   ├── handler/             // HTTP/gRPC обработчики
// │   │   └── user_handler.go
// │   ├── service/             // бизнес-логика
// │   │   └── user_service.go
// │   ├── repository/          // работа с БД
// │   │   └── user_repo.go
// │   └── config/              // конфигурация
// │       └── config.go
// ├── pkg/                     // публичные пакеты
// │   └── events/              // события для других сервисов
// │       └── events.go
// ├── api/
// │   └── proto/               // gRPC схемы
// │       └── user.proto
// ├── migrations/              // SQL миграции
// ├── Dockerfile
// ├── docker-compose.yml
// └── Makefile

// internal/config/config.go
package config

import (
    "os"
    "strconv"
)

type Config struct {
    ServerPort  string
    DatabaseURL string
    RedisURL    string
    JWTSecret   string
    ServiceName string
    Environment string
}

func Load() Config {
    return Config{
        ServerPort:  getEnv("PORT", "8080"),
        DatabaseURL: mustGetEnv("DATABASE_URL"),
        RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379"),
        JWTSecret:   mustGetEnv("JWT_SECRET"),
        ServiceName: getEnv("SERVICE_NAME", "user-service"),
        Environment: getEnv("ENVIRONMENT", "development"),
    }
}

func getEnv(key, defaultVal string) string {
    if v := os.Getenv(key); v != "" {
        return v
    }
    return defaultVal
}

func mustGetEnv(key string) string {
    v := os.Getenv(key)
    if v == "" {
        panic("required env var not set: " + key)
    }
    return v
}

func getEnvInt(key string, defaultVal int) int {
    if v := os.Getenv(key); v != "" {
        if n, err := strconv.Atoi(v); err == nil {
            return n
        }
    }
    return defaultVal
}`,
            explanation: 'Конфигурация через переменные окружения — стандарт для микросервисов (12-factor app). mustGetEnv паникует при запуске если обязательная переменная не задана — лучше упасть сразу.'
        },
        {
            type: 'theory',
            content: `
                <h2>Коммуникация между сервисами</h2>
                <p>Два основных подхода:</p>
                <ul>
                    <li><strong>Синхронная</strong> — HTTP/gRPC. Запрос-ответ. Просто, но coupling.</li>
                    <li><strong>Асинхронная</strong> — Message Queue (Kafka, RabbitMQ, Redis Streams). События. Decoupled, но сложнее.</li>
                </ul>
                <h3>Когда что использовать:</h3>
                <ul>
                    <li>gRPC — быстрое, типизированное inter-service API. Внутренние сервисы.</li>
                    <li>HTTP REST — внешний API, простые запросы.</li>
                    <li>Events — уведомления о произошедших фактах ("order created"), параллельная обработка.</li>
                </ul>
            `
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Когда НЕ стоит начинать с микросервисов?',
                    options: [
                        'Когда проект только начинается и требования непонятны',
                        'Когда команда более 50 человек',
                        'Когда требуется высокая доступность',
                        'Когда используется Go'
                    ],
                    correct: 0,
                    explanation: 'Микросервисы решают проблемы масштаба: большие команды, независимый деплой, разные нагрузки. Новый проект с непонятными границами — начинайте с монолита, потом разбивайте.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Каждый микросервис должен иметь...',
                    options: [
                        'Свою собственную базу данных',
                        'Общую базу данных с другими сервисами',
                        'Один общий Redis для всех',
                        'Одну общую PostgreSQL для простоты'
                    ],
                    correct: 0,
                    explanation: 'Database per Service — ключевой принцип. Каждый сервис владеет своими данными. Это обеспечивает независимость: сервисы не могут напрямую читать данные друг друга.'
                }
            ]
        }
    ]
};
