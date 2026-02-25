export default {
    id: '01-06',
    title: 'Maps (карты)',
    description: 'Создание map, make и литерал, comma-ok идиома, delete, nil map panic, range, сортировка ключей, map как множество',
    estimatedTime: 28,
    xpReward: 22,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Map — это телефонная книга</h2>
                <p>Представьте телефонную книгу: вы ищете по имени — получаете номер. Не важно, сколько записей — поиск быстрый. Это и есть <code>map</code>: структура данных «ключ → значение» с очень быстрым поиском O(1) в среднем.</p>
                <p>В Go <code>map</code> — встроенный тип. Аналоги в других языках: dict (Python), HashMap (Java), object/Map (JavaScript).</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Свойство</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Описание</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Тип ключей</td>
                            <td style="padding:10px;border:1px solid var(--border)">Любой <em>сравнимый</em> тип: string, int, bool, struct. Не слайсы и не функции.</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Тип значений</td>
                            <td style="padding:10px;border:1px solid var(--border)">Любой тип, включая слайсы, функции, другие map</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Порядок итерации</td>
                            <td style="padding:10px;border:1px solid var(--border)">Случайный — гарантий нет, Go намеренно рандомизирует</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Нулевое значение</td>
                            <td style="padding:10px;border:1px solid var(--border)">nil — чтение безопасно (вернёт нулевое значение), запись = panic</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Потокобезопасность</td>
                            <td style="padding:10px;border:1px solid var(--border)">Нет. Для конкурентного доступа используйте sync.Map или мьютексы</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Среднее O</td>
                            <td style="padding:10px;border:1px solid var(--border)">O(1) чтение/запись/удаление</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Создание map: литерал и make',
            code: `package main

import "fmt"

func main() {
    // Способ 1: литерал — когда данные известны заранее
    capitals := map[string]string{
        "Россия":  "Москва",
        "Франция": "Париж",
        "Япония":  "Токио",
        "Германия": "Берлин",  // запятая обязательна (даже последняя)
    }
    fmt.Println(capitals["Япония"]) // Токио

    // Способ 2: make — когда данные добавляются позже
    scores := make(map[string]int)
    scores["Alice"] = 95
    scores["Bob"]   = 87
    scores["Carol"] = 92
    fmt.Println(scores) // map[Alice:95 Bob:87 Carol:92]

    // Способ 3: пустой литерал
    tags := map[string]bool{}
    tags["go"]      = true
    tags["backend"] = true

    // map с вложенными структурами данных
    graph := map[string][]string{
        "A": {"B", "C"},
        "B": {"C", "D"},
        "C": {"D"},
    }
    fmt.Println(graph["A"]) // [B C]
    graph["A"] = append(graph["A"], "D")
    fmt.Println(graph["A"]) // [B C D]

    fmt.Println("Записей в capitals:", len(capitals)) // 4
}`,
            explanation: `Два основных способа создания — литерал и make — и у каждого своё место.

Литерал map[K]V{...} удобен когда данные известны в момент написания кода: конфигурации, маппинги кодов на сообщения, таблицы констант. Синтаксис требует запятую после каждого элемента, включая последний — это стандарт Go для всех составных литералов. Это позволяет легко добавлять элементы в конец без редактирования предпоследней строки.

make(map[K]V) создаёт инициализированную (не nil) пустую map. Опционально можно указать начальную ёмкость: make(map[string]int, 100) — Go прeallocates приблизительно на 100 элементов. Это не лимит, а подсказка для оптимизации, снижает количество внутренних перехешировений.

Вложенные данные: map[string][]string — классическая структура для графов, множественных тегов, группировки. Обратите внимание на инициализацию значения перед append — или используйте graph["A"] = append(graph["A"], "E"), что работает даже если ключа нет (nil-слайс безопасен для append).`
        },
        {
            type: 'info-box',
            variant: 'danger',
            content: `<p><strong>nil-map panic:</strong> <code>var m map[string]int</code> создаёт nil-map. Чтение возвращает нулевое значение (безопасно), но <strong>запись вызывает panic</strong>: "assignment to entry in nil map". Всегда инициализируйте map перед записью:</p>
<pre style="margin-top:8px;background:var(--surface-2);padding:8px;border-radius:4px"><code>// ПРАВИЛЬНО:
m := make(map[string]int)    // или
m := map[string]int{}

// НЕПРАВИЛЬНО:
var m map[string]int
m["key"] = 1  // ← panic!</code></pre>`
        },
        {
            type: 'theory',
            content: `
                <h2>Чтение и comma-ok идиома</h2>
                <p>При чтении из map по несуществующему ключу Go возвращает <strong>нулевое значение</strong> типа (0 для int, "" для string и т.д.). Это означает что нельзя отличить «ключа нет» от «ключ есть и его значение = 0».</p>
                <p>Решение — <strong>comma-ok идиома</strong>: второе возвращаемое значение — bool, показывающий наличие ключа.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Comma-ok идиома и обработка отсутствия ключа',
            code: `package main

import "fmt"

func main() {
    stock := map[string]int{
        "яблоки":  100,
        "груши":   0,    // есть в базе, но кончились
    }

    // ПРОБЛЕМА: как отличить "нет в базе" от "количество = 0"?
    fmt.Println(stock["яблоки"]) // 100
    fmt.Println(stock["груши"])  // 0
    fmt.Println(stock["бананы"]) // 0  ← но бананов нет в базе!

    // РЕШЕНИЕ: comma-ok идиома
    count, ok := stock["груши"]
    fmt.Printf("груши: %d, существует: %v\\n", count, ok)
    // груши: 0, существует: true

    count, ok = stock["бананы"]
    fmt.Printf("бананы: %d, существует: %v\\n", count, ok)
    // бананы: 0, существует: false

    // Идиоматический if — ok живёт только внутри блока
    if amount, ok := stock["яблоки"]; ok {
        fmt.Printf("Яблок в наличии: %d\\n", amount)
    } else {
        fmt.Println("Яблоки не найдены")
    }

    // Паттерн: значение по умолчанию
    getOrDefault := func(m map[string]int, key string, def int) int {
        if v, ok := m[key]; ok {
            return v
        }
        return def
    }
    fmt.Println(getOrDefault(stock, "бананы", -1)) // -1
    fmt.Println(getOrDefault(stock, "груши", -1))  // 0 (есть в базе)
}`,
            explanation: `Comma-ok — фундаментальная идиома Go, которую вы встретите не только в map. Тот же паттерн используется для:
- Проверки существования ключа в map: v, ok := m[key]
- Type assertions: v, ok := x.(Type)
- Чтения из channel: v, ok := <-ch

Паттерн if v, ok := m[key]; ok — это инициализация + условие в одном выражении. Переменные v и ok видны только внутри if/else блока. Это предотвращает «загрязнение» скоупа временными переменными.

Функция getOrDefault демонстрирует практичный паттерн — обёртка с дефолтным значением. В реальном коде такой helper часто выносится в утилитарный пакет. С generics (Go 1.18) это можно сделать обобщённо:
    func GetOrDefault[K comparable, V any](m map[K]V, key K, def V) V

Для типа int нулевое значение 0 может быть валидным значением (рейтинг, счёт, количество). Для string пустая строка "" может быть допустимым значением. Всегда используйте comma-ok когда нулевое значение семантически значимо.`
        },
        {
            type: 'theory',
            content: `
                <h2>Удаление, итерация и сортировка ключей</h2>
                <p>Встроенная функция <code>delete(m, key)</code> удаляет ключ. Удаление несуществующего ключа — не ошибка. Для итерации используется <code>for range</code>, но порядок случаен. Для упорядоченного вывода сортируйте ключи.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Операция</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Синтаксис</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Примечание</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Запись</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>m[key] = value</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Создаёт или обновляет</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Чтение</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>v := m[key]</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Несуществующий → нулевое значение</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Проверка</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>v, ok := m[key]</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">ok == false если ключа нет</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Удаление</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>delete(m, key)</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Безопасно для несуществующих ключей</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Размер</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>len(m)</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Количество пар ключ-значение</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Итерация</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>for k, v := range m</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Порядок случаен!</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Очистка</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>clear(m)</code> (Go 1.21+)</td>
                            <td style="padding:10px;border:1px solid var(--border)">Или пересоздать через make</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Удаление, итерация, сортировка ключей',
            code: `package main

import (
    "fmt"
    "sort"
)

func main() {
    inventory := map[string]int{
        "молоко":   20,
        "хлеб":    15,
        "сыр":      8,
        "масло":   12,
        "яйца":    30,
    }

    // Удаление
    delete(inventory, "молоко")
    delete(inventory, "несуществующий") // не паника
    fmt.Println("После удаления:", len(inventory)) // 4

    // Итерация: порядок случаен каждый раз
    fmt.Println("\\nБез сортировки (случайный порядок):")
    for item, qty := range inventory {
        fmt.Printf("  %s: %d\\n", item, qty)
    }

    // Только ключи
    fmt.Println("\\nТолько ключи:")
    for item := range inventory {
        fmt.Println(" ", item)
    }

    // Стабильный порядок: сортируем ключи отдельно
    keys := make([]string, 0, len(inventory))
    for k := range inventory {
        keys = append(keys, k)
    }
    sort.Strings(keys)

    fmt.Println("\\nАлфавитный порядок:")
    for _, k := range keys {
        fmt.Printf("  %-8s %d\\n", k, inventory[k])
    }
    // масло    12
    // сыр      8
    // хлеб     15
    // яйца     30

    // Обновление в цикле — безопасно
    for k := range inventory {
        inventory[k] *= 2 // удвоить все запасы
    }
    fmt.Println("\\nПосле удвоения:", inventory)
}`,
            explanation: `Итерация по map — один из самых частых источников скрытых багов у новичков в Go.

Go намеренно рандомизирует порядок итерации по map с Go 1.0. Это было сделано потому, что в ранних версиях порядок был «случайно стабильным» в некоторых реализациях, и разработчики начали полагаться на него. Когда реализация изменилась — программы сломались. Теперь рандомизация принудительная: нельзя написать код, который случайно зависит от порядка.

Паттерн сортировки ключей: collect keys → sort → iterate by sorted keys. Это O(n log n) и используется когда нужен детерминированный вывод: логи, тесты, API-ответы. В тестах особенно важно: если тест проверяет вывод, содержащий элементы map без сортировки — тест будет нестабильным (flaky).

Изменение map во время итерации — технически допустимо в Go (в отличие от некоторых других языков). Новые ключи, добавленные в процессе итерации, могут или не могут быть посещены в текущей итерации. Удалённые ключи не будут посещены после удаления. Это поведение определено спецификацией.`
        },
        {
            type: 'theory',
            content: `
                <h2>Map как множество (Set) и продвинутые паттерны</h2>
                <p>В Go нет встроенного типа Set, но <code>map[T]bool</code> или <code>map[T]struct{}</code> прекрасно справляются. Также map используется для группировки, кэширования, подсчёта и индексации.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Практические паттерны с map',
            code: `package main

import "fmt"

func main() {
    // ПАТТЕРН 1: множество (Set)
    allowedRoles := map[string]struct{}{
        "admin":    {},
        "editor":   {},
        "viewer":   {},
    }

    checkRole := func(role string) bool {
        _, ok := allowedRoles[role]
        return ok
    }
    fmt.Println(checkRole("admin"))   // true
    fmt.Println(checkRole("hacker"))  // false

    // ПАТТЕРН 2: подсчёт частоты
    text := "go is great go is fast go go"
    freq := make(map[string]int)
    // В реальном коде: strings.Fields(text)
    words := []string{"go","is","great","go","is","fast","go","go"}
    for _, w := range words {
        freq[w]++ // нулевое значение int == 0, работает с первого обращения
    }
    fmt.Println(freq)
    // map[fast:1 go:4 great:1 is:2]

    // ПАТТЕРН 3: группировка
    people := []struct{ name, dept string }{
        {"Alice", "engineering"},
        {"Bob", "marketing"},
        {"Carol", "engineering"},
        {"Dave", "marketing"},
        {"Eve", "engineering"},
    }
    byDept := make(map[string][]string)
    for _, p := range people {
        byDept[p.dept] = append(byDept[p.dept], p.name)
    }
    fmt.Println(byDept["engineering"]) // [Alice Carol Eve]
    fmt.Println(byDept["marketing"])   // [Bob Dave]

    // ПАТТЕРН 4: кэш (мемоизация)
    cache := make(map[int]int)
    var fib func(n int) int
    fib = func(n int) int {
        if n <= 1 { return n }
        if v, ok := cache[n]; ok {
            return v
        }
        result := fib(n-1) + fib(n-2)
        cache[n] = result
        return result
    }
    fmt.Println(fib(40)) // 102334155 — мгновенно с кэшем
    _ = text
}`,
            explanation: `Четыре паттерна, которые вы будете использовать постоянно в реальных Go-проектах.

Паттерн Set через map[T]struct{}: struct{} занимает 0 байт в памяти — это пустая структура. Она используется именно потому, что нам важно только присутствие ключа, а не значение. map[T]bool тоже работает, но тратит 1 байт на каждый элемент и теоретически допускает false как значение, что семантически мутит воду.

Подсчёт через freq[w]++: работает потому что нулевое значение int == 0. При первом обращении freq["newword"] возвращает 0, затем ++ делает 1. Это идиоматический Go — не нужно проверять "существует ли ключ" перед инкрементом.

Группировка через append к nil-слайсу: byDept[p.dept] = append(byDept[p.dept], p.name). Если ключа dept нет, byDept[p.dept] вернёт nil-слайс. append к nil-слайсу создаёт новый слайс — всё работает автоматически.

Мемоизация — классическое применение map как кэша. Рекурсивный fib без кэша имеет O(2^n). С map-кэшем — O(n). В реальных проектах такой паттерн часто обёртывается в sync.Map или защищается мьютексом для потокобезопасности.`
        },
        {
            type: 'info-box',
            variant: 'note',
            content: `<p><strong>map нельзя сравнивать через ==</strong> (кроме сравнения с nil). Для сравнения двух map нужно писать функцию вручную или использовать <code>reflect.DeepEqual(m1, m2)</code> (медленнее) или <code>maps.Equal(m1, m2)</code> из пакета <code>golang.org/x/exp/maps</code> (в Go 1.21+ встроен в <code>maps</code>).</p>`
        },
        {
            type: 'editor',
            title: 'Практика: Анализ текста',
            instructions: 'Напишите функцию analyzeText, которая принимает слайс слов и возвращает три вещи: (1) map частоты каждого слова, (2) наиболее часто встречаемое слово, (3) количество уникальных слов. Подсказка: для нахождения максимума итерируйтесь по map после подсчёта.',
            starterCode: `package main

import "fmt"

// analyzeText анализирует слова и возвращает частоту, топ-слово и число уникальных
func analyzeText(words []string) (freq map[string]int, topWord string, uniqueCount int) {
    // Ваш код здесь
    return
}

func main() {
    words := []string{
        "go", "is", "fast", "go", "is", "awesome",
        "go", "go", "fast", "go",
    }

    freq, top, unique := analyzeText(words)
    fmt.Println("Частота:", freq)
    fmt.Println("Топ слово:", top)     // go (встречается 5 раз)
    fmt.Println("Уникальных:", unique) // 4
}`,
            hints: [
                'Создайте freq = make(map[string]int), подсчитайте freq[w]++',
                'uniqueCount = len(freq)',
                'Для topWord: итерируйтесь по freq, отслеживайте maxCount и соответствующий ключ',
                'Функция возвращает именованные значения — используйте naked return или явный return'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что произойдёт при записи в nil-map?',
                    options: [
                        'panic: assignment to entry in nil map',
                        'Автоматическая инициализация map',
                        'Ошибка компиляции',
                        'Запись будет проигнорирована'
                    ],
                    correct: 0,
                    explanation: 'Запись в nil-map вызывает panic во время выполнения. Чтение из nil-map безопасно (возвращает нулевое значение). Инициализируйте map перед использованием: make(map[K]V) или map[K]V{}.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Как проверить существование ключа "name" в map m?',
                    options: [
                        'v, ok := m["name"]; if ok { ... }',
                        'm.has("name")',
                        '"name" in m',
                        'm.contains("name")'
                    ],
                    correct: 0,
                    explanation: 'Comma-ok идиома: v, ok := m[key]. ok == true если ключ существует, false если нет. Это единственный надёжный способ — чтение без ok вернёт нулевое значение даже для несуществующего ключа.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Гарантирован ли порядок при for range по map?',
                    options: [
                        'Нет — порядок случаен и меняется между запусками',
                        'Да — в порядке вставки',
                        'Да — в лексикографическом порядке ключей',
                        'Да — но только для string-ключей'
                    ],
                    correct: 0,
                    explanation: 'Go намеренно рандомизирует порядок итерации по map. Это не баг, а фича: предотвращает случайную зависимость от порядка. Для стабильного вывода: собрать ключи в слайс → sort.Strings → итерировать.'
                },
                {
                    id: 'q4',
                    type: 'code-fill',
                    question: 'Как удалить ключ "expired" из map cache?',
                    template: '___(cache, "expired")',
                    correct: 'delete',
                    caseSensitive: true,
                    explanation: 'delete(map, key) — встроенная функция удаления. Безопасна для несуществующих ключей (не паника). Нет возвращаемого значения.'
                },
                {
                    id: 'q5',
                    type: 'multiple',
                    question: 'Какие типы НЕЛЬЗЯ использовать как ключи map? (выберите все правильные)',
                    options: [
                        '[]int (слайс целых чисел)',
                        'map[string]int (другая map)',
                        'func() (функция)',
                        'struct{ Name string } (простая структура)',
                        '[5]int (массив целых чисел)'
                    ],
                    correct: [0, 1, 2],
                    explanation: 'Ключи map должны быть сравнимыми (comparable). Слайсы, map и функции не сравнимы (нельзя применить ==) и не могут быть ключами. Простые структуры (без полей-слайсов/map/функций) и массивы — сравнимы и допустимы как ключи.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Что вернёт m["missing"] если ключа "missing" нет в map[string]int?',
                    options: [
                        '0 — нулевое значение int',
                        'nil',
                        'panic',
                        '-1'
                    ],
                    correct: 0,
                    explanation: 'Чтение несуществующего ключа из map возвращает нулевое значение типа значений: 0 для int, "" для string, false для bool, nil для указателей/слайсов. Это не ошибка — используйте comma-ok для различения "нет ключа" от "значение = нулевое".'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Чем map[T]struct{} лучше map[T]bool для множества (Set)?',
                    options: [
                        'struct{} занимает 0 байт памяти; bool занимает 1 байт',
                        'struct{} быстрее при поиске',
                        'С bool невозможно хранить false',
                        'struct{} поддерживает многопоточность'
                    ],
                    correct: 0,
                    explanation: 'struct{} — пустая структура, занимает 0 байт. Для множества нас интересует только факт присутствия ключа, значение не нужно. map[T]bool расходует 1 байт на каждый элемент и семантически допускает false-значения, что немного мутит логику множества.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Как работает freq[word]++ если ключа word ещё нет в map?',
                    options: [
                        'Нулевое значение int (0) используется как начальное, итого 1',
                        'Panic: ключ не найден',
                        'Ошибка компиляции',
                        'Игнорируется, ключ не создаётся'
                    ],
                    correct: 0,
                    explanation: 'Go возвращает нулевое значение для несуществующего ключа. Для int это 0. Поэтому freq[word]++ работает: читает 0, прибавляет 1, записывает 1. Это делает подсчёт частоты элегантным — не нужна проверка на существование ключа.'
                }
            ]
        }
    ]
};
