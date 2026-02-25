export default {
    id: '12-01',
    title: 'ООП без классов: Go-подход',
    description: 'Go не имеет классов, но предлагает мощную альтернативу: structs + methods + interfaces + embedding. Это не ограничение — это другой, более гибкий взгляд на объектное мышление.',
    estimatedTime: 30,
    xpReward: 25,
    sections: [
        {
            type: 'theory',
            content: `
<h2>Почему Go отказался от классов?</h2>
<p>Представьте, что вы строите дом. В Java/C++ вы сначала создаёте чертёж (класс), потом строите дома по нему (объекты), и если нужен дом с бассейном — наследуетесь от базового класса. Через несколько итераций получается иерархия: <code>Дом → ДомСБассейном → ДомСБассейномИСауной</code>. Изменение фундамента ломает всё.</p>
<p>Go говорит: зачем сложная иерархия? Скомпонуй нужные части — возьми фундамент, добавь бассейн, добавь сауну. <strong>Композиция вместо наследования.</strong></p>

<h2>Три столпа ООП в Go</h2>
<table style="width:100%; border-collapse:collapse; margin:16px 0;">
  <thead>
    <tr style="background:var(--surface-2);">
      <th style="padding:10px 14px; border:1px solid var(--border); text-align:left;">Концепция</th>
      <th style="padding:10px 14px; border:1px solid var(--border); text-align:left;">Java/C++</th>
      <th style="padding:10px 14px; border:1px solid var(--border); text-align:left;">Go</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:9px 14px; border:1px solid var(--border);">Инкапсуляция</td>
      <td style="padding:9px 14px; border:1px solid var(--border);">private/public модификаторы</td>
      <td style="padding:9px 14px; border:1px solid var(--border);">lowercase (приватно) / PascalCase (публично)</td>
    </tr>
    <tr style="background:var(--surface-2);">
      <td style="padding:9px 14px; border:1px solid var(--border);">Полиморфизм</td>
      <td style="padding:9px 14px; border:1px solid var(--border);">Наследование + virtual методы</td>
      <td style="padding:9px 14px; border:1px solid var(--border);">Интерфейсы (неявная реализация)</td>
    </tr>
    <tr>
      <td style="padding:9px 14px; border:1px solid var(--border);">«Наследование»</td>
      <td style="padding:9px 14px; border:1px solid var(--border);">extends ClassName</td>
      <td style="padding:9px 14px; border:1px solid var(--border);">Embedding (встраивание struct)</td>
    </tr>
    <tr style="background:var(--surface-2);">
      <td style="padding:9px 14px; border:1px solid var(--border);">Конструктор</td>
      <td style="padding:9px 14px; border:1px solid var(--border);">Метод с именем класса</td>
      <td style="padding:9px 14px; border:1px solid var(--border);">Функция NewXxx() по соглашению</td>
    </tr>
  </tbody>
</table>

<h2>Инкапсуляция: видимость через регистр</h2>
<p>В Go нет ключевых слов <code>private</code> и <code>public</code>. Правило простое: начинается с большой буквы — видно снаружи пакета, с маленькой — только внутри.</p>
<ul>
    <li><code>Name</code>, <code>Age</code>, <code>GetUser()</code> — <strong style="color:var(--accent);">экспортируемые</strong> (public)</li>
    <li><code>name</code>, <code>age</code>, <code>validate()</code> — <strong>приватные</strong> (только в пакете)</li>
</ul>

<h2>Duck Typing: «если крякает как утка — это утка»</h2>
<p>В Java вы пишете <code>class Dog implements Animal</code>. В Go достаточно иметь нужные методы — никакого явного объявления. Это называется <em>структурная типизация</em> (duck typing). Компилятор сам проверяет совместимость.</p>
<pre style="background:var(--surface-2); padding:12px; border-radius:6px; border:1px solid var(--border);"><code>// Java:  class Dog implements Animal { ... }
// Go:    type Dog struct { ... } // + методы Animal — и всё</code></pre>

<h2>Embedding: композиция вместо наследования</h2>
<p>Вместо <code>Dog extends Animal</code> в Go пишут <code>type Dog struct { Animal }</code>. Dog <em>содержит</em> Animal и автоматически получает все его поля и методы. Это не наследование — это делегирование. Dog может переопределить любой метод Animal.</p>
`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Инкапсуляция: конструктор и геттеры',
            code: `package main

import (
    "fmt"
    "errors"
)

// BankAccount — банковский счёт
// balance приватный — нельзя изменить напрямую
type BankAccount struct {
    owner   string  // приватное
    balance float64 // приватное — защита от прямого изменения
}

// NewBankAccount — конструктор с валидацией
// Соглашение Go: New + ИмяТипа
func NewBankAccount(owner string, initial float64) (*BankAccount, error) {
    if owner == "" {
        return nil, errors.New("owner name is required")
    }
    if initial < 0 {
        return nil, errors.New("initial balance cannot be negative")
    }
    return &BankAccount{
        owner:   owner,
        balance: initial,
    }, nil
}

// Геттеры — экспортируемые методы для чтения приватных полей
func (a *BankAccount) Owner() string   { return a.owner }
func (a *BankAccount) Balance() float64 { return a.balance }

// Методы-команды — единственный способ менять состояние
func (a *BankAccount) Deposit(amount float64) error {
    if amount <= 0 {
        return errors.New("deposit amount must be positive")
    }
    a.balance += amount
    return nil
}

func (a *BankAccount) Withdraw(amount float64) error {
    if amount <= 0 {
        return errors.New("withdraw amount must be positive")
    }
    if amount > a.balance {
        return fmt.Errorf("insufficient funds: have %.2f, need %.2f",
            a.balance, amount)
    }
    a.balance -= amount
    return nil
}

func main() {
    acc, err := NewBankAccount("Иван", 1000)
    if err != nil {
        fmt.Println("Ошибка:", err)
        return
    }

    acc.Deposit(500)
    acc.Withdraw(200)

    fmt.Printf("%s: %.2f руб.\n", acc.Owner(), acc.Balance())
    // acc.balance = 999999 // ошибка компиляции!
}`,
            explanation: 'Приватные поля owner и balance нельзя изменить снаружи пакета напрямую. Только через контролируемые методы Deposit/Withdraw, которые проверяют корректность данных. Это и есть инкапсуляция.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Полиморфизм: один интерфейс — много реализаций',
            code: `package main

import (
    "fmt"
    "math"
)

// Shape — интерфейс с двумя методами
// Любой тип, имеющий Area() и Perimeter() — это Shape
type Shape interface {
    Area() float64
    Perimeter() float64
    Name() string
}

// Rectangle реализует Shape (неявно!)
type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64      { return r.Width * r.Height }
func (r Rectangle) Perimeter() float64 { return 2 * (r.Width + r.Height) }
func (r Rectangle) Name() string       { return "Прямоугольник" }

// Circle реализует Shape (неявно!)
type Circle struct {
    Radius float64
}

func (c Circle) Area() float64      { return math.Pi * c.Radius * c.Radius }
func (c Circle) Perimeter() float64 { return 2 * math.Pi * c.Radius }
func (c Circle) Name() string       { return "Круг" }

// Triangle реализует Shape
type Triangle struct {
    A, B, C float64 // стороны
}

func (t Triangle) Area() float64 {
    s := t.Perimeter() / 2 // формула Герона
    return math.Sqrt(s * (s - t.A) * (s - t.B) * (s - t.C))
}
func (t Triangle) Perimeter() float64 { return t.A + t.B + t.C }
func (t Triangle) Name() string       { return "Треугольник" }

// PrintShape — работает с ЛЮБОЙ фигурой через интерфейс
// Не знает о конкретных типах — это полиморфизм
func PrintShape(s Shape) {
    fmt.Printf("%-15s: площадь=%.2f, периметр=%.2f\n",
        s.Name(), s.Area(), s.Perimeter())
}

// TotalArea — считает общую площадь любых фигур
func TotalArea(shapes []Shape) float64 {
    total := 0.0
    for _, s := range shapes {
        total += s.Area()
    }
    return total
}

func main() {
    shapes := []Shape{
        Rectangle{Width: 5, Height: 3},
        Circle{Radius: 4},
        Triangle{A: 3, B: 4, C: 5},
    }

    for _, s := range shapes {
        PrintShape(s)
    }

    fmt.Printf("\nОбщая площадь: %.2f\n", TotalArea(shapes))
}`,
            explanation: 'PrintShape и TotalArea принимают Shape — они не знают о Rectangle, Circle, Triangle. Добавить новую фигуру Hexagon? Просто реализуй три метода — код не изменится. Это полиморфизм в чистом виде.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Embedding: композиция как «наследование»',
            code: `package main

import "fmt"

// BaseEntity — базовые поля для всех сущностей
type BaseEntity struct {
    ID        int
    CreatedAt string
}

func (b BaseEntity) Describe() string {
    return fmt.Sprintf("ID=%d, создан=%s", b.ID, b.CreatedAt)
}

// Logger — миксин с логированием
type Logger struct {
    prefix string
}

func (l Logger) Log(msg string) {
    fmt.Printf("[%s] %s\n", l.prefix, msg)
}

// User встраивает BaseEntity и Logger
// Получает все их поля и методы "бесплатно"
type User struct {
    BaseEntity        // embedding — НЕ наследование
    Logger            // второй embedding
    Name  string
    Email string
}

// User может переопределить метод из BaseEntity
func (u User) Describe() string {
    // Вызов исходного метода через явное обращение
    base := u.BaseEntity.Describe()
    return fmt.Sprintf("User{%s, name=%s}", base, u.Name)
}

// Product тоже использует BaseEntity
type Product struct {
    BaseEntity
    Title string
    Price float64
}

func main() {
    user := User{
        BaseEntity: BaseEntity{ID: 1, CreatedAt: "2024-01-15"},
        Logger:     Logger{prefix: "USER"},
        Name:       "Алексей",
        Email:      "alex@example.com",
    }

    // Методы из встроенных типов доступны напрямую
    fmt.Println(user.Describe())         // переопределённый
    fmt.Println(user.BaseEntity.Describe()) // оригинальный
    user.Log("пользователь создан")     // из Logger

    // Прямой доступ к полям embedded-структуры
    fmt.Println(user.ID)      // из BaseEntity
    fmt.Println(user.prefix)  // из Logger

    product := Product{
        BaseEntity: BaseEntity{ID: 42, CreatedAt: "2024-01-16"},
        Title:      "Ноутбук",
        Price:      75000,
    }
    fmt.Println(product.Describe()) // из BaseEntity
}`,
            explanation: 'User встраивает BaseEntity и Logger — получает их поля и методы. Это не наследование: User содержит эти структуры как анонимные поля. Можно переопределить метод и при необходимости вызвать исходный через явное обращение u.BaseEntity.Describe().'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Методы на значении vs на указателе',
            code: `package main

import "fmt"

type Counter struct {
    value int
}

// Метод на значении (value receiver) — получает КОПИЮ
// Используй когда: не меняешь состояние, или тип маленький
func (c Counter) Value() int {
    return c.value
}

// Метод на указателе (pointer receiver) — получает ОРИГИНАЛ
// Используй когда: меняешь состояние, или тип большой (struct много полей)
func (c *Counter) Increment() {
    c.value++ // изменяет оригинал
}

func (c *Counter) Reset() {
    c.value = 0
}

func (c *Counter) Add(n int) {
    c.value += n
}

func main() {
    c := Counter{value: 0}

    c.Increment()
    c.Increment()
    c.Add(5)
    fmt.Println(c.Value()) // 7

    c.Reset()
    fmt.Println(c.Value()) // 0

    // Важно: если хоть один метод pointer receiver,
    // все методы лучше делать pointer receiver
    // для согласованности

    // Работа через указатель
    p := &Counter{}
    p.Increment()
    fmt.Println(p.Value()) // 1
}`,
            explanation: 'Value receiver: метод получает копию, изменения не влияют на оригинал. Pointer receiver: метод получает указатель, может изменять оригинал. Правило: если структура изменяет своё состояние — используй pointer receiver.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<strong>Главное правило Go-интерфейсов:</strong> чем меньше методов в интерфейсе — тем лучше. <code>io.Reader</code> — 1 метод, <code>fmt.Stringer</code> — 1 метод, <code>error</code> — 1 метод. Маленький интерфейс применим везде. Большой — только там, где всё реализовано.`
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<strong>Embedding ≠ Наследование.</strong> При embedding Dog не "является" Animal в смысле ООП. Dog содержит Animal. Если функция принимает <code>*Animal</code> — туда нельзя передать <code>*Dog</code>, даже если Dog встраивает Animal. Для полиморфизма используйте интерфейсы, не embedding.`
        },
        {
            type: 'editor',
            title: 'Практика: платёжная система',
            instructions: 'Создайте систему платежей. Объявите интерфейс PaymentMethod с методами Pay(amount float64) error и Name() string. Реализуйте его для CreditCard (имеет поля number string, limit float64) и CryptoWallet (имеет поля address string, balance float64). Напишите функцию ProcessPayment(p PaymentMethod, amount float64), которая выводит результат.',
            starterCode: `package main

import (
    "fmt"
    "errors"
)

// TODO: объявите интерфейс PaymentMethod
// методы: Pay(amount float64) error, Name() string

type CreditCard struct {
    number string
    limit  float64
}

// TODO: реализуйте методы для CreditCard
// Pay: возвращает ошибку если amount > limit
// Name: возвращает "CreditCard " + номер (последние 4 цифры)

type CryptoWallet struct {
    address string
    balance float64
}

// TODO: реализуйте методы для CryptoWallet
// Pay: уменьшает balance, ошибка если недостаточно средств
// Name: возвращает "CryptoWallet " + первые 6 символов адреса

// TODO: функция ProcessPayment(p PaymentMethod, amount float64)
// Выводит: "Оплата через X: успешно" или "Ошибка: ..."

func main() {
    payments := []PaymentMethod{
        &CreditCard{number: "1234567890123456", limit: 50000},
        &CryptoWallet{address: "0xAbCdEf123456", balance: 1000},
    }

    for _, p := range payments {
        ProcessPayment(p, 300)
    }

    _ = fmt.Println
    _ = errors.New
}`,
            hints: [
                'Интерфейс: type PaymentMethod interface { Pay(amount float64) error; Name() string }',
                'CreditCard.Pay: if amount > c.limit { return errors.New("превышен лимит") }',
                'CryptoWallet.Pay: if amount > w.balance { return errors.New("недостаточно средств") }; w.balance -= amount',
                'Для последних 4 цифр карты: c.number[len(c.number)-4:]',
                'ProcessPayment: if err := p.Pay(amount); err != nil { fmt.Printf("Ошибка: %v\\n", err) } else { fmt.Printf("Оплата через %s: успешно\\n", p.Name()) }'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q12-01-1',
                    type: 'single',
                    question: 'Как в Go реализуется интерфейс?',
                    options: [
                        'Через ключевое слово implements',
                        'Неявно — достаточно иметь все методы интерфейса',
                        'Через ключевое слово extends',
                        'Через явное объявление в struct'
                    ],
                    correct: 1,
                    explanation: 'В Go интерфейс реализуется неявно (duck typing). Если тип имеет все методы интерфейса — он автоматически его реализует. Писать "implements" не нужно — компилятор проверяет сам.'
                },
                {
                    id: 'q12-01-2',
                    type: 'single',
                    question: 'Что такое embedding в Go?',
                    options: [
                        'Наследование одной структуры от другой (как extends)',
                        'Встраивание структуры в другую: она получает все поля и методы',
                        'Реализация интерфейса через анонимные методы',
                        'Встраивание интерфейса в другой интерфейс'
                    ],
                    correct: 1,
                    explanation: 'Embedding — это композиция, не наследование. type Dog struct { Animal } — Dog содержит Animal и получает доступ к его полям и методам. Но Dog не является Animal в смысле типов.'
                },
                {
                    id: 'q12-01-3',
                    type: 'multiple',
                    question: 'Какие поля и методы будут приватными (видны только внутри пакета)?',
                    options: [
                        'name string',
                        'Name() string',
                        'userID int',
                        'GetUserID() int',
                        'createdAt time.Time'
                    ],
                    correct: [0, 2, 4],
                    explanation: 'Приватные идентификаторы начинаются с lowercase: name, userID, createdAt. Экспортируемые (PascalCase): Name, GetUserID. Это правило работает для полей, методов и функций.'
                },
                {
                    id: 'q12-01-4',
                    type: 'single',
                    question: 'Когда нужно использовать pointer receiver (func (c *Counter) Increment())?',
                    options: [
                        'Всегда, pointer receiver быстрее',
                        'Когда метод изменяет состояние структуры',
                        'Только для экспортируемых методов',
                        'Когда структура реализует интерфейс'
                    ],
                    correct: 1,
                    explanation: 'Pointer receiver нужен когда метод изменяет поля структуры (иначе изменится только копия), или когда структура большая (избегаем копирования). Value receiver — для методов только для чтения.'
                },
                {
                    id: 'q12-01-5',
                    type: 'code-fill',
                    question: 'Дополните объявление интерфейса Stringer с методом String() string:',
                    options: [
                        'type Stringer interface {',
                        'type Stringer struct {',
                        'interface Stringer {',
                        'type Stringer = interface {'
                    ],
                    correct: 0,
                    explanation: 'Интерфейс объявляется через "type Name interface { ... }". Keyword struct — для структур данных. interface Stringer { — синтаксическая ошибка Go.'
                },
                {
                    id: 'q12-01-6',
                    type: 'multiple',
                    question: 'Чем отличается embedding от наследования? (выберите все верные)',
                    options: [
                        'При embedding Dog не является Animal с точки зрения системы типов',
                        'При embedding Dog содержит Animal как анонимное поле',
                        'При наследовании методы родителя нельзя переопределить',
                        'При embedding можно встроить несколько структур одновременно',
                        'В Go embedding и наследование — одно и то же'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'Embedding — композиция: Dog содержит Animal, но не является им. Можно встроить несколько структур. Методы встроенной структуры можно переопределить. Наследования в Go нет.'
                }
            ]
        }
    ]
};
