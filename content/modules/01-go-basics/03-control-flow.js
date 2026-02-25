export default {
    id: '01-03',
    title: 'Условия и циклы',
    description: 'if/else без скобок, switch без break, единственный цикл for и его вариации, range',
    estimatedTime: 35,
    xpReward: 30,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Программа без условий — это рецепт без "если"</h2>
                <p>Представьте рецепт пиццы: "добавьте соус, сыр, выпекайте 15 минут". Звучит хорошо — пока ваша духовка не нагревается до нужной температуры. Или пока вы вегетарианец. Или пока мука закончилась. Рецепт без условий работает только в идеальном мире.</p>
                <p>Программы живут в реальном мире. Пользователь вводит неверный email. Сервер недоступен. Товар закончился на складе. HTTP запрос вернул 404. Без условных конструкций программа не может реагировать на реальность — она просто выполняет шаги по очереди и падает при первой нештатной ситуации.</p>
                <p>Условия (<code>if</code>, <code>switch</code>) и циклы (<code>for</code>) — это инструменты принятия решений. С ними программа перестаёт быть скриптом и становится умной системой, способной реагировать на входные данные.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>if / else — знакомо, но с нюансами Go</h2>
                <p>Go-шный <code>if</code> выглядит знакомо, если вы писали на C, Java или JavaScript. Но есть два важных отличия, которые делают код чище:</p>
                <ol>
                    <li><strong>Круглые скобки вокруг условия — НЕ нужны</strong> (и считаются плохим стилем)</li>
                    <li><strong>Фигурные скобки — ОБЯЗАТЕЛЬНЫ</strong>, даже для однострочного блока</li>
                </ol>
                <p>Эти правила убирают целый класс багов из C/JavaScript, где <code>if (x) doA(); doB();</code> выглядит как условный блок, но <code>doB()</code> выполняется всегда.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'if / else в Go',
            code: `package main

import "fmt"

func main() {
    orderTotal := 4500.0  // рублей

    // Скобки вокруг условия НЕ нужны
    // Фигурные скобки ОБЯЗАТЕЛЬНЫ
    if orderTotal >= 5000 {
        fmt.Println("Бесплатная доставка!")
    } else if orderTotal >= 2000 {
        fmt.Println("Скидка на доставку 50%")
    } else {
        fmt.Println("Стандартная доставка 299 руб")
    }

    // Составные условия
    userAge := 22
    hasAccount := true

    if userAge >= 18 && hasAccount {
        fmt.Println("Доступ разрешён")
    }

    // Отрицание
    isBlocked := false
    if !isBlocked {
        fmt.Println("Пользователь активен")
    }
}`,
            explanation: 'Операторы сравнения: == (равно), != (не равно), >, >=, <, <=. Логические: && (И), || (ИЛИ), ! (НЕ). Нет тернарного оператора (x ? a : b) — в Go только полный if/else.'
        },
        {
            type: 'info-box',
            variant: 'note',
            content: '<p>В Go нет тернарного оператора <code>x ? a : b</code>. Создатели намеренно убрали его — он часто создаёт нечитаемые вложенные выражения. Пишите полный <code>if/else</code> — код будет понятнее.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>if с инициализацией — уникальность Go</h2>
                <p>В Go можно объявить переменную прямо в заголовке <code>if</code>. Эта переменная будет видна <em>только внутри блока if/else</em> — нигде больше. Это важная особенность, которой нет в большинстве языков.</p>
                <p>Зачем это нужно? Это идиоматический способ обработки ошибок в Go. Переменная <code>err</code> часто нужна только чтобы проверить — произошла ли ошибка — и не должна "протекать" за пределы блока.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'if с инициализацией — идиоматичный Go',
            code: `package main

import (
    "fmt"
    "strconv"
)

func main() {
    userInput := "42"

    // Форма: if инициализация; условие { ... }
    // err доступна только внутри if/else блока
    if num, err := strconv.Atoi(userInput); err != nil {
        fmt.Println("Ошибка: введено не число:", err)
    } else {
        fmt.Printf("Число: %d, удвоенное: %d\\n", num, num*2)
    }
    // num и err здесь НЕДОСТУПНЫ — они вне скоупа

    // Ещё пример — поиск пользователя в базе
    users := map[string]int{
        "alice": 30,
        "bob":   25,
    }

    if age, ok := users["alice"]; ok {
        fmt.Printf("Алисе %d лет\\n", age)
    } else {
        fmt.Println("Пользователь не найден")
    }
}`,
            explanation: 'Синтаксис: if init; condition { }. Переменные из init доступны в обоих блоках — if и else, но не за их пределами. Это ограничение области видимости помогает избежать случайного использования переменной после того, как она больше не актуальна.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p>Паттерн <code>if value, ok := map[key]; ok { ... }</code> — один из самых частых в Go. Запомните его. Он используется с map, type assertion, channel receive. Это "comma-ok idiom" — второе значение говорит об успехе операции.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>switch — без break и мощнее чем в C</h2>
                <p>В C, Java, JavaScript — если вы забыли <code>break</code> в <code>switch</code>, выполнение "проваливается" в следующий case. Это источник бесчисленных багов. В Go <strong>каждый case автоматически завершается</strong>. Хотите "провалиться" — используйте явный <code>fallthrough</code>.</p>
                <p>Go-switch намного гибче: можно сравнивать строки, можно использовать без аргумента (как цепочку if/else), можно перечислять несколько значений в одном case.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'switch по значению',
            code: `package main

import "fmt"

func processOrderStatus(status string) string {
    switch status {
    case "pending":
        return "Заказ ожидает обработки"
    case "confirmed":
        return "Заказ подтверждён"
    case "shipped":
        return "Заказ отправлен"
    case "delivered":
        return "Заказ доставлен"
    case "cancelled", "refunded":  // несколько значений в одном case
        return "Заказ отменён или возвращён"
    default:
        return "Неизвестный статус: " + status
    }
}

func main() {
    statuses := []string{"pending", "shipped", "cancelled", "unknown"}
    for _, s := range statuses {
        fmt.Printf("%-12s → %s\\n", s, processOrderStatus(s))
    }
}`,
            explanation: 'Нет break — каждый case завершается автоматически. Несколько значений в одном case через запятую. default — как else: срабатывает если ничего не совпало. Это реальный пример из e-commerce системы.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'switch без аргумента — замена if/else if',
            code: `package main

import "fmt"

func classifyScore(score int) string {
    // switch без аргумента — это чистая цепочка условий
    switch {
    case score >= 90:
        return "Отлично (A)"
    case score >= 75:
        return "Хорошо (B)"
    case score >= 60:
        return "Удовлетворительно (C)"
    case score >= 45:
        return "Слабо (D)"
    default:
        return "Неудовлетворительно (F)"
    }
}

func main() {
    scores := []int{95, 82, 67, 50, 30}
    for _, s := range scores {
        fmt.Printf("Баллы: %d → %s\\n", s, classifyScore(s))
    }
}`,
            explanation: 'switch без аргумента — это более чистая альтернатива длинным цепочкам if/else if. Каждый case — произвольное булевое выражение. Первое совпавшее условие выполняется, остальные игнорируются.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p>Используйте <code>switch</code> вместо длинных цепочек <code>if/else if</code> — код становится чище. Правило: 3+ условия → лучше switch. 1-2 условия → if/else.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>for — единственный цикл Go, но он за всех</h2>
                <p>В Go есть <strong>только один цикл — <code>for</code></strong>. Нет while, нет do-while, нет foreach. Но <code>for</code> настолько гибкий, что заменяет все эти конструкции. Это принципиальное решение дизайнеров: не множить количество похожих конструкций.</p>
                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead><tr style="background:var(--surface-2)">
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Другие языки</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Go эквивалент</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Когда использовать</th>
                    </tr></thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>for (i=0; i&lt;n; i++)</code></td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>for i := 0; i &lt; n; i++</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Счётчик, известное число итераций</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>while (condition)</code></td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>for condition { }</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Цикл до выполнения условия</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>while (true)</code></td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>for { }</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Сервер/демон, бесконечная обработка</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>foreach item in list</code></td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>for i, v := range list</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Перебор коллекций</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>do { } while (cond)</code></td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>for { ...; if !cond { break } }</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Выполнить хотя бы один раз</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph TD
    A["for — единственный цикл Go"] --> B["Классический\nfor i := 0; i < n; i++"]
    A --> C["While-форма\nfor condition { }"]
    A --> D["Бесконечный\nfor { }"]
    A --> E["Range-форма\nfor i, v := range collection"]
    style A fill:#00add8,color:#fff
    style B fill:#d97706,color:#fff
    style C fill:#10b981,color:#fff
    style D fill:#ce3263,color:#fff
    style E fill:#8b5cf6,color:#fff`,
            caption: 'Четыре формы одного цикла for в Go'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Классический for — счётчик',
            code: `package main

import "fmt"

func main() {
    // Вывести таблицу цен со скидками
    basePrice := 1000.0

    fmt.Println("Скидка | Цена")
    fmt.Println("-------|------")
    for discount := 0; discount <= 50; discount += 10 {
        finalPrice := basePrice * (1 - float64(discount)/100)
        fmt.Printf("  %2d%%  | %.0f руб\\n", discount, finalPrice)
    }
}`,
            explanation: 'Классический for: инициализация; условие; инкремент. Шаг может быть любым: i++, i--, i += 10, i *= 2. Обратный счётчик: for i := 10; i >= 0; i--.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'for как while — ждём условия',
            code: `package main

import (
    "fmt"
    "math/rand"
)

func main() {
    // Симуляция повторных попыток подключения к серверу
    attempts := 0
    maxAttempts := 5
    connected := false

    for !connected && attempts < maxAttempts {
        attempts++
        // Симулируем случайный успех (30% шанс)
        if rand.Intn(10) < 3 {
            connected = true
        } else {
            fmt.Printf("Попытка %d: сервер недоступен\\n", attempts)
        }
    }

    if connected {
        fmt.Printf("Подключено за %d попыток!\\n", attempts)
    } else {
        fmt.Println("Не удалось подключиться")
    }
}`,
            explanation: 'for с одним условием — это while из других языков. Здесь мы повторяем попытки подключения пока не подключились ИЛИ пока не исчерпали лимит. Типичный паттерн в сетевых приложениях.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'for range — перебор коллекций',
            code: `package main

import "fmt"

func main() {
    // Перебор слайса с индексом и значением
    cart := []string{"Ноутбук", "Мышь", "Клавиатура", "Коврик"}

    fmt.Println("Ваша корзина:")
    for i, item := range cart {
        fmt.Printf("  %d. %s\\n", i+1, item)
    }

    // Если индекс не нужен — используем _
    prices := []float64{89999.0, 2500.0, 5990.0, 890.0}
    total := 0.0
    for _, price := range prices {
        total += price
    }
    fmt.Printf("\\nИтого: %.2f руб\\n", total)

    // Перебор map
    inventory := map[string]int{
        "Ноутбук":    3,
        "Мышь":       15,
        "Клавиатура": 8,
    }
    fmt.Println("\\nСклад:")
    for product, count := range inventory {
        fmt.Printf("  %-12s: %d шт\\n", product, count)
    }

    // Перебор строки — range даёт руны (Unicode символы)
    for i, ch := range "Go!" {
        fmt.Printf("Позиция %d: %c (код %d)\\n", i, ch, ch)
    }
}`,
            explanation: 'range — самый чистый способ перебора. Возвращает (индекс, значение) для слайсов, (ключ, значение) для map, (байтовая позиция, rune) для строк. Ненужное значение заменяйте _.'
        },
        {
            type: 'theory',
            content: `
                <h2>break, continue и именованные метки</h2>
                <p><code>break</code> — немедленный выход из цикла. <code>continue</code> — пропустить текущую итерацию и перейти к следующей. Оба работают только с ближайшим (внутренним) циклом. Для выхода из вложенных циклов — именованные метки.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'break, continue и метки',
            code: `package main

import "fmt"

func main() {
    // continue: пропустить элементы с нулевой ценой
    prices := []float64{100.0, 0, 250.0, 0, 75.0}
    total := 0.0
    for _, p := range prices {
        if p == 0 {
            continue // пропускаем нулевые цены
        }
        total += p
    }
    fmt.Printf("Сумма (без нулей): %.2f\\n", total) // 425.00

    // break: найти первый товар дороже 200 руб
    found := ""
    products := map[string]float64{
        "Ручка": 50, "Тетрадь": 120, "Планшет": 15000, "Маркер": 80,
    }
    for name, price := range products {
        if price > 200 {
            found = name
            break // нашли первый — выходим
        }
    }
    fmt.Println("Дорогой товар:", found)

    // Именованные метки для выхода из вложенных циклов
    matrix := [][]int{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}
    target := 5

outer: // метка для внешнего цикла
    for row, rowData := range matrix {
        for col, val := range rowData {
            if val == target {
                fmt.Printf("Найдено %d на позиции [%d][%d]\\n", target, row, col)
                break outer // выходим из ОБОИХ циклов
            }
        }
    }
}`,
            explanation: 'continue пропускает остаток тела цикла для текущей итерации. break прерывает цикл. Метки (outer:) позволяют break/continue управлять внешним циклом — это чище, чем флаг-переменная.'
        },
        {
            type: 'info-box',
            variant: 'note',
            content: '<p>Именованные метки используются редко. Если вам часто нужен <code>break outer</code> — это сигнал, что логику лучше вынести в отдельную функцию. Ранний <code>return</code> из функции часто чище, чем сложные метки.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Типичные ошибки с циклами и условиями</h2>
                <p>Разберём ошибки, которые делают при первом знакомстве с Go-специфичными конструкциями.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Частые ошибки',
            code: `// ❌ Ошибка 1: скобки вокруг условия (как в C/Java)
if (age >= 18) {  // Компилируется, но это bad style в Go
    // ...
}

// ✅ Go-стиль: без скобок
if age >= 18 {
    // ...
}

// ---

// ❌ Ошибка 2: нет фигурных скобок (как в C)
if age >= 18
    fmt.Println("OK")  // ОШИБКА синтаксиса

// ✅ Фигурные скобки обязательны
if age >= 18 {
    fmt.Println("OK")
}

// ---

// ❌ Ошибка 3: изменение переменной цикла вместо slice
items := []int{1, 2, 3}
for _, v := range items {
    v *= 2  // меняем КОПИЮ, items не изменится!
}
fmt.Println(items) // [1 2 3] — не изменился!

// ✅ Изменять по индексу
for i := range items {
    items[i] *= 2  // меняем по индексу
}
fmt.Println(items) // [2 4 6] — изменился

// ---

// ❌ Ошибка 4: бесконечный цикл без break
for i := 0; i < 10; i++ {
    if i == 5 {
        // Забыли break — цикл продолжается!
    }
    fmt.Println(i) // выводит 0,1,2,3,4,5,6,7,8,9
}`,
            explanation: 'Ошибка 3 — классика Go. range возвращает КОПИЮ значения. Если нужно изменить элементы слайса — используйте индекс: for i := range s { s[i] = ... }.'
        },
        {
            type: 'editor',
            title: 'Практика: Обработка заказов',
            instructions: 'Напишите программу, которая обрабатывает список заказов. Для каждого заказа выведите его статус. Заказы дороже 10000 руб — "VIP обработка". Отменённые заказы — пропустить. Подсчитайте общую сумму активных заказов.',
            starterCode: `package main

import "fmt"

type Order struct {
    ID     int
    Amount float64
    Status string  // "pending", "confirmed", "cancelled"
}

func main() {
    orders := []Order{
        {1, 5000.0, "pending"},
        {2, 15000.0, "confirmed"},
        {3, 2000.0, "cancelled"},
        {4, 8500.0, "pending"},
        {5, 25000.0, "confirmed"},
    }

    totalAmount := 0.0

    for _, order := range orders {
        // Пропустить отменённые заказы
        if order.Status == "cancelled" {
            // ваш код
            continue
        }

        // Определить тип обработки через switch
        var processing string
        switch {
        case order.Amount >= 10000:
            processing = "VIP обработка"
        default:
            processing = "Стандартная обработка"
        }

        // Вывести информацию и добавить к totalAmount
        fmt.Printf("Заказ #%d: %.0f руб — %s\\n",
            order.ID, order.Amount, processing)
        totalAmount += order.Amount
    }

    fmt.Printf("\\nОбщая сумма активных заказов: %.0f руб\\n", totalAmount)
}`,
            hints: [
                'continue пропускает текущую итерацию цикла',
                'switch без аргумента: switch { case условие: ... }',
                'totalAmount += order.Amount добавляет к сумме',
                'order.Amount >= 10000 — проверка суммы заказа'
            ]
        },
        {
            type: 'theory',
            content: `
                <h2>Что мы узнали</h2>
                <ul>
                    <li>В Go <code>if</code> без круглых скобок вокруг условия, но с обязательными фигурными скобками — это правила языка, не стиль</li>
                    <li><code>if init; condition { }</code> — уникальная форма для ограничения области видимости переменной</li>
                    <li><code>switch</code> в Go не нужен <code>break</code> — каждый case завершается автоматически. <code>fallthrough</code> — для явного "проваливания"</li>
                    <li><code>switch</code> без аргумента — чистая альтернатива цепочке <code>if/else if</code></li>
                    <li>В Go только один цикл — <code>for</code>. Он заменяет while, do-while, foreach из других языков</li>
                    <li><code>for range</code> — для перебора слайсов, map, строк, каналов. Возвращает (индекс, значение)</li>
                    <li><code>break</code> — выйти из цикла, <code>continue</code> — пропустить итерацию</li>
                    <li>range возвращает КОПИЮ значения — для изменения элементов используйте индекс</li>
                </ul>
                <p><strong>Что дальше:</strong> Функции — основной строительный блок Go-программ. Разберём множественный возврат, обработку ошибок через error, defer и замыкания.</p>
            `
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Нужны ли круглые скобки вокруг условия в if в Go?',
                    options: [
                        'Нет, и это считается плохим стилем',
                        'Да, обязательно как в C',
                        'Опционально',
                        'Только для составных условий с &&'
                    ],
                    correct: 0,
                    explanation: 'В Go круглые скобки вокруг условия не нужны и являются плохим стилем. Если вы напишете if (x > 0) { } — это скомпилируется, но gofmt уберёт лишние скобки. Фигурные скобки обязательны всегда.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Какие циклы есть в Go?',
                    options: [
                        'Только for (в четырёх формах)',
                        'for и while',
                        'for, while, do-while',
                        'for, while, foreach'
                    ],
                    correct: 0,
                    explanation: 'В Go только один цикл — for. Но он гибкий: классический (for i:=0; i<n; i++), while-форма (for condition {}), бесконечный (for {}), и range-форма (for i,v := range x).'
                },
                {
                    id: 'q3',
                    type: 'code-fill',
                    question: 'Как записать бесконечный цикл в Go?',
                    template: '___ {\n    // работа сервера\n}',
                    correct: 'for',
                    caseSensitive: true,
                    explanation: 'for без условия и без инициализации — бесконечный цикл. Аналог while(true) или loop. Используется для серверов и демонов, работающих постоянно.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Нужен ли break в конце каждого case в switch?',
                    options: [
                        'Нет, в Go case завершается автоматически',
                        'Да, как в C и Java',
                        'Только в default',
                        'Зависит от версии Go'
                    ],
                    correct: 0,
                    explanation: 'В Go каждый case в switch автоматически прерывается — нет "проваливания" как в C/Java/JavaScript. Для явного перехода в следующий case используйте fallthrough. Это устраняет целый класс багов из C-подобных языков.'
                },
                {
                    id: 'q5',
                    type: 'multiple',
                    question: 'Что возвращает "for i, v := range items" для слайса items?',
                    options: [
                        'i — индекс элемента',
                        'v — значение элемента (копия)',
                        'v — указатель на элемент',
                        'Длину слайса'
                    ],
                    correct: [0, 1],
                    explanation: 'for range для слайса возвращает индекс (i) и КОПИЮ значения (v). Изменение v не меняет элемент в слайсе. Для изменения используйте индекс: items[i] = newValue.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Что делает if x, ok := m[key]; ok { ... }?',
                    options: [
                        'Объявляет x и ok в скоупе if, проверяет существование ключа в map',
                        'Это синтаксическая ошибка',
                        'Проверяет тип x',
                        'Присваивает значение из map и проверяет его на nil'
                    ],
                    correct: 0,
                    explanation: 'Это if с инициализацией. x получает значение из map[key], ok — bool (true если ключ существует). Переменные x и ok доступны только внутри блока if/else. Это идиоматический Go-способ безопасного чтения из map.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Как при переборе range изменить элемент слайса?',
                    options: [
                        'Использовать индекс: for i := range s { s[i] = newVal }',
                        'Изменить переменную v: for _, v := range s { v = newVal }',
                        'range не позволяет изменять элементы',
                        'Использовать указатель: for _, v := range &s'
                    ],
                    correct: 0,
                    explanation: 'range возвращает КОПИЮ значения в переменную v. Изменение v не влияет на оригинал. Для изменения элементов нужно обращаться по индексу: for i := range s { s[i] = newVal }.'
                }
            ]
        }
    ]
};
