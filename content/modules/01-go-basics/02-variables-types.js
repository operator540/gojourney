export default {
    id: '01-02',
    title: 'Переменные и типы данных',
    description: 'Зачем нужны типы, объявление переменных, числа, строки, bool, zero values, константы',
    estimatedTime: 35,
    xpReward: 35,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Зачем нужны типы? История без них</h2>
                <p>Представьте, что вы пишете интернет-магазин. У вас есть переменная <code>price</code> — цена товара. Без типов что это может быть? Число 1299? Строка "1299"? Строка "1299.99 руб"? Объект <code>{amount: 1299, currency: "RUB"}</code>? Вы не знаете.</p>
                <p>Теперь другой разработчик берёт вашу <code>price</code> и прибавляет скидку: <code>price - 100</code>. Если <code>price</code> — строка "1299", он получит NaN или ошибку во время выполнения. Программа падает у клиента в момент покупки. Хорошее настроение.</p>
                <p>Статическая типизация (Go, Java, Rust) решает это <em>до запуска</em>. Вы объявляете <code>var price float64 = 1299.99</code> — и компилятор <em>гарантирует</em>, что price всегда будет числом с плавающей точкой. Если кто-то попытается присвоить строку — ошибка компиляции. Не в продакшне. Не у клиента. <strong>На вашей машине до деплоя.</strong></p>
                <p>Цена за это — чуть больше кода при объявлении переменных. Но это честный обмен.</p>
            `
        },
        {
            type: 'info-box',
            variant: 'note',
            content: '<p>Go — <strong>статически типизированный</strong> язык: тип каждой переменной известен в момент компиляции. Python и JavaScript — динамически типизированы: тип определяется только во время выполнения. Оба подхода имеют плюсы, но для больших систем статическая типизация снижает количество ошибок в продакшне.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Три способа объявить переменную</h2>
                <p>Go даёт вам три способа — и у каждого своё место. Выбор не случаен: каждый вариант решает конкретную задачу. Разберём когда что использовать.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Три способа объявления переменных',
            code: `package main

import "fmt"

// На уровне пакета — только var
var siteName string = "GoShop"
var version = 2  // тип определяется автоматически

func main() {
    // Способ 1: var с явным типом
    // Используйте когда тип важно показать явно
    var userName string = "alice"
    var itemCount int = 0

    // Способ 2: var с автоопределением типа
    // Тип выводится из значения справа
    var productName = "Ноутбук Pro"
    var price = 89999.99  // Go определит float64

    // Способ 3: краткое объявление := (самое частое)
    // Только внутри функций!
    city := "Москва"
    isLoggedIn := true

    fmt.Println(userName, itemCount, productName, price, city, isLoggedIn)
}`,
            explanation: ':= — это одновременно объявление И присваивание. Go сам определяет тип по значению справа. Это не "динамическая типизация" — тип всё ещё фиксируется навсегда в момент объявления.'
        },
        {
            type: 'theory',
            content: `
                <h2>Когда что использовать?</h2>
                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead><tr style="background:var(--surface-2)">
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Ситуация</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Способ</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Пример</th>
                    </tr></thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Уровень пакета (вне функций)</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>var</code></td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>var dbURL string = "..."</code></td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Нулевое значение (объявить без инициализации)</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>var</code></td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>var count int</code></td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Хочу явно показать тип</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>var</code> с типом</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>var timeout time.Duration = 5 * time.Second</code></td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Обычное объявление внутри функции</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>:=</code></td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>user := fetchUser(id)</code></td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Получить несколько значений из функции</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>:=</code></td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>result, err := db.Query(...)</code></td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'info-box',
            variant: 'important',
            content: '<p><code>:=</code> работает <strong>только внутри функций</strong>. На уровне пакета (вне функций) — только <code>var</code>. Попытка использовать <code>:=</code> на уровне пакета — ошибка компиляции.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Числовые типы Go — полная таблица</h2>
                <p>Go явен в вопросах чисел. Вы точно знаете, сколько памяти занимает каждый тип и какой диапазон он поддерживает. Это важно при работе с базами данных, сетевыми протоколами и оптимизацией памяти.</p>
                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead><tr style="background:var(--surface-2)">
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Тип</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Размер</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Диапазон</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Когда использовать</th>
                    </tr></thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>int</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">32 или 64 бит</td>
                            <td style="padding:10px;border:1px solid var(--border)">платформозависимый</td>
                            <td style="padding:10px;border:1px solid var(--border)">Большинство случаев — счётчики, индексы</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>int8</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">1 байт</td>
                            <td style="padding:10px;border:1px solid var(--border)">-128 до 127</td>
                            <td style="padding:10px;border:1px solid var(--border)">Малые целые числа, экономия памяти</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>int16</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">2 байта</td>
                            <td style="padding:10px;border:1px solid var(--border)">-32768 до 32767</td>
                            <td style="padding:10px;border:1px solid var(--border)">Порты TCP (0-65535 → uint16)</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>int32</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">4 байта</td>
                            <td style="padding:10px;border:1px solid var(--border)">-2.1 млрд до 2.1 млрд</td>
                            <td style="padding:10px;border:1px solid var(--border)">Unix timestamp до 2038 года, rune</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>int64</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">8 байт</td>
                            <td style="padding:10px;border:1px solid var(--border)">-9.2 квинтиллиона до 9.2 квинтиллиона</td>
                            <td style="padding:10px;border:1px solid var(--border)">Unix timestamp в наносекундах, большие ID</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>uint</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">32 или 64 бит</td>
                            <td style="padding:10px;border:1px solid var(--border)">0 до максимума</td>
                            <td style="padding:10px;border:1px solid var(--border)">Когда число не может быть отрицательным</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>float32</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">4 байта</td>
                            <td style="padding:10px;border:1px solid var(--border)">~6-7 значимых цифр</td>
                            <td style="padding:10px;border:1px solid var(--border)">Графика, координаты (там float32 достаточно)</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>float64</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">8 байт</td>
                            <td style="padding:10px;border:1px solid var(--border)">~15-16 значимых цифр</td>
                            <td style="padding:10px;border:1px solid var(--border)">Деньги (с осторожностью!), физика, математика</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>byte</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">1 байт</td>
                            <td style="padding:10px;border:1px solid var(--border)">0 до 255</td>
                            <td style="padding:10px;border:1px solid var(--border)">Алиас uint8. Данные файлов, HTTP body, ASCII</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>rune</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">4 байта</td>
                            <td style="padding:10px;border:1px solid var(--border)">0 до 1,114,111</td>
                            <td style="padding:10px;border:1px solid var(--border)">Алиас int32. Unicode символ (кириллица, эмодзи)</td>
                        </tr>
                    </tbody>
                </table>
                <p style="margin-top:12px"><strong>Практическое правило:</strong> используйте <code>int</code> для большинства целых чисел и <code>float64</code> для дробных. Специфические типы — только когда есть чёткая причина.</p>
            `
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p><strong>Деньги и float64</strong>: float64 имеет ошибки округления. <code>0.1 + 0.2 != 0.3</code> — это математика IEEE 754, не баг Go. Для финансовых расчётов используйте целые числа (копейки, центы) или специальные библиотеки типа <code>shopspring/decimal</code>.</p>'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Реальный пример: товар в интернет-магазине',
            code: `package main

import "fmt"

func main() {
    // Описание товара в интернет-магазине
    productName := "Ноутбук Dell XPS 15"
    productID   := 42891
    price       := 129999.99   // float64 по умолчанию
    inStock     := true
    stockCount  := 7           // int по умолчанию
    rating      := 4.8         // float64
    category    := "Электроника"

    fmt.Println("=== Карточка товара ===")
    fmt.Printf("ID:       %d\\n", productID)
    fmt.Printf("Название: %s\\n", productName)
    fmt.Printf("Категория: %s\\n", category)
    fmt.Printf("Цена:     %.2f руб\\n", price)
    fmt.Printf("В наличии: %t\\n", inStock)
    fmt.Printf("Остаток:  %d шт\\n", stockCount)
    fmt.Printf("Рейтинг:  %.1f/5.0\\n", rating)

    // Расчёт со скидкой 15%
    discount := 0.15
    finalPrice := price * (1 - discount)
    fmt.Printf("\\nЦена со скидкой 15%%: %.2f руб\\n", finalPrice)
}`,
            explanation: 'Обратите внимание: Go сам вывел типы. productName — string, productID — int, price — float64, inStock — bool. Типы определяются по форме значения: 42891 → int, 129999.99 → float64, true → bool, "текст" → string.'
        },
        {
            type: 'theory',
            content: `
                <h2>Нулевые значения (zero values) — Go без undefined</h2>
                <p>В JavaScript вы постоянно проверяете <code>if (x !== undefined && x !== null)</code>. В Python — <code>if x is not None</code>. В Go этой проблемы нет для базовых типов: каждая переменная <strong>всегда инициализирована</strong>.</p>
                <p>Если вы объявляете переменную без присваивания — она получает нулевое значение своего типа:</p>
                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead><tr style="background:var(--surface-2)">
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Тип</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Нулевое значение</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Практический смысл</th>
                    </tr></thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>int</code>, <code>int64</code>, и другие целые</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>0</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Счётчик начинается с нуля</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>float32</code>, <code>float64</code></td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>0.0</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Цена по умолчанию = 0</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>string</code></td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>""</code> (пустая строка)</td>
                            <td style="padding:10px;border:1px solid var(--border)">Имя не указано — пустая строка</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>bool</code></td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>false</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">По умолчанию выключено, не активировано</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>[]int</code> (слайс)</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>nil</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Пустой список</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>map[k]v</code></td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>nil</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Пустая карта (читать — ок, писать — panic!)</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>*T</code> (указатель)</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>nil</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Нет объекта</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Zero values на практике',
            code: `package main

import "fmt"

// User описывает пользователя системы
type User struct {
    Name     string  // "" по умолчанию
    Age      int     // 0 по умолчанию
    IsAdmin  bool    // false по умолчанию
    Balance  float64 // 0.0 по умолчанию
}

func main() {
    // Все поля получат нулевые значения автоматически
    var newUser User
    fmt.Printf("Имя: '%s'\\n", newUser.Name)     // Имя: ''
    fmt.Printf("Возраст: %d\\n", newUser.Age)     // Возраст: 0
    fmt.Printf("Админ: %t\\n", newUser.IsAdmin)   // Админ: false
    fmt.Printf("Баланс: %.2f\\n", newUser.Balance) // Баланс: 0.00

    // Базовые типы
    var count int
    var message string
    var active bool
    fmt.Println(count, message, active) // 0  false
}`,
            explanation: 'Go гарантирует: объявленная переменная никогда не содержит "мусор" из памяти. Это предотвращает целый класс багов, характерных для C/C++.'
        },
        {
            type: 'theory',
            content: `
                <h2>Константы и iota</h2>
                <p>Константы в Go объявляются через <code>const</code>. Их значение вычисляется <em>во время компиляции</em> и не может изменяться. Они удобны для магических чисел — когда вы хотите дать число понятное имя.</p>
                <p>Представьте: у вас в коде встречается число 404 в 50 местах. Что это? HTTP статус? ID пользователя? Константа <code>StatusNotFound = 404</code> убирает эту неопределённость.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Константы и iota',
            code: `package main

import "fmt"

// Одиночные константы
const Pi = 3.14159265
const AppName = "GoShop"
const MaxRetries = 3

// Блок констант — удобно для группировки
const (
    StatusOK        = 200
    StatusBadRequest = 400
    StatusNotFound  = 404
    StatusError     = 500
)

// iota — автоинкремент для перечислений (аналог enum)
// Начинается с 0 и увеличивается на 1 в каждом блоке
const (
    OrderPending   = iota // 0
    OrderConfirmed        // 1
    OrderShipped          // 2
    OrderDelivered        // 3
    OrderCancelled        // 4
)

// iota с выражением — статусы прав доступа через битовые флаги
const (
    ReadPermission  = 1 << iota // 1 (001)
    WritePermission             // 2 (010)
    AdminPermission             // 4 (100)
)

func main() {
    orderStatus := OrderShipped
    fmt.Println("Статус заказа:", orderStatus) // 2

    // Проверка прав через битовые операции
    userPerm := ReadPermission | WritePermission  // 3 (011)
    canWrite := userPerm & WritePermission != 0
    fmt.Println("Может писать:", canWrite) // true
}`,
            explanation: 'iota — мощный инструмент Go для создания перечислений. Сбрасывается в 0 в каждом новом блоке const. Выражение "1 << iota" создаёт степени двойки: 1, 2, 4, 8... — идеально для битовых флагов (права доступа, режимы работы).'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p>В Go нет ключевого слова <code>enum</code>. Его роль выполняет комбинация <code>const</code> + <code>iota</code> + именованный тип. Это идиоматический Go-способ создания перечислений.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Преобразование типов — Go строг</h2>
                <p>Go <strong>никогда не делает неявных преобразований</strong>. В Python вы можете сложить int и float — Python сам преобразует. В Go это ошибка компиляции. Зачем? Чтобы вы точно понимали, что происходит с данными.</p>
                <p>Это особенно важно при работе с числами: потеря точности при конвертации <code>float64 → int</code> (дробная часть отрезается) должна быть явной, чтобы вы осознанно принимали это решение.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Явное преобразование типов',
            code: `package main

import (
    "fmt"
    "strconv"
)

func main() {
    // Числовые преобразования — всегда явные
    var itemCount int = 5
    var pricePerItem float64 = 299.99

    // ❌ Нельзя: несовместимые типы
    // total := itemCount * pricePerItem  // ошибка компиляции!

    // ✅ Нужно явно привести тип
    total := float64(itemCount) * pricePerItem
    fmt.Printf("Итого: %.2f руб\\n", total) // 1499.95

    // float64 → int отрезает дробную часть (не округляет!)
    price := 99.99
    priceInt := int(price)
    fmt.Println(priceInt) // 99, не 100!

    // ---
    // Строки и числа — через пакет strconv
    // int → string: НЕ string(42)! string(42) = "*" (Unicode символ)
    id := 42
    idStr := strconv.Itoa(id)        // "42"
    fmt.Printf("ID как строка: %q\\n", idStr) // "42"

    // string → int
    userInput := "1337"
    num, err := strconv.Atoi(userInput)
    if err != nil {
        fmt.Println("Не число:", err)
    } else {
        fmt.Println("Число:", num * 2) // 2674
    }

    // Универсальный способ числа в строку
    msg := fmt.Sprintf("У вас %d заказов", 7)
    fmt.Println(msg) // У вас 7 заказов
}`,
            explanation: 'Запомните ловушку: string(65) = "A" (Unicode символ с кодом 65), а НЕ строка "65". Для конвертации числа в строку: strconv.Itoa() или fmt.Sprintf(). Это одна из самых частых ошибок новичков в Go.'
        },
        {
            type: 'info-box',
            variant: 'important',
            content: '<p><strong>Ловушка:</strong> <code>string(72)</code> вернёт <code>"H"</code> (символ с Unicode кодом 72), а не строку <code>"72"</code>. Используйте <code>strconv.Itoa(72)</code> или <code>fmt.Sprintf("%d", 72)</code> для конвертации числа в его строковое представление.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Типичные ошибки с переменными</h2>
                <p>Go компилятор строг и поймает эти ошибки до запуска. Но лучше знать их заранее.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Частые ошибки новичков',
            code: `// ❌ Ошибка 1: объявили переменную, не использовали
func main() {
    unusedVar := 42
    // ОШИБКА: unusedVar declared and not used
}

// ✅ Правильно: используем или игнорируем через _
func main() {
    result, _ := compute()  // _ игнорирует второе значение
    fmt.Println(result)
}

// ---

// ❌ Ошибка 2: := на уровне пакета
package main
x := 10  // ОШИБКА: syntax error

// ✅ Правильно: var на уровне пакета
var x = 10

// ---

// ❌ Ошибка 3: смешивание несовместимых типов
a := 10      // int
b := 3.14    // float64
c := a + b   // ОШИБКА: mismatched types int and float64

// ✅ Явное преобразование
c := float64(a) + b

// ---

// ❌ Ошибка 4: переприсваивание с := (вместо =)
name := "Alice"
name := "Bob"  // ОШИБКА: no new variables on left side of :=

// ✅ Для переприсваивания используйте =
name := "Alice"
name = "Bob"   // OK`,
            explanation: 'Ошибка 1 самая болезненная для новичков — Go буквально не позволяет писать неиспользуемый код. Это принудительная чистота. Ошибка 4: := создаёт НОВУЮ переменную, = присваивает значение существующей.'
        },
        {
            type: 'editor',
            title: 'Практика: Карточка товара',
            instructions: 'Создайте программу, которая описывает товар в интернет-магазине. Объявите переменные: название (string), цена (float64), количество на складе (int), доступен ли (bool), рейтинг (float64). Рассчитайте итоговую стоимость с НДС 20% и выведите всё красиво.',
            starterCode: `package main

import "fmt"

func main() {
    // Объявите переменные товара
    name := "???"
    price := 0.0
    stock := 0
    available := false
    rating := 0.0

    // НДС 20%
    vatRate := 0.20
    priceWithVAT := price * (1 + vatRate)

    // Выведите карточку товара
    fmt.Println("=== Товар ===")
    fmt.Printf("Название: %s\\n", name)
    // Добавьте остальные поля
    fmt.Printf("Цена с НДС: %.2f руб\\n", priceWithVAT)
}`,
            hints: [
                'name := "Samsung Galaxy S24" — строка',
                'price := 79999.99 — float64',
                'stock := 15 — int (количество)',
                'available := stock > 0 — bool из условия',
                'rating := 4.7 — float64',
                'fmt.Printf("Рейтинг: %.1f\\n", rating) — один знак после точки'
            ]
        },
        {
            type: 'theory',
            content: `
                <h2>Что мы узнали</h2>
                <ul>
                    <li>Статическая типизация — это защита: ошибки типов находятся на этапе компиляции, а не в продакшне</li>
                    <li>Три способа объявления: <code>var</code> с типом, <code>var</code> без типа, <code>:=</code> (только в функциях)</li>
                    <li><code>:=</code> — объявление и присваивание одновременно. Компилятор сам выводит тип</li>
                    <li>Числовые типы: <code>int</code> и <code>float64</code> для большинства задач. Специфические — только при необходимости</li>
                    <li>Zero values: каждый тип имеет нулевое значение. Нет undefined/null для базовых типов</li>
                    <li>Явные преобразования: <code>float64(x)</code>, <code>strconv.Itoa(n)</code>. Неявных нет</li>
                    <li>Константы через <code>const</code> и <code>iota</code> для перечислений</li>
                    <li>Неиспользованная переменная = ошибка компиляции. Go заставляет писать чистый код</li>
                </ul>
                <p><strong>Что дальше:</strong> В следующем уроке разберём управление потоком выполнения — if, switch и единственный цикл for, который заменяет все циклы других языков.</p>
            `
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Какое нулевое значение у типа string в Go?',
                    options: ['null', 'nil', '"" (пустая строка)', 'undefined'],
                    correct: 2,
                    explanation: 'Нулевое значение string — пустая строка "". Go гарантирует, что все переменные инициализированы: нет "мусора" из памяти, нет undefined. nil используется только для указателей, слайсов, map, каналов и интерфейсов.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Где НЕЛЬЗЯ использовать оператор :=?',
                    options: [
                        'На уровне пакета (вне функций)',
                        'Внутри func main()',
                        'Внутри цикла for',
                        'В условии if'
                    ],
                    correct: 0,
                    explanation: 'Оператор := работает только внутри функций. На уровне пакета (вне любых функций) — только var. Попытка использовать := на уровне пакета вызывает синтаксическую ошибку компиляции.'
                },
                {
                    id: 'q3',
                    type: 'code-fill',
                    question: 'Как правильно преобразовать int в строку "42" (не в символ)?',
                    template: 'strconv.___(42)',
                    correct: 'Itoa',
                    caseSensitive: true,
                    explanation: 'strconv.Itoa (Integer to ASCII) конвертирует int в его строковое представление. string(42) = "*" (Unicode символ 42), что является распространённой ошибкой новичков.'
                },
                {
                    id: 'q4',
                    type: 'multiple',
                    question: 'Какие из этих объявлений переменных корректны в Go?',
                    options: [
                        'var x int = 10',
                        'x := 10',
                        'var x = 10',
                        'int x = 10'
                    ],
                    correct: [0, 1, 2],
                    explanation: 'Все три первых варианта корректны: var с типом, := (краткое), var без типа. Четвёртый — синтаксис C/Java/C#, в Go такой синтаксис не существует.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Что выведет: fmt.Println(string(65))?',
                    options: ['"65"', '"A"', 'Ошибку компиляции', '65'],
                    correct: 1,
                    explanation: 'string(65) конвертирует целое число в Unicode символ с этим кодом. Код 65 = буква "A". Для получения строки "65" используйте strconv.Itoa(65) или fmt.Sprintf("%d", 65).'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Что произойдёт если объявить переменную x := 42 и нигде её не использовать?',
                    options: [
                        'Ошибка компиляции: x declared and not used',
                        'Предупреждение при компиляции',
                        'Программа скомпилируется нормально',
                        'Переменная будет удалена оптимизатором'
                    ],
                    correct: 0,
                    explanation: 'Go не позволяет объявлять переменные и не использовать их — это ошибка компиляции, а не предупреждение. Это дизайнерское решение для поддержания чистоты кода. Используйте _ для явного игнорирования: _ = compute().'
                },
                {
                    id: 'q7',
                    type: 'multiple',
                    question: 'Какие утверждения о константах (const) в Go верны?',
                    options: [
                        'Значение вычисляется во время компиляции',
                        'iota автоинкрементируется в блоке const',
                        'Константы можно изменить во время выполнения',
                        'Тип константы может быть выведен автоматически'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'Константы вычисляются при компиляции и неизменны. iota — счётчик, начинающийся с 0 в каждом блоке const. Тип константы можно не указывать — компилятор выведет его. Изменить константу во время выполнения невозможно — это и есть смысл const.'
                }
            ]
        }
    ]
};
