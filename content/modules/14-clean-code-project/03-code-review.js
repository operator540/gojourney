export default {
    id: '14-03',
    title: 'Code Review',
    description: 'Code review как второй пилот в самолёте — не потому что первый плохой, а потому что четыре глаза лучше двух. Учимся проверять код системно и давать конструктивный фидбек.',
    estimatedTime: 35,
    xpReward: 28,
    sections: [
        {
            type: 'theory',
            title: 'Зачем нужен code review',
            content: `
<h2>Второй пилот не потому что первый плохой</h2>
<p>В авиации второй пилот существует не потому, что первый некомпетентен. Это системная защита от человеческих ошибок. Даже опытные пилоты пропускают чеклисты под давлением, усталостью, привычкой.</p>
<p>Code review работает так же. Автор кода слеп к своим ошибкам — он знает что хотел написать и читает то, что хотел, а не то, что написал. Второй человек читает то, что есть.</p>

<div class="info-box">
    <strong>Статистика:</strong> По данным исследований, code review находит до 60% дефектов до попадания в production. Каждый час code review экономит 4-6 часов на исправление багов в production.
</div>

<h3>Что даёт code review</h3>
<ul>
    <li><strong>Находит баги</strong> — особенно edge cases и race conditions</li>
    <li><strong>Распространяет знания</strong> — вся команда понимает кодовую базу</li>
    <li><strong>Выравнивает стиль</strong> — код становится единообразным</li>
    <li><strong>Онбординг</strong> — новички быстрее учатся у опытных</li>
    <li><strong>Архитектурный контроль</strong> — предотвращает технический долг</li>
    <li><strong>Безопасность</strong> — второй взгляд на SQL, аутентификацию, данные</li>
</ul>

<h3>Мифы о code review</h3>
<ul>
    <li>❌ "Code review замедляет разработку" — нет, он ускоряет на дистанции</li>
    <li>❌ "Только джуны нуждаются в review" — все, включая лидов</li>
    <li>❌ "Автоматика заменит review" — линтеры находят ~20% проблем</li>
    <li>❌ "Review — это критика человека" — это анализ кода, не личности</li>
</ul>
`
        },
        {
            type: 'theory',
            title: 'Что проверять: чеклист для Go',
            content: `
<h2>Системный подход к проверке кода</h2>
<p>Хаотичный review неэффективен. Профессионал идёт по чеклисту — как пилот перед взлётом.</p>

<h3>Приоритет 1: Корректность</h3>
<table style="width:100%; border-collapse: collapse; margin: 16px 0;">
    <tr style="background: var(--surface-2);">
        <th style="padding: 10px; border: 1px solid var(--border);">Категория</th>
        <th style="padding: 10px; border: 1px solid var(--border);">Что проверять</th>
    </tr>
    <tr>
        <td style="padding: 10px; border: 1px solid var(--border);"><strong>Логика</strong></td>
        <td style="padding: 10px; border: 1px solid var(--border);">Off-by-one ошибки, граничные условия, nil pointer, переполнение int</td>
    </tr>
    <tr style="background: var(--surface-2);">
        <td style="padding: 10px; border: 1px solid var(--border);"><strong>Конкурентность</strong></td>
        <td style="padding: 10px; border: 1px solid var(--border);">Race conditions, deadlocks, правильное использование mutex/channel</td>
    </tr>
    <tr>
        <td style="padding: 10px; border: 1px solid var(--border);"><strong>Ошибки</strong></td>
        <td style="padding: 10px; border: 1px solid var(--border);">Все ошибки обработаны, нет игнорирования через _, нет голых panic</td>
    </tr>
    <tr style="background: var(--surface-2);">
        <td style="padding: 10px; border: 1px solid var(--border);"><strong>Ресурсы</strong></td>
        <td style="padding: 10px; border: 1px solid var(--border);">defer Close() для файлов/соединений, утечки goroutine</td>
    </tr>
</table>

<h3>Приоритет 2: Безопасность</h3>
<ul>
    <li>Входные данные валидируются перед использованием</li>
    <li>SQL запросы через параметры, не конкатенацию строк</li>
    <li>Секреты не в коде (только через env/vault)</li>
    <li>Правильная аутентификация и авторизация</li>
    <li>Чувствительные данные не логируются</li>
</ul>

<h3>Приоритет 3: Производительность</h3>
<ul>
    <li>N+1 запросы к БД</li>
    <li>Ненужные аллокации в горячем пути</li>
    <li>Отсутствие индексов для часто используемых запросов</li>
    <li>Бесконечные циклы или O(n²) алгоритмы там где можно O(n)</li>
</ul>

<h3>Приоритет 4: Читаемость и стиль</h3>
<ul>
    <li>Имена следуют конвенциям Go</li>
    <li>Функции не длиннее 50-80 строк</li>
    <li>Комментарии для экспортируемых символов</li>
    <li>Тесты для новой функциональности</li>
    <li>gofmt, golangci-lint пройдены</li>
</ul>

<div class="info-box">
    <strong>Важно:</strong> Проверяй в порядке приоритета. Находить опечатки в коде с race condition — неправильная расстановка приоритетов. Сначала корректность, потом стиль.
</div>
`
        },
        {
            type: 'code-example',
            title: 'Типичные проблемы в Go: что искать при review',
            code: `package main

import (
    "database/sql"
    "fmt"
    "net/http"
    "sync"
)

// ❌ ПРОБЛЕМА 1: Игнорирование ошибки
func badReadFile(path string) []byte {
    data, _ := os.ReadFile(path) // _ игнорирует ошибку — ОПАСНО
    return data
}

// ❌ ПРОБЛЕМА 2: Утечка ресурса (нет defer Close)
func badDBQuery(db *sql.DB) {
    rows, err := db.Query("SELECT * FROM users")
    if err != nil {
        return
    }
    // rows.Close() НИКОГДА не вызывается если возникнет panic ниже
    for rows.Next() {
        // обработка...
    }
    rows.Close() // должно быть defer сразу после проверки err
}

// ❌ ПРОБЛЕМА 3: Race condition
type BadCounter struct {
    count int // нет mutex!
}

func (c *BadCounter) Increment() {
    c.count++ // race condition при конкурентном доступе
}

// ❌ ПРОБЛЕМА 4: SQL инъекция
func badGetUser(db *sql.DB, name string) {
    query := "SELECT * FROM users WHERE name = '" + name + "'" // ОПАСНО!
    db.Query(query)
}

// ❌ ПРОБЛЕМА 5: Nil pointer
func badProcess(user *User) string {
    return user.Name // паника если user == nil
}

// ✓ ИСПРАВЛЕННЫЕ версии

func goodReadFile(path string) ([]byte, error) {
    return os.ReadFile(path) // возвращаем ошибку caller'у
}

func goodDBQuery(db *sql.DB) error {
    rows, err := db.Query("SELECT * FROM users")
    if err != nil {
        return fmt.Errorf("query failed: %w", err)
    }
    defer rows.Close() // гарантированное закрытие

    for rows.Next() {
        // обработка...
    }
    return rows.Err()
}

type GoodCounter struct {
    mu    sync.Mutex
    count int
}

func (c *GoodCounter) Increment() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.count++
}

func goodGetUser(db *sql.DB, name string) {
    db.Query("SELECT * FROM users WHERE name = $1", name) // параметр
}

func goodProcess(user *User) (string, error) {
    if user == nil {
        return "", fmt.Errorf("user is nil")
    }
    return user.Name, nil
}`,
            explanation: 'Пять классических проблем в Go: игнорирование ошибок, утечки ресурсов, race conditions, SQL injection, nil pointer dereference. В code review ищи их в первую очередь.'
        },
        {
            type: 'theory',
            title: 'Инструменты: golangci-lint и автоматизация',
            content: `
<h2>Автоматика освобождает reviewer от рутины</h2>
<p>Не трать время на "ты не отформатировал код" — пусть это делает CI. Reviewer должен думать о логике и архитектуре, а не о пробелах.</p>

<h3>golangci-lint — швейцарский нож</h3>
<p>Запускает десятки линтеров одной командой:</p>

<table style="width:100%; border-collapse: collapse; margin: 16px 0;">
    <tr style="background: var(--surface-2);">
        <th style="padding: 10px; border: 1px solid var(--border);">Линтер</th>
        <th style="padding: 10px; border: 1px solid var(--border);">Что находит</th>
    </tr>
    <tr>
        <td style="padding: 10px; border: 1px solid var(--border);"><code>staticcheck</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);">Статический анализ: недостижимый код, неправильное использование API</td>
    </tr>
    <tr style="background: var(--surface-2);">
        <td style="padding: 10px; border: 1px solid var(--border);"><code>errcheck</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);">Игнорируемые ошибки</td>
    </tr>
    <tr>
        <td style="padding: 10px; border: 1px solid var(--border);"><code>gosec</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);">Проблемы безопасности: SQL injection, слабая криптография</td>
    </tr>
    <tr style="background: var(--surface-2);">
        <td style="padding: 10px; border: 1px solid var(--border);"><code>govet</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);">Подозрительные конструкции, неправильные printf форматы</td>
    </tr>
    <tr>
        <td style="padding: 10px; border: 1px solid var(--border);"><code>revive</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);">Стиль кода, конвенции именования</td>
    </tr>
    <tr style="background: var(--surface-2);">
        <td style="padding: 10px; border: 1px solid var(--border);"><code>exhaustive</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);">Неполные switch по enum</td>
    </tr>
    <tr>
        <td style="padding: 10px; border: 1px solid var(--border);"><code>bodyclose</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);">Незакрытые HTTP response body</td>
    </tr>
</table>

<h3>Минимальный .golangci.yml</h3>
<pre style="background: var(--surface-2); padding: 12px; border-radius: 6px; overflow-x: auto;"><code>linters:
  enable:
    - errcheck
    - staticcheck
    - gosimple
    - govet
    - gosec
    - revive
    - bodyclose
    - exhaustive

linters-settings:
  revive:
    rules:
      - name: exported
      - name: var-naming

run:
  timeout: 5m</code></pre>

<div class="info-box">
    <strong>go tool race:</strong> Запускай тесты с флагом <code>-race</code> для обнаружения race conditions: <code>go test -race ./...</code>. Это обязательно в CI для любого конкурентного кода.
</div>
`
        },
        {
            type: 'code-example',
            title: 'Как давать конструктивный фидбек',
            code: `// CODE REVIEW GUIDE — как писать комментарии

// ❌ ПЛОХОЙ фидбек:
// "Это неправильно"
// "Так не делают"
// "Переписать"
// "WTF?"

// ✓ ХОРОШИЙ фидбек следует принципу: ПРОБЛЕМА → ПОЧЕМУ → РЕШЕНИЕ

// --- Пример 1: Баг ---
// ❌ Плохо: "Здесь баг"
// ✓ Хорошо:
// "Если items пустой срез, len(items)-1 = -1 и items[i] вызовет панику.
// Добавь проверку: if len(items) == 0 { return nil }"

// --- Пример 2: Производительность ---
// ❌ Плохо: "Медленно, переделай"
// ✓ Хорошо:
// "Этот запрос выполняется в цикле — N+1 проблема.
// При 1000 пользователей будет 1001 запрос к БД.
// Реши через JOIN или batch-запрос: SELECT * FROM orders WHERE user_id = ANY($1)"

// --- Пример 3: Стиль ---
// ❌ Плохо: "Имя плохое"
// ✓ Хорошо:
// "По конвенциям Go (Effective Go) аббревиатуры пишутся целиком.
// Переименуй getUserId() → getUserID()"

// --- Уровни комментариев (Google Engineering Practices) ---

// [blocking] — Блокирует merge, обязательно исправить
// Пример: "SQL injection уязвимость, нельзя мержить до исправления"

// [suggestion] — Рекомендация, но не блокирует
// Пример: "Предлагаю вынести эту логику в отдельную функцию для тестируемости"

// [nit] — Мелочь, можно игнорировать
// Пример: "nit: лишний пустой line перед return"

// [question] — Просьба пояснить, не критика
// Пример: "Почему здесь используем int64 а не int? Есть конкретная причина?"

// --- Психология code review ---
// 1. Критикуй КОД, не ЧЕЛОВЕКА
//    ❌ "Ты написал плохой код"
//    ✓ "Этот код можно улучшить так..."
//
// 2. Признавай хорошее
//    "Отличное решение с кешированием, это элегантно"
//
// 3. Предлагай, не приказывай
//    ❌ "Сделай X"
//    ✓ "Что думаешь о подходе X? Это позволит..."
//
// 4. Объясняй ПОЧЕМУ, не только ЧТО
//    Всегда давай контекст: почему это проблема, какой вред

// --- Как реагировать на фидбек ---
// 1. Не принимай близко к сердцу — это про код
// 2. Задавай вопросы если непонятно
// 3. Не спорь в комментариях — созвонитесь
// 4. Благодари за хороший фидбек`,
            explanation: 'Хороший code review комментарий содержит: что не так, почему это проблема, как исправить. Используй уровни: [blocking], [suggestion], [nit], [question]. Критикуй код, а не человека.'
        },
        {
            type: 'theory',
            title: 'Размер PR и процесс review',
            content: `
<h2>Маленькие PR — быстрые и качественные reviews</h2>
<p>PR с 50 строками получит детальный review за 15 минут. PR с 500 строками — поверхностный за час или вообще "LGTM" без реального анализа.</p>

<h3>Рекомендуемые размеры PR</h3>
<table style="width:100%; border-collapse: collapse; margin: 16px 0;">
    <tr style="background: var(--surface-2);">
        <th style="padding: 10px; border: 1px solid var(--border);">Размер</th>
        <th style="padding: 10px; border: 1px solid var(--border);">Строк изменений</th>
        <th style="padding: 10px; border: 1px solid var(--border);">Статус</th>
    </tr>
    <tr>
        <td style="padding: 10px; border: 1px solid var(--border);">Идеальный</td>
        <td style="padding: 10px; border: 1px solid var(--border);">< 200</td>
        <td style="padding: 10px; border: 1px solid var(--border); color: var(--accent);">Легко проверить</td>
    </tr>
    <tr style="background: var(--surface-2);">
        <td style="padding: 10px; border: 1px solid var(--border);">Нормальный</td>
        <td style="padding: 10px; border: 1px solid var(--border);">200–400</td>
        <td style="padding: 10px; border: 1px solid var(--border);">Приемлемо</td>
    </tr>
    <tr>
        <td style="padding: 10px; border: 1px solid var(--border);">Большой</td>
        <td style="padding: 10px; border: 1px solid var(--border);">400–800</td>
        <td style="padding: 10px; border: 1px solid var(--border); color: orange;">Разбить если возможно</td>
    </tr>
    <tr style="background: var(--surface-2);">
        <td style="padding: 10px; border: 1px solid var(--border);">Монстр</td>
        <td style="padding: 10px; border: 1px solid var(--border);">> 800</td>
        <td style="padding: 10px; border: 1px solid var(--border); color: red;">Обязательно разбить</td>
    </tr>
</table>

<h3>Процесс code review</h3>
<ol>
    <li><strong>Автор</strong>: пишет описание PR — что сделано, почему, как тестировать</li>
    <li><strong>CI</strong>: запускает линтеры, тесты, race detector автоматически</li>
    <li><strong>Reviewer</strong>: читает описание → смотрит тесты → смотрит код → оставляет комментарии</li>
    <li><strong>Автор</strong>: отвечает на комментарии, вносит правки</li>
    <li><strong>Reviewer</strong>: проверяет правки, даёт approval</li>
    <li><strong>Merge</strong>: squash или rebase merge в main</li>
</ol>

<h3>SLA на code review</h3>
<ul>
    <li>Reviewer должен откликнуться в течение 1 рабочего дня</li>
    <li>Автор должен ответить на комментарии в течение 1 рабочего дня</li>
    <li>Не мержи без approval (кроме hotfix под давлением времени)</li>
</ul>

<div class="info-box">
    <strong>LGTM (Looks Good To Me)</strong> без единого комментария на 300 строк кода — это не review. Это формальность, которая не защищает от багов. Хороший reviewer обязан задавать вопросы.
</div>
`
        },
        {
            type: 'editor',
            title: 'Практика: найди проблемы в коде',
            description: 'Ты делаешь code review этого Go кода. Добавь комментарии к каждой проблеме в формате: // [уровень] проблема → почему → как исправить',
            initialCode: `package api

import (
    "database/sql"
    "fmt"
    "net/http"
    "sync"
)

// UserHandler обрабатывает запросы пользователей
type UserHandler struct {
    db *sql.DB
    mu sync.Mutex
    cache map[string]User
}

func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
    name := r.URL.Query().Get("name")
    
    // Поиск в кеше
    h.mu.Lock()
    if user, ok := h.cache[name]; ok {
        h.mu.Unlock()
        fmt.Fprintf(w, "%v", user)
        return
    }
    
    // Запрос к БД
    query := "SELECT * FROM users WHERE name = '" + name + "'"
    rows, _ := h.db.Query(query)
    
    var user User
    for rows.Next() {
        rows.Scan(&user.ID, &user.Name, &user.Password)
    }
    
    h.cache[name] = user
    h.mu.Unlock()
    
    password := user.Password
    fmt.Fprintf(w, "User: %s, Pass: %s", user.Name, password)
}`,
            solution: `package api

import (
    "database/sql"
    "encoding/json"
    "fmt"
    "net/http"
    "sync"
)

type UserHandler struct {
    db    *sql.DB
    mu    sync.RWMutex // [suggestion] RWMutex для чтения эффективнее
    cache map[string]User
}

func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
    name := r.URL.Query().Get("name")

    // [suggestion] Валидация входных данных
    if name == "" {
        http.Error(w, "name is required", http.StatusBadRequest)
        return
    }

    // [suggestion] RLock для чтения
    h.mu.RLock()
    if user, ok := h.cache[name]; ok {
        h.mu.RUnlock()
        json.NewEncoder(w).Encode(user) // [nit] используй JSON
        return
    }
    h.mu.RUnlock()

    // [blocking] параметризованный запрос вместо конкатенации
    rows, err := h.db.Query("SELECT id, name FROM users WHERE name = $1", name)
    if err != nil {
        http.Error(w, "db error", http.StatusInternalServerError)
        return
    }
    defer rows.Close() // [blocking] всегда defer Close

    var user User
    for rows.Next() {
        // [blocking] не выбирай password и не логируй его
        if err := rows.Scan(&user.ID, &user.Name); err != nil {
            http.Error(w, "scan error", http.StatusInternalServerError)
            return
        }
    }

    h.mu.Lock()
    h.cache[name] = user
    h.mu.Unlock()

    json.NewEncoder(w).Encode(user)
}`,
            hints: [
                '[blocking] SQL инъекция: конкатенация строк в запросе. Используй параметры $1',
                '[blocking] Ошибка игнорируется: rows, _ := — всегда проверяй ошибки',
                '[blocking] Утечка ресурса: нет defer rows.Close()',
                '[blocking] Пароль логируется в ответ: fmt.Fprintf(..., "Pass: %s", password)',
                '[suggestion] sync.RWMutex эффективнее для read-heavy кеша',
                '[suggestion] Нет валидации входных данных (пустой name)',
                '[nit] Используй json.NewEncoder вместо fmt.Fprintf для структур',
            ]
        },
        {
            type: 'quiz',
            title: 'Проверь знания: code review',
            questions: [
                {
                    type: 'single',
                    question: 'Какая проблема имеет наивысший приоритет при code review?',
                    options: [
                        'Несоответствие стилю кода',
                        'SQL injection уязвимость',
                        'Лишний пустой line',
                        'Отсутствие комментария к функции'
                    ],
                    correct: 1,
                    explanation: 'Безопасность — высший приоритет. SQL injection позволяет атаковать базу данных. Стиль и пустые строки — это nit-уровень, они никогда не должны блокировать merge ради них самих.'
                },
                {
                    type: 'multiple',
                    question: 'Что golangci-lint НЕ может найти автоматически? (выбери все верные)',
                    options: [
                        'Неправильную бизнес-логику',
                        'Игнорируемые ошибки (errcheck)',
                        'Race conditions в логике приложения',
                        'Неправильные имена переменных (нарушение стиля)',
                        'Архитектурные проблемы',
                        'Незакрытые HTTP response body'
                    ],
                    correct: [0, 2, 4],
                    explanation: 'Линтеры находят технические паттерны, но не понимают бизнес-логику, сложные race conditions в алгоритмах и архитектурные решения. Это задача человека.'
                },
                {
                    type: 'single',
                    question: 'Что такое N+1 проблема в контексте code review?',
                    options: [
                        'Когда в PR на 1 строку кода нужен 1 reviewer',
                        'Когда в цикле по N элементам выполняется N отдельных запросов к БД',
                        'Когда функция имеет N+1 параметров',
                        'Когда тест имеет N+1 assertions'
                    ],
                    correct: 1,
                    explanation: 'N+1 — классическая проблема производительности: для N объектов делается N отдельных запросов к БД вместо одного batch-запроса. Например, загрузка 100 пользователей и потом 100 отдельных запросов для их заказов.'
                },
                {
                    type: 'single',
                    question: 'Какой комментарий в code review лучше?',
                    options: [
                        '"Здесь баг, исправь"',
                        '"Не нравится этот код"',
                        '"[blocking] rows.Close() не вызывается при панике. Используй defer rows.Close() сразу после проверки err — это гарантирует закрытие соединения в любом случае"',
                        '"Так не делают в Go"'
                    ],
                    correct: 2,
                    explanation: 'Хороший комментарий: уровень + конкретная проблема + почему это проблема + как исправить. Остальные варианты не дают информации для исправления.'
                },
                {
                    type: 'single',
                    question: 'Почему важно запускать тесты с флагом -race в CI?',
                    options: [
                        'Тесты работают быстрее',
                        'Флаг -race находит race conditions которые не всегда воспроизводятся при обычном запуске',
                        'Это обязательно для компиляции',
                        'Без -race тесты не покрывают goroutines'
                    ],
                    correct: 1,
                    explanation: 'Race conditions — непредсказуемы. Они могут не проявляться при обычных тестах, но детектор гонок инструментирует код и находит конкурентный доступ к памяти даже если он не привёл к ошибке в конкретном запуске.'
                },
                {
                    type: 'single',
                    question: 'Какой идеальный размер PR для качественного code review?',
                    options: [
                        'Как можно больше — reviewer видит всю картину',
                        'Ровно 100 строк',
                        'До 200 строк изменений',
                        'Размер не важен'
                    ],
                    correct: 2,
                    explanation: 'PR до 200 строк получают детальный review. Большие PR теряют в качестве проверки — reviewer устаёт и пропускает детали. Разбивай большие фичи на логические части.'
                },
                {
                    type: 'multiple',
                    question: 'Что должен содержать хороший code review комментарий? (выбери все верные)',
                    options: [
                        'Уровень критичности ([blocking]/[suggestion]/[nit])',
                        'Личную критику автора',
                        'Описание проблемы',
                        'Объяснение почему это проблема',
                        'Предложение как исправить',
                        'Список всех других проблем в файле'
                    ],
                    correct: [0, 2, 3, 4],
                    explanation: 'Хороший комментарий: уровень + что не так + почему + как исправить. Личная критика неприемлема. Список всех проблем в одном комментарии — лучше делать отдельные комментарии на каждую.'
                },
                {
                    type: 'single',
                    question: 'Что означает "defer rows.Close()" и почему это важно при code review?',
                    options: [
                        'Откладывает закрытие до следующего GC цикла',
                        'Гарантирует закрытие ресурса при любом выходе из функции, включая panic',
                        'Закрывает только при нормальном возврате из функции',
                        'Это просто стиль, не влияет на корректность'
                    ],
                    correct: 1,
                    explanation: 'defer выполняется при любом выходе из функции: нормальный return, panic, любой return в середине функции. Без defer, если после rows := ... случится panic или ранний return, rows никогда не закроется — утечка соединения.'
                }
            ]
        }
    ]
};
