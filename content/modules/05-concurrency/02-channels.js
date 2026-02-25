export default {
    id: '05-02',
    title: 'Каналы',
    description: 'Небуферизованные и буферизованные каналы, направления, закрытие, range, deadlock — полное руководство по каналам Go',
    estimatedTime: 35,
    xpReward: 28,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: Конвейер на заводе</h2>
                <p>Представьте завод с конвейерной лентой. Рабочий на одном конце кладёт детали, рабочий на другом — берёт. Если лента <strong>без буфера</strong> — первый ждёт пока второй не возьмёт деталь. Если лента <strong>с буфером</strong> — на ней умещается N деталей, и первый работает независимо, пока лента не заполнена.</p>
                <p>Каналы Go — именно такой конвейер между горутинами.</p>

                <h2>Зачем каналы?</h2>
                <p>Горутины выполняются параллельно, но им нужно <strong>безопасно передавать данные</strong>. Можно использовать разделяемую память с мьютексами, но Go предлагает более элегантный путь:</p>
                <blockquote><em>«Не общайтесь через разделяемую память. Разделяйте память через общение.»</em> — Роб Пайк</blockquote>
                <p>Канал (<code>chan</code>) — это типизированная труба с встроенной синхронизацией. Один пишет, другой читает — без мьютексов, без race condition.</p>

                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Подход</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Синхронизация</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Когда использовать</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Каналы</td>
                            <td style="padding:10px;border:1px solid var(--border)">Встроенная</td>
                            <td style="padding:10px;border:1px solid var(--border)">Передача данных между горутинами</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Mutex</td>
                            <td style="padding:10px;border:1px solid var(--border)">Явная</td>
                            <td style="padding:10px;border:1px solid var(--border)">Защита разделяемого состояния</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Небуферизованные каналы — синхронное рандеву</h2>
                <p>Небуферизованный канал (<code>make(chan T)</code>) требует, чтобы отправитель и получатель были готовы <strong>одновременно</strong>. Это называется «рандеву» — встреча горутин в точке обмена данными.</p>
                <ul>
                    <li>Отправка (<code>ch &lt;- val</code>) блокирует горутину до тех пор, пока кто-то не прочитает</li>
                    <li>Получение (<code>val := &lt;-ch</code>) блокирует до тех пор, пока кто-то не отправит</li>
                    <li>Это гарантирует, что данные реально переданы — не просто положены в буфер</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Небуферизованный канал — базовый пример',
            code: `package main

import "fmt"

func main() {
    // make(chan T) — небуферизованный канал строк
    ch := make(chan string)

    // Горутина: блокируется на отправке до тех пор,
    // пока main не прочитает из канала
    go func() {
        fmt.Println("Горутина: готова к отправке")
        ch <- "Привет из горутины!" // БЛОКИРУЕТСЯ здесь
        fmt.Println("Горутина: данные приняты, продолжаю работу")
    }()

    fmt.Println("Main: жду данные...")
    msg := <-ch // БЛОКИРУЕТСЯ пока горутина не отправит
    fmt.Println("Main: получено —", msg)

    // Порядок вывода:
    // Main: жду данные...
    // Горутина: готова к отправке
    // Main: получено — Привет из горутины!
    // Горутина: данные приняты, продолжаю работу
}`,
            explanation: 'Небуферизованный канал — точка синхронизации. Оба конца должны быть готовы. Это гарантирует, что данные реально получены, а не просто отправлены. Обратите внимание на порядок: main разблокируется точно в момент передачи данных.'
        },
        {
            type: 'theory',
            content: `
                <h2>Буферизованные каналы — асинхронная очередь</h2>
                <p>Буферизованный канал (<code>make(chan T, N)</code>) имеет внутреннюю очередь на N элементов. Отправка блокирует только когда буфер <strong>полон</strong>, получение — когда буфер <strong>пуст</strong>.</p>
                <p>Это как конвейер с накопителем: рабочий может положить несколько деталей заранее и продолжить работу, не дожидаясь второго рабочего.</p>

                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Операция</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Небуферизованный</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Буферизованный (N)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Отправка блокирует</td>
                            <td style="padding:10px;border:1px solid var(--border)">Всегда до получателя</td>
                            <td style="padding:10px;border:1px solid var(--border)">Когда буфер полон</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Получение блокирует</td>
                            <td style="padding:10px;border:1px solid var(--border)">Всегда до отправителя</td>
                            <td style="padding:10px;border:1px solid var(--border)">Когда буфер пуст</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Гарантия доставки</td>
                            <td style="padding:10px;border:1px solid var(--border)">Синхронная</td>
                            <td style="padding:10px;border:1px solid var(--border)">Асинхронная</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">len(ch)</td>
                            <td style="padding:10px;border:1px solid var(--border)">Всегда 0</td>
                            <td style="padding:10px;border:1px solid var(--border)">Текущее кол-во элементов</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">cap(ch)</td>
                            <td style="padding:10px;border:1px solid var(--border)">Всегда 0</td>
                            <td style="padding:10px;border:1px solid var(--border)">Размер буфера N</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Буферизованный канал — FIFO очередь',
            code: `package main

import "fmt"

func main() {
    // Буфер на 3 элемента — горутина не нужна для первых трёх отправок
    ch := make(chan int, 3)

    fmt.Println("len:", len(ch), "cap:", cap(ch)) // 0 3

    // Три отправки НЕ блокируются — есть место в буфере
    ch <- 10
    ch <- 20
    ch <- 30
    fmt.Println("len:", len(ch), "cap:", cap(ch)) // 3 3

    // ch <- 40 // deadlock! буфер полон, получателей нет

    // Читаем в порядке FIFO
    fmt.Println(<-ch) // 10
    fmt.Println(<-ch) // 20
    fmt.Println(<-ch) // 30

    fmt.Println("len:", len(ch), "cap:", cap(ch)) // 0 3

    // Когда выбрать буферизованный:
    // 1. Известно точное количество результатов
    // 2. Отправитель не должен ждать обработки
    // 3. Балансировка нагрузки (воркер пул)
}`,
            explanation: 'Буферизованный канал работает как очередь FIFO. len() показывает сколько элементов сейчас в буфере. cap() — максимальный размер. Попытка отправить в полный буфер без получателя вызовет deadlock.'
        },
        {
            type: 'theory',
            content: `
                <h2>Закрытие канала и range</h2>
                <p>Когда отправитель больше не будет отправлять данные — он закрывает канал через <code>close(ch)</code>. Это <strong>сигнал</strong> получателям: данных больше не будет.</p>
                <p>Чтение из закрытого канала немедленно возвращает нулевое значение типа + <code>false</code> (comma-ok идиома). Оператор <code>for range</code> автоматически останавливается при закрытии.</p>

                <h2>Deadlock — взаимная блокировка</h2>
                <p><strong>Deadlock</strong> — все горутины заблокированы и ни одна не может продолжить. Go runtime обнаруживает это и завершает программу с паникой:</p>
                <code style="display:block;padding:8px;background:var(--surface-2);border-radius:4px;margin:8px 0">fatal error: all goroutines are asleep - deadlock!</code>
                <p>Типичные причины:</p>
                <ul>
                    <li>Чтение из пустого канала без отправителя</li>
                    <li>Отправка в полный буферизованный канал без получателя</li>
                    <li>Горутина ждёт саму себя</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'close, range и comma-ok идиома',
            code: `package main

import "fmt"

// Генератор — возвращает receive-only канал
func fibonacci(n int) <-chan int {
    ch := make(chan int)
    go func() {
        a, b := 0, 1
        for i := 0; i < n; i++ {
            ch <- a
            a, b = b, a+b
        }
        close(ch) // ОТПРАВИТЕЛЬ закрывает, сигнал: данных больше нет
    }()
    return ch
}

func main() {
    // for range автоматически останавливается при close
    for val := range fibonacci(8) {
        fmt.Print(val, " ") // 0 1 1 2 3 5 8 13
    }
    fmt.Println()

    // --- Comma-ok идиома ---
    ch := make(chan int, 2)
    ch <- 42
    close(ch)

    val, ok := <-ch
    fmt.Println(val, ok) // 42 true  — данные из буфера

    val, ok = <-ch
    fmt.Println(val, ok) // 0 false  — канал закрыт и пуст

    // --- ОПАСНО ---
    // close(ch)         // panic: close of closed channel
    // ch <- 99          // panic: send on closed channel
}`,
            explanation: 'close() вызывает ТОЛЬКО отправитель — он знает когда данные закончились. for range — самый идиоматичный способ читать до закрытия. Comma-ok (val, ok := <-ch) позволяет проверить, реальные это данные или нулевое значение из закрытого канала.'
        },
        {
            type: 'info-box',
            variant: 'danger',
            content: `<p><strong>Правила close — нарушение вызывает panic:</strong></p>
            <ul>
                <li>Закрывает только <strong>отправитель</strong>, никогда получатель</li>
                <li>Повторный <code>close</code> → <strong>panic</strong></li>
                <li>Отправка в закрытый канал → <strong>panic</strong></li>
                <li>Чтение из закрытого → нулевое значение + <code>ok=false</code> (безопасно)</li>
                <li>Закрытие nil-канала → <strong>panic</strong></li>
            </ul>`
        },
        {
            type: 'theory',
            content: `
                <h2>Направления каналов — типобезопасность</h2>
                <p>В сигнатурах функций каналы можно ограничить по направлению. Это документирует намерение и ловит ошибки на этапе компиляции:</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Тип</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Значение</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Разрешено</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>chan T</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Двунаправленный</td>
                            <td style="padding:10px;border:1px solid var(--border)">Отправка, получение, close</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>chan&lt;- T</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Только отправка (send-only)</td>
                            <td style="padding:10px;border:1px solid var(--border)">Отправка, close</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>&lt;-chan T</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Только получение (receive-only)</td>
                            <td style="padding:10px;border:1px solid var(--border)">Получение</td>
                        </tr>
                    </tbody>
                </table>
                <p>Go автоматически конвертирует <code>chan T</code> → <code>chan&lt;- T</code> или <code>&lt;-chan T</code>. Обратная конвертация — ошибка компиляции.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Направления каналов + pipeline паттерн',
            code: `package main

import "fmt"

// generate принимает числа и возвращает receive-only канал
// Вызывающий код не может случайно отправить в канал
func generate(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        for _, n := range nums {
            out <- n
        }
        close(out)
    }()
    return out
}

// square принимает receive-only и возвращает receive-only
// Не может случайно закрыть входной канал
func square(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        for n := range in {
            out <- n * n
        }
        close(out)
    }()
    return out
}

// filter оставляет только чётные значения
func filter(in <-chan int, fn func(int) bool) <-chan int {
    out := make(chan int)
    go func() {
        for n := range in {
            if fn(n) {
                out <- n
            }
        }
        close(out)
    }()
    return out
}

func main() {
    // Pipeline: generate -> square -> filter -> print
    nums := generate(1, 2, 3, 4, 5, 6)
    squares := square(nums)
    evens := filter(squares, func(n int) bool { return n%2 == 0 })

    for val := range evens {
        fmt.Println(val) // 4, 16, 36
    }
}`,
            explanation: 'Pipeline — цепочка горутин, связанных каналами. Каждый этап читает из <-chan, обрабатывает и пишет в новый chan. Направления каналов гарантируют: generate не читает, square не закрывает входной канал. Компилятор поймает нарушения.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Когда какой канал:</strong></p>
            <ul>
                <li><strong>Небуферизованный</strong> — нужна синхронизация (гарантия, что данные получены прямо сейчас)</li>
                <li><strong>Буферизованный</strong> — известен объём работы, нужна независимость отправителя</li>
                <li><strong>chan struct{}</strong> — чистый сигнал без данных (0 байт памяти)</li>
                <li>По умолчанию начинайте с небуферизованного — добавляйте буфер только при реальной необходимости</li>
            </ul>`
        },
        {
            type: 'editor',
            title: 'Практика: Параллельное суммирование',
            instructions: 'Напишите функцию sumWorker(nums []int, result chan<- int), которая считает сумму переданного слайса и отправляет в канал. В main разделите слайс на две половины, запустите два воркера параллельно и сложите результаты. Итог должен быть 55 (сумма 1..10).',
            starterCode: `package main

import "fmt"

// sumWorker считает сумму nums и отправляет в result
func sumWorker(nums []int, result chan<- int) {
    // Посчитайте сумму и отправьте в result
    // Подсказка: используйте цикл for _, n := range nums
}

func main() {
    numbers := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
    ch := make(chan int) // небуферизованный — два результата

    mid := len(numbers) / 2

    // Запустите два воркера: первая и вторая половина
    // go sumWorker(...)
    // go sumWorker(...)

    // Получите оба результата из канала
    // sum1 := <-ch
    // sum2 := <-ch

    // fmt.Println("Сумма:", sum1+sum2) // Ожидается: 55
    _ = mid
    fmt.Println("Реализуйте меня!")
}`,
            hints: [
                'sumWorker: total := 0; for _, n := range nums { total += n }; result <- total',
                'go sumWorker(numbers[:mid], ch) — первая половина [1..5]',
                'go sumWorker(numbers[mid:], ch) — вторая половина [6..10]',
                'Канал небуферизованный, но два воркера работают параллельно — оба могут отправить'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что произойдёт при чтении из пустого небуферизованного канала без отправителя?',
                    options: [
                        'deadlock — fatal error: all goroutines are asleep',
                        'Вернётся нулевое значение',
                        'panic',
                        'Ошибка компиляции'
                    ],
                    correct: 0,
                    explanation: 'Если все горутины заблокированы (нет отправителя), Go runtime обнаружит deadlock и завершит программу.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Кто должен закрывать канал?',
                    options: [
                        'Отправитель — он знает когда данных больше не будет',
                        'Получатель после последнего чтения',
                        'main() при завершении',
                        'Любая горутина, которая первая закончит'
                    ],
                    correct: 0,
                    explanation: 'Только отправитель знает, что данных больше не будет. Получатель не может знать этого надёжно. Закрытие получателем — ошибка дизайна.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Что означает <-chan int в сигнатуре функции?',
                    options: [
                        'Канал только для получения (receive-only)',
                        'Канал только для отправки (send-only)',
                        'Двунаправленный канал',
                        'Закрытый канал'
                    ],
                    correct: 0,
                    explanation: '<-chan T — receive-only. Функция может только читать из такого канала. Попытка отправить — ошибка компиляции.'
                },
                {
                    id: 'q4',
                    type: 'code-fill',
                    question: 'Создайте буферизованный канал на 10 целых чисел:',
                    template: 'ch := make(chan int, ___)',
                    correct: '10',
                    caseSensitive: false,
                    explanation: 'make(chan T, N) — второй аргумент задаёт размер буфера. Без второго аргумента — небуферизованный.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Что вернёт val, ok := <-closedCh для закрытого и пустого канала?',
                    options: [
                        'Нулевое значение типа + false',
                        'nil + false',
                        'panic',
                        'Нулевое значение + true'
                    ],
                    correct: 0,
                    explanation: 'Закрытый пустой канал безопасен для чтения: возвращает нулевое значение типа (0, "", false...) и ok=false.'
                },
                {
                    id: 'q6',
                    type: 'multiple',
                    question: 'Какие операции вызывают panic? (несколько ответов)',
                    options: [
                        'Отправка в закрытый канал',
                        'Повторное закрытие канала',
                        'Чтение из закрытого канала',
                        'Закрытие nil-канала'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'Чтение из закрытого — безопасно. Отправка в закрытый, двойное close, close(nil) — всё вызывает panic.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Буферизованный канал make(chan int, 3). Сколько отправок не заблокируются без получателя?',
                    options: [
                        '3 отправки',
                        '1 отправка',
                        '0 отправок',
                        'Бесконечно'
                    ],
                    correct: 0,
                    explanation: 'Буфер = 3, значит три отправки пройдут без блокировки. Четвёртая заблокируется до появления получателя.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Как for range реагирует на закрытый канал?',
                    options: [
                        'Читает оставшиеся данные и завершается',
                        'Паникует',
                        'Бесконечный цикл',
                        'Пропускает нулевые значения'
                    ],
                    correct: 0,
                    explanation: 'for range ch вычитывает все данные из буфера и корректно завершается когда канал закрыт и пуст.'
                }
            ]
        }
    ]
};
