export default {
    id: '17-04',
    title: 'Паттерны кэширования',
    description: 'Cache-Aside, Write-Through, Write-Behind, TTL стратегии, инвалидация кэша',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Зачем нужны паттерны кэширования?</h2>
                <p>Кэш — не просто "сохранить в Redis". Главные вопросы:</p>
                <ul>
                    <li><strong>Когда заполнять?</strong> Заранее или по запросу?</li>
                    <li><strong>Когда инвалидировать?</strong> При записи или по TTL?</li>
                    <li><strong>Что делать если кэш устарел?</strong></li>
                    <li><strong>Как пережить перезапуск Redis?</strong></li>
                </ul>
                <p>Разные паттерны дают разные компромиссы между консистентностью, производительностью и сложностью.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Паттерн 1: Cache-Aside (Lazy Loading)</h2>
                <p><strong>Приложение управляет кэшем вручную.</strong> Самый распространённый паттерн.</p>
                <ul>
                    <li>✅ Простой в реализации</li>
                    <li>✅ Кэшируются только реально запрошенные данные</li>
                    <li>❌ Первый запрос всегда медленный (cache miss)</li>
                    <li>❌ Возможен stale data между UPDATE и инвалидацией</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Cache-Aside с защитой от stampede',
            code: `package main

import (
    "context"
    "encoding/json"
    "fmt"
    "sync"
    "time"

    "github.com/redis/go-redis/v9"
)

// Cache stampede (thundering herd) — проблема:
// 100 запросов одновременно видят cache miss и все идут в БД

type SafeCache struct {
    rdb     *redis.Client
    mu      sync.Map // защита от stampede
}

func (c *SafeCache) Get(ctx context.Context, key string, loader func() (interface{}, error)) (interface{}, error) {
    // Шаг 1: проверяем Redis
    val, err := c.rdb.Get(ctx, key).Result()
    if err == nil {
        var result interface{}
        json.Unmarshal([]byte(val), &result)
        return result, nil
    }

    // Шаг 2: используем singleflight-паттерн
    // Только один горутин идёт в БД, остальные ждут его результата
    ch := make(chan struct{})
    actual, loaded := c.mu.LoadOrStore(key, ch)
    if loaded {
        // Кто-то уже загружает — ждём
        <-actual.(chan struct{})
        // Повторяем чтение из кэша
        val, err = c.rdb.Get(ctx, key).Result()
        if err == nil {
            var result interface{}
            json.Unmarshal([]byte(val), &result)
            return result, nil
        }
        return nil, err
    }

    defer func() {
        c.mu.Delete(key)
        close(ch) // будим всех ожидающих
    }()

    // Шаг 3: загружаем из источника
    data, err := loader()
    if err != nil {
        return nil, err
    }

    // Шаг 4: кладём в кэш
    if bytes, err := json.Marshal(data); err == nil {
        c.rdb.Set(ctx, key, bytes, 5*time.Minute)
    }

    return data, nil
}

func main() {
    rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
    cache := &SafeCache{rdb: rdb}
    ctx := context.Background()

    // Симуляция 5 параллельных запросов
    var wg sync.WaitGroup
    for i := 0; i < 5; i++ {
        wg.Add(1)
        go func(n int) {
            defer wg.Done()
            val, _ := cache.Get(ctx, "expensive:query", func() (interface{}, error) {
                fmt.Printf("  БД запрос (только один раз!)\\n")
                time.Sleep(100 * time.Millisecond)
                return map[string]int{"result": 42}, nil
            })
            fmt.Printf("  goroutine %d: %v\\n", n, val)
        }(i)
    }
    wg.Wait()
}`,
            explanation: 'Cache stampede: 100 запросов видят miss и все идут в БД. Решение — singleflight: один горутин загружает, остальные ждут его результата. sync.Map.LoadOrStore атомарен.'
        },
        {
            type: 'theory',
            content: `
                <h2>Паттерн 2: Write-Through</h2>
                <p>При каждой записи в БД — <strong>одновременно</strong> обновляется кэш. Кэш всегда актуален.</p>
                <ul>
                    <li>✅ Кэш всегда консистентен с БД</li>
                    <li>✅ Нет stale data</li>
                    <li>❌ Каждая запись = 2 операции (БД + кэш)</li>
                    <li>❌ Кэш заполняется даже для редко читаемых данных</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Write-Through: всегда актуальный кэш',
            code: `package main

import (
    "context"
    "encoding/json"
    "fmt"
    "time"

    "github.com/redis/go-redis/v9"
)

type Article struct {
    ID      int    \`json:"id"\`
    Title   string \`json:"title"\`
    Content string \`json:"content"\`
    Views   int    \`json:"views"\`
}

type ArticleRepo struct {
    // db  *sql.DB  // в реальности
    rdb *redis.Client
    ttl time.Duration
}

func cacheKey(id int) string {
    return fmt.Sprintf("article:%d", id)
}

// UpdateArticle — Write-Through: обновляем БД И кэш атомарно
func (r *ArticleRepo) UpdateArticle(ctx context.Context, a Article) error {
    // 1. Обновляем БД (в реальности: INSERT INTO articles...)
    fmt.Printf("БД: UPDATE articles SET title=%q WHERE id=%d\\n", a.Title, a.ID)

    // 2. Одновременно обновляем кэш
    data, err := json.Marshal(a)
    if err != nil {
        return err
    }
    return r.rdb.Set(ctx, cacheKey(a.ID), data, r.ttl).Err()
}

// GetArticle — читаем из кэша (всегда актуален при Write-Through)
func (r *ArticleRepo) GetArticle(ctx context.Context, id int) (*Article, error) {
    data, err := r.rdb.Get(ctx, cacheKey(id)).Bytes()
    if err == redis.Nil {
        // Первый запрос — заполняем из БД
        a := &Article{ID: id, Title: "Статья", Content: "Контент", Views: 0}
        bytes, _ := json.Marshal(a)
        r.rdb.Set(ctx, cacheKey(id), bytes, r.ttl)
        return a, nil
    }
    if err != nil {
        return nil, err
    }
    var a Article
    return &a, json.Unmarshal(data, &a)
}

func main() {
    rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
    repo := &ArticleRepo{rdb: rdb, ttl: 30 * time.Minute}
    ctx := context.Background()

    // Первое чтение — загрузка из БД
    a, _ := repo.GetArticle(ctx, 1)
    fmt.Printf("Read: %+v\\n", a)

    // Обновление: БД + кэш одновременно
    a.Title = "Новый заголовок"
    a.Views = 1000
    repo.UpdateArticle(ctx, *a)

    // Повторное чтение — из актуального кэша
    a2, _ := repo.GetArticle(ctx, 1)
    fmt.Printf("After update: %+v\\n", a2)
}`,
            explanation: 'Write-Through гарантирует что после UpdateArticle кэш содержит актуальные данные. Следующий GetArticle сразу получит актуальное значение.'
        },
        {
            type: 'theory',
            content: `
                <h2>Паттерн 3: Write-Behind (Write-Back)</h2>
                <p>Сначала пишем в кэш, потом <strong>асинхронно</strong> в БД. Максимальная скорость записи.</p>
                <ul>
                    <li>✅ Очень быстрая запись (только Redis)</li>
                    <li>✅ Сглаживает пиковые нагрузки на БД</li>
                    <li>❌ Риск потери данных если Redis упадёт до сброса в БД</li>
                    <li>❌ Сложная реализация</li>
                    <li>📌 Используется в системах с высоким write throughput: счётчики, аналитика</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'TTL стратегии и инвалидация',
            code: `package main

import (
    "context"
    "fmt"
    "time"

    "github.com/redis/go-redis/v9"
)

// Стратегии TTL
const (
    TTLSession   = 30 * time.Minute  // сессии: средний TTL
    TTLProduct   = 1 * time.Hour     // продукты: редко меняются
    TTLUser      = 5 * time.Minute   // профиль: может меняться
    TTLRate      = 1 * time.Second   // rate limiting: очень короткий
    TTLStatic    = 24 * time.Hour    // статика: редко меняется
)

type CacheManager struct {
    rdb *redis.Client
}

// TaggedInvalidation — инвалидация группы ключей по тегу
// Паттерн: храним список ключей под тегом
func (c *CacheManager) SetWithTag(ctx context.Context, key string, val interface{}, ttl time.Duration, tag string) error {
    // Сохраняем ключ в теговый список
    tagKey := "tag:" + tag
    c.rdb.SAdd(ctx, tagKey, key)
    c.rdb.Expire(ctx, tagKey, ttl+time.Minute)

    return c.rdb.Set(ctx, key, fmt.Sprint(val), ttl).Err()
}

// InvalidateByTag — удаляем все ключи с данным тегом
func (c *CacheManager) InvalidateByTag(ctx context.Context, tag string) error {
    tagKey := "tag:" + tag
    keys, err := c.rdb.SMembers(ctx, tagKey).Result()
    if err != nil {
        return err
    }
    if len(keys) == 0 {
        return nil
    }
    // Удаляем все ключи + сам тег
    allKeys := append(keys, tagKey)
    return c.rdb.Del(ctx, allKeys...).Err()
}

func main() {
    rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
    cm := &CacheManager{rdb: rdb}
    ctx := context.Background()

    // Кэшируем несколько продуктов с тегом "products"
    cm.SetWithTag(ctx, "product:1", "Widget", TTLProduct, "products")
    cm.SetWithTag(ctx, "product:2", "Gadget", TTLProduct, "products")
    cm.SetWithTag(ctx, "product:3", "Doohickey", TTLProduct, "products")

    // Проверяем
    v, _ := rdb.Get(ctx, "product:1").Result()
    fmt.Println("Before:", v) // Widget

    // При обновлении категории — инвалидируем все продукты сразу
    fmt.Println("Обновляем категорию продуктов...")
    cm.InvalidateByTag(ctx, "products")

    // Все продукты удалены из кэша
    _, err := rdb.Get(ctx, "product:1").Result()
    fmt.Println("After invalidation:", err) // redis: nil

    // Rate limiting с Redis
    key := "rate:user:42:login"
    count, _ := rdb.Incr(ctx, key).Result()
    rdb.Expire(ctx, key, time.Minute)
    fmt.Printf("Попытки входа: %d/5\\n", count)
    if count > 5 {
        fmt.Println("Слишком много попыток!")
    }
}`,
            explanation: 'Tagged invalidation: теги позволяют удалить группу связанных ключей одной операцией. Rate limiting через INCR + EXPIRE — классический Redis паттерн.'
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `sequenceDiagram
    participant App
    participant Redis
    participant DB

    Note over App,DB: Cache-Aside (Lazy Loading)
    App->>Redis: GET product:1
    Redis-->>App: nil (miss)
    App->>DB: SELECT * FROM products WHERE id=1
    DB-->>App: Product data
    App->>Redis: SET product:1 data EX 3600
    App->>Redis: GET product:1 (следующий запрос)
    Redis-->>App: Product data (hit)`,
            caption: 'Cache-Aside: при промахе приложение само загружает данные и заполняет кэш'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Cache stampede — это когда...',
                    options: [
                        'Много запросов одновременно видят cache miss и идут в БД',
                        'Redis перегружен слишком большим кэшем',
                        'Кэш содержит устаревшие данные',
                        'Redis недоступен'
                    ],
                    correct: 0,
                    explanation: 'Cache stampede (thundering herd): TTL истёк, 1000 запросов одновременно видят miss и все идут в БД. Решение: singleflight — только один запрос идёт в БД, остальные ждут.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Какой паттерн кэширования обеспечивает максимальную скорость записи?',
                    options: [
                        'Write-Behind (Write-Back)',
                        'Write-Through',
                        'Cache-Aside',
                        'Read-Through'
                    ],
                    correct: 0,
                    explanation: 'Write-Behind пишет только в кэш (быстро), асинхронно сбрасывая в БД позже. Риск потери данных, но максимальная скорость записи.'
                },
                {
                    id: 'q3',
                    type: 'multiple',
                    question: 'Для каких данных нужен короткий TTL (< 1 минуты)?',
                    options: [
                        'Rate limiting (ограничение запросов)',
                        'Статические страницы сайта',
                        'Real-time данные (курсы валют, цены)',
                        'Профили пользователей',
                        'Конфигурация приложения'
                    ],
                    correct: [0, 2],
                    explanation: 'Rate limiting — TTL = время окна (секунды-минуты). Реалтаймовые данные меняются часто. Статика и конфигурация — можно кэшировать надолго.'
                }
            ]
        }
    ]
};
