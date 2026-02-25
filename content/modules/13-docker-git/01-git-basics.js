export default {
    id: '13-01',
    title: 'Основы Git',
    description: 'Git — система контроля версий. Аналогии, три области, init/add/commit/log/diff/stash, .gitignore и конвенции коммитов.',
    estimatedTime: 30,
    xpReward: 25,
    sections: [
        {
            type: 'theory',
            content: `
<h2>Зачем нужен Git?</h2>
<p>Представь, что ты пишешь роман. Каждый вечер ты сохраняешь копию: <code>roman_v1.docx</code>, <code>roman_v2.docx</code>, <code>roman_FINAL.docx</code>, <code>roman_FINAL_FINAL.docx</code>... Звучит знакомо?</p>
<p>Git решает эту проблему элегантно: он хранит <strong>историю всех изменений</strong> каждого файла. Ты можешь вернуться к любому моменту прошлого, работать параллельно над разными идеями и объединять работу нескольких людей без потерь.</p>
<p>Без Git в команде хаос: "Вася перезаписал мой код!", "Какая версия рабочая?", "Кто сломал сборку?". С Git — полная история, ответственность и контроль.</p>

<h2>Три области Git</h2>
<p>Git управляет файлами через три концептуальных области:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Область</th>
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Где находится</th>
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Что это</th>
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Аналогия</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:9px 14px;border:1px solid var(--border)"><strong>Working Directory</strong></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Файлы на диске</td>
      <td style="padding:9px 14px;border:1px solid var(--border)">То что ты редактируешь прямо сейчас</td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Рабочий стол</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:9px 14px;border:1px solid var(--border)"><strong>Staging Area</strong></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">.git/index</td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Изменения подготовленные к коммиту</td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Конверт перед отправкой</td>
    </tr>
    <tr>
      <td style="padding:9px 14px;border:1px solid var(--border)"><strong>Repository</strong></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">.git/</td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Вся история коммитов</td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Архив отправленных писем</td>
    </tr>
  </tbody>
</table>
<p>Рабочий цикл: <strong>редактируешь</strong> файлы → <strong>git add</strong> (кладёшь в конверт) → <strong>git commit</strong> (запечатываешь и отправляешь в историю).</p>
`
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `flowchart LR
    WD["Working Directory\\n(файлы на диске)"]
    SA["Staging Area\\n(индекс)"]
    REPO["Local Repository\\n(.git)"]
    REMOTE["Remote\\n(GitHub/GitLab)"]

    WD -->|"git add"| SA
    SA -->|"git commit"| REPO
    REPO -->|"git push"| REMOTE
    REMOTE -->|"git pull / fetch"| WD
    REPO -->|"git checkout / restore"| WD
    SA -->|"git restore --staged"| WD`,
            caption: 'Жизненный цикл файла в Git: от редактирования до удалённого репозитория'
        },
        {
            type: 'theory',
            content: `
<h2>Настройка и первый репозиторий</h2>
<p>Перед началом работы Git нужно знать кто ты — это имя и email попадают в каждый коммит и показываются всей команде. Настраивается один раз глобально.</p>
<p>После настройки — создание репозитория это просто <code>git init</code> в папке проекта. Git создаст скрытую папку <code>.git/</code> — это и есть вся база данных истории.</p>

<h2>Основные команды работы</h2>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Команда</th>
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Что делает</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:9px 14px;border:1px solid var(--border)"><code>git status</code></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Показывает состояние файлов (изменены / в staging / untracked)</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:9px 14px;border:1px solid var(--border)"><code>git add &lt;file&gt;</code></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Добавляет файл в staging area</td>
    </tr>
    <tr>
      <td style="padding:9px 14px;border:1px solid var(--border)"><code>git add .</code></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Добавляет все изменения в staging</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:9px 14px;border:1px solid var(--border)"><code>git commit -m "msg"</code></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Создаёт коммит из staging</td>
    </tr>
    <tr>
      <td style="padding:9px 14px;border:1px solid var(--border)"><code>git log --oneline</code></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Краткая история коммитов</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:9px 14px;border:1px solid var(--border)"><code>git diff</code></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Изменения НЕ добавленные в staging</td>
    </tr>
    <tr>
      <td style="padding:9px 14px;border:1px solid var(--border)"><code>git diff --staged</code></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Изменения в staging (готовые к коммиту)</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:9px 14px;border:1px solid var(--border)"><code>git restore --staged &lt;file&gt;</code></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Убрать файл из staging (отменить add)</td>
    </tr>
    <tr>
      <td style="padding:9px 14px;border:1px solid var(--border)"><code>git restore &lt;file&gt;</code></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Откатить изменения в файле (до последнего коммита)</td>
    </tr>
  </tbody>
</table>
`
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Первые шаги: настройка и первый коммит',
            code: `# Настройка (один раз на машину)
git config --global user.name "Иван Петров"
git config --global user.email "ivan@example.com"
git config --global init.defaultBranch main   # главная ветка называется main
git config --global core.editor "code --wait" # VS Code как редактор

# Создаём проект
mkdir goapp && cd goapp
git init
# Initialized empty Git repository in /home/ivan/goapp/.git/

# Смотрим статус
git status
# On branch main
# No commits yet
# nothing to commit (create/copy files and use "git add" to track)

# Создаём файлы
echo "module goapp\n\ngo 1.23" > go.mod
mkdir -p cmd/server
cat > cmd/server/main.go << 'EOF'
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}
EOF

# Статус изменился — появились untracked файлы
git status
# Untracked files:
#   go.mod
#   cmd/server/main.go

# Добавляем всё в staging
git add .

# Или по отдельности для контроля:
# git add go.mod
# git add cmd/server/main.go

git status
# Changes to be committed:
#   new file:   cmd/server/main.go
#   new file:   go.mod

# Первый коммит
git commit -m "feat: initial project structure"
# [main (root-commit) 3a7f2c1] feat: initial project structure
# 2 files changed, 8 insertions(+)

# История
git log --oneline
# 3a7f2c1 feat: initial project structure`,
            explanation: 'git init создаёт .git/ — всю базу данных истории. После git add файлы попадают в staging. git commit делает snapshot. Каждый коммит имеет уникальный хеш (3a7f2c1).'
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'git diff, stash и исправление коммитов',
            code: `# Изменяем файл
echo "// version 2" >> cmd/server/main.go

# Видим изменения ДО git add
git diff
# diff --git a/cmd/server/main.go b/cmd/server/main.go
# +// version 2

# Добавляем в staging
git add cmd/server/main.go

# Теперь diff пустой, но diff --staged показывает
git diff            # ничего (всё в staging)
git diff --staged   # показывает staged изменения

# === STASH: "убрать на потом" ===
# Представь: ты работаешь над фичей, но нужно срочно переключиться
# Изменения не готовы к коммиту, но и терять не хочешь

git stash           # сохраняет незакоммиченные изменения
# Saved working directory and index state WIP on main: 3a7f2c1

git stash list      # список стешей
# stash@{0}: WIP on main: 3a7f2c1 feat: initial project structure

# ... делаем срочные правки, коммитим ...

git stash pop       # восстанавливаем (и удаляем из stash)
git stash apply     # восстанавливаем (оставляем в stash)

# === Исправление последнего коммита ===
git commit --amend -m "feat: initial project with server"
# ТОЛЬКО если коммит ещё не запушен!

# Краткий статус (удобнее для скриптов)
git status -s
# M  main.go        (M слева = staged)
#  M handler.go     (M справа = not staged)
# ?? newfile.go     (?? = untracked)`,
            explanation: 'git stash — "временный карман" для незаконченных изменений. git stash pop возвращает последний стеш. --amend исправляет последний коммит, но только локальный — никогда не амендь запушенные коммиты.'
        },
        {
            type: 'theory',
            content: `
<h2>Conventional Commits — стандарт сообщений</h2>
<p>Хорошее сообщение коммита — это половина документации проекта. Через год ты откроешь историю и поймёшь: <em>"что здесь происходило?"</em>. Conventional Commits — стандарт, который даёт структуру.</p>
<p>Формат: <code>&lt;тип&gt;(&lt;область&gt;): &lt;описание&gt;</code></p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Тип</th>
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Когда использовать</th>
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Semver</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:9px 14px;border:1px solid var(--border)"><code>feat:</code></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Новая функциональность</td>
      <td style="padding:9px 14px;border:1px solid var(--border)">MINOR +1</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:9px 14px;border:1px solid var(--border)"><code>fix:</code></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Исправление бага</td>
      <td style="padding:9px 14px;border:1px solid var(--border)">PATCH +1</td>
    </tr>
    <tr>
      <td style="padding:9px 14px;border:1px solid var(--border)"><code>feat!:</code> / <code>fix!:</code></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Breaking change (несовместимое изменение)</td>
      <td style="padding:9px 14px;border:1px solid var(--border)">MAJOR +1</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:9px 14px;border:1px solid var(--border)"><code>refactor:</code></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Рефакторинг без изменения поведения</td>
      <td style="padding:9px 14px;border:1px solid var(--border)">—</td>
    </tr>
    <tr>
      <td style="padding:9px 14px;border:1px solid var(--border)"><code>test:</code></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Добавление/изменение тестов</td>
      <td style="padding:9px 14px;border:1px solid var(--border)">—</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:9px 14px;border:1px solid var(--border)"><code>docs:</code></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Документация</td>
      <td style="padding:9px 14px;border:1px solid var(--border)">—</td>
    </tr>
    <tr>
      <td style="padding:9px 14px;border:1px solid var(--border)"><code>chore:</code></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Зависимости, конфиги, инфраструктура</td>
      <td style="padding:9px 14px;border:1px solid var(--border)">—</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:9px 14px;border:1px solid var(--border)"><code>perf:</code></td>
      <td style="padding:9px 14px;border:1px solid var(--border)">Оптимизация производительности</td>
      <td style="padding:9px 14px;border:1px solid var(--border)">—</td>
    </tr>
  </tbody>
</table>

<h2>.gitignore — что не трогать</h2>
<p>Некоторые файлы не должны попадать в репозиторий никогда: секреты, бинарники, временные файлы. <code>.gitignore</code> говорит Git игнорировать их.</p>
`
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Conventional Commits и .gitignore на практике',
            code: `# === Conventional Commits примеры ===

# Новая фича
git commit -m "feat(auth): add JWT refresh token endpoint"

# Фикс с указанием scope
git commit -m "fix(user): prevent duplicate email on registration"

# Breaking change (изменили формат ответа API)
git commit -m "feat(api)!: change user response to include nested address"

# Документация
git commit -m "docs: add API authentication guide to README"

# Зависимости
git commit -m "chore: upgrade chi to v5.2.0, update go.sum"

# Тесты
git commit -m "test(handler): add integration tests for POST /users"

# Многострочный коммит с описанием
git commit -m "fix(auth): fix token expiry calculation

JWT tokens were expiring 1 hour early due to
inconsistent timezone handling. Now using UTC.

Fixes: #142"

# === .gitignore для Go-проекта ===
cat > .gitignore << 'EOF'
# Бинарники
/bin/
*.exe
/myapp

# Секреты (КРИТИЧНО — никогда не коммитить!)
.env
.env.local
.env.production
*.pem
*.key
*.crt
config.local.yaml

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Go артефакты
*.test
*.prof
/vendor/

# Логи
*.log
/tmp/
EOF

# После создания .gitignore — файлы больше не отслеживаются
git add .gitignore
git commit -m "chore: add .gitignore for Go project"`,
            explanation: 'Conventional Commits позволяют автоматически генерировать CHANGELOG и определять версию. Никогда не коммить .env и ключи — это открытый доступ к твоим сервисам для всего интернета.'
        },
        {
            type: 'info-box',
            variant: 'danger',
            content: '<strong>Секреты в Git — катастрофа!</strong> Если ты случайно закоммитил .env с паролями или API-ключами — простого удаления файла недостаточно. Ключ остаётся в истории. Нужно немедленно: 1) сменить все скомпрометированные ключи/пароли 2) почистить историю через <code>git filter-repo</code>. Лучше сразу настрой pre-commit хук для проверки секретов.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<strong>git log --oneline --graph --all</strong> — одна из самых полезных команд. Показывает граф всех веток. Добавь алиас: <code>git config --global alias.lg "log --oneline --graph --all --decorate"</code>, затем просто <code>git lg</code>.'
        },
        {
            type: 'editor',
            title: 'Практика: напиши правильное сообщение коммита',
            language: 'bash',
            initialCode: `# Сценарий: ты добавил новый endpoint GET /api/users/:id
# в файл internal/handler/user.go
# Напиши команду git commit с правильным conventional commit сообщением

git add internal/handler/user.go
git commit -m "ТВОЙ_КОММИТ_ЗДЕСЬ"`,
            solution: `git add internal/handler/user.go
git commit -m "feat(user): add GET /api/users/:id endpoint"`,
            hints: [
                'Это новая функциональность — какой тип?',
                'Scope (область) — это модуль/пакет, который изменён: user, auth, handler...',
                'Описание: короткое, в настоящем времени, на английском: "add", "implement", "create"'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q13-01-1',
                    type: 'single',
                    question: 'Что делает git add?',
                    options: [
                        'Создаёт новый коммит',
                        'Переносит изменения из рабочей директории в staging area',
                        'Добавляет файл в рабочую директорию',
                        'Отправляет изменения на GitHub'
                    ],
                    correct: 1,
                    explanation: 'git add переносит изменения из рабочей директории в staging area (индекс). Staging — промежуточная зона: ты выбираешь что войдёт в следующий коммит. Commit фиксирует только то, что в staging.'
                },
                {
                    id: 'q13-01-2',
                    type: 'single',
                    question: 'Что показывает git diff без аргументов?',
                    options: [
                        'Разницу между двумя ветками',
                        'Изменения в рабочей директории, которые ещё НЕ добавлены в staging',
                        'Разницу между staging и последним коммитом',
                        'Всю историю изменений файла'
                    ],
                    correct: 1,
                    explanation: 'git diff (без флагов) = разница между рабочей директорией и staging. git diff --staged = разница между staging и последним коммитом. Это разные команды!'
                },
                {
                    id: 'q13-01-3',
                    type: 'single',
                    question: 'Ты сделал git add main.go, но передумал включать этот файл в коммит. Что делать?',
                    options: [
                        'git remove --staged main.go',
                        'git reset main.go',
                        'git restore --staged main.go',
                        'git undo main.go'
                    ],
                    correct: 2,
                    explanation: 'git restore --staged <file> убирает файл из staging, возвращая в рабочую директорию. Изменения в файле сохраняются. git reset HEAD <file> — старый синтаксис, тоже работает.'
                },
                {
                    id: 'q13-01-4',
                    type: 'multiple',
                    question: 'Какие файлы НЕЛЬЗЯ коммитить в Git-репозиторий?',
                    options: [
                        '.env с паролями и API-ключами',
                        'go.mod и go.sum',
                        'Скомпилированный бинарник (myapp)',
                        'SSL-ключи (*.pem, *.key)',
                        'Dockerfile',
                        'Временные логи *.log'
                    ],
                    correct: [0, 2, 3, 5],
                    explanation: '.env и *.pem — секреты, их нельзя светить. Бинарники меняются при каждой сборке и не нужны в истории. Логи — временные артефакты. go.mod/go.sum и Dockerfile — нужно коммитить.'
                },
                {
                    id: 'q13-01-5',
                    type: 'single',
                    question: 'Какой Conventional Commit тип использовать для breaking change?',
                    options: [
                        'break: изменение API',
                        'major: bump version',
                        'feat!: или fix!: (восклицательный знак)',
                        'change: несовместимое изменение'
                    ],
                    correct: 2,
                    explanation: 'Breaking change = ! после типа: feat!:, fix!:. Или добавить в footer строку "BREAKING CHANGE: описание". Это триггерит MAJOR версию в semver. Автоматические инструменты (semantic-release) читают эти маркеры.'
                },
                {
                    id: 'q13-01-6',
                    type: 'code-fill',
                    question: 'Как сохранить незаконченные изменения "на потом" чтобы переключиться на другую задачу?',
                    options: [
                        'git stash',
                        'git save',
                        'git hold',
                        'git temp commit'
                    ],
                    correct: 0,
                    explanation: 'git stash сохраняет незакоммиченные изменения в стек. git stash pop восстанавливает последний стеш. Можно хранить несколько стешей: git stash list показывает их все.'
                },
                {
                    id: 'q13-01-7',
                    type: 'single',
                    question: 'Что произойдёт если удалить папку .git/?',
                    options: [
                        'Удалятся только незакоммиченные изменения',
                        'Репозиторий перестанет быть Git-репозиторием, вся история потеряется',
                        'Git автоматически восстановит папку',
                        'Удалятся все файлы проекта'
                    ],
                    correct: 1,
                    explanation: '.git/ — это ВСЯ база данных Git. Коммиты, ветки, история — всё там. Удаление .git/ превращает папку обратно в обычную директорию без истории. Файлы на диске останутся, но история потеряна.'
                }
            ]
        }
    ]
};
