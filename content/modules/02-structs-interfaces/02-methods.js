export default {
    id: '02-02',
    title: 'Методы',
    description: 'Value и pointer receiver, правила выбора, методы на любых типах, цепочки методов',
    estimatedTime: 30,
    xpReward: 30,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Struct хранит данные. Но как описать поведение?</h2>
                <p>В предыдущем уроке мы создали структуру <code>ShoppingCart</code> с полем <code>Items</code>. Но корзина должна уметь <em>действовать</em>: добавлять товары, удалять, считать сумму, применять промокоды.</p>
                <p>В Go для этого есть <strong>методы</strong> — функции, привязанные к конкретному типу. Разница между методом и обычной функцией: метод знает «о чём» он работает.</p>
                <pre><code>// Обычная функция — безликая
func AddToCart(cart *ShoppingCart, item Product) { ... }

// Метод — действие самой корзины
func (c *ShoppingCart) Add(item Product) { ... }</code></pre>
                <p>Метод — это функция с <strong>получателем (receiver)</strong>. Receiver указывается в скобках перед именем функции и привязывает её к типу. Внутри метода вы обращаетесь к данным через имя receiver-а — это аналог <code>this</code>/<code>self</code> в других языках, но в Go он явный.</p>
                <p>Методы делают код более выразительным: <code>cart.Add(laptop)</code> читается естественно — корзина добавляет ноутбук. <code>order.Cancel("customer request")</code> — заказ отменяется по причине.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Первый метод: синтаксис и соглашения',
            code: `package main

import "fmt"

type Product struct {
    Name     string
    Price    float64
    Category string
}

// String — метод для красивого вывода (реализует fmt.Stringer)
// (p Product) — value receiver: p — переменная типа Product
func (p Product) String() string {
    return fmt.Sprintf("%s — %.2f руб.", p.Name, p.Price)
}

// IsExpensive — проверяет, дорогой ли товар
// Имя receiver-а — одна буква от имени типа (соглашение Go)
func (p Product) IsExpensive() bool {
    return p.Price > 50000
}

func main() {
    laptop := Product{Name: "Ноутбук Dell", Price: 85000.0, Category: "Электроника"}
    phone := Product{Name: "Телефон Redmi", Price: 15000.0, Category: "Смартфоны"}

    // Вызов метода через точку
    fmt.Println(laptop.String())       // Ноутбук Dell — 85000.00 руб.
    fmt.Println(phone.String())        // Телефон Redmi — 15000.00 руб.
    fmt.Println(laptop.IsExpensive())  // true
    fmt.Println(phone.IsExpensive())   // false

    // fmt.Println автоматически вызовет String()
    fmt.Println(laptop) // Ноутбук Dell — 85000.00 руб.
}`,
            explanation: '(p Product) — это value receiver. p — копия значения, метод не может изменить оригинал. Имя receiver-а p (одна буква от Product) — соглашение Go. Не используйте this или self.'
        },
        {
            type: 'info-box',
            variant: 'note',
            content: '<p>В Go принято называть receiver <strong>одной-двумя буквами от имени типа</strong>: <code>p</code> для Product, <code>c</code> для ShoppingCart, <code>o</code> для Order, <code>srv</code> для Server. Слова <code>this</code> и <code>self</code> не используются — это не Go-стиль.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Value Receiver vs Pointer Receiver — главный выбор</h2>
                <p>Это самое важное решение при написании методов. Ошибиться здесь — значит получить баги, которые трудно найти.</p>
                <p><strong>Value receiver</strong> <code>(p Product)</code> — метод получает <em>копию</em> значения. Любые изменения внутри метода касаются только копии и теряются после возврата.</p>
                <p><strong>Pointer receiver</strong> <code>(p *Product)</code> — метод получает <em>указатель на оригинал</em>. Изменения видны снаружи.</p>
                <p>Это не просто синтаксическое различие — это фундаментальная разница в семантике.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead><tr style="background:var(--surface-2)">
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Критерий</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Value receiver (T)</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Pointer receiver (*T)</th>
                    </tr></thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Работает с</td>
                            <td style="padding:10px;border:1px solid var(--border)">Копией значения</td>
                            <td style="padding:10px;border:1px solid var(--border)">Оригиналом через указатель</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Изменяет поля?</td>
                            <td style="padding:10px;border:1px solid var(--border)">Нет (только копию)</td>
                            <td style="padding:10px;border:1px solid var(--border)">Да</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Копирование</td>
                            <td style="padding:10px;border:1px solid var(--border)">Копирует всю структуру</td>
                            <td style="padding:10px;border:1px solid var(--border)">Копирует только указатель (8 байт)</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Используйте когда</td>
                            <td style="padding:10px;border:1px solid var(--border)">Только чтение данных; маленькие типы (int, point)</td>
                            <td style="padding:10px;border:1px solid var(--border)">Изменяете поля; большие структуры; нужна консистентность</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Пример</td>
                            <td style="padding:10px;border:1px solid var(--border)">String(), IsValid(), Area()</td>
                            <td style="padding:10px;border:1px solid var(--border)">SetStatus(), Add(), Update()</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'ShoppingCart: полный пример с методами',
            code: `package main

import (
    "errors"
    "fmt"
)

type CartItem struct {
    Name     string
    Price    float64
    Quantity int
}

type ShoppingCart struct {
    OwnerName string
    Items     []CartItem
    discount  float64 // приватное — процент скидки
}

func NewShoppingCart(owner string) *ShoppingCart {
    return &ShoppingCart{OwnerName: owner, Items: []CartItem{}}
}

// AddItem — pointer receiver: изменяем слайс Items
func (c *ShoppingCart) AddItem(name string, price float64, qty int) error {
    if qty <= 0 {
        return errors.New("количество должно быть положительным")
    }
    c.Items = append(c.Items, CartItem{Name: name, Price: price, Quantity: qty})
    return nil
}

// RemoveItem — pointer receiver: изменяем слайс
func (c *ShoppingCart) RemoveItem(name string) bool {
    for i, item := range c.Items {
        if item.Name == name {
            c.Items = append(c.Items[:i], c.Items[i+1:]...)
            return true
        }
    }
    return false
}

// ApplyDiscount — pointer receiver: изменяем поле discount
func (c *ShoppingCart) ApplyDiscount(pct float64) error {
    if pct < 0 || pct > 100 {
        return errors.New("скидка должна быть от 0 до 100%")
    }
    c.discount = pct
    return nil
}

// Total — value receiver: только читаем данные
func (c ShoppingCart) Total() float64 {
    var sum float64
    for _, item := range c.Items {
        sum += item.Price * float64(item.Quantity)
    }
    return sum * (1 - c.discount/100)
}

// ItemCount — value receiver: только читаем
func (c ShoppingCart) ItemCount() int {
    return len(c.Items)
}

// String — value receiver: форматирование
func (c ShoppingCart) String() string {
    return fmt.Sprintf("Корзина[%s]: %d товаров, итого %.2f руб.",
        c.OwnerName, c.ItemCount(), c.Total())
}

func main() {
    cart := NewShoppingCart("Иван")

    cart.AddItem("Ноутбук", 85000.0, 1)
    cart.AddItem("Мышь", 2500.0, 2)
    cart.AddItem("Коврик", 800.0, 1)

    fmt.Println(cart) // Корзина[Иван]: 3 товаров, итого 90800.00 руб.

    cart.ApplyDiscount(10)
    fmt.Printf("С скидкой 10%%: %.2f руб.\\n", cart.Total()) // 81720.00

    cart.RemoveItem("Коврик")
    fmt.Printf("После удаления: %d товаров\\n", cart.ItemCount()) // 2
}`,
            explanation: 'Обратите внимание: AddItem, RemoveItem, ApplyDiscount — pointer receivers (изменяют структуру). Total, ItemCount, String — value receivers (только читают). Это правильное разделение.'
        },
        {
            type: 'info-box',
            variant: 'important',
            content: '<p><strong>Правило консистентности:</strong> если хотя бы один метод типа использует pointer receiver — сделайте все методы с pointer receiver. Смешивание value и pointer receivers на одном типе приводит к неожиданному поведению при работе с интерфейсами.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Автоматическое преобразование: & и *</h2>
                <p>Go автоматически адаптирует вызов метода: берёт адрес значения для pointer receiver или разыменовывает указатель для value receiver. Это упрощает код — вам не нужно думать о явном преобразовании.</p>
                <p>Важный нюанс: автоматическое взятие адреса работает только для <strong>адресуемых</strong> значений (переменные, поля структур, элементы слайсов). Для неадресуемых — нет.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Автопреобразование при вызове',
            code: `package main

import "fmt"

type Counter struct {
    Value int
}

func (c *Counter) Increment() { c.Value++ }
func (c Counter) Get() int    { return c.Value }

func main() {
    // Значение — Go автоматически берёт &c для pointer receiver
    c := Counter{Value: 10}
    c.Increment()          // эквивалент: (&c).Increment()
    fmt.Println(c.Get())   // 11

    // Указатель — Go автоматически разыменовывает для value receiver
    p := &Counter{Value: 20}
    p.Increment()          // указатель — всё работает напрямую
    fmt.Println(p.Get())   // 21 — эквивалент: (*p).Get()

    // ❌ Неадресуемое значение — нельзя взять адрес
    // Counter{}.Increment() // ошибка: cannot take address of Counter{}
    // ✅ Присвоить переменной — тогда адресуемо
    tmp := Counter{}
    tmp.Increment()
    fmt.Println(tmp.Value) // 1
}`,
            explanation: 'Go умный: c.Increment() с value c автоматически становится (&c).Increment(). Это синтаксический сахар, а не магия — компилятор вставляет взятие адреса.'
        },
        {
            type: 'theory',
            content: `
                <h2>Методы не только на struct</h2>
                <p>Методы можно добавлять к <strong>любому именованному типу</strong>, определённому в текущем пакете — не только к struct. Это позволяет создавать выразительные типы с богатым поведением.</p>
                <p>Нельзя добавить метод к встроенным типам (<code>int</code>, <code>string</code>) напрямую — нужно создать свой именованный тип на их основе.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Методы на пользовательских типах',
            code: `package main

import (
    "fmt"
    "strings"
)

// OrderStatus — пользовательский тип на основе string
type OrderStatus string

const (
    StatusPending   OrderStatus = "pending"
    StatusPaid      OrderStatus = "paid"
    StatusShipped   OrderStatus = "shipped"
    StatusDelivered OrderStatus = "delivered"
    StatusCancelled OrderStatus = "cancelled"
)

func (s OrderStatus) String() string {
    labels := map[OrderStatus]string{
        StatusPending:   "Ожидает оплаты",
        StatusPaid:      "Оплачен",
        StatusShipped:   "Отправлен",
        StatusDelivered: "Доставлен",
        StatusCancelled: "Отменён",
    }
    if label, ok := labels[s]; ok {
        return label
    }
    return "Неизвестный статус"
}

func (s OrderStatus) IsFinal() bool {
    return s == StatusDelivered || s == StatusCancelled
}

// Tags — пользовательский тип на основе слайса
type Tags []string

func (t Tags) Contains(tag string) bool {
    for _, s := range t {
        if strings.EqualFold(s, tag) {
            return true
        }
    }
    return false
}

func (t *Tags) Add(tag string) {
    if !t.Contains(tag) {
        *t = append(*t, tag)
    }
}

func main() {
    status := StatusPaid
    fmt.Println(status)           // Оплачен
    fmt.Println(status.IsFinal()) // false

    status = StatusDelivered
    fmt.Println(status.IsFinal()) // true

    tags := Tags{"электроника", "новинка"}
    tags.Add("распродажа")
    tags.Add("электроника") // дубликат — не добавится
    fmt.Println(tags)                    // [электроника новинка распродажа]
    fmt.Println(tags.Contains("НОВИНКА")) // true (регистронезависимо)
}`,
            explanation: 'OrderStatus — не просто string, это тип с поведением. Константы StatusPaid и т.д. типизированы — нельзя случайно передать произвольную строку туда где ожидается OrderStatus. Это безопасность типов без лишней сложности.'
        },
        {
            type: 'theory',
            content: `
                <h2>Типичная ошибка: value receiver когда нужен pointer</h2>
                <p>Это одна из самых частых ошибок у новичков в Go. Метод «как будто работает», но изменения не сохраняются. Компилятор не предупреждает — это легальный код, просто неправильный.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Типичные ошибки с receivers',
            code: `package main

import "fmt"

type Order struct {
    ID     int
    Status string
    Total  float64
}

// ❌ ПЛОХО: value receiver пытается изменить поле
func (o Order) CancelBAD() {
    o.Status = "cancelled" // изменяет только локальную копию!
}

// ✅ ХОРОШО: pointer receiver изменяет оригинал
func (o *Order) Cancel() {
    o.Status = "cancelled"
}

// ❌ ПЛОХО: смешивание без причины
func (o Order) GetID() int    { return o.ID }    // value — ok, чтение
func (o *Order) GetTotal() float64 { return o.Total } // pointer — нет причины

// ✅ ХОРОШО: консистентность — все pointer
func (o *Order) ID2() int      { return o.ID }
func (o *Order) Total2() float64 { return o.Total }

func main() {
    order := &Order{ID: 1001, Status: "paid", Total: 5000.0}

    order.CancelBAD()
    fmt.Println(order.Status) // paid — НЕ изменился!

    order.Cancel()
    fmt.Println(order.Status) // cancelled — изменился

    // Ещё одна ловушка: range даёт копию
    orders := []Order{
        {ID: 1, Status: "pending"},
        {ID: 2, Status: "paid"},
    }

    // ❌ ПЛОХО: item — копия
    for _, item := range orders {
        item.Status = "shipped" // не изменит оригинал!
    }
    fmt.Println(orders[0].Status) // pending — не изменился

    // ✅ ХОРОШО: по индексу
    for i := range orders {
        orders[i].Status = "shipped"
    }
    fmt.Println(orders[0].Status) // shipped — изменился
}`,
            explanation: 'CancelBAD работает с копией Order — после вызова оригинал не изменился. Это трудно отловить: код компилируется, тесты могут пройти если не проверяют состояние после вызова.'
        },
        {
            type: 'theory',
            content: `
                <h2>Recap: что узнали</h2>
                <ul>
                    <li>🔑 <strong>Метод</strong> — функция с receiver в скобках перед именем: <code>func (c *Cart) Add()</code></li>
                    <li>🔑 <strong>Value receiver</strong> <code>(t T)</code> — работает с копией, не изменяет оригинал</li>
                    <li>🔑 <strong>Pointer receiver</strong> <code>(t *T)</code> — работает с оригиналом, может изменять поля</li>
                    <li>🔑 <strong>Когда pointer receiver</strong>: метод изменяет состояние ИЛИ структура большая ИЛИ нужна консистентность</li>
                    <li>🔑 <strong>Консистентность</strong>: если есть хоть один pointer receiver — делайте все pointer</li>
                    <li>🔑 <strong>Методы не только на struct</strong>: любой именованный тип в пакете</li>
                    <li>🔑 <strong>Именование receiver</strong>: короткое (одна-две буквы), не this/self</li>
                </ul>
                <p><strong>Что дальше:</strong> в следующем уроке разберём интерфейсы — механизм, который позволяет писать код независимый от конкретных типов. Методы — фундамент интерфейсов.</p>
            `
        },
        {
            type: 'editor',
            title: 'Практика: Банковский счёт',
            instructions: 'Создайте структуру BankAccount с приватным полем balance float64. Реализуйте: NewBankAccount(initial float64) *BankAccount, метод Deposit(amount float64) error (ошибка если amount <= 0), метод Withdraw(amount float64) error (ошибка если amount <= 0 или недостаточно средств), метод Balance() float64.',
            starterCode: `package main

import (
    "errors"
    "fmt"
)

type BankAccount struct {
    balance float64
}

func NewBankAccount(initial float64) *BankAccount {
    // Ваш код
    return nil
}

func (a *BankAccount) Deposit(amount float64) error {
    // Ваш код
    return nil
}

func (a *BankAccount) Withdraw(amount float64) error {
    // Ваш код
    return nil
}

func (a *BankAccount) Balance() float64 {
    // Ваш код
    return 0
}

func main() {
    acc := NewBankAccount(1000)
    fmt.Println(acc.Balance()) // 1000

    acc.Deposit(500)
    fmt.Println(acc.Balance()) // 1500

    err := acc.Withdraw(2000)
    fmt.Println(err)           // недостаточно средств

    acc.Withdraw(300)
    fmt.Println(acc.Balance()) // 1200
}`,
            hints: [
                'NewBankAccount: return &BankAccount{balance: initial}',
                'Deposit: проверить amount <= 0, затем a.balance += amount',
                'Withdraw: проверить amount <= 0, проверить a.balance < amount, затем a.balance -= amount',
                'Balance: return a.balance (value receiver — только чтение)',
                'Все три метода должны быть pointer receivers для консистентности'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что такое receiver в методе Go?',
                    options: [
                        'Параметр в скобках перед именем функции, привязывающий её к типу',
                        'Возвращаемое значение функции',
                        'Первый аргумент функции',
                        'Ключевое слово this'
                    ],
                    correct: 0,
                    explanation: 'func (c *Cart) Add() — здесь (c *Cart) это receiver. c — переменная, *Cart — тип. Функция становится методом типа Cart.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Метод с value receiver (c Cart) вызван на значении cart. Что произойдёт если метод изменит поле?',
                    options: [
                        'Изменение видно только внутри метода — оригинал не изменится',
                        'Изменение видно снаружи — оригинал изменится',
                        'Компилятор запретит изменение полей в value receiver',
                        'Произойдёт panic'
                    ],
                    correct: 0,
                    explanation: 'Value receiver получает копию. Изменения в копии не затрагивают оригинал. Компилятор это разрешает — ошибка логическая, не синтаксическая.'
                },
                {
                    id: 'q3',
                    type: 'code-fill',
                    question: 'Объявите метод Cancel с pointer receiver для типа Order:',
                    template: 'func (o ___Order) Cancel() { o.Status = "cancelled" }',
                    correct: '*',
                    caseSensitive: true,
                    explanation: '* перед именем типа делает receiver указателем: (o *Order). Без * метод получит копию и изменение Status не сохранится.'
                },
                {
                    id: 'q4',
                    type: 'multiple',
                    question: 'Когда нужен pointer receiver? (несколько ответов)',
                    options: [
                        'Когда метод изменяет поля структуры',
                        'Когда структура большая (много полей) для избежания копирования',
                        'Когда метод только читает данные из маленькой структуры',
                        'Когда другие методы типа уже используют pointer receiver'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'Pointer receiver нужен для изменений, для больших структур (производительность) и для консистентности. Для чтения маленьких структур — value receiver.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Можно ли добавить метод к типу type Price float64?',
                    options: [
                        'Да — к любому именованному типу в своём пакете',
                        'Нет — только к struct',
                        'Нет — нельзя добавлять методы к типам на основе float64',
                        'Да, но только value receiver'
                    ],
                    correct: 0,
                    explanation: 'Методы можно добавить к любому именованному типу объявленному в вашем пакете: struct, int, string, слайс, map — всё работает.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Как принято именовать receiver в Go?',
                    options: [
                        'Одной-двумя буквами от имени типа: c для Cart, o для Order',
                        'Всегда self',
                        'Всегда this',
                        'Полным именем типа: cart для Cart'
                    ],
                    correct: 0,
                    explanation: 'Go-идиома: короткое имя от типа. p для Product, u для User, srv для Server. this и self — не Go-стиль.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'cart := Cart{}; cart.Add("item"). Если Add имеет pointer receiver — скомпилируется ли код?',
                    options: [
                        'Да — Go автоматически берёт &cart для pointer receiver',
                        'Нет — нужно явно писать (&cart).Add("item")',
                        'Да, но изменения не сохранятся',
                        'Нет — cart должен быть указателем'
                    ],
                    correct: 0,
                    explanation: 'Go автоматически берёт адрес адресуемых переменных: cart.Add() → (&cart).Add(). Явная запись (&cart).Add() тоже работает, но не нужна.'
                }
            ]
        }
    ]
};
