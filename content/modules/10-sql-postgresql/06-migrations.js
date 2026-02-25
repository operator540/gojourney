export default {
    id: '10-06',
    title: 'Миграции',
    description: 'Управление схемой БД, инструмент golang-migrate',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Зачем нужны миграции?</h2>
                <p>Миграции — это система контроля версий для схемы вашей базы данных. Они позволяют:</p>
                <ul>
                    <li>Воспроизводить структуру БД на любом сервере.</li>
                    <li>Откатывать изменения при ошибках.</li>
                    <li>Работать в команде, не ломая друг другу БД.</li>
                </ul>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>golang-migrate</h2>
                <p>Популярная утилита и библиотека для миграций. Создает пары файлов: <code>up</code> (применение) и <code>down</code> (откат).</p>
                <p>Формат имен: <code>{version}_{title}.up.sql</code> и <code>{version}_{title}.down.sql</code>.</p>
            `
        },
        {
            type: 'code-example',
            language: 'sql',
            title: '000001_create_users_table.up.sql',
            code: `CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);`,
            explanation: 'SQL код для создания таблицы.'
        },
        {
            type: 'code-example',
            language: 'sql',
            title: '000001_create_users_table.down.sql',
            code: `DROP TABLE IF EXISTS users;`,
            explanation: 'SQL код для удаления таблицы (отката).'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Запуск миграций из Go',
            code: `import (
    "github.com/golang-migrate/migrate/v4"
    _ "github.com/golang-migrate/migrate/v4/database/postgres"
    _ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
    m, err := migrate.New(
        "file://migrations",
        "postgres://user:pass@localhost:5432/dbname?sslmode=disable",
    )
    if err != nil {
        log.Fatal(err)
    }
    
    // Применить все миграции
    if err := m.Up(); err != nil && err != migrate.ErrNoChange {
        log.Fatal(err)
    }
}`,
            explanation: 'Миграции можно запускать как CLI утилитой, так и программно при старте приложения.'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что содержит файл *.down.sql?',
                    options: [
                        'Логи ошибок',
                        'Инструкции для отката изменений',
                        'Резервную копию данных',
                        'Настройки подключения'
                    ],
                    correct: 1,
                    explanation: 'Down миграция должна выполнять действия, обратные Up миграции (например, DROP TABLE вместо CREATE TABLE).'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Нужно ли коммитить файлы миграций в Git?',
                    options: [
                        'Да, обязательно',
                        'Нет, они локальные',
                        'Только up файлы',
                        'Только down файлы'
                    ],
                    correct: 0,
                    explanation: 'Миграции — это часть исходного кода проекта. Они должны быть в репозитории.'
                }
            ]
        }
    ]
};
