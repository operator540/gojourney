export default {
    id: '02-01',
    title: 'Структуры (Structs)',
    description: 'Создание пользовательских типов данных, инициализация, вложенные структуры, анонимные поля, конструкторы',
    estimatedTime: 30,
    xpReward: 30,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Проблема: как хранить связанные данные вместе?</h2>
                <p>Представьте, что вы разрабатываете интернет-магазин. У каждого товара есть название, цена, количество на складе и категория. Как хранить это в Go?</p>
                <p>Первый наивный подход — отдельные переменные:</p>
                <pre><code>productName := "Ноутбук"
productPrice := 85000.0
productStock := 5
productCategory := "Электроника"</code></pre>
                <p>А теперь у вас 100 товаров. Вам нужны <code>productName1</code>, <code>productName2</code>... Это хаос. Передача товара в функцию требует 4 отдельных аргумента. Добавление нового поля ломает всё.</p>
                <p><strong>Struct</strong> решает эту проблему: он объединяет связанные данные разных типов в одну именованную сущность. В Go нет классов — структуры выполняют их роль, но без лишней сложности.</p>
                <p>Структуры позволяют:</p>
                <ul>
                    <li>Объединять данные разных типов в одну сущность с понятным именем</li>
                    <li>Передавать группу связанных значений одним аргументом в функцию</li>
                    <li>Создавать пользовательские типы для моделирования предметной области</li>
                    <li>Добавлять поведение (методы) к данным — об этом в следующем уроке</li>
                    <li>Организовывать код по принципу «одна сущность — один тип»</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Объявление структуры Product',
            code: `package main

import "fmt"

// Product описывает товар в интернет-магазине
type Product struct {
    Name     string
    Price    float64
    Stock    int
    Category string
}

func main() {
    // Способ 1: позиционная инициализация (не рекомендуется)
    p1 := Product{"Ноутбук", 85000.0, 5, "Электроника"}

    // Способ 2: именованная инициализация (рекомендуется)
    p2 := Product{
        Name:     "Смартфон",
        Price:    45000.0,
        Stock:    12,
        Category: "Электроника",
    }

    // Способ 3: нулевая структура + присваивание
    var p3 Product
    p3.Name = "Наушники"
    p3.Price = 8500.0

    fmt.Println(p1.Name)     // Ноутбук
    fmt.Println(p2.Price)    // 45000
    fmt.Println(p3.Stock)    // 0 (нулевое значение int)
    fmt.Println(p3.Category) // "" (нулевое значение string)
}`,
            explanation: 'Именованная инициализация (способ 2) — самая распространённая в реальных проектах. Она устойчива к добавлению новых полей и читается лучше. Способ 1 сломается если добавить новое поле между существующими.'
        },
        {
            type: 'info-box',
            variant: 'important',
            content: '<p><strong>Правило:</strong> всегда используйте именованную инициализацию: <code>Product{Name: "Ноутбук", Price: 85000.0}</code>. Если кто-то добавит новое поле в структуру, ваш код без именованных полей перестанет компилироваться. Позиционная инициализация — техдолг.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Нулевые значения и частичная инициализация</h2>
                <p>В Go каждое поле структуры автоматически инициализируется <strong>нулевым значением</strong> своего типа. Это гарантия безопасности — в Go нет «мусора» из памяти, как в C.</p>
                <p>Нулевые значения по типам:</p>
                <ul>
                    <li><code>int</code>, <code>int64</code>, <code>float64</code> → <code>0</code></li>
                    <li><code>string</code> → <code>""</code> (пустая строка)</li>
                    <li><code>bool</code> → <code>false</code></li>
                    <li><code>*T</code> (указатель) → <code>nil</code></li>
                    <li><code>[]T</code> (слайс) → <code>nil</code></li>
                    <li><code>map[K]V</code> → <code>nil</code></li>
                    <li>Вложенная <code>struct</code> → нулевые значения всех её полей</li>
                </ul>
                <p>Это позволяет использовать структуры без полной инициализации. Часто «нулевая» структура уже является рабочим состоянием — это называется <strong>«zero value должен быть полезным»</strong>, одна из идиом Go.</p>
                <p>Например, <code>var order Order</code> создаёт заказ с пустым списком товаров (<code>nil</code> слайс), нулевой суммой и пустым статусом — что может быть вполне корректным начальным состоянием.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Три способа создания структур: когда что использовать</h2>
                <p>В Go есть несколько паттернов создания структур. Выбор зависит от ситуации.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead><tr style="background:var(--surface-2)">
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Способ</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Синтаксис</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Когда использовать</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Результат</th>
                    </tr></thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Именованная</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>Product{Name: "X"}</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Всегда — основной способ</td>
                            <td style="padding:10px;border:1px solid var(--border)">Значение типа</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Указатель</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>&amp;Product{Name: "X"}</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Когда нужно изменять структуру или передавать в функции</td>
                            <td style="padding:10px;border:1px solid var(--border)">*Product</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Конструктор</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>NewProduct("X", 100)</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Когда нужна валидация или значения по умолчанию</td>
                            <td style="padding:10px;border:1px solid var(--border)">*Product или Product</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Нулевая</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>var p Product</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Когда нулевое значение — корректное начальное состояние</td>
                            <td style="padding:10px;border:1px solid var(--border)">Значение типа</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Функция-конструктор: идиоматический Go',
            code: `package main

import (
    "errors"
    "fmt"
)

type Product struct {
    Name     string
    Price    float64
    Stock    int
    Category string
}

// NewProduct — функция-конструктор (паттерн New...)
// Возвращает *Product и error: позволяет валидировать данные
func NewProduct(name string, price float64, category string) (*Product, error) {
    if name == "" {
        return nil, errors.New("название товара не может быть пустым")
    }
    if price <= 0 {
        return nil, errors.New("цена должна быть положительной")
    }
    return &Product{
        Name:     name,
        Price:    price,
        Stock:    0, // новый товар — нет на складе
        Category: category,
    }, nil
}

func main() {
    laptop, err := NewProduct("Ноутбук Dell", 85000.0, "Электроника")
    if err != nil {
        fmt.Println("Ошибка:", err)
        return
    }
    fmt.Printf("Товар: %s, Цена: %.2f руб.\\n", laptop.Name, laptop.Price)

    // Создание через указатель напрямую
    phone := &Product{
        Name:     "iPhone 15",
        Price:    99000.0,
        Stock:    20,
        Category: "Смартфоны",
    }
    fmt.Println(phone.Name) // Авторазыменование: phone.Name = (*phone).Name
}`,
            explanation: 'Конструктор NewProduct — стандартный паттерн Go. Он позволяет валидировать данные и задавать значения по умолчанию. Возврат *Product (указателя) означает что объект живёт в куче и можно безопасно передавать куда угодно.'
        },
        {
            type: 'theory',
            content: `
                <h2>Вложенные структуры: моделирование реального мира</h2>
                <p>В реальных проектах данные редко плоские. Заказ содержит адрес доставки, пользователь — контактную информацию. Структуры могут содержать другие структуры.</p>
                <p>Есть два подхода к вложенности:</p>
                <ul>
                    <li><strong>Именованное поле</strong> — <code>Address Address</code>: поле с именем, обращение через <code>user.Address.City</code></li>
                    <li><strong>Встраивание (embedding)</strong> — <code>Address</code> без имени: поля продвигаются, обращение <code>user.City</code> напрямую (подробнее в уроке 04-embedding)</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Вложенные структуры для интернет-магазина',
            code: `package main

import "fmt"

type Address struct {
    City       string
    Street     string
    Building   string
    PostalCode string
}

type ContactInfo struct {
    Email string
    Phone string
}

type User struct {
    ID      int
    Name    string
    Contact ContactInfo // именованное поле
    Shipping Address    // адрес доставки
    Billing  Address    // адрес для счёта
}

func main() {
    user := User{
        ID:   1,
        Name: "Иван Петров",
        Contact: ContactInfo{
            Email: "ivan@example.com",
            Phone: "+7-900-123-4567",
        },
        Shipping: Address{
            City:       "Москва",
            Street:     "Тверская",
            Building:   "1",
            PostalCode: "101000",
        },
        Billing: Address{
            City:       "Санкт-Петербург",
            Street:     "Невский проспект",
            Building:   "25",
            PostalCode: "190000",
        },
    }

    fmt.Println(user.Name)               // Иван Петров
    fmt.Println(user.Contact.Email)      // ivan@example.com
    fmt.Println(user.Shipping.City)      // Москва
    fmt.Println(user.Billing.PostalCode) // 190000

    // Изменение вложенного поля
    user.Shipping.Building = "1А"
    fmt.Println(user.Shipping.Building)  // 1А
}`,
            explanation: 'Один и тот же тип Address используется для двух полей (Shipping и Billing) — это и есть переиспользование типов. Изменение user.Shipping.Building обращается к вложенной структуре напрямую.'
        },
        {
            type: 'theory',
            content: `
                <h2>Экспортированные и приватные поля</h2>
                <p>В Go видимость поля определяется регистром его первой буквы — так же как для функций и типов. Это принципиальное решение дизайна языка: никаких ключевых слов <code>public</code>/<code>private</code>.</p>
                <ul>
                    <li><code>Name</code> (заглавная) — <strong>экспортировано</strong>: доступно из любого пакета</li>
                    <li><code>name</code> (строчная) — <strong>приватное</strong>: доступно только внутри объявляющего пакета</li>
                </ul>
                <p>Приватные поля — основа инкапсуляции в Go. Вы скрываете детали реализации и предоставляете доступ через публичные методы. Это дает несколько преимуществ:</p>
                <ul>
                    <li>Можно изменять внутреннюю реализацию без изменения публичного API</li>
                    <li>Можно добавлять валидацию в методах-сеттерах</li>
                    <li>Пользователи структуры не зависят от внутренних деталей</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Инкапсуляция через приватные поля',
            code: `package main

import (
    "errors"
    "fmt"
    "time"
)

// Order — заказ в магазине
type Order struct {
    ID        int
    UserID    int
    CreatedAt time.Time
    status    string  // приватное: только через методы
    total     float64 // приватное: вычисляется из Items
}

// Status возвращает статус (публичный геттер)
func (o *Order) Status() string {
    return o.status
}

// SetStatus устанавливает статус с валидацией
func (o *Order) SetStatus(s string) error {
    validStatuses := map[string]bool{
        "pending":   true,
        "paid":      true,
        "shipped":   true,
        "delivered": true,
        "cancelled": true,
    }
    if !validStatuses[s] {
        return errors.New("недопустимый статус: " + s)
    }
    o.status = s
    return nil
}

func main() {
    order := &Order{
        ID:        1001,
        UserID:    42,
        CreatedAt: time.Now(),
    }
    order.status = "" // ❌ Ошибка: нет доступа к приватному полю из другого пакета

    // ✅ Правильно — через метод
    if err := order.SetStatus("paid"); err != nil {
        fmt.Println("Ошибка:", err)
    }
    fmt.Println("Статус:", order.Status()) // Статус: paid

    // Попытка невалидного статуса
    err := order.SetStatus("unknown")
    fmt.Println(err) // недопустимый статус: unknown
}`,
            explanation: 'Поля status и total приватные — нельзя случайно установить "invalid" статус напрямую. SetStatus валидирует значение. Это настоящая инкапсуляция, а не просто соглашение.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p><strong>Когда делать поля приватными?</strong> Когда есть логика вокруг изменения поля (валидация, пересчёт других полей, логирование). Простые data-структуры (DTO для JSON, конфиги) могут иметь все публичные поля — это нормально в Go.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Типичные ошибки при работе со структурами</h2>
                <p>Самая коварная ошибка — изменение копии структуры вместо оригинала. В Go структуры — <strong>типы-значения</strong>: при присваивании и передаче в функцию создаётся копия.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Ошибки: копирование вместо оригинала',
            code: `package main

import "fmt"

type Product struct {
    Name  string
    Price float64
    Stock int
}

// ❌ ПЛОХО: value receiver — изменяет копию
func applyDiscountBAD(p Product, pct float64) {
    p.Price = p.Price * (1 - pct/100)
    // Изменение не видно снаружи!
}

// ✅ ХОРОШО: pointer receiver — изменяет оригинал
func applyDiscount(p *Product, pct float64) {
    p.Price = p.Price * (1 - pct/100)
}

// ❌ ПЛОХО: переменная — копия
func processOrder(items []Product) {
    for _, item := range items { // item — КОПИЯ каждого элемента
        item.Stock--             // изменяет только копию!
    }
}

// ✅ ХОРОШО: работаем по индексу
func processOrderFixed(items []Product) {
    for i := range items {
        items[i].Stock-- // изменяет оригинал в слайсе
    }
}

func main() {
    laptop := Product{Name: "Ноутбук", Price: 100000.0, Stock: 5}

    applyDiscountBAD(laptop, 10)
    fmt.Println(laptop.Price) // 100000 — не изменилось!

    applyDiscount(&laptop, 10)
    fmt.Println(laptop.Price) // 90000 — изменилось

    products := []Product{
        {Name: "A", Stock: 10},
        {Name: "B", Stock: 20},
    }
    processOrder(products)
    fmt.Println(products[0].Stock) // 10 — не изменилось!
    processOrderFixed(products)
    fmt.Println(products[0].Stock) // 9 — изменилось
}`,
            explanation: 'Это фундаментальная разница между значениями и указателями в Go. Если функция должна менять структуру — передавайте указатель. Если только читать — значение (но для больших структур тоже указатель, чтобы не копировать).'
        },
        {
            type: 'theory',
            content: `
                <h2>Анонимные структуры и сравнение</h2>
                <p>Иногда нужна структура «на один раз», без объявления именованного типа. Анонимные структуры идеальны для этого — особенно в тестах и JSON-операциях.</p>
                <p>Структуры можно сравнивать через <code>==</code>, но только если <strong>все поля</strong> имеют сравнимые типы. Слайсы, map и функции — несравнимые типы.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Анонимные структуры и сравнение',
            code: `package main

import "fmt"

func main() {
    // Анонимная структура для быстрого прототипа
    response := struct {
        Success bool
        Message string
        Code    int
    }{
        Success: true,
        Message: "Заказ создан",
        Code:    201,
    }
    fmt.Println(response.Message) // Заказ создан

    // Table-driven тесты — классический паттерн Go
    tests := []struct {
        name     string
        price    float64
        discount float64
        expected float64
    }{
        {"10% скидка", 1000, 10, 900},
        {"50% скидка", 500, 50, 250},
        {"нет скидки", 200, 0, 200},
    }
    for _, tt := range tests {
        result := tt.price * (1 - tt.discount/100)
        ok := "✓"
        if result != tt.expected {
            ok = "✗"
        }
        fmt.Printf("%s %s: %.0f\\n", ok, tt.name, result)
    }

    // Сравнение структур — работает если все поля сравнимы
    type Point struct{ X, Y int }
    p1 := Point{1, 2}
    p2 := Point{1, 2}
    p3 := Point{3, 4}
    fmt.Println(p1 == p2) // true
    fmt.Println(p1 == p3) // false
}`,
            explanation: 'Анонимные структуры в table-driven тестах — один из самых идиоматичных паттернов Go. Вы увидите его в каждом реальном проекте. Каждый тест-кейс — это анонимная структура с input и expected значениями.'
        },
        {
            type: 'info-box',
            variant: 'note',
            content: '<p>Структуры не могут содержать поле своего же типа (рекурсивный тип). Но могут содержать <strong>указатель</strong> на свой тип: <code>type Node struct { Value int; Next *Node }</code> — так строятся связанные списки, деревья и другие рекурсивные структуры данных.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Recap: что узнали</h2>
                <ul>
                    <li>🔑 <strong>Struct</strong> — пользовательский тип, объединяющий поля разных типов</li>
                    <li>🔑 <strong>Именованная инициализация</strong> — <code>Product{Name: "X"}</code> — устойчива к изменениям</li>
                    <li>🔑 <strong>Нулевые значения</strong> — каждое поле инициализируется нулём своего типа</li>
                    <li>🔑 <strong>Конструктор New...</strong> — идиоматический паттерн для валидации и значений по умолчанию</li>
                    <li>🔑 <strong>Приватные поля</strong> (строчная буква) — инкапсуляция через методы</li>
                    <li>🔑 <strong>Вложенные структуры</strong> — моделирование реальных сущностей</li>
                    <li>🔑 <strong>Struct — тип-значение</strong>: передаётся копией, для изменений нужен указатель <code>&amp;</code></li>
                </ul>
                <p><strong>Что дальше:</strong> в следующем уроке добавим поведение к структурам — методы. Методы позволяют структуре не только хранить данные, но и действовать: <code>cart.AddItem(product)</code>, <code>order.Cancel()</code>.</p>
            `
        },
        {
            type: 'editor',
            title: 'Практика: ShoppingCart',
            instructions: 'Создайте структуру ShoppingCart с полями Items ([]string) и OwnerName (string). Напишите конструктор NewShoppingCart(owner string) *ShoppingCart и метод AddItem(item string). Создайте корзину, добавьте 3 товара и выведите их.',
            starterCode: `package main

import "fmt"

type ShoppingCart struct {
    // Items  []string
    // OwnerName string
}

func NewShoppingCart(owner string) *ShoppingCart {
    // Ваш код здесь
    return nil
}

func (c *ShoppingCart) AddItem(item string) {
    // Ваш код здесь
}

func main() {
    cart := NewShoppingCart("Иван")
    cart.AddItem("Ноутбук")
    cart.AddItem("Мышь")
    cart.AddItem("Клавиатура")

    fmt.Printf("Корзина %s: %v\\n", cart.OwnerName, cart.Items)
    // Корзина Иван: [Ноутбук Мышь Клавиатура]
}`,
            hints: [
                'ShoppingCart: поля Items []string и OwnerName string',
                'Конструктор: return &ShoppingCart{OwnerName: owner, Items: []string{}}',
                'AddItem: c.Items = append(c.Items, item)',
                'Метод с pointer receiver (*ShoppingCart) — изменяем слайс'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Почему рекомендуется использовать именованную инициализацию структуры?',
                    options: [
                        'Она устойчива к добавлению новых полей в структуру',
                        'Она быстрее работает в рантайме',
                        'Она занимает меньше памяти',
                        'Компилятор требует именованную инициализацию'
                    ],
                    correct: 0,
                    explanation: 'Позиционная инициализация User{"Alice", 30} сломается если добавить новое поле между существующими. Именованная User{Name: "Alice", Age: 30} — нет.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Какое нулевое значение у поля типа string?',
                    options: [
                        'Пустая строка ""',
                        'nil',
                        '0',
                        'false'
                    ],
                    correct: 0,
                    explanation: 'Нулевое значение string — пустая строка "". nil — для указателей и ссылочных типов (слайс, map, функция).'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Как сделать поле структуры приватным в Go?',
                    options: [
                        'Начать имя поля со строчной буквы',
                        'Добавить ключевое слово private',
                        'Поместить поле в раздел private:',
                        'Использовать аннотацию @private'
                    ],
                    correct: 0,
                    explanation: 'В Go видимость определяется регистром первой буквы. price — приватное, Price — публичное. Никаких ключевых слов.'
                },
                {
                    id: 'q4',
                    type: 'code-fill',
                    question: 'Как создать указатель на структуру Product?',
                    template: 'p := ___Product{Name: "Ноутбук", Price: 85000}',
                    correct: '&',
                    caseSensitive: true,
                    explanation: '& перед литералом структуры создаёт указатель в куче: &Product{} возвращает *Product.'
                },
                {
                    id: 'q5',
                    type: 'multiple',
                    question: 'Что верно о структурах в Go? (несколько ответов)',
                    options: [
                        'Структуры — типы-значения, передаются копией',
                        'Вложенные структуры возможны',
                        'Структуры поддерживают наследование',
                        'Приватные поля доступны только внутри пакета'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'В Go нет наследования — есть встраивание (embedding). Структуры — типы-значения. Приватные поля (строчная буква) видны только в пакете.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Функция принимает Product по значению и изменяет поле Price. Что произойдёт с оригиналом?',
                    options: [
                        'Оригинал не изменится — функция работает с копией',
                        'Оригинал изменится',
                        'Компилятор выдаст ошибку',
                        'Зависит от версии Go'
                    ],
                    correct: 0,
                    explanation: 'Структуры передаются по значению — функция получает копию. Для изменения оригинала нужно передавать указатель *Product.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Где чаще всего используются анонимные структуры?',
                    options: [
                        'В table-driven тестах для хранения тест-кейсов',
                        'Для передачи данных в горутины',
                        'Для работы с базой данных',
                        'В HTTP-обработчиках'
                    ],
                    correct: 0,
                    explanation: 'Анонимные структуры идеальны для table-driven тестов: []struct{input, expected} без объявления отдельного типа. Это классический паттерн Go-тестов.'
                }
            ]
        }
    ]
};
