export default {
    id: '03-02',
    title: 'Go Modules (go.mod)',
    description: 'Система модулей Go, go.mod, go.sum, версионирование, инициализация проекта',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Что такое Go Modules?</h2>
                <p><strong>Go Modules</strong> — система управления зависимостями Go (с Go 1.11, стандарт с 1.16). Модуль — это коллекция пакетов с файлом <code>go.mod</code> в корне.</p>
                <p>Go Modules решают три задачи:</p>
                <ul>
                    <li><strong>Версионирование</strong> — точные версии зависимостей</li>
                    <li><strong>Воспроизводимость</strong> — go.sum гарантирует целостность</li>
                    <li><strong>Изоляция</strong> — каждый проект имеет свои зависимости</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Создание нового модуля',
            code: `# Инициализация модуля
mkdir myproject && cd myproject
go mod init github.com/user/myproject

# Это создаёт go.mod:
cat go.mod
# module github.com/user/myproject
#
# go 1.22`,
            explanation: 'go mod init создаёт go.mod с именем модуля и версией Go. Имя модуля — обычно путь репозитория.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Файл go.mod',
            code: `module github.com/user/myproject

go 1.22

require (
    github.com/go-chi/chi/v5 v5.0.12
    github.com/jackc/pgx/v5 v5.5.5
    golang.org/x/crypto v0.21.0
)

require (
    // indirect — зависимости зависимостей
    github.com/jackc/pgpassfile v1.0.0 // indirect
    github.com/jackc/pgservicefile v0.0.0-20231201235250 // indirect
)`,
            explanation: 'Прямые зависимости — в первом блоке require. Транзитивные (indirect) — во втором. Go управляет ими автоматически.'
        },
        {
            type: 'theory',
            content: `
                <h2>Основные команды</h2>
            `
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Команды go mod',
            code: `# Добавить зависимость
go get github.com/go-chi/chi/v5@latest

# Конкретная версия
go get github.com/go-chi/chi/v5@v5.0.12

# Обновить все зависимости
go get -u ./...

# Удалить неиспользуемые зависимости
go mod tidy

# Скачать зависимости в кэш
go mod download

# Показать дерево зависимостей
go mod graph

# Скопировать зависимости в папку vendor
go mod vendor`,
            explanation: 'go mod tidy — самая часто используемая команда. Она добавляет недостающие и удаляет ненужные зависимости.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p>Запускайте <code>go mod tidy</code> после каждого добавления/удаления импортов. Это гарантирует, что go.mod и go.sum актуальны.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Семантическое версионирование (SemVer)</h2>
                <p>Go использует <strong>SemVer</strong>: <code>vMAJOR.MINOR.PATCH</code></p>
                <ul>
                    <li><strong>MAJOR</strong> — несовместимые изменения API (v1 → v2)</li>
                    <li><strong>MINOR</strong> — новая функциональность (обратно совместимая)</li>
                    <li><strong>PATCH</strong> — исправления багов</li>
                </ul>
            `
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph LR
    A["v1.2.3"] --> B["v1 = MAJOR<br>несовместимые изменения"]
    A --> C["2 = MINOR<br>новые фичи"]
    A --> D["3 = PATCH<br>баг-фиксы"]
    style A fill:#00add8,color:#fff
    style B fill:#ce3263,color:#fff
    style C fill:#d97706,color:#fff
    style D fill:#10b981,color:#fff`,
            caption: 'Семантическое версионирование v1.2.3'
        },
        {
            type: 'theory',
            content: `
                <h2>Файл go.sum</h2>
                <p><code>go.sum</code> хранит <strong>хеши</strong> всех зависимостей. Это гарантирует, что скачанный код не был подменён.</p>
                <ul>
                    <li>Генерируется автоматически</li>
                    <li><strong>Коммитьте</strong> его в git вместе с go.mod</li>
                    <li>Не редактируйте вручную</li>
                </ul>
            `
        },
        {
            type: 'info-box',
            variant: 'important',
            content: '<p>Всегда коммитьте <strong>оба файла</strong>: <code>go.mod</code> и <code>go.sum</code>. go.mod описывает зависимости, go.sum гарантирует их целостность.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Major version в пути импорта</h2>
                <p>В Go major version ≥ 2 включается в путь импорта. Это позволяет использовать разные major-версии одновременно.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Major version suffix',
            code: `import (
    "github.com/go-chi/chi/v5" // major version 5

    // Теоретически можно использовать обе версии:
    // chiv4 "github.com/go-chi/chi/v4"
    // chiv5 "github.com/go-chi/chi/v5"
)

// В go.mod модуля с major v2+:
// module github.com/mylib/v2`,
            explanation: 'Major version suffix (/v5) — уникальная особенность Go. Она позволяет разным major-версиям сосуществовать без конфликтов.'
        },
        {
            type: 'editor',
            title: 'Практика: Инициализация модуля',
            instructions: 'Напишите последовательность команд для: 1) создания нового Go-проекта, 2) инициализации модуля, 3) создания main.go, 4) добавления зависимости chi, 5) запуска go mod tidy.',
            starterCode: `# Напишите команды для создания Go-проекта:

# 1. Создание директории и переход в неё
mkdir myapi && cd myapi

# 2. Инициализация модуля
# Ваша команда здесь

# 3. Создание main.go (используем echo для простоты)
# cat > main.go << 'EOF'
# package main
# import "github.com/go-chi/chi/v5"
# func main() {
#     r := chi.NewRouter()
#     _ = r
# }
# EOF

# 4. Добавление зависимости
# Ваша команда здесь

# 5. Очистка зависимостей
# Ваша команда здесь`,
            hints: [
                'go mod init github.com/user/myapi',
                'go get github.com/go-chi/chi/v5',
                'go mod tidy',
                'Порядок: init → создать код → get → tidy'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Какой файл создаёт go mod init?',
                    options: [
                        'go.mod',
                        'go.sum',
                        'package.json',
                        'Makefile'
                    ],
                    correct: 0,
                    explanation: 'go mod init создаёт go.mod — главный файл модуля с именем и версией Go.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что делает go mod tidy?',
                    options: [
                        'Добавляет недостающие и удаляет неиспользуемые зависимости',
                        'Обновляет все зависимости до последней версии',
                        'Удаляет go.sum',
                        'Форматирует go.mod'
                    ],
                    correct: 0,
                    explanation: 'go mod tidy синхронизирует go.mod и go.sum с фактическими импортами в коде.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Для чего нужен go.sum?',
                    options: [
                        'Хранит хеши зависимостей для проверки целостности',
                        'Суммирует все ошибки',
                        'Содержит список всех функций',
                        'Логирует команды go mod'
                    ],
                    correct: 0,
                    explanation: 'go.sum содержит криптографические хеши скачанных зависимостей для защиты от подмены кода.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Что означает v5 в импорте github.com/go-chi/chi/v5?',
                    options: [
                        'Major version 5 (несовместимые изменения)',
                        'Пятая редакция',
                        'Пятая подпапка',
                        'Минимальная версия Go'
                    ],
                    correct: 0,
                    explanation: 'Major version suffix (/v5) указывает на major version. Разные major версии считаются разными модулями.'
                },
                {
                    id: 'q5',
                    type: 'multiple',
                    question: 'Какие файлы нужно коммитить в git? (несколько ответов)',
                    options: [
                        'go.mod',
                        'go.sum',
                        'vendor/',
                        'go.work'
                    ],
                    correct: [0, 1],
                    explanation: 'go.mod и go.sum всегда коммитятся. vendor/ — опционально (не рекомендуется для библиотек). go.work — обычно нет.'
                }
            ]
        }
    ]
};
