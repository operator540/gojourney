export default {
    id: '05-04',
    title: 'Пакет sync',
    description: 'Mutex, RWMutex, Once, Map, Pool — примитивы синхронизации',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Зачем нужен sync?</h2>
                <p>Каналы — основной инструмент конкурентности в Go. Но иногда нужен <strong>прямой доступ к разделяемой памяти</strong>. Пакет <code>sync</code> предоставляет мьютексы и другие примитивы синхронизации.</p>
                <p><strong>Правило:</strong> используйте каналы для передачи данных, мьютексы — для защиты состояния.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Data Race — гонка данных</h2>
                <p>Когда несколько горутин обращаются к одной переменной и хотя бы одна пишет — это <strong>data race</strong>. Результат непредсказуем.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Data race и Mutex',
            code: `package main

import (
    "fmt"
    "sync"
)

// ❌ Data race — без защиты
// func unsafeCounter() {
//     counter := 0
//     var wg sync.WaitGroup
//     for i := 0; i < 1000; i++ {
//         wg.Add(1)
//         go func() {
//             defer wg.Done()
//             counter++ // DATA RACE!
//         }()
//     }
//     wg.Wait()
//     fmt.Println(counter) // Результат непредсказуем!
// }

// ✅ Безопасно — с Mutex
func safeCounter() {
    counter := 0
    var mu sync.Mutex
    var wg sync.WaitGroup

    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            mu.Lock()
            counter++ // Защищено мьютексом
            mu.Unlock()
        }()
    }
    wg.Wait()
    fmt.Println(counter) // Всегда 1000
}

func main() {
    safeCounter()
}`,
            explanation: 'mu.Lock() блокирует доступ для других горутин. mu.Unlock() освобождает. Только одна горутина может быть внутри Lock/Unlock.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p>Используйте <code>go run -race main.go</code> для обнаружения data race. Флаг <code>-race</code> — один из лучших инструментов Go для отладки конкурентного кода.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>RWMutex — читатели/писатели</h2>
                <p><code>RWMutex</code> позволяет множественному чтению, но эксклюзивной записи. Быстрее Mutex когда чтений много, записей мало.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'sync.RWMutex',
            code: `package main

import (
    "fmt"
    "sync"
)

type SafeCache struct {
    mu   sync.RWMutex
    data map[string]string
}

func NewSafeCache() *SafeCache {
    return &SafeCache{data: make(map[string]string)}
}

func (c *SafeCache) Get(key string) (string, bool) {
    c.mu.RLock()         // Множественное чтение OK
    defer c.mu.RUnlock()
    val, ok := c.data[key]
    return val, ok
}

func (c *SafeCache) Set(key, value string) {
    c.mu.Lock()          // Эксклюзивная запись
    defer c.mu.Unlock()
    c.data[key] = value
}

func main() {
    cache := NewSafeCache()
    cache.Set("lang", "Go")

    val, _ := cache.Get("lang")
    fmt.Println(val) // Go
}`,
            explanation: 'RLock() — для чтения (несколько горутин одновременно). Lock() — для записи (эксклюзивно). Используйте когда соотношение чтение/запись высокое.'
        },
        {
            type: 'theory',
            content: `
                <h2>sync.Once — выполнить один раз</h2>
                <p><code>Once</code> гарантирует, что функция выполнится <strong>ровно один раз</strong>, даже при вызове из множества горутин. Идеально для ленивой инициализации.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'sync.Once',
            code: `package main

import (
    "fmt"
    "sync"
)

var (
    instance *Database
    once     sync.Once
)

type Database struct {
    DSN string
}

func GetDB() *Database {
    once.Do(func() {
        fmt.Println("Создание подключения к БД (один раз)")
        instance = &Database{DSN: "postgres://localhost/mydb"}
    })
    return instance
}

func main() {
    var wg sync.WaitGroup
    for i := 0; i < 5; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            db := GetDB()
            fmt.Println("Получил БД:", db.DSN)
        }()
    }
    wg.Wait()
    // "Создание подключения к БД" выведется ОДИН раз
}`,
            explanation: 'once.Do(fn) — fn выполнится ровно один раз. Все горутины получат один и тот же instance. Потокобезопасный Singleton.'
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph TD
    A["sync пакет"] --> B["Mutex<br>эксклюзивный доступ"]
    A --> C["RWMutex<br>множественное чтение"]
    A --> D["Once<br>один раз"]
    A --> E["WaitGroup<br>ожидание группы"]
    A --> F["Map<br>потокобезопасный map"]
    style A fill:#00add8,color:#fff
    style B fill:#ce3263,color:#fff
    style C fill:#d97706,color:#fff
    style D fill:#10b981,color:#fff`,
            caption: 'Основные примитивы пакета sync'
        },
        {
            type: 'editor',
            title: 'Практика: Потокобезопасный счётчик',
            instructions: 'Создайте структуру Counter с методами Increment(), Decrement() и Value() int. Используйте sync.Mutex для защиты. Запустите 100 горутин, каждая вызывает Increment() 10 раз. Убедитесь что итоговое значение = 1000.',
            starterCode: `package main

import (
    "fmt"
    "sync"
)

type Counter struct {
    mu    sync.Mutex
    value int
}

func (c *Counter) Increment() {
    // Защитите доступ мьютексом
}

func (c *Counter) Value() int {
    // Защитите чтение мьютексом
    return 0
}

func main() {
    c := &Counter{}
    var wg sync.WaitGroup

    for i := 0; i < 100; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for j := 0; j < 10; j++ {
                c.Increment()
            }
        }()
    }

    wg.Wait()
    fmt.Println("Итого:", c.Value()) // Ожидается: 1000
}`,
            hints: [
                'Increment: c.mu.Lock(); c.value++; c.mu.Unlock()',
                'Или: c.mu.Lock(); defer c.mu.Unlock(); c.value++',
                'Value: c.mu.Lock(); defer c.mu.Unlock(); return c.value',
                'Без мьютекса результат будет < 1000 из-за data race'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что такое data race?',
                    options: [
                        'Несколько горутин обращаются к одной переменной, минимум одна пишет',
                        'Горутина работает слишком быстро',
                        'Канал переполнен',
                        'Взаимная блокировка'
                    ],
                    correct: 0,
                    explanation: 'Data race — конкурентный доступ к общей памяти без синхронизации. Обнаруживается флагом -race.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Чем RWMutex отличается от Mutex?',
                    options: [
                        'Позволяет множественное чтение, эксклюзивную запись',
                        'Быстрее в любом случае',
                        'Работает только для map',
                        'Автоматически разблокируется'
                    ],
                    correct: 0,
                    explanation: 'RWMutex: RLock/RUnlock для чтения (параллельно), Lock/Unlock для записи (эксклюзивно).'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Сколько раз выполнится функция в sync.Once.Do()?',
                    options: [
                        'Ровно один раз',
                        'Один раз на горутину',
                        'Зависит от GOMAXPROCS',
                        'Минимум один раз'
                    ],
                    correct: 0,
                    explanation: 'sync.Once гарантирует ровно одно выполнение, независимо от количества горутин.'
                },
                {
                    id: 'q4',
                    type: 'code-fill',
                    question: 'Как запустить программу с детектором гонок?',
                    template: 'go run ___ main.go',
                    correct: '-race',
                    caseSensitive: true,
                    explanation: 'Флаг -race включает детектор data race — один из лучших инструментов Go.'
                }
            ]
        }
    ]
};
