export default {
    id: '01-05',
    title: 'Массивы и слайсы',
    description: 'Массивы фиксированной длины, слайсы, len/cap, append, copy, трёхиндексный слайс, nil-слайс, подслайсы и общая память',
    estimatedTime: 35,
    xpReward: 28,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Парковка фиксированная и резиновая</h2>
                <p>Представьте два типа парковок. <strong>Обычная парковка</strong> — 50 мест, всегда 50, не больше и не меньше. Если машин 30 — 20 мест пустуют. Если машин 60 — десять не влезут. Это массив.</p>
                <p><strong>«Резиновая» парковка</strong> — начинается с 10 мест, но при заполнении автоматически расширяется: появляются новые уровни. Вы всегда знаете сколько машин сейчас (длина) и сколько мест доступно до следующего расширения (ёмкость). Это слайс.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Характеристика</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Массив (Array)</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Слайс (Slice)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Длина</td>
                            <td style="padding:10px;border:1px solid var(--border)">Фиксированная, часть типа</td>
                            <td style="padding:10px;border:1px solid var(--border)">Динамическая</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Тип</td>
                            <td style="padding:10px;border:1px solid var(--border)">[3]int ≠ [5]int</td>
                            <td style="padding:10px;border:1px solid var(--border)">[]int (одинаково для любой длины)</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Передача в функцию</td>
                            <td style="padding:10px;border:1px solid var(--border)">По значению (копия)</td>
                            <td style="padding:10px;border:1px solid var(--border)">Заголовок по значению, данные — общие</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Нулевое значение</td>
                            <td style="padding:10px;border:1px solid var(--border)">Все элементы = нулевые</td>
                            <td style="padding:10px;border:1px solid var(--border)">nil</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Когда использовать</td>
                            <td style="padding:10px;border:1px solid var(--border)">Размер известен, фиксирован (SHA256, матрицы)</td>
                            <td style="padding:10px;border:1px solid var(--border)">Почти всегда — основная коллекция Go</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Массивы: объявление и особенности',
            code: `package main

import "fmt"

func main() {
    // Объявление с нулевыми значениями
    var scores [5]int
    scores[0] = 10
    scores[4] = 50
    fmt.Println(scores) // [10 0 0 0 50]

    // Литерал массива
    colors := [3]string{"red", "green", "blue"}
    fmt.Println(colors[1]) // green

    // ... — компилятор считает элементы сам
    primes := [...]int{2, 3, 5, 7, 11, 13}
    fmt.Println(len(primes)) // 6

    // [3]int и [5]int — РАЗНЫЕ типы!
    var a [3]int
    var b [5]int
    _ = a
    _ = b
    // a = b  // ← ошибка компиляции!

    // Массивы КОПИРУЮТСЯ при присваивании
    x := [3]int{1, 2, 3}
    y := x        // y — независимая копия
    y[0] = 999
    fmt.Println(x) // [1 2 3]   — не изменился
    fmt.Println(y) // [999 2 3] — изменился только y

    // Двумерный массив (матрица 3×3)
    matrix := [3][3]int{
        {1, 0, 0},
        {0, 1, 0},
        {0, 0, 1},
    }
    fmt.Println(matrix[1][1]) // 1 (диагональ)
}`,
            explanation: `Массивы в Go имеют несколько отличительных свойств по сравнению с другими языками.

Длина — часть типа: [3]int и [5]int это абсолютно разные типы, как int и string. Нельзя присвоить одно другому и нельзя передать в функцию, ожидающую другой размер. Это делает сигнатуры функций очень точными, но и менее гибкими.

Копирование при присваивании: в отличие от Java или Python, в Go y := x для массива создаёт полную независимую копию всех данных. Изменение y не затронет x. Для больших массивов это дорого по памяти и CPU — ещё один повод предпочитать слайсы.

Синтаксис [...] позволяет не считать элементы вручную — компилятор посчитает сам. Это удобно для инициализированных литералов, но не меняет сути: массив по-прежнему фиксированного размера.

Когда массивы нужны: фиксированные структуры данных (RGB-цвет как [3]byte, хеш как [32]byte для SHA-256, шахматная доска как [8][8]int). В этих случаях фиксированность — преимущество, а не ограничение.`
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: '<p><strong>На практике массивы используются редко.</strong> Почти всегда правильный выбор — слайс. Массив нужен когда: размер фиксирован по природе задачи (SHA-256 хеш всегда 32 байта), нужна передача по значению с гарантией независимости, или работаете с низкоуровневым кодом. В 95% случаев пишите <code>[]T</code>, а не <code>[N]T</code>.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Слайс: три числа под капотом</h2>
                <p>Слайс — это не просто «массив с динамическим размером». Внутренне слайс — это <strong>структура из трёх полей</strong>: указатель на данные, длина и ёмкость. Понимание этого объясняет всё поведение слайсов.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Поле</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Тип</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Функция</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Получение</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">ptr</td>
                            <td style="padding:10px;border:1px solid var(--border)">unsafe.Pointer</td>
                            <td style="padding:10px;border:1px solid var(--border)">Адрес первого элемента</td>
                            <td style="padding:10px;border:1px solid var(--border)">—</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">len</td>
                            <td style="padding:10px;border:1px solid var(--border)">int</td>
                            <td style="padding:10px;border:1px solid var(--border)">Количество доступных элементов</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>len(s)</code></td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">cap</td>
                            <td style="padding:10px;border:1px solid var(--border)">int</td>
                            <td style="padding:10px;border:1px solid var(--border)">Элементов до конца нижнего массива</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>cap(s)</code></td>
                        </tr>
                    </tbody>
                </table>

                <p style="margin-top:16px">Когда вы передаёте слайс в функцию, копируется только этот заголовок (24 байта на 64-битных системах). Данные не копируются — функция работает с теми же данными.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Создание слайсов: три способа',
            code: `package main

import "fmt"

func main() {
    // Способ 1: литерал слайса
    nums := []int{10, 20, 30, 40, 50}
    fmt.Printf("nums: len=%d cap=%d %v\\n", len(nums), cap(nums), nums)
    // nums: len=5 cap=5 [10 20 30 40 50]

    // Способ 2: make(тип, длина, ёмкость)
    buf := make([]byte, 0, 1024) // готовим буфер на 1024 байта
    fmt.Printf("buf: len=%d cap=%d\\n", len(buf), cap(buf))
    // buf: len=0 cap=1024

    preallocated := make([]int, 5)    // длина=5, ёмкость=5
    fmt.Println(preallocated)         // [0 0 0 0 0]

    // Способ 3: nil-слайс (нулевое значение)
    var empty []int
    fmt.Println(empty == nil)         // true
    fmt.Println(len(empty), cap(empty)) // 0 0
    // nil-слайс безопасен: append, range, len, cap работают

    // Разница nil-слайса и пустого слайса
    nilSlice := []int(nil)
    emptySlice := []int{}
    fmt.Println(nilSlice == nil)   // true
    fmt.Println(emptySlice == nil) // false  ← пустой ≠ nil!
    fmt.Println(len(nilSlice) == len(emptySlice)) // true — оба 0
}`,
            explanation: `Три способа создания слайсов — и у каждого своё место применения.

Литерал []int{1, 2, 3} используйте когда данные известны заранее. len и cap будут равны количеству элементов.

make([]T, len, cap) — для случаев когда нужен слайс заранее известного размера или нужно зарезервировать ёмкость. Два важных паттерна:
- make([]T, n) — создать n нулевых элементов (потом индексировать)
- make([]T, 0, n) — пустой слайс с зарезервированной ёмкостью (потом append)

Выбор между ними: если вы знаете финальный размер — make([]T, n), потом result[i] = v. Если набираете через append — make([]T, 0, оценка_размера).

Nil-слайс vs пустой слайс: это тонкое различие, которое важно в некоторых контекстах. При сериализации в JSON: nil-слайс → null, пустой слайс → []. Поэтому в API-ответах часто делают:
    if result == nil { result = []int{} }
чтобы клиент всегда получал массив, а не null.

Все три варианта безопасны с len, cap, range, append. Паника от nil бывает только с map, не со слайсом.`
        },
        {
            type: 'theory',
            content: `
                <h2>append и рост слайса</h2>
                <p><code>append</code> — встроенная функция добавления элементов. Главное правило: <strong>всегда присваивайте результат обратно</strong>: <code>s = append(s, elem)</code>.</p>
                <p>Когда текущей ёмкости не хватает, Go выделяет новый массив большего размера и копирует данные. Стратегия роста: примерно удвоение для маленьких слайсов, затем 1.25x для больших (точный алгоритм изменился в Go 1.18).</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'append: рост, несколько элементов, слияние',
            code: `package main

import "fmt"

func main() {
    // Наблюдаем рост ёмкости
    var s []int
    for i := 0; i < 8; i++ {
        s = append(s, i)
        fmt.Printf("len=%d cap=%d\\n", len(s), cap(s))
    }
    // len=1 cap=1
    // len=2 cap=2
    // len=3 cap=4   ← удвоение
    // len=4 cap=4
    // len=5 cap=8   ← удвоение
    // len=6 cap=8
    // len=7 cap=8
    // len=8 cap=8

    // Добавление нескольких элементов сразу
    s2 := []int{1, 2, 3}
    s2 = append(s2, 4, 5, 6)
    fmt.Println(s2) // [1 2 3 4 5 6]

    // Слияние двух слайсов через ...
    a := []int{1, 2, 3}
    b := []int{4, 5, 6}
    c := append(a, b...)
    fmt.Println(c) // [1 2 3 4 5 6]

    // Эффективный сбор элементов с предварительной аллокацией
    n := 1000
    result := make([]int, 0, n) // зарезервируем место
    for i := 0; i < n; i++ {
        result = append(result, i*i)
    }
    fmt.Println("Собрано квадратов:", len(result)) // 1000
    // Без make было бы ~10 переаллокаций
}`,
            explanation: `append — самая используемая встроенная функция в Go. Важно понимать её поведение.

Почему s = append(s, v)? Если append находит достаточно ёмкости в нижнем массиве, он увеличивает len заголовка слайса и возвращает его. Если ёмкости не хватает — выделяет новый массив, копирует данные, возвращает новый заголовок с новым ptr. Если не присвоить результат, вы потеряете указатель на новые данные.

Предварительная аллокация — один из главных способов оптимизации в Go. Если вы знаете приблизительный размер результирующего слайса, make([]T, 0, capacity) избавит от множества переаллокаций. Каждая переаллокация = новый malloc + копирование всех данных.

Слияние слайсов append(a, b...) — идиоматический паттерн. Оператор ... разворачивает b в отдельные аргументы. После этой операции важно понимать: если у a было достаточно ёмкости, c будет разделять нижний массив с a. Для безопасности используйте append(append([]int{}, a...), b...) или copy.`
        },
        {
            type: 'theory',
            content: `
                <h2>Подслайсы: окно в общий массив</h2>
                <p>Оператор <code>s[low:high]</code> создаёт новый слайс-заголовок, указывающий на те же данные. Это <strong>не копирование</strong> — операция O(1). Но это значит, что изменения через подслайс видны в оригинале и наоборот.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Синтаксис</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Значение</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Пример (s = [0,1,2,3,4])</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>s[low:high]</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">элементы [low, high)</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>s[1:4]</code> → [1,2,3]</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>s[:high]</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">от начала до high</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>s[:3]</code> → [0,1,2]</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>s[low:]</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">от low до конца</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>s[2:]</code> → [2,3,4]</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>s[:]</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">весь слайс (новый заголовок)</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>s[:]</code> → [0,1,2,3,4]</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>s[low:high:max]</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">трёхиндексный, cap=max-low</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>s[1:3:4]</code> → [1,2], cap=3</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Подслайсы, общая память и трёхиндексный срез',
            code: `package main

import "fmt"

func main() {
    original := []int{10, 20, 30, 40, 50}

    // Подслайс — окно в тот же массив
    sub := original[1:4]
    fmt.Println(sub)            // [20 30 40]
    fmt.Printf("len=%d cap=%d\\n", len(sub), cap(sub))
    // len=3 cap=4   ← cap считается до конца оригинала!

    // Изменение через подслайс видно в оригинале
    sub[0] = 999
    fmt.Println(original) // [10 999 30 40 50] ← изменился!

    // Трёхиндексный срез s[low:high:max]
    // Ограничивает ёмкость подслайса — защита от случайного расширения
    safe := original[1:3:3] // len=2, cap=2
    fmt.Printf("safe: len=%d cap=%d %v\\n", len(safe), cap(safe), safe)
    // safe: len=2 cap=2 [999 30]

    // Теперь append к safe не затронет original
    safe = append(safe, 777)  // создаст новый массив
    fmt.Println(original)     // [10 999 30 40 50] — не изменился
    fmt.Println(safe)         // [999 30 777]

    // Без трёхиндексного — append затронул бы original[3]!
    unsafe := original[1:3]     // len=2, cap=4 — опасно
    unsafe = append(unsafe, 888) // запишет на место original[3]!
    fmt.Println(original) // [10 999 30 888 50] ← original[3] изменился!
}`,
            explanation: `Подслайсы — самая хитрая часть работы со слайсами в Go. Две главные ловушки.

Ловушка 1 — изменение данных: sub и original указывают на один массив. sub[0] = 999 меняет original[1]. Это не всегда плохо — в некоторых алгоритмах именно такое разделение памяти нужно для эффективности. Но если вам нужна независимость, используйте copy.

Ловушка 2 — ёмкость и append: sub := original[1:4] имеет len=3 но cap=4 (до конца оригинала). Когда вы делаете append(sub, x), Go видит свободное место в ёмкости и записывает x прямо в original[4], не создавая новый массив. original изменяется незаметно для вас!

Трёхиндексный срез s[low:high:max] решает ловушку 2: он ограничивает ёмкость подслайса. safe := original[1:3:3] — cap=2, нет свободного места. Первый же append создаст новый массив, original останется нетронутым.

Правило: если передаёте подслайс в функцию, которая может вызывать append — используйте трёхиндексный срез или делайте копию через copy.`
        },
        {
            type: 'info-box',
            variant: 'danger',
            content: `<p><strong>Утечка памяти через подслайс:</strong> если вы держите маленький подслайс большого массива, весь большой массив не может быть собран GC — подслайс держит на него ссылку. Пример: читаете файл 100MB в []byte, берёте sub := data[0:10], храните sub. Все 100MB остаются в памяти! Решение: <code>copy(result, data[0:10])</code> — копируете 10 байт, большой массив освобождается.</p>`
        },
        {
            type: 'theory',
            content: `
                <h2>copy и безопасное копирование</h2>
                <p>Встроенная функция <code>copy(dst, src)</code> копирует элементы из src в dst. Копирует <code>min(len(dst), len(src))</code> элементов и возвращает количество скопированных. После copy dst и src независимы.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'copy, клонирование и типичные паттерны',
            code: `package main

import "fmt"

func main() {
    src := []int{1, 2, 3, 4, 5}

    // copy — гарантированно независимая копия
    dst := make([]int, len(src))
    n := copy(dst, src)
    fmt.Println(n, dst) // 5 [1 2 3 4 5]

    // Изменения независимы
    dst[0] = 999
    fmt.Println(src) // [1 2 3 4 5] — не изменился

    // Альтернатива: append в nil-слайс
    clone := append([]int(nil), src...)
    fmt.Println(clone) // [1 2 3 4 5]

    // copy копирует только min(len(dst), len(src))
    small := make([]int, 3)
    copy(small, src) // копирует 3 из 5
    fmt.Println(small) // [1 2 3]

    // ПАТТЕРН: удаление элемента по индексу (без сохранения порядка)
    s := []int{10, 20, 30, 40, 50}
    i := 2 // удаляем 30
    s[i] = s[len(s)-1]        // заменяем последним
    s = s[:len(s)-1]           // уменьшаем длину
    fmt.Println(s)             // [10 20 50 40] (быстро, O(1))

    // ПАТТЕРН: удаление с сохранением порядка (O(n))
    s2 := []int{10, 20, 30, 40, 50}
    j := 2
    s2 = append(s2[:j], s2[j+1:]...)
    fmt.Println(s2) // [10 20 40 50]

    // ПАТТЕРН: вставка в позицию
    s3 := []int{1, 2, 4, 5}
    s3 = append(s3[:2], append([]int{3}, s3[2:]...)...)
    fmt.Println(s3) // [1 2 3 4 5]
}`,
            explanation: `copy и паттерны работы со слайсами — практически важный раздел.

copy(dst, src) требует заранее выделенный dst нужного размера. Если dst меньше src — скопируются только первые len(dst) элементов. Это не ошибка — возвращаемое значение сообщит сколько скопировано.

Паттерн append([]int(nil), src...) — элегантный способ клонирования без явного make. Под капотом то же самое: создаётся новый массив, данные копируются. В коде чуть компактнее.

Удаление элемента — в Go нет встроенного delete для слайсов (в отличие от map). Два подхода:

Быстрое O(1): заменить удаляемый элемент последним, уменьшить длину. Порядок нарушается — подходит для множеств, очередей с произвольным удалением.

С сохранением O(n): append(s[:i], s[i+1:]...) — сдвигает все элементы после i влево. Медленнее, но сохраняет порядок.

Вставка в середину: append(s[:i], append([]int{elem}, s[i:]...)...) — создаёт временный слайс, что не идеально. Для частых вставок лучше использовать container/list из стандартной библиотеки.`
        },
        {
            type: 'editor',
            title: 'Практика: Работа со слайсами',
            instructions: 'Реализуйте функцию unique, которая принимает слайс целых чисел (необязательно отсортированный) и возвращает новый слайс только с уникальными элементами, сохраняя первый порядок встречания. Например: [3, 1, 4, 1, 5, 9, 2, 6, 5] → [3, 1, 4, 5, 9, 2, 6].',
            starterCode: `package main

import "fmt"

func unique(nums []int) []int {
    // Ваш код здесь
    // Подсказка: используйте map[int]bool для отслеживания увиденных элементов
    return nil
}

func main() {
    input := []int{3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5}
    result := unique(input)
    fmt.Println(result)
    // Ожидается: [3 1 4 5 9 2 6]
    // (первый порядок встречания, без дубликатов)
}`,
            hints: [
                'Создайте seen := make(map[int]bool) для отслеживания уже виденных чисел',
                'Создайте result := make([]int, 0, len(nums)) — предаллоцируйте',
                'В цикле: если seen[n] == false, добавьте n в result и отметьте seen[n] = true',
                'Верните result'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Из скольких полей состоит заголовок слайса в Go?',
                    options: [
                        'Трёх: указатель, длина, ёмкость',
                        'Двух: длина и ёмкость',
                        'Одного: указатель на данные',
                        'Четырёх: указатель, длина, ёмкость, тип'
                    ],
                    correct: 0,
                    explanation: 'Слайс — это структура из трёх полей: указатель (ptr) на нижнее данные, len (текущая длина) и cap (ёмкость до конца нижнего массива). Именно это объясняет почему подслайсы разделяют данные с оригиналом.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что произойдёт при изменении элемента подслайса?',
                    options: [
                        'Изменится и оригинальный слайс (общий нижний массив)',
                        'Создастся независимая копия данных',
                        'Произойдёт panic',
                        'Ошибка компиляции'
                    ],
                    correct: 0,
                    explanation: 'Подслайс s[i:j] указывает на тот же нижний массив. Изменение элементов подслайса меняет и оригинал. Для независимости используйте copy.'
                },
                {
                    id: 'q3',
                    type: 'code-fill',
                    question: 'Как создать слайс длиной 5 и ёмкостью 100?',
                    template: 's := ___([]int, 5, 100)',
                    correct: 'make',
                    caseSensitive: true,
                    explanation: 'make([]T, length, capacity) создаёт слайс с заданными длиной и ёмкостью. Предаллокация ёмкости уменьшает количество переаллокаций при последующих append.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Чему равен cap(s[2:5]) для s := make([]int, 10)?',
                    options: [
                        '8 (от индекса 2 до конца: 10-2)',
                        '3 (high-low = 5-2)',
                        '10 (cap оригинала)',
                        '5 (high)'
                    ],
                    correct: 0,
                    explanation: 'cap подслайса s[low:high] = cap(s) - low = 10 - 2 = 8. Ёмкость считается от начала подслайса до конца нижнего массива. Именно поэтому append к подслайсу может затронуть данные за его границами!'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Для чего используется трёхиндексный срез s[low:high:max]?',
                    options: [
                        'Ограничить ёмкость подслайса для защиты от неожиданного append',
                        'Создать слайс с шагом',
                        'Копировать данные',
                        'Получить подслайс в обратном порядке'
                    ],
                    correct: 0,
                    explanation: 's[low:high:max] создаёт подслайс с cap = max - low. Это предотвращает ситуацию когда append к подслайсу молча изменяет элементы оригинального слайса за пределами подслайса.'
                },
                {
                    id: 'q6',
                    type: 'multiple',
                    question: 'Какие утверждения о nil-слайсе верны? (выберите все правильные)',
                    options: [
                        'len(nil-слайс) == 0',
                        'append к nil-слайсу работает корректно',
                        'Запись по индексу nil-слайса вызывает panic',
                        'nil-слайс и пустой слайс []int{} одинаковы во всём'
                    ],
                    correct: [0, 1, 2],
                    explanation: 'len nil-слайса == 0, append работает (создаёт новый массив). Запись s[0] = v к nil-слайсу — panic (нет нижнего массива). Но nil-слайс и []int{} НЕ одинаковы: nil-слайс == nil true, []int{} == nil false; при JSON-сериализации nil → null, []int{} → [].'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Что вернёт copy(dst, src) если len(dst) = 3, len(src) = 5?',
                    options: [
                        '3 — копирует min(len(dst), len(src)) элементов',
                        '5 — копирует все из src',
                        'Panic',
                        '0 — отказывается копировать разные размеры'
                    ],
                    correct: 0,
                    explanation: 'copy копирует min(len(dst), len(src)) элементов и возвращает это количество. Если dst меньше src — скопируются только первые len(dst) элементов. Это не ошибка.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Почему нужно писать s = append(s, elem) а не просто append(s, elem)?',
                    options: [
                        'append может вернуть слайс с новым нижним массивом при нехватке ёмкости',
                        'append возвращает количество добавленных элементов',
                        'Это просто синтаксическое требование Go',
                        'Без присваивания будет утечка памяти'
                    ],
                    correct: 0,
                    explanation: 'Если ёмкости не хватает, append выделяет новый массив, копирует данные и возвращает слайс с новым ptr. Если не присвоить результат — ваша переменная s по-прежнему указывает на старый (возможно, уже устаревший) массив.'
                }
            ]
        }
    ]
};
