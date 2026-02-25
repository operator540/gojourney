export default {
    id: '11-06',
    title: 'Raw SQL vs ORM',
    description: 'Когда использовать чистый SQL, db.Raw, db.Exec, sql.Builder',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>За пределами ORM</h2>
                <p>Иногда ORM становится узким местом (сложные отчеты, Window functions, CTE, массовые вставки с логикой).</p>
                <p>В GORM можно легко спуститься на уровень SQL.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Raw SQL',
            code: `type Result struct {
  Name string
  Age  int
}

var result Result

// Raw query (сканирование в структуру)
db.Raw("SELECT name, age FROM users WHERE name = ?", "jinzhu").Scan(&result)

// Exec (без возврата строк)
db.Exec("DROP TABLE users")

// Pluck (выборка одной колонки в слайс)
var ages []int
db.Model(&User{}).Pluck("age", &ages)`,
            explanation: 'db.Raw() возвращает *gorm.DB, можно чейнить методы. Scan() работает так же, как в database/sql, но умеет мапить в структуры.'
        },
        {
            type: 'theory',
            content: `
                <h2>DryRun Mode</h2>
                <p>Полезно для генерации SQL без выполнения запроса (например, для тестов).</p>
                <pre><code class="language-go">stmt := db.Session(&gorm.Session{DryRun: true}).First(&user, 1).Statement
fmt.Println(stmt.SQL.String()) 
// SELECT * FROM users WHERE id = $1 ...</code></pre>
            `
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p><strong>Named Arguments:</strong> GORM поддерживает именованные аргументы через <code>sql.Named</code> или map.</p><pre><code>db.Where("name1 = @name OR name2 = @name", sql.Named("name", "jinzhu")).Find(&user)</code></pre>'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что делает db.Exec()?',
                    options: [
                        'Выполняет запрос и возвращает результат',
                        'Выполняет запрос без возврата строк (например, DELETE)',
                        'Только компилирует запрос',
                        'Запускает миграцию'
                    ],
                    correct: 1,
                    explanation: 'Аналог database/sql Exec(). Используется для команд, не возвращающих данные.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Зачем нужен DryRun режим?',
                    options: [
                        'Для запуска на продакшене',
                        'Для генерации SQL без выполнения (отладка, тесты)',
                        'Для ускорения запросов',
                        'Для работы без соединения с БД'
                    ],
                    correct: 1,
                    explanation: 'DryRun позволяет получить сгенерированный SQL, чтобы проверить его корректность или использовать где-то еще.'
                }
            ]
        }
    ]
};
