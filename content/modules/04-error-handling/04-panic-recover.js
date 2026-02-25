export default {
    id: '04-04',
    title: 'Panic и recover',
    description: 'panic, recover, defer+recover паттерн, HTTP middleware защита, когда panic уместен — аварийные ситуации vs обычные ошибки',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: Пожарная сигнализация</h2>
                <p>В офисе есть два способа сообщить о проблеме. Первый — обычная почта: «Сломался принтер, пришли мастера». Второй — пожарная сигнализация: стекло разбито, тревога, эвакуация всего здания.</p>
                <p>В Go <code>error</code> — это обычная почта. <code>panic</code> — пожарная сигнализация. Сигнализацию не включают когда закончился тонер. Она для реально экстренных ситуаций.</p>
                <p><code>recover</code> — это пожарный на посту, который может перехватить сигнал и не дать сработать эвакуации. Но он должен дежурить <em>заранее</em> (через <code>defer</code>) — вызвать его постфактум нельзя.</p>

                <h2>Что такое panic?</h2>
                <p><code>panic</code> — аварийная остановка нормального выполнения. Когда происходит panic:</p>
                <ol>
                    <li>Текущая функция немедленно прекращает выполнение</li>
                    <li>Все <code>defer</code> в текущей функции выполняются (в обратном порядке)</li>
                    <li>Panic «поднимается» к вызывающей функции — и там тоже выполняются её defer</li>
                    <li>И так до <code>main()</code>, после чего программа падает с stack trace</li>
                </ol>

                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Причина panic</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Пример</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Как избежать</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Выход за границы слайса</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>s[10]</code> при len=5</td>
                            <td style="padding:10px;border:1px solid var(--border)">Проверять длину</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Nil pointer dereference</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>var p *int; *p</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Проверять на nil</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Запись в nil map</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>var m map[string]int; m["k"]=1</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Инициализировать через make</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Закрытие закрытого канала</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>close(ch)</code> дважды</td>
                            <td style="padding:10px;border:1px solid var(--border)">Закрывать только один раз</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Отправка в закрытый канал</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>ch <- v</code> после close</td>
                            <td style="padding:10px;border:1px solid var(--border)">Контролировать жизненный цикл</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Анатомия panic — порядок выполнения',
            code: `package main

import "fmt"

func c() {
    defer fmt.Println("defer в c() — выполняется при панике")
    fmt.Println("c(): начало")
    panic("что-то сломалось в c()!")
    fmt.Println("c(): НИКОГДА не дойдём сюда")
}

func b() {
    defer fmt.Println("defer в b() — тоже выполняется")
    fmt.Println("b(): вызываем c()")
    c() // панике позволяем подняться
    fmt.Println("b(): НИКОГДА не дойдём сюда")
}

func main() {
    defer fmt.Println("defer в main() — выполняется последним")
    fmt.Println("main(): вызываем b()")
    b()
    fmt.Println("main(): НИКОГДА не дойдём сюда")
}

// Вывод:
// main(): вызываем b()
// b(): вызываем c()
// c(): начало
// defer в c() — выполняется при панике
// defer в b() — тоже выполняется
// defer в main() — выполняется последним
// goroutine 1 [running]:
// panic: что-то сломалось в c()!
// ... stack trace ...`,
            explanation: 'При panic defer выполняются в каждой функции стека вызовов (в обратном порядке внутри одной функции). Это гарантирует очистку ресурсов даже при аварии. Сам код после panic() не выполняется никогда.'
        },
        {
            type: 'theory',
            content: `
                <h2>recover — перехват паники</h2>
                <p><code>recover()</code> останавливает панику и возвращает значение, переданное в <code>panic()</code>. Критически важные правила:</p>
                <ul>
                    <li><code>recover()</code> работает <strong>ТОЛЬКО внутри defer</strong> — вне defer всегда возвращает nil</li>
                    <li>После recover программа продолжает работу с точки <em>после</em> вызвавшей паники функции</li>
                    <li>recover не перехватывает панику в <em>других</em> горутинах</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'recover — базовый паттерн',
            code: `package main

import (
    "errors"
    "fmt"
)

// safeDiv безопасно делит — превращает panic в error
func safeDiv(a, b int) (result int, err error) {
    // defer + анонимная функция + recover — стандартный паттерн
    defer func() {
        if r := recover(); r != nil {
            // r — это то, что передали в panic()
            err = fmt.Errorf("recovered panic: %v", r)
            // result останется 0 (нулевое значение)
        }
    }()

    return a / b, nil // при b==0 будет panic: runtime error: integer divide by zero
}

// safeGet безопасно обращается к слайсу
func safeGet[T any](s []T, i int) (val T, err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("index out of range: %d (len=%d)", i, len(s))
        }
    }()
    return s[i], nil
}

func main() {
    // Нормальное деление
    r, err := safeDiv(10, 2)
    fmt.Printf("10/2 = %d, err = %v\\n", r, err) // 5, nil

    // Деление на ноль — recover перехватывает
    r, err = safeDiv(10, 0)
    fmt.Printf("10/0 = %d, err = %v\\n", r, err)
    // 0, recovered panic: runtime error: integer divide by zero

    // Выход за границу слайса
    nums := []int{1, 2, 3}
    val, err := safeGet(nums, 10)
    fmt.Printf("nums[10] = %d, err = %v\\n", val, err)
    // 0, index out of range: 10 (len=3)

    // Программа жива после всех паник!
    fmt.Println("Программа продолжает работать нормально")

    // Проверка: recover вне defer ВСЕГДА возвращает nil
    r2 := recover() // вызван вне defer — бесполезно
    fmt.Println("recover() вне defer:", r2) // nil
    _ = errors.New("просто пример")
}`,
            explanation: 'Паттерн defer func() { if r := recover(); r != nil { ... } }() — стандартный способ перехвата паники. Именованный возврат (result int, err error) позволяет modify возвращаемые значения из defer. recover() вне defer всегда nil — частая ошибка новичков.'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<p><strong>recover() работает ТОЛЬКО внутри defer!</strong></p>
            <pre style="background:var(--surface-2);padding:8px;border-radius:4px;margin-top:8px">// Правильно
defer func() {
    if r := recover(); r != nil { /* ... */ }
}()

// НЕПРАВИЛЬНО — r всегда nil
r := recover() // вне defer
if r != nil { /* никогда не выполнится */ }

// НЕПРАВИЛЬНО — recover в отдельной функции не работает
func tryRecover() {
    recover() // не перехватит панику вызывающей функции!
}</pre>`
        },
        {
            type: 'theory',
            content: `
                <h2>Когда panic уместен?</h2>
                <p>В Go <code>panic</code> используется <strong>крайне редко</strong>. Философия: ошибки — обычные значения, их нужно обрабатывать явно. Но есть легитимные случаи:</p>

                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Случай</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Пример</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Почему panic OK</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Must-функции</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>template.Must</code>, <code>regexp.MustCompile</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Ошибка = баг в коде разработчика</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Нарушение инварианта</td>
                            <td style="padding:10px;border:1px solid var(--border)">Недопустимое состояние структуры</td>
                            <td style="padding:10px;border:1px solid var(--border)">«Этого никогда не должно быть»</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">init() / main()</td>
                            <td style="padding:10px;border:1px solid var(--border)">Нет подключения к БД при старте</td>
                            <td style="padding:10px;border:1px solid var(--border)">Без этого программа нерабочая</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Никогда</td>
                            <td style="padding:10px;border:1px solid var(--border)">Файл не найден, сеть недоступна</td>
                            <td style="padding:10px;border:1px solid var(--border)">Ожидаемые ситуации — только error</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Must-паттерн и инварианты',
            code: `package main

import (
    "fmt"
    "regexp"
)

// Must-паттерн: если шаблон неверный — это баг разработчика
var emailRe = regexp.MustCompile(\`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$\`)

// Наш Must — обёртка для инициализации
func mustPositive(n int, name string) int {
    if n <= 0 {
        panic(fmt.Sprintf("инвариант нарушен: %s должно быть > 0, получили %d", name, n))
    }
    return n
}

// ✅ Корректное использование panic
type Config struct {
    Workers int
    Timeout int
}

func NewConfig(workers, timeout int) Config {
    return Config{
        Workers: mustPositive(workers, "workers"), // баг в коде вызывающего
        Timeout: mustPositive(timeout, "timeout"),
    }
}

// ✅ Инвариант структуры
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Pop() T {
    if len(s.items) == 0 {
        panic("Pop вызван на пустом стеке") // нарушение контракта
    }
    n := len(s.items) - 1
    val := s.items[n]
    s.items = s.items[:n]
    return val
}

// ❌ Никогда не делайте так
func readFile(path string) []byte {
    // data, err := os.ReadFile(path)
    // if err != nil {
    //     panic(err) // ПЛОХО: файл может не существовать — это не баг
    // }
    // return data
    return nil // правильно: вернуть ([]byte, error)
}

func main() {
    // Must компилирует regex — если невалидный regex, это баг разработчика
    matched := emailRe.MatchString("user@example.com")
    fmt.Println("Email valid:", matched) // true

    // Config с инвариантом
    cfg := NewConfig(4, 30)
    fmt.Printf("Workers: %d, Timeout: %d\\n", cfg.Workers, cfg.Timeout)

    // Это запаникует с понятным сообщением (баг вызывающего)
    // NewConfig(-1, 30) → panic: инвариант нарушен: workers должно быть > 0
}`,
            explanation: 'Must-паттерн — если операция провалилась при инициализации, это баг разработчика, не рантайм-ошибка. regexp.MustCompile("невалидный[") запаникует при компиляции программы — что правильно. Инварианты Pop() сигнализируют о неправильном использовании API.'
        },
        {
            type: 'theory',
            content: `
                <h2>Защита горутин и HTTP middleware</h2>
                <p>Паника в горутине, которая не перехвачена, убивает <strong>всю программу</strong>. Это особенно критично для серверов — один плохой запрос не должен валить весь HTTP-сервер.</p>
                <p>Идиоматический паттерн: каждая горутина сама защищает себя через <code>defer/recover</code>. Для HTTP — middleware-обёртка для всех обработчиков.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'HTTP middleware: защита от паник',
            code: `package main

import (
    "fmt"
    "log"
    "net/http"
    "runtime/debug"
)

// RecoveryMiddleware перехватывает panic в обработчиках
// и возвращает 500 вместо краша сервера
func RecoveryMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if rec := recover(); rec != nil {
                // Логируем panic со стек-трейсом
                log.Printf("PANIC: %v\\n%s", rec, debug.Stack())

                // Клиент получает 500, сервер продолжает работать
                http.Error(w, "Internal Server Error", http.StatusInternalServerError)
            }
        }()
        next.ServeHTTP(w, r)
    })
}

// Обработчик с намеренной паникой (имитация бага)
func badHandler(w http.ResponseWriter, r *http.Request) {
    var data []int
    fmt.Fprint(w, data[10]) // panic: index out of range — баг в коде
}

// Нормальный обработчик
func goodHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, "OK")
}

// safeGo — запуск горутины с защитой от паники
func safeGo(fn func(), onPanic func(r interface{})) {
    go func() {
        defer func() {
            if r := recover(); r != nil {
                if onPanic != nil {
                    onPanic(r)
                } else {
                    log.Printf("goroutine panic: %v\\n%s", r, debug.Stack())
                }
            }
        }()
        fn()
    }()
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/bad", badHandler)
    mux.HandleFunc("/good", goodHandler)

    // Оборачиваем весь mux в middleware
    protected := RecoveryMiddleware(mux)

    fmt.Println("Сервер на :8080")
    fmt.Println("GET /bad  → panic → 500 (сервер жив!)")
    fmt.Println("GET /good → OK")

    // http.ListenAndServe(":8080", protected)

    // --- safeGo в действии ---
    safeGo(func() {
        panic("горутина упала!")
    }, func(r interface{}) {
        fmt.Printf("Горутина запаниковала: %v (программа жива)\\n", r)
    })

    // Даём горутине время
    import_time_sleep(100) // имитация
}`,
            explanation: 'RecoveryMiddleware — стандартный паттерн в Go HTTP серверах (chi, gin, echo все имеют встроенный). debug.Stack() даёт stack trace для логов. safeGo — обёртка для горутин с panic-recovery. Без неё один плохой запрос убьёт весь сервер.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'safeGo — реальная реализация',
            code: `package main

import (
    "fmt"
    "log"
    "runtime/debug"
    "sync"
    "time"
)

// safeGo запускает горутину, перехватывая любую панику
func safeGo(fn func()) {
    go func() {
        defer func() {
            if r := recover(); r != nil {
                log.Printf("goroutine panic: %v\\n%s", r, debug.Stack())
                // В реальном коде: метрика, алерт, restart горутины
            }
        }()
        fn()
    }()
}

func main() {
    var wg sync.WaitGroup

    // Горутина 1: работает нормально
    wg.Add(1)
    safeGo(func() {
        defer wg.Done()
        fmt.Println("Горутина 1: работаю...")
        time.Sleep(50 * time.Millisecond)
        fmt.Println("Горутина 1: готово")
    })

    // Горутина 2: паникует — но НЕ убивает программу
    wg.Add(1)
    safeGo(func() {
        defer wg.Done()
        fmt.Println("Горутина 2: начинаю...")
        time.Sleep(20 * time.Millisecond)
        panic("критическая ошибка в горутине 2!")
        // safeGo перехватит панику, залогирует, программа продолжит
    })

    // Горутина 3: тоже работает нормально
    wg.Add(1)
    safeGo(func() {
        defer wg.Done()
        fmt.Println("Горутина 3: работаю независимо")
        time.Sleep(80 * time.Millisecond)
        fmt.Println("Горутина 3: завершена")
    })

    wg.Wait()
    fmt.Println("Все горутины завершены. Программа жива!")
}`,
            explanation: 'Без safeGo паника в горутине 2 убила бы программу — горутины 1 и 3 никогда не завершились бы. С safeGo паника логируется, горутина завершается, остальные работают. В production: добавляют метрики, алерты и перезапуск упавших воркеров.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Паттерны использования panic/recover:</strong></p>
            <ul>
                <li><strong>HTTP middleware:</strong> <code>RecoveryMiddleware</code> — обязателен в production-серверах</li>
                <li><strong>safeGo:</strong> обёртка для горутин в долгоживущих сервисах</li>
                <li><strong>Must-функции:</strong> для инициализации — <code>MustConnect</code>, <code>MustCompile</code></li>
                <li><strong>Инварианты:</strong> в низкоуровневых структурах данных</li>
            </ul>
            <p>Во всех случаях — это либо "баг разработчика", либо "программа не может работать без этого".</p>`
        },
        {
            type: 'editor',
            title: 'Практика: safeExecute с recover',
            instructions: 'Напишите функцию safeExecute(fn func()) (err error) — выполняет fn и перехватывает любую панику, превращая её в error. Используйте defer + recover + именованный возврат. Проверьте: нормальная функция → nil, паникующая → error с текстом паники.',
            starterCode: `package main

import "fmt"

func safeExecute(fn func()) (err error) {
    // Подсказка: defer func() { if r := recover(); r != nil { err = ... } }()
    // Ваш код здесь

    fn()
    return nil
}

// mustDivide паникует при b==0
func mustDivide(a, b int) int {
    if b == 0 {
        panic(fmt.Sprintf("деление на ноль: %d / %d", a, b))
    }
    return a / b
}

func main() {
    // Тест 1: нормальная функция
    err := safeExecute(func() {
        result := mustDivide(10, 2)
        fmt.Println("10/2 =", result)
    })
    fmt.Println("err:", err) // nil

    // Тест 2: паникующая функция
    err = safeExecute(func() {
        _ = mustDivide(5, 0)
    })
    fmt.Println("err:", err) // recovered: деление на ноль: 5 / 0

    // Тест 3: паника из рантайма
    err = safeExecute(func() {
        var s []int
        _ = s[5] // panic: runtime error: index out of range
    })
    fmt.Println("err:", err) // recovered: runtime error: index out of range [5] with length 0

    fmt.Println("Программа жива!")
}`,
            hints: [
                'defer func() { if r := recover(); r != nil { err = fmt.Errorf("recovered: %v", r) } }()',
                'Именованный возврат (err error) позволяет изменить err из defer',
                'recover() возвращает interface{} — то что передали в panic()',
                'Поставьте defer ПЕРЕД вызовом fn() — иначе не сработает'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Где ОБЯЗАТЕЛЬНО должен быть вызов recover()?',
                    options: [
                        'Только внутри defer-функции',
                        'В начале функции, которая может запаниковать',
                        'В main() глобально',
                        'В горутине, которая запаниковала'
                    ],
                    correct: 0,
                    explanation: 'recover() работает ТОЛЬКО внутри defer. Паттерн: defer func() { if r := recover(); r != nil { ... } }(). Вне defer recover() всегда возвращает nil и ничего не перехватывает.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что произойдёт с программой если panic в горутине не перехвачена?',
                    options: [
                        'Вся программа завершится с stack trace',
                        'Только горутина завершится, остальные продолжат',
                        'Panic будет проигнорирована',
                        'Go runtime автоматически перезапустит горутину'
                    ],
                    correct: 0,
                    explanation: 'Неперехваченная panic в любой горутине убивает всю программу. Это намеренное решение — паника сигнализирует о баге. Поэтому в production-сервисах safeGo с recover обязателен.'
                },
                {
                    id: 'q3',
                    type: 'multiple',
                    question: 'Когда panic УМЕСТЕН? (несколько ответов)',
                    options: [
                        'Must-функции при инициализации (regexp.MustCompile)',
                        'Нарушение инварианта структуры данных',
                        'Файл не найден при чтении',
                        'Пользователь ввёл неверные данные',
                        'Критическое подключение к БД в main()'
                    ],
                    correct: [0, 1, 4],
                    explanation: 'Panic — для "невозможных" ситуаций (баг разработчика) и критической инициализации. Файл не найден и неверный ввод — ожидаемые ситуации, всегда error.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Что выполняется при панике в функции f()?',
                    options: [
                        'Все defer в f() в обратном порядке, затем паника поднимается к вызывающей',
                        'Только первый defer в f()',
                        'Ничего — panic прерывает всё немедленно',
                        'Defer выполняются в прямом порядке'
                    ],
                    correct: 0,
                    explanation: 'Defer — LIFO (Last In, First Out). При панике все defer в текущей функции выполняются в обратном порядке. Затем panic поднимается к вызывающей функции.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Что вернёт recover() вне defer?',
                    options: [
                        'nil — всегда',
                        'Последнюю панику',
                        'true если паника была',
                        'Ошибку компиляции'
                    ],
                    correct: 0,
                    explanation: 'recover() вне defer всегда возвращает nil. Это не ошибка компиляции, но и не работает. Частая ошибка: r := recover() в начале функции — бесполезно.'
                },
                {
                    id: 'q6',
                    type: 'code-fill',
                    question: 'Дополните паттерн перехвата паники:',
                    template: 'defer func() { if r := ___(___); r != nil { err = fmt.Errorf("panic: %v", r) } }()',
                    correct: 'recover',
                    caseSensitive: true,
                    explanation: 'recover() без аргументов перехватывает текущую панику и возвращает значение переданное в panic(). Вызывается внутри defer-функции.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Зачем использовать именованный возврат (err error) в функции с recover?',
                    options: [
                        'Чтобы defer мог изменить возвращаемое значение err',
                        'Это обязательный синтаксис для recover',
                        'Для производительности',
                        'Именованный возврат не связан с recover'
                    ],
                    correct: 0,
                    explanation: 'defer выполняется после return, но ДО передачи результата вызывающему. Именованный возврат позволяет defer изменить err: func f() (err error) { defer func() { err = ... }() }.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Как работает HTTP RecoveryMiddleware?',
                    options: [
                        'defer/recover в обёртке обработчика — перехватывает panic и возвращает 500',
                        'Проверяет статус-код после выполнения',
                        'Использует http.Error для всех ошибок',
                        'Перезапускает сервер при panic'
                    ],
                    correct: 0,
                    explanation: 'Middleware оборачивает обработчик: defer+recover внутри http.HandlerFunc. Паника в обработчике перехватывается, клиент получает 500, сервер продолжает обрабатывать другие запросы.'
                }
            ]
        }
    ]
};
