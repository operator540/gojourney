export default {
    id: '02-05',
    title: 'Утверждения типов (Type assertions)',
    description: 'Type assertion, comma-ok паттерн, type switch, проверка интерфейсов — работа с конкретными типами через интерфейсы',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: детектив проверяет документы</h2>
                <p>Представьте детектива у входа на закрытое мероприятие. К нему подходят разные люди — все они <em>«посетители»</em> (это интерфейс). Но детектив хочет знать конкретно: это журналист, полицейский или просто гость? Он проверяет документы — и в зависимости от результата принимает решение.</p>
                <p>Именно это делает <strong>type assertion</strong> в Go: у вас есть переменная-интерфейс (все одинаковые «посетители»), и вы хотите узнать — какой за ней скрывается конкретный тип.</p>

                <h2>Зачем нужны утверждения типов?</h2>
                <p>Когда переменная имеет тип интерфейса, вы знаете <em>что она умеет</em> (методы интерфейса), но не знаете <em>что она есть</em> (конкретный тип). Type assertion позволяет:</p>
                <ul>
                    <li>Извлечь конкретное значение из интерфейса</li>
                    <li>Проверить, реализует ли значение другой интерфейс</li>
                    <li>Обработать разные типы по-разному (type switch)</li>
                    <li>Получить доступ к методам, которые не входят в интерфейс</li>
                </ul>

                <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px; border:1px solid var(--border); text-align:left">Способ</th>
                            <th style="padding:10px; border:1px solid var(--border); text-align:left">Синтаксис</th>
                            <th style="padding:10px; border:1px solid var(--border); text-align:left">Когда использовать</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px; border:1px solid var(--border)">Простое assertion</td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>v := i.(T)</code></td>
                            <td style="padding:10px; border:1px solid var(--border)">Когда точно знаете тип (риск panic)</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px; border:1px solid var(--border)">Comma-ok паттерн</td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>v, ok := i.(T)</code></td>
                            <td style="padding:10px; border:1px solid var(--border)">Безопасная проверка типа</td>
                        </tr>
                        <tr>
                            <td style="padding:10px; border:1px solid var(--border)">Type switch</td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>switch v := i.(type)</code></td>
                            <td style="padding:10px; border:1px solid var(--border)">Несколько возможных типов</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px; border:1px solid var(--border)">Проверка интерфейса</td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>v, ok := i.(SomeInterface)</code></td>
                            <td style="padding:10px; border:1px solid var(--border)">Опциональные возможности</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Type assertion: простой и безопасный варианты',
            code: `package main

import "fmt"

func main() {
    // any = interface{} — хранит любое значение
    var i any = "hello, Go"

    // === Небезопасный вариант: i.(T) ===
    s := i.(string)
    fmt.Println(s)      // hello, Go
    fmt.Println(len(s)) // 10

    // Если тип неверный — PANIC!
    // n := i.(int)
    // panic: interface conversion: interface {} is string, not int

    // === Безопасный вариант: comma-ok ===
    n, ok := i.(int)
    fmt.Printf("int: %v, ok: %v\\n", n, ok)  // int: 0, ok: false — без паники!

    s2, ok := i.(string)
    fmt.Printf("string: %q, ok: %v\\n", s2, ok) // string: "hello, Go", ok: true

    // === Разные типы в any ===
    values := []any{42, "text", true, 3.14, nil}

    for _, v := range values {
        if str, ok := v.(string); ok {
            fmt.Printf("Строка: %q (длина %d)\\n", str, len(str))
        } else if num, ok := v.(int); ok {
            fmt.Printf("Целое: %d\\n", num)
        } else {
            fmt.Printf("Другой тип: %T = %v\\n", v, v)
        }
    }
}`,
            explanation: 'i.(string) — опасно: panic если тип не string. s, ok := i.(string) — безопасно: ok = false без паники. Правило: всегда используйте comma-ok кроме случаев, когда вы на 100% уверены в типе (например, сразу после type switch).'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `
                <p><strong>Никогда не используйте</strong> <code>v := i.(T)</code> без comma-ok в производственном коде, если нет абсолютной гарантии типа. Panic в runtime намного хуже ошибки компиляции.</p>
                <p>Единственное исключение: внутри case ветки type switch — там тип уже гарантирован компилятором.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Type switch — элегантная проверка нескольких типов</h2>
                <p><code>type switch</code> — это специальная форма switch, которая проверяет <strong>тип</strong> значения интерфейса, а не его значение. Это чище и безопаснее, чем цепочка if с comma-ok.</p>
                <p>Синтаксис <code>switch v := i.(type)</code> — заметьте ключевое слово <code>type</code> вместо конкретного типа. В каждой ветке <code>case</code> переменная <code>v</code> автоматически имеет нужный тип.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Type switch: полный пример',
            code: `package main

import (
    "fmt"
    "strings"
)

// describe — универсальная функция для любого значения
func describe(i any) string {
    switch v := i.(type) {
    case nil:
        return "nil"
    case bool:
        if v {
            return "истина (bool)"
        }
        return "ложь (bool)"
    case int:
        return fmt.Sprintf("целое: %d", v)
    case int64:
        return fmt.Sprintf("int64: %d", v)
    case float64:
        return fmt.Sprintf("дробное: %.2f", v)
    case string:
        return fmt.Sprintf("строка %q (длина: %d)", v, len(v))
    case []int:
        return fmt.Sprintf("[]int длиной %d: %v", len(v), v)
    case []string:
        return fmt.Sprintf("[]string: [%s]", strings.Join(v, ", "))
    case map[string]any:
        return fmt.Sprintf("map с %d ключами", len(v))
    case error:
        // error — это интерфейс! Работает и с интерфейсами
        return fmt.Sprintf("ошибка: %s", v.Error())
    default:
        // %T — формат для вывода типа
        return fmt.Sprintf("неизвестный тип %T: %v", v, v)
    }
}

func main() {
    cases := []any{
        nil,
        true,
        false,
        42,
        int64(100),
        3.14,
        "Go lang",
        []int{1, 2, 3},
        []string{"a", "b"},
        map[string]any{"key": "val"},
        fmt.Errorf("что-то пошло не так"),
        struct{ X int }{X: 5},
    }

    for _, c := range cases {
        fmt.Println(describe(c))
    }
}`,
            explanation: 'В каждой case ветке v уже имеет нужный тип: в case string v — это string, в case []int v — это []int. Никакого ручного приведения типов. Ветка case error работает с интерфейсами — это очень полезно для обработки ошибок.'
        },
        {
            type: 'theory',
            content: `
                <h2>Проверка реализации интерфейса</h2>
                <p>Type assertion работает не только с конкретными типами, но и с <strong>интерфейсами</strong>. Это позволяет реализовать <em>опциональные возможности</em>: базовый интерфейс обязателен, расширенный — проверяется при необходимости.</p>
                <p>Классический пример из стандартной библиотеки: <code>http.ResponseWriter</code> — обязательный интерфейс. А <code>http.Flusher</code> (опциональный flush) — проверяется отдельно.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Проверка опциональных интерфейсов',
            code: `package main

import "fmt"

// Базовый обязательный интерфейс
type Storage interface {
    Get(key string) (string, error)
    Set(key, value string) error
}

// Опциональный интерфейс — расширение
type BulkStorage interface {
    Storage
    SetBulk(data map[string]string) error
}

// Ещё один опциональный интерфейс
type ClearableStorage interface {
    Clear() error
}

// MemStorage реализует всё
type MemStorage struct {
    data map[string]string
}

func NewMemStorage() *MemStorage {
    return &MemStorage{data: make(map[string]string)}
}

func (m *MemStorage) Get(key string) (string, error) {
    v, ok := m.data[key]
    if !ok {
        return "", fmt.Errorf("ключ %q не найден", key)
    }
    return v, nil
}

func (m *MemStorage) Set(key, value string) error {
    m.data[key] = value
    return nil
}

func (m *MemStorage) SetBulk(data map[string]string) error {
    for k, v := range data {
        m.data[k] = v
    }
    return nil
}

func (m *MemStorage) Clear() error {
    m.data = make(map[string]string)
    return nil
}

// ReadOnlyStorage — реализует только базовый Storage
type ReadOnlyStorage struct {
    data map[string]string
}

func (r ReadOnlyStorage) Get(key string) (string, error) {
    return r.data[key], nil
}

func (r ReadOnlyStorage) Set(key, value string) error {
    return fmt.Errorf("хранилище только для чтения")
}

// processStorage — использует базовый интерфейс,
// но проверяет опциональные возможности
func processStorage(s Storage) {
    s.Set("key1", "value1")

    // Проверяем опциональный BulkStorage
    if bulk, ok := s.(BulkStorage); ok {
        fmt.Println("Поддерживается пакетная запись!")
        bulk.SetBulk(map[string]string{
            "key2": "value2",
            "key3": "value3",
        })
    } else {
        fmt.Println("Пакетная запись не поддерживается")
    }

    // Проверяем опциональный ClearableStorage
    if clearable, ok := s.(ClearableStorage); ok {
        fmt.Println("Можно очистить хранилище")
        _ = clearable
    }

    v, _ := s.Get("key1")
    fmt.Println("key1:", v)
}

func main() {
    fmt.Println("=== MemStorage ===")
    processStorage(NewMemStorage())

    fmt.Println("\\n=== ReadOnlyStorage ===")
    processStorage(ReadOnlyStorage{data: map[string]string{}})
}`,
            explanation: 'processStorage принимает базовый Storage, но через type assertion проверяет наличие расширенных возможностей. Это паттерн "capability checking" — код адаптируется к реальным возможностям объекта без жёсткой зависимости от конкретного типа.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Реальный пример: обработка ошибок с type switch',
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
    return fmt.Sprintf("validation error: field %q — %s", e.Field, e.Message)
}

type NotFoundError struct {
    Resource string
    ID       int
}

func (e *NotFoundError) Error() string {
    return fmt.Sprintf("%s with id=%d not found", e.Resource, e.ID)
}

type DatabaseError struct {
    Query string
    Cause error
}

func (e *DatabaseError) Error() string {
    return fmt.Sprintf("db error in query %q: %v", e.Query, e.Cause)
}

// Unwrap для errors.Is/As
func (e *DatabaseError) Unwrap() error {
    return e.Cause
}

// Функция возвращает разные ошибки
func processRequest(userID int, name string) error {
    if name == "" {
        return &ValidationError{Field: "name", Message: "не может быть пустым"}
    }
    if userID <= 0 {
        return &NotFoundError{Resource: "user", ID: userID}
    }
    if userID > 1000 {
        return &DatabaseError{
            Query: "SELECT * FROM users WHERE id = ?",
            Cause: errors.New("connection timeout"),
        }
    }
    return nil
}

// handleError обрабатывает ошибки через type switch
func handleError(err error) {
    if err == nil {
        fmt.Println("OK")
        return
    }

    switch e := err.(type) {
    case *ValidationError:
        fmt.Printf("[400] Ошибка валидации поля %q: %s\\n", e.Field, e.Message)
    case *NotFoundError:
        fmt.Printf("[404] Ресурс %q с ID=%d не найден\\n", e.Resource, e.ID)
    case *DatabaseError:
        fmt.Printf("[500] Ошибка БД: %s\\n", e.Error())
        // Проверяем вложенную ошибку
        if errors.Is(e.Cause, errors.New("connection timeout")) {
            fmt.Println("  -> Проблема с подключением к БД")
        }
    default:
        fmt.Printf("[500] Неизвестная ошибка: %v\\n", err)
    }
}

func main() {
    handleError(processRequest(1, ""))       // ValidationError
    handleError(processRequest(-1, "Alice")) // NotFoundError
    handleError(processRequest(9999, "Bob")) // DatabaseError
    handleError(processRequest(1, "Alice"))  // nil — OK
}`,
            explanation: 'Type switch по error — самый частый паттерн в Go. Каждый case получает типизированную переменную e с полями конкретного типа ошибки. Это лучше чем строковое сравнение ошибок и позволяет структурировать обработку.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `
                <p><strong>Когда использовать type assertion vs type switch:</strong></p>
                <ul>
                    <li><strong>Type assertion</strong> <code>v, ok := i.(T)</code> — когда проверяете <em>один конкретный тип</em></li>
                    <li><strong>Type switch</strong> — когда возможных типов <em>несколько</em>, читается намного чище</li>
                    <li>Если вы часто используете type assertion — возможно интерфейс слишком широкий. Попробуйте сузить его или использовать дженерики (Go 1.18+)</li>
                </ul>
            `
        },
        {
            type: 'editor',
            title: 'Практика: Type switch',
            instructions: 'Напишите функцию stringify(v any) string, конвертирующую любое значение в строку. int → число, float64 → с двумя знаками, string → в кавычках, bool → "да"/"нет", []string → через запятую, nil → "<nil>", остальное → "?".',
            starterCode: `package main

import (
    "fmt"
    "strings"
)

func stringify(v any) string {
    // Используйте type switch
    switch val := v.(type) {
    // TODO: добавьте case для каждого типа
    default:
        _ = val // удалите эту строку когда напишете код
        return "?"
    }
}

func main() {
    fmt.Println(stringify(42))                       // 42
    fmt.Println(stringify(3.14))                     // 3.14
    fmt.Println(stringify("hello"))                  // "hello"
    fmt.Println(stringify(true))                     // да
    fmt.Println(stringify(false))                    // нет
    fmt.Println(stringify([]string{"a", "b", "c"})) // a, b, c
    fmt.Println(stringify(nil))                      // <nil>
    fmt.Println(stringify(struct{}{}))               // ?
}`,
            hints: [
                'case int: return fmt.Sprintf("%d", val)',
                'case float64: return fmt.Sprintf("%.2f", val)',
                'case string: return fmt.Sprintf("%q", val)',
                'case bool: if val { return "да" } return "нет"',
                'case []string: return strings.Join(val, ", ")',
                'case nil: return "<nil>"'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что произойдёт при выполнении: var i any = "hello"; n := i.(int)',
                    options: [
                        'Panic: interface conversion: interface {} is string, not int',
                        'n будет равно 0 (нулевое значение int)',
                        'Ошибка компиляции',
                        'n будет равно длине строки "hello"'
                    ],
                    correct: 0,
                    explanation: 'i.(T) без comma-ok вызывает panic в runtime если конкретный тип не T. Это одна из самых частых причин паники в Go-программах.'
                },
                {
                    id: 'q2',
                    type: 'code-fill',
                    question: 'Безопасное утверждение типа — заполните пропуск: s, ___ := i.(string)',
                    template: 's, ___ := i.(string)',
                    correct: 'ok',
                    caseSensitive: false,
                    explanation: 'ok — это bool. true если тип совпал, false если нет. При ok=false s будет нулевым значением типа string (пустая строка).'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Что делает конструкция switch v := i.(type)?',
                    options: [
                        'Создаёт type switch — в каждой case ветке v имеет тип этой ветки',
                        'Сравнивает i с переменной type',
                        'Вызывает метод type() у интерфейса i',
                        'Проверяет, является ли i конкретным типом v'
                    ],
                    correct: 0,
                    explanation: 'type switch — специальная форма switch. Ключевое слово type в i.(type) — не переменная, а синтаксис. В каждой case v уже приведён к нужному типу автоматически.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Как проверить, реализует ли переменная-интерфейс другой интерфейс Flusher?',
                    options: [
                        'if f, ok := w.(Flusher); ok { f.Flush() }',
                        'if w implements Flusher { w.Flush() }',
                        'if reflect.TypeOf(w) == Flusher { }',
                        'if w.(type) == Flusher { }'
                    ],
                    correct: 0,
                    explanation: 'Type assertion работает не только с конкретными типами, но и с интерфейсами. w.(Flusher) проверяет, реализует ли конкретный тип за w интерфейс Flusher.'
                },
                {
                    id: 'q5',
                    type: 'multiple',
                    question: 'Когда type assertion i.(T) (без comma-ok) безопасно использовать? (все верные)',
                    options: [
                        'Внутри case ветки type switch для этого типа T',
                        'Когда вы только что сами создали значение этого типа',
                        'В любом продакшн-коде',
                        'Когда значение пришло из внешнего API'
                    ],
                    correct: [0, 1],
                    explanation: 'Безопасно использовать когда тип гарантирован: внутри type switch или когда вы сами создали значение. Внешние данные всегда проверяйте с comma-ok.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Какой паттерн используется для обработки разных типов ошибок в Go?',
                    options: [
                        'Type switch: switch e := err.(type) { case *MyError: ... }',
                        'Сравнение строк: err.Error() == "not found"',
                        'Наследование ошибок',
                        'errors.Type(err) == "MyError"'
                    ],
                    correct: 0,
                    explanation: 'Type switch по error — идиоматический способ обработки разных типов ошибок. Каждая ветка case получает типизированный e с полями конкретного типа ошибки.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Что вернёт: var i any = nil; s, ok := i.(string)?',
                    options: [
                        's = "" (пустая строка), ok = false',
                        'Panic — nil нельзя проверить',
                        's = "nil", ok = true',
                        'Ошибка компиляции'
                    ],
                    correct: 0,
                    explanation: 'nil хранится как нулевое значение интерфейса. Type assertion на nil возвращает нулевое значение типа и ok = false — без паники при использовании comma-ok.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Зачем в стандартной библиотеке Go используется паттерн проверки опциональных интерфейсов (capability checking)?',
                    options: [
                        'Для добавления необязательных возможностей без изменения основного интерфейса',
                        'Для обхода ограничений системы типов',
                        'Для увеличения производительности',
                        'Для совместимости с C-кодом'
                    ],
                    correct: 0,
                    explanation: 'Пример: http.ResponseWriter обязателен, http.Flusher опционален. Код проверяет: if f, ok := w.(http.Flusher); ok { f.Flush() }. Базовый интерфейс маленький, расширения добавляются через отдельные интерфейсы.'
                }
            ]
        }
    ]
};
