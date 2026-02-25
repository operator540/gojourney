export default {
    id: '05-06',
    title: 'Контекст (context)',
    description: 'context.Context, WithCancel, WithTimeout, WithDeadline, WithValue, каскадная отмена',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Зачем нужен context?</h2>
                <p><code>context.Context</code> решает три задачи:</p>
                <ul>
                    <li><strong>Отмена</strong> — каскадная отмена горутин (отмена одного → отмена всех дочерних)</li>
                    <li><strong>Таймауты</strong> — автоматическая отмена через N секунд</li>
                    <li><strong>Передача значений</strong> — request-scoped данные (request ID, user ID)</li>
                </ul>
                <p>Context — <strong>первый параметр</strong> функций, работающих с I/O, сетью, БД.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'context.WithCancel',
            code: `package main

import (
    "context"
    "fmt"
    "time"
)

func worker(ctx context.Context, id int) {
    for {
        select {
        case <-ctx.Done():
            fmt.Printf("Воркер %d: остановлен (%v)\\n", id, ctx.Err())
            return
        default:
            fmt.Printf("Воркер %d: работаю...\\n", id)
            time.Sleep(200 * time.Millisecond)
        }
    }
}

func main() {
    ctx, cancel := context.WithCancel(context.Background())

    for i := 1; i <= 3; i++ {
        go worker(ctx, i)
    }

    time.Sleep(500 * time.Millisecond)
    cancel() // Отменяет ВСЕ горутины с этим ctx

    time.Sleep(100 * time.Millisecond)
    fmt.Println("Все воркеры остановлены")
}`,
            explanation: 'cancel() закрывает ctx.Done() канал. Все горутины, проверяющие ctx.Done(), завершатся. Это замена done-каналу.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'context.WithTimeout',
            code: `package main

import (
    "context"
    "fmt"
    "time"
)

func fetchData(ctx context.Context) (string, error) {
    select {
    case <-time.After(2 * time.Second): // имитация долгого запроса
        return "данные", nil
    case <-ctx.Done():
        return "", ctx.Err() // context.DeadlineExceeded
    }
}

func main() {
    // Таймаут 500ms
    ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
    defer cancel() // ВСЕГДА вызывайте cancel!

    result, err := fetchData(ctx)
    if err != nil {
        fmt.Println("Ошибка:", err) // context deadline exceeded
        return
    }
    fmt.Println("Результат:", result)
}`,
            explanation: 'WithTimeout автоматически отменяет ctx через указанное время. defer cancel() обязателен для освобождения ресурсов.'
        },
        {
            type: 'info-box',
            variant: 'important',
            content: '<p><strong>ВСЕГДА вызывайте cancel()!</strong> Даже если контекст истёк по таймауту. Используйте <code>defer cancel()</code> сразу после создания. Иначе — утечка ресурсов.</p>'
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph TD
    BG["context.Background()"] --> C1["WithCancel"]
    BG --> C2["WithTimeout(5s)"]
    BG --> C3["WithDeadline(time)"]
    C2 --> C4["WithValue(key, val)"]
    C1 -->|"cancel()"| D["ctx.Done() закрыт"]
    C2 -->|"5s истекло"| D
    D --> E["Все дочерние отменены"]
    style BG fill:#00add8,color:#fff
    style D fill:#ce3263,color:#fff`,
            caption: 'Каскадная отмена: отмена родительского контекста отменяет все дочерние'
        },
        {
            type: 'theory',
            content: `
                <h2>context.WithValue</h2>
                <p>Для передачи request-scoped данных (ID запроса, ID пользователя). <strong>Не используйте для передачи обязательных параметров!</strong></p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'context.WithValue',
            code: `package main

import (
    "context"
    "fmt"
)

// Используйте свой тип ключа, не string!
type contextKey string

const requestIDKey contextKey = "requestID"

func processRequest(ctx context.Context) {
    reqID := ctx.Value(requestIDKey)
    fmt.Printf("[%v] Обработка запроса\\n", reqID)
}

func main() {
    ctx := context.Background()
    ctx = context.WithValue(ctx, requestIDKey, "req-12345")

    processRequest(ctx) // [req-12345] Обработка запроса
}`,
            explanation: 'Используйте свой тип ключа (не string) чтобы избежать коллизий. WithValue — для метаданных, не для бизнес-логики.'
        },
        {
            type: 'theory',
            content: `
                <h2>Правила использования Context</h2>
                <ul>
                    <li>Context — <strong>первый параметр</strong> функции: <code>func DoSomething(ctx context.Context, ...)</code></li>
                    <li><strong>Не храните</strong> ctx в структурах — передавайте как параметр</li>
                    <li><strong>Всегда</strong> вызывайте <code>cancel()</code> через defer</li>
                    <li>Используйте <code>context.Background()</code> в main и тестах</li>
                    <li>Используйте <code>context.TODO()</code> когда неясно какой ctx использовать</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Context в HTTP-обработчике',
            code: `package main

import (
    "context"
    "fmt"
    "net/http"
    "time"
)

func fetchFromDB(ctx context.Context, query string) (string, error) {
    select {
    case <-time.After(100 * time.Millisecond):
        return "результат для: " + query, nil
    case <-ctx.Done():
        return "", ctx.Err()
    }
}

func handler(w http.ResponseWriter, r *http.Request) {
    // r.Context() — контекст HTTP-запроса
    // Автоматически отменяется если клиент отключился
    ctx := r.Context()

    result, err := fetchFromDB(ctx, "SELECT * FROM users")
    if err != nil {
        http.Error(w, "таймаут", http.StatusGatewayTimeout)
        return
    }
    fmt.Fprint(w, result)
}`,
            explanation: 'HTTP-запрос предоставляет свой Context через r.Context(). Он отменяется при отключении клиента — и вся цепочка операций тоже.'
        },
        {
            type: 'editor',
            title: 'Практика: Таймаут с context',
            instructions: 'Напишите функцию search(ctx context.Context, query string) (string, error), которая имитирует поиск (300ms). Если контекст отменён до завершения — верните ctx.Err(). В main вызовите с таймаутом 200ms (ошибка) и 500ms (успех).',
            starterCode: `package main

import (
    "context"
    "fmt"
    "time"
)

func search(ctx context.Context, query string) (string, error) {
    // Используйте select с time.After и ctx.Done()
    // Ваш код здесь
    return "", nil
}

func main() {
    // Тест 1: таймаут 200ms (поиск не успеет — 300ms)
    ctx1, cancel1 := context.WithTimeout(context.Background(), 200*time.Millisecond)
    defer cancel1()
    result, err := search(ctx1, "golang")
    fmt.Println(result, err) // "" context deadline exceeded

    // Тест 2: таймаут 500ms (поиск успеет — 300ms)
    ctx2, cancel2 := context.WithTimeout(context.Background(), 500*time.Millisecond)
    defer cancel2()
    result, err = search(ctx2, "golang")
    fmt.Println(result, err) // Результат для: golang <nil>
}`,
            hints: [
                'select { case <-time.After(300*time.Millisecond): return result, nil; case <-ctx.Done(): return "", ctx.Err() }',
                'Результат: fmt.Sprintf("Результат для: %s", query)',
                'ctx.Err() вернёт context.DeadlineExceeded',
                'defer cancel() обязателен для обоих контекстов'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Где должен быть context.Context в сигнатуре функции?',
                    options: [
                        'Первый параметр',
                        'Последний параметр',
                        'В структуре',
                        'Глобальная переменная'
                    ],
                    correct: 0,
                    explanation: 'Конвенция Go: ctx context.Context — всегда первый параметр. Не храните ctx в структурах.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что произойдёт если не вызвать cancel()?',
                    options: [
                        'Утечка ресурсов (горутин)',
                        'panic',
                        'Ошибка компиляции',
                        'Ничего — Go сборщик мусора очистит'
                    ],
                    correct: 0,
                    explanation: 'Без cancel() дочерние горутины и таймеры не освободятся. Всегда: defer cancel().'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Чем WithTimeout отличается от WithDeadline?',
                    options: [
                        'Timeout — через N секунд, Deadline — к конкретному времени',
                        'Ничем',
                        'Timeout быстрее',
                        'Deadline нельзя отменить'
                    ],
                    correct: 0,
                    explanation: 'WithTimeout(5s) = через 5 секунд от сейчас. WithDeadline(time) = к конкретному моменту. Функционально эквивалентны.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Для чего НЕ следует использовать context.WithValue?',
                    options: [
                        'Для передачи обязательных параметров функции',
                        'Для request ID',
                        'Для ID пользователя из middleware',
                        'Для трейсинга'
                    ],
                    correct: 0,
                    explanation: 'WithValue — для метаданных (request ID, trace ID). Обязательные параметры должны быть явными аргументами функции.'
                }
            ]
        }
    ]
};
