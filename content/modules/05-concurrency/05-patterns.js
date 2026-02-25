export default {
    id: '05-05',
    title: 'Паттерны конкурентности',
    description: 'Fan-out/fan-in, worker pool, pipeline, rate limiting, semaphore',
    estimatedTime: 25,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Конкурентные паттерны Go</h2>
                <p>Go предоставляет простые примитивы (горутины, каналы, select), из которых строятся мощные паттерны. Рассмотрим самые важные.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Worker Pool</h2>
                <p>Фиксированное число воркеров обрабатывают задачи из общей очереди. Контролирует степень параллелизма.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Worker Pool',
            code: `package main

import (
    "fmt"
    "sync"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    for job := range jobs {
        result := job * job // обработка
        fmt.Printf("Воркер %d: %d -> %d\\n", id, job, result)
        results <- result
    }
}

func main() {
    const numWorkers = 3
    const numJobs = 10

    jobs := make(chan int, numJobs)
    results := make(chan int, numJobs)

    // Запуск воркеров
    var wg sync.WaitGroup
    for i := 1; i <= numWorkers; i++ {
        wg.Add(1)
        go worker(i, jobs, results, &wg)
    }

    // Отправка задач
    for j := 1; j <= numJobs; j++ {
        jobs <- j
    }
    close(jobs) // Сигнал воркерам: задачи закончились

    // Ожидание и закрытие results
    go func() {
        wg.Wait()
        close(results)
    }()

    // Сбор результатов
    for r := range results {
        fmt.Println("Результат:", r)
    }
}`,
            explanation: '3 воркера обрабатывают 10 задач параллельно. close(jobs) сигнализирует о конце работы. for range читает до закрытия.'
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph LR
    P["Producer"] --> Q["jobs channel"]
    Q --> W1["Worker 1"]
    Q --> W2["Worker 2"]
    Q --> W3["Worker 3"]
    W1 --> R["results channel"]
    W2 --> R
    W3 --> R
    R --> C["Consumer"]
    style P fill:#d97706,color:#fff
    style Q fill:#00add8,color:#fff
    style R fill:#10b981,color:#fff
    style C fill:#ce3263,color:#fff`,
            caption: 'Worker Pool: N воркеров обрабатывают задачи из общей очереди'
        },
        {
            type: 'theory',
            content: `
                <h2>Fan-out / Fan-in</h2>
                <p><strong>Fan-out</strong> — одна горутина распределяет работу нескольким. <strong>Fan-in</strong> — несколько горутин отправляют результаты в один канал.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Fan-in: объединение каналов',
            code: `package main

import (
    "fmt"
    "sync"
)

func merge(channels ...<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup

    // Для каждого входного канала — горутина
    for _, ch := range channels {
        wg.Add(1)
        go func(c <-chan int) {
            defer wg.Done()
            for val := range c {
                out <- val
            }
        }(ch)
    }

    // Закрываем out когда все входные каналы прочитаны
    go func() {
        wg.Wait()
        close(out)
    }()

    return out
}

func generate(start, count int) <-chan int {
    ch := make(chan int)
    go func() {
        for i := start; i < start+count; i++ {
            ch <- i
        }
        close(ch)
    }()
    return ch
}

func main() {
    ch1 := generate(1, 3)   // 1, 2, 3
    ch2 := generate(10, 3)  // 10, 11, 12
    ch3 := generate(100, 3) // 100, 101, 102

    for val := range merge(ch1, ch2, ch3) {
        fmt.Println(val)
    }
}`,
            explanation: 'merge объединяет несколько каналов в один. Порядок непредсказуем — это нормально для конкурентного кода.'
        },
        {
            type: 'theory',
            content: `
                <h2>Семафор — ограничение конкурентности</h2>
                <p>Буферизованный канал можно использовать как <strong>семафор</strong> для ограничения числа одновременных операций.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Семафор через буферизованный канал',
            code: `package main

import (
    "fmt"
    "sync"
    "time"
)

func main() {
    // Семафор: максимум 3 одновременных операции
    sem := make(chan struct{}, 3)
    var wg sync.WaitGroup

    for i := 1; i <= 10; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()

            sem <- struct{}{} // Захват слота (блокируется если 3 заняты)
            defer func() { <-sem }() // Освобождение слота

            fmt.Printf("Задача %d: работаю\\n", id)
            time.Sleep(100 * time.Millisecond)
            fmt.Printf("Задача %d: готово\\n", id)
        }(i)
    }

    wg.Wait()
}`,
            explanation: 'Буфер на 3 = максимум 3 горутины одновременно. Остальные ждут освобождения слота. Простой и эффективный паттерн.'
        },
        {
            type: 'theory',
            content: `
                <h2>errgroup — горутины с ошибками</h2>
                <p>Пакет <code>golang.org/x/sync/errgroup</code> объединяет WaitGroup и обработку ошибок. Возвращает первую ошибку.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'errgroup',
            code: `package main

import (
    "fmt"
    "errors"
    "golang.org/x/sync/errgroup"
)

func fetchUser(id int) (string, error) {
    if id <= 0 {
        return "", errors.New("невалидный ID")
    }
    return fmt.Sprintf("User-%d", id), nil
}

func main() {
    var g errgroup.Group
    results := make([]string, 3)

    for i, id := range []int{1, 2, 3} {
        i, id := i, id // захват переменных
        g.Go(func() error {
            user, err := fetchUser(id)
            if err != nil {
                return fmt.Errorf("user %d: %w", id, err)
            }
            results[i] = user
            return nil
        })
    }

    if err := g.Wait(); err != nil {
        fmt.Println("Ошибка:", err)
        return
    }

    fmt.Println("Результаты:", results)
}`,
            explanation: 'errgroup.Group — WaitGroup + error handling. g.Go() запускает горутину. g.Wait() ждёт все и возвращает первую ошибку.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p><strong>Выбор паттерна:</strong><br>• Фиксированный параллелизм → Worker Pool<br>• Объединение результатов → Fan-in<br>• Ограничение нагрузки → Семафор<br>• Горутины с ошибками → errgroup</p>'
        },
        {
            type: 'editor',
            title: 'Практика: Worker Pool',
            instructions: 'Реализуйте worker pool из 3 воркеров, которые обрабатывают 9 задач. Каждая задача — удвоение числа. Соберите все результаты в слайс.',
            starterCode: `package main

import (
    "fmt"
    "sync"
)

func doubleWorker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    // Читайте из jobs, удваивайте, отправляйте в results
}

func main() {
    jobs := make(chan int, 9)
    results := make(chan int, 9)

    // Запустите 3 воркера
    var wg sync.WaitGroup
    // Ваш код здесь

    // Отправьте задачи 1-9
    for i := 1; i <= 9; i++ {
        jobs <- i
    }
    close(jobs)

    // Дождитесь и закройте results
    // Ваш код здесь

    // Соберите результаты
    for r := range results {
        fmt.Println(r)
    }
}`,
            hints: [
                'for job := range jobs { results <- job * 2 }',
                'Запуск: for i := 0; i < 3; i++ { wg.Add(1); go doubleWorker(i, jobs, results, &wg) }',
                'Закрытие: go func() { wg.Wait(); close(results) }()',
                'for range results автоматически завершится при close'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что такое Worker Pool?',
                    options: [
                        'Фиксированное число горутин обрабатывают задачи из общей очереди',
                        'Пул подключений к БД',
                        'Кэш горутин',
                        'Коллекция каналов'
                    ],
                    correct: 0,
                    explanation: 'Worker Pool = N воркеров (горутин) + канал задач + канал результатов. Контролирует параллелизм.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Как ограничить конкурентность до N горутин?',
                    options: [
                        'Буферизованный канал размера N (семафор)',
                        'GOMAXPROCS(N)',
                        'sync.Limit(N)',
                        'runtime.SetMaxGoroutines(N)'
                    ],
                    correct: 0,
                    explanation: 'Буферизованный канал размера N — простейший семафор. Горутины захватывают и освобождают слоты.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Что делает Fan-in паттерн?',
                    options: [
                        'Объединяет несколько каналов в один',
                        'Распределяет работу по воркерам',
                        'Удваивает пропускную способность',
                        'Фильтрует данные'
                    ],
                    correct: 0,
                    explanation: 'Fan-in (merge) объединяет данные из нескольких каналов в один выходной.'
                }
            ]
        }
    ]
};
