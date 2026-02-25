export default {
    id: '02-03',
    title: 'Интерфейсы',
    description: 'Неявная реализация, duck typing, стандартные интерфейсы, composing, принципы проектирования',
    estimatedTime: 35,
    xpReward: 35,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Розетка в стене не знает что подключено</h2>
                <p>Розетка предоставляет стандартный интерфейс: два контакта определённого напряжения. К ней можно подключить телефон, ноутбук, лампу, фен — что угодно, если у устройства подходящий штекер. Розетка не знает и не должна знать, что именно подключено.</p>
                <p><strong>Интерфейс в Go работает так же.</strong> Функция принимает интерфейс — набор методов. Любой тип, у которого есть эти методы, подходит. Функция не знает конкретный тип и не должна знать.</p>
                <p>Реальный пример: функция <code>processPayment(p Payment)</code> не знает, платит ли пользователь картой, PayPal или криптовалютой — главное, что объект реализует метод <code>Pay(amount float64) error</code>.</p>
                <p>В Go интерфейсы реализуются <strong>неявно</strong>. Никакого ключевого слова <code>implements</code>. Если у типа есть все методы интерфейса — он его реализует. Точка. Это называется <strong>duck typing</strong>: «если ходит как утка и крякает как утка — это утка».</p>
                <p>Это радикально отличает Go от Java/C# и даёт мощное свойство: <strong>пакет A определяет интерфейс, пакет B реализует его — без зависимости между A и B</strong>. Это основа слабого связывания.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Интерфейс Payment: три реализации',
            code: `package main

import (
    "fmt"
    "math/rand"
)

// Payment — интерфейс: любой способ оплаты
type Payment interface {
    Pay(amount float64) error
    Name() string
}

// CreditCard реализует Payment (неявно — нет "implements")
type CreditCard struct {
    Number     string
    HolderName string
    Balance    float64
}

func (c *CreditCard) Pay(amount float64) error {
    if c.Balance < amount {
        return fmt.Errorf("недостаточно средств на карте")
    }
    c.Balance -= amount
    return nil
}
func (c *CreditCard) Name() string { return "Кредитная карта " + c.Number[len(c.Number)-4:] }

// PayPal реализует Payment
type PayPal struct {
    Email   string
    Balance float64
}

func (p *PayPal) Pay(amount float64) error {
    if p.Balance < amount {
        return fmt.Errorf("недостаточно средств в PayPal")
    }
    p.Balance -= amount
    return nil
}
func (p *PayPal) Name() string { return "PayPal (" + p.Email + ")" }

// Crypto реализует Payment
type Crypto struct {
    Wallet  string
    CoinBalance float64
    Rate    float64 // курс к рублю
}

func (c *Crypto) Pay(amount float64) error {
    coins := amount / c.Rate
    if c.CoinBalance < coins {
        return fmt.Errorf("недостаточно криптовалюты")
    }
    c.CoinBalance -= coins
    return nil
}
func (c *Crypto) Name() string { return "Крипто-кошелёк " + c.Wallet[:8] + "..." }

// processPayment — принимает ИНТЕРФЕЙС, не конкретный тип
// Работает с любой реализацией Payment
func processPayment(p Payment, amount float64) {
    fmt.Printf("Оплата через %s на сумму %.2f руб.\\n", p.Name(), amount)
    if err := p.Pay(amount); err != nil {
        fmt.Printf("  ❌ Ошибка: %s\\n", err)
    } else {
        fmt.Printf("  ✅ Успешно оплачено\\n")
    }
}

func main() {
    card := &CreditCard{Number: "4111111111111234", HolderName: "Иван", Balance: 50000}
    paypal := &PayPal{Email: "ivan@example.com", Balance: 10000}
    crypto := &Crypto{Wallet: "0xABCDEF123456789", CoinBalance: 1.5, Rate: 3500000}

    // Все три — разные типы, но все реализуют Payment
    processPayment(card, 15000)
    processPayment(paypal, 12000)
    processPayment(crypto, 5000)

    _ = rand.Int // just to use the import
}`,
            explanation: 'processPayment не знает о CreditCard, PayPal или Crypto. Если завтра добавится ApplePay — не нужно менять processPayment. Вот в чём сила интерфейсов: код открыт для расширения, закрыт для изменения.'
        },
        {
            type: 'info-box',
            variant: 'important',
            content: '<p><strong>Неявная реализация</strong> — мощная идея. В Java/C# нужно писать <code>class CreditCard implements Payment</code>. В Go достаточно иметь нужные методы. Это означает: можно определить интерфейс в своём коде и <em>существующие</em> типы автоматически его реализуют — без изменения их кода.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Go vs Java/C#: принципиальные отличия</h2>
                <p>Интерфейсы в Go кардинально отличаются от интерфейсов в Java или C#. Понимание этих отличий помогает писать идиоматичный Go-код.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead><tr style="background:var(--surface-2)">
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Аспект</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Go</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Java / C#</th>
                    </tr></thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Реализация</td>
                            <td style="padding:10px;border:1px solid var(--border)">Неявная — просто иметь методы</td>
                            <td style="padding:10px;border:1px solid var(--border)">Явная — <code>implements Interface</code></td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Связь</td>
                            <td style="padding:10px;border:1px solid var(--border)">Нет — тип не знает о существовании интерфейса</td>
                            <td style="padding:10px;border:1px solid var(--border)">Есть — тип явно зависит от интерфейса</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Ретрофит</td>
                            <td style="padding:10px;border:1px solid var(--border)">Да — существующий тип реализует новый интерфейс</td>
                            <td style="padding:10px;border:1px solid var(--border)">Нет — нужно изменить исходный класс</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Размер</td>
                            <td style="padding:10px;border:1px solid var(--border)">Маленькие (1-3 метода) — идиома Go</td>
                            <td style="padding:10px;border:1px solid var(--border)">Часто большие (много методов)</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Проверка</td>
                            <td style="padding:10px;border:1px solid var(--border)">Runtime + компилятор при передаче</td>
                            <td style="padding:10px;border:1px solid var(--border)">Только компилятор</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Стандартные интерфейсы Go: маленькие и мощные</h2>
                <p>Стандартная библиотека Go полна маленьких интерфейсов с одним-двумя методами. Самые важные которые вы встретите в каждом проекте:</p>
                <ul>
                    <li><code>error</code> — один метод <code>Error() string</code>: интерфейс для ошибок</li>
                    <li><code>fmt.Stringer</code> — <code>String() string</code>: для красивого вывода через fmt</li>
                    <li><code>io.Reader</code> — <code>Read([]byte) (int, error)</code>: источник данных</li>
                    <li><code>io.Writer</code> — <code>Write([]byte) (int, error)</code>: приёмник данных</li>
                    <li><code>io.Closer</code> — <code>Close() error</code>: ресурс который нужно закрыть</li>
                    <li><code>sort.Interface</code> — <code>Len, Less, Swap</code>: всё что можно отсортировать</li>
                    <li><code>http.Handler</code> — <code>ServeHTTP(ResponseWriter, *Request)</code>: HTTP обработчик</li>
                </ul>
                <p>Реализуйте эти интерфейсы — и ваши типы сразу начинают работать со всей экосистемой Go.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'fmt.Stringer и error: самые нужные',
            code: `package main

import "fmt"

// ===== fmt.Stringer =====
// type Stringer interface { String() string }

type OrderStatus string

type Order struct {
    ID     int
    Status OrderStatus
    Total  float64
}

// Реализуем fmt.Stringer — fmt.Println вызовет String() автоматически
func (o Order) String() string {
    return fmt.Sprintf("Заказ #%d [%s] на %.2f руб.", o.ID, o.Status, o.Total)
}

// ===== error interface =====
// type error interface { Error() string }

// ValidationError — собственный тип ошибки
type ValidationError struct {
    Field   string
    Message string
    Value   any
}

func (e ValidationError) Error() string {
    return fmt.Sprintf("поле '%s': %s (получено: %v)", e.Field, e.Message, e.Value)
}

// PaymentError — другой тип ошибки
type PaymentError struct {
    Amount  float64
    Reason  string
}

func (e PaymentError) Error() string {
    return fmt.Sprintf("ошибка оплаты %.2f руб.: %s", e.Amount, e.Reason)
}

func validatePrice(price float64) error {
    if price <= 0 {
        return ValidationError{Field: "price", Message: "должна быть положительной", Value: price}
    }
    if price > 1_000_000 {
        return ValidationError{Field: "price", Message: "слишком высокая цена", Value: price}
    }
    return nil
}

func main() {
    order := Order{ID: 1001, Status: "paid", Total: 45000.0}
    fmt.Println(order) // Заказ #1001 [paid] на 45000.00 руб.

    // Любая функция fmt принимает Stringer
    fmt.Printf("Текущий заказ: %v\\n", order)

    // Обработка ошибок
    if err := validatePrice(-100); err != nil {
        fmt.Println("Ошибка:", err)
        // поле 'price': должна быть положительной (получено: -100)
    }

    var payErr PaymentError = PaymentError{Amount: 5000, Reason: "недостаточно средств"}
    fmt.Println(payErr) // ошибка оплаты 5000.00 руб.: недостаточно средств
}`,
            explanation: 'Реализуйте String() — и fmt.Println, fmt.Sprintf, логи будут выводить ваш тип красиво. Реализуйте Error() — и ваш тип станет ошибкой совместимой со всей экосистемой Go.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'io.Reader и io.Writer: фундамент I/O',
            code: `package main

import (
    "fmt"
    "io"
    "strings"
)

// Любой источник данных реализует io.Reader:
// файлы, HTTP тело, строки, буферы, архивы...

// countWords подсчитывает слова в любом io.Reader
func countWords(r io.Reader) (int, error) {
    data, err := io.ReadAll(r)
    if err != nil {
        return 0, err
    }
    words := strings.Fields(string(data))
    return len(words), nil
}

// OrderExporter пишет заказы в любой io.Writer:
// файл, HTTP response, буфер, os.Stdout...
type OrderExporter struct{}

func (e OrderExporter) Export(w io.Writer, orders []string) error {
    for i, order := range orders {
        _, err := fmt.Fprintf(w, "%d. %s\\n", i+1, order)
        if err != nil {
            return err
        }
    }
    return nil
}

func main() {
    // strings.NewReader реализует io.Reader
    r := strings.NewReader("Go — отличный язык для backend разработки")
    n, _ := countWords(r)
    fmt.Printf("Слов в тексте: %d\\n", n) // Слов в тексте: 7

    // strings.Builder реализует io.Writer
    var buf strings.Builder
    exporter := OrderExporter{}
    exporter.Export(&buf, []string{
        "Заказ #1001: Ноутбук — 85000 руб.",
        "Заказ #1002: Смартфон — 45000 руб.",
    })
    fmt.Print(buf.String())
    // 1. Заказ #1001: Ноутбук — 85000 руб.
    // 2. Заказ #1002: Смартфон — 45000 руб.

    // Та же функция с os.Stdout:
    // exporter.Export(os.Stdout, orders)
}`,
            explanation: 'countWords работает с файлами, HTTP-запросами, строками — любым io.Reader. Export пишет в файл, HTTP-ответ, stdout — любой io.Writer. Это и есть сила интерфейсов.'
        },
        {
            type: 'theory',
            content: `
                <h2>Composing interfaces: маленькие + маленькие = большой</h2>
                <p>Go-идиома: держите интерфейсы маленькими (1-3 метода). Большие интерфейсы создавайте через встраивание маленьких — composing.</p>
                <p>Стандартная библиотека делает это повсеместно: <code>io.ReadWriter</code> = <code>io.Reader</code> + <code>io.Writer</code>, <code>io.ReadWriteCloser</code> = <code>io.Reader</code> + <code>io.Writer</code> + <code>io.Closer</code>.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Composing интерфейсов для интернет-магазина',
            code: `package main

import "fmt"

// Маленькие интерфейсы — Single Responsibility
type Payer interface {
    Pay(amount float64) error
}

type Refunder interface {
    Refund(amount float64) error
}

type BalanceChecker interface {
    Balance() float64
}

// Составной интерфейс через embedding
type FullPaymentProcessor interface {
    Payer
    Refunder
    BalanceChecker
}

// Функция принимает только нужный интерфейс — минимальный
func charge(p Payer, amount float64) {
    if err := p.Pay(amount); err != nil {
        fmt.Println("Ошибка:", err)
    }
}

// Эта функция требует больше возможностей
func handleDispute(p FullPaymentProcessor, refundAmount float64) {
    fmt.Printf("Баланс до возврата: %.2f\\n", p.Balance())
    if err := p.Refund(refundAmount); err != nil {
        fmt.Println("Возврат не удался:", err)
        return
    }
    fmt.Printf("Баланс после возврата: %.2f\\n", p.Balance())
}

// SmartCard реализует все три интерфейса
type SmartCard struct {
    balance float64
}

func (s *SmartCard) Pay(amount float64) error {
    if s.balance < amount {
        return fmt.Errorf("недостаточно средств")
    }
    s.balance -= amount
    return nil
}

func (s *SmartCard) Refund(amount float64) error {
    s.balance += amount
    return nil
}

func (s *SmartCard) Balance() float64 { return s.balance }

func main() {
    card := &SmartCard{balance: 10000}

    // SmartCard реализует Payer — передаём как Payer
    charge(card, 3000)
    fmt.Printf("После оплаты: %.2f\\n", card.Balance()) // 7000

    // SmartCard реализует FullPaymentProcessor
    handleDispute(card, 1500)
    // Баланс до возврата: 7000
    // Баланс после возврата: 8500
}`,
            explanation: 'charge принимает только Payer — ей не нужно знать о Refund и Balance. handleDispute требует полный интерфейс. Принцип разделения интерфейсов (ISP) из SOLID в действии.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p><strong>«Accept interfaces, return structs»</strong> — главная идиома Go. Принимайте интерфейс в параметре функции (гибкость — любой тип подойдёт). Возвращайте конкретный тип (ясность — пользователь знает что получает). Это делает код гибким и тестируемым.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Пустой интерфейс (any): с осторожностью</h2>
                <p><code>interface{}</code> — интерфейс без методов. Любой тип его реализует. С Go 1.18 введён алиас <code>any</code>.</p>
                <p>Используется когда тип реально неизвестен заранее: JSON-декодирование, логирование, обобщённые контейнеры. Но <code>any</code> — это отказ от типобезопасности. Чтобы работать со значением, нужны утверждения типов (следующий урок).</p>
                <p>С Go 1.18 появились дженерики — они часто лучше <code>any</code> для обобщённых структур.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'any: когда нужен и типичные ошибки',
            code: `package main

import "fmt"

// ✅ Оправданное использование any: логгер принимает любые значения
type Logger struct {
    prefix string
}

func (l Logger) Log(fields map[string]any) {
    fmt.Printf("[%s] ", l.prefix)
    for k, v := range fields {
        fmt.Printf("%s=%v ", k, v)
    }
    fmt.Println()
}

// ✅ Оправданное использование: JSON-подобная структура
type JSONObject map[string]any

// ❌ НЕ оправданное: используйте конкретный интерфейс
func badProcess(item any) {
    // Теперь нужно угадывать тип — любой тип подходит
    // Нет гарантий от компилятора
}

// ✅ ЛУЧШЕ: используйте конкретный интерфейс
type Processable interface {
    Process() error
}

func goodProcess(item Processable) {
    item.Process() // компилятор гарантирует наличие метода
}

func printAnything(v any) {
    fmt.Printf("Тип: %T, Значение: %v\\n", v, v)
}

func main() {
    log := Logger{prefix: "ORDER"}
    log.Log(map[string]any{
        "id":     1001,
        "status": "paid",
        "total":  45000.0,
    })

    // any принимает всё
    printAnything(42)
    printAnything("hello")
    printAnything([]int{1, 2, 3})

    // map[string]any — частый паттерн для гибких структур
    data := JSONObject{
        "name":    "Ноутбук",
        "price":   85000,
        "inStock": true,
    }
    fmt.Println(data["name"]) // Ноутбук
}`,
            explanation: 'any уместен для логов, JSON, конфигов — где тип реально неизвестен. Для бизнес-логики предпочитайте конкретные интерфейсы — компилятор проверит корректность кода.'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: '<p><strong>Типичная ошибка: слишком большой интерфейс.</strong> Если интерфейс требует 10 методов — его трудно реализовать, трудно замокать в тестах, он нарушает ISP. Признак проблемы: если создать реализацию для тестов сложно, интерфейс слишком большой. Разбейте на маленькие.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>nil-ловушка интерфейсов: знайте заранее</h2>
                <p>Интерфейсная переменная хранит пару <strong>(тип, значение)</strong>. Переменная равна <code>nil</code> только если <em>оба</em> компонента nil. Это неочевидное поведение часто вызывает баги.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'nil-ловушка: классический баг',
            code: `package main

import "fmt"

type AppError struct{ Msg string }
func (e *AppError) Error() string { return e.Msg }

// ❌ ПЛОХО: возвращает типизированный nil
func getErrorBAD(fail bool) error {
    var err *AppError // nil-указатель типа *AppError
    if fail {
        err = &AppError{Msg: "что-то пошло не так"}
    }
    return err // ОПАСНО: возвращает (*AppError, nil), не nil-интерфейс!
}

// ✅ ХОРОШО: явный nil
func getErrorGOOD(fail bool) error {
    if fail {
        return &AppError{Msg: "что-то пошло не так"}
    }
    return nil // возвращает (nil, nil) — настоящий nil-интерфейс
}

func main() {
    err1 := getErrorBAD(false)
    // err1 != nil, потому что интерфейс хранит тип *AppError!
    fmt.Println("BAD == nil:", err1 == nil)  // false — НЕОЖИДАННО!
    fmt.Printf("BAD: тип=%T, значение=%v\\n", err1, err1)
    // тип=*main.AppError, значение=<nil>

    err2 := getErrorGOOD(false)
    fmt.Println("GOOD == nil:", err2 == nil) // true — правильно
    fmt.Printf("GOOD: тип=%T, значение=%v\\n", err2, err2)
    // тип=<nil>, значение=<nil>
}`,
            explanation: 'Никогда не возвращайте типизированный nil-указатель туда где ожидается интерфейс. Всегда пишите return nil напрямую. Это один из самых коварных багов Go.'
        },
        {
            type: 'theory',
            content: `
                <h2>Recap: что узнали</h2>
                <ul>
                    <li>🔑 <strong>Интерфейс</strong> — набор сигнатур методов без реализации</li>
                    <li>🔑 <strong>Неявная реализация</strong>: нет <code>implements</code>, достаточно иметь методы</li>
                    <li>🔑 <strong>Duck typing</strong>: «если ходит как утка» — подходит любой тип с нужными методами</li>
                    <li>🔑 <strong>Маленькие интерфейсы</strong>: 1-3 метода — идиома Go. Большие — через composing</li>
                    <li>🔑 <strong>Стандартные</strong>: error, Stringer, io.Reader, io.Writer — реализуйте их</li>
                    <li>🔑 <strong>«Accept interfaces, return structs»</strong> — главный принцип</li>
                    <li>🔑 <strong>any</strong> = <code>interface{}</code> — использовать осторожно, только когда тип реально неизвестен</li>
                    <li>🔑 <strong>nil-ловушка</strong>: всегда возвращайте <code>return nil</code>, не типизированный nil-указатель</li>
                </ul>
                <p><strong>Что дальше:</strong> встраивание (embedding) — мощный механизм композиции, заменяющий наследование. Он тесно связан с интерфейсами.</p>
            `
        },
        {
            type: 'editor',
            title: 'Практика: Интерфейс Notifier',
            instructions: 'Создайте интерфейс Notifier с методом Send(to, message string) error. Реализуйте EmailNotifier (выводит "[EMAIL] to: X msg: Y") и SMSNotifier (выводит "[SMS] to: X msg: Y"). Напишите функцию notifyUser которая принимает Notifier и отправляет приветственное сообщение.',
            starterCode: `package main

import "fmt"

type Notifier interface {
    // Ваш метод Send
}

type EmailNotifier struct{}

// Реализуйте Send для EmailNotifier

type SMSNotifier struct{}

// Реализуйте Send для SMSNotifier

func notifyUser(n Notifier, userEmail, userName string) {
    // Ваш код: отправьте сообщение "Добро пожаловать, {userName}!"
}

func main() {
    email := &EmailNotifier{}
    sms := &SMSNotifier{}

    notifyUser(email, "ivan@example.com", "Иван")
    // [EMAIL] to: ivan@example.com msg: Добро пожаловать, Иван!

    notifyUser(sms, "+79001234567", "Мария")
    // [SMS] to: +79001234567 msg: Добро пожаловать, Мария!
}`,
            hints: [
                'Notifier: Send(to, message string) error',
                'EmailNotifier.Send: fmt.Printf("[EMAIL] to: %s msg: %s\\n", to, message); return nil',
                'SMSNotifier.Send: fmt.Printf("[SMS] to: %s msg: %s\\n", to, message); return nil',
                'notifyUser: n.Send(userEmail, "Добро пожаловать, " + userName + "!")'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Как тип реализует интерфейс в Go?',
                    options: [
                        'Автоматически — если имеет все методы интерфейса',
                        'Через ключевое слово implements',
                        'Через наследование от базового класса',
                        'Через явную регистрацию в рантайме'
                    ],
                    correct: 0,
                    explanation: 'В Go реализация неявная (structural/duck typing). Никакого implements. Если тип имеет все методы — он реализует интерфейс.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что такое any в Go 1.18+?',
                    options: [
                        'Алиас для interface{} — пустой интерфейс без методов',
                        'Новый тип данных для универсальных значений',
                        'Ключевое слово для дженериков',
                        'Специальный тип для JSON'
                    ],
                    correct: 0,
                    explanation: 'any — это алиас: type any = interface{}. Любой тип реализует пустой интерфейс, так как у него нет методов которые нужно реализовывать.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Какой метод нужно реализовать для интерфейса error?',
                    options: [
                        'Error() string',
                        'String() string',
                        'Err() error',
                        'Message() string'
                    ],
                    correct: 0,
                    explanation: 'type error interface { Error() string } — встроенный интерфейс Go. Реализуйте Error() string — и ваш тип становится ошибкой.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Функция принимает io.Writer. Что из этого можно передать?',
                    options: [
                        'Любой тип у которого есть метод Write([]byte) (int, error)',
                        'Только os.File',
                        'Только strings.Builder',
                        'Только bytes.Buffer'
                    ],
                    correct: 0,
                    explanation: 'io.Writer — это интерфейс. Любой тип с методом Write([]byte)(int,error) подходит: os.File, strings.Builder, bytes.Buffer, http.ResponseWriter, ваш собственный тип.'
                },
                {
                    id: 'q5',
                    type: 'multiple',
                    question: 'Что верно о nil-ловушке интерфейсов? (несколько ответов)',
                    options: [
                        'Интерфейс == nil только если оба компонента (тип и значение) nil',
                        'Типизированный nil-указатель в интерфейсе != nil',
                        'Всегда возвращайте return nil, не типизированный nil',
                        'Интерфейс == nil если значение nil, независимо от типа'
                    ],
                    correct: [0, 1, 2],
                    explanation: 'Интерфейс хранит пару (тип, значение). var err *AppError; return err возвращает (*AppError, nil) — не nil-интерфейс. Всегда: return nil.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Какой принцип рекомендует Go при работе с интерфейсами?',
                    options: [
                        'Accept interfaces, return structs',
                        'Accept structs, return interfaces',
                        'Всегда использовать большие интерфейсы',
                        'Явно объявлять реализацию через implements'
                    ],
                    correct: 0,
                    explanation: 'Принимайте интерфейсы — функция становится гибкой, работает с любой реализацией. Возвращайте конкретные типы — вызывающий код знает что именно получает.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Сколько методов должен иметь интерфейс в Go (по идиоме)?',
                    options: [
                        '1-3 метода — маленькие интерфейсы предпочтительны',
                        'Чем больше методов тем лучше',
                        'Ровно 1 метод — больше не допускается',
                        'Стандарта нет — любое количество'
                    ],
                    correct: 0,
                    explanation: 'Go-идиома: маленькие интерфейсы. Лучший пример — io.Reader с одним методом. Большие интерфейсы трудно реализовывать и замокать в тестах.'
                },
                {
                    id: 'q8',
                    type: 'code-fill',
                    question: 'Какой метод нужен для реализации fmt.Stringer?',
                    template: 'func (o Order) ___() string { return fmt.Sprintf("...") }',
                    correct: 'String',
                    caseSensitive: true,
                    explanation: 'fmt.Stringer: type Stringer interface { String() string }. Реализуйте String() — и fmt.Println вызовет его автоматически.'
                }
            ]
        }
    ]
};
