export default {
    id: '12-07',
    title: 'Чистая архитектура',
    description: 'Слоистая архитектура: domain, usecase, repository, delivery. Правило зависимостей — внутренние слои не знают о внешних.',
    estimatedTime: 25,
    xpReward: 25,
    sections: [
        {
            type: 'theory',
            content: `
<h2>Чистая архитектура в Go</h2>
<p>Чистая архитектура (Clean Architecture, Роберт Мартин) разделяет код на концентрические слои. Главное правило: <strong>зависимости направлены только внутрь</strong>.</p>
<h3>Слои (снаружи внутрь):</h3>
<ul>
    <li><strong>Delivery</strong> — HTTP handlers, gRPC, CLI. Знает об HTTP, но не о БД</li>
    <li><strong>Repository</strong> — работа с БД, кешем, файлами. Знает о PostgreSQL, не о HTTP</li>
    <li><strong>Usecase</strong> — бизнес-логика. Не знает ни о HTTP, ни о PostgreSQL</li>
    <li><strong>Domain</strong> — сущности (Entity). Чистые Go-структуры без зависимостей</li>
</ul>
`
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph TD
    subgraph "Delivery (HTTP/gRPC)"
        H[Handler]
    end
    subgraph "Usecase (бизнес-логика)"
        U[UserUsecase]
    end
    subgraph "Repository (хранилище)"
        R[UserRepository]
    end
    subgraph "Domain (сущности)"
        D[User Entity]
        I1[UserUsecase Interface]
        I2[UserRepo Interface]
    end

    H -->|вызывает| I1
    U -->|реализует| I1
    U -->|вызывает| I2
    R -->|реализует| I2
    U -->|использует| D
    R -->|использует| D
    H -->|использует| D`,
            caption: 'Стрелки направлены внутрь. Domain ни от чего не зависит. Delivery знает только об интерфейсах Usecase.'
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Структура папок Go-проекта',
            code: `myapp/
├── cmd/
│   └── server/
│       └── main.go          # точка входа
├── internal/
│   ├── domain/
│   │   └── user.go          # Entity + интерфейсы
│   ├── usecase/
│   │   └── user_usecase.go  # бизнес-логика
│   ├── repository/
│   │   └── postgres/
│   │       └── user_repo.go # PostgreSQL реализация
│   └── delivery/
│       └── http/
│           ├── handler.go   # HTTP handlers
│           └── router.go    # маршруты
├── pkg/
│   ├── jwt/                 # переиспользуемые пакеты
│   └── validator/
├── migrations/              # SQL миграции
├── docker-compose.yml
└── go.mod`,
            explanation: 'internal/ — код приватный для проекта (Go не даст импортировать снаружи). domain/ — ядро без зависимостей. cmd/ — точки входа приложения.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Domain слой: сущности и интерфейсы',
            code: `// internal/domain/user.go
package domain

import (
    "context"
    "time"
)

// User — чистая сущность, никаких db-тегов, никакого HTTP
type User struct {
    ID        int
    Name      string
    Email     string
    CreatedAt time.Time
}

// Интерфейсы определяются в domain — центре архитектуры

// UserRepository — контракт для слоя хранилища
type UserRepository interface {
    FindByID(ctx context.Context, id int) (*User, error)
    FindByEmail(ctx context.Context, email string) (*User, error)
    Save(ctx context.Context, u *User) error
    Update(ctx context.Context, u *User) error
    Delete(ctx context.Context, id int) error
}

// UserUsecase — контракт для бизнес-логики
type UserUsecase interface {
    GetUser(ctx context.Context, id int) (*User, error)
    Register(ctx context.Context, name, email, password string) (*User, error)
    UpdateProfile(ctx context.Context, id int, name string) (*User, error)
}`,
            explanation: 'Domain знает только о своих сущностях. Никакого sql, http, gin — ничего. Это ядро приложения, которое живёт вечно независимо от технологий.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Usecase слой: бизнес-логика',
            code: `// internal/usecase/user_usecase.go
package usecase

import (
    "context"
    "fmt"
    "myapp/internal/domain"
)

type userUsecase struct {
    userRepo domain.UserRepository // зависим от интерфейса!
}

// NewUserUsecase — конструктор с DI
func NewUserUsecase(repo domain.UserRepository) domain.UserUsecase {
    return &userUsecase{userRepo: repo}
}

func (u *userUsecase) GetUser(ctx context.Context, id int) (*domain.User, error) {
    user, err := u.userRepo.FindByID(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("usecase.GetUser: %w", err)
    }
    return user, nil
}

func (u *userUsecase) Register(ctx context.Context, name, email, password string) (*domain.User, error) {
    // Проверяем, не занят ли email
    existing, _ := u.userRepo.FindByEmail(ctx, email)
    if existing != nil {
        return nil, fmt.Errorf("email %s already taken", email)
    }

    user := &domain.User{
        Name:  name,
        Email: email,
        // пароль хешируем здесь, бизнес-логика
    }

    if err := u.userRepo.Save(ctx, user); err != nil {
        return nil, fmt.Errorf("usecase.Register: %w", err)
    }
    return user, nil
}

func (u *userUsecase) UpdateProfile(ctx context.Context, id int, name string) (*domain.User, error) {
    user, err := u.userRepo.FindByID(ctx, id)
    if err != nil {
        return nil, err
    }
    user.Name = name
    if err := u.userRepo.Update(ctx, user); err != nil {
        return nil, err
    }
    return user, nil
}`,
            explanation: 'Usecase знает о domain.User и domain.UserRepository (интерфейс). Не знает о PostgreSQL, не знает о HTTP. Можно тестировать с мок-репозиторием.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Delivery слой: HTTP handler',
            code: `// internal/delivery/http/handler.go
package http

import (
    "encoding/json"
    "net/http"
    "strconv"
    "myapp/internal/domain"
)

type UserHandler struct {
    usecase domain.UserUsecase // зависим от интерфейса!
}

func NewUserHandler(uc domain.UserUsecase) *UserHandler {
    return &UserHandler{usecase: uc}
}

func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
    // Парсим ID из URL
    idStr := r.PathValue("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        http.Error(w, "invalid id", http.StatusBadRequest)
        return
    }

    user, err := h.usecase.GetUser(r.Context(), id)
    if err != nil {
        http.Error(w, err.Error(), http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}

// main.go — сборка всего вместе
// repo := postgres.NewUserRepository(db)
// uc   := usecase.NewUserUsecase(repo)
// h    := httpDelivery.NewUserHandler(uc)`,
            explanation: 'Handler знает о HTTP (Request, ResponseWriter) и об интерфейсе domain.UserUsecase. Не знает о PostgreSQL. Слои изолированы — можно менять PostgreSQL на MongoDB без изменения handler.'
        },
        {
            type: 'info-box',
            variant: 'important',
            content: '<p><strong>Правило зависимостей:</strong> ни одна строчка кода во внутреннем слое не должна ссылаться на что-либо из внешнего слоя. domain не знает об usecase, usecase не знает о delivery и repository.</p>'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q12-07-1',
                    type: 'single',
                    question: 'Какой слой является ядром чистой архитектуры?',
                    options: [
                        'Delivery (HTTP handlers)',
                        'Repository (БД)',
                        'Domain (сущности и интерфейсы)',
                        'Usecase (бизнес-логика)'
                    ],
                    correct: 2,
                    explanation: 'Domain — самый внутренний слой. Содержит сущности и контракты (интерфейсы). Не зависит ни от чего. Это ядро приложения.'
                },
                {
                    id: 'q12-07-2',
                    type: 'single',
                    question: 'Может ли слой Usecase напрямую импортировать пакет database/sql?',
                    options: [
                        'Да, для эффективности',
                        'Нет, Usecase работает только с интерфейсами из Domain',
                        'Да, если используется ORM',
                        'Только если в тестовом режиме'
                    ],
                    correct: 1,
                    explanation: 'Usecase не знает о деталях хранилища. Он работает с domain.UserRepository (интерфейс). Это позволяет подменять PostgreSQL на Redis или мок без изменения бизнес-логики.'
                },
                {
                    id: 'q12-07-3',
                    type: 'multiple',
                    question: 'Зачем использовать папку internal/ в Go-проекте?',
                    options: [
                        'Код в internal/ нельзя импортировать из других модулей',
                        'Это улучшает производительность',
                        'Защищает внутренние пакеты от использования снаружи проекта',
                        'Это соглашение команды Go для приватного кода',
                        'Автоматически создаёт документацию'
                    ],
                    correct: [0, 2, 3],
                    explanation: 'internal/ — специальная директория Go: пакеты внутри неё нельзя импортировать из-за пределов модуля. Это защита внутренних деталей реализации.'
                },
                {
                    id: 'q12-07-4',
                    type: 'single',
                    question: 'Если нужно сменить PostgreSQL на MongoDB, какой слой нужно изменить?',
                    options: [
                        'Domain',
                        'Usecase',
                        'Repository',
                        'Delivery и Repository'
                    ],
                    correct: 2,
                    explanation: 'Только Repository — создаём новую реализацию MongoUserRepository, реализующую domain.UserRepository. Domain, Usecase и Delivery не трогаем.'
                }
            ]
        }
    ]
};
