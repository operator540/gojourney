export default {
    id: '18-08',
    title: 'Финальная подготовка к собеседованию',
    description: 'Топ вопросов на Go собеседованиях, типичные задачи, советы',
    estimatedTime: 45,
    xpReward: 50,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Вы прошли весь курс. Поздравляем!</h2>
                <p>Вы изучили Go от основ до продвинутых тем. Этот урок — финальная подготовка к собеседованию на позицию Junior/Middle Go-разработчика.</p>
                <p>Разберём три категории вопросов:</p>
                <ul>
                    <li>🔬 <strong>Теоретические</strong> — "объясни как работает..."</li>
                    <li>💻 <strong>Практические</strong> — "напиши код..."</li>
                    <li>🏗️ <strong>Архитектурные</strong> — "как бы ты спроектировал..."</li>
                </ul>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>🔬 Топ теоретических вопросов</h2>
                <h3>1. В чём разница между горутинами и потоками ОС?</h3>
                <p><strong>Ответ:</strong> Горутины — лёгкие (~2КБ стек), управляются рантаймом Go. Потоки ОС — тяжёлые (~1-8МБ), управляются ядром. Go планировщик (M:N) мультиплексирует N горутин на M потоков ОС. Миллион горутин реален, миллион потоков — нет.</p>

                <h3>2. Что такое интерфейс в Go? Как имплементируется?</h3>
                <p><strong>Ответ:</strong> Интерфейс — набор методов. Имплементация неявная (duck typing): если тип T имеет все методы интерфейса I — T автоматически реализует I. Не нужно ключевое слово implements.</p>

                <h3>3. Что такое defer? Порядок выполнения?</h3>
                <p><strong>Ответ:</strong> defer откладывает вызов функции до момента возврата из окружающей функции. Несколько defer — выполняются в LIFO (стековом) порядке: последний добавленный — первый выполненный.</p>

                <h3>4. Как работает garbage collector в Go?</h3>
                <p><strong>Ответ:</strong> Tri-color mark-and-sweep. Конкурентный (работает параллельно с программой). Паузы < 1мс. Управлять памятью вручную не нужно. GOGC переменная управляет агрессивностью.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Практическая задача #1: конкурентный воркер пул',
            code: `// Задача: реализовать пул воркеров
// Дано: N задач, M воркеров, нужно обработать все задачи параллельно

package main

import (
    "fmt"
    "sync"
)

type Job struct {
    ID   int
    Data string
}

type Result struct {
    JobID  int
    Output string
    Err    error
}

func process(job Job) Result {
    // Симуляция обработки
    return Result{
        JobID:  job.ID,
        Output: fmt.Sprintf("processed: %s", job.Data),
    }
}

func workerPool(numWorkers int, jobs []Job) []Result {
    jobCh := make(chan Job, len(jobs))
    resultCh := make(chan Result, len(jobs))

    // Запускаем воркеры
    var wg sync.WaitGroup
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for job := range jobCh {
                resultCh <- process(job)
            }
        }()
    }

    // Отправляем задачи
    for _, job := range jobs {
        jobCh <- job
    }
    close(jobCh) // сигнал: задачи закончились

    // Ждём завершения воркеров и закрываем результаты
    go func() {
        wg.Wait()
        close(resultCh)
    }()

    // Собираем результаты
    var results []Result
    for r := range resultCh {
        results = append(results, r)
    }
    return results
}

func main() {
    jobs := make([]Job, 10)
    for i := range jobs {
        jobs[i] = Job{ID: i, Data: fmt.Sprintf("task-%d", i)}
    }

    results := workerPool(3, jobs) // 3 воркера, 10 задач
    fmt.Printf("Обработано: %d задач\\n", len(results))
    for _, r := range results[:3] {
        fmt.Println(r.Output)
    }
}`,
            explanation: 'Worker pool — классический паттерн. Канал jobs — очередь задач. Воркеры читают из канала пока он не закрыт (range jobCh). close(jobCh) — сигнал воркерам что задач больше нет.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Практическая задача #2: кэш с TTL',
            code: `// Задача: реализовать потокобезопасный кэш с TTL
package main

import (
    "fmt"
    "sync"
    "time"
)

type entry struct {
    value     interface{}
    expiresAt time.Time
}

type TTLCache struct {
    mu    sync.RWMutex
    items map[string]entry
}

func NewTTLCache() *TTLCache {
    c := &TTLCache{items: make(map[string]entry)}
    // Фоновая горутина для очистки
    go func() {
        ticker := time.NewTicker(time.Minute)
        defer ticker.Stop()
        for range ticker.C {
            c.cleanup()
        }
    }()
    return c
}

func (c *TTLCache) Set(key string, value interface{}, ttl time.Duration) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.items[key] = entry{
        value:     value,
        expiresAt: time.Now().Add(ttl),
    }
}

func (c *TTLCache) Get(key string) (interface{}, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    e, ok := c.items[key]
    if !ok || time.Now().After(e.expiresAt) {
        return nil, false
    }
    return e.value, true
}

func (c *TTLCache) cleanup() {
    c.mu.Lock()
    defer c.mu.Unlock()
    now := time.Now()
    for k, e := range c.items {
        if now.After(e.expiresAt) {
            delete(c.items, k)
        }
    }
}

func main() {
    cache := NewTTLCache()
    cache.Set("user:42", map[string]string{"name": "Alice"}, 100*time.Millisecond)

    if v, ok := cache.Get("user:42"); ok {
        fmt.Println("Found:", v)
    }

    time.Sleep(200 * time.Millisecond)

    if _, ok := cache.Get("user:42"); !ok {
        fmt.Println("Expired: ключ исчез после TTL")
    }
}`,
            explanation: 'RWMutex: много читателей одновременно (RLock), один писатель (Lock). Фоновая очистка через ticker.C — канал тикает раз в минуту. range ticker.C — бесконечный цикл.'
        },
        {
            type: 'theory',
            content: `
                <h2>🏗️ Архитектурные вопросы</h2>
                <h3>"Как бы вы организовали Go API для 100K RPS?"</h3>
                <p><strong>Структура ответа:</strong></p>
                <ul>
                    <li>Горизонтальное масштабирование: несколько инстансов за load balancer</li>
                    <li>Stateless сервисы + Redis для сессий и кэша</li>
                    <li>Connection pool для PostgreSQL (pgxpool)</li>
                    <li>Rate limiting на уровне nginx/API gateway</li>
                    <li>Async обработка тяжёлых операций через очереди</li>
                    <li>Graceful shutdown для zero-downtime деплоя</li>
                </ul>

                <h3>"Как обработать N параллельных запросов к внешнему API?"</h3>
                <p><strong>Ответ:</strong> Worker pool + semaphore для ограничения параллелизма:</p>
                <pre><code>sem := make(chan struct{}, maxConcurrent)
for _, item := range items {
    sem <- struct{}{}      // занимаем слот
    go func(item Item) {
        defer func() { <-sem }() // освобождаем
        process(item)
    }(item)
}
// ждём все завершения...</code></pre>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Частые ошибки на собеседовании</h2>
                <ul>
                    <li>❌ <strong>Не передавать WaitGroup по указателю</strong> — <code>go func(wg sync.WaitGroup)</code> вместо <code>*sync.WaitGroup</code></li>
                    <li>❌ <strong>Игнорировать ошибки</strong> — <code>db.Query(...)</code> без <code>if err != nil</code></li>
                    <li>❌ <strong>Не закрывать rows</strong> — <code>defer rows.Close()</code> всегда!</li>
                    <li>❌ <strong>Захват переменной цикла</strong> — <code>go func() { use(i) }</code> вместо <code>go func(i int) { use(i) }(i)</code></li>
                    <li>❌ <strong>Забыть про race condition</strong> — писать в map из нескольких горутин без mutex</li>
                    <li>❌ <strong>Паниковать вместо возвращать ошибку</strong> — <code>panic</code> для ожидаемых ошибок</li>
                </ul>
            `
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Совет по собеседованию:</strong> Когда получаете задачу на кодинг — сначала проговорите подход вслух, обсудите edge cases, потом пишите код. Интервьюеры оценивают мышление, а не только финальный код. Go-специфика: всегда обрабатывайте ошибки, используйте defer для cleanup, избегайте naked goroutines.</p>`
        },
        {
            type: 'theory',
            content: `
                <h2>🎓 Вы готовы к собеседованию!</h2>
                <p>За этот курс вы освоили:</p>
                <ul>
                    <li>✅ Основы Go: типы, функции, структуры, интерфейсы</li>
                    <li>✅ Конкурентность: горутины, каналы, sync, context</li>
                    <li>✅ Тестирование: table-driven, testify, моки, бенчмарки</li>
                    <li>✅ HTTP API: net/http, chi, Echo, REST принципы, JWT</li>
                    <li>✅ Базы данных: SQL, PostgreSQL, database/sql, GORM, транзакции</li>
                    <li>✅ Redis: типы данных, кэширование, pub/sub</li>
                    <li>✅ Архитектура: SOLID, Clean Architecture, DDD паттерны</li>
                    <li>✅ Инфраструктура: Docker, Git, CI/CD</li>
                    <li>✅ Продвинутые темы: Generics, gRPC, Микросервисы</li>
                </ul>
                <p style="margin-top:16px"><strong>Удачи на собеседовании! Go-разработчики в большом спросе 🚀</strong></p>
            `
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'multiple',
                    question: 'Что нужно сделать с sql.Rows после запроса?',
                    options: [
                        'defer rows.Close()',
                        'Проверить rows.Err() после цикла',
                        'Вызвать rows.Next() перед чтением',
                        'Использовать rows.Scan() для каждой строки',
                        'Вызвать rows.Commit()'
                    ],
                    correct: [0, 1, 2, 3],
                    explanation: 'rows.Close() освобождает соединение. rows.Err() проверяет ошибки итерации. rows.Next() возвращает true если есть следующая строка. rows.Scan() читает поля. rows.Commit() — для транзакций, не rows.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Как исправить race condition при записи в map из горутин?',
                    options: [
                        'Использовать sync.RWMutex или sync.Map',
                        'Использовать sync.WaitGroup',
                        'Использовать каналы для чтения',
                        'Race condition при map невозможен'
                    ],
                    correct: 0,
                    explanation: 'Map в Go не потокобезопасен. Параллельная запись — undefined behavior / паника. Решения: sync.Mutex/RWMutex вокруг map или sync.Map для конкурентного доступа.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Что такое graceful shutdown в Go HTTP сервере?',
                    options: [
                        'Ожидание завершения текущих запросов перед остановкой сервера',
                        'Автоматический restart при падении',
                        'Медленная остановка с логированием',
                        'Сохранение состояния на диск'
                    ],
                    correct: 0,
                    explanation: 'Graceful shutdown: получаем сигнал SIGTERM → перестаём принимать новые запросы → ждём завершения текущих → останавливаемся. server.Shutdown(ctx) в Go реализует именно это.'
                }
            ]
        }
    ]
};
