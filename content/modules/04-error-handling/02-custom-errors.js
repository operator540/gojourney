export default {
    id: '04-02',
    title: 'Кастомные типы ошибок',
    description: 'Создание собственных структур-ошибок, методы Error(), errors.As для извлечения типа, sentinel errors против custom types',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: медицинская карта vs устный диагноз</h2>
                <p>Представьте два способа сообщить о проблеме со здоровьем:</p>
                <ul>
                    <li><strong>Устный диагноз:</strong> "Что-то не так с сердцем" — простая строка, никакого контекста</li>
                    <li><strong>Медицинская карта:</strong> Структурированный документ с полями: диагноз, дата, показатели, лечащий врач, назначения</li>
                </ul>
                <p>Sentinel errors (<code>errors.New</code>) — это устный диагноз. Они говорят <em>что</em> пошло не так, но не <em>почему</em> и <em>с чем именно</em>.</p>
                <p>Кастомные типы ошибок — это медицинская карта. Они несут <strong>структурированный контекст</strong>: какое поле не прошло валидацию, какой HTTP-код вернуть, ID ресурса которого не нашли.</p>

                <h2>Зачем нужны кастомные типы ошибок?</h2>
                <p>Рассмотрим ситуацию: ваш HTTP API получил плохой запрос. Что хочет знать обработчик?</p>
                <ul>
                    <li>Какой HTTP-статус код вернуть клиенту?</li>
                    <li>Какое именно поле невалидно?</li>
                    <li>Какое значение было передано?</li>
                    <li>Что ожидалось?</li>
                </ul>
                <p><code>errors.New("invalid input")</code> ничего из этого не даёт. Нужна структура.</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Подход</th>
                            <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Что несёт</th>
                            <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Когда использовать</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px 14px;border:1px solid var(--border)"><code>errors.New</code></td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Только строку</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Простые ошибки без контекста</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px 14px;border:1px solid var(--border)">Sentinel error</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Идентичность (переменная)</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Различать типы ошибок в switch</td>
                        </tr>
                        <tr>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Кастомный тип</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Структурированные данные</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Нужны детали для принятия решения</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Создание кастомного типа ошибки</h2>
                <p>Рецепт прост: создайте структуру и добавьте метод <code>Error() string</code>. Всё — теперь эта структура реализует интерфейс <code>error</code>.</p>
                <pre style="background:var(--surface-2);padding:16px;border-radius:8px;overflow-x:auto"><code>type MyError struct {
    Field   string
    Message string
    // любые поля с контекстом
}

func (e *MyError) Error() string {
    return fmt.Sprintf("my error: %s — %s", e.Field, e.Message)
}</code></pre>
                <p>Несколько важных деталей:</p>
                <ul>
                    <li>Метод реализуется на <strong>указателе</strong> <code>*MyError</code> (через pointer receiver) — это стандартная практика</li>
                    <li>Создаётся через <code>&amp;MyError{...}</code> — возвращаем указатель</li>
                    <li>Именование: <code>TypeNameError</code> — суффикс <code>Error</code> по соглашению Go</li>
                    <li>Можно добавить вспомогательные методы (не только <code>Error()</code>)</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Структуры-ошибки с богатым контекстом',
            code: `package main

import "fmt"

// ValidationError — ошибка валидации конкретного поля
type ValidationError struct {
    Field    string
    Value    any    // что передали
    Expected string // что ожидалось
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf(
        "validation error: поле %q получило %v, ожидалось %s",
        e.Field, e.Value, e.Expected,
    )
}

// NotFoundError — ресурс не существует
type NotFoundError struct {
    Resource string // "User", "Product", "Order"
    ID       int
}

func (e *NotFoundError) Error() string {
    return fmt.Sprintf("%s с ID=%d не существует", e.Resource, e.ID)
}

// DatabaseError — ошибка работы с БД
type DatabaseError struct {
    Operation string // "SELECT", "INSERT", "UPDATE"
    Table     string
    Cause     error  // оригинальная ошибка от драйвера
}

func (e *DatabaseError) Error() string {
    return fmt.Sprintf("database error: %s on %s: %v", e.Operation, e.Table, e.Cause)
}

// Unwrap нужен для поддержки errors.Is/As с вложенными ошибками
func (e *DatabaseError) Unwrap() error {
    return e.Cause
}

// --- Функции, возвращающие кастомные ошибки ---

func createUser(name string, age int) error {
    if name == "" {
        return &ValidationError{
            Field:    "name",
            Value:    name,
            Expected: "непустая строка",
        }
    }
    if age < 18 || age > 120 {
        return &ValidationError{
            Field:    "age",
            Value:    age,
            Expected: "число от 18 до 120",
        }
    }
    return nil // успех
}

func getProduct(id int) (string, error) {
    catalog := map[int]string{1: "Laptop", 2: "Phone"}
    name, ok := catalog[id]
    if !ok {
        return "", &NotFoundError{Resource: "Product", ID: id}
    }
    return name, nil
}

func main() {
    // ValidationError с деталями
    err := createUser("", 25)
    fmt.Println(err)
    // validation error: поле "name" получило , ожидалось непустая строка

    err = createUser("Alice", 15)
    fmt.Println(err)
    // validation error: поле "age" получило 15, ожидалось число от 18 до 120

    err = createUser("Alice", 25)
    fmt.Println(err) // <nil>

    // NotFoundError с деталями
    _, err = getProduct(99)
    fmt.Println(err)
    // Product с ID=99 не существует
}`,
            explanation: 'Каждый тип ошибки несёт именно тот контекст, который нужен для обработки. ValidationError знает поле и что ожидалось. NotFoundError знает тип ресурса и его ID. DatabaseError сохраняет оригинальную ошибку через Cause — это важно для debugging.'
        },
        {
            type: 'theory',
            content: `
                <h2>errors.As — извлечение конкретного типа</h2>
                <p>Когда у вас есть значение типа <code>error</code>, но вы хотите получить доступ к полям конкретной структуры — используйте <code>errors.As</code>.</p>
                <p>Это аналог type assertion (<code>err.(*ValidationError)</code>), но с важным преимуществом: <code>errors.As</code> работает <strong>через цепочку обёрток</strong>. Если ошибка была обёрнута несколько раз, <code>errors.As</code> найдёт нужный тип в глубине цепочки.</p>
                <pre style="background:var(--surface-2);padding:16px;border-radius:8px;overflow-x:auto"><code>var target *ValidationError
if errors.As(err, &target) {
    // target содержит *ValidationError с полями
    fmt.Println(target.Field)    // доступ к полям структуры
    fmt.Println(target.Expected)
}</code></pre>
                <p>Сигнатура: <code>errors.As(err error, target any) bool</code></p>
                <ul>
                    <li><code>err</code> — ошибка для проверки</li>
                    <li><code>target</code> — <strong>указатель на переменную</strong> целевого типа</li>
                    <li>Возвращает <code>true</code> если нашёл и заполнил <code>target</code></li>
                </ul>

                <h2>errors.Is vs errors.As — когда что</h2>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Функция</th>
                            <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Вопрос</th>
                            <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Используется с</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px 14px;border:1px solid var(--border)"><code>errors.Is(err, target)</code></td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Это та самая ошибка-значение?</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Sentinel errors (var ErrXxx)</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px 14px;border:1px solid var(--border)"><code>errors.As(err, &target)</code></td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Это ошибка такого типа?</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Кастомные типы (struct)</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'errors.As на практике — HTTP API обработчик',
            code: `package main

import (
    "errors"
    "fmt"
)

// Кастомные типы ошибок
type ValidationError struct {
    Field   string
    Message string
}
func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation: поле %q — %s", e.Field, e.Message)
}

type NotFoundError struct {
    Resource string
    ID       int
}
func (e *NotFoundError) Error() string {
    return fmt.Sprintf("%s #%d не найден", e.Resource, e.ID)
}

type PermissionError struct {
    Action   string
    Resource string
}
func (e *PermissionError) Error() string {
    return fmt.Sprintf("нет прав для %s над %s", e.Action, e.Resource)
}

// Бизнес-логика
func processOrder(userID, orderID int, quantity int) error {
    if quantity <= 0 {
        return &ValidationError{Field: "quantity", Message: "должно быть > 0"}
    }
    if orderID > 1000 {
        return &NotFoundError{Resource: "Order", ID: orderID}
    }
    if userID != 42 { // только пользователь 42 может делать заказы
        return &PermissionError{Action: "create", Resource: "Order"}
    }
    return nil
}

// HTTP-подобный обработчик — принимает решения по типу ошибки
func handleOrder(userID, orderID, quantity int) (int, string) {
    err := processOrder(userID, orderID, quantity)
    if err == nil {
        return 200, "Заказ создан успешно"
    }

    var validErr *ValidationError
    if errors.As(err, &validErr) {
        return 400, fmt.Sprintf(
            "Bad Request: поле '%s' — %s",
            validErr.Field, validErr.Message,
        )
    }

    var notFound *NotFoundError
    if errors.As(err, &notFound) {
        return 404, fmt.Sprintf(
            "Not Found: %s #%d не существует",
            notFound.Resource, notFound.ID,
        )
    }

    var permErr *PermissionError
    if errors.As(err, &permErr) {
        return 403, fmt.Sprintf(
            "Forbidden: нет прав на %s",
            permErr.Action,
        )
    }

    return 500, "Internal Server Error: " + err.Error()
}

func main() {
    cases := []struct{ userID, orderID, qty int }{
        {42, 1, 3},    // успех
        {42, 1, 0},    // validation error
        {42, 9999, 1}, // not found
        {1, 1, 1},     // permission error
    }

    for _, c := range cases {
        code, msg := handleOrder(c.userID, c.orderID, c.qty)
        fmt.Printf("[%d] %s\n", code, msg)
    }
    // [200] Заказ создан успешно
    // [400] Bad Request: поле 'quantity' — должно быть > 0
    // [404] Not Found: Order #9999 не существует
    // [403] Forbidden: нет прав на create
}`,
            explanation: 'errors.As позволяет обработчику вытащить конкретные поля из ошибки и принять умное решение. Без кастомных типов обработчику пришлось бы парсить строки (fragile) или жить без контекста. Обратите внимание: каждый errors.As требует объявить переменную нужного типа перед вызовом.'
        },
        {
            type: 'theory',
            content: `
                <h2>Добавление поведения к ошибкам</h2>
                <p>Кастомный тип ошибки — это полноценная Go-структура. Можно добавить любые методы, не только <code>Error()</code>:</p>
                <pre style="background:var(--surface-2);padding:16px;border-radius:8px;overflow-x:auto"><code>type HTTPError struct {
    StatusCode int
    Message    string
}

func (e *HTTPError) Error() string {
    return fmt.Sprintf("%d: %s", e.StatusCode, e.Message)
}

// Дополнительные методы
func (e *HTTPError) IsClientError() bool {
    return e.StatusCode >= 400 && e.StatusCode < 500
}

func (e *HTTPError) IsServerError() bool {
    return e.StatusCode >= 500
}

func (e *HTTPError) IsRetryable() bool {
    return e.StatusCode == 429 || e.StatusCode == 503
}</code></pre>
                <p>Методы делают ошибку "умной" — она сама знает своё поведение. Вызывающему коду не нужно знать коды HTTP-статусов.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Умная HTTPError с методами',
            code: `package main

import (
    "errors"
    "fmt"
)

type HTTPError struct {
    StatusCode int
    Message    string
    RequestID  string // для трейсинга
}

func (e *HTTPError) Error() string {
    if e.RequestID != "" {
        return fmt.Sprintf("HTTP %d: %s (request: %s)", e.StatusCode, e.Message, e.RequestID)
    }
    return fmt.Sprintf("HTTP %d: %s", e.StatusCode, e.Message)
}

func (e *HTTPError) IsClientError() bool { return e.StatusCode >= 400 && e.StatusCode < 500 }
func (e *HTTPError) IsServerError() bool { return e.StatusCode >= 500 }
func (e *HTTPError) IsRetryable() bool   { return e.StatusCode == 429 || e.StatusCode == 503 }

// --- Удобные конструкторы ---

func ErrBadRequest(msg string) error {
    return &HTTPError{StatusCode: 400, Message: msg}
}

func ErrNotFound(resource string) error {
    return &HTTPError{StatusCode: 404, Message: resource + " не найден"}
}

func ErrRateLimit() error {
    return &HTTPError{StatusCode: 429, Message: "слишком много запросов"}
}

func ErrServiceUnavailable() error {
    return &HTTPError{StatusCode: 503, Message: "сервис недоступен, попробуйте позже"}
}

// Логика повторных попыток
func fetchWithRetry(id int, maxRetries int) error {
    var lastErr error
    for attempt := 1; attempt <= maxRetries; attempt++ {
        err := fetchResource(id)
        if err == nil {
            return nil // успех
        }

        var httpErr *HTTPError
        if errors.As(err, &httpErr) {
            if httpErr.IsClientError() {
                return err // клиентская ошибка — не повторяем
            }
            if httpErr.IsRetryable() {
                fmt.Printf("Попытка %d/%d: %v\n", attempt, maxRetries, err)
                lastErr = err
                continue // повторяем
            }
        }
        return err // неизвестная ошибка
    }
    return fmt.Errorf("превышен лимит попыток: %w", lastErr)
}

func fetchResource(id int) error {
    if id == 429 { return ErrRateLimit() }
    if id == 503 { return ErrServiceUnavailable() }
    if id == 404 { return ErrNotFound("Resource") }
    return nil
}

func main() {
    // Тест клиентской ошибки — не повторяется
    fmt.Println("--- 404 Not Found ---")
    err := fetchWithRetry(404, 3)
    fmt.Println(err)

    // Тест retryable ошибки — повторяется
    fmt.Println("\n--- 429 Rate Limited ---")
    err = fetchWithRetry(429, 3)
    fmt.Println(err)
}`,
            explanation: 'Метод IsRetryable() инкапсулирует знание о том, какие ошибки стоит повторять. Код повторных попыток не знает про коды 429 и 503 — он просто спрашивает у ошибки. Это и есть сила кастомных типов: поведение живёт там, где оно принадлежит.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Соглашения по именованию кастомных типов:</strong></p>
            <ul>
                <li>Тип ошибки: <code>ValidationError</code>, <code>NetworkError</code>, <code>ParseError</code> — суффикс <code>Error</code></li>
                <li>Sentinel errors: <code>ErrNotFound</code>, <code>ErrTimeout</code> — префикс <code>Err</code></li>
                <li>Конструкторы: <code>NewValidationError</code> или просто <code>&ValidationError{...}</code></li>
                <li>Метод receiver: всегда указатель <code>*MyError</code>, не значение</li>
            </ul>`
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph TD
    A["error (интерфейс)"] --> B["errors.New / fmt.Errorf"]
    A --> C["Кастомный тип struct"]
    B --> D["Sentinel errors\nvar ErrXxx = errors.New()"]
    C --> E["ValidationError{Field, Value}"]
    C --> F["NotFoundError{Resource, ID}"]
    C --> G["HTTPError{StatusCode, Message}"]
    D --> H["errors.Is(err, ErrXxx)"]
    E --> I["errors.As(err, &valErr)"]
    F --> I
    G --> I
    style A fill:#00add8,color:#fff
    style H fill:#10b981,color:#fff
    style I fill:#d97706,color:#fff`,
            caption: 'Иерархия типов ошибок в Go и способы их проверки'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<p><strong>Частая ошибка: pointer vs value receiver</strong></p>
            <p>Если вы реализуете <code>Error()</code> на <em>значении</em> (не указателе), возникает хитрый баг с <code>errors.As</code>:</p>
            <pre style="background:var(--surface-2);padding:12px;border-radius:6px;margin-top:8px"><code>// Плохо: value receiver
func (e ValidationError) Error() string { ... }
// Создание: return ValidationError{...}  ← значение, не указатель

// Хорошо: pointer receiver  
func (e *ValidationError) Error() string { ... }
// Создание: return &ValidationError{...}  ← указатель</code></pre>
            <p>С pointer receiver тип <code>*ValidationError</code> реализует <code>error</code>. <code>errors.As(err, &target)</code> где <code>target *ValidationError</code> работает корректно.</p>`
        },
        {
            type: 'editor',
            title: 'Практика: Валидатор формы регистрации',
            instructions: `Создайте систему валидации формы регистрации:

1. Тип <code>FieldError</code> с полями <code>Field string</code>, <code>Value any</code>, <code>Rule string</code>
2. Тип <code>FormError</code> с полем <code>Errors []FieldError</code> и методами:
   - <code>Error() string</code> — выводит количество ошибок
   - <code>Add(field, rule string, value any)</code> — добавляет ошибку поля
   - <code>HasErrors() bool</code> — есть ли ошибки

3. Функцию <code>validateRegistration(name, email string, age int) error</code>:
   - name: непустая, длина >= 2
   - email: содержит @
   - age: от 18 до 100
   - Если ошибок нет — возвращает nil

В main используйте <code>errors.As</code> для вывода каждой ошибки поля.`,
            starterCode: `package main

import (
    "errors"
    "fmt"
    "strings"
)

type FieldError struct {
    Field string
    Value any
    Rule  string
}

type FormError struct {
    Errors []FieldError
}

func (e *FormError) Error() string {
    return fmt.Sprintf("форма содержит %d ошибок(и)", len(e.Errors))
}

func (e *FormError) Add(field, rule string, value any) {
    // TODO: добавить FieldError в e.Errors
}

func (e *FormError) HasErrors() bool {
    // TODO: вернуть true если len(e.Errors) > 0
    return false
}

func validateRegistration(name, email string, age int) error {
    form := &FormError{}

    // TODO: проверить name (непустая, len >= 2)
    // TODO: проверить email (содержит @)
    // TODO: проверить age (18-100)

    if form.HasErrors() {
        return form
    }
    return nil
}

func main() {
    err := validateRegistration("", "notanemail", 15)
    if err != nil {
        var formErr *FormError
        if errors.As(err, &formErr) {
            fmt.Println(formErr) // форма содержит 3 ошибок(и)
            for _, fe := range formErr.Errors {
                fmt.Printf("  - %s (значение: %v): нарушено правило '%s'\n",
                    fe.Field, fe.Value, fe.Rule)
            }
        }
    }

    err = validateRegistration("Alice", "alice@example.com", 25)
    if err == nil {
        fmt.Println("Регистрация успешна!")
    }
}`,
            hints: [
                'В Add: e.Errors = append(e.Errors, FieldError{Field: field, Value: value, Rule: rule})',
                'В HasErrors: return len(e.Errors) > 0',
                'Для проверки email: strings.Contains(email, "@")',
                'Проверяйте все поля и всегда вызывайте Add — не делайте early return внутри validateRegistration',
                'В конце если form.HasErrors() { return form } else { return nil }'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что нужно сделать, чтобы структура стала типом ошибки в Go?',
                    options: [
                        'Добавить метод Error() string',
                        'Встроить тип error в структуру',
                        'Импортировать пакет errors и наследоваться от BaseError',
                        'Зарегистрировать тип в runtime'
                    ],
                    correct: 0,
                    explanation: 'Интерфейс error требует только один метод: Error() string. Любая структура с таким методом автоматически реализует error — без явного объявления.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Чем errors.As отличается от type assertion err.(*MyError)?',
                    options: [
                        'errors.As работает через цепочку обёрнутых ошибок, type assertion — нет',
                        'Они полностью идентичны',
                        'errors.As быстрее',
                        'Type assertion работает с интерфейсами, errors.As — нет'
                    ],
                    correct: 0,
                    explanation: 'errors.As проходит по цепочке Unwrap() и находит нужный тип даже если ошибка была обёрнута несколько раз. Type assertion работает только с конкретным значением.'
                },
                {
                    id: 'q3',
                    type: 'multiple',
                    question: 'Когда стоит использовать кастомный тип ошибки вместо errors.New? (выберите все подходящие)',
                    options: [
                        'Нужно передать HTTP-статус код вместе с ошибкой',
                        'Нужно знать, какое именно поле не прошло валидацию',
                        'Нужно сохранить ID ресурса, который не нашли',
                        'Нужна простая ошибка "файл не найден" без деталей',
                        'Нужно добавить методы к ошибке (IsRetryable, IsClientError)'
                    ],
                    correct: [0, 1, 2, 4],
                    explanation: 'Кастомный тип нужен когда ошибке нужен структурированный контекст или поведение (методы). Для простой строки без данных errors.New достаточно.'
                },
                {
                    id: 'q4',
                    type: 'code-fill',
                    question: 'Как правильно создать экземпляр кастомной ошибки NotFoundError и вернуть её?',
                    template: 'return ___, nil\n// где err это *NotFoundError{Resource: "User", ID: id}',
                    correct: '&NotFoundError{Resource: "User", ID: id}',
                    explanation: 'Кастомные ошибки возвращаются как указатель (&NotFoundError{...}), потому что метод Error() обычно реализован на pointer receiver *NotFoundError.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Что делает второй аргумент в errors.As(err, &target)?',
                    options: [
                        'Это указатель на переменную целевого типа — если тип совпадёт, она будет заполнена',
                        'Это копия ожидаемого типа ошибки для сравнения',
                        'Это адрес куда записать строку ошибки',
                        'Это опциональный флаг — можно передать nil'
                    ],
                    correct: 0,
                    explanation: 'Нужно объявить var target *MyError и передать &target. Если errors.As найдёт *MyError в цепочке, target будет заполнен этим значением.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Вы объявили: var valErr *ValidationError; errors.As(err, &valErr) вернул true. Что теперь в valErr?',
                    options: [
                        'Указатель на ValidationError из цепочки ошибок err',
                        'nil',
                        'Копия интерфейса error',
                        'Строка с текстом ошибки'
                    ],
                    correct: 0,
                    explanation: 'После успешного errors.As, переменная target содержит указатель на конкретный экземпляр ValidationError. Через него можно получить доступ к полям: valErr.Field, valErr.Message.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Как называется соглашение об именовании кастомных типов ошибок в Go?',
                    options: [
                        'Суффикс Error: ValidationError, NetworkError, ParseError',
                        'Префикс Err: ErrValidation, ErrNetwork',
                        'Суффикс Exception: ValidationException',
                        'Префикс My: MyValidationError'
                    ],
                    correct: 0,
                    explanation: 'Типы ошибок (структуры) именуются с суффиксом Error. Sentinel errors (переменные) именуются с префиксом Err. Это важное различие в соглашениях Go.'
                }
            ]
        }
    ]
};
