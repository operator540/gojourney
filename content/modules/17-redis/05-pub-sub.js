export default {
    id: '17-05',
    title: 'Pub/Sub и очереди',
    description: 'Redis Pub/Sub, подписки на каналы, очереди задач, Streams',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Redis Pub/Sub — обмен сообщениями</h2>
                <p>Redis поддерживает паттерн <strong>Publisher/Subscriber</strong> — один сервис публикует событие, другие подписчики получают его мгновенно.</p>
                <p>Применения:</p>
                <ul>
                    <li>Real-time уведомления</li>
                    <li>Инвалидация кэша на нескольких серверах</li>
                    <li>Синхронизация событий между сервисами</li>
                    <li>Live-обновления в dashboards</li>
                </ul>
                <p><strong>Важно:</strong> Redis Pub/Sub — "fire and forget". Если подписчик недоступен в момент публикации — сообщение теряется. Для надёжности используйте Streams.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Pub/Sub: уведомления в реальном времени',
            code: `package main

import (
    "context"
    "fmt"
    "time"

    "github.com/redis/go-redis/v9"
)

func subscriber(rdb *redis.Client, channel string) {
    ctx := context.Background()
    pubsub := rdb.Subscribe(ctx, channel)
    defer pubsub.Close()

    fmt.Printf("Подписались на канал: %s\\n", channel)

    // Получаем сообщения
    for msg := range pubsub.Channel() {
        fmt.Printf("[%s] Получено: %s\\n", msg.Channel, msg.Payload)
    }
}

func publisher(rdb *redis.Client) {
    ctx := context.Background()
    time.Sleep(100 * time.Millisecond) // ждём подписчика

    events := []string{
        "user:login:42",
        "order:created:100",
        "payment:success:100",
    }

    for _, event := range events {
        count, _ := rdb.Publish(ctx, "events", event).Result()
        fmt.Printf("Опубликовано: %s (получателей: %d)\\n", event, count)
        time.Sleep(50 * time.Millisecond)
    }
}

func main() {
    rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
    ctx := context.Background()

    // Запускаем подписчика в горутине
    go subscriber(rdb, "events")

    // Публикуем события
    publisher(rdb)

    // Pattern subscribe — подписка по шаблону
    pubsub := rdb.PSubscribe(ctx, "user:*")
    defer pubsub.Close()

    go func() {
        for msg := range pubsub.Channel() {
            fmt.Printf("[pattern] %s: %s\\n", msg.Channel, msg.Payload)
        }
    }()

    // Публикуем в разные каналы
    rdb.Publish(ctx, "user:login", "alice")
    rdb.Publish(ctx, "user:logout", "bob")
    rdb.Publish(ctx, "order:created", "не попадёт в user:*")

    time.Sleep(200 * time.Millisecond)
}`,
            explanation: 'PSubscribe принимает glob-паттерн: user:* ловит user:login, user:logout, user:anything. Это удобно когда много похожих каналов. Publish возвращает количество активных подписчиков.'
        },
        {
            type: 'theory',
            content: `
                <h2>Очереди задач через List</h2>
                <p>List + BLPOP — простая и надёжная очередь задач. Producer добавляет задачи, Consumer их обрабатывает:</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Очередь задач: Producer/Consumer',
            code: `package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "time"

    "github.com/redis/go-redis/v9"
)

type Task struct {
    ID   string \`json:"id"\`
    Type string \`json:"type"\`
    Data string \`json:"data"\`
}

const queueKey = "queue:tasks"

// Producer — добавляет задачи в очередь
func enqueue(ctx context.Context, rdb *redis.Client, task Task) error {
    data, err := json.Marshal(task)
    if err != nil {
        return err
    }
    return rdb.RPush(ctx, queueKey, data).Err()
}

// Consumer — обрабатывает задачи (блокирующий)
func worker(ctx context.Context, rdb *redis.Client, id int) {
    for {
        // BLPOP блокируется до 5 секунд ожидая задачу
        result, err := rdb.BLPop(ctx, 5*time.Second, queueKey).Result()
        if err == redis.Nil {
            fmt.Printf("Worker %d: очередь пуста, жду...\\n", id)
            continue
        }
        if err != nil {
            log.Printf("Worker %d ошибка: %v", id, err)
            return
        }

        // result[0] = имя очереди, result[1] = данные
        var task Task
        if err := json.Unmarshal([]byte(result[1]), &task); err != nil {
            log.Printf("Worker %d: невалидная задача", id)
            continue
        }

        fmt.Printf("Worker %d обрабатывает: %s (%s)\\n", id, task.ID, task.Type)
        time.Sleep(100 * time.Millisecond) // симуляция работы
    }
}

func main() {
    rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
    ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
    defer cancel()

    // Запускаем 2 воркера
    go worker(ctx, rdb, 1)
    go worker(ctx, rdb, 2)

    // Producer добавляет задачи
    tasks := []Task{
        {ID: "t1", Type: "email", Data: "user@example.com"},
        {ID: "t2", Type: "sms", Data: "+7900000000"},
        {ID: "t3", Type: "push", Data: "device-token-abc"},
        {ID: "t4", Type: "email", Data: "admin@example.com"},
    }

    for _, t := range tasks {
        enqueue(ctx, rdb, t)
        fmt.Printf("Enqueued: %s\\n", t.ID)
    }

    // Мониторинг
    time.Sleep(500 * time.Millisecond)
    qLen, _ := rdb.LLen(ctx, queueKey).Result()
    fmt.Printf("Осталось в очереди: %d\\n", qLen)
}`,
            explanation: 'BLPop с таймаутом 5s — воркер засыпает если нет задач и просыпается мгновенно при появлении. result[0] = имя очереди, result[1] = данные. Несколько воркеров — горизонтальное масштабирование.'
        },
        {
            type: 'theory',
            content: `
                <h2>Redis Streams — надёжные очереди</h2>
                <p>Pub/Sub теряет сообщения если подписчик недоступен. List не хранит историю. <strong>Streams</strong> решают оба ограничения:</p>
                <ul>
                    <li>Персистентное хранение сообщений</li>
                    <li>Consumer groups — несколько консьюмеров обрабатывают один поток</li>
                    <li>Acknowledgement — подтверждение обработки</li>
                    <li>Replay — можно перечитать историю</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Redis Streams основы',
            code: `package main

import (
    "context"
    "fmt"
    "log"

    "github.com/redis/go-redis/v9"
)

func main() {
    rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
    ctx := context.Background()

    streamKey := "stream:events"
    groupName := "processors"

    // Создаём consumer group ($ = начиная с новых)
    rdb.XGroupCreateMkStream(ctx, streamKey, groupName, "$")

    // Producer: добавляем события в стрим
    // * = автогенерация ID (timestamp-sequencenum)
    id1, _ := rdb.XAdd(ctx, &redis.XAddArgs{
        Stream: streamKey,
        Values: map[string]interface{}{
            "type":    "order_created",
            "user_id": "42",
            "amount":  "1500",
        },
    }).Result()

    id2, _ := rdb.XAdd(ctx, &redis.XAddArgs{
        Stream: streamKey,
        Values: map[string]interface{}{
            "type":    "payment_success",
            "user_id": "42",
            "order":   "100",
        },
    }).Result()

    fmt.Println("Published:", id1, id2)

    // Consumer: читаем из group (> = новые непрочитанные)
    msgs, err := rdb.XReadGroup(ctx, &redis.XReadGroupArgs{
        Group:    groupName,
        Consumer: "worker-1",
        Streams:  []string{streamKey, ">"},
        Count:    10,
        Block:    0,
    }).Result()

    if err != nil {
        log.Fatal(err)
    }

    for _, stream := range msgs {
        for _, msg := range stream.Messages {
            fmt.Printf("Got [%s]: %v\\n", msg.ID, msg.Values)

            // Подтверждаем обработку (убирает из pending)
            rdb.XAck(ctx, streamKey, groupName, msg.ID)
        }
    }

    // Pending messages — необработанные/потенциально failed
    pending, _ := rdb.XPendingExt(ctx, &redis.XPendingExtArgs{
        Stream: streamKey,
        Group:  groupName,
        Start:  "-",
        Stop:   "+",
        Count:  10,
    }).Result()
    fmt.Println("Pending:", len(pending))
}`,
            explanation: 'XAck — подтверждение обработки. Пока не вызван XAck, сообщение остаётся в pending list. При падении воркера — другой воркер может перехватить pending сообщения через XCLAIM.'
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph LR
    P[Producer] -->|XADD| S[Redis Stream]
    S -->|XREADGROUP| W1[Worker 1]
    S -->|XREADGROUP| W2[Worker 2]
    W1 -->|XACK| S
    W2 -->|XACK| S
    S --> PL[Pending List]
    PL -->|XCLAIM после таймаута| W1
    style P fill:#1e3a5f,color:#60a5fa
    style S fill:#374151,color:#f9fafb
    style PL fill:#3a1a1a,color:#f87171`,
            caption: 'Redis Streams: сообщения надёжно доставляются через consumer groups с подтверждением'
        },
        {
            type: 'info-box',
            variant: 'note',
            content: `<p><strong>Когда что использовать:</strong></p>
            <ul>
                <li><strong>Pub/Sub</strong> — real-time события где потеря некритична (live-updates, инвалидация кэша)</li>
                <li><strong>List + BLPOP</strong> — простые очереди задач без требований надёжности</li>
                <li><strong>Streams</strong> — надёжная обработка с подтверждением, несколько консьюмеров, replay истории</li>
            </ul>`
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что происходит с сообщением Pub/Sub если подписчик недоступен в момент публикации?',
                    options: [
                        'Сообщение теряется навсегда',
                        'Сообщение буферизуется и доставляется позже',
                        'Redis повторяет попытку доставки',
                        'Сообщение сохраняется в базе Redis'
                    ],
                    correct: 0,
                    explanation: 'Redis Pub/Sub — "fire and forget". Если подписчика нет в момент публикации — сообщение потеряно. Для надёжной доставки используйте Streams с consumer groups.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что делает XACK в Redis Streams?',
                    options: [
                        'Подтверждает обработку сообщения — убирает из pending list',
                        'Добавляет сообщение в стрим',
                        'Удаляет стрим',
                        'Читает следующее сообщение'
                    ],
                    correct: 0,
                    explanation: 'XACK убирает сообщение из pending list consumer group. Пока нет ACK — Redis считает сообщение "в обработке". Упавший воркер — сообщения остаются в pending и могут быть перехвачены.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'BLPOP отличается от LPOP тем что...',
                    options: [
                        'Блокируется и ждёт если очередь пуста (до таймаута)',
                        'Удаляет несколько элементов за раз',
                        'Работает только с Set',
                        'Использует транзакцию'
                    ],
                    correct: 0,
                    explanation: 'BLPOP (Blocking LPOP): если список пуст — горутина/поток засыпает и просыпается когда появится элемент. Эффективнее polling-а (цикл с LPOP + sleep).'
                }
            ]
        }
    ]
};
