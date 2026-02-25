export default {
    id: '05-03',
    title: 'Select',
    description: 'Мультиплексирование каналов, default, таймауты, fan-in паттерн — оркестровка конкурентных операций',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: Оператор коммутатора</h2>
                <p>Представьте оператора телефонной станции 1950-х годов, который сидит перед панелью из N разъёмов. На любой из них может прийти звонок. Оператор берёт тот, который пришёл первым. Если одновременно звонят несколько — выбирает любой. Если звонков нет и есть инструкция «не ждать» — говорит «занято» и идёт дальше.</p>
                <p><code>select</code> — это такой оператор для каналов Go.</p>

                <h2>Зачем select?</h2>
                <p>Горутина может ждать данных из множества каналов. Без <code>select</code> нет способа сказать «жди любого из этих событий». Нельзя заблокироваться одновременно на ch1 и ch2 — это два отдельных действия.</p>
                <p><code>select</code> решает задачу <strong>мультиплексирования</strong>: ожидание первого готового канала из набора.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Базовый select — первый готовый выигрывает',
            code: `package main

import (
    "fmt"
    "time"
)

func slow(d time.Duration) <-chan string {
    ch := make(chan string)
    go func() {
        time.Sleep(d)
        ch <- fmt.Sprintf("готово за %v", d)
    }()
    return ch
}

func main() {
    ch1 := slow(100 * time.Millisecond)
    ch2 := slow(200 * time.Millisecond)
    ch3 := slow(300 * time.Millisecond)

    // select блокируется пока хотя бы один канал не готов
    select {
    case msg := <-ch1:
        fmt.Println("ch1:", msg)
    case msg := <-ch2:
        fmt.Println("ch2:", msg)
    case msg := <-ch3:
        fmt.Println("ch3:", msg)
    }
    // ch1: готово за 100ms — ch1 самый быстрый

    // Если несколько готовы одновременно — выбирается СЛУЧАЙНАЯ ветка
    // Go намеренно рандомизирует, чтобы не создавать скрытых приоритетов
    ch4 := make(chan int, 1)
    ch5 := make(chan int, 1)
    ch4 <- 1
    ch5 <- 2

    for i := 0; i < 4; i++ {
        select {
        case v := <-ch4:
            fmt.Println("ch4:", v)
        case v := <-ch5:
            fmt.Println("ch5:", v)
        }
    }
}`,
            explanation: 'select блокируется пока хотя бы одна ветка не готова. При нескольких готовых — случайный выбор (псевдослучайный, deterministic при одном готовом). Это принципиально: не полагайтесь на порядок веток.'
        },
        {
            type: 'theory',
            content: `
                <h2>Таймауты с time.After</h2>
                <p><code>time.After(d)</code> возвращает <code>&lt;-chan time.Time</code> — канал, в который придёт значение через <code>d</code>. В сочетании с <code>select</code> это идиоматичный способ задать таймаут операции.</p>

                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Подход</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Использование</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Утечка памяти</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>time.After(d)</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Одиночный таймаут</td>
                            <td style="padding:10px;border:1px solid var(--border)">Если не сработал — таймер держится до срабатывания</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>time.NewTimer</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Можно отменить через Stop()</td>
                            <td style="padding:10px;border:1px solid var(--border)">Нет при вызове Stop()</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>context.WithTimeout</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Каскадные таймауты</td>
                            <td style="padding:10px;border:1px solid var(--border)">Нет при defer cancel()</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Таймаут операции через select',
            code: `package main

import (
    "errors"
    "fmt"
    "time"
)

var ErrTimeout = errors.New("операция превысила таймаут")

func fetchData(url string) <-chan string {
    result := make(chan string, 1)
    go func() {
        // Имитируем сетевой запрос — занимает 300ms
        time.Sleep(300 * time.Millisecond)
        result <- "данные от " + url
    }()
    return result
}

func fetchWithTimeout(url string, timeout time.Duration) (string, error) {
    result := fetchData(url)

    select {
    case data := <-result:
        return data, nil
    case <-time.After(timeout):
        return "", ErrTimeout
    }
}

func main() {
    // Достаточный таймаут: 500ms > 300ms
    data, err := fetchWithTimeout("https://api.example.com", 500*time.Millisecond)
    fmt.Printf("Результат: %q, Ошибка: %v\\n", data, err)
    // Результат: "данные от https://api.example.com", Ошибка: <nil>

    // Недостаточный таймаут: 100ms < 300ms
    data, err = fetchWithTimeout("https://slow.example.com", 100*time.Millisecond)
    fmt.Printf("Результат: %q, Ошибка: %v\\n", data, err)
    // Результат: "", Ошибка: операция превысила таймаут
}`,
            explanation: 'time.After создаёт канал-таймер. Если result готов раньше — возвращаем данные. Если таймер сработал первым — возвращаем ошибку. Буфер 1 у result предотвращает утечку горутины: она сможет записать в канал даже если мы уже вернули ошибку.'
        },
        {
            type: 'theory',
            content: `
                <h2>default — неблокирующие операции</h2>
                <p>Ветка <code>default</code> в select выполняется <strong>немедленно</strong>, если ни один канал не готов. Это делает select неблокирующим — горутина не ждёт, а идёт по ветке default.</p>
                <p>Применения:</p>
                <ul>
                    <li><strong>Try-receive</strong>: проверить канал не блокируясь</li>
                    <li><strong>Try-send</strong>: отправить или пропустить если канал занят</li>
                    <li><strong>Polling</strong>: опрос сигнального канала без блокировки</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'default — try-send и try-receive',
            code: `package main

import (
    "fmt"
    "time"
)

func tryReceive(ch <-chan int) (int, bool) {
    select {
    case val := <-ch:
        return val, true
    default:
        return 0, false // канал пуст — не блокируемся
    }
}

func trySend(ch chan<- int, val int) bool {
    select {
    case ch <- val:
        return true // отправлено
    default:
        return false // канал занят — не блокируемся
    }
}

func main() {
    ch := make(chan int, 2)

    // Try-send: отправляем не блокируясь
    fmt.Println(trySend(ch, 1))   // true
    fmt.Println(trySend(ch, 2))   // true
    fmt.Println(trySend(ch, 3))   // false — буфер полон

    // Try-receive: читаем не блокируясь
    fmt.Println(tryReceive(ch))   // 1 true
    fmt.Println(tryReceive(ch))   // 2 true
    fmt.Println(tryReceive(ch))   // 0 false — канал пуст

    // --- Polling done-канала в воркере ---
    done := make(chan struct{})
    go func() {
        time.Sleep(500 * time.Millisecond)
        close(done)
    }()

    for {
        select {
        case <-done:
            fmt.Println("Готово!")
            return
        default:
            fmt.Println("Работаю...")
            time.Sleep(150 * time.Millisecond)
        }
    }
}`,
            explanation: 'default превращает select в неблокирующую проверку. trySend/tryReceive — распространённые паттерны для work-stealing, rate limiting и heartbeat. Polling через select{case <-done: return; default: ...} — стандартный паттерн воркера.'
        },
        {
            type: 'theory',
            content: `
                <h2>Fan-in — объединение каналов</h2>
                <p><strong>Fan-in</strong> (мультиплексирование) — слияние нескольких каналов в один. select идеально подходит для реализации: ждём данные от любого из входных каналов и отправляем в единый выходной.</p>
                <p>Это мощный паттерн для агрегации результатов от нескольких параллельных источников.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Fan-in через select + горутины',
            code: `package main

import (
    "fmt"
    "sync"
    "time"
)

// merge объединяет N receive-only каналов в один
func merge(channels ...<-chan string) <-chan string {
    out := make(chan string)
    var wg sync.WaitGroup

    // Для каждого входного канала запускаем горутину-форвардер
    forward := func(ch <-chan string) {
        defer wg.Done()
        for val := range ch {
            out <- val
        }
    }

    wg.Add(len(channels))
    for _, ch := range channels {
        go forward(ch)
    }

    // Закрываем out когда все форвардеры завершились
    go func() {
        wg.Wait()
        close(out)
    }()

    return out
}

func source(name string, interval time.Duration) <-chan string {
    ch := make(chan string)
    go func() {
        defer close(ch)
        for i := 0; i < 3; i++ {
            time.Sleep(interval)
            ch <- fmt.Sprintf("[%s] сообщение %d", name, i+1)
        }
    }()
    return ch
}

func main() {
    // Три независимых источника с разными интервалами
    fast := source("быстрый", 100*time.Millisecond)
    medium := source("средний", 200*time.Millisecond)
    slow := source("медленный", 350*time.Millisecond)

    // Объединяем в один поток
    for msg := range merge(fast, medium, slow) {
        fmt.Println(msg)
    }
    // Порядок смешанный — данные приходят по мере готовности
}`,
            explanation: 'merge использует одну горутину на канал — каждая форвардирует данные в общий out. WaitGroup отслеживает завершение всех форвардеров. close(out) происходит только когда все источники закрыты. Это потокобезопасно и корректно обрабатывает закрытие каналов.'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<p><strong>Типичные ошибки с select:</strong></p>
            <ul>
                <li><strong>select без default на nil-канале</strong> — <code>case &lt;-nilChan</code> никогда не выполнится (блокирует вечно)</li>
                <li><strong>time.After в цикле</strong> — каждая итерация создаёт новый таймер, старые не освобождаются. Используйте <code>time.NewTimer</code> с <code>Reset()</code></li>
                <li><strong>Полагаться на порядок</strong> — при нескольких готовых ветках выбор случаен</li>
            </ul>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'select с отменой — graceful shutdown',
            code: `package main

import (
    "fmt"
    "time"
)

type Event struct {
    Type    string
    Payload string
}

func eventStream(done <-chan struct{}) <-chan Event {
    events := make(chan Event)
    go func() {
        defer close(events)
        ticker := time.NewTicker(150 * time.Millisecond)
        defer ticker.Stop()

        count := 0
        for {
            select {
            case <-done:
                fmt.Println("eventStream: получен сигнал остановки")
                return
            case t := <-ticker.C:
                count++
                select {
                case events <- Event{
                    Type:    "tick",
                    Payload: fmt.Sprintf("событие #%d в %v", count, t.Format("15:04:05.000")),
                }:
                default:
                    // Получатель не успевает — пропускаем событие
                    fmt.Println("Событие пропущено (получатель занят)")
                }
            }
        }
    }()
    return events
}

func main() {
    done := make(chan struct{})

    events := eventStream(done)

    // Обрабатываем события 600ms потом останавливаем
    timeout := time.After(600 * time.Millisecond)
    for {
        select {
        case event, ok := <-events:
            if !ok {
                fmt.Println("Поток событий закрыт")
                return
            }
            fmt.Printf("Получено: %s — %s\\n", event.Type, event.Payload)
        case <-timeout:
            fmt.Println("Время вышло, останавливаем...")
            close(done)
        }
    }
}`,
            explanation: 'Комбинация select с done-каналом и ticker — классика Go. Внутренний select с default для отправки предотвращает блокировку если получатель медленный. Внешний select с timeout инициирует graceful shutdown через close(done).'
        },
        {
            type: 'editor',
            title: 'Практика: Гонка запросов',
            instructions: 'Реализуйте функцию race(urls []string) (string, error), которая запускает запросы к нескольким URL параллельно и возвращает результат первого успешного. Если все провалились — возвращает ошибку. Используйте select для получения первого результата.',
            starterCode: `package main

import (
    "errors"
    "fmt"
    "time"
)

// simulate имитирует HTTP-запрос с задержкой
func simulate(url string, delay time.Duration, fail bool) <-chan string {
    ch := make(chan string, 1)
    go func() {
        time.Sleep(delay)
        if fail {
            ch <- "" // пустая строка = ошибка
        } else {
            ch <- "ответ от " + url
        }
    }()
    return ch
}

func race(results []<-chan string) (string, error) {
    // Используйте select для получения первого непустого результата
    // Подсказка: можно использовать цикл for + select
    return "", errors.New("не реализовано")
}

func main() {
    // Три "запроса": быстрый неудачный, средний успешный, медленный успешный
    ch1 := simulate("server-1", 50*time.Millisecond, true)    // провал
    ch2 := simulate("server-2", 150*time.Millisecond, false)  // успех
    ch3 := simulate("server-3", 300*time.Millisecond, false)  // успех

    result, err := race([]<-chan string{ch1, ch2, ch3})
    fmt.Println(result, err)
    // ожидается: ответ от server-2 <nil>
}`,
            hints: [
                'В select можно проверять несколько каналов: case v := <-results[0]:, case v := <-results[1]:',
                'Для динамического числа каналов используйте reflect.Select или упростите — используйте merge + первый непустой',
                'Простой вариант: объедините все в один канал через merge, читайте первый непустой',
                'Не забудьте про таймаут — что если все зависнут?'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что делает select если несколько веток готовы одновременно?',
                    options: [
                        'Выбирает случайную (псевдослучайно)',
                        'Выполняет первую по порядку в коде',
                        'Выполняет все готовые ветки',
                        'Ошибка компиляции — это запрещено'
                    ],
                    correct: 0,
                    explanation: 'Go намеренно рандомизирует выбор среди готовых веток. Это сделано чтобы программисты не полагались на неявный порядок приоритетов.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что делает ветка default в select?',
                    options: [
                        'Выполняется немедленно если ни один канал не готов — делает select неблокирующим',
                        'Обработчик ошибок канала',
                        'Выполняется после всех остальных веток',
                        'Используется для nil-каналов'
                    ],
                    correct: 0,
                    explanation: 'default делает select неблокирующим. Без default — select ждёт. С default — немедленно переходит в default если каналы не готовы.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'time.After(5*time.Second) возвращает:',
                    options: [
                        '<-chan time.Time — канал, который получит значение через 5 секунд',
                        'time.Duration',
                        'bool',
                        'error если время вышло'
                    ],
                    correct: 0,
                    explanation: 'time.After возвращает receive-only канал. Через 5 секунд в него придёт текущее время. Идеально для таймаутов в select.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Почему time.After в цикле может вызвать утечку памяти?',
                    options: [
                        'Каждый вызов создаёт новый таймер, который не освобождается до срабатывания',
                        'time.After не поддерживает циклы',
                        'Таймеры накапливаются в глобальном слайсе',
                        'Это не вызывает утечки'
                    ],
                    correct: 0,
                    explanation: 'Если таймаут не срабатывает (основная операция завершается раньше), таймер держится в памяти до своего срабатывания. В цикле — сотни таймеров. Решение: time.NewTimer + Stop() или context.WithTimeout.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Что произойдёт с select если все каналы — nil?',
                    options: [
                        'Заблокируется навсегда (если нет default)',
                        'panic',
                        'Немедленно завершится',
                        'Ошибка компиляции'
                    ],
                    correct: 0,
                    explanation: 'case <-nilChan никогда не готов. Select с только nil-каналами без default заблокируется навсегда — что приведёт к deadlock если это единственная горутина.'
                },
                {
                    id: 'q6',
                    type: 'multiple',
                    question: 'Когда использовать select с default? (несколько ответов)',
                    options: [
                        'Неблокирующая проверка наличия данных в канале',
                        'Попытка отправки без блокировки (try-send)',
                        'Polling сигнального канала в цикле',
                        'Когда нужна гарантия доставки'
                    ],
                    correct: [0, 1, 2],
                    explanation: 'default делает операцию неблокирующей. Для гарантии доставки default не подходит — нужен select без default или буферизованный канал.'
                }
            ]
        }
    ]
};
