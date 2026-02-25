export default {
    id: '01-01',
    title: 'Hello, Go!',
    description: 'История создания Go, первая программа и разбор каждой строки',
    estimatedTime: 30,
    xpReward: 30,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Почему Google создал новый язык?</h2>
                <p>2007 год. Google растёт с бешеной скоростью. Тысячи инженеров работают над огромными системами. И у них серьёзная проблема: <strong>компиляция C++ кода занимает 45 минут</strong>. Буквально. Инженеры запускают сборку, идут пить кофе, возвращаются — и сборка ещё не закончена.</p>
                <p>Роберт Грисмер, Роб Пайк и Кен Томпсон (тот самый, кто создал Unix и язык C) сидели в одной комнате и ждали завершения очередной сборки. Именно тогда они решили: нужен новый язык. Требования были простые:</p>
                <ul>
                    <li><strong>Компилироваться за секунды</strong>, не за минуты</li>
                    <li><strong>Простота Python</strong> — код должен читаться как проза</li>
                    <li><strong>Производительность C</strong> — машинный код, не интерпретатор</li>
                    <li><strong>Встроенная конкурентность</strong> — Google работает с миллионами запросов одновременно</li>
                    <li><strong>Один бинарник</strong> — никаких «установите зависимость версии 2.1.3.4»</li>
                </ul>
                <p>В 2009 году Go стал открытым. В 2012 вышел Go 1.0. Сегодня Go — это язык, на котором написаны Docker, Kubernetes, Terraform, Hugo, Prometheus и сотни других инструментов, которые используют миллионы разработчиков каждый день.</p>
            `
        },
        {
            type: 'info-box',
            variant: 'note',
            content: '<p>Кен Томпсон — один из создателей Unix и языка C. Роб Пайк — создатель Plan 9 и UTF-8. Они создавали Go не как академический проект, а как ответ на реальные производственные проблемы Google.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Go vs другие языки: честное сравнение</h2>
                <p>Прежде чем писать код — давайте поймём, где Go выигрывает, а где нет. Это поможет понять, <em>зачем</em> учить Go и когда его применять.</p>
                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead><tr style="background:var(--surface-2)">
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Критерий</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Go</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Python</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Java</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">C++</th>
                    </tr></thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><strong>Скорость выполнения</strong></td>
                            <td style="padding:10px;border:1px solid var(--border)">Очень быстро</td>
                            <td style="padding:10px;border:1px solid var(--border)">Медленно</td>
                            <td style="padding:10px;border:1px solid var(--border)">Быстро (JVM)</td>
                            <td style="padding:10px;border:1px solid var(--border)">Максимально быстро</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><strong>Скорость компиляции</strong></td>
                            <td style="padding:10px;border:1px solid var(--border)">Секунды</td>
                            <td style="padding:10px;border:1px solid var(--border)">Не нужна</td>
                            <td style="padding:10px;border:1px solid var(--border)">Минуты</td>
                            <td style="padding:10px;border:1px solid var(--border)">Десятки минут</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><strong>Простота изучения</strong></td>
                            <td style="padding:10px;border:1px solid var(--border)">Высокая (25 ключевых слов)</td>
                            <td style="padding:10px;border:1px solid var(--border)">Очень высокая</td>
                            <td style="padding:10px;border:1px solid var(--border)">Средняя</td>
                            <td style="padding:10px;border:1px solid var(--border)">Низкая</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><strong>Конкурентность</strong></td>
                            <td style="padding:10px;border:1px solid var(--border)">Встроена (горутины)</td>
                            <td style="padding:10px;border:1px solid var(--border)">GIL ограничивает</td>
                            <td style="padding:10px;border:1px solid var(--border)">Треды (сложно)</td>
                            <td style="padding:10px;border:1px solid var(--border)">Треды (очень сложно)</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><strong>Деплой</strong></td>
                            <td style="padding:10px;border:1px solid var(--border)">Один бинарник</td>
                            <td style="padding:10px;border:1px solid var(--border)">Python + пакеты</td>
                            <td style="padding:10px;border:1px solid var(--border)">JVM + JAR</td>
                            <td style="padding:10px;border:1px solid var(--border)">Бинарник + libs</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><strong>Управление памятью</strong></td>
                            <td style="padding:10px;border:1px solid var(--border)">Сборщик мусора</td>
                            <td style="padding:10px;border:1px solid var(--border)">Сборщик мусора</td>
                            <td style="padding:10px;border:1px solid var(--border)">Сборщик мусора</td>
                            <td style="padding:10px;border:1px solid var(--border)">Ручное (опасно)</td>
                        </tr>
                    </tbody>
                </table>
                <p style="margin-top:16px">Вывод: Go занимает нишу между Python (простота) и C++ (производительность). Это <em>инструмент для создания серверов, CLI-утилит и системного ПО</em>, где важны и скорость, и читаемость кода.</p>
            `
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p>Компании, активно использующие Go: <strong>Google</strong> (поиск, Cloud), <strong>Uber</strong> (геосервисы), <strong>Twitch</strong> (стриминг), <strong>Dropbox</strong> (файловый сервис), <strong>Cloudflare</strong> (CDN/DNS), <strong>Docker</strong>, <strong>Kubernetes</strong>. У всех этих компаний общая черта: высокая нагрузка и требования к производительности.</p>'
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph LR
    A[Код main.go] -->|go build| B[Компилятор Go]
    B --> C[Единый бинарник]
    C -->|Копируем на сервер| D[Запущен!]
    style A fill:#d97706,color:#fff
    style B fill:#1a1a1f,color:#f4f4f5,stroke:#00add8
    style C fill:#10b981,color:#fff
    style D fill:#00add8,color:#fff`,
            caption: 'Go компилируется в единый исполняемый файл без внешних зависимостей — копируй и запускай'
        },
        {
            type: 'theory',
            content: `
                <h2>Ваша первая Go-программа — разбор по строкам</h2>
                <p>Посмотрите на минимальную Go-программу. Каждая строка здесь обязательна и несёт смысл. Нельзя ничего убрать — программа перестанет компилироваться.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Hello, World! — минимальная программа',
            code: `package main

import "fmt"

func main() {
    fmt.Println("Привет, Go!")
}`,
            explanation: 'Пять строк, и программа работает. Запустите её командой: go run main.go'
        },
        {
            type: 'theory',
            content: `
                <h2>Что означает каждая строка?</h2>

                <p><strong>Строка 1: <code>package main</code></strong></p>
                <p>Каждый Go-файл принадлежит пакету. Пакет — это способ организации кода (как папка для функций и типов). Пакет <code>main</code> — особенный: он говорит компилятору «здесь точка входа». Если бы пакет назывался <code>utils</code> или <code>models</code> — компилятор бы знал, что это библиотека, а не самостоятельная программа.</p>

                <p><strong>Строка 3: <code>import "fmt"</code></strong></p>
                <p>Подключаем пакет <code>fmt</code> из стандартной библиотеки. <code>fmt</code> — сокращение от «format». Он содержит функции для вывода текста, форматирования строк, записи в файлы. Без этого импорта компилятор не знает, что такое <code>fmt.Println</code> — и выдаст ошибку.</p>
                <p>Важно: если вы импортировали пакет но не используете его — это <strong>ошибка компиляции</strong>. Go не терпит мусорных импортов.</p>

                <p><strong>Строка 5: <code>func main()</code></strong></p>
                <p>Объявление функции <code>main</code>. В каждой исполняемой Go-программе должна быть ровно одна функция <code>main</code> в пакете <code>main</code>. Когда вы запускаете программу, операционная система вызывает именно эту функцию. Всё начинается здесь.</p>

                <p><strong>Строка 6: <code>fmt.Println("Привет, Go!")</code></strong></p>
                <p>Вызов функции <code>Println</code> из пакета <code>fmt</code>. Обратите внимание на заглавную букву P — это принципиально важно. В Go <em>заглавная первая буква = публичная (экспортированная) функция</em>, строчная = приватная. <code>Println</code> доступна из любого пакета, потому что написана с заглавной буквы.</p>
            `
        },
        {
            type: 'info-box',
            variant: 'important',
            content: '<p>В Go <strong>регистр первой буквы — это система контроля доступа</strong>. <code>Println</code> — публичная, доступна всем. <code>println</code> — приватная, только внутри пакета. Это не просто стиль — это правило языка, проверяемое компилятором.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Функции вывода в пакете fmt</h2>
                <p>Пакет <code>fmt</code> — один из самых используемых в Go. Знание его основных функций сэкономит вам много времени при отладке и разработке.</p>
                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead><tr style="background:var(--surface-2)">
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Функция</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Что делает</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Пример</th>
                    </tr></thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>fmt.Println()</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Выводит аргументы через пробел, добавляет \\n в конце</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>fmt.Println("Hi", 42)</code> → <code>Hi 42</code></td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>fmt.Print()</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Выводит без переноса строки</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>fmt.Print("Go")</code> → <code>Go</code></td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>fmt.Printf()</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Форматированный вывод со спецификаторами</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>fmt.Printf("%s: %d", "age", 25)</code></td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>fmt.Sprintf()</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Как Printf, но возвращает строку (не выводит)</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>s := fmt.Sprintf("Hi %s", name)</code></td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>fmt.Errorf()</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Создаёт ошибку с форматированным сообщением</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>fmt.Errorf("user %d not found", id)</code></td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Спецификаторы формата в Printf',
            code: `package main

import "fmt"

func main() {
    name := "Алиса"
    age := 28
    price := 1299.99
    inStock := true

    // %s — строка
    fmt.Printf("Имя: %s\\n", name)

    // %d — целое число (decimal)
    fmt.Printf("Возраст: %d лет\\n", age)

    // %f — дробное число, %.2f — два знака после запятой
    fmt.Printf("Цена: %.2f руб\\n", price)

    // %v — универсальный (любой тип)
    fmt.Printf("В наличии: %v\\n", inStock)

    // %T — тип переменной
    fmt.Printf("Тип name: %T\\n", name) // string

    // %t — bool
    fmt.Printf("Доступно: %t\\n", inStock)
}`,
            explanation: 'Спецификаторы формата начинаются с %. Самый универсальный — %v (value), он работает для любого типа. Используйте %T когда нужно узнать тип переменной — это очень удобно при отладке.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p>Запомните <code>%v</code> — он выведет значение <strong>любого типа</strong> в понятном формате. При отладке используйте <code>%+v</code> для структур (выводит имена полей) и <code>%#v</code> для полного Go-синтаксиса.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Множественный импорт</h2>
                <p>В реальных программах вы всегда подключаете несколько пакетов. Go предоставляет удобный синтаксис группировки — это <strong>idiomatic Go</strong> (принятый стиль):</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Группированный импорт',
            code: `package main

import (
    "fmt"
    "math"
    "strings"
    "time"
)

func main() {
    // math: математические функции
    fmt.Println(math.Sqrt(144))     // 12
    fmt.Println(math.Pi)            // 3.141592...

    // strings: работа со строками
    fmt.Println(strings.ToUpper("hello go")) // HELLO GO
    fmt.Println(strings.Contains("golang", "go")) // true

    // time: работа со временем
    fmt.Println(time.Now().Year())  // текущий год
}`,
            explanation: 'Группировка импортов в круглых скобках — стандарт Go. Инструмент goimports автоматически сортирует их: сначала стандартная библиотека, потом внешние пакеты.'
        },
        {
            type: 'theory',
            content: `
                <h2>Типичные ошибки новичков</h2>
                <p>Разберём ошибки, которые делают все при первом знакомстве с Go. Компилятор поможет их найти, но лучше знать заранее.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Частые ошибки — плохо и хорошо',
            code: `// ❌ Ошибка 1: Импортировали, но не используем
import "fmt"
import "math"  // ОШИБКА: imported and not used: "math"

// ✅ Правильно: используем все импорты
import (
    "fmt"
    "math"
)
func main() {
    fmt.Println(math.Pi) // используем оба пакета
}

// ---

// ❌ Ошибка 2: Неправильный регистр
fmt.println("hello") // ОШИБКА: cannot refer to unexported name fmt.println

// ✅ Правильно:
fmt.Println("hello") // Заглавная P!

// ---

// ❌ Ошибка 3: Нет package main
import "fmt"           // ОШИБКА: ожидается объявление пакета

// ✅ Правильно: package main должен быть первым
package main
import "fmt"

// ---

// ❌ Ошибка 4: Фигурная скобка на новой строке
func main()
{                      // ОШИБКА: синтаксическая ошибка
}

// ✅ Правильно: открывающая скобка на той же строке
func main() {
}`,
            explanation: 'Ошибки 1 и 2 — самые частые. Go компилятор очень строг: неиспользованные импорты = ошибка, неправильный регистр = ошибка. Но это хорошо — такой код чистый.'
        },
        {
            type: 'theory',
            content: `
                <h2>Как запустить Go-программу</h2>
                <p>В реальной работе вы будете использовать два основных способа. Поймите разницу — это важно.</p>
            `
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Запуск программы',
            code: `# Способ 1: go run — компилирует и сразу запускает
# Подходит для разработки и быстрых тестов
go run main.go

# Способ 2: go build — создаёт бинарный файл
# Подходит для деплоя на сервер
go build -o myserver main.go
./myserver

# Проверить установку Go
go version
# go version go1.22.0 linux/amd64

# go run с несколькими файлами
go run *.go

# Сборка для другой платформы (cross-compilation)
# Соберём Linux-бинарник на macOS:
GOOS=linux GOARCH=amd64 go build -o server-linux main.go`,
            explanation: 'go run удобен при разработке — быстро проверить код. go build создаёт файл, который можно скопировать на любую машину с той же ОС и архитектурой и просто запустить — никаких зависимостей не нужно.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p>Кросс-компиляция в Go — это суперсила. Сидите на macOS, а нужен бинарник для Linux-сервера? <code>GOOS=linux go build</code> — и готово. В Python или Java такого нет.</p>'
        },
        {
            type: 'editor',
            title: 'Практика: Персональная визитка',
            instructions: 'Создайте программу-визитку. Объявите переменные с вашим именем, профессией и любимым языком программирования. Выведите их красиво с использованием fmt.Printf и fmt.Println.',
            starterCode: `package main

import "fmt"

func main() {
    // Объявите переменные
    name := "???"
    profession := "???"
    language := "Go"

    // Выведите красивую визитку
    fmt.Println("=== Визитка ===")
    fmt.Printf("Имя: %s\\n", name)
    // Добавьте вывод profession и language
}`,
            hints: [
                'Замените "???" на реальные значения',
                'Используйте fmt.Printf("Профессия: %s\\n", profession)',
                'Попробуйте добавить fmt.Println("===============") для красивой рамки',
                '%s — спецификатор для строк'
            ]
        },
        {
            type: 'theory',
            content: `
                <h2>Что мы узнали</h2>
                <ul>
                    <li>Go создали в Google в 2009 году для решения реальных проблем: медленная компиляция C++, сложность управления конкурентностью</li>
                    <li>Go компилируется в единый бинарник — деплой без зависимостей</li>
                    <li>Каждая Go-программа: <code>package main</code> → <code>import</code> → <code>func main()</code></li>
                    <li>Заглавная буква = публичный доступ, строчная = приватный — это правило языка, не соглашение</li>
                    <li>Неиспользованные импорты — ошибка компиляции. Go не терпит мусора</li>
                    <li><code>fmt.Println</code> для простого вывода, <code>fmt.Printf</code> для форматированного</li>
                    <li><code>go run</code> для разработки, <code>go build</code> для деплоя</li>
                </ul>
                <p><strong>Что дальше:</strong> В следующем уроке разберём систему типов Go — переменные, числа, строки, булевы значения и почему статическая типизация — это ваш друг, а не враг.</p>
            `
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Почему Google создал Go?',
                    options: [
                        'Для замены Python в машинном обучении',
                        'Из-за проблем с медленной компиляцией C++ и сложностью управления конкурентностью',
                        'Для создания мобильных приложений',
                        'Как учебный язык для начинающих'
                    ],
                    correct: 1,
                    explanation: 'Go создавался как решение реальных проблем Google: компиляция C++ занимала 45+ минут, управление потоками было сложным. Нужен был язык с простотой Python, скоростью C и встроенной конкурентностью.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Какой пакет нужно объявить для точки входа в исполняемую программу?',
                    options: ['main', 'app', 'init', 'start'],
                    correct: 0,
                    explanation: 'Пакет main — специальный пакет, который сигнализирует компилятору, что это исполняемая программа, а не библиотека. Функция main() в этом пакете — точка входа.'
                },
                {
                    id: 'q3',
                    type: 'code-fill',
                    question: 'Заполните пропуск, чтобы вывести "Hello, Go!" с переносом строки:',
                    template: 'fmt.___(\"Hello, Go!\")',
                    correct: 'Println',
                    caseSensitive: true,
                    explanation: 'fmt.Println выводит текст с автоматическим переносом строки в конце. Обратите внимание на заглавную P — это обязательно.'
                },
                {
                    id: 'q4',
                    type: 'multiple',
                    question: 'Что из перечисленного является ошибкой компиляции в Go?',
                    options: [
                        'Импортировать пакет и не использовать его',
                        'Использовать fmt.println вместо fmt.Println',
                        'Иметь несколько файлов в одном пакете',
                        'Открывающая { на той же строке, что и func'
                    ],
                    correct: [0, 1],
                    explanation: 'Неиспользованные импорты и неправильный регистр — обе ситуации вызывают ошибку компиляции. Несколько файлов в одном пакете — нормально. Открывающая скобка на той же строке — обязательный стиль Go.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Что такое go build в отличие от go run?',
                    options: [
                        'go build создаёт бинарный файл, go run компилирует и сразу запускает',
                        'go build быстрее чем go run',
                        'go run создаёт бинарник, go build только проверяет код',
                        'Нет разницы'
                    ],
                    correct: 0,
                    explanation: 'go run — для разработки (компилирует во временный файл и сразу запускает). go build — создаёт постоянный бинарник для деплоя, который можно запустить без Go на любой машине с той же ОС.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Какой спецификатор fmt.Printf работает с ЛЮБЫМ типом данных?',
                    options: ['%v', '%s', '%d', '%a'],
                    correct: 0,
                    explanation: '%v (value) — универсальный спецификатор в Go. Он выводит значение в формате по умолчанию для любого типа: число, строку, struct, слайс, map. %+v добавляет имена полей структуры.'
                },
                {
                    id: 'q7',
                    type: 'multiple',
                    question: 'Какие пакеты входят в стандартную библиотеку Go?',
                    options: ['fmt', 'net/http', 'os', 'numpy', 'strings'],
                    correct: [0, 1, 2, 4],
                    explanation: 'fmt, net/http, os и strings — стандартные пакеты Go, входят без установки. numpy — библиотека Python для научных вычислений, в Go нет.'
                }
            ]
        }
    ]
};
