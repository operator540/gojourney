export default {
    id: '01-04',
    title: 'Функции',
    description: 'Объявление функций, множественный возврат, именованные возвраты, вариативные функции, defer, замыкания, функции высшего порядка',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Функция — это контракт</h2>
                <p>Представьте ресторан. Вы делаете заказ (аргументы), кухня выполняет работу, и вам приносят блюдо (возвращаемое значение). Вас не интересует как именно готовится еда — важен контракт: <em>что подаём на вход, что получаем на выход</em>. Функция в программировании работает точно так же.</p>
                <p>В Go функции — это <strong>значения первого класса</strong>. Это значит, что функцию можно:</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Операция</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Пример</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Где используется</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Присвоить переменной</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>f := func(x int) int { return x * 2 }</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Анонимные функции</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Передать как аргумент</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>apply(nums, func(n int) int { ... })</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Функции высшего порядка</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Вернуть из функции</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>func makeCounter() func() int { ... }</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Замыкания, фабрики</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Хранить в слайсе / map</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>handlers := []func(){...}</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Диспетчеры событий</td>
                        </tr>
                    </tbody>
                </table>

                <p style="margin-top:16px">Синтаксис объявления функции в Go:</p>
                <pre style="background:var(--surface-2);padding:12px;border-radius:6px;overflow-x:auto"><code>func имя(параметр тип, ...) (возврат тип, ...) {
    тело функции
}</code></pre>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Объявление функции и вызов',
            code: `package main

import "fmt"

// greet принимает имя и возвращает приветствие
func greet(name string) string {
    return "Привет, " + name + "!"
}

// add — параметры одного типа можно перечислить через запятую
func add(a, b int) int {
    return a + b
}

// noReturn — функция без возвращаемого значения
func noReturn(msg string) {
    fmt.Println("[LOG]:", msg)
}

func main() {
    fmt.Println(greet("Go"))     // Привет, Go!
    fmt.Println(greet("Мир"))    // Привет, Мир!
    fmt.Println(add(3, 5))       // 8
    fmt.Println(add(-1, 10))     // 9
    noReturn("программа запущена")
}`,
            explanation: `Разберём синтаксис подробно.

Запись (a, b int) — это сокращение для (a int, b int). Go позволяет группировать параметры одного типа: если несколько параметров подряд имеют одинаковый тип, тип указывается только один раз после последнего из них. Это удобно при нескольких целочисленных параметрах.

Функция greet возвращает string — тип возврата указывается после списка параметров. Если функция ничего не возвращает (как noReturn), тип возврата опускается — в отличие от C или Java, где в этом случае пишут void.

Функции в Go всегда начинаются с ключевого слова func. Нет разницы между «методами» и «функциями» на уровне синтаксиса — метод это просто функция с получателем (receiver), которую мы рассмотрим в модуле про структуры.

Важная особенность Go: функции не поддерживают перегрузку (overloading). Нельзя создать две функции с одинаковым именем но разными параметрами. Это сделано намеренно — код становится проще для чтения и поиска. Если нужно разное поведение для разных типов, используйте интерфейсы или generics (Go 1.18+).`
        },
        {
            type: 'theory',
            content: `
                <h2>Множественный возврат — суперсила Go</h2>
                <p>Go позволяет возвращать из функции <strong>несколько значений</strong>. Это не просто удобство — это фундаментальная часть языка, на которой построена вся система обработки ошибок.</p>
                <p>Сравните подходы в разных языках:</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Язык</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Как обрабатывают ошибки</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Проблема</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Java, C#</td>
                            <td style="padding:10px;border:1px solid var(--border)">Исключения (throw/catch)</td>
                            <td style="padding:10px;border:1px solid var(--border)">Невидимый поток управления, легко пропустить</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">C</td>
                            <td style="padding:10px;border:1px solid var(--border)">Глобальный errno или код возврата</td>
                            <td style="padding:10px;border:1px solid var(--border)">Легко забыть проверить, не очевидно</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Go</td>
                            <td style="padding:10px;border:1px solid var(--border)">Множественный возврат (result, error)</td>
                            <td style="padding:10px;border:1px solid var(--border)">Явно — ошибку сложно игнорировать случайно</td>
                        </tr>
                    </tbody>
                </table>

                <p style="margin-top:16px">Стандартный паттерн: функция возвращает <code>(результат, error)</code>. Если <code>err == nil</code> — всё хорошо. Если нет — обрабатываем ошибку.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Множественный возврат и обработка ошибок',
            code: `package main

import (
    "errors"
    "fmt"
    "strconv"
)

// divide возвращает результат и ошибку
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("деление на ноль невозможно")
    }
    return a / b, nil  // nil означает "ошибки нет"
}

// parseAndDouble парсит строку и удваивает число
func parseAndDouble(s string) (int, error) {
    n, err := strconv.Atoi(s)
    if err != nil {
        return 0, fmt.Errorf("не удалось разобрать %q: %w", s, err)
    }
    return n * 2, nil
}

func main() {
    // Успешный вызов
    result, err := divide(10, 3)
    if err != nil {
        fmt.Println("Ошибка:", err)
    } else {
        fmt.Printf("10 / 3 = %.4f\\n", result) // 3.3333
    }

    // Ошибочный вызов
    _, err = divide(5, 0)
    if err != nil {
        fmt.Println("Ошибка:", err) // деление на ноль невозможно
    }

    // Игнорирование значения через _
    val, _ := parseAndDouble("21")
    fmt.Println(val) // 42

    _, err = parseAndDouble("abc")
    fmt.Println(err) // не удалось разобрать "abc": ...
}`,
            explanation: `Паттерн (result, error) — это идиоматический Go, который вы будете встречать в каждом реальном проекте.

Ключевые моменты этого примера:

Первое: return 0, errors.New("...") — при ошибке возвращаем нулевое значение первого возврата и ненулевую ошибку. Это конвенция, а не требование — но нарушать её не стоит.

Второе: return a / b, nil — при успехе возвращаем результат и nil. nil для типа error означает «ошибки нет».

Третье: _ (подчёркивание) — blank identifier. Если одно из возвращаемых значений не нужно, используйте _. Go не позволяет объявить переменную и не использовать её, но _ специально для таких случаев.

Четвёртое: fmt.Errorf с глаголом %w — это «обёртка» ошибки (error wrapping, появился в Go 1.13). Она позволяет позже распаковать исходную ошибку через errors.Is() или errors.As().

В реальных Go-проектах проверка ошибок занимает значительную часть кода. Это не плохо — это явность: каждая потенциально ошибочная операция обрабатывается сразу, код становится предсказуемым.`
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Соглашение по ошибкам:</strong> ошибка всегда идёт <em>последним</em> возвращаемым значением. Это конвенция, которую соблюдает вся стандартная библиотека Go и весь экосистемный код. Никогда не нарушайте её — инструменты и другие разработчики ожидают именно такой порядок.</p>`
        },
        {
            type: 'theory',
            content: `
                <h2>Именованные возвращаемые значения</h2>
                <p>В Go можно дать имена возвращаемым значениям прямо в сигнатуре функции. Они автоматически инициализируются нулевыми значениями, и можно использовать <strong>naked return</strong> — <code>return</code> без аргументов.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Аспект</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Обычный возврат</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Именованный возврат</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Синтаксис</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>(float64, float64)</code></td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>(area, perimeter float64)</code></td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Инициализация</td>
                            <td style="padding:10px;border:1px solid var(--border)">Вручную объявлять</td>
                            <td style="padding:10px;border:1px solid var(--border)">Автоматически (нулевые значения)</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">return</td>
                            <td style="padding:10px;border:1px solid var(--border)">Явно: <code>return a, p</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Можно naked: <code>return</code></td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Документация</td>
                            <td style="padding:10px;border:1px solid var(--border)">Менее очевидно</td>
                            <td style="padding:10px;border:1px solid var(--border)">Имена служат документацией</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Рекомендация</td>
                            <td style="padding:10px;border:1px solid var(--border)">Для коротких функций</td>
                            <td style="padding:10px;border:1px solid var(--border)">Когда имена улучшают читаемость</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Именованные возвращаемые значения',
            code: `package main

import (
    "fmt"
    "errors"
)

// rectInfo — имена area и perimeter служат документацией
func rectInfo(width, height float64) (area, perimeter float64) {
    area = width * height          // прямое присваивание именованным переменным
    perimeter = 2 * (width + height)
    return                         // naked return — вернёт area и perimeter
}

// safeDivide использует именованный err для удобства
func safeDivide(a, b float64) (result float64, err error) {
    if b == 0 {
        err = errors.New("деление на ноль")
        return // naked return: result=0, err=ошибка
    }
    result = a / b
    return // naked return: result=значение, err=nil
}

func main() {
    a, p := rectInfo(5, 3)
    fmt.Printf("Площадь: %.1f, Периметр: %.1f\\n", a, p)
    // Площадь: 15.0, Периметр: 16.0

    res, err := safeDivide(10, 4)
    if err != nil {
        fmt.Println("Ошибка:", err)
    } else {
        fmt.Printf("10 / 4 = %.2f\\n", res) // 10 / 4 = 2.50
    }
}`,
            explanation: `Именованные возвращаемые значения — мощный инструмент, но важно использовать его правильно.

Плюсы: имена area и perimeter сразу объясняют что возвращает функция без необходимости читать тело. Это живая документация прямо в сигнатуре. В функции safeDivide именованный err избавляет от объявления var err error в начале тела.

Минусы naked return: в длинных функциях (>15-20 строк) naked return затрудняет понимание — непонятно что именно возвращается. Представьте функцию из 50 строк с несколькими путями выполнения и везде голый return — читатель должен помнить все именованные переменные.

Рекомендация Go community: используйте именованные возвраты для документирования (особенно когда возвращается 3+ значений), но избегайте naked return в длинных функциях. Линтер go vet и golangci-lint могут предупреждать о naked return в длинных функциях.

Именованные возвраты особенно полезны с defer: defer может читать и изменять именованные возвращаемые значения, что позволяет реализовать сложную логику очистки.`
        },
        {
            type: 'theory',
            content: `
                <h2>Вариативные функции (variadic)</h2>
                <p>Иногда не знаешь заранее, сколько аргументов будет передано. Например, <code>fmt.Println</code> принимает любое количество значений. В Go это реализуется через <strong>вариативный параметр</strong> с синтаксисом <code>...тип</code>.</p>
                <p>Вариативный параметр внутри функции становится обычным <strong>слайсом</strong>. Если передать слайс в вариативную функцию, используйте оператор <code>...</code> для «разворачивания».</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Вариативные функции',
            code: `package main

import "fmt"

// sum принимает любое количество int
func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

// logger — вариативный после обязательных параметров
func logger(level string, messages ...string) {
    fmt.Printf("[%s] ", level)
    for i, msg := range messages {
        if i > 0 {
            fmt.Print(", ")
        }
        fmt.Print(msg)
    }
    fmt.Println()
}

func main() {
    fmt.Println(sum())              // 0   — ноль аргументов допустимо
    fmt.Println(sum(1))             // 1
    fmt.Println(sum(1, 2, 3))       // 6
    fmt.Println(sum(10, 20, 30, 40)) // 100

    // Передача слайса в вариативную функцию через ...
    numbers := []int{5, 10, 15, 20}
    fmt.Println(sum(numbers...))    // 50

    logger("INFO", "сервер запущен", "порт 8080")
    // [INFO] сервер запущен, порт 8080

    logger("ERROR", "база данных недоступна")
    // [ERROR] база данных недоступна
}`,
            explanation: `Вариативные функции — элегантное решение для случаев с переменным числом аргументов.

Синтаксис nums ...int означает «ноль или более int». Внутри функции nums — это обычный []int, и с ним работают все слайсовые операции: len(nums), nums[0], range nums.

Важное ограничение: вариативный параметр должен быть последним в списке параметров. Нельзя написать func f(a ...int, b string) — это ошибка компиляции. Но можно func f(b string, a ...int) — обязательные параметры идут перед вариативным.

Оператор ... при вызове (numbers...) делает «распаковку» слайса в отдельные аргументы. Это не копирование данных — слайс передаётся напрямую. Будьте внимательны: если вариативная функция изменит переданный слайс (это возможно для изменяемых значений), изменения отразятся в оригинале.

Реальные примеры вариативных функций из стандартной библиотеки: fmt.Println(a ...any), append(slice []T, elems ...T), strings.Join — хотя последняя не вариативная, а принимает слайс. Понимание этого паттерна помогает читать документацию стандартной библиотеки.`
        },
        {
            type: 'theory',
            content: `
                <h2>defer — отложенное выполнение</h2>
                <p><code>defer</code> откладывает выполнение функции до момента выхода из окружающей функции. Это главный инструмент для гарантированной очистки ресурсов: закрытие файлов, разблокировка мьютексов, завершение транзакций.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Свойство defer</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Поведение</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Порядок выполнения</td>
                            <td style="padding:10px;border:1px solid var(--border)">LIFO (стек) — последний defer выполняется первым</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Когда выполняется</td>
                            <td style="padding:10px;border:1px solid var(--border)">При выходе из функции: return, panic, конец функции</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Аргументы</td>
                            <td style="padding:10px;border:1px solid var(--border)">Вычисляются в момент defer, не в момент выполнения</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Именованные возвраты</td>
                            <td style="padding:10px;border:1px solid var(--border)">defer может изменять именованные возвращаемые значения</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'defer в действии',
            code: `package main

import "fmt"

func openResource(name string) string {
    fmt.Println("Открываем:", name)
    return name
}

func closeResource(name string) {
    fmt.Println("Закрываем:", name)
}

func processFile(filename string) {
    res := openResource(filename)
    defer closeResource(res) // выполнится при выходе из функции

    fmt.Println("Обрабатываем:", filename)
    // closeResource вызовется автоматически, даже если будет ошибка
}

func deferOrder() {
    fmt.Println("Порядок defer (LIFO):")
    defer fmt.Println("defer 1 — последний зарегистрированный")
    defer fmt.Println("defer 2")
    defer fmt.Println("defer 3 — первый зарегистрированный")
    fmt.Println("тело функции")
}

func main() {
    processFile("data.txt")
    // Открываем: data.txt
    // Обрабатываем: data.txt
    // Закрываем: data.txt

    fmt.Println("---")
    deferOrder()
    // тело функции
    // defer 1 — последний зарегистрированный
    // defer 2
    // defer 3 — первый зарегистрированный
}`,
            explanation: `defer — один из самых любимых разработчиками механизмов Go из-за его элегантности.

Идиома "открыть → сразу defer закрыть" делает код надёжным: даже если в середине функции произойдёт panic или ранний return, ресурс обязательно будет освобождён. В реальном коде это выглядит так:

    file, err := os.Open("data.txt")
    if err != nil { return err }
    defer file.Close()  // гарантированное закрытие

    mu.Lock()
    defer mu.Unlock()   // гарантированная разблокировка

Порядок LIFO (Last In First Out) важен: если вы открываете ресурс A, потом B, defer закроет сначала B, потом A. Это правильный порядок закрытия зависимых ресурсов.

Аргументы defer вычисляются немедленно. В примере defer closeResource(res) — значение res захватывается в момент вызова defer, не в момент фактического выполнения. Это важно понимать при использовании defer в циклах.

Одна ловушка: defer в цикле может накапливать большое количество отложенных вызовов. Если в цикле нужно закрывать ресурс на каждой итерации, лучше вынести тело в отдельную функцию.`
        },
        {
            type: 'theory',
            content: `
                <h2>Замыкания и функции как значения</h2>
                <p><strong>Замыкание</strong> (closure) — это функция, которая «захватывает» и помнит переменные из скоупа, в котором была создана. Даже после того, как внешняя функция завершилась, замыкание продолжает иметь доступ к этим переменным.</p>
                <p>Аналогия: рюкзак. Когда вы уходите из дома (внешняя функция завершилась), вы берёте с собой рюкзак (замыкание) с нужными вещами (переменными). Дом снесли — а вещи в рюкзаке остались.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Замыкания — счётчик и фабрика функций',
            code: `package main

import "fmt"

// makeCounter возвращает функцию-счётчик
// Каждый вызов makeCounter создаёт независимый счётчик
func makeCounter() func() int {
    count := 0 // эта переменная "захватывается" замыканием
    return func() int {
        count++ // count живёт в замыкании, не в стеке makeCounter
        return count
    }
}

// makeMultiplier — фабрика функций умножения
func makeMultiplier(factor int) func(int) int {
    return func(x int) int {
        return x * factor // factor захвачен из внешнего скоупа
    }
}

// makeAdder — замыкание с накоплением
func makeAdder(initial int) func(int) int {
    sum := initial
    return func(n int) int {
        sum += n
        return sum
    }
}

func main() {
    // Два независимых счётчика с общей логикой
    counter1 := makeCounter()
    counter2 := makeCounter()

    fmt.Println(counter1()) // 1
    fmt.Println(counter1()) // 2
    fmt.Println(counter1()) // 3
    fmt.Println(counter2()) // 1 — независимый от counter1!
    fmt.Println(counter2()) // 2

    // Фабрика умножителей
    double := makeMultiplier(2)
    triple := makeMultiplier(3)
    fmt.Println(double(5))  // 10
    fmt.Println(triple(5))  // 15

    // Накапливающий сумматор
    adder := makeAdder(100)
    fmt.Println(adder(10))  // 110
    fmt.Println(adder(20))  // 130
    fmt.Println(adder(5))   // 135
}`,
            explanation: `Замыкания — мощный инструмент, но требуют понимания жизненного цикла переменных.

Когда makeCounter() возвращает анонимную функцию, переменная count НЕ уничтожается вместе со стек-фреймом makeCounter. Go замечает, что count захвачена замыканием, и перемещает её в кучу (heap allocation). Замыкание держит ссылку на эту переменную.

Это объясняет почему counter1 и counter2 независимы: каждый вызов makeCounter() создаёт новую переменную count в куче. counter1 держит ссылку на одну count, counter2 — на другую.

Паттерн фабрики функций (makeMultiplier, makeAdder) широко используется в Go для создания конфигурируемых обработчиков. Например, в HTTP-серверах:
    func makeAuthMiddleware(secretKey string) http.Handler { ... }

Распространённая ошибка с замыканиями в циклах:
    funcs := make([]func(), 3)
    for i := 0; i < 3; i++ {
        funcs[i] = func() { fmt.Println(i) } // ОШИБКА: все печатают 3
    }
Все функции захватят одну и ту же переменную i. Исправление: передавайте i как аргумент или создавайте локальную копию: i := i внутри цикла.`
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<p><strong>Ловушка замыканий в цикле:</strong> все итерационные замыкания захватывают одну и ту же переменную цикла, не её значение на каждой итерации. Решение: создавайте локальную копию переменной внутри тела цикла:</p>
<pre style="margin-top:8px;background:var(--surface-2);padding:8px;border-radius:4px"><code>for i := 0; i &lt; 3; i++ {
    i := i  // новая переменная для каждой итерации
    go func() { fmt.Println(i) }()
}</code></pre>`
        },
        {
            type: 'editor',
            title: 'Практика: Функции высшего порядка',
            instructions: 'Реализуйте три функции высшего порядка: filter (фильтрует элементы по предикату), mapInts (применяет преобразование к каждому элементу), reduce (сворачивает слайс в одно значение). Используйте их для: (1) выбора чётных чисел из [1..10], (2) возведения в квадрат, (3) подсчёта суммы.',
            starterCode: `package main

import "fmt"

// filter возвращает элементы, для которых predicate == true
func filter(nums []int, predicate func(int) bool) []int {
    // Ваш код
    return nil
}

// mapInts применяет f к каждому элементу и возвращает новый слайс
func mapInts(nums []int, f func(int) int) []int {
    // Ваш код
    return nil
}

// reduce сворачивает слайс: начинает с initial, применяет f(аккумулятор, элемент)
func reduce(nums []int, initial int, f func(int, int) int) int {
    // Ваш код
    return 0
}

func main() {
    numbers := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

    // Шаг 1: оставить только чётные
    evens := filter(numbers, func(n int) bool {
        return n%2 == 0
    })
    fmt.Println("Чётные:", evens) // [2 4 6 8 10]

    // Шаг 2: возвести в квадрат
    squares := mapInts(evens, func(n int) int {
        return n * n
    })
    fmt.Println("Квадраты:", squares) // [4 16 36 64 100]

    // Шаг 3: сумма квадратов
    total := reduce(squares, 0, func(acc, n int) int {
        return acc + n
    })
    fmt.Println("Сумма:", total) // 220
}`,
            hints: [
                'filter: создайте result := []int{}, в for range проверяйте predicate(n), если true — append',
                'mapInts: result := make([]int, len(nums)), в цикле result[i] = f(nums[i])',
                'reduce: acc := initial, в for range acc = f(acc, n), верните acc',
                'Проверьте: сумма 4+16+36+64+100 = 220'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что такое naked return в Go?',
                    options: [
                        'return без аргументов при именованных возвращаемых значениях',
                        'return nil в функции',
                        'return в конце функции без значения',
                        'Функция без return вообще'
                    ],
                    correct: 0,
                    explanation: 'Naked return — это return без аргументов. Работает только если возвращаемые значения именованы в сигнатуре функции. Он возвращает текущие значения именованных переменных.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Сколько значений может возвращать функция в Go?',
                    options: [
                        'Любое количество',
                        'Только одно',
                        'Максимум два',
                        'Максимум пять'
                    ],
                    correct: 0,
                    explanation: 'Функции Go могут возвращать любое количество значений. Наиболее типичный паттерн — два: результат и ошибка. Технически ограничений нет, но больше 3-4 возвращаемых значений считается плохим стилем.'
                },
                {
                    id: 'q3',
                    type: 'code-fill',
                    question: 'Как объявить вариативный параметр типа string?',
                    template: 'func log(prefix string, messages ___ string)',
                    correct: '...',
                    caseSensitive: true,
                    explanation: '... перед типом делает параметр вариативным. Внутри функции messages будет []string. Вариативный параметр всегда последний.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Когда выполняется defer?',
                    options: [
                        'При выходе из окружающей функции (return, panic, конец)',
                        'Немедленно после строки с defer',
                        'В начале следующей итерации цикла',
                        'При сборке мусора'
                    ],
                    correct: 0,
                    explanation: 'defer откладывает выполнение до выхода из функции. При нескольких defer они выполняются в порядке LIFO (стек): последний зарегистрированный выполняется первым.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Что такое замыкание (closure)?',
                    options: [
                        'Функция, захватывающая переменные из внешнего скоупа',
                        'Функция без параметров',
                        'Функция, возвращающая void',
                        'Приватная функция пакета'
                    ],
                    correct: 0,
                    explanation: 'Замыкание — это функция, которая "помнит" переменные из области видимости, где была создана. Захваченные переменные живут на куче, пока замыкание существует.'
                },
                {
                    id: 'q6',
                    type: 'multiple',
                    question: 'Какие утверждения о функциях Go верны? (выберите все правильные)',
                    options: [
                        'Функции — значения первого класса',
                        'Go поддерживает перегрузку функций (overloading)',
                        'Функции можно передавать как аргументы',
                        'Функции могут возвращать несколько значений',
                        'Вариативный параметр всегда идёт последним'
                    ],
                    correct: [0, 2, 3, 4],
                    explanation: 'Go НЕ поддерживает перегрузку функций. Все остальные утверждения верны: функции первого класса, передаются как аргументы, множественный возврат, вариативный параметр последний.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Как передать слайс nums в вариативную функцию sum(nums ...int)?',
                    options: [
                        'sum(nums...)',
                        'sum(nums)',
                        'sum(&nums)',
                        'sum(*nums)'
                    ],
                    correct: 0,
                    explanation: 'Оператор ... при вызове "разворачивает" слайс в отдельные аргументы. sum(nums...) эквивалентно sum(nums[0], nums[1], ..., nums[n-1]).'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'В каком порядке выполняются несколько defer в одной функции?',
                    options: [
                        'LIFO — последний зарегистрированный выполняется первым',
                        'FIFO — первый зарегистрированный выполняется первым',
                        'В произвольном порядке',
                        'Параллельно'
                    ],
                    correct: 0,
                    explanation: 'defer работает как стек (LIFO): defer 1, defer 2, defer 3 — выполнятся в порядке 3, 2, 1. Это правильный порядок для закрытия вложенных ресурсов.'
                }
            ]
        }
    ]
};
