export default {
    id: '20-05',
    title: 'Итоговый квиз: Tooling и CI/CD',
    description: 'Makefile, линтеры, build tags, ldflags, GitHub Actions',
    estimatedTime: 15,
    xpReward: 25,

    sections: [
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что делает команда go vet ./...?',
                    options: [
                        'Статический анализ кода — находит подозрительные конструкции',
                        'Форматирует код',
                        'Запускает тесты',
                        'Удаляет неиспользуемые импорты'
                    ],
                    correct: 0,
                    explanation: 'go vet — встроенный статический анализатор. Находит: printf без аргументов, unreachable code, неправильное использование sync.Mutex, и другие подозрительные конструкции.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Как указать что файл компилируется только на Linux?',
                    options: [
                        '//go:build linux в первой строке файла',
                        '// +build linux (устаревший синтаксис)',
                        'package linux',
                        '#ifdef LINUX'
                    ],
                    correct: 0,
                    explanation: '//go:build linux — современный синтаксис (Go 1.17+). Или суффикс в имени файла: storage_linux.go. Старый // +build всё ещё работает но deprecated.'
                },
                {
                    id: 'q3',
                    type: 'multiple',
                    question: 'Что умеет golangci-lint?',
                    options: [
                        'Запускать несколько линтеров параллельно',
                        'Конфигурироваться через .golangci.yml',
                        'Компилировать Go код быстрее',
                        'Автоматически исправлять некоторые ошибки',
                        'Интегрироваться с IDE'
                    ],
                    correct: [0, 1, 3, 4],
                    explanation: 'golangci-lint объединяет 50+ линтеров. Конфигурация через .golangci.yml. --fix автоисправление. Плагины для VSCode, GoLand. НЕ компилятор.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Для чего используются -ldflags "-X pkg.Var=value"?',
                    options: [
                        'Встроить значение переменной в бинарник при сборке',
                        'Задать переменную окружения',
                        'Включить build tag',
                        'Задать путь к Go модулям'
                    ],
                    correct: 0,
                    explanation: '-X pkg.Var=value записывает значение в переменную пакета во время линковки. Используется для Version, GitCommit, BuildTime — данных известных только в момент сборки.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Зачем в Makefile используется .PHONY?',
                    options: [
                        'Указывает что цель — команда, а не имя файла',
                        'Делает команду быстрее',
                        'Скрывает команду от вывода',
                        'Обязателен для всех целей'
                    ],
                    correct: 0,
                    explanation: '.PHONY: test build — если существует файл с именем "test" или "build", make не будет путать его с целью. Без .PHONY make может отказаться выполнять цель, думая что файл актуален.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Что происходит когда workflow в GitHub Actions ссылается на secrets.MISSING_TOKEN?',
                    options: [
                        'Переменная становится пустой строкой',
                        'Workflow падает с ошибкой',
                        'Запрашивает ввод у пользователя',
                        'Использует значение из .env файла'
                    ],
                    correct: 0,
                    explanation: 'Если секрет не существует — переменная пустая "". Команды которые требуют токен упадут с ошибкой аутентификации, но сам workflow не завершится на этом шаге.'
                }
            ]
        },
        {
            type: 'theory',
            content: `
                <h2>Tooling и CI/CD: итоги</h2>
                <ul>
                    <li>🔨 <strong>Makefile</strong> — стандарт автоматизации: build, test, lint, run, docker</li>
                    <li>🔍 <strong>golangci-lint</strong> — объединяет 50+ линтеров, конфиг через .golangci.yml</li>
                    <li>🏷️ <strong>Build tags</strong> — условная компиляция: платформы, mock/real, integration</li>
                    <li>📝 <strong>ldflags -X</strong> — встраиваем версию и commit hash в бинарник</li>
                    <li>⚙️ <strong>GitHub Actions</strong> — lint → test → build → deploy при push/PR/tag</li>
                    <li>🔒 <strong>Secrets</strong> — зашифрованные токены, никогда не хардкодить</li>
                    <li>🐳 <strong>Docker services</strong> — PostgreSQL/Redis прямо в CI для интеграционных тестов</li>
                </ul>
            `
        }
    ]
};
