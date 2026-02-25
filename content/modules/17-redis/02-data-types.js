export default {
    id: '17-02',
    title: 'Типы данных Redis',
    description: 'String, List, Hash, Set, Sorted Set, Bitmap, HyperLogLog — когда что использовать',
    estimatedTime: 25,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Redis — не просто key-value хранилище</h2>
                <p>Redis поддерживает <strong>9 типов данных</strong>, каждый оптимизирован под свои задачи. Правильный выбор типа — ключ к эффективности.</p>
                <p>Все операции с одним ключом атомарны и выполняются за O(1) или O(log N).</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>1. String — базовый тип</h2>
                <p>Самый универсальный тип. Хранит строку до <strong>512 МБ</strong>. Используется для:</p>
                <ul>
                    <li>Кэширование HTML, JSON, объектов</li>
                    <li>Счётчики (INCR, DECR)</li>
                    <li>Сессии пользователей</li>
                    <li>Флаги и настройки</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'String операции в Redis',
            code: `// Redis команды для String:
// SET key value [EX seconds]
// GET key
// INCR key / INCRBY key n
// SETNX key value (SET if Not eXists)
// GETSET key value (атомарный get + set)

// Примеры:
// SET user:1:name "Alice" EX 3600
// GET user:1:name            → "Alice"
// INCR pageviews:home        → 1, 2, 3...
// SETNX lock:payment "1"     → 1 если не было, 0 если было

// В Go с go-redis:
package main

import (
    "context"
    "fmt"
    "time"
    "github.com/redis/go-redis/v9"
)

func main() {
    rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
    ctx := context.Background()

    // SET с TTL
    rdb.Set(ctx, "session:abc123", "user_id:42", 30*time.Minute)

    // GET
    val, _ := rdb.Get(ctx, "session:abc123").Result()
    fmt.Println(val) // user_id:42

    // Атомарный счётчик
    rdb.Incr(ctx, "stats:visits")
    rdb.IncrBy(ctx, "stats:visits", 5)
    count, _ := rdb.Get(ctx, "stats:visits").Int64()
    fmt.Println("Visits:", count) // 6

    // SET NX — только если ключа нет (распределённая блокировка)
    ok, _ := rdb.SetNX(ctx, "lock:payment", "1", 5*time.Second).Result()
    fmt.Println("Lock acquired:", ok) // true первый раз, false повторно
}`,
            explanation: 'SetNX (SET if Not eXists) — основа для распределённых блокировок. Возвращает true только если ключа не было. Atomically!'
        },
        {
            type: 'theory',
            content: `
                <h2>2. List — двусторонняя очередь</h2>
                <p>Список строк. Операции добавления/получения с обоих концов — <strong>O(1)</strong>. Использование:</p>
                <ul>
                    <li>Очереди задач (RPUSH + BLPOP)</li>
                    <li>Лента активности (LPUSH + LRANGE 0 99)</li>
                    <li>История операций</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'List: очередь задач',
            code: `// Redis команды:
// LPUSH key val1 val2 — добавить в начало
// RPUSH key val1 val2 — добавить в конец
// LPOP key — взять из начала
// RPOP key — взять из конца
// BLPOP key timeout — blocking pop (ждёт если пусто)
// LRANGE key 0 -1 — все элементы
// LLEN key — длина

// Паттерн: очередь задач
// Producer: RPUSH queue:emails "task1"
// Consumer: BLPOP queue:emails 0  ← блокируется до появления задачи

package main

import (
    "context"
    "fmt"
    "github.com/redis/go-redis/v9"
)

func main() {
    rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
    ctx := context.Background()

    // Добавляем задачи в очередь (FIFO: RPUSH + LPOP)
    rdb.RPush(ctx, "queue:emails",
        "send:user1@example.com",
        "send:user2@example.com",
        "send:user3@example.com",
    )

    // Лента активности (последние 100 событий)
    rdb.LPush(ctx, "feed:user:42",
        "liked post #100",
        "commented on #99",
        "followed @alice",
    )
    // Обрезаем до 100 элементов
    rdb.LTrim(ctx, "feed:user:42", 0, 99)

    // Получить ленту
    feed, _ := rdb.LRange(ctx, "feed:user:42", 0, 9).Result()
    fmt.Println("Feed:", feed)

    // Обработать одну задачу
    task, _ := rdb.LPop(ctx, "queue:emails").Result()
    fmt.Println("Processing:", task)

    qLen, _ := rdb.LLen(ctx, "queue:emails").Result()
    fmt.Println("Queue length:", qLen) // 2
}`,
            explanation: 'BLPOP — блокирующий pop, consumer засыпает пока нет задач и просыпается мгновенно. Это эффективнее polling. LTrim + LPush = скользящее окно последних N элементов.'
        },
        {
            type: 'theory',
            content: `
                <h2>3. Hash — объект/запись</h2>
                <p>Хеш-таблица внутри ключа. Идеален для хранения <strong>объектов</strong> — можно обновлять отдельные поля без перезаписи всего объекта.</p>
                <ul>
                    <li>Профили пользователей</li>
                    <li>Настройки сессии</li>
                    <li>Конфигурация</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Hash: профиль пользователя',
            code: `// Redis команды:
// HSET key field value [field value...]
// HGET key field
// HMGET key field1 field2
// HGETALL key — все поля
// HINCRBY key field n — атомарный инкремент поля
// HDEL key field
// HEXISTS key field

package main

import (
    "context"
    "fmt"
    "github.com/redis/go-redis/v9"
)

func main() {
    rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
    ctx := context.Background()

    // Сохраняем пользователя как Hash
    rdb.HSet(ctx, "user:42",
        "name", "Alice",
        "email", "alice@example.com",
        "age", "28",
        "score", "0",
    )

    // Читаем одно поле
    name, _ := rdb.HGet(ctx, "user:42", "name").Result()
    fmt.Println("Name:", name)

    // Читаем все поля
    user, _ := rdb.HGetAll(ctx, "user:42").Result()
    fmt.Println("User:", user)

    // Атомарно обновляем счёт
    rdb.HIncrBy(ctx, "user:42", "score", 10)
    rdb.HIncrBy(ctx, "user:42", "score", 5)

    score, _ := rdb.HGet(ctx, "user:42", "score").Result()
    fmt.Println("Score:", score) // 15

    // Проверяем существование поля
    exists, _ := rdb.HExists(ctx, "user:42", "email").Result()
    fmt.Println("Has email:", exists) // true
}`,
            explanation: 'Hash позволяет обновить только поле score без перезаписи всего объекта. HIncrBy атомарен — безопасно для конкурентных обновлений.'
        },
        {
            type: 'theory',
            content: `
                <h2>4. Set — множество уникальных значений</h2>
                <p>Неупорядоченный набор строк без дубликатов. Операции пересечения, объединения, разности — <strong>O(N)</strong>. Использование:</p>
                <ul>
                    <li>Теги, категории</li>
                    <li>Онлайн пользователи</li>
                    <li>Уникальные посетители</li>
                    <li>Общие друзья (SINTER)</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Set: общие друзья и теги',
            code: `// Redis команды:
// SADD key member1 member2
// SREM key member
// SISMEMBER key member — есть ли в множестве
// SMEMBERS key — все элементы
// SCARD key — размер
// SINTER key1 key2 — пересечение
// SUNION key1 key2 — объединение
// SDIFF key1 key2 — разность

package main

import (
    "context"
    "fmt"
    "github.com/redis/go-redis/v9"
)

func main() {
    rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
    ctx := context.Background()

    // Друзья пользователей
    rdb.SAdd(ctx, "friends:alice", "bob", "carol", "dave", "eve")
    rdb.SAdd(ctx, "friends:bob",   "alice", "carol", "frank")

    // Общие друзья
    common, _ := rdb.SInter(ctx, "friends:alice", "friends:bob").Result()
    fmt.Println("Общие друзья:", common) // [carol]

    // Онлайн-пользователи
    rdb.SAdd(ctx, "online:users", "user:1", "user:2", "user:3")
    rdb.SRem(ctx, "online:users", "user:2") // отключился

    isOnline, _ := rdb.SIsMember(ctx, "online:users", "user:1").Result()
    fmt.Println("user:1 онлайн:", isOnline) // true

    count, _ := rdb.SCard(ctx, "online:users").Result()
    fmt.Println("Онлайн:", count) // 2

    // Теги статьи
    rdb.SAdd(ctx, "article:100:tags", "go", "programming", "backend")
    rdb.SAdd(ctx, "article:101:tags", "go", "generics", "types")

    // Статьи с тегом "go"
    rdb.SAdd(ctx, "tag:go:articles", "100", "101")
    articles, _ := rdb.SMembers(ctx, "tag:go:articles").Result()
    fmt.Println("Go статьи:", articles)
}`,
            explanation: 'SInter для нахождения общих друзей — классический паттерн. Для онлайн-пользователей Set идеален: добавить/удалить O(1), проверить наличие O(1).'
        },
        {
            type: 'theory',
            content: `
                <h2>5. Sorted Set (ZSet) — рейтинги и очереди с приоритетом</h2>
                <p>Как Set, но каждый элемент имеет <strong>score</strong> (число с плавающей точкой). Элементы автоматически сортируются по score. Использование:</p>
                <ul>
                    <li>Лидерборды и рейтинги</li>
                    <li>Очереди с приоритетом</li>
                    <li>Временные ряды (score = timestamp)</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Sorted Set: лидерборд',
            code: `// Redis команды:
// ZADD key score member
// ZINCRBY key increment member
// ZRANK key member — позиция (0-based)
// ZREVRANK key member — позиция с конца
// ZRANGE key 0 -1 WITHSCORES — от мин к макс
// ZREVRANGE key 0 9 WITHSCORES — топ 10

package main

import (
    "context"
    "fmt"
    "github.com/redis/go-redis/v9"
)

func main() {
    rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
    ctx := context.Background()

    // Добавляем очки игрокам
    rdb.ZAdd(ctx, "leaderboard",
        redis.Z{Score: 1500, Member: "alice"},
        redis.Z{Score: 2300, Member: "bob"},
        redis.Z{Score: 1800, Member: "carol"},
        redis.Z{Score: 2100, Member: "dave"},
    )

    // Начислить очки
    rdb.ZIncrBy(ctx, "leaderboard", 200, "alice") // alice: 1700

    // Топ-3 (в порядке убывания)
    top3, _ := rdb.ZRevRangeWithScores(ctx, "leaderboard", 0, 2).Result()
    fmt.Println("Топ-3:")
    for i, z := range top3 {
        fmt.Printf("  #%d %s: %.0f\\n", i+1, z.Member, z.Score)
    }

    // Позиция alice (0-based, от минимума)
    rank, _ := rdb.ZRevRank(ctx, "leaderboard", "alice").Result()
    fmt.Printf("Alice: #%d\\n", rank+1) // позиция в топе

    // Количество игроков с очками > 2000
    count, _ := rdb.ZCount(ctx, "leaderboard", "2000", "+inf").Result()
    fmt.Println("Элита (>2000):", count) // 2 (bob, dave)
}`,
            explanation: 'ZRevRange = от большего к меньшему (топ-N). ZCount с диапазоном очков — мощный инструмент для фильтрации. ZRevRank возвращает позицию в рейтинге.'
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph TD
    A[Задача] --> B{Что хранить?}
    B --> C[Строка/JSON/счётчик] --> D[String]
    B --> E[Объект с полями] --> F[Hash]
    B --> G[Список/очередь] --> H[List]
    B --> I[Уникальные элементы] --> J[Set]
    B --> K[Рейтинг/приоритет] --> L[Sorted Set]
    style D fill:#1e3a5f,color:#60a5fa
    style F fill:#2d1b69,color:#a78bfa
    style H fill:#1a3a2e,color:#34d399
    style J fill:#3a1a1a,color:#f87171
    style L fill:#3a2a0a,color:#fbbf24`,
            caption: 'Как выбрать тип данных Redis'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Какой тип Redis использовать для хранения профиля пользователя с несколькими полями?',
                    options: ['Hash', 'String (JSON)', 'List', 'Set'],
                    correct: 0,
                    explanation: 'Hash позволяет обновлять отдельные поля без перезаписи всего объекта. String с JSON тоже работает, но нельзя обновить одно поле — только весь объект.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Нужно хранить онлайн-пользователей и быстро проверять "в сети ли user:42". Какой тип?',
                    options: ['Set', 'List', 'Sorted Set', 'Hash'],
                    correct: 0,
                    explanation: 'Set: SISMEMBER — O(1). Уникальные элементы без дубликатов. Добавить/удалить/проверить — всё O(1). List медленнее для поиска O(N).'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Нужен лидерборд: добавить игрока, увеличить очки, получить топ-10. Что использовать?',
                    options: ['Sorted Set (ZSet)', 'List', 'Hash', 'Set'],
                    correct: 0,
                    explanation: 'Sorted Set хранит пары (score, member) и автоматически сортирует. ZADD, ZINCRBY, ZREVRANGE 0 9 — всё что нужно для лидерборда.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Команда BLPOP отличается от LPOP тем что...',
                    options: [
                        'Блокирует консьюмер до появления элемента в очереди',
                        'Удаляет больше элементов за раз',
                        'Работает только с большими списками',
                        'Атомически меняет элемент'
                    ],
                    correct: 0,
                    explanation: 'BLPOP (Blocking LPOP) — consumer засыпает если очередь пуста и просыпается сразу при появлении элемента. Это эффективнее polling-а (постоянных LPOP запросов).'
                }
            ]
        }
    ]
};
