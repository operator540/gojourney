export default {
    id: '17-03',
    title: 'Работа с Redis в Go',
    description: 'go-redis клиент, подключение, CRUD операции, pipeline, pub/sub основы',
    estimatedTime: 25,
    xpReward: 22,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>go-redis — стандартный клиент</h2>
                <p>Самый популярный Redis-клиент для Go — <code>github.com/redis/go-redis/v9</code>. Версия v9 поддерживает:</p>
                <ul>
                    <li>Все типы данных Redis</li>
                    <li>Pipeline и транзакции (MULTI/EXEC)</li>
                    <li>Pub/Sub</li>
                    <li>Sentinel и Cluster режимы</li>
                    <li>Автоматический retry и reconnect</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Подключение и базовые операции',
            code: `package main

import (
    "context"
    "fmt"
    "log"
    "time"

    "github.com/redis/go-redis/v9"
)

func main() {
    // Создаём клиент
    rdb := redis.NewClient(&redis.Options{
        Addr:         "localhost:6379",
        Password:     "",  // "" если без пароля
        DB:           0,   // 0-15, по умолчанию 0
        DialTimeout:  5 * time.Second,
        ReadTimeout:  3 * time.Second,
        WriteTimeout: 3 * time.Second,
        PoolSize:     10, // размер connection pool
    })
    defer rdb.Close()

    ctx := context.Background()

    // Проверяем подключение
    pong, err := rdb.Ping(ctx).Result()
    if err != nil {
        log.Fatal("Redis недоступен:", err)
    }
    fmt.Println(pong) // PONG

    // SET с TTL
    err = rdb.Set(ctx, "greeting", "Hello, Redis!", 10*time.Minute).Err()
    if err != nil {
        log.Fatal(err)
    }

    // GET
    val, err := rdb.Get(ctx, "greeting").Result()
    if err == redis.Nil {
        fmt.Println("Ключ не найден")
    } else if err != nil {
        log.Fatal(err)
    } else {
        fmt.Println("Значение:", val)
    }

    // Проверяем TTL
    ttl, _ := rdb.TTL(ctx, "greeting").Result()
    fmt.Printf("TTL: %.0f секунд\\n", ttl.Seconds())

    // EXISTS
    exists, _ := rdb.Exists(ctx, "greeting").Result()
    fmt.Println("Существует:", exists == 1)

    // DEL
    rdb.Del(ctx, "greeting")
}`,
            explanation: 'redis.Nil — специальная ошибка когда ключ не найден. PoolSize — клиент держит pool соединений, не нужно создавать новое для каждого запроса.'
        },
        {
            type: 'theory',
            content: `
                <h2>Работа с объектами через JSON</h2>
                <p>Redis хранит строки, но мы часто хотим кэшировать Go-структуры. Стандартный паттерн — сериализация в JSON:</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Кэширование Go-структур',
            code: `package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "time"

    "github.com/redis/go-redis/v9"
)

type User struct {
    ID    int    \`json:"id"\`
    Name  string \`json:"name"\`
    Email string \`json:"email"\`
    Age   int    \`json:"age"\`
}

type UserCache struct {
    rdb *redis.Client
    ttl time.Duration
}

func NewUserCache(rdb *redis.Client, ttl time.Duration) *UserCache {
    return &UserCache{rdb: rdb, ttl: ttl}
}

func (c *UserCache) Set(ctx context.Context, user User) error {
    data, err := json.Marshal(user)
    if err != nil {
        return fmt.Errorf("marshal user: %w", err)
    }
    key := fmt.Sprintf("user:%d", user.ID)
    return c.rdb.Set(ctx, key, data, c.ttl).Err()
}

func (c *UserCache) Get(ctx context.Context, id int) (*User, error) {
    key := fmt.Sprintf("user:%d", id)
    data, err := c.rdb.Get(ctx, key).Bytes()
    if err == redis.Nil {
        return nil, nil // cache miss
    }
    if err != nil {
        return nil, fmt.Errorf("get from cache: %w", err)
    }
    var user User
    if err := json.Unmarshal(data, &user); err != nil {
        return nil, fmt.Errorf("unmarshal user: %w", err)
    }
    return &user, nil
}

func main() {
    rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
    ctx := context.Background()
    cache := NewUserCache(rdb, 5*time.Minute)

    user := User{ID: 42, Name: "Alice", Email: "alice@example.com", Age: 28}

    // Записываем в кэш
    if err := cache.Set(ctx, user); err != nil {
        log.Fatal(err)
    }

    // Читаем из кэша
    cached, err := cache.Get(ctx, 42)
    if err != nil {
        log.Fatal(err)
    }
    if cached == nil {
        fmt.Println("Cache miss — загружаем из БД")
    } else {
        fmt.Printf("Cache hit: %+v\\n", *cached)
    }
}`,
            explanation: 'Паттерн: структура UserCache инкапсулирует логику кэша. nil, nil — cache miss (ключа нет). Ошибка — проблема с Redis. Данные — cache hit.'
        },
        {
            type: 'theory',
            content: `
                <h2>Pipeline — пакетные команды</h2>
                <p>По умолчанию каждая команда = один round-trip до Redis сервера. При 1000 командах = 1000 round-trips. <strong>Pipeline</strong> объединяет несколько команд в один запрос:</p>
                <ul>
                    <li>Без pipeline: 1000 × 1мс = 1 секунда</li>
                    <li>С pipeline: 1 round-trip ≈ 1мс для всех 1000 команд</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Pipeline: батч операции',
            code: `package main

import (
    "context"
    "fmt"
    "log"
    "time"

    "github.com/redis/go-redis/v9"
)

func main() {
    rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
    ctx := context.Background()

    // Без pipeline: 1000 отдельных запросов (медленно)
    // for i := 0; i < 1000; i++ {
    //     rdb.Set(ctx, fmt.Sprintf("key:%d", i), i, time.Hour)
    // }

    // С pipeline: один пакетный запрос
    start := time.Now()

    pipe := rdb.Pipeline()

    // Накапливаем команды (не выполняются сразу)
    cmds := make([]*redis.StatusCmd, 100)
    for i := 0; i < 100; i++ {
        key := fmt.Sprintf("item:%d", i)
        cmds[i] = pipe.Set(ctx, key, fmt.Sprintf("value-%d", i), time.Hour)
    }

    // Выполняем все команды одним round-trip
    _, err := pipe.Exec(ctx)
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("100 SET за %v\\n", time.Since(start))

    // Проверяем результаты отдельных команд
    for i, cmd := range cmds[:3] {
        fmt.Printf("cmd[%d]: %v\\n", i, cmd.Err())
    }

    // TxPipeline — pipeline + MULTI/EXEC (транзакция)
    _, err = rdb.TxPipelined(ctx, func(pipe redis.Pipeliner) error {
        pipe.Set(ctx, "balance:user1", "1000", 0)
        pipe.Set(ctx, "balance:user2", "500", 0)
        pipe.IncrBy(ctx, "balance:user1", -100)
        pipe.IncrBy(ctx, "balance:user2", 100)
        return nil
    })
    fmt.Println("Transfer:", err) // nil если успешно
}`,
            explanation: 'pipe.Set не выполняется сразу — накапливается. pipe.Exec() отправляет всё одним пакетом. TxPipelined = MULTI/EXEC в Redis — все команды или выполнятся все, или ни одна.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Паттерн Cache-Aside с Redis',
            code: `package main

import (
    "context"
    "database/sql"
    "encoding/json"
    "fmt"
    "time"

    "github.com/redis/go-redis/v9"
)

type Product struct {
    ID    int     \`json:"id"\`
    Name  string  \`json:"name"\`
    Price float64 \`json:"price"\`
}

type ProductService struct {
    db  *sql.DB
    rdb *redis.Client
}

// GetProduct — паттерн Cache-Aside:
// 1. Проверить кэш
// 2. Если нет — взять из БД
// 3. Записать в кэш
// 4. Вернуть результат
func (s *ProductService) GetProduct(ctx context.Context, id int) (*Product, error) {
    key := fmt.Sprintf("product:%d", id)

    // Шаг 1: проверяем кэш
    data, err := s.rdb.Get(ctx, key).Bytes()
    if err == nil {
        var p Product
        if err := json.Unmarshal(data, &p); err == nil {
            fmt.Println("CACHE HIT:", id)
            return &p, nil
        }
    }

    // Шаг 2: cache miss — идём в БД
    fmt.Println("CACHE MISS:", id)
    p := &Product{ID: id, Name: "Widget", Price: 9.99} // симуляция БД

    // Шаг 3: записываем в кэш
    if data, err := json.Marshal(p); err == nil {
        s.rdb.Set(ctx, key, data, 15*time.Minute)
    }

    return p, nil
}

// InvalidateProduct — инвалидация кэша при изменении
func (s *ProductService) InvalidateProduct(ctx context.Context, id int) {
    key := fmt.Sprintf("product:%d", id)
    s.rdb.Del(ctx, key)
    fmt.Println("Cache invalidated:", id)
}

func main() {
    rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
    svc := &ProductService{rdb: rdb}
    ctx := context.Background()

    // Первый запрос — cache miss
    p, _ := svc.GetProduct(ctx, 1)
    fmt.Printf("Got: %+v\\n", p)

    // Второй запрос — cache hit
    p, _ = svc.GetProduct(ctx, 1)
    fmt.Printf("Got: %+v\\n", p)

    // Инвалидация после обновления
    svc.InvalidateProduct(ctx, 1)
}`,
            explanation: 'Cache-Aside — самый популярный паттерн кэширования. Приложение само управляет кэшем. Инвалидация при обновлении — предотвращает stale data.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>context.Background() vs context.WithTimeout:</strong> В продакшне всегда используйте контекст с таймаутом для Redis запросов:</p>
            <pre style="margin-top:8px;font-size:12px">ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()
val, err := rdb.Get(ctx, key).Result()</pre>
            <p>Это предотвращает зависание запроса если Redis недоступен.</p>`
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что возвращает rdb.Get() когда ключ не найден в Redis?',
                    options: [
                        'Ошибку redis.Nil',
                        'Пустую строку',
                        'nil без ошибки',
                        'Ошибку "key not found"'
                    ],
                    correct: 0,
                    explanation: 'redis.Nil — специальное значение ошибки для "ключ не существует". Нужно проверять: if err == redis.Nil { // cache miss }. Это отличается от обычной ошибки подключения.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'В чём главное преимущество Pipeline?',
                    options: [
                        'Объединяет несколько команд в один round-trip до сервера',
                        'Гарантирует атомарность операций',
                        'Автоматически повторяет неудачные команды',
                        'Кэширует результаты локально'
                    ],
                    correct: 0,
                    explanation: 'Pipeline уменьшает latency за счёт батчинга команд. 100 команд = 1 round-trip вместо 100. Атомарность НЕ гарантируется — для этого TxPipelined.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Что означает паттерн Cache-Aside?',
                    options: [
                        'Приложение само управляет кэшем: сначала читает из кэша, при промахе берёт из БД и кладёт в кэш',
                        'Redis автоматически синхронизируется с БД',
                        'Данные всегда пишутся сначала в Redis, потом в БД',
                        'БД уведомляет Redis об изменениях'
                    ],
                    correct: 0,
                    explanation: 'Cache-Aside (Lazy Loading): 1) попробовать кэш, 2) при miss — БД, 3) заполнить кэш, 4) вернуть. Приложение — посредник между кэшем и БД.'
                }
            ]
        }
    ]
};
