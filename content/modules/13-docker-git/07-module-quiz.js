export default {
    id: '13-07',
    title: 'Итоговый квиз: Docker и Git',
    description: 'Проверьте знания по модулю 13: Git основы, ветвление, workflow, Docker, Dockerfile и docker-compose.',
    estimatedTime: 12,
    xpReward: 25,
    sections: [
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q13-07-1',
                    type: 'single',
                    question: 'Что происходит при git commit без git add?',
                    options: [
                        'Коммитятся все изменённые файлы',
                        'Коммитятся только файлы из staging area (которые были добавлены через git add)',
                        'Git выдаёт ошибку',
                        'Коммитируются только новые файлы'
                    ],
                    correct: 1,
                    explanation: 'git commit записывает только то, что в staging area. Если staging пустой — коммит не создаётся (nothing to commit). git commit -a автоматически добавляет tracked файлы, но не новые.'
                },
                {
                    id: 'q13-07-2',
                    type: 'single',
                    question: 'Команда для создания и немедленного переключения на новую ветку (современный синтаксис):',
                    options: [
                        'git branch -n feature/new',
                        'git checkout -b feature/new',
                        'git switch -c feature/new',
                        'git new branch feature/new'
                    ],
                    correct: 2,
                    explanation: 'git switch -c (--create) — современный способ создать и переключиться на ветку. git checkout -b тоже работает, но switch появился в Git 2.23 как более понятная замена.'
                },
                {
                    id: 'q13-07-3',
                    type: 'single',
                    question: 'Что такое Docker Image?',
                    options: [
                        'Запущенный экземпляр приложения',
                        'Неизменяемый шаблон из которого создаются контейнеры',
                        'Резервная копия данных',
                        'Конфигурационный файл Docker'
                    ],
                    correct: 1,
                    explanation: 'Image — неизменяемый шаблон (snapshot файловой системы + конфигурация). Container — запущенный экземпляр image. Из одного image можно запустить множество контейнеров.'
                },
                {
                    id: 'q13-07-4',
                    type: 'single',
                    question: 'Какой тип Conventional Commit для breaking change?',
                    options: [
                        'break: изменение API',
                        'feat!: изменение API (восклицательный знак)',
                        'major: изменение API',
                        'change!: изменение API'
                    ],
                    correct: 1,
                    explanation: 'Breaking change обозначается ! после типа: feat!:, fix!:, refactor!:. Или через footer BREAKING CHANGE: описание. Это триггерит major версию в semver.'
                },
                {
                    id: 'q13-07-5',
                    type: 'single',
                    question: 'Зачем CGO_ENABLED=0 в Dockerfile для Go?',
                    options: [
                        'Ускоряет сборку',
                        'Создаёт статический бинарник, работающий в alpine без glibc',
                        'Включает garbage collector',
                        'Отключает CGO-оптимизации'
                    ],
                    correct: 1,
                    explanation: 'CGO_ENABLED=0 делает статическую сборку — бинарник не зависит от glibc и работает в минимальных образах (alpine, scratch). Без этого бинарник может не запуститься в alpine.'
                },
                {
                    id: 'q13-07-6',
                    type: 'multiple',
                    question: 'Что НЕ следует добавлять в git репозиторий?',
                    options: [
                        '.env файл с паролями',
                        'go.mod',
                        'Скомпилированный бинарник',
                        'SSL-ключи .pem',
                        'docker-compose.yml'
                    ],
                    correct: [0, 2, 3],
                    explanation: '.env с паролями и .pem-ключи — секреты, нельзя в git. Бинарники — артефакты сборки, не код. go.mod и docker-compose.yml — нужно коммитить.'
                },
                {
                    id: 'q13-07-7',
                    type: 'single',
                    question: 'Как в docker-compose гарантировать, что app запустится только после готовности PostgreSQL?',
                    options: [
                        'depends_on: [postgres] (без healthcheck)',
                        'Добавить sleep 5 в CMD',
                        'Добавить healthcheck в postgres и depends_on с condition: service_healthy',
                        'Запускать postgres отдельной командой перед docker compose up'
                    ],
                    correct: 2,
                    explanation: 'depends_on без healthcheck ждёт только запуска контейнера, не готовности PostgreSQL. healthcheck + condition: service_healthy гарантирует, что pg_isready вернул успех перед стартом app.'
                }
            ]
        }
    ]
};
