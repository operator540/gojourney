export default {
    id: '10-07',
    title: 'Итоговый квиз: SQL и PostgreSQL',
    description: 'Проверка знаний по модулю SQL и PostgreSQL',
    estimatedTime: 15,
    xpReward: 50,

    sections: [
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Какой метод используется для выполнения INSERT запроса в database/sql?',
                    options: [
                        'row.Scan()',
                        'db.Query()',
                        'db.Exec()',
                        'db.Select()'
                    ],
                    correct: 2,
                    explanation: 'db.Exec() используется для запросов, которые не возвращают строки (INSERT, UPDATE, DELETE).'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что нужно сделать с объектом Rows после получения?',
                    options: [
                        'Ничего',
                        'Вызвать rows.Delete()',
                        'Вызвать defer rows.Close()',
                        'Вызвать rows.Commit()'
                    ],
                    correct: 2,
                    explanation: 'Обязательно нужно закрывать rows, чтобы освободить соединение в пуле. Defer — лучший способ сделать это.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'В чем преимущество использования плейсхолдеров (например, $1)?',
                    options: [
                        'Ускоряет написание кода',
                        'Защищает от SQL-инъекций',
                        'Позволяет использовать переменные в именах таблиц',
                        'Красиво выглядит'
                    ],
                    correct: 1,
                    explanation: 'Плейсхолдеры экранируют входные данные, предотвращая внедрение вредоносного SQL кода.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Какой тип хранения данных в Postgres позволяет эффективно работать с документами?',
                    options: [
                        'VARCHAR',
                        'TEXT',
                        'JSONB',
                        'XML'
                    ],
                    correct: 2,
                    explanation: 'JSONB — Binary JSON, оптимизированный для производительности и индексации.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Что гарантирует паника или ошибка внутри функции с defer tx.Rollback()?',
                    options: [
                        'Что база данных упадет',
                        'Что транзакция будет зафиксирована',
                        'Что изменения транзакции будут отменены',
                        'Ничего не гарантирует'
                    ],
                    correct: 2,
                    explanation: 'defer tx.Rollback() сработает при выходе из функции (даже при панике), отменяя незафиксированные изменения.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Как называется инструмент для версионирования схемы БД?',
                    options: [
                        'Компилятор',
                        'Транспилятор',
                        'Мигратор',
                        'Репликатор'
                    ],
                    correct: 2,
                    explanation: 'Инструменты миграции (миграторы) управляют версиями схемы БД.'
                }
            ]
        }
    ]
};
