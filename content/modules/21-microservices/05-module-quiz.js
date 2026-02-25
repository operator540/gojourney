export default {
    id: '21-05',
    title: 'Итоговый квиз: Микросервисы',
    description: 'Архитектура микросервисов, gRPC, API Gateway, Observability',
    estimatedTime: 20,
    xpReward: 35,

    sections: [
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Когда правильно начинать с монолита, а не микросервисов?',
                    options: [
                        'Всегда — особенно для новых проектов с непонятными границами',
                        'Только для маленьких проектов',
                        'Никогда — микросервисы всегда лучше',
                        'Только если нет DevOps команды'
                    ],
                    correct: 0,
                    explanation: 'Монолит: проще в разработке, деплое, отладке. Мигрируйте на микросервисы когда монолит стал проблемой: большие команды, независимое масштабирование, долгий деплой.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Принцип "Database per Service" означает...',
                    options: [
                        'Каждый микросервис имеет свою БД и не даёт прямой доступ к ней другим сервисам',
                        'Каждый сервис должен использовать PostgreSQL',
                        'Запрещено использовать одну БД для нескольких таблиц',
                        'Каждая таблица = отдельная БД'
                    ],
                    correct: 0,
                    explanation: 'Database per Service: сервис владеет своими данными эксклюзивно. Другие сервисы получают данные только через API. Обеспечивает независимость и loose coupling.'
                },
                {
                    id: 'q3',
                    type: 'multiple',
                    question: 'gRPC Stream используется когда...',
                    options: [
                        'Нужно передать большой список данных без загрузки всего в память',
                        'Нужен real-time чат',
                        'Нужна простая операция GetUser по ID',
                        'Клиент отправляет файл чанками',
                        'Нужен просто JSON ответ'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'Streaming: большие списки (server stream), чат (bidir stream), upload файла (client stream). Для простого GetUser достаточно Unary RPC.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Зачем API Gateway передаёт X-User-ID внутренним сервисам?',
                    options: [
                        'Сервисы знают кто делает запрос без повторной JWT валидации',
                        'Для логирования в сервисах',
                        'X-User-ID — обязательный HTTP заголовок',
                        'Для балансировки нагрузки'
                    ],
                    correct: 0,
                    explanation: 'Gateway проверяет JWT один раз → извлекает user_id → передаёт как заголовок. Внутренние сервисы доверяют этому заголовку. DRY: проверка токена только в одном месте.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Какой тип Prometheus метрики использовать для счётчика запросов?',
                    options: [
                        'Counter — только растёт, никогда не уменьшается',
                        'Gauge',
                        'Histogram',
                        'Summary'
                    ],
                    correct: 0,
                    explanation: 'Counter — монотонно возрастающее число. Подходит для: запросы, ошибки, созданные объекты. Gauge — текущее значение (CPU, connections). Histogram — распределение (latency).'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Что такое Distributed Tracing?',
                    options: [
                        'Отслеживание пути запроса через несколько сервисов с временны́ми отметками',
                        'Логирование ошибок во всех сервисах',
                        'Мониторинг CPU и памяти',
                        'Проверка доступности сервисов'
                    ],
                    correct: 0,
                    explanation: 'Distributed tracing: каждый сервис создаёт span, они объединяются в trace. В UI (Jaeger, Tempo) виден полный путь запроса и время в каждом сервисе. Незаменимо для performance debugging.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Три столпа Observability — это:',
                    options: [
                        'Logs (что произошло), Metrics (как работает), Traces (где проблема)',
                        'CPU, Memory, Disk',
                        'Backend, Frontend, Database',
                        'Development, Staging, Production'
                    ],
                    correct: 0,
                    explanation: 'Observability: Logs — детали событий, Metrics — числовые KPI (RPS, latency, errors), Traces — путь запроса через сервисы. Все три нужны для полного понимания системы.'
                }
            ]
        },
        {
            type: 'theory',
            content: `
                <h2>🎓 Поздравляем! Вы завершили весь курс GoJourney!</h2>
                <p>Вы изучили путь от "Hello, World" до архитектуры микросервисов. Вы готовы к работе Go-разработчиком.</p>
                <h3>Что дальше?</h3>
                <ul>
                    <li>🛠️ <strong>Практика</strong> — реализуйте финальный проект из модуля 14</li>
                    <li>📖 <strong>Углубляйтесь</strong> — Go spec, исходники stdlib, книги</li>
                    <li>🤝 <strong>Комьюнити</strong> — Go Discord, r/golang, GopherSlack</li>
                    <li>📦 <strong>Open Source</strong> — контрибьютьте в Go проекты</li>
                    <li>💼 <strong>Собеседования</strong> — LeetCode на Go, system design</li>
                </ul>
                <p><strong>Go is awesome. You are awesome. 🚀</strong></p>
            `
        }
    ]
};
