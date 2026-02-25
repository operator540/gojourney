export default {
    id: '03-03',
    title: 'Управление зависимостями',
    description: 'go get, обновление, downgrade, replace, vendor, приватные модули',
    estimatedTime: 15,
    xpReward: 15,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Добавление и обновление зависимостей</h2>
                <p>Команда <code>go get</code> — основной инструмент для работы с зависимостями. Она может добавлять, обновлять и понижать версии.</p>
            `
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'go get: основные сценарии',
            code: `# Последняя версия
go get github.com/go-chi/chi/v5@latest

# Конкретная версия
go get github.com/go-chi/chi/v5@v5.0.12

# Конкретный коммит
go get github.com/go-chi/chi/v5@abc1234

# Обновить до последнего патча (v5.0.x)
go get github.com/go-chi/chi/v5@v5.0

# Обновить все прямые зависимости
go get -u ./...

# Только патч-обновления (безопасно)
go get -u=patch ./...

# Удалить зависимость
go get github.com/old/pkg@none`,
            explanation: '-u обновляет до последней minor/patch. -u=patch — только patch (самое безопасное). @none удаляет зависимость.'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: '<p><code>go get -u ./...</code> может обновить зависимости до несовместимых minor-версий. Для продакшена предпочитайте <code>-u=patch</code> или обновляйте конкретные пакеты.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Директива replace</h2>
                <p><code>replace</code> в go.mod позволяет подменить модуль — локальной папкой, форком или другой версией. Незаменимо для разработки.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Использование replace',
            code: `module github.com/user/myproject

go 1.22

require (
    github.com/user/mylib v1.2.3
)

// Подмена на локальную директорию (для разработки)
replace github.com/user/mylib => ../mylib

// Подмена на форк
// replace github.com/original/pkg => github.com/myfork/pkg v1.0.0

// Подмена версии
// replace github.com/broken/pkg v1.2.0 => github.com/broken/pkg v1.1.9`,
            explanation: 'replace удобен при одновременной разработке нескольких модулей. Не забудьте убрать replace перед коммитом!'
        },
        {
            type: 'theory',
            content: `
                <h2>Vendor-директория</h2>
                <p><code>go mod vendor</code> копирует все зависимости в папку <code>vendor/</code>. Это гарантирует сборку без сети.</p>
            `
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Vendoring',
            code: `# Создать vendor директорию
go mod vendor

# Сборка с использованием vendor
go build -mod=vendor ./...

# Структура vendor/
# vendor/
# ├── github.com/
# │   └── go-chi/
# │       └── chi/v5/
# ├── modules.txt
# └── ...`,
            explanation: 'vendor/ гарантирует воспроизводимость без доступа к сети. Полезно для CI/CD и air-gapped окружений.'
        },
        {
            type: 'theory',
            content: `
                <h2>Просмотр зависимостей</h2>
            `
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Анализ зависимостей',
            code: `# Список всех зависимостей (прямых и транзитивных)
go list -m all

# Доступные обновления
go list -m -u all

# Граф зависимостей
go mod graph

# Почему нужна конкретная зависимость
go mod why github.com/some/dependency

# Проверка целостности go.sum
go mod verify`,
            explanation: 'go list -m -u all покажет доступные обновления. go mod why объяснит, откуда пришла транзитивная зависимость.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p><strong>Рабочий процесс:</strong> 1) Добавьте import в код → 2) <code>go mod tidy</code> → 3) Проверьте <code>go.mod</code> → 4) Запустите тесты. Никогда не редактируйте go.sum вручную.</p>'
        },
        {
            type: 'editor',
            title: 'Практика: Управление зависимостями',
            instructions: 'Расположите команды в правильном порядке для типичного рабочего процесса: инициализация проекта, добавление кода с импортом, синхронизация зависимостей, запуск.',
            starterCode: `# Расположите в правильном порядке:

# A) go mod tidy
# B) go run main.go
# C) go mod init github.com/user/myapp
# D) Написать main.go с import "github.com/go-chi/chi/v5"

# Правильный порядок: ???

# Бонус: какая команда покажет, можно ли обновить зависимости?
# ???`,
            hints: [
                'Порядок: C → D → A → B',
                'Сначала init, потом код, потом tidy, потом run',
                'go list -m -u all покажет доступные обновления'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Как безопасно обновить только patch-версии зависимостей?',
                    options: [
                        'go get -u=patch ./...',
                        'go get -u ./...',
                        'go mod update --safe',
                        'go get @latest'
                    ],
                    correct: 0,
                    explanation: '-u=patch обновляет только patch-версии (баг-фиксы), что наиболее безопасно.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Для чего используется replace в go.mod?',
                    options: [
                        'Подмена модуля локальной папкой или форком',
                        'Замена стандартной библиотеки',
                        'Переименование пакета',
                        'Удаление зависимости'
                    ],
                    correct: 0,
                    explanation: 'replace позволяет подменить модуль — полезно для локальной разработки связанных модулей.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Как удалить зависимость через go get?',
                    options: [
                        'go get pkg@none',
                        'go get -remove pkg',
                        'go mod remove pkg',
                        'go delete pkg'
                    ],
                    correct: 0,
                    explanation: '@none — специальная версия, которая удаляет зависимость из go.mod.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Что делает go mod vendor?',
                    options: [
                        'Копирует зависимости в папку vendor/',
                        'Продаёт зависимости',
                        'Удаляет кэш зависимостей',
                        'Публикует модуль'
                    ],
                    correct: 0,
                    explanation: 'vendor/ содержит копию всех зависимостей, позволяя собирать проект без доступа к сети.'
                }
            ]
        }
    ]
};
