export default {
    id: '14-04',
    title: 'Финальный проект: обзор',
    description: 'Архитектура итогового проекта — REST API социальной сети с Go',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Финальный проект: GoNetwork</h2>
                <p>Мы создадим <strong>REST API для социальной сети</strong> — реальный проект, который можно показать на собеседовании. Проект охватывает все изученные темы.</p>
                <h3>Функциональность:</h3>
                <ul>
                    <li>👤 Регистрация и аутентификация (JWT)</li>
                    <li>📝 Посты: создание, редактирование, удаление, лента</li>
                    <li>❤️ Лайки и комментарии</li>
                    <li>👥 Подписки на пользователей</li>
                    <li>📊 Счётчики в Redis</li>
                </ul>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Технологический стек</h2>
                <ul>
                    <li>🐹 <strong>Go 1.21+</strong></li>
                    <li>🌐 <strong>Echo v4</strong> — HTTP фреймворк</li>
                    <li>🐘 <strong>PostgreSQL 16</strong> — основная БД</li>
                    <li>⚡ <strong>Redis 7</strong> — кэш и счётчики</li>
                    <li>🐳 <strong>Docker Compose</strong> — запуск зависимостей</li>
                    <li>🔐 <strong>JWT</strong> — аутентификация</li>
                    <li>✅ <strong>go-playground/validator</strong> — валидация</li>
                    <li>📦 <strong>golang-migrate</strong> — миграции БД</li>
                </ul>
            `
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph TB
    Client --> Echo[Echo HTTP Server]
    Echo --> Auth[Auth Middleware JWT]
    Auth --> UH[User Handler]
    Auth --> PH[Post Handler]
    Auth --> FH[Feed Handler]
    UH --> US[User Service]
    PH --> PS[Post Service]
    FH --> FS[Feed Service]
    US --> UR[User Repository]
    PS --> PR[Post Repository]
    FS --> FR[Feed Repository]
    UR --> PG[(PostgreSQL)]
    PR --> PG
    FR --> PG
    PS --> RC[Redis Cache]
    FS --> RC
    style Echo fill:#1e3a5f,color:#60a5fa
    style PG fill:#374151,color:#f9fafb
    style RC fill:#2d1b69,color:#a78bfa`,
            caption: 'Архитектура GoNetwork: 4 слоя (Handler → Service → Repository → DB). Redis для кэша и счётчиков.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Структура проекта',
            code: `// gonetwork/
// ├── cmd/
// │   └── server/
// │       └── main.go
// ├── internal/
// │   ├── config/
// │   │   └── config.go
// │   ├── domain/
// │   │   ├── user.go
// │   │   ├── post.go
// │   │   └── errors.go
// │   ├── handler/
// │   │   ├── user.go
// │   │   ├── post.go
// │   │   └── feed.go
// │   ├── service/
// │   │   ├── user.go
// │   │   ├── post.go
// │   │   └── feed.go
// │   ├── repository/
// │   │   ├── user.go
// │   │   ├── post.go
// │   │   └── postgres.go
// │   └── middleware/
// │       └── auth.go
// ├── migrations/
// │   ├── 001_create_users.up.sql
// │   ├── 001_create_users.down.sql
// │   └── ...
// ├── docker-compose.yml
// ├── Makefile
// └── go.mod

// internal/domain/user.go
package domain

import (
    "time"
    "errors"
)

type User struct {
    ID           int64     \`json:"id"\`
    Username     string    \`json:"username"\`
    Email        string    \`json:"email,omitempty"\`
    PasswordHash string    \`json:"-"\` // не в JSON
    Bio          string    \`json:"bio"\`
    CreatedAt    time.Time \`json:"created_at"\`
    UpdatedAt    time.Time \`json:"updated_at"\`
}

type Post struct {
    ID        int64     \`json:"id"\`
    AuthorID  int64     \`json:"author_id"\`
    Author    *User     \`json:"author,omitempty"\`
    Content   string    \`json:"content"\`
    LikesCount int      \`json:"likes_count"\`
    CreatedAt time.Time \`json:"created_at"\`
}

// Доменные ошибки — не зависят от HTTP
var (
    ErrNotFound      = errors.New("not found")
    ErrAlreadyExists = errors.New("already exists")
    ErrUnauthorized  = errors.New("unauthorized")
    ErrForbidden     = errors.New("forbidden")
)`,
            explanation: 'domain/ — сущности независимые от транспорта и БД. Доменные ошибки без HTTP-кодов — HTTP-слой сам маппит их на статус-коды. PasswordHash json:"-" — никогда не попадёт в ответ.'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Почему доменные ошибки (ErrNotFound) не содержат HTTP статус-кода?',
                    options: [
                        'Domain-слой не должен знать о HTTP — это разные уровни абстракции',
                        'Для совместимости с gRPC',
                        'HTTP коды медленнее',
                        'Go не поддерживает числа в ошибках'
                    ],
                    correct: 0,
                    explanation: 'Domain-слой содержит бизнес-логику. HTTP — деталь реализации. Сегодня это REST API, завтра gRPC — доменные ошибки не меняются. Handler-слой маппит ErrNotFound → 404.'
                }
            ]
        }
    ]
};
