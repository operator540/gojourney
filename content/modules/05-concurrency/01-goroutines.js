export default {
    id: '05-01',
    title: 'Горутины',
    description: 'Как Go выполняет тысячи задач одновременно — горутины, планировщик, WaitGroup и типичные ловушки',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Представьте ресторан</h2>
                <p>Представьте ресторан, где работает <strong>один официант</strong>. Он принимает заказ у стола 1, несёт его на кухню, ждёт пока приготовят, приносит блюдо, потом идёт к столу 2. Пока он ждёт кухню — все остальные столы простаивают. Это <strong>последовательное выполнение</strong>.</p>
                <p>Теперь ресторан нанимает <strong>10 официантов</strong>. Каждый обслуживает свои столы независимо. Один ждёт кухню — другие уже принимают заказы. Пропускная способность выросла в разы. Это <strong>конкурентное выполнение</strong>.</p>
                <p>В Go <strong>официанты — это горутины</strong>. И вы можете запустить не 10, а сотни тысяч.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Почему обычные потоки не подходят</h2>
                <p>В большинстве языков конкурентность реализована через <strong>потоки операционной системы</strong> (threads). У них есть серьёзная проблема:</p>
                <ul>
                    <li>Каждый поток потребляет <strong>~1–8 МБ памяти</strong> только на стек</li>
                    <li>Создание потока занимает <strong>микросекунды</strong> — дорогая операция</li>
                    <li>Переключение между потоками (context switch) тоже <strong>дорогое</strong></li>
                    <li>Запустить <strong>10 000 потоков</strong> — уже проблема (10 ГБ только на стеки)</li>
                </ul>
                <p>Именно поэтому Node.js сделал ставку на event loop с одним потоком. Но Go придумал лучше — <strong>горутины</strong>.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Горутины — лёгкие потоки Go</h2>
                <p><strong>Горутина</strong> — это функция, которая выполняется конкурентно с остальными горутинами в той же программе. Но в отличие от потоков ОС, горутинами управляет <strong>рантайм Go</strong>, а не операционная система.</p>
                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Характеристика</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Поток ОС</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Горутина Go</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Размер стека</td>
                            <td style="padding:10px;border:1px solid var(--border)">1–8 МБ (фиксированный)</td>
                            <td style="padding:10px;border:1px solid var(--border)"><strong style="color:var(--accent)">~2 КБ</strong> (растёт по мере нужды)</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Создание</td>
                            <td style="padding:10px;border:1px solid var(--border)">~1 мс</td>
                            <td style="padding:10px;border:1px solid var(--border)"><strong style="color:var(--accent)">~300 нс</strong> (в 3000× быстрее)</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Реалистичный максимум</td>
                            <td style="padding:10px;border:1px solid var(--border)">~10 000</td>
                            <td style="padding:10px;border:1px solid var(--border)"><strong style="color:var(--accent)">1 000 000+</strong></td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Кто управляет</td>
                            <td style="padding:10px;border:1px solid var(--border)">Ядро ОС</td>
                            <td style="padding:10px;border:1px solid var(--border)"><strong style="color:var(--accent)">Рантайм Go</strong></td>
                        </tr>
                    </tbody>
                </table>
                <p style="margin-top:16px">Именно поэтому Go-серверы легко обрабатывают <strong>десятки тысяч соединений одновременно</strong>.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Синтаксис: ключевое слово go</h2>
                <p>Запустить горутину до неприличия просто — добавьте ключевое слово <code>go</code> перед любым вызовом функции:</p>
                <pre><code>go functionName(args)</code></pre>
                <p>Вот и всё. Функция немедленно запускается в новой горутине, а следующая строка кода выполняется <em>не дожидаясь</em> её завершения.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Первая горутина',
            code: `package main

import (
    "fmt"
    "time"
)

func downloadFile(name string) {
    fmt.Printf("⬇️  Начинаю загрузку: %s\\n", name)
    time.Sleep(2 * time.Second) // имитируем загрузку
    fmt.Printf("✅  Загружен: %s\\n", name)
}

func main() {
    fmt.Println("Запускаем загрузки...")

    go downloadFile("video.mp4")   // запускается немедленно
    go downloadFile("image.jpg")   // тоже запускается немедленно
    go downloadFile("document.pdf") // и этот тоже

    // Без этого main завершится раньше, чем файлы загрузятся!
    time.Sleep(3 * time.Second)

    fmt.Println("Готово!")
}`,
            explanation: 'Три загрузки работают параллельно. Без горутин они бы шли последовательно и заняли 6 секунд. С горутинами — 2 секунды. Но time.Sleep — ненадёжное решение. Сейчас покажем правильный способ.'
        },
        {
            type: 'info-box',
            variant: 'important',
            content: `<p><strong>Главная ловушка новичка №1:</strong> когда <code>main()</code> завершается — <em>все горутины убиваются немедленно</em>, даже если они не закончили работу. Программа не ждёт горутины сама по себе.</p>
            <p>Поэтому <code>time.Sleep</code> в примере выше — это заглушка для демонстрации. В реальном коде так делать <strong>нельзя</strong>: вы не знаете точно сколько времени займёт горутина.</p>`
        },
        {
            type: 'theory',
            content: `
                <h2>sync.WaitGroup — правильное ожидание горутин</h2>
                <p>Представьте что вы менеджер, который отправил 5 сотрудников на задание. Вам нужно дождаться пока все вернутся, прежде чем подвести итоги. <code>sync.WaitGroup</code> — это ваш <strong>счётчик сотрудников</strong>.</p>
                <p>WaitGroup работает по трём операциям:</p>
                <ul>
                    <li><code>wg.Add(n)</code> — "я отправляю <em>n</em> сотрудников" (увеличить счётчик)</li>
                    <li><code>wg.Done()</code> — "я вернулся" (уменьшить счётчик на 1)</li>
                    <li><code>wg.Wait()</code> — "жду пока счётчик станет 0"</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'sync.WaitGroup — правильный паттерн',
            code: `package main

import (
    "fmt"
    "sync"
    "time"
)

func downloadFile(name string, wg *sync.WaitGroup) {
    defer wg.Done() // ← гарантирует вызов Done() даже при панике

    fmt.Printf("⬇️  Начинаю: %s\\n", name)
    time.Sleep(2 * time.Second)
    fmt.Printf("✅  Готово: %s\\n", name)
}

func main() {
    var wg sync.WaitGroup

    files := []string{"video.mp4", "image.jpg", "document.pdf"}

    for _, file := range files {
        wg.Add(1)                    // ← перед запуском горутины
        go downloadFile(file, &wg)  // ← передаём указатель!
    }

    wg.Wait() // ← блокирует до тех пор, пока все не вызовут Done()
    fmt.Println("Все файлы загружены!")
}`,
            explanation: 'Три правила: 1) Add() вызывать ДО запуска горутины. 2) Передавать &wg (указатель), иначе Done() уменьшит копию, а не оригинал. 3) defer wg.Done() — чтобы Done() точно вызвался.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Почему defer wg.Done()?</strong> Без <code>defer</code> если функция завершится досрочно (через <code>return</code> или панику), <code>Done()</code> не вызовется, и <code>Wait()</code> будет ждать вечно. <code>defer</code> гарантирует вызов при <em>любом</em> выходе из функции.</p>`
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `sequenceDiagram
    participant M as main()
    participant W as WaitGroup
    participant G1 as goroutine 1
    participant G2 as goroutine 2
    participant G3 as goroutine 3

    M->>W: Add(1); Add(1); Add(1) — счётчик: 3
    M->>G1: go downloadFile(...)
    M->>G2: go downloadFile(...)
    M->>G3: go downloadFile(...)
    M->>W: Wait() — блокируется

    G1-->>W: Done() — счётчик: 2
    G2-->>W: Done() — счётчик: 1
    G3-->>W: Done() — счётчик: 0

    W-->>M: разблокирует Wait()
    M->>M: "Все файлы загружены!"`,
            caption: 'WaitGroup координирует завершение горутин — main() ждёт пока счётчик не упадёт до нуля'
        },
        {
            type: 'theory',
            content: `
                <h2>Конкурентность ≠ Параллелизм</h2>
                <p>Это частая путаница, и Роб Пайк (создатель Go) целый доклад посвятил этому различию:</p>
                <ul>
                    <li><strong>Конкурентность (Concurrency)</strong> — о <em>структуре</em> программы. Несколько задач могут <em>начаться, выполняться и завершиться в перекрывающихся промежутках времени</em>. Это про то, как вы организуете код.</li>
                    <li><strong>Параллелизм (Parallelism)</strong> — о <em>выполнении</em>. Задачи буквально выполняются <em>одновременно</em> на нескольких процессорных ядрах.</li>
                </ul>
                <p>Аналогия: один повар, который жарит лук пока варится картошка — это <strong>конкурентность</strong>. Два повара, каждый за своей плитой — это <strong>параллелизм</strong>.</p>
                <p>Go программы <em>всегда конкурентны</em>. Параллелизм получается автоматически если есть несколько CPU ядер.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Планировщик Go: GOMAXPROCS',
            code: `package main

import (
    "fmt"
    "runtime"
)

func main() {
    // Сколько логических CPU доступно
    cpus := runtime.NumCPU()
    fmt.Println("Логических CPU:", cpus)

    // GOMAXPROCS — сколько потоков ОС Go использует для горутин
    // По умолчанию = NumCPU() начиная с Go 1.5
    procs := runtime.GOMAXPROCS(0) // 0 = просто прочитать текущее значение
    fmt.Println("GOMAXPROCS:", procs)

    // Сколько горутин сейчас активно
    fmt.Println("Активных горутин:", runtime.NumGoroutine())
}

// Вывод на 8-ядерной машине:
// Логических CPU: 8
// GOMAXPROCS: 8
// Активных горутин: 1`,
            explanation: 'Go сам устанавливает GOMAXPROCS = количество CPU. Это значит на 8-ядерном CPU горутины могут работать на 8 потоках ОС одновременно. Изменять GOMAXPROCS вручную почти никогда не нужно.'
        },
        {
            type: 'theory',
            content: `
                <h2>Утечки горутин — тихий убийца</h2>
                <p><strong>Goroutine leak</strong> — это горутина, которая <em>никогда не завершится</em>. Она просто висит в памяти и потребляет ресурсы. Это аналог memory leak в других языках, только хуже — горутина ещё и держит все ресурсы которые захватила.</p>
                <p>Самые частые причины утечек:</p>
                <ul>
                    <li>Горутина читает из канала, в который <em>никто никогда не напишет</em></li>
                    <li>Горутина пишет в канал, из которого <em>никто никогда не читает</em></li>
                    <li>Горутина ждёт lock, который <em>никогда не освободится</em></li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Утечка горутины и её исправление',
            code: `package main

import "fmt"

// ❌ ПЛОХО: горутина зависнет навсегда
func badSearch(query string) {
    results := make(chan string) // небуферизованный канал

    go func() {
        // Ищем... и хотим отправить результат
        results <- "найдено: " + query
        // Но если никто не читает из results — горутина ЗАВИСНЕТ здесь
    }()

    // Если мы уходим из функции не читая results — утечка!
}

// ✅ ХОРОШО: используем context для отмены
func goodSearch(query string, done <-chan struct{}) {
    results := make(chan string, 1) // буферизованный — не заблокируется

    go func() {
        result := "найдено: " + query
        select {
        case results <- result: // отправляем если есть читатель
        case <-done:            // или выходим если получили сигнал отмены
        }
    }()

    select {
    case result := <-results:
        fmt.Println(result)
    case <-done:
        fmt.Println("поиск отменён")
    }
}

func main() {
    done := make(chan struct{})
    goodSearch("golang goroutines", done)
    close(done) // сигнал завершения
}`,
            explanation: 'Буферизованный канал make(chan string, 1) позволяет горутине отправить значение и завершиться даже если читатель ещё не готов. done-канал — стандартный паттерн для сигнала отмены.'
        },
        {
            type: 'info-box',
            variant: 'note',
            content: `<p><strong>Инструмент для поиска утечек:</strong> пакет <code>runtime</code> и <code>runtime/pprof</code> позволяют посмотреть все активные горутины. В продакшне используют <a href="#">goleak</a> от Uber — он автоматически ловит утечки в тестах.</p>
            <pre style="margin-top:8px;font-size:12px">import "go.uber.org/goleak"

func TestNoLeak(t *testing.T) {
    defer goleak.VerifyNone(t)
    // ваш код
}</pre>`
        },
        {
            type: 'theory',
            content: `
                <h2>Реальный пример: параллельные HTTP-запросы</h2>
                <p>Классический use case для горутин — отправить <em>несколько независимых запросов одновременно</em> вместо последовательного ожидания каждого.</p>
                <p>Представьте главную страницу сайта: нужно загрузить профиль пользователя, его заказы и рекомендации — три независимых API-запроса. Последовательно: 300мс + 200мс + 250мс = <strong>750мс</strong>. Параллельно: <strong>~300мс</strong> (по самому долгому).</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Параллельные API-запросы',
            code: `package main

import (
    "fmt"
    "sync"
    "time"
)

type PageData struct {
    mu          sync.Mutex // защита от гонки данных
    userProfile string
    orders      string
    recommendations string
}

func fetchUserProfile(data *PageData, wg *sync.WaitGroup) {
    defer wg.Done()
    time.Sleep(300 * time.Millisecond) // имитация HTTP-запроса

    data.mu.Lock()
    data.userProfile = "Иван Петров, Gold-статус"
    data.mu.Unlock()
}

func fetchOrders(data *PageData, wg *sync.WaitGroup) {
    defer wg.Done()
    time.Sleep(200 * time.Millisecond)

    data.mu.Lock()
    data.orders = "3 активных заказа"
    data.mu.Unlock()
}

func fetchRecommendations(data *PageData, wg *sync.WaitGroup) {
    defer wg.Done()
    time.Sleep(250 * time.Millisecond)

    data.mu.Lock()
    data.recommendations = "iPhone 16, AirPods, MacBook"
    data.mu.Unlock()
}

func main() {
    start := time.Now()

    var wg sync.WaitGroup
    data := &PageData{}

    wg.Add(3)
    go fetchUserProfile(data, &wg)
    go fetchOrders(data, &wg)
    go fetchRecommendations(data, &wg)

    wg.Wait()

    fmt.Println("Профиль:", data.userProfile)
    fmt.Println("Заказы:", data.orders)
    fmt.Println("Рекомендации:", data.recommendations)
    fmt.Printf("Время: %v (вместо 750мс)\\n", time.Since(start))
}`,
            explanation: 'sync.Mutex защищает общие данные от одновременной записи из разных горутин (race condition). В следующем уроке про каналы увидим более элегантный Go-way для этой задачи.'
        },
        {
            type: 'theory',
            content: `
                <h2>Типичные ошибки с горутинами</h2>
                <h3>Ошибка 1: Захват переменной цикла</h3>
                <p>Это одна из самых частых ошибок новичков в Go. При запуске горутины в цикле переменная цикла <em>захватывается по ссылке</em>, а не по значению.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Ловушка: переменная цикла',
            code: `package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup

    // ❌ ПЛОХО: все горутины напечатают одно и то же значение
    // (скорее всего "5 5 5 5 5")
    for i := 0; i < 5; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            fmt.Println(i) // захватывает переменную i по ссылке!
        }()
    }
    wg.Wait()

    fmt.Println("---")

    // ✅ ХОРОШО: передаём значение как аргумент
    for i := 0; i < 5; i++ {
        wg.Add(1)
        go func(n int) { // n — это копия i на момент вызова
            defer wg.Done()
            fmt.Println(n)
        }(i) // передаём i как аргумент прямо сейчас
    }
    wg.Wait()
}`,
            explanation: 'В первом случае все горутины читают одну переменную i, которая к моменту выполнения уже равна 5. Во втором — каждая горутина получает свою копию значения. Начиная с Go 1.22 поведение изменилось и первый вариант тоже работает правильно, но знать об этой ловушке всё равно важно.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Go 1.22+:</strong> В Go 1.22 переменная цикла <code>for</code> теперь создаётся заново на каждой итерации, поэтому проблема с захватом исчезла. Но в реальных проектах часто встречается старый код — понимать ловушку необходимо.</p>`
        },
        {
            type: 'editor',
            title: 'Практика: Параллельная обработка данных',
            instructions: 'У вас есть слайс URL-адресов. Напишите программу, которая "скачивает" каждый URL параллельно (имитируйте через time.Sleep) и собирает результаты. Используйте sync.WaitGroup.',
            starterCode: `package main

import (
    "fmt"
    "sync"
    "time"
    "strings"
)

// simulate downloading a URL
func download(url string, wg *sync.WaitGroup, results *[]string, mu *sync.Mutex) {
    defer wg.Done()

    // Имитируем загрузку
    time.Sleep(100 * time.Millisecond)
    content := "Содержимое: " + strings.ToUpper(url)

    // Защищаем запись в слайс
    mu.Lock()
    *results = append(*results, content)
    mu.Unlock()
}

func main() {
    urls := []string{
        "go.dev",
        "github.com",
        "stackoverflow.com",
        "pkg.go.dev",
    }

    var wg sync.WaitGroup
    var mu sync.Mutex
    var results []string

    // TODO: запустите горутину для каждого URL
    // используйте wg.Add(1) и go download(...)

    wg.Wait()

    fmt.Printf("Загружено %d страниц:\\n", len(results))
    for _, r := range results {
        fmt.Println(" -", r)
    }
}`,
            hints: [
                'В цикле for _, url := range urls сначала wg.Add(1), потом go download(url, &wg, &results, &mu)',
                'Передавайте &wg и &mu — указатели, не копии',
                'Порядок результатов будет непредсказуемым — это нормально для параллельного выполнения',
                'defer wg.Done() уже есть в функции download — не добавляйте его снова'
            ]
        },
        {
            type: 'theory',
            content: `
                <h2>Что мы узнали</h2>
                <ul>
                    <li>🦸 <strong>Горутина</strong> — лёгкий поток Go весом ~2КБ, запускается через ключевое слово <code>go</code></li>
                    <li>⚠️ <strong>main() завершается — все горутины убиваются</strong>. Всегда используйте синхронизацию</li>
                    <li>✅ <strong>sync.WaitGroup</strong> — стандартный способ ждать горутины: Add() до запуска, Done() внутри через defer, Wait() для блокировки</li>
                    <li>🔑 <strong>WaitGroup передаётся по указателю</strong> &wg — иначе Done() не работает</li>
                    <li>🐛 <strong>Goroutine leak</strong> — горутина, которая никогда не завершится. Главная причина: чтение из канала, в который никто не пишет</li>
                    <li>🔁 <strong>Ловушка цикла</strong> — передавайте переменную цикла как аргумент, а не захватывайте замыканием</li>
                </ul>
                <p>В следующем уроке изучим <strong>каналы</strong> — механизм коммуникации между горутинами. Это сделает ваш код чище без mutex и shared state.</p>
            `
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Какой начальный размер стека у горутины?',
                    options: ['~2 КБ', '~1 МБ', '~8 МБ', '~512 байт'],
                    correct: 0,
                    explanation: 'Горутина начинает с ~2 КБ стека и растёт по мере необходимости. Поток ОС обычно занимает 1–8 МБ сразу при создании — вот почему можно создать миллион горутин, но не миллион потоков.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что произойдёт, если main() завершится пока горутина ещё работает?',
                    options: [
                        'Горутина будет убита вместе с программой',
                        'Программа подождёт горутину автоматически',
                        'Горутина продолжит работу в фоне',
                        'Компилятор не позволит это сделать'
                    ],
                    correct: 0,
                    explanation: 'Go не ждёт горутины автоматически. Когда main() завершается — вся программа завершается, включая все горутины. Для ожидания используйте sync.WaitGroup или каналы.'
                },
                {
                    id: 'q3',
                    type: 'multiple',
                    question: 'Какие из утверждений про sync.WaitGroup верны?',
                    options: [
                        'Add() нужно вызывать ДО запуска горутины',
                        'WaitGroup нужно передавать по указателю (&wg)',
                        'WaitGroup можно передавать по значению',
                        'defer wg.Done() — рекомендуемый паттерн',
                        'Wait() возвращает количество оставшихся горутин'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'Add() до go — чтобы не было гонки. По указателю — иначе Done() уменьшает копию. defer Done() — гарантирует вызов даже при панике. Wait() ничего не возвращает, просто блокирует.'
                },
                {
                    id: 'q4',
                    type: 'code-fill',
                    question: 'Чтобы запустить функцию work() в горутине, нужно написать:',
                    template: '___ work()',
                    correct: 'go',
                    caseSensitive: true,
                    explanation: 'Ключевое слово go перед вызовом функции запускает её в новой горутине. Проще не придумать.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Что такое goroutine leak?',
                    options: [
                        'Горутина, которая никогда не завершится',
                        'Горутина, которая завершилась с ошибкой',
                        'Слишком медленная горутина',
                        'Горутина без имени'
                    ],
                    correct: 0,
                    explanation: 'Goroutine leak — горутина зависает навсегда: например, ждёт из канала в который никто не пишет. Она занимает память и ресурсы до завершения программы.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'В чём разница между конкурентностью и параллелизмом?',
                    options: [
                        'Конкурентность — структура кода (задачи могут перекрываться), параллелизм — реальное одновременное выполнение на разных ядрах',
                        'Это одно и то же, просто разные слова',
                        'Параллелизм — структура кода, конкурентность — выполнение',
                        'Конкурентность только для одного ядра, параллелизм — для многих'
                    ],
                    correct: 0,
                    explanation: 'Роб Пайк: "Конкурентность — о структуре, параллелизм — о выполнении". Программа может быть конкурентной на одном ядре (переключение между задачами) и параллельной на нескольких.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Как правильно передать переменную цикла в горутину?',
                    options: [
                        'Передать как аргумент: go func(n int) { ... }(i)',
                        'Захватить замыканием: go func() { fmt.Println(i) }()',
                        'Использовать глобальную переменную',
                        'Скопировать в отдельную переменную снаружи: copy := i'
                    ],
                    correct: 0,
                    explanation: 'Передача как аргумент создаёт копию значения прямо в момент вызова. Захват замыканием — горутина читает переменную i когда начнёт выполняться, а к тому времени i может уже измениться.'
                }
            ]
        }
    ]
};
