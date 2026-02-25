export default {
    id: '03-04',
    title: 'Структура Go-проекта',
    description: 'Стандартная структура проекта, internal, cmd, pkg, конвенции сообщества',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Как организовать Go-проект?</h2>
                <p>Go не навязывает строгую структуру, но сообщество выработало чёткие конвенции. Структура зависит от размера проекта.</p>
            `
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Маленький проект (1 бинарник)',
            code: `myapp/
├── go.mod
├── go.sum
├── main.go          # точка входа
├── handler.go       # HTTP-обработчики
├── service.go       # бизнес-логика
├── repository.go    # работа с БД
├── model.go         # структуры данных
└── main_test.go     # тесты`,
            explanation: 'Для небольших проектов все файлы в корне — это нормально. Не создавайте пакеты ради пакетов.'
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Средний/большой проект',
            code: `myapi/
├── cmd/                    # точки входа (бинарники)
│   ├── server/
│   │   └── main.go         # go run ./cmd/server
│   └── migrate/
│       └── main.go         # go run ./cmd/migrate
├── internal/               # приватные пакеты (не импортируются извне)
│   ├── handler/
│   │   ├── user.go
│   │   └── auth.go
│   ├── service/
│   │   └── user.go
│   ├── repository/
│   │   └── user.go
│   └── model/
│       └── user.go
├── pkg/                    # публичные пакеты (можно импортировать)
│   └── validator/
│       └── validator.go
├── migrations/             # SQL-миграции
├── config/                 # конфигурация
│   └── config.go
├── go.mod
├── go.sum
├── Makefile
└── README.md`,
            explanation: 'cmd/ для бинарников, internal/ для приватного кода, pkg/ для публичных утилит. Это де-факто стандарт.'
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph TD
    ROOT["myapi/"] --> CMD["cmd/<br>точки входа"]
    ROOT --> INT["internal/<br>приватный код"]
    ROOT --> PKG["pkg/<br>публичные утилиты"]
    ROOT --> CFG["config/<br>конфигурация"]
    INT --> H["handler/"]
    INT --> S["service/"]
    INT --> R["repository/"]
    INT --> M["model/"]
    CMD --> SRV["server/main.go"]
    CMD --> MIG["migrate/main.go"]
    style ROOT fill:#00add8,color:#fff
    style INT fill:#ce3263,color:#fff
    style CMD fill:#10b981,color:#fff
    style PKG fill:#d97706,color:#fff`,
            caption: 'Типичная структура Go-проекта'
        },
        {
            type: 'theory',
            content: `
                <h2>Директория internal/</h2>
                <p><code>internal/</code> — <strong>магическая директория</strong> в Go. Пакеты внутри неё доступны только коду того же модуля. Компилятор Go <strong>запрещает</strong> импорт internal-пакетов из других модулей.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'internal: принудительная приватность',
            code: `// myapi/internal/service/user.go
package service

type UserService struct {
    // ...
}

func (s *UserService) Create(name string) error {
    // бизнес-логика
    return nil
}

// ✅ Внутри модуля — всё работает:
// myapi/cmd/server/main.go
// import "myapi/internal/service"

// ❌ Из другого модуля — ошибка компиляции:
// otherapp/main.go
// import "myapi/internal/service" // ОШИБКА!`,
            explanation: 'internal/ защищает внутренности проекта от внешнего использования. Используйте для кода, который не является публичным API.'
        },
        {
            type: 'theory',
            content: `
                <h2>cmd/ — множественные бинарники</h2>
                <p>Директория <code>cmd/</code> содержит отдельные точки входа (<code>func main()</code>) для разных исполняемых файлов проекта.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Пример cmd/server/main.go',
            code: `// cmd/server/main.go
package main

import (
    "fmt"
    "log"
    "net/http"

    "myapi/config"
    "myapi/internal/handler"
)

func main() {
    cfg := config.Load()

    h := handler.New(cfg)
    router := h.SetupRoutes()

    addr := fmt.Sprintf(":%d", cfg.Port)
    log.Printf("Server starting on %s", addr)
    log.Fatal(http.ListenAndServe(addr, router))
}

// Запуск: go run ./cmd/server
// Сборка: go build -o bin/server ./cmd/server`,
            explanation: 'Каждый cmd/ подпакет — отдельный бинарник. main.go минимален: загрузка конфига, создание зависимостей, запуск.'
        },
        {
            type: 'theory',
            content: `
                <h2>Антипаттерны структуры</h2>
            `
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Чего избегать',
            code: `# ❌ Антипаттерн: пакеты utils, helpers, common, misc
pkg/utils/        # Что здесь? Никто не знает
pkg/helpers/      # Мусорный ящик для всего
pkg/common/       # Станет огромным и неуправляемым

# ✅ Правильно: конкретные имена по назначению
pkg/validator/    # Валидация данных
pkg/httputil/     # HTTP-утилиты
pkg/crypto/       # Криптографические функции

# ❌ Антипаттерн: слишком глубокая вложенность
internal/api/v1/handlers/users/create.go  # 5 уровней!

# ✅ Правильно: плоская структура
internal/handler/user.go  # 2 уровня

# ❌ Антипаттерн: один тип = один файл (Java-стиль)
# ✅ Правильно: группируйте связанные типы в один файл`,
            explanation: 'Go предпочитает плоские структуры. Пакеты должны быть по назначению (validator, handler), а не по типу (models, utils).'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p><strong>Совет от Go-сообщества:</strong> начинайте с плоской структуры (всё в main). Выделяйте пакеты когда появляется реальная необходимость. «A little copying is better than a little dependency.»</p>'
        },
        {
            type: 'editor',
            title: 'Практика: Структура проекта',
            instructions: 'Распределите файлы по правильным директориям для REST API-проекта с двумя бинарниками (server и worker), обработчиками, сервисами, моделями и миграциями.',
            starterCode: `# Распределите файлы по структуре:
# Файлы:
# - main.go для HTTP-сервера
# - main.go для фонового воркера
# - user_handler.go (HTTP-обработчики)
# - user_service.go (бизнес-логика)
# - user.go (модель данных)
# - 001_create_users.sql (миграция)
# - validator.go (публичная утилита валидации)

# Заполните структуру:
# myapi/
# ├── cmd/
# │   ├── ???/main.go
# │   └── ???/main.go
# ├── internal/
# │   ├── ???/
# │   ├── ???/
# │   └── ???/
# ├── pkg/
# │   └── ???/
# └── migrations/
#     └── ???`,
            hints: [
                'cmd/server/main.go и cmd/worker/main.go',
                'internal/handler/user_handler.go',
                'internal/service/user_service.go',
                'internal/model/user.go',
                'pkg/validator/validator.go'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что особенного в директории internal/?',
                    options: [
                        'Компилятор Go запрещает импорт из других модулей',
                        'Файлы в ней не компилируются',
                        'Она автоматически создаётся go mod init',
                        'Она скрыта в git'
                    ],
                    correct: 0,
                    explanation: 'internal/ — специальная директория Go. Пакеты внутри неё доступны только коду того же модуля.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Для чего нужна директория cmd/?',
                    options: [
                        'Для точек входа (main.go) разных бинарников',
                        'Для CLI-команд',
                        'Для конфигурации',
                        'Для bash-скриптов'
                    ],
                    correct: 0,
                    explanation: 'cmd/ содержит main.go для каждого исполняемого файла: cmd/server/, cmd/worker/, cmd/migrate/ и т.д.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Какое имя пакета — антипаттерн?',
                    options: [
                        'utils',
                        'handler',
                        'service',
                        'validator'
                    ],
                    correct: 0,
                    explanation: 'utils, helpers, common — антипаттерны. Они не отражают назначение и превращаются в мусорные ящики.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'С какой структуры лучше начинать новый проект?',
                    options: [
                        'Плоская (всё в main package)',
                        'Сразу cmd/internal/pkg',
                        'Микросервисная',
                        'Скопировать шаблон из GitHub'
                    ],
                    correct: 0,
                    explanation: 'Начинайте просто. Выделяйте пакеты когда код разрастается. Преждевременная структуризация — враг продуктивности.'
                }
            ]
        }
    ]
};
