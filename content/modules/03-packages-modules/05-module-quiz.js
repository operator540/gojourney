export default {
    id: '03-05',
    title: 'Итоговый квиз: Пакеты и модули',
    description: 'Проверьте знания по системе пакетов, go.mod, зависимостям и структуре проекта',
    estimatedTime: 10,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Проверка знаний</h2>
                <p>Вы завершили модуль <strong>«Пакеты и модули»</strong>. Проверим понимание системы пакетов, Go Modules, управления зависимостями и организации проекта.</p>
            `
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Все .go файлы в одной директории должны иметь...',
                    options: [
                        'Одинаковое имя пакета',
                        'Уникальные имена пакетов',
                        'Имя main',
                        'Имя директории в CamelCase'
                    ],
                    correct: 0,
                    explanation: 'Все файлы в одной директории принадлежат одному пакету.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Какая команда синхронизирует go.mod с фактическими импортами?',
                    options: [
                        'go mod tidy',
                        'go mod sync',
                        'go get -u',
                        'go mod verify'
                    ],
                    correct: 0,
                    explanation: 'go mod tidy добавляет недостающие и удаляет неиспользуемые зависимости.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Что делает internal/ директория?',
                    options: [
                        'Запрещает импорт пакетов из других модулей',
                        'Скрывает файлы от компилятора',
                        'Автоматически тестирует код',
                        'Запрещает push в git'
                    ],
                    correct: 0,
                    explanation: 'internal/ — специальная директория Go. Компилятор запрещает импорт этих пакетов из внешних модулей.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Когда выполняется init()?',
                    options: [
                        'Автоматически до main()',
                        'При первом вызове функции',
                        'После main()',
                        'Только при тестировании'
                    ],
                    correct: 0,
                    explanation: 'init() выполняется автоматически после импорта пакета и до вызова main().'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Как удалить зависимость из проекта?',
                    options: [
                        'go get pkg@none, затем go mod tidy',
                        'Удалить строку из go.mod',
                        'go remove pkg',
                        'go mod delete pkg'
                    ],
                    correct: 0,
                    explanation: 'go get pkg@none удаляет зависимость. go mod tidy очистит go.sum.'
                },
                {
                    id: 'q6',
                    type: 'multiple',
                    question: 'Какие файлы нужно коммитить в git? (несколько ответов)',
                    options: [
                        'go.mod',
                        'go.sum',
                        'go.work',
                        '.go файлы'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'go.mod, go.sum и .go файлы коммитятся. go.work обычно нет (для локальной разработки).'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Какое имя пакета — антипаттерн?',
                    options: [
                        'helpers',
                        'handler',
                        'validator',
                        'repository'
                    ],
                    correct: 0,
                    explanation: 'helpers, utils, common — антипаттерны. Имя пакета должно отражать конкретное назначение.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Что означает /v5 в пути импорта?',
                    options: [
                        'Major version 5 модуля',
                        'Подпапка v5',
                        'Пятая ревизия файла',
                        'Минимальная версия Go'
                    ],
                    correct: 0,
                    explanation: 'Major version suffix (/v5) указывает на major version. Разные major версии — разные модули.'
                }
            ]
        }
    ]
};
