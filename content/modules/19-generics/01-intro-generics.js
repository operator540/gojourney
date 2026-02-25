export default {
    id: '19-01',
    title: 'Введение в Дженерики',
    description: 'Зачем нужны дженерики в Go, type parameters, ограничения any и comparable',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Проблема: дублирование кода без дженериков</h2>
                <p>Представьте: вам нужна функция <code>Min</code> для чисел. Сначала для <code>int</code>, потом для <code>float64</code>, потом для <code>int64</code>...</p>
                <p>До Go 1.18 решений было два, оба плохих:</p>
                <ul>
                    <li><strong>Копипаст</strong> — одна функция для каждого типа. 10 типов = 10 одинаковых функций</li>
                    <li><strong>interface{}</strong> — принимать всё, но терять типобезопасность и добавлять type assertion</li>
                </ul>
                <p>В Go 1.18 появились <strong>дженерики</strong> (generics) — элегантное решение этой проблемы.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'До и после дженериков',
            code: `package main

import "fmt"

// ❌ ДО: три одинаковые функции
func MinInt(a, b int) int {
    if a < b { return a }
    return b
}
func MinFloat(a, b float64) float64 {
    if a < b { return a }
    return b
}
func MinInt64(a, b int64) int64 {
    if a < b { return a }
    return b
}

// ✅ ПОСЛЕ: одна универсальная функция
func Min[T int | float64 | int64](a, b T) T {
    if a < b { return a }
    return b
}

func main() {
    fmt.Println(Min(3, 5))         // int: 3
    fmt.Println(Min(3.14, 2.71))   // float64: 2.71
    fmt.Println(Min(int64(100), int64(50))) // int64: 50
}`,
            explanation: 'Квадратные скобки [T int | float64 | int64] объявляют type parameter T. Компилятор сам определяет тип при вызове — это называется type inference.'
        },
        {
            type: 'theory',
            content: `
                <h2>Синтаксис дженериков</h2>
                <p>Type parameter объявляется в <strong>квадратных скобках</strong> после имени функции или типа:</p>
                <pre><code>func FuncName[TypeParam Constraint](args) ReturnType</code></pre>
                <ul>
                    <li><code>TypeParam</code> — имя параметра типа (обычно T, K, V, E)</li>
                    <li><code>Constraint</code> — ограничение: какие типы допустимы</li>
                    <li>Внутри функции T используется как обычный тип</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Базовые ограничения: any и comparable',
            code: `package main

import "fmt"

// any = interface{} — принимает любой тип
// Но нельзя использовать операторы <, >, + и т.д.
func PrintSlice[T any](s []T) {
    for i, v := range s {
        fmt.Printf("[%d]=%v ", i, v)
    }
    fmt.Println()
}

// comparable — тип можно сравнивать через == и !=
// Подходит для ключей map и поиска
func Contains[T comparable](slice []T, item T) bool {
    for _, v := range slice {
        if v == item {
            return true
        }
    }
    return false
}

func main() {
    PrintSlice([]int{1, 2, 3})
    PrintSlice([]string{"go", "is", "cool"})
    PrintSlice([]bool{true, false, true})

    fmt.Println(Contains([]int{1, 2, 3}, 2))        // true
    fmt.Println(Contains([]string{"a", "b"}, "c"))  // false
}`,
            explanation: 'any разрешает любой тип — используйте когда нужна максимальная гибкость. comparable ограничивает типами, которые можно сравнивать через == — нужно для поиска, map-ключей.'
        },
        {
            type: 'info-box',
            variant: 'note',
            content: `<p><strong>any vs interface{}:</strong> В Go 1.18+ <code>any</code> — это просто псевдоним для <code>interface{}</code>. Они взаимозаменяемы, но <code>any</code> короче и читабельнее.</p>`
        },
        {
            type: 'theory',
            content: `
                <h2>Type Inference — вывод типа</h2>
                <p>Go умеет <strong>автоматически выводить</strong> type parameter из аргументов функции. Вам не нужно писать тип явно в большинстве случаев:</p>
                <pre><code>// Явный тип (не нужен)
Min[int](3, 5)

// Вывод типа (рекомендуется)
Min(3, 5)     // компилятор видит int — подставляет T=int
</code></pre>
                <p>Явно указывать тип нужно только когда компилятор не может вывести его из аргументов.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Type inference в действии',
            code: `package main

import "fmt"

func Map[T, U any](slice []T, f func(T) U) []U {
    result := make([]U, len(slice))
    for i, v := range slice {
        result[i] = f(v)
    }
    return result
}

func Filter[T any](slice []T, predicate func(T) bool) []T {
    var result []T
    for _, v := range slice {
        if predicate(v) {
            result = append(result, v)
        }
    }
    return result
}

func main() {
    nums := []int{1, 2, 3, 4, 5}

    // T=int, U=string — компилятор выведет сам
    strs := Map(nums, func(n int) string {
        return fmt.Sprintf("num%d", n)
    })
    fmt.Println(strs) // [num1 num2 num3 num4 num5]

    // T=int — из типа nums
    evens := Filter(nums, func(n int) bool { return n%2 == 0 })
    fmt.Println(evens) // [2 4]

    // Цепочка: T=int → U=float64
    doubled := Map(nums, func(n int) float64 { return float64(n) * 2.5 })
    fmt.Println(doubled) // [2.5 5 7.5 10 12.5]
}`,
            explanation: 'Map и Filter — классические функциональные примитивы. Дженерики делают их типобезопасными в Go. T и U — два независимых параметра типа, компилятор выводит оба из аргументов.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Несколько type parameters:</strong> Можно объявить несколько параметров через запятую: <code>[T, U any]</code>, <code>[K comparable, V any]</code>. Это полезно для функций преобразования типов и map-операций.</p>`
        },
        {
            type: 'theory',
            content: `
                <h2>Ограничение через интерфейс</h2>
                <p>Constraint — это <strong>интерфейс</strong>. Можно использовать любой интерфейс как ограничение, в том числе стандартные из пакета <code>constraints</code>.</p>
                <p>Специальный синтаксис для числовых типов:</p>
                <pre><code>type Number interface {
    int | int8 | int16 | int32 | int64 |
    float32 | float64
}</code></pre>
                <p>Символ <code>|</code> означает "или" — тип может быть любым из перечисленных.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Пользовательские constraints',
            code: `package main

import "fmt"

// Определяем constraint для числовых типов
type Number interface {
    int | int8 | int16 | int32 | int64 |
        uint | uint8 | uint16 | uint32 | uint64 |
        float32 | float64
}

// Constraint для типов с методом String()
type Stringer interface {
    String() string
}

func Sum[T Number](nums []T) T {
    var total T
    for _, n := range nums {
        total += n
    }
    return total
}

func Average[T Number](nums []T) float64 {
    if len(nums) == 0 {
        return 0
    }
    return float64(Sum(nums)) / float64(len(nums))
}

func main() {
    ints := []int{1, 2, 3, 4, 5}
    floats := []float64{1.1, 2.2, 3.3}

    fmt.Println("Sum int:", Sum(ints))          // 15
    fmt.Println("Sum float:", Sum(floats))      // 6.6
    fmt.Printf("Avg int: %.2f\\n", Average(ints))   // 3.00
    fmt.Printf("Avg float: %.2f\\n", Average(floats)) // 2.20
}`,
            explanation: 'Определив constraint Number один раз, мы можем использовать Sum и Average для любых числовых типов. Это намного лучше, чем писать 10 одинаковых функций.'
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph TD
    A[Дженерик функция Min T] --> B{Компилятор}
    B --> C[Min int при вызове с int]
    B --> D[Min float64 при вызове с float64]
    B --> E[Min string при вызове с string]
    C --> F[Реальный код: if a < b return a]
    D --> F
    E --> F
    style A fill:#1e3a5f,color:#60a5fa
    style B fill:#374151,color:#f9fafb
    style F fill:#1a3a2e,color:#34d399`,
            caption: 'Компилятор генерирует специализированный код для каждого типа — это называется "мономорфизация". Результат: нет накладных расходов в рантайме по сравнению с ручными функциями.'
        },
        {
            type: 'editor',
            title: 'Практика: Обобщённый Stack',
            instructions: 'Реализуйте дженерик структуру Stack[T] с методами Push, Pop и IsEmpty. Stack должен работать с любым типом.',
            starterCode: `package main

import "fmt"

// TODO: объявите дженерик тип Stack[T any]
// с полем items []T

// Push добавляет элемент на вершину
// Pop возвращает и удаляет вершину (bool = false если пусто)
// IsEmpty проверяет пустоту

func main() {
    // Тест со строками
    var s Stack[string]
    s.Push("first")
    s.Push("second")
    s.Push("third")

    for !s.IsEmpty() {
        val, ok := s.Pop()
        if ok {
            fmt.Println(val)
        }
    }
    // Ожидаем: third, second, first

    // Тест с числами
    var ns Stack[int]
    ns.Push(1)
    ns.Push(2)
    v, _ := ns.Pop()
    fmt.Println("Popped:", v) // 2
}`,
            hints: [
                'type Stack[T any] struct { items []T }',
                'Push: s.items = append(s.items, item)',
                'Pop: вернуть последний элемент, срезать слайс на 1',
                'IsEmpty: return len(s.items) == 0'
            ]
        },
        {
            type: 'theory',
            content: `
                <h2>Что мы узнали</h2>
                <ul>
                    <li>🧪 <strong>Дженерики</strong> — способ писать код, который работает с любым типом, сохраняя типобезопасность</li>
                    <li>📐 <strong>Синтаксис</strong>: <code>func Name[T Constraint](...)</code> — квадратные скобки после имени</li>
                    <li>🔍 <strong>Type inference</strong> — компилятор сам выводит тип из аргументов</li>
                    <li>✅ <strong>any</strong> — любой тип, <strong>comparable</strong> — типы поддерживающие ==</li>
                    <li>🎯 <strong>Constraints</strong> — это интерфейсы с перечислением допустимых типов через |</li>
                </ul>
                <p>В следующем уроке углубимся в <strong>constraints</strong> — научимся создавать собственные ограничения и использовать пакет <code>golang.org/x/exp/constraints</code>.</p>
            `
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'В какой версии Go появились дженерики?',
                    options: ['Go 1.18', 'Go 1.16', 'Go 1.20', 'Go 2.0'],
                    correct: 0,
                    explanation: 'Дженерики были добавлены в Go 1.18, выпущенном в марте 2022 года. Это одно из самых значимых изменений в языке за всю историю.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Какой constraint нужен для использования == в дженерик функции?',
                    options: ['comparable', 'any', 'Ordered', 'Equal'],
                    correct: 0,
                    explanation: 'comparable — встроенный constraint для типов, которые можно сравнивать через == и !=. Подходит для ключей map, поиска, дедупликации.'
                },
                {
                    id: 'q3',
                    type: 'code-fill',
                    question: 'Заполните: объявление дженерик функции, принимающей любой тип:\nfunc Print___(s []T) { ... }',
                    template: 'func Print___(s []T) { ... }',
                    correct: '[T any]',
                    caseSensitive: false,
                    explanation: '[T any] — квадратные скобки с именем параметра и constraint. any = принимаем любой тип.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Нужно ли всегда явно указывать type parameter при вызове функции?',
                    options: [
                        'Нет, компилятор выводит тип из аргументов (type inference)',
                        'Да, всегда обязательно',
                        'Только для числовых типов',
                        'Только если функция возвращает T'
                    ],
                    correct: 0,
                    explanation: 'Type inference — компилятор выводит type parameter из типов аргументов. Min(3, 5) — компилятор видит int и подставляет T=int. Явное указание нужно только в редких случаях.'
                },
                {
                    id: 'q5',
                    type: 'multiple',
                    question: 'Какие из следующих constraints можно использовать в Go?',
                    options: [
                        'any',
                        'comparable',
                        'int | float64',
                        'Number (пользовательский интерфейс)',
                        'generic'
                    ],
                    correct: [0, 1, 2, 3],
                    explanation: 'any, comparable — встроенные. int | float64 — union type в constraint. Пользовательский интерфейс — тоже constraint. "generic" — не существует в Go.'
                }
            ]
        }
    ]
};
