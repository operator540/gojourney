export default {
    id: '03-01',
    title: 'Система пакетов Go',
    description: 'Пакеты как коробки с инструментами: объявление, экспорт, импорт, init(), blank import, конвенции именования',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: пакет как коробка с инструментами</h2>
                <p>Представьте мастерскую плотника. У него есть много ящиков: <strong>ящик с пилами</strong>, <strong>ящик с молотками</strong>, <strong>ящик с отвёртками</strong>. Каждый ящик — это отдельная коробка с определённым набором инструментов. Когда нужна пила — открываешь нужный ящик, берёшь нужный инструмент.</p>
                <p>Пакет в Go — это такая коробка. Внутри — набор связанных функций, типов и констант. Вы импортируете пакет и получаете доступ к его публичному содержимому.</p>

                <h2>Что такое пакет в Go?</h2>
                <p>Каждый <code>.go</code>-файл начинается с объявления пакета: <code>package name</code>. Все файлы в одной директории должны принадлежать одному пакету. Пакет — это единица компиляции, тестирования и переиспользования кода в Go.</p>

                <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px; border:1px solid var(--border); text-align:left">Правило</th>
                            <th style="padding:10px; border:1px solid var(--border); text-align:left">Пример</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px; border:1px solid var(--border)">Все файлы в директории — один пакет</td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>mathutil/*.go</code> → <code>package mathutil</code></td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px; border:1px solid var(--border)">Имя пакета обычно = имя директории</td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>http/</code> → <code>package http</code></td>
                        </tr>
                        <tr>
                            <td style="padding:10px; border:1px solid var(--border)">Специальный пакет main — точка входа</td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>func main()</code> только в <code>package main</code></td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px; border:1px solid var(--border)">Исключение: *_test.go файлы</td>
                            <td style="padding:10px; border:1px solid var(--border)">Могут иметь суффикс <code>_test</code>: <code>package http_test</code></td>
                        </tr>
                    </tbody>
                </table>

                <h2>Экспорт: регистр определяет видимость</h2>
                <p>В Go нет ключевых слов <code>public</code> / <code>private</code>. Видимость определяется <strong>первой буквой имени</strong>:</p>
                <ul>
                    <li><strong>Заглавная буква</strong> — экспортировано (видно извне пакета): <code>User</code>, <code>GetName</code>, <code>MaxSize</code></li>
                    <li><strong>Строчная буква</strong> — приватное (только внутри пакета): <code>user</code>, <code>getName</code>, <code>maxSize</code></li>
                </ul>
                <p>Это правило применяется к <strong>всему</strong>: функциям, типам, полям структур, константам, переменным.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Пакет mathutil — экспорт и приватность',
            code: `// Файл: mathutil/mathutil.go
package mathutil

import (
    "math"
    "fmt"
)

// MaxInt — экспортированная константа (заглавная буква)
const MaxInt = int(^uint(0) >> 1)

// precision — приватная константа (строчная)
const precision = 1e-9

// Point — экспортированная структура
type Point struct {
    X float64 // экспортированное поле
    Y float64 // экспортированное поле
    id int    // ПРИВАТНОЕ поле — недоступно извне пакета
}

// NewPoint — экспортированная функция-конструктор
// Принимает id (приватное поле) — только так можно его задать
func NewPoint(x, y float64, id int) Point {
    return Point{X: x, Y: y, id: id}
}

// Distance — экспортированный метод
func (p Point) Distance(other Point) float64 {
    return sqrt((p.X-other.X)*(p.X-other.X) + (p.Y-other.Y)*(p.Y-other.Y))
}

// String — экспортированный, реализует fmt.Stringer
func (p Point) String() string {
    return fmt.Sprintf("Point(%g, %g)", p.X, p.Y)
}

// sqrt — приватная вспомогательная функция
func sqrt(x float64) float64 {
    return math.Sqrt(x)
}

// isEqual — приватная, для внутреннего использования
func isEqual(a, b float64) bool {
    return math.Abs(a-b) < precision
}

// Max — экспортированная функция
func Max(a, b int) int {
    if a > b {
        return a
    }
    return b
}`,
            explanation: 'Правило одно: заглавная = экспортировано. Работает для функций (Max/sqrt), типов (Point), полей (X/id), констант (MaxInt/precision). Приватное поле id нельзя задать прямо, только через конструктор NewPoint — это инкапсуляция в стиле Go.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Использование пакета — все виды импортов',
            code: `// Файл: main.go
package main

import (
    // Стандартная библиотека — просто имя
    "fmt"
    "strings"

    // Свой пакет — полный путь от корня модуля
    "github.com/user/myproject/mathutil"

    // Алиас — когда есть конфликт имён или имя слишком длинное
    mu "github.com/user/myproject/mathutil"

    // Точечный импорт — имена без префикса (НЕ рекомендуется)
    // . "fmt"  // позволяет Println() вместо fmt.Println()

    // Blank import — только для побочного эффекта (init)
    _ "github.com/lib/pq"           // регистрация PostgreSQL-драйвера
    _ "image/png"                    // регистрация PNG-декодера
    _ "github.com/user/myproject/plugin" // регистрация плагина
)

func main() {
    p1 := mathutil.NewPoint(0, 0, 1)
    p2 := mathutil.NewPoint(3, 4, 2)

    // Методы доступны через имя пакета
    fmt.Println(p1.Distance(p2)) // 5

    // Алиас работает так же
    fmt.Println(mu.Max(10, 20)) // 20

    // Экспортированные поля доступны напрямую
    fmt.Println(p1.X, p1.Y) // 0 0

    // Приватные поля — недоступны:
    // fmt.Println(p1.id) // ОШИБКА КОМПИЛЯЦИИ!

    // strings — пример стандартного пакета
    fmt.Println(strings.ToUpper("hello")) // HELLO
}`,
            explanation: 'Импорт всегда по полному пути пакета. Обращение через имя пакета: mathutil.NewPoint(). Алиас помогает при конфликтах: mu "...mathutil". Blank import (_) — только для init() побочных эффектов. Точечный импорт избегайте — он делает код неочевидным.'
        },
        {
            type: 'theory',
            content: `
                <h2>Функция init() — автоматическая инициализация</h2>
                <p><code>init()</code> — специальная функция в Go. Она запускается <strong>автоматически</strong> при загрузке пакета, до <code>main()</code>. У неё нет параметров и возвращаемых значений.</p>
                <p>Особенности <code>init()</code>:</p>
                <ul>
                    <li>Нельзя вызвать явно — только автоматически</li>
                    <li>В одном файле может быть <strong>несколько</strong> init() — они выполнятся по порядку</li>
                    <li>В одном пакете init() из разных файлов выполняются в порядке имён файлов</li>
                    <li>Порядок: инициализация переменных пакета → init() → main()</li>
                </ul>

                <p>Типичные использования:</p>
                <ul>
                    <li>Регистрация драйверов БД: <code>_ "github.com/lib/pq"</code></li>
                    <li>Регистрация HTTP-обработчиков, плагинов</li>
                    <li>Инициализация глобальных переменных, которые нельзя инициализировать напрямую</li>
                    <li>Проверки при старте (panic если конфиг неверный)</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Порядок инициализации и init()',
            code: `package main

import "fmt"

// 1. Сначала инициализируются переменные пакета
var greeting = buildGreeting()

func buildGreeting() string {
    fmt.Println("0. Инициализация переменной greeting")
    return "Hello"
}

// 2. Затем выполняются все init() в порядке файлов
func init() {
    fmt.Println("1. init() #1 выполнен")
    // Здесь уже можно использовать greeting
    greeting += ", Go!"
}

// Несколько init() в одном файле — РАЗРЕШЕНО
func init() {
    fmt.Println("2. init() #2 выполнен")
    // greeting == "Hello, Go!"
}

// 3. Последним запускается main()
func main() {
    fmt.Println("3. main() запущен")
    fmt.Println("Greeting:", greeting)
}

// Вывод:
// 0. Инициализация переменной greeting
// 1. init() #1 выполнен
// 2. init() #2 выполнен
// 3. main() запущен
// Greeting: Hello, Go!`,
            explanation: 'Порядок строгий: переменные пакета → все init() → main(). В реальном коде init() чаще всего используется для регистрации драйверов (blank import) или одноразовой настройки. Избегайте сложной логики в init() — это усложняет тестирование.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Реальный пример: регистрация через init()',
            code: `// Файл: drivers/postgres/postgres.go
package postgres

import "database/sql"

// init() регистрирует PostgreSQL-драйвер автоматически при импорте
func init() {
    sql.Register("postgres", &postgresDriver{})
}

type postgresDriver struct{}

// ...реализация Driver...

// ===================================================
// Файл: main.go
package main

import (
    "database/sql"
    "fmt"
    "log"

    // Blank import — только для запуска init() из пакета postgres
    // Нам не нужны явные имена из этого пакета
    _ "myproject/drivers/postgres"
)

func main() {
    // Теперь "postgres" зарегистрирован и sql.Open работает
    db, err := sql.Open("postgres", "postgresql://localhost/mydb")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    fmt.Println("Подключено к PostgreSQL")
}`,
            explanation: 'Это классический паттерн Go — регистрация через blank import. Пакет postgres регистрирует драйвер в своём init(). Пользователю не нужны имена из пакета — нужен только побочный эффект. Поэтому _.'
        },
        {
            type: 'theory',
            content: `
                <h2>Конвенции именования пакетов</h2>
                <p>Имя пакета — часть каждого вызова его функций: <code>http.Get</code>, <code>json.Marshal</code>, <code>fmt.Println</code>. Поэтому имена должны быть <strong>краткими и точными</strong>.</p>

                <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px; border:1px solid var(--border); text-align:left">Правило</th>
                            <th style="padding:10px; border:1px solid var(--border); text-align:left">Хорошо</th>
                            <th style="padding:10px; border:1px solid var(--border); text-align:left; color: var(--accent)">Плохо</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px; border:1px solid var(--border)">Строчные буквы</td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>httputil</code></td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>httpUtil</code>, <code>HTTPUtil</code></td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px; border:1px solid var(--border)">Одно слово (или слитно)</td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>validator</code></td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>my_validator</code></td>
                        </tr>
                        <tr>
                            <td style="padding:10px; border:1px solid var(--border)">Конкретное назначение</td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>handler</code>, <code>service</code></td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>utils</code>, <code>helpers</code></td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px; border:1px solid var(--border)">Не повторять пакет в именах</td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>user.New()</code></td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>user.NewUser()</code></td>
                        </tr>
                        <tr>
                            <td style="padding:10px; border:1px solid var(--border)">Без конфликта с stdlib</td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>myfmt</code> (если нужно)</td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>fmt</code>, <code>http</code></td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `
                <p><strong>Золотое правило:</strong> имя пакета — это контекст для имён внутри него. Если пакет называется <code>user</code>, то функция создания пользователя называется <code>New</code>, а не <code>NewUser</code>. Вызов <code>user.New()</code> читается лучше, чем <code>user.NewUser()</code>.</p>
                <p>Избегайте имён <code>utils</code>, <code>helpers</code>, <code>common</code>, <code>misc</code> — они превращаются в свалки кода без чёткого назначения.</p>
            `
        },
        {
            type: 'info-box',
            variant: 'important',
            content: `
                <p><strong>Циклические импорты запрещены!</strong> Если пакет A импортирует B, то B не может импортировать A. Go проверяет это при компиляции.</p>
                <p>Это не ограничение, а дизайнерское решение: оно заставляет строить чёткую иерархию зависимостей. Если появился циклический импорт — значит, нужно пересмотреть архитектуру. Часто помогает выделение общего кода в третий пакет C, который импортируют и A, и B.</p>
            `
        },
        {
            type: 'editor',
            title: 'Практика: Организация пакета',
            instructions: 'Реализуйте пакет stringutil с функциями Reverse, IsPalindrome и WordCount. Правила: Reverse переворачивает строку побайтово по рунам, IsPalindrome проверяет палиндром (регистр не важен), WordCount считает слова.',
            starterCode: `package main

import (
    "fmt"
    "strings"
)

// Представьте что это файл stringutil/stringutil.go

// Reverse переворачивает строку (работает с Unicode)
func Reverse(s string) string {
    // Подсказка: []rune — правильная работа с Unicode
    // TODO: ваш код
    return ""
}

// IsPalindrome проверяет палиндром (не зависит от регистра)
func IsPalindrome(s string) bool {
    // Подсказка: используйте strings.ToLower и Reverse
    // TODO: ваш код
    return false
}

// WordCount считает количество слов (несколько пробелов = 1 разделитель)
func WordCount(s string) int {
    // Подсказка: strings.Fields справляется с лишними пробелами
    // TODO: ваш код
    return 0
}

func main() {
    fmt.Println(Reverse("Hello, мир!"))      // !рим ,olleH
    fmt.Println(Reverse("abcde"))             // edcba
    fmt.Println(IsPalindrome("racecar"))      // true
    fmt.Println(IsPalindrome("Madam"))        // true
    fmt.Println(IsPalindrome("hello"))        // false
    fmt.Println(WordCount("Go is awesome"))   // 3
    fmt.Println(WordCount("  many   spaces ")) // 2
}`,
            hints: [
                'Reverse: runes := []rune(s), переверните срез, верните string(runes)',
                'Переворот среза: i, j := 0, len(runes)-1; for i < j { runes[i], runes[j] = runes[j], runes[i]; i++; j-- }',
                'IsPalindrome: s = strings.ToLower(s); return s == Reverse(s)',
                'WordCount: return len(strings.Fields(s))',
                'strings.Fields разбивает по любому пробелу и убирает пустые части'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Как в Go определяется видимость (экспорт) идентификатора?',
                    options: [
                        'По первой букве имени: заглавная = экспортировано, строчная = приватное',
                        'Ключевыми словами public и private',
                        'Расположением в файле (вверху = публичное)',
                        'Аннотацией // export над объявлением'
                    ],
                    correct: 0,
                    explanation: 'В Go нет public/private. Заглавная буква (User, GetName) = видно из других пакетов. Строчная (user, getName) = только внутри текущего пакета. Работает для всего: типов, функций, полей, констант.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Все .go файлы в одной директории должны иметь...',
                    options: [
                        'Одинаковое имя пакета (кроме файлов *_test.go)',
                        'Разные имена пакетов для изоляции',
                        'Обязательно имя main',
                        'Имя, совпадающее с именем репозитория'
                    ],
                    correct: 0,
                    explanation: 'Все .go файлы в директории принадлежат одному пакету. Исключение: *_test.go могут объявлять package X_test для внешних тестов (black-box testing).'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Когда выполняется функция init()?',
                    options: [
                        'Автоматически при загрузке пакета, после инициализации переменных, до main()',
                        'При первом явном вызове init()',
                        'После завершения main()',
                        'Только во время тестирования'
                    ],
                    correct: 0,
                    explanation: 'Порядок: 1) инициализация переменных пакета, 2) все init() в порядке файлов, 3) func main(). init() нельзя вызвать явно — только автоматически.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Зачем используется blank import: _ "github.com/lib/pq"?',
                    options: [
                        'Чтобы выполнить init() пакета (регистрация побочного эффекта) без использования его имён',
                        'Чтобы скрыть пакет от других импортёров',
                        'Чтобы импортировать только константы пакета',
                        'Чтобы проверить корректность пакета при компиляции'
                    ],
                    correct: 0,
                    explanation: '_ "github.com/lib/pq" запускает init() пакета pq, который регистрирует PostgreSQL-драйвер. Больше ничего из пакета не используется — поэтому _. Компилятор Go требует использовать каждый импортированный пакет.'
                },
                {
                    id: 'q5',
                    type: 'multiple',
                    question: 'Какие утверждения об init() верны? (все верные)',
                    options: [
                        'В одном файле может быть несколько функций init()',
                        'init() не принимает аргументы и не возвращает значения',
                        'init() нельзя вызвать явно из кода',
                        'init() выполняется после main()'
                    ],
                    correct: [0, 1, 2],
                    explanation: 'Несколько init() в файле — допустимо, выполнятся по порядку. Сигнатура фиксированная: func init(). Нельзя вызвать явно — вызов init() это ошибка компиляции. Выполняется ДО main(), а не после.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Какое имя пакета лучше: userService или user?',
                    options: [
                        'user — короткое, а функции внутри сами говорят: user.Create(), user.Find()',
                        'userService — точнее описывает содержимое',
                        'UserService — заглавная для важных пакетов',
                        'user_service — как в Python'
                    ],
                    correct: 0,
                    explanation: 'Имя пакета — это контекст. user.Create() читается лучше чем userService.CreateUser(). Пакеты Go: строчные, короткие, одно слово. Контекст уже несёт имя пакета.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Go позволяет циклические импорты?',
                    options: [
                        'Нет — это ошибка компиляции. Нужно пересмотреть архитектуру',
                        'Да — без ограничений',
                        'Да — но только через пустой интерфейс',
                        'Да — если использовать псевдоним (alias)'
                    ],
                    correct: 0,
                    explanation: 'Циклические импорты запрещены в Go. Это заставляет проектировать однонаправленный граф зависимостей. Решение: выделить общий код в третий пакет.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Для чего используется точечный импорт: . "fmt"?',
                    options: [
                        'Позволяет использовать имена без префикса: Println() вместо fmt.Println()',
                        'Импортирует только точечные методы пакета',
                        'Создаёт алиас . для пакета',
                        'Это синтаксис для относительных импортов'
                    ],
                    correct: 0,
                    explanation: '. "fmt" делает все экспортированные имена fmt доступными без префикса. Это НЕ рекомендуется — код становится неочевидным (откуда Println?). Исключение: тесты, где удобно использовать . "testing".'
                }
            ]
        }
    ]
};
