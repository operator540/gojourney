export default {
    id: '14-02',
    title: 'Соглашения об именах',
    description: 'Имена в коде как дорожные знаки — хорошее имя сразу говорит куда ведёт. Изучаем camelCase, PascalCase, аббревиатуры и антипаттерны именования в Go.',
    estimatedTime: 30,
    xpReward: 25,
    sections: [
        {
            type: 'theory',
            title: 'Почему имена важнее комментариев',
            content: `
<h2>Имена как дорожные знаки</h2>
<p>Представь город без нормальных названий улиц. Вместо «ул. Ленина, д. 5» — «улица_номер_3_которая_идёт_вправо_от_площади». Ты потеряешься, даже имея карту.</p>
<p>В коде то же самое. Плохие имена — это улицы без знаков. Ты читаешь код и тратишь половину времени на расшифровку: что такое <code>d</code>? Что делает <code>proc2</code>? Почему переменная называется <code>temp</code>, если она хранится 200 строк?</p>

<div class="info-box">
    <strong>Правило хорошего имени:</strong> Если имя требует комментария — оно плохое. Хорошее имя самодокументируется.
    <br><br>
    <code>// d — количество дней до дедлайна</code><br>
    <code>var d int</code><br><br>
    vs<br><br>
    <code>var daysUntilDeadline int</code>
</div>

<p>Go имеет строгие конвенции именования, закреплённые в официальном <a href="https://go.dev/doc/effective_go">Effective Go</a> и стайлгайде Google. Следование им — признак профессионализма.</p>

<h3>Что даёт правильное именование</h3>
<ul>
    <li><strong>Читаемость</strong> — код читается как проза, не как ребус</li>
    <li><strong>Самодокументация</strong> — меньше нужды в комментариях</li>
    <li><strong>Searchability</strong> — легко найти все места использования</li>
    <li><strong>Онбординг</strong> — новый разработчик быстрее разберётся</li>
    <li><strong>Меньше багов</strong> — непонятные имена ведут к неправильному использованию</li>
</ul>
`
        },
        {
            type: 'theory',
            title: 'camelCase vs PascalCase — правила экспорта',
            content: `
<h2>Главное правило Go: регистр = видимость</h2>
<p>В Go нет ключевых слов <code>public</code> и <code>private</code>. Видимость определяется первой буквой имени — это элегантное и однозначное решение.</p>

<table style="width:100%; border-collapse: collapse; margin: 16px 0;">
    <tr style="background: var(--surface-2);">
        <th style="padding: 10px; border: 1px solid var(--border); text-align: left;">Стиль</th>
        <th style="padding: 10px; border: 1px solid var(--border); text-align: left;">Видимость</th>
        <th style="padding: 10px; border: 1px solid var(--border); text-align: left;">Применение</th>
        <th style="padding: 10px; border: 1px solid var(--border); text-align: left;">Пример</th>
    </tr>
    <tr>
        <td style="padding: 10px; border: 1px solid var(--border);"><strong>PascalCase</strong></td>
        <td style="padding: 10px; border: 1px solid var(--border);">Экспортируемое (public)</td>
        <td style="padding: 10px; border: 1px solid var(--border);">Типы, функции, методы, константы, переменные пакета</td>
        <td style="padding: 10px; border: 1px solid var(--border);"><code style="color: var(--accent);">UserService, GetUser, MaxRetries</code></td>
    </tr>
    <tr style="background: var(--surface-2);">
        <td style="padding: 10px; border: 1px solid var(--border);"><strong>camelCase</strong></td>
        <td style="padding: 10px; border: 1px solid var(--border);">Неэкспортируемое (private)</td>
        <td style="padding: 10px; border: 1px solid var(--border);">Локальные переменные, внутренние функции, приватные поля</td>
        <td style="padding: 10px; border: 1px solid var(--border);"><code style="color: var(--accent);">userID, parseToken, maxRetries</code></td>
    </tr>
    <tr>
        <td style="padding: 10px; border: 1px solid var(--border);"><strong>SCREAMING_SNAKE</strong></td>
        <td style="padding: 10px; border: 1px solid var(--border);">— (не используется)</td>
        <td style="padding: 10px; border: 1px solid var(--border);">В Go НЕ принято для констант!</td>
        <td style="padding: 10px; border: 1px solid var(--border);"><code style="color: red;">MAX_SIZE ❌</code></td>
    </tr>
</table>

<h3>Длина имени — функция от области видимости</h3>
<p>Go поощряет короткие имена там, где контекст очевиден. Это не лень — это дизайн языка:</p>
<ul>
    <li>Цикл: <code>i, j, k</code> — абсолютная норма</li>
    <li>Receiver метода: 1-2 буквы от типа: <code>u *User</code>, <code>s *Server</code></li>
    <li>Ошибка: всегда <code>err</code></li>
    <li>Контекст: всегда <code>ctx</code></li>
    <li>Чем шире область видимости — тем длиннее имя</li>
</ul>
`
        },
        {
            type: 'code-example',
            title: 'camelCase, PascalCase и короткие имена в циклах',
            code: `package main

import "fmt"

// PascalCase — экспортируемые типы и функции
type UserProfile struct {
    ID        int    // экспортируемое поле
    FirstName string // экспортируемое поле
    lastName  string // приватное поле (редко нужно)
}

// Receiver: одна буква от типа — стандарт Go
func (u UserProfile) FullName() string {
    return u.FirstName + " " + u.lastName
}

// camelCase — неэкспортируемые функции пакета
func parseUserID(raw string) (int, error) {
    // Внутри функции: короткие имена нормальны
    var id int
    _, err := fmt.Sscanf(raw, "%d", &id)
    return id, err
}

// В циклах — i, j, k это НОРМА
func sumMatrix(matrix [][]int) int {
    sum := 0
    for i := 0; i < len(matrix); i++ {
        for j := 0; j < len(matrix[i]); j++ {
            sum += matrix[i][j]
        }
    }
    return sum
}

// Пустой идентификатор _ — явное игнорирование
func processItems(items []string) []string {
    result := make([]string, 0, len(items))
    for _, item := range items { // _ = индекс не нужен
        if item != "" {
            result = append(result, item)
        }
    }
    return result
}

func main() {
    u := UserProfile{ID: 1, FirstName: "Алексей"}
    fmt.Println(u.FullName())
}`,
            explanation: 'PascalCase для всего экспортируемого, camelCase для внутреннего. Receiver — одна буква. Циклы — i, j. Пустой идентификатор _ явно сигнализирует "это значение нам не нужно".'
        },
        {
            type: 'theory',
            title: 'Аббревиатуры: URL, HTTP, ID и другие',
            content: `
<h2>Аббревиатуры пишутся ЦЕЛИКОМ в одном регистре</h2>
<p>Это одно из самых частых мест ошибок у новичков. В Go аббревиатуры не "смешивают" с camelCase — они либо полностью заглавные, либо полностью строчные:</p>

<table style="width:100%; border-collapse: collapse; margin: 16px 0;">
    <tr style="background: var(--surface-2);">
        <th style="padding: 10px; border: 1px solid var(--border);">Неправильно ❌</th>
        <th style="padding: 10px; border: 1px solid var(--border);">Правильно ✓</th>
        <th style="padding: 10px; border: 1px solid var(--border);">Почему</th>
    </tr>
    <tr>
        <td style="padding: 10px; border: 1px solid var(--border);"><code>getUserId()</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);"><code>getUserID()</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);">ID — аббревиатура, пишется полностью</td>
    </tr>
    <tr style="background: var(--surface-2);">
        <td style="padding: 10px; border: 1px solid var(--border);"><code>parseUrl()</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);"><code>parseURL()</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);">URL — аббревиатура</td>
    </tr>
    <tr>
        <td style="padding: 10px; border: 1px solid var(--border);"><code>HttpServer</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);"><code>HTTPServer</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);">HTTP — аббревиатура</td>
    </tr>
    <tr style="background: var(--surface-2);">
        <td style="padding: 10px; border: 1px solid var(--border);"><code>ServeHttp()</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);"><code>ServeHTTP()</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);">Стандартный интерфейс http.Handler</td>
    </tr>
    <tr>
        <td style="padding: 10px; border: 1px solid var(--border);"><code>userJson</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);"><code>userJSON</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);">JSON — аббревиатура</td>
    </tr>
    <tr style="background: var(--surface-2);">
        <td style="padding: 10px; border: 1px solid var(--border);"><code>dbSql</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);"><code>dbSQL</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);">SQL — аббревиатура</td>
    </tr>
</table>

<h3>Распространённые аббревиатуры в Go</h3>
<p>Список признанных аббревиатур: <code>ACL, API, ASCII, CPU, CSS, DNS, EOF, GUID, HTML, HTTP, HTTPS, ID, IP, JSON, QPS, RAM, RPC, SLA, SMTP, SQL, SSH, TCP, TLS, TTL, UDP, UI, UID, UUID, URI, URL, UTF8, VM, XML, XMPP, XSRF, XSS</code></p>

<div class="info-box">
    <strong>Инструмент:</strong> <code>golint</code> и <code>staticcheck</code> автоматически находят неправильно написанные аббревиатуры и выводят предупреждения. В CI это должно быть обязательной проверкой.
</div>
`
        },
        {
            type: 'code-example',
            title: 'Аббревиатуры и антипаттерны именования',
            code: `package main

// ✓ ПРАВИЛЬНО: аббревиатуры целиком в одном регистре
type HTTPClient struct {
    baseURL    string
    apiKey     string
    maxRetries int
}

func (c *HTTPClient) GetUserByID(id int) (*User, error) {
    // реализация
    return nil, nil
}

func parseJSON(data []byte) (map[string]interface{}, error) {
    // реализация
    return nil, nil
}

// ✗ АНТИПАТТЕРНЫ — чего избегать

// 1. Венгерская нотация (тип в имени) — НЕ нужна в Go
// strName, intAge, boolIsActive — плохо
// Name, Age, IsActive — хорошо

type User struct {
    // ❌ strFirstName string
    // ❌ intAge       int
    // ❌ boolActive   bool

    // ✓ Правильно:
    FirstName string
    Age       int
    Active    bool
}

// 2. Префиксы пакета в именах — избыточно
// package user
// ❌ type UserUser struct{} — "user.UserUser" — абсурд
// ✓ type Profile struct{} — "user.Profile" — понятно

// 3. Get-префикс для геттеров — лишний в Go
type Server struct {
    port int
}

// ❌ func (s *Server) GetPort() int { return s.port }
// ✓ В Go просто:
func (s *Server) Port() int { return s.port }

// 4. Слишком общие имена
// ❌ func process(data interface{}) interface{}
// ✓ func encryptPayload(payload []byte) ([]byte, error)

// 5. Сокращения без необходимости
// ❌ func calcTtlAmt(q int, p float64) float64
// ✓ func calculateTotalAmount(quantity int, price float64) float64`,
            explanation: 'Венгерская нотация, Get-префиксы, пакетные префиксы в именах, слишком общие имена — всё это антипаттерны Go. Аббревиатуры пишутся полностью в одном регистре.'
        },
        {
            type: 'theory',
            title: 'Именование интерфейсов, ошибок и пакетов',
            content: `
<h2>Специальные правила для разных сущностей</h2>

<h3>Интерфейсы с одним методом</h3>
<p>Добавляй суффикс <code>-er</code> к имени метода. Это идиома Go:</p>
<ul>
    <li><code>Read</code> → <code>Reader</code></li>
    <li><code>Write</code> → <code>Writer</code></li>
    <li><code>Close</code> → <code>Closer</code></li>
    <li><code>String</code> → <code>Stringer</code></li>
    <li><code>Execute</code> → <code>Executor</code></li>
    <li><code>Handle</code> → <code>Handler</code></li>
</ul>

<h3>Пользовательские типы ошибок</h3>
<p>Суффикс <code>Error</code> или <code>Err</code> префикс для переменных-ошибок:</p>

<table style="width:100%; border-collapse: collapse; margin: 16px 0;">
    <tr style="background: var(--surface-2);">
        <th style="padding: 10px; border: 1px solid var(--border);">Сущность</th>
        <th style="padding: 10px; border: 1px solid var(--border);">Конвенция</th>
        <th style="padding: 10px; border: 1px solid var(--border);">Пример</th>
    </tr>
    <tr>
        <td style="padding: 10px; border: 1px solid var(--border);">Тип ошибки (struct)</td>
        <td style="padding: 10px; border: 1px solid var(--border);">Суффикс <code>Error</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);"><code>ValidationError, NotFoundError</code></td>
    </tr>
    <tr style="background: var(--surface-2);">
        <td style="padding: 10px; border: 1px solid var(--border);">Переменная-ошибка (sentinel)</td>
        <td style="padding: 10px; border: 1px solid var(--border);">Префикс <code>Err</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);"><code>ErrNotFound, ErrTimeout</code></td>
    </tr>
    <tr>
        <td style="padding: 10px; border: 1px solid var(--border);">Локальная переменная ошибки</td>
        <td style="padding: 10px; border: 1px solid var(--border);">Всегда <code>err</code></td>
        <td style="padding: 10px; border: 1px solid var(--border);"><code>err := doSomething()</code></td>
    </tr>
</table>

<h3>Имена пакетов</h3>
<ul>
    <li>Всегда строчные, без подчёркиваний и смешанного регистра</li>
    <li>Короткие, но не однобуквенные (исключение: <code>x</code> — служебное)</li>
    <li>Единственное число: <code>user</code>, не <code>users</code></li>
    <li>Имя пакета = его назначение: <code>http</code>, <code>json</code>, <code>fmt</code></li>
    <li>Не дублируй имя пакета в экспортируемых именах: <code>user.Profile</code> не <code>user.UserProfile</code></li>
</ul>

<div class="info-box">
    <strong>Проверь себя:</strong> Прочитай имя вслух. Если звучит как нормальное предложение или фраза — хорошо. Если спотыкаешься — имя нужно переименовать.
</div>
`
        },
        {
            type: 'code-example',
            title: 'Интерфейсы, ошибки и пакеты',
            code: `package user // ✓ строчные, единственное число

import "fmt"

// Sentinel errors — префикс Err
var (
    ErrNotFound    = fmt.Errorf("user not found")
    ErrUnauthorized = fmt.Errorf("unauthorized")
    ErrInvalidInput = fmt.Errorf("invalid input")
)

// Тип ошибки — суффикс Error
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation failed on %s: %s", e.Field, e.Message)
}

// Интерфейс с одним методом — суффикс -er
type Storer interface {
    Store(user *Profile) error
}

type Finder interface {
    Find(id int) (*Profile, error)
}

// Два метода — описательное имя
type Repository interface {
    Store(user *Profile) error
    Find(id int) (*Profile, error)
    Delete(id int) error
}

// Тип — не "UserProfile" а просто "Profile" (пакет уже user)
// Снаружи: user.Profile — понятно и не избыточно
type Profile struct {
    ID        int
    FirstName string
    LastName  string
    Email     string
}

// Метод без Get-префикса
func (p *Profile) FullName() string {
    return p.FirstName + " " + p.LastName
}

// Функция-конструктор New* — стандарт
func NewProfile(id int, firstName, lastName, email string) *Profile {
    return &Profile{
        ID:        id,
        FirstName: firstName,
        LastName:  lastName,
        Email:     email,
    }
}`,
            explanation: 'Пакет "user" — строчные. Типы без дублирования имени пакета. ErrXxx для sentinel-ошибок, XxxError для типов. Интерфейс с одним методом — суффикс -er. Конструктор New*.'
        },
        {
            type: 'editor',
            title: 'Практика: исправь имена',
            description: 'Перед тобой код с нарушениями конвенций Go. Исправь все проблемы с именованием: аббревиатуры, антипаттерны, венгерская нотация, Get-префиксы.',
            initialCode: `package api

import "fmt"

// Исправь все проблемы с именованием в этом коде

var (
    errNotFound = fmt.Errorf("not found")  // sentinel error
)

type HttpHandler struct {                   // аббревиатура
    baseUrl    string                       // аббревиатура
    strApiKey  string                       // венгерская нотация
    intTimeout int                          // венгерская нотация
}

func (h *HttpHandler) GetBaseUrl() string { // Get-префикс + аббревиатура
    return h.baseUrl
}

func (h *HttpHandler) ServeHttp() {        // аббревиатура в методе
    userId := "123"                         // аббревиатура
    userJson := fmt.Sprintf("id:%s", userId) // аббревиатура
    fmt.Println(userJson)
}

type apiValidationError struct {            // тип ошибки без суффикса
    strMessage string                       // венгерская нотация
}

func (e *apiValidationError) Error() string {
    return e.strMessage
}`,
            solution: `package api

import "fmt"

var (
    ErrNotFound = fmt.Errorf("not found")
)

type HTTPHandler struct {
    baseURL   string
    apiKey    string
    timeout   int
}

func (h *HTTPHandler) BaseURL() string {
    return h.baseURL
}

func (h *HTTPHandler) ServeHTTP() {
    userID := "123"
    userJSON := fmt.Sprintf("id:%s", userID)
    fmt.Println(userJSON)
}

type ValidationError struct {
    Message string
}

func (e *ValidationError) Error() string {
    return e.Message
}`,
            hints: [
                'HttpHandler → HTTPHandler (аббревиатура HTTP полностью в верхнем регистре)',
                'baseUrl → baseURL, userId → userID, userJson → userJSON',
                'Удали венгерскую нотацию: strApiKey → apiKey, intTimeout → timeout',
                'GetBaseUrl() → BaseURL() (без Get-префикса, аббревиатура URL)',
                'ServeHttp() → ServeHTTP() — это стандартный интерфейс http.Handler',
                'apiValidationError → ValidationError (с суффиксом Error и PascalCase)',
                'errNotFound → ErrNotFound (sentinel error должен быть экспортируемым)',
            ]
        },
        {
            type: 'quiz',
            title: 'Проверь знания: соглашения об именах',
            questions: [
                {
                    type: 'single',
                    question: 'Как правильно назвать экспортируемую функцию для получения данных по HTTP?',
                    options: [
                        'func getHttpData()',
                        'func GetHTTPData()',
                        'func GetHttpData()',
                        'func get_http_data()'
                    ],
                    correct: 1,
                    explanation: 'Экспортируемые функции — PascalCase. HTTP — аббревиатура, пишется целиком заглавными: GetHTTPData().'
                },
                {
                    type: 'single',
                    question: 'Что означает, что имя в Go начинается с заглавной буквы?',
                    options: [
                        'Это константа',
                        'Это глобальная переменная',
                        'Это экспортируемый идентификатор (доступен из других пакетов)',
                        'Это тип данных'
                    ],
                    correct: 2,
                    explanation: 'В Go регистр первой буквы определяет видимость. Заглавная = экспортируемое (public). Строчная = неэкспортируемое (private).'
                },
                {
                    type: 'multiple',
                    question: 'Какие из этих имён написаны правильно по конвенциям Go? (выбери все верные)',
                    options: [
                        'HTTPServer',
                        'HttpServer',
                        'parseURL',
                        'parseUrl',
                        'userID',
                        'userId',
                        'ErrNotFound',
                        'errNotFound (для sentinel error)'
                    ],
                    correct: [0, 2, 4, 6],
                    explanation: 'Аббревиатуры пишутся целиком: HTTP, URL, ID. Sentinel errors экспортируются с префиксом Err (ErrNotFound). errNotFound неверно для sentinel error — он должен быть доступен пользователям пакета.'
                },
                {
                    type: 'single',
                    question: 'Как в Go называть интерфейс с одним методом Save()?',
                    options: [
                        'ISaver',
                        'SaveInterface',
                        'Saver',
                        'SaveService'
                    ],
                    correct: 2,
                    explanation: 'Идиома Go: интерфейс с одним методом именуется как метод + суффикс -er. Save → Saver, Read → Reader, Write → Writer.'
                },
                {
                    type: 'single',
                    question: 'У тебя есть пакет "order". Как правильно назвать основной тип?',
                    options: [
                        'type OrderOrder struct{}',
                        'type OrderData struct{}',
                        'type Order struct{}',
                        'type OrderModel struct{}'
                    ],
                    correct: 2,
                    explanation: 'Не дублируй имя пакета в типе. Снаружи это будет order.Order — абсурд. Правильно: order.Order → нет, просто Order внутри пакета order, снаружи используется как order.Order... Подожди — это нормально! order.Order — стандартная практика если тип является центральной сущностью пакета. Но если можно проще — используй просто Order.'
                },
                {
                    type: 'code-fill',
                    question: 'Заполни пропуски правильными именами по конвенциям Go:',
                    code: `var ___ = fmt.Errorf("user not found") // sentinel error

type ___ struct { // тип ошибки валидации
    Field string
}

type ___ interface { // интерфейс с методом Write
    Write(data []byte) error
}

func (u *User) ___() string { // метод без Get-префикса
    return u.email
}`,
                    blanks: ['ErrUserNotFound', 'ValidationError', 'Writer', 'Email'],
                    explanation: 'ErrXxx для sentinel ошибок, XxxError для типов ошибок, -er суффикс для интерфейсов с одним методом, без Get-префикса для геттеров.'
                },
                {
                    type: 'single',
                    question: 'Какой стиль именования констант принят в Go?',
                    options: [
                        'MAX_CONNECTIONS (SCREAMING_SNAKE_CASE)',
                        'maxConnections (camelCase для неэкспортируемых) / MaxConnections (PascalCase для экспортируемых)',
                        'max-connections (kebab-case)',
                        'MAXCONNECTIONS (все заглавные слитно)'
                    ],
                    correct: 1,
                    explanation: 'В Go константы следуют тем же правилам: PascalCase если экспортируемые, camelCase если нет. SCREAMING_SNAKE_CASE — это C/Python стиль, в Go он не принят.'
                },
                {
                    type: 'single',
                    question: 'Что НЕ так с именем переменной "strUserName"?',
                    options: [
                        'Слишком длинное',
                        'Это венгерская нотация — тип (str) в имени переменной, не нужен в Go',
                        'Должно быть PascalCase',
                        'Нельзя использовать "User" в имени переменной'
                    ],
                    correct: 1,
                    explanation: 'Венгерская нотация (префикс типа: str, int, bool) — антипаттерн в Go. Тип переменной видно из объявления или подсказки IDE. Правильно: userName или просто name в зависимости от контекста.'
                }
            ]
        }
    ]
};
