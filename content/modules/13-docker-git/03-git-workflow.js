export default {
    id: '13-03',
    title: 'Git Workflow',
    description: 'Git Flow vs GitHub Flow, Pull Request, Code Review, Conventional Commits и .gitignore — профессиональная работа с Git в команде.',
    estimatedTime: 18,
    xpReward: 18,
    sections: [
        {
            type: 'theory',
            content: `
<h2>Git Workflow: как работают команды</h2>
<h3>GitHub Flow (простой, популярный)</h3>
<ol>
    <li>Создай ветку от main: <code>git switch -c feature/awesome</code></li>
    <li>Разрабатывай, коммить часто</li>
    <li>Открой Pull Request</li>
    <li>Code Review</li>
    <li>Merge в main → деплой</li>
</ol>
<h3>Git Flow (для релизных проектов)</h3>
<p>Ветки: <code>main</code> (production), <code>develop</code> (интеграция), <code>feature/*</code>, <code>release/*</code>, <code>hotfix/*</code>. Сложнее, но даёт контроль над релизами.</p>
<p>Большинство Go-проектов используют GitHub Flow — он проще и быстрее.</p>
`
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Conventional Commits — стандарт сообщений коммитов',
            code: `# Формат: <type>(<scope>): <description>
#
# type: feat, fix, docs, style, refactor, test, chore, perf
# scope: опционально, область изменений
# description: краткое описание в настоящем времени

# Новая функция
git commit -m "feat(auth): add JWT refresh token"

# Исправление бага
git commit -m "fix(user): prevent duplicate email registration"

# Документация
git commit -m "docs: update API endpoints in README"

# Рефакторинг (без изменения функциональности)
git commit -m "refactor(handler): extract validation to middleware"

# Тесты
git commit -m "test(user): add integration tests for register endpoint"

# Зависимости, конфигурация
git commit -m "chore: upgrade chi to v5.2.0"

# Breaking change — добавляем ! или BREAKING CHANGE в footer
git commit -m "feat(api)!: change user response format"

# Многострочный коммит с телом
git commit -m "fix(auth): fix token expiry calculation

Previously tokens were expiring 1 hour early due to timezone issue.
Now using UTC consistently.

Fixes: #123"`,
            explanation: 'Conventional Commits — стандарт, позволяющий автоматически генерировать CHANGELOG и определять semver версию (feat → minor, fix → patch, ! → major).'
        },
        {
            type: 'code-example',
            language: 'bash',
            title: '.gitignore — что не добавлять в репозиторий',
            code: `# .gitignore для Go-проекта

# Бинарник сборки
/myapp
*.exe

# Переменные окружения (НИКОГДА не коммитить!)
.env
.env.local
*.env

# IDE
.idea/
.vscode/
*.swp

# OS файлы
.DS_Store
Thumbs.db

# Временные файлы Go
/vendor/     # если используете go mod, не нужен vendor
*.test       # тестовые бинарники
*.prof       # профили

# Логи и данные
*.log
/tmp/
/data/

# Сертификаты (НИКОГДА не коммитить!)
*.pem
*.key
*.crt`,
            explanation: '.gitignore определяет файлы, которые Git игнорирует. .env с паролями и ключами — НИКОГДА не должны попасть в репозиторий. Используйте github.com/github/gitignore для шаблонов.'
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Pull Request workflow',
            code: `# 1. Создаём ветку для задачи
git switch -c feature/add-task-endpoint

# 2. Разрабатываем...
git add internal/handler/task.go
git commit -m "feat(task): add GET /tasks endpoint"

git add internal/handler/task.go internal/usecase/task.go
git commit -m "feat(task): add POST /tasks endpoint"

# 3. Синхронизируемся с main перед PR
git fetch origin
git rebase origin/main  # или merge

# 4. Пушим ветку
git push -u origin feature/add-task-endpoint

# 5. Открываем PR через GitHub UI или gh CLI
gh pr create --title "feat: add task CRUD endpoints" \
    --body "## Changes
- GET /tasks — list all tasks
- POST /tasks — create task
- PUT /tasks/:id — update task
- DELETE /tasks/:id — delete task

## Testing
- [ ] Unit tests added
- [ ] Integration tests pass"

# 6. После approve — merge через GitHub UI
# 7. Удаляем ветку
git switch main
git pull
git branch -d feature/add-task-endpoint`,
            explanation: 'Pull Request — это запрос на слияние ветки. GitHub, GitLab, Bitbucket предоставляют UI для review, комментариев и одобрения. gh CLI позволяет создавать PR прямо из терминала.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p><strong>Золотые правила PR:</strong> маленькие PR (до 400 строк) — легче ревьювить. Один PR = одна задача. Описание должно объяснять ЗАЧЕМ, а не ЧТО изменено (это видно в diff).</p>'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q13-03-1',
                    type: 'single',
                    question: 'Какой тип Conventional Commit использовать для новой функциональности?',
                    options: [
                        'fix:',
                        'feat:',
                        'chore:',
                        'refactor:'
                    ],
                    correct: 1,
                    explanation: 'feat: — для новых функций (features). fix: — для исправлений багов. chore: — для технических задач (зависимости, конфигурация). refactor: — для улучшения кода без изменения функциональности.'
                },
                {
                    id: 'q13-03-2',
                    type: 'multiple',
                    question: 'Какие файлы НЕЛЬЗЯ коммитить в Git?',
                    options: [
                        '.env с паролями и ключами',
                        'go.mod',
                        '*.pem ключи и сертификаты',
                        'Скомпилированные бинарники',
                        'main.go'
                    ],
                    correct: [0, 2, 3],
                    explanation: '.env, ключи и бинарники не должны попадать в репозиторий. .env содержит секреты, ключи нельзя светить, бинарники меняются при каждой сборке и занимают место.'
                },
                {
                    id: 'q13-03-3',
                    type: 'single',
                    question: 'В чём основное отличие GitHub Flow от Git Flow?',
                    options: [
                        'GitHub Flow использует только одну ветку main, Git Flow — несколько (main, develop, feature)',
                        'GitHub Flow только для GitHub, Git Flow — для всех платформ',
                        'GitHub Flow не поддерживает Pull Request',
                        'Git Flow быстрее и проще'
                    ],
                    correct: 0,
                    explanation: 'GitHub Flow: main + короткоживущие feature-ветки. Проще, быстрее, подходит для CD. Git Flow: main + develop + feature + release + hotfix. Сложнее, но даёт контроль над релизами.'
                }
            ]
        }
    ]
};
