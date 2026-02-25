export default {
    id: '19-02',
    title: 'Constraints и интерфейсы',
    description: 'Создание сложных constraints, ~T синтаксис, пакет constraints, interface-based constraints',
    estimatedTime: 25,
    xpReward: 22,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Constraint — это интерфейс</h2>
                <p>В Go дженерики строятся на интерфейсах. Constraint — это <strong>обычный интерфейс</strong>, который описывает допустимые типы для type parameter.</p>
                <p>До дженериков интерфейсы описывали <em>поведение</em> (набор методов). С дженериками интерфейсы также могут описывать <em>множество конкретных типов</em>.</p>
                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Вид интерфейса</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Синтаксис</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Где используется</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Методы</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>interface { Method() }</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Обычный полиморфизм и constraint</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Типы (union)</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>interface { int | float64 }</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Только как constraint</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Комбинированный</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>interface { int | float64; Less() bool }</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Только как constraint</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Union constraints: перечисление типов',
            code: `package main

import "fmt"

// Constraint через union типов
type Integer interface {
    int | int8 | int16 | int32 | int64
}

type Float interface {
    float32 | float64
}

// Объединение через embedding
type Ordered interface {
    Integer | Float | ~string
}

func Min[T Ordered](a, b T) T {
    if a < b {
        return a
    }
    return b
}

func Clamp[T Ordered](value, min, max T) T {
    if value < min {
        return min
    }
    if value > max {
        return max
    }
    return value
}

func main() {
    fmt.Println(Min(5, 3))           // 3
    fmt.Println(Min(3.14, 2.71))     // 2.71
    fmt.Println(Min("banana", "apple")) // apple

    // Clamp ограничивает значение в диапазоне [min, max]
    fmt.Println(Clamp(15, 0, 10))    // 10 (слишком большое)
    fmt.Println(Clamp(-5, 0, 10))    // 0  (слишком малое)
    fmt.Println(Clamp(7, 0, 10))     // 7  (в норме)
}`,
            explanation: 'Integer и Float — отдельные constraints. Ordered объединяет их через embedded interfaces. Теперь Min работает со всеми числами и строками.'
        },
        {
            type: 'theory',
            content: `
                <h2>Тильда (~): underlying type</h2>
                <p>Синтаксис <code>~T</code> означает "тип, у которого underlying type — T". Это важно для пользовательских типов:</p>
                <pre><code>type MyInt int    // underlying type — int

// Без ~: MyInt не удовлетворяет int
// С ~int: MyInt удовлетворяет ~int
</code></pre>
                <p>Используйте <code>~</code> почти всегда в constraints — иначе пользовательские типы не будут работать с вашими generic функциями.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Тильда и пользовательские типы',
            code: `package main

import "fmt"

// Пользовательские типы на базе примитивов
type Celsius float64
type Fahrenheit float64
type UserID int64

// Без ~ : UserID не подходит под int64
// С ~ : любой тип с underlying int64 подходит
type SignedInt interface {
    ~int | ~int8 | ~int16 | ~int32 | ~int64
}

func Abs[T SignedInt](n T) T {
    if n < 0 {
        return -n
    }
    return n
}

type Temperature interface {
    ~float32 | ~float64
}

func ToCelsius[T Temperature](f T) T {
    return (f - 32) * 5 / 9
}

func main() {
    // int
    fmt.Println(Abs(-42))                    // 42
    fmt.Println(Abs(UserID(-100)))           // 100 ← работает!

    // Celsius и Fahrenheit оба ~float64
    var f Fahrenheit = 212
    var c Celsius = Celsius(ToCelsius(f))
    fmt.Printf("%.1f°F = %.1f°C\\n", f, c)  // 212.0°F = 100.0°C
}`,
            explanation: '~int64 означает "int64 и любые типы, основанные на int64". Без тильды UserID не удовлетворял бы constraint int64. С тильдой — всё работает.'
        },
        {
            type: 'info-box',
            variant: 'important',
            content: `<p><strong>Правило большого пальца:</strong> если пишете constraint с числовыми типами — почти всегда используйте <code>~</code>. Иначе пользователи вашего пакета не смогут передавать свои типы-обёртки вроде <code>type UserID int64</code>.</p>`
        },
        {
            type: 'theory',
            content: `
                <h2>Constraints с методами</h2>
                <p>Constraint может требовать наличия методов — как обычный интерфейс. Это позволяет писать дженерики, вызывающие методы:</p>
                <pre><code>type Stringer interface {
    String() string
}

func PrintAll[T Stringer](items []T) {
    for _, item := range items {
        fmt.Println(item.String()) // T гарантированно имеет String()
    }
}</code></pre>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Constraint с методами + типами',
            code: `package main

import (
    "fmt"
    "strings"
)

// Constraint: тип должен иметь метод Validate()
type Validator interface {
    Validate() error
}

// Constraint: comparable + метод
type Equaler[T any] interface {
    comparable
    Equal(other T) bool
}

// Структуры с методами
type Email struct{ Value string }
type Age struct{ Value int }

func (e Email) Validate() error {
    if !strings.Contains(e.Value, "@") {
        return fmt.Errorf("неверный email: %s", e.Value)
    }
    return nil
}

func (a Age) Validate() error {
    if a.Value < 0 || a.Value > 150 {
        return fmt.Errorf("неверный возраст: %d", a.Value)
    }
    return nil
}

// Дженерик функция, требующая метод Validate()
func ValidateAll[T Validator](items []T) []error {
    var errs []error
    for _, item := range items {
        if err := item.Validate(); err != nil {
            errs = append(errs, err)
        }
    }
    return errs
}

func main() {
    emails := []Email{
        {"user@example.com"},
        {"invalid-email"},
        {"another@test.org"},
    }

    ages := []Age{{25}, {-5}, {200}, {30}}

    fmt.Println("Email ошибки:", ValidateAll(emails))
    fmt.Println("Age ошибки:", ValidateAll(ages))
}`,
            explanation: 'ValidateAll работает с Email и Age потому что оба реализуют Validate() error. Constraint гарантирует наличие метода во время компиляции.'
        },
        {
            type: 'theory',
            content: `
                <h2>Пакет golang.org/x/exp/constraints</h2>
                <p>Go community создали пакет с готовыми constraints. Наиболее используемые:</p>
                <ul>
                    <li><code>constraints.Ordered</code> — все типы поддерживающие <, >, <=, >= (числа + строки)</li>
                    <li><code>constraints.Integer</code> — все целочисленные типы</li>
                    <li><code>constraints.Float</code> — float32 и float64</li>
                    <li><code>constraints.Signed</code> — знаковые целые</li>
                    <li><code>constraints.Unsigned</code> — беззнаковые целые</li>
                    <li><code>constraints.Complex</code> — комплексные числа</li>
                </ul>
                <p>С Go 1.21 многие из них переехали в пакет <code>cmp</code> стандартной библиотеки.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Встроенный cmp.Ordered (Go 1.21+)',
            code: `package main

import (
    "cmp"
    "fmt"
    "slices"
)

// cmp.Ordered — любой упорядоченный тип
func Max[T cmp.Ordered](a, b T) T {
    if a > b {
        return a
    }
    return b
}

func MinSlice[T cmp.Ordered](s []T) T {
    if len(s) == 0 {
        panic("empty slice")
    }
    m := s[0]
    for _, v := range s[1:] {
        if v < m {
            m = v
        }
    }
    return m
}

func main() {
    fmt.Println(Max(10, 20))          // 20
    fmt.Println(Max("go", "rust"))    // rust (лексикографически)
    fmt.Println(Max(3.14, 2.71))      // 3.14

    nums := []int{5, 2, 8, 1, 9, 3}
    fmt.Println(MinSlice(nums))       // 1

    // В Go 1.21+ есть стандартный slices.Min/Max
    fmt.Println(slices.Min(nums))     // 1
    fmt.Println(slices.Max(nums))     // 9
}`,
            explanation: 'cmp.Ordered из стандартной библиотеки Go 1.21 — заменяет constraints.Ordered. Пакет slices тоже использует дженерики внутри.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Go 1.21+:</strong> В стандартной библиотеке появились пакеты <code>slices</code>, <code>maps</code> и <code>cmp</code>, все основанные на дженериках. <code>slices.Sort</code>, <code>slices.Contains</code>, <code>maps.Keys</code> — используйте вместо написания своих generic функций.</p>`
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph LR
    A[interface{}] --> B[any]
    C[comparable] --> D["== и !="]
    E["~int | ~float64"] --> F[числовые операции]
    G[interface + методы] --> H[вызов методов]
    I["cmp.Ordered"] --> J["< > <= >="]
    style A fill:#1e3a5f,color:#60a5fa
    style B fill:#1e3a5f,color:#60a5fa
    style C fill:#374151,color:#f9fafb
    style E fill:#2d1b69,color:#a78bfa
    style I fill:#1a3a2e,color:#34d399`,
            caption: 'Иерархия constraints в Go: от любого типа до специализированных'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что означает синтаксис ~int в constraint?',
                    options: [
                        'int и любые типы с underlying type = int',
                        'Только тип int, ничего больше',
                        'Все числовые типы',
                        'Отрицание: все типы кроме int'
                    ],
                    correct: 0,
                    explanation: '~int означает "тип int и все типы, у которых underlying type является int". Например, type MyID int удовлетворяет ~int но не int.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Где можно использовать interface с union типами (int | string)?',
                    options: [
                        'Только как constraint в дженериках',
                        'Везде где можно использовать interface{}',
                        'Только в объявлениях переменных',
                        'В любом месте как обычный интерфейс'
                    ],
                    correct: 0,
                    explanation: 'Union types (int | string) в интерфейсах — это "type sets" и они могут использоваться только как constraints в дженериках. Нельзя объявить переменную типа interface{ int | string }.'
                },
                {
                    id: 'q3',
                    type: 'multiple',
                    question: 'Какие утверждения про constraints верны?',
                    options: [
                        'Constraint — это интерфейс',
                        'Можно комбинировать методы и типы в одном constraint',
                        'cmp.Ordered включает числа и строки',
                        'any и interface{} — это разные вещи',
                        'comparable позволяет использовать < и >'
                    ],
                    correct: [0, 1, 2],
                    explanation: 'Constraint = интерфейс ✓. Комбинировать методы и типы можно ✓. cmp.Ordered = числа + строки ✓. any = псевдоним interface{} ✗. comparable только == и != ✗.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Зачем использовать ~ при объявлении type UserID int64 в constraints?',
                    options: [
                        'Чтобы UserID тоже удовлетворял constraint ~int64',
                        'Для совместимости с Go 1.17',
                        'Для ускорения компиляции',
                        '~ не нужен, int64 и так работает'
                    ],
                    correct: 0,
                    explanation: 'Без ~: UserID не удовлетворяет constraint int64 (это разные типы). С ~int64: UserID удовлетворяет, так как его underlying type = int64.'
                }
            ]
        }
    ]
};
