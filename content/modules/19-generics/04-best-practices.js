export default {
    id: '19-04',
    title: 'Когда использовать дженерики',
    description: 'Когда дженерики уместны, а когда избыточны. Практические паттерны и антипаттерны.',
    estimatedTime: 20,
    xpReward: 18,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Главный вопрос: нужны ли дженерики здесь?</h2>
                <p>Дженерики — мощный инструмент, но <strong>не серебряная пуля</strong>. Роб Пайк и команда Go рекомендуют:</p>
                <blockquote style="border-left:4px solid var(--accent);padding:12px 16px;margin:16px 0;background:var(--surface-2);border-radius:0 8px 8px 0;font-style:italic">
                    "Write code, don't design types. When in doubt, use a concrete type."
                </blockquote>
                <p>Дженерики добавляют сложность. Всегда спрашивайте себя: <em>упрощает ли это код, или усложняет?</em></p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>✅ Когда дженерики уместны</h2>
                <ul>
                    <li><strong>Функции для работы со слайсами/maps</strong> — Map, Filter, Reduce, Contains, Keys, Values</li>
                    <li><strong>Контейнеры данных</strong> — Stack, Queue, Set, Cache — одна реализация для любого типа</li>
                    <li><strong>Алгоритмы</strong> — Sort, Min, Max, Search — одна функция для всех Ordered типов</li>
                    <li><strong>Result/Optional паттерны</strong> — типобезопасная обработка может-быть-значений</li>
                    <li><strong>Дублирование кода</strong> — если вы написали 3+ одинаковые функции меняя только тип</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Хорошее применение: утилиты для slices',
            code: `package main

import "fmt"

// Полезные generic утилиты (многие теперь в stdlib slices пакете)

func Keys[K comparable, V any](m map[K]V) []K {
    keys := make([]K, 0, len(m))
    for k := range m {
        keys = append(keys, k)
    }
    return keys
}

func Values[K comparable, V any](m map[K]V) []V {
    vals := make([]V, 0, len(m))
    for _, v := range m {
        vals = append(vals, v)
    }
    return vals
}

func Chunk[T any](slice []T, size int) [][]T {
    var chunks [][]T
    for i := 0; i < len(slice); i += size {
        end := i + size
        if end > len(slice) {
            end = len(slice)
        }
        chunks = append(chunks, slice[i:end])
    }
    return chunks
}

func Unique[T comparable](slice []T) []T {
    seen := make(map[T]bool)
    result := make([]T, 0, len(slice))
    for _, v := range slice {
        if !seen[v] {
            seen[v] = true
            result = append(result, v)
        }
    }
    return result
}

func main() {
    users := map[string]int{"alice": 25, "bob": 30, "carol": 22}

    fmt.Println(Keys(users))    // [alice bob carol] (порядок случайный)
    fmt.Println(Values(users))  // [25 30 22]

    nums := []int{1, 2, 3, 4, 5, 6, 7}
    fmt.Println(Chunk(nums, 3)) // [[1 2 3] [4 5 6] [7]]

    dups := []string{"a", "b", "a", "c", "b", "d"}
    fmt.Println(Unique(dups))   // [a b c d]
}`,
            explanation: 'Keys, Values, Chunk, Unique — отличные кандидаты для дженериков: логика одинакова для любого типа, без дженериков нужно дублировать код.'
        },
        {
            type: 'theory',
            content: `
                <h2>❌ Когда дженерики избыточны</h2>
                <ul>
                    <li><strong>Один тип</strong> — если функция нужна только для int, не делайте её generic</li>
                    <li><strong>Интерфейс достаточен</strong> — если нужно только вызвать методы, используйте обычный interface</li>
                    <li><strong>Reflection не нужен</strong> — не заменяйте reflect на дженерики, если reflection подходит лучше</li>
                    <li><strong>Бизнес-логика</strong> — функция обработки заказов не должна быть generic</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Антипаттерны: когда НЕ нужны дженерики',
            code: `package main

import "fmt"

// ❌ ПЛОХО: дженерик для одного типа
func AddInts[T ~int](a, b T) T {
    return a + b
}

// ✅ ХОРОШО: просто функция
func AddInt(a, b int) int {
    return a + b
}

// ❌ ПЛОХО: дженерик вместо интерфейса
type Logger[T any] interface {
    Log(T)
}

// ✅ ХОРОШО: обычный интерфейс
type Logger2 interface {
    Log(string)
}

// ❌ ПЛОХО: over-engineered generic
func Process[T any, R any, E error](
    items []T,
    transform func(T) R,
    validate func(R) E,
) ([]R, []E) {
    // ... 50 строк кода
    return nil, nil
}

// ✅ ХОРОШО: конкретные типы, простая функция
func ProcessOrders(orders []Order) ([]Receipt, []error) {
    // ... понятный бизнес-код
    return nil, nil
}

type Order struct{ ID int }
type Receipt struct{ OrderID int }

func main() {
    fmt.Println(AddInt(2, 3)) // 5
}`,
            explanation: 'Правило: если вы используете generic функцию только с одним конкретным типом — она не нужна. Если нужно только вызвать методы — используйте interface. Generic = дублирование устранено.'
        },
        {
            type: 'info-box',
            variant: 'important',
            content: `<p><strong>Золотое правило:</strong> Дженерики хороши для <em>алгоритмов и структур данных</em>. Плохи для <em>бизнес-логики</em>. Если вы не можете объяснить зачем нужен дженерик — скорее всего, он не нужен.</p>`
        },
        {
            type: 'theory',
            content: `
                <h2>Практический паттерн: Generic Set</h2>
                <p>Встроенного Set в Go нет. Обычно используют <code>map[T]struct{}</code>. С дженериками можно сделать удобный типобезопасный Set:</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Generic Set[T]',
            code: `package main

import "fmt"

type Set[T comparable] struct {
    items map[T]struct{}
}

func NewSet[T comparable](items ...T) Set[T] {
    s := Set[T]{items: make(map[T]struct{})}
    for _, item := range items {
        s.Add(item)
    }
    return s
}

func (s *Set[T]) Add(item T) {
    s.items[item] = struct{}{}
}

func (s *Set[T]) Remove(item T) {
    delete(s.items, item)
}

func (s *Set[T]) Contains(item T) bool {
    _, ok := s.items[item]
    return ok
}

func (s *Set[T]) Size() int { return len(s.items) }

func (s *Set[T]) Intersection(other Set[T]) Set[T] {
    result := NewSet[T]()
    for item := range s.items {
        if other.Contains(item) {
            result.Add(item)
        }
    }
    return result
}

func (s *Set[T]) Union(other Set[T]) Set[T] {
    result := NewSet[T]()
    for item := range s.items {
        result.Add(item)
    }
    for item := range other.items {
        result.Add(item)
    }
    return result
}

func main() {
    a := NewSet(1, 2, 3, 4, 5)
    b := NewSet(3, 4, 5, 6, 7)

    fmt.Println("A contains 3:", a.Contains(3))  // true
    fmt.Println("A contains 9:", a.Contains(9))  // false

    inter := a.Intersection(b)
    fmt.Printf("A ∩ B size: %d\\n", inter.Size()) // 3 (3,4,5)

    union := a.Union(b)
    fmt.Printf("A ∪ B size: %d\\n", union.Size()) // 7

    // Работает со строками тоже
    tags := NewSet("go", "rust", "python")
    tags.Add("go") // дубликат игнорируется
    fmt.Println("tags size:", tags.Size()) // 3
}`,
            explanation: 'Set[T comparable] — типичный пример "структура данных, одна реализация для всех типов". comparable нужен потому что Set использует map внутри.'
        },
        {
            type: 'theory',
            content: `
                <h2>Дженерики и производительность</h2>
                <p>Важно понимать как Go компилирует дженерики:</p>
                <ul>
                    <li><strong>Мономорфизация (GCShape stenciling)</strong> — для каждого уникального "типа по форме" создаётся отдельная реализация</li>
                    <li>Примитивные типы (int, float64, etc.) получают <em>свои</em> специализации</li>
                    <li>Указательные и interface типы <em>разделяют</em> реализацию</li>
                    <li>В большинстве случаев дженерики работают <strong>так же быстро</strong> как конкретные функции</li>
                </ul>
                <p>Только в редких случаях с interface constraints возможно небольшое замедление из-за косвенных вызовов.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Дженерики в стандартной библиотеке Go 1.21+',
            code: `package main

import (
    "cmp"
    "fmt"
    "maps"
    "slices"
)

func main() {
    nums := []int{5, 2, 8, 1, 9, 3, 7, 4, 6}

    // slices пакет — дженерики в stdlib
    slices.Sort(nums)
    fmt.Println("Sorted:", nums)

    idx, found := slices.BinarySearch(nums, 7)
    fmt.Printf("Found 7 at index %d: %v\\n", idx, found)

    fmt.Println("Max:", slices.Max(nums))
    fmt.Println("Min:", slices.Min(nums))

    contains := slices.Contains(nums, 5)
    fmt.Println("Contains 5:", contains)

    // maps пакет
    m := map[string]int{"a": 1, "b": 2, "c": 3}
    keys := slices.Sorted(maps.Keys(m))
    fmt.Println("Sorted keys:", keys)

    // cmp пакет
    fmt.Println(cmp.Compare(1, 2))  // -1
    fmt.Println(cmp.Compare(2, 2))  //  0
    fmt.Println(cmp.Compare(3, 2))  //  1
}`,
            explanation: 'Go 1.21 принёс пакеты slices, maps, cmp — все используют дженерики. slices.Sort работает для любого cmp.Ordered типа. Это именно то применение дженериков, для которого они предназначены.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Практический совет:</strong> Перед написанием generic функции проверьте — нет ли её уже в <code>slices</code>, <code>maps</code> или <code>cmp</code> пакетах Go 1.21+. Команда Go уже написала качественные реализации многих утилит.</p>`
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'multiple',
                    question: 'В каких случаях дженерики УМЕСТНЫ?',
                    options: [
                        'Функция Map/Filter для слайсов',
                        'Generic Stack/Queue контейнер',
                        'Функция обработки бизнес-заказов',
                        'Утилита Unique (удалить дубликаты из слайса)',
                        'Парсер конкретного JSON формата'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'Дженерики уместны для алгоритмов и контейнеров данных, где логика одинакова для любого типа. Бизнес-логика и парсеры конкретных форматов — нет.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что предпочесть: generic функцию или interface?',
                    options: [
                        'Interface — если нужно вызвать методы. Generic — если нужны операции над самим типом (==, <, +)',
                        'Всегда generic — они быстрее',
                        'Всегда interface — они понятнее',
                        'Generic и interface всегда взаимозаменяемы'
                    ],
                    correct: 0,
                    explanation: 'Interface хорош для полиморфизма через методы. Generic нужен когда нужны операции над типом (сравнение, арифметика) или когда хотим сохранить конкретный тип в возвращаемом значении.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Какой пакет Go 1.21+ содержит generic Sort, Contains, Max для слайсов?',
                    options: ['slices', 'sort', 'generic', 'cmp'],
                    correct: 0,
                    explanation: 'Пакет slices (Go 1.21) содержит Sort, Contains, Max, Min, BinarySearch и другие generic функции для работы со слайсами.'
                }
            ]
        }
    ]
};
