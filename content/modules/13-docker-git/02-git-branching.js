export default {
    id: '13-02',
    title: 'Ветвление и слияние',
    description: 'Ветки позволяют разрабатывать функции изолированно. git branch, checkout, merge, rebase и разрешение конфликтов.',
    estimatedTime: 20,
    xpReward: 20,
    sections: [
        {
            type: 'theory',
            content: `
<h2>Ветки в Git</h2>
<p>Ветка (branch) — это просто указатель на коммит. Создание ветки мгновенное и дешёвое — никакого копирования файлов.</p>
<p>Зачем нужны ветки:</p>
<ul>
    <li>Разрабатываем новую функцию изолированно, не ломая main</li>
    <li>Параллельная работа нескольких разработчиков</li>
    <li>Hotfix — быстрое исправление бага без влияния на незаконченные фичи</li>
</ul>
<h3>Merge vs Rebase</h3>
<p><strong>Merge</strong> сохраняет всю историю и создаёт merge-коммит. <strong>Rebase</strong> переносит коммиты поверх другой ветки, история линейная — чище выглядит.</p>
`
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `gitGraph
    commit id: "Initial"
    commit id: "Add auth"
    branch feature/user-profile
    checkout feature/user-profile
    commit id: "Add profile page"
    commit id: "Add avatar upload"
    checkout main
    commit id: "Fix login bug"
    merge feature/user-profile id: "Merge feature"
    commit id: "Release v1.1"`,
            caption: 'Git Flow: feature-ветка разрабатывается параллельно с main и сливается через merge'
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Работа с ветками',
            code: `# Список веток (* = текущая)
git branch
# * main
#   feature/login

# Создать новую ветку
git branch feature/user-profile

# Переключиться на ветку
git checkout feature/user-profile
# или сокращённо: создать и переключиться
git checkout -b feature/user-profile

# Современный способ (git >= 2.23)
git switch main
git switch -c feature/user-profile  # create + switch

# Список всех веток (включая remote)
git branch -a

# Удалить ветку (после merge)
git branch -d feature/user-profile

# Принудительно удалить (без merge)
git branch -D feature/user-profile`,
            explanation: 'git switch — современная замена git checkout для переключения веток. git checkout остаётся для работы с файлами (git checkout -- file.go).'
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Merge и разрешение конфликтов',
            code: `# Слить feature-ветку в main
git checkout main
git merge feature/user-profile
# Fast-forward (если main не изменился)
# или создаёт merge-коммит

# Merge с явным коммитом (без fast-forward)
git merge --no-ff feature/user-profile

# Если возник конфликт:
# CONFLICT (content): Merge conflict in main.go
# Auto-merging main.go
# Automatic merge failed; fix conflicts and then commit.

# Открываем файл с конфликтом — Git помечает:
# <<<<<<< HEAD
# код из main
# =======
# код из feature-ветки
# >>>>>>> feature/user-profile

# Редактируем файл: оставляем нужный код
# Убираем маркеры <<<, ===, >>>

# После разрешения конфликта:
git add main.go
git commit -m "merge: resolve conflict in main.go"

# Посмотреть все конфликтующие файлы
git diff --name-only --diff-filter=U`,
            explanation: 'Конфликт возникает когда одна строка изменена в обеих ветках. Git помечает конфликт маркерами — нужно вручную выбрать правильный код и закоммитить.'
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Rebase: линейная история',
            code: `# Находимся на feature-ветке
git checkout feature/user-profile

# Rebase поверх main (переносим наши коммиты)
git rebase main
# Rewinding head to replay your work on top of it...
# Applying: Add profile page
# Applying: Add avatar upload

# После rebase — fast-forward merge в main
git checkout main
git merge feature/user-profile
# Fast-forward (линейная история)

# Если конфликт при rebase:
# Разрешаем конфликт в файлах
git add conflicted_file.go
git rebase --continue
# Или отменить rebase:
git rebase --abort

# Интерактивный rebase — сжать/переименовать коммиты
git rebase -i HEAD~3  # последние 3 коммита`,
            explanation: 'Rebase переписывает историю, создавая новые коммиты. Никогда не делайте rebase запушенных веток — это сломает историю для коллег.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p><strong>Merge vs Rebase:</strong> Используйте <strong>merge</strong> для интеграции feature-веток в main (сохраняет историю). Используйте <strong>rebase</strong> для обновления feature-ветки из main (чистая история). Никогда не rebase public ветки!</p>'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q13-02-1',
                    type: 'single',
                    question: 'Что делает git merge --no-ff?',
                    options: [
                        'Запрещает merge при конфликтах',
                        'Всегда создаёт merge-коммит, даже если возможен fast-forward',
                        'Сжимает все коммиты feature-ветки в один',
                        'Отменяет последний merge'
                    ],
                    correct: 1,
                    explanation: '--no-ff (no fast-forward) всегда создаёт merge-коммит. Это сохраняет в истории факт существования feature-ветки. Полезно для наглядности истории проекта.'
                },
                {
                    id: 'q13-02-2',
                    type: 'single',
                    question: 'Когда нельзя делать git rebase?',
                    options: [
                        'Когда в ветке больше 5 коммитов',
                        'Когда ветка уже запушена и её используют другие разработчики',
                        'Когда есть конфликты',
                        'Когда ветка называется feature/'
                    ],
                    correct: 1,
                    explanation: 'Rebase переписывает историю — создаёт новые коммиты с новыми hash. Если ветка запушена и коллеги на неё опираются — rebase сломает их историю.'
                },
                {
                    id: 'q13-02-3',
                    type: 'multiple',
                    question: 'Как разрешить конфликт при merge?',
                    options: [
                        'Отредактировать файл с конфликтом, убрав маркеры <<<, ===, >>>',
                        'Запустить git merge --resolve',
                        'Выполнить git add для разрешённых файлов',
                        'Выполнить git commit для завершения merge',
                        'Удалить .git/MERGE_HEAD файл'
                    ],
                    correct: [0, 2, 3],
                    explanation: 'Процесс разрешения конфликта: 1) редактируем файлы (убираем маркеры) 2) git add файлы 3) git commit. git merge --resolve не существует.'
                }
            ]
        }
    ]
};
