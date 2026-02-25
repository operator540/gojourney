export default {
    id: '19-03',
    title: 'Дженерик типы и структуры',
    description: 'Generic structs, методы на generic типах, Pair, Result, Optional паттерны',
    estimatedTime: 25,
    xpReward: 22,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Дженерик структуры</h2>
                <p>Не только функции, но и <strong>типы</strong> (структуры, интерфейсы) могут быть дженериками. Синтаксис тот же — квадратные скобки после имени типа:</p>
                <pre><code>type Container[T any] struct {
    Value T
}
</code></pre>
                <p>Дженерик структуры решают задачу "одна структура — разные типы данных". Это как шаблонные классы в C++ или generics в Java, но без оверинжиниринга.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Generic Pair — пара значений разных типов',
            code: `package main

import "fmt"

// Пара значений, возможно разных типов
type Pair[K, V any] struct {
    Key   K
    Value V
}

func NewPair[K, V any](key K, value V) Pair[K, V] {
    return Pair[K, V]{Key: key, Value: value}
}

func (p Pair[K, V]) String() string {
    return fmt.Sprintf("(%v: %v)", p.Key, p.Value)
}

// Swap меняет ключ и значение местами
func (p Pair[K, V]) Swap() Pair[V, K] {
    return Pair[V, K]{Key: p.Value, Value: p.Key}
}

func main() {
    p1 := NewPair("name", "Alice")
    p2 := NewPair(42, true)
    p3 := NewPair("score", 9.5)

    fmt.Println(p1)        // (name: Alice)
    fmt.Println(p2)        // (42: true)
    fmt.Println(p3)        // (score: 9.5)

    swapped := p1.Swap()
    fmt.Println(swapped)   // (Alice: name)

    // Слайс пар — как карта, но с порядком
    entries := []Pair[string, int]{
        NewPair("alice", 95),
        NewPair("bob", 87),
        NewPair("carol", 91),
    }
    for _, e := range entries {
        fmt.Printf("%s: %d\\n", e.Key, e.Value)
    }
}`,
            explanation: 'Pair[K, V] принимает два независимых type parameter. Метод Swap() возвращает Pair[V, K] — инвертированный тип. Это работает только с дженериками.'
        },
        {
            type: 'theory',
            content: `
                <h2>Result[T] — типобезопасная обработка ошибок</h2>
                <p>Популярный паттерн из функциональных языков — <code>Result</code> тип, который содержит либо значение, либо ошибку. В Go мы можем реализовать его через дженерики:</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Generic Result[T] тип',
            code: `package main

import (
    "errors"
    "fmt"
    "strconv"
)

type Result[T any] struct {
    value T
    err   error
}

func Ok[T any](value T) Result[T] {
    return Result[T]{value: value}
}

func Err[T any](err error) Result[T] {
    return Result[T]{err: err}
}

func (r Result[T]) IsOk() bool  { return r.err == nil }
func (r Result[T]) IsErr() bool { return r.err != nil }

func (r Result[T]) Unwrap() T {
    if r.err != nil {
        panic(fmt.Sprintf("unwrap on error: %v", r.err))
    }
    return r.value
}

func (r Result[T]) UnwrapOr(defaultVal T) T {
    if r.err != nil {
        return defaultVal
    }
    return r.value
}

func ParseInt(s string) Result[int] {
    n, err := strconv.Atoi(s)
    if err != nil {
        return Err[int](fmt.Errorf("ParseInt: %w", err))
    }
    return Ok(n)
}

func ParseFloat(s string) Result[float64] {
    f, err := strconv.ParseFloat(s, 64)
    if err != nil {
        return Err[float64](errors.New("not a float: " + s))
    }
    return Ok(f)
}

func main() {
    r1 := ParseInt("42")
    r2 := ParseInt("abc")

    fmt.Println(r1.IsOk(), r1.Unwrap())         // true 42
    fmt.Println(r2.IsErr())                      // true
    fmt.Println(r2.UnwrapOr(0))                  // 0 (default)

    f := ParseFloat("3.14").UnwrapOr(0)
    fmt.Printf("float: %.2f\\n", f)              // 3.14
}`,
            explanation: 'Result[T] инкапсулирует success/failure. Unwrap() паникует при ошибке (для случаев "мы уверены что ок"), UnwrapOr() безопасен и возвращает default. Это читабельнее, чем постоянные if err != nil.'
        },
        {
            type: 'theory',
            content: `
                <h2>Optional[T] — nil без указателей</h2>
                <p>Иногда значение может быть "пустым" — не null, не ноль, а именно <em>отсутствующим</em>. В Go обычно используют указатели (*T), но дженерики дают более явный способ:</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Generic Optional[T]',
            code: `package main

import "fmt"

type Optional[T any] struct {
    value   T
    present bool
}

func Some[T any](v T) Optional[T] {
    return Optional[T]{value: v, present: true}
}

func None[T any]() Optional[T] {
    return Optional[T]{}
}

func (o Optional[T]) IsPresent() bool { return o.present }
func (o Optional[T]) IsEmpty() bool   { return !o.present }

func (o Optional[T]) Get() (T, bool) {
    return o.value, o.present
}

func (o Optional[T]) OrElse(defaultVal T) T {
    if o.present {
        return o.value
    }
    return defaultVal
}

// IfPresent выполняет функцию только если значение есть
func (o Optional[T]) IfPresent(f func(T)) {
    if o.present {
        f(o.value)
    }
}

type User struct {
    Name  string
    Email string
}

func FindUser(id int) Optional[User] {
    users := map[int]User{
        1: {Name: "Alice", Email: "alice@example.com"},
        2: {Name: "Bob", Email: "bob@example.com"},
    }
    u, ok := users[id]
    if !ok {
        return None[User]()
    }
    return Some(u)
}

func main() {
    u1 := FindUser(1)
    u2 := FindUser(99)

    u1.IfPresent(func(u User) {
        fmt.Println("Найден:", u.Name)
    })

    u2.IfPresent(func(u User) {
        fmt.Println("Этого не будет")
    })

    name := FindUser(2).OrElse(User{Name: "Unknown"})
    fmt.Println(name.Name) // Bob

    if v, ok := u2.Get(); !ok {
        fmt.Println("Пользователь не найден, got:", v)
    }
}`,
            explanation: 'Optional[T] явно выражает что значение может отсутствовать. Это лучше чем *T потому что: нет разыменования, нет nil pointer panic, логика обработки отсутствия встроена в тип.'
        },
        {
            type: 'theory',
            content: `
                <h2>Generic Map / Cache</h2>
                <p>Один из самых полезных generic типов — типобезопасный map с дополнительной логикой (TTL, thread-safe и т.д.):</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Типобезопасный Cache[K, V]',
            code: `package main

import (
    "fmt"
    "sync"
)

// Потокобезопасный кэш
type Cache[K comparable, V any] struct {
    mu    sync.RWMutex
    items map[K]V
}

func NewCache[K comparable, V any]() *Cache[K, V] {
    return &Cache[K, V]{items: make(map[K]V)}
}

func (c *Cache[K, V]) Set(key K, value V) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.items[key] = value
}

func (c *Cache[K, V]) Get(key K) (V, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    v, ok := c.items[key]
    return v, ok
}

func (c *Cache[K, V]) GetOrSet(key K, defaultFn func() V) V {
    if v, ok := c.Get(key); ok {
        return v
    }
    v := defaultFn()
    c.Set(key, v)
    return v
}

func (c *Cache[K, V]) Keys() []K {
    c.mu.RLock()
    defer c.mu.RUnlock()
    keys := make([]K, 0, len(c.items))
    for k := range c.items {
        keys = append(keys, k)
    }
    return keys
}

func main() {
    // Кэш пользователей
    userCache := NewCache[int, string]()
    userCache.Set(1, "Alice")
    userCache.Set(2, "Bob")

    name, ok := userCache.Get(1)
    fmt.Println(name, ok) // Alice true

    // GetOrSet — загружаем если нет в кэше
    user := userCache.GetOrSet(3, func() string {
        fmt.Println("загружаем из БД...")
        return "Carol"
    })
    fmt.Println(user) // загружаем из БД... Carol

    // Повторный вызов — из кэша
    user2 := userCache.GetOrSet(3, func() string { return "never called" })
    fmt.Println(user2) // Carol (без "загружаем из БД...")
}`,
            explanation: 'Cache[K, V] типобезопасен: нельзя перепутать ключи и значения. GetOrSet — паттерн "ленивой инициализации". sync.RWMutex позволяет параллельное чтение.'
        },
        {
            type: 'info-box',
            variant: 'note',
            content: `<p><strong>Методы на generic типах:</strong> При объявлении метода нужно повторять type parameters: <code>func (c *Cache[K, V]) Get(key K)</code>. Нельзя добавлять новые type parameters в методах — только использовать те, что объявлены в типе.</p>`
        },
        {
            type: 'editor',
            title: 'Практика: Generic Queue',
            instructions: 'Реализуйте потокобезопасную очередь Queue[T] с методами Enqueue, Dequeue и Len.',
            starterCode: `package main

import (
    "fmt"
    "sync"
)

// TODO: реализуйте Queue[T any]
// Поля: mu sync.Mutex, items []T

// Enqueue добавляет в конец очереди
// Dequeue возвращает первый элемент (T, bool)
// Len возвращает длину очереди

func main() {
    q := Queue[string]{}

    q.Enqueue("first")
    q.Enqueue("second")
    q.Enqueue("third")

    fmt.Println("Len:", q.Len()) // 3

    for q.Len() > 0 {
        val, ok := q.Dequeue()
        if ok {
            fmt.Println(val)
        }
    }
    // Ожидаем: first, second, third (FIFO)

    _, ok := q.Dequeue()
    fmt.Println("empty dequeue ok:", ok) // false
}`,
            hints: [
                'type Queue[T any] struct { mu sync.Mutex; items []T }',
                'Enqueue: q.items = append(q.items, item)',
                'Dequeue: взять q.items[0], потом q.items = q.items[1:]',
                'Не забудьте проверить len(q.items) == 0 в Dequeue'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Как объявить generic структуру Wrapper с одним type parameter?',
                    options: [
                        'type Wrapper[T any] struct { Value T }',
                        'type Wrapper struct[T any] { Value T }',
                        'type Wrapper struct { Value T[any] }',
                        'generic type Wrapper[T] struct { Value T }'
                    ],
                    correct: 0,
                    explanation: 'Type parameter объявляется в квадратных скобках ПОСЛЕ имени типа: type Wrapper[T any] struct { ... }.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Можно ли в методе на generic типе добавить новый type parameter?',
                    options: [
                        'Нет, методы могут только использовать type parameters из типа',
                        'Да, можно добавить любые новые параметры',
                        'Да, но только comparable',
                        'Да, если использовать ключевое слово extend'
                    ],
                    correct: 0,
                    explanation: 'Методы generic типа не могут объявлять новые type parameters — только использовать те, что объявлены в самом типе. Для новых type parameters нужны функции, не методы.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Почему K в Cache[K comparable, V any] требует comparable?',
                    options: [
                        'Ключи map в Go должны быть comparable',
                        'Чтобы можно было сортировать ключи',
                        'Для лучшей производительности',
                        'comparable нужен для любых полей структуры'
                    ],
                    correct: 0,
                    explanation: 'В Go ключи map должны удовлетворять comparable — то есть поддерживать ==. Если K не comparable, нельзя использовать K как ключ map[K]V.'
                }
            ]
        }
    ]
};
