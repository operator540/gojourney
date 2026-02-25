export default {
    id: '10-03',
    title: 'Пакет database/sql',
    description: 'sql.Open, пул соединений, Query/QueryRow/Exec, Scan, подготовленные запросы — полный арсенал Go разработчика для работы с БД',
    estimatedTime: 35,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Пул соединений — это парковка для машин</h2>
                <p>Представьте парковку у офиса на 10 мест. Каждое утро 50 сотрудников приезжают на работу. Без парковки каждый ищет место с нуля — хаос. С парковкой: приехал, занял место, поработал, освободил. Следующий занял освободившееся место.</p>
                <p><strong>Пул соединений работает точно так же.</strong> Создание TCP-соединения с PostgreSQL дорого: TLS-рукопожатие, аутентификация, выделение памяти — это ~5-10 мс. Если каждый HTTP запрос создаёт своё соединение и рвёт его — система умрёт под нагрузкой.</p>
                <p>Пул держит <em>N открытых соединений</em>. Горутина берёт свободное, выполняет запрос, возвращает обратно. Соединение переиспользуется. Именно этим занимается <code>*sql.DB</code> в Go.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Метод db.*</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Когда использовать</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Возвращает</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>db.QueryRow()</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">SELECT ровно одной строки</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>*sql.Row</code></td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>db.Query()</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">SELECT нескольких строк</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>*sql.Rows, error</code></td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>db.Exec()</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">INSERT / UPDATE / DELETE</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>sql.Result, error</code></td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>db.Prepare()</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Повторяющиеся запросы</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>*sql.Stmt, error</code></td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Подключение и настройка пула соединений',
            code: `package main

import (
    "database/sql"
    "fmt"
    "log"
    "time"

    _ "github.com/jackc/pgx/v5/stdlib" // pgx как драйвер для database/sql
)

func NewDB(dsn string) (*sql.DB, error) {
    // sql.Open НЕ открывает соединение сразу — только инициализирует структуру
    db, err := sql.Open("pgx", dsn)
    if err != nil {
        return nil, fmt.Errorf("sql.Open: %w", err)
    }

    // Проверяем реальное соединение
    if err := db.Ping(); err != nil {
        return nil, fmt.Errorf("db.Ping: %w", err)
    }

    // Настройка пула — ОБЯЗАТЕЛЬНО для продакшена
    db.SetMaxOpenConns(25)        // Макс. открытых соединений (размер парковки)
    db.SetMaxIdleConns(10)        // Макс. "ждущих" соединений (резерв на парковке)
    db.SetConnMaxLifetime(5 * time.Minute)  // Соединение живёт 5 минут
    db.SetConnMaxIdleTime(1 * time.Minute)  // Idle соединение живёт 1 минуту

    return db, nil
}

func main() {
    dsn := "host=localhost port=5432 user=appuser password=secret dbname=myapp sslmode=disable"
    db, err := NewDB(dsn)
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // db создаётся ОДИН РАЗ и передаётся по всему приложению
    // *sql.DB полностью потокобезопасен
    fmt.Println("Connected! Pool stats:", db.Stats())
}`,
            explanation: 'SetMaxOpenConns(25) — не больше 25 соединений одновременно. Если 25 заняты, следующая горутина ждёт. SetMaxIdleConns(10) — держим 10 соединений открытыми постоянно, чтобы не тратить время на переподключение. SetConnMaxLifetime — защита от "зависших" соединений и проблем с файрволами.'
        },
        {
            type: 'theory',
            content: `
                <h2>QueryRow и Query — читаем данные</h2>
                <p>Два метода для SELECT-запросов. Разница: QueryRow когда точно одна строка (по ID, по уникальному полю). Query — когда строк может быть много.</p>
                <p>Оба используют <strong>плейсхолдеры</strong> вместо прямой подстановки значений. PostgreSQL использует <code>$1, $2, ...</code> — это защита от SQL-инъекций. Значения никогда не интерполируются в строку запроса, они передаются отдельно.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Ситуация</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Метод</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Ошибка "нет строк"</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Поиск по ID</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>QueryRow + Scan</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>sql.ErrNoRows</code></td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;">Список пользователей</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>Query + rows.Next</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Пустой слайс, нет ошибки</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Подсчёт COUNT</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>QueryRow + Scan</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Никогда (COUNT всегда возвращает строку)</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'QueryRow — одна строка, и Query — много строк',
            code: `package main

import (
    "database/sql"
    "fmt"
    "log"
)

type User struct {
    ID        int
    Name      string
    Email     string
    Age       int
    IsActive  bool
}

// GetUserByID — получить одного пользователя
func GetUserByID(db *sql.DB, id int) (*User, error) {
    var u User
    err := db.QueryRow(
        "SELECT id, name, email, age, is_active FROM users WHERE id = $1",
        id,
    ).Scan(&u.ID, &u.Name, &u.Email, &u.Age, &u.IsActive)

    if err == sql.ErrNoRows {
        return nil, nil // Не ошибка — просто не нашли
    }
    if err != nil {
        return nil, fmt.Errorf("GetUserByID: %w", err)
    }
    return &u, nil
}

// ListActiveUsers — список активных пользователей с фильтром по возрасту
func ListActiveUsers(db *sql.DB, minAge int) ([]User, error) {
    rows, err := db.Query(
        "SELECT id, name, email, age, is_active FROM users WHERE is_active = true AND age >= $1 ORDER BY name",
        minAge,
    )
    if err != nil {
        return nil, fmt.Errorf("Query: %w", err)
    }
    defer rows.Close() // ОБЯЗАТЕЛЬНО — освобождает соединение в пул

    var users []User
    for rows.Next() {
        var u User
        if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Age, &u.IsActive); err != nil {
            return nil, fmt.Errorf("Scan: %w", err)
        }
        users = append(users, u)
    }

    // Проверка ошибок после итерации (сетевые ошибки и т.д.)
    if err := rows.Err(); err != nil {
        return nil, fmt.Errorf("rows.Err: %w", err)
    }

    return users, nil
}

// CountUsers — COUNT запрос
func CountUsers(db *sql.DB) (int, error) {
    var count int
    err := db.QueryRow("SELECT COUNT(*) FROM users WHERE is_active = true").Scan(&count)
    return count, err
}`,
            explanation: 'defer rows.Close() критически важен. Если не закрыть — соединение не вернётся в пул, и при большой нагрузке все соединения окажутся "захвачены". rows.Err() проверяет ошибки, возникшие во время итерации (например, потеря соединения на середине чтения большого результата).'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Exec — INSERT, UPDATE, DELETE и работа с NULL',
            code: `package main

import (
    "database/sql"
    "fmt"
)

// CreateUser — вставка с RETURNING для получения ID
func CreateUser(db *sql.DB, name, email string, age int) (int, error) {
    var id int
    err := db.QueryRow(
        "INSERT INTO users (name, email, age, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id",
        name, email, age,
    ).Scan(&id)
    if err != nil {
        return 0, fmt.Errorf("CreateUser: %w", err)
    }
    return id, nil
}

// UpdateUserAge — UPDATE, проверяем сколько строк затронуто
func UpdateUserAge(db *sql.DB, userID, newAge int) error {
    result, err := db.Exec(
        "UPDATE users SET age = $1, updated_at = NOW() WHERE id = $2",
        newAge, userID,
    )
    if err != nil {
        return fmt.Errorf("UpdateUserAge: %w", err)
    }

    rowsAffected, err := result.RowsAffected()
    if err != nil {
        return err
    }
    if rowsAffected == 0 {
        return fmt.Errorf("user %d not found", userID)
    }
    return nil
}

// Работа с NULL значениями
type UserProfile struct {
    ID       int
    Name     string
    Bio      sql.NullString   // Может быть NULL в БД
    Age      sql.NullInt64    // Может быть NULL
    Rating   sql.NullFloat64  // Может быть NULL
}

func GetProfile(db *sql.DB, id int) (*UserProfile, error) {
    var p UserProfile
    err := db.QueryRow(
        "SELECT id, name, bio, age, rating FROM user_profiles WHERE id = $1", id,
    ).Scan(&p.ID, &p.Name, &p.Bio, &p.Age, &p.Rating)

    if err != nil {
        return nil, err
    }

    // Используем .Valid для проверки
    if p.Bio.Valid {
        fmt.Println("Bio:", p.Bio.String)
    } else {
        fmt.Println("Bio: не заполнено")
    }

    return &p, nil
}`,
            explanation: 'RETURNING id — фича PostgreSQL: получить ID только что вставленной строки без лишнего SELECT. sql.NullString, sql.NullInt64 — специальные типы для NULL. Если использовать обычный string для NULL-столбца — Scan вернёт ошибку.'
        },
        {
            type: 'theory',
            content: `
                <h2>Подготовленные запросы (Prepared Statements)</h2>
                <p>Обычный запрос: каждый раз отправляем полный SQL в PostgreSQL, он парсит, строит план, выполняет. Если запрос выполняется 10000 раз с разными параметрами — 10000 раз парсинг.</p>
                <p>Подготовленный запрос: отправляем SQL один раз → PostgreSQL парсит и сохраняет план → потом только шлём параметры. Экономия на парсинге и планировании.</p>
                <p>Когда использовать <code>db.Prepare</code>:</p>
                <ul>
                    <li>Один запрос выполняется тысячи раз (bulk insert, батч-обновления)</li>
                    <li>Хотите явно контролировать жизненный цикл подготовленного запроса</li>
                    <li>Микросекунды важны (high-frequency trading, игровые серверы)</li>
                </ul>

                <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Подход</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Накладные расходы</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Когда</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>db.Query/Exec</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Парсинг при каждом вызове</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Большинство случаев</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>db.Prepare → stmt.Query</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Парсинг один раз</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Высокочастотные повторные запросы</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Prepared Statements — bulk insert пример',
            code: `package main

import (
    "database/sql"
    "fmt"
    "log"
)

type EventLog struct {
    UserID    int
    EventType string
    Payload   string
}

// BulkInsertEvents — вставка тысяч событий эффективно
func BulkInsertEvents(db *sql.DB, events []EventLog) error {
    // Подготавливаем запрос один раз
    stmt, err := db.Prepare(
        "INSERT INTO event_logs (user_id, event_type, payload, created_at) VALUES ($1, $2, $3, NOW())",
    )
    if err != nil {
        return fmt.Errorf("Prepare: %w", err)
    }
    defer stmt.Close() // Тоже нужно закрывать!

    // Вставляем каждое событие — SQL парсится только один раз выше
    for _, e := range events {
        _, err := stmt.Exec(e.UserID, e.EventType, e.Payload)
        if err != nil {
            return fmt.Errorf("stmt.Exec userID=%d: %w", e.UserID, err)
        }
    }

    log.Printf("Inserted %d events", len(events))
    return nil
}

// Пример с QueryRow на подготовленном запросе
func main() {
    // dsn := "..."
    // db, _ := sql.Open("pgx", dsn)

    // Подготовленный SELECT
    // stmt, _ := db.Prepare("SELECT name FROM users WHERE id = $1")
    // defer stmt.Close()
    //
    // for _, id := range []int{1, 2, 3, 100, 200} {
    //     var name string
    //     stmt.QueryRow(id).Scan(&name)
    //     fmt.Println(name)
    // }

    fmt.Println("Prepared statements — parse once, execute many")
}`,
            explanation: 'stmt.Close() освобождает ресурсы на сервере PostgreSQL. Используйте defer. Подготовленные запросы привязаны к конкретному соединению в пуле — database/sql умеет это обрабатывать автоматически, переподготавливая на другом соединении если нужно.'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<p><strong>Антипаттерн: создание *sql.DB внутри обработчика</strong></p>
            <pre style="margin:8px 0;"><code>// ПЛОХО — создаёт новое соединение на каждый HTTP запрос
func handler(w http.ResponseWriter, r *http.Request) {
    db, _ := sql.Open("pgx", dsn) // Новое соединение!
    defer db.Close()
    // ...
}</code></pre>
            <p><strong>Правильно:</strong> создать <code>*sql.DB</code> один раз при старте приложения и передавать его через dependency injection (в конструктор обработчика, в структуру сервиса).</p>`
        },
        {
            type: 'editor',
            title: 'Практика: Репозиторий продуктов',
            instructions: 'Реализуйте функцию GetProductsByCategory. Она должна: получить все продукты по category_id с ценой выше minPrice, отсортировать по price ASC, вернуть слайс Product. Таблица products: id, name, price, category_id, stock.',
            starterCode: `package main

import (
    "database/sql"
    "fmt"
)

type Product struct {
    ID         int
    Name       string
    Price      float64
    CategoryID int
    Stock      int
}

func GetProductsByCategory(db *sql.DB, categoryID int, minPrice float64) ([]Product, error) {
    // 1. Выполните Query с двумя плейсхолдерами $1 и $2
    // SQL: SELECT id, name, price, category_id, stock FROM products
    //      WHERE category_id = $1 AND price > $2 ORDER BY price ASC

    // 2. defer rows.Close()

    // 3. Цикл rows.Next() со Scan в Product

    // 4. rows.Err()

    return nil, fmt.Errorf("not implemented")
}`,
            hints: [
                'rows, err := db.Query("SELECT id, name, price, category_id, stock FROM products WHERE category_id = $1 AND price > $2 ORDER BY price ASC", categoryID, minPrice)',
                'if err != nil { return nil, err } — обрабатывайте ошибку сразу после Query',
                'defer rows.Close() — сразу после проверки ошибки',
                'for rows.Next() { var p Product; rows.Scan(&p.ID, &p.Name, &p.Price, &p.CategoryID, &p.Stock); products = append(products, p) }',
                'В конце: if err := rows.Err(); err != nil { return nil, err }'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что произойдёт если не вызвать rows.Close() после db.Query()?',
                    options: [
                        'Ничего страшного, GC сам закроет',
                        'Соединение не вернётся в пул — утечка соединений под нагрузкой',
                        'Запрос выполнится повторно',
                        'Вернётся ошибка sql.ErrConnDone'
                    ],
                    correct: 1,
                    explanation: 'Rows удерживает соединение из пула. Без Close() это соединение никогда не освободится. При 25 параллельных запросах все 25 соединений окажутся заняты и приложение встанет.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Какую ошибку вернёт QueryRow().Scan() если строка не найдена?',
                    options: [
                        'io.EOF',
                        'nil (ошибки нет)',
                        'sql.ErrNoRows',
                        'sql.ErrConnDone'
                    ],
                    correct: 2,
                    explanation: 'sql.ErrNoRows — стандартная ошибка "запись не найдена". Часто нужно её обрабатывать отдельно: возвращать 404, nil или кастомную ошибку, а не логировать как критическую.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Зачем нужны плейсхолдеры $1, $2 вместо fmt.Sprintf?',
                    options: [
                        'Красивее выглядят',
                        'Ускоряют запрос',
                        'Защита от SQL-инъекций + повторное использование плана запроса',
                        'Требование стандарта Go'
                    ],
                    correct: 2,
                    explanation: 'fmt.Sprintf("WHERE id = %d", userInput) — уязвимость. Если userInput = "1 OR 1=1" — катастрофа. Плейсхолдеры передают значения отдельно от SQL, PostgreSQL никогда не интерпретирует их как код.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'db.SetMaxOpenConns(25) — что это означает?',
                    options: [
                        'Максимум 25 горутин могут использовать db',
                        'Максимум 25 одновременных TCP-соединений с PostgreSQL',
                        'Максимум 25 запросов в секунду',
                        'Размер буфера результата'
                    ],
                    correct: 1,
                    explanation: 'Это размер "парковки". При 26-м параллельном запросе горутина будет ждать освобождения слота. Слишком мало — очереди. Слишком много — перегрузка PostgreSQL (у него тоже есть лимит).'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Чем отличается db.Exec от db.Query?',
                    options: [
                        'Exec только для DELETE, Query только для SELECT',
                        'Exec не возвращает строки данных, Query возвращает *sql.Rows',
                        'Exec быстрее Query',
                        'Нет разницы, взаимозаменяемы'
                    ],
                    correct: 1,
                    explanation: 'Exec возвращает sql.Result (количество затронутых строк, последний ID) — используется для INSERT/UPDATE/DELETE. Query возвращает итератор по строкам — для SELECT.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Зачем проверять rows.Err() после цикла rows.Next()?',
                    options: [
                        'Это необязательно, просто хорошая практика',
                        'Чтобы поймать ошибки возникшие ВО ВРЕМЯ итерации (сетевой разрыв и т.д.)',
                        'rows.Next() автоматически паникует при ошибке',
                        'Чтобы закрыть соединение'
                    ],
                    correct: 1,
                    explanation: 'rows.Next() при ошибке возвращает false и завершает цикл. Сама ошибка хранится внутри и доступна через rows.Err(). Без этой проверки вы получите молчаливо обрезанный результат.'
                },
                {
                    id: 'q7',
                    type: 'code-fill',
                    question: 'Заполните пропуск: получить пользователя по email, обработать случай "не найден".',
                    code: 'err := db.QueryRow("SELECT id FROM users WHERE email=$1", email).Scan(&id)\nif err == ___ { return 0, ErrNotFound }',
                    answer: 'sql.ErrNoRows',
                    explanation: 'sql.ErrNoRows — sentinel error из пакета database/sql. Сравниваем через == (не errors.Is, хотя тоже работает).'
                },
                {
                    id: 'q8',
                    type: 'multiple',
                    question: 'Какие утверждения про *sql.DB верны?',
                    options: [
                        'Потокобезопасен, можно использовать из нескольких горутин',
                        'Нужно создавать новый экземпляр для каждого HTTP запроса',
                        'sql.Open не устанавливает соединение немедленно',
                        'db.Ping() проверяет реальное соединение с сервером',
                        'Нужен мьютекс для защиты от гонок'
                    ],
                    correct: [0, 2, 3],
                    explanation: '*sql.DB — singleton для всего приложения. Потокобезопасен по дизайну. sql.Open ленивый — соединение по Ping или первому запросу.'
                }
            ]
        }
    ]
};
