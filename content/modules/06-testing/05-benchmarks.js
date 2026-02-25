export default {
    id: '06-05',
    title: 'Бенчмарки и профилирование',
    description: 'testing.B, b.N, b.ResetTimer, b.RunParallel, pprof, benchstat — измеряем производительность кода',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
<h2>Секундомер для кода</h2>
<p>Спортсмен не тренируется вслепую. У него есть секундомер: он знает что 100 метров за 9.8 секунд — это хорошо, а 12 секунд — нужно работать. Без измерений оптимизация — это угадывание.</p>
<p>Бенчмарки в Go — встроенный секундомер для кода. Они отвечают на вопросы: насколько быстра эта функция? Какой алгоритм быстрее? Ускорила ли моя оптимизация?</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2,#1e293b)">
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Аспект</th>
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Тест (testing.T)</th>
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Бенчмарк (testing.B)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Цель</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Правильность (корректность)</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Производительность (скорость)</td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)">Имя функции</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>TestXxx(t *testing.T)</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>BenchmarkXxx(b *testing.B)</code></td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Запуск</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>go test</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>go test -bench=.</code></td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)">Повторения</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Один раз</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">b.N раз (определяет runtime)</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Результат</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">PASS / FAIL</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">ns/op, B/op, allocs/op</td>
    </tr>
  </tbody>
</table>
<p>Бенчмарки живут в тех же <code>_test.go</code> файлах. Запускаются только явно через <code>-bench</code> флаг.</p>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Первый бенчмарк и чтение результатов',
            code: `package strings_test

import (
    "strings"
    "testing"
)

// Сравниваем два способа конкатенации строк

func BenchmarkConcatPlus(b *testing.B) {
    // b.N — количество итераций, определяется автоматически
    for i := 0; i < b.N; i++ {
        result := ""
        for j := 0; j < 100; j++ {
            result += "x" // += создаёт новую строку каждый раз
        }
        _ = result // подавляем предупреждение компилятора
    }
}

func BenchmarkConcatBuilder(b *testing.B) {
    for i := 0; i < b.N; i++ {
        var sb strings.Builder
        for j := 0; j < 100; j++ {
            sb.WriteString("x") // переиспользует буфер
        }
        _ = sb.String()
    }
}

// Запуск: go test -bench=. -benchmem
//
// Результат:
// BenchmarkConcatPlus-8       142356    8241 ns/op   5448 B/op   99 allocs/op
// BenchmarkConcatBuilder-8   2847103     415 ns/op    224 B/op    4 allocs/op
//
// Расшифровка:
// -8           — GOMAXPROCS (ядер)
// 2847103      — сколько раз выполнился цикл (b.N)
// 415 ns/op    — наносекунд на операцию
// 224 B/op     — байт памяти на операцию
// 4 allocs/op  — аллокаций памяти на операцию`,
            explanation: 'b.N определяется автоматически: Go запускает бенчмарк достаточно долго (минимум 1 секунду) для стабильного результата. -benchmem показывает аллокации. Builder в 20x быстрее и делает в 25x меньше аллокаций.'
        },
        {
            type: 'theory',
            content: `
<h2>b.ResetTimer и b.StopTimer</h2>
<p>Иногда перед измерением нужна подготовка: создать структуры, подключиться к БД, загрузить данные. Это время не должно считаться. Управляйте таймером явно.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2,#1e293b)">
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Метод</th>
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Что делает</th>
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Когда использовать</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>b.ResetTimer()</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Сбрасывает таймер и счётчики</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">После setup до начала цикла</td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>b.StopTimer()</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Приостанавливает таймер</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Внутри цикла для подготовки данных</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>b.StartTimer()</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Возобновляет таймер</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">После подготовки внутри цикла</td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>b.SetBytes(n)</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Задаёт размер данных в байтах</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Для throughput в MB/s</td>
    </tr>
  </tbody>
</table>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Управление таймером и параллельные бенчмарки',
            code: `package json_test

import (
    "encoding/json"
    "testing"
)

type User struct {
    ID    int    \`json:"id"\`
    Name  string \`json:"name"\`
    Email string \`json:"email"\`
}

// b.ResetTimer — исключаем setup из измерения
func BenchmarkJSONMarshal(b *testing.B) {
    user := User{ID: 1, Name: "Alice", Email: "alice@example.com"}

    // Setup не измеряем — сбрасываем таймер
    b.ResetTimer()

    for i := 0; i < b.N; i++ {
        _, err := json.Marshal(user)
        if err != nil {
            b.Fatal(err)
        }
    }
}

// b.StopTimer внутри цикла — подготовка данных отдельно
func BenchmarkJSONUnmarshal(b *testing.B) {
    data, _ := json.Marshal(User{ID: 1, Name: "Alice"})

    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        var user User

        // StopTimer/StartTimer если нужна подготовка внутри цикла
        // b.StopTimer()
        // ... prepare data ...
        // b.StartTimer()

        if err := json.Unmarshal(data, &user); err != nil {
            b.Fatal(err)
        }
    }
}

// b.RunParallel — бенчмарк в нескольких горутинах
func BenchmarkJSONMarshal_Parallel(b *testing.B) {
    user := User{ID: 1, Name: "Alice", Email: "alice@example.com"}

    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() { // pb.Next() вместо i < b.N
            _, err := json.Marshal(user)
            if err != nil {
                b.Fatal(err)
            }
        }
    })
}

// Запуск: go test -bench=BenchmarkJSON -benchmem -cpu=1,2,4,8
// -cpu=1,2,4,8 запускает бенчмарк с разным GOMAXPROCS`,
            explanation: 'b.RunParallel запускает функцию в нескольких горутинах. pb.Next() — аналог i < b.N для параллельного режима. Показывает масштабируемость кода. -cpu=1,2,4,8 позволяет сравнить на разном числе ядер.'
        },
        {
            type: 'theory',
            content: `
<h2>benchstat — статистическое сравнение</h2>
<p>Один запуск бенчмарка — не достаточно. Результаты варьируются из-за нагрузки на систему, GC, планировщика. <code>benchstat</code> запускает бенчмарк несколько раз и даёт статистически значимое сравнение.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2,#1e293b)">
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Шаг</th>
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Команда</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Установить benchstat</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>go install golang.org/x/perf/cmd/benchstat@latest</code></td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)">Запустить старую версию (10 раз)</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>go test -bench=. -count=10 > old.txt</code></td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Внести изменения в код</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">(оптимизация)</td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)">Запустить новую версию</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>go test -bench=. -count=10 > new.txt</code></td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Сравнить</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>benchstat old.txt new.txt</code></td>
    </tr>
  </tbody>
</table>
<p>Вывод benchstat показывает: старое время, новое время, процент изменения, p-значение (статистическая значимость). p < 0.05 означает статистически значимое улучшение.</p>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Суббенчмарки и pprof интеграция',
            code: `package search_test

import (
    "testing"
    _ "net/http/pprof" // для профилировщика
)

// Суббенчмарки — как подтесты для бенчмарков
func BenchmarkSearch(b *testing.B) {
    sizes := []int{100, 1000, 10000, 100000}
    for _, size := range sizes {
        data := generateData(size) // готовим данные

        b.Run(fmt.Sprintf("size=%d", size), func(b *testing.B) {
            b.ResetTimer()
            for i := 0; i < b.N; i++ {
                _ = linearSearch(data, 42)
            }
        })
    }
}

// Бенчмарк с SetBytes — показывает пропускную способность
func BenchmarkEncode(b *testing.B) {
    data := make([]byte, 1024*1024) // 1MB
    rand.Read(data)

    b.SetBytes(int64(len(data))) // размер для MB/s расчёта
    b.ResetTimer()

    for i := 0; i < b.N; i++ {
        _ = base64.StdEncoding.EncodeToString(data)
    }
}
// Результат: 1234 MB/s

// Запуск с pprof:
// go test -bench=BenchmarkSearch -cpuprofile=cpu.prof -memprofile=mem.prof
// go tool pprof cpu.prof
// (в pprof): top10    — топ функций по CPU
// (в pprof): web      — граф в браузере
// (в pprof): list FunctionName — построчное время`,
            explanation: 'b.Run создаёт суббенчмарки — удобно для сравнения разных входных размеров. b.SetBytes позволяет видеть MB/s в результатах. pprof интеграция: два флага дают детальные профили CPU и памяти.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<strong>Правила хорошего бенчмарка:</strong> (1) Всегда используйте результат функции — <code>_ = result</code>, иначе компилятор может оптимизировать вызов. (2) b.ResetTimer() после setup. (3) Запускайте с -count=5 минимум для стабильности. (4) -benchmem всегда — аллокации часто важнее времени.'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: '<strong>Преждевременная оптимизация:</strong> Бенчмарки нужны для измерения, а не для того чтобы оптимизировать всё подряд. Сначала напишите корректный код → запустите бенчмарк → найдите узкое место (hotspot) через pprof → оптимизируйте только hotspot → измерьте снова. Оптимизируйте только то, что измерено как проблему.'
        },
        {
            type: 'editor',
            title: 'Практика: напишите бенчмарк',
            instructions: 'Напишите два бенчмарка для поиска элемента: BenchmarkLinearSearch и BenchmarkBinarySearch. Используйте b.ResetTimer() после генерации данных. Добавьте суббенчмарки для размеров 1000 и 10000.',
            starterCode: `package search

import (
    "sort"
    "testing"
)

func LinearSearch(data []int, target int) int {
    for i, v := range data {
        if v == target {
            return i
        }
    }
    return -1
}

func BinarySearch(data []int, target int) int {
    lo, hi := 0, len(data)-1
    for lo <= hi {
        mid := (lo + hi) / 2
        if data[mid] == target {
            return mid
        } else if data[mid] < target {
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }
    return -1
}

func BenchmarkLinearSearch(b *testing.B) {
    sizes := []int{1000, 10000}
    for _, size := range sizes {
        // Генерируем данные ДО b.ResetTimer
        data := make([]int, size)
        for i := range data {
            data[i] = i
        }
        target := size / 2

        b.Run(/* имя суббенчмарка */, func(b *testing.B) {
            b.ResetTimer()
            for i := 0; i < b.N; i++ {
                // Вызов LinearSearch
            }
        })
    }
}

// BenchmarkBinarySearch — аналогично, но с sort.SearchInts или BinarySearch
// Не забудьте что данные должны быть отсортированы для бинарного поиска`,
            hints: [
                'fmt.Sprintf("size=%d", size) — имя суббенчмарка',
                'sort.Ints(data) перед бинарным поиском если данные не отсортированы',
                '_ = LinearSearch(data, target) — используем результат',
                'go test -bench=BenchmarkLinearSearch -benchmem для запуска'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что такое b.N в бенчмарке?',
                    options: [
                        'Количество итераций, автоматически определяемое Go runtime для стабильного результата',
                        'Константа равная 1000000',
                        'Количество параллельных горутин',
                        'Флаг который задаёт пользователь'
                    ],
                    correct: 0,
                    explanation: 'Go runtime сам подбирает b.N: запускает бенчмарк несколько раз, увеличивая N пока время выполнения не достигнет минимум 1 секунды. Это обеспечивает стабильность результата.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Как запустить только бенчмарки (без обычных тестов)?',
                    options: [
                        'go test -bench=. -run=^$',
                        'go test -benchmark',
                        'go bench ./...',
                        'go test -only-bench'
                    ],
                    correct: 0,
                    explanation: '-bench=. запускает все бенчмарки. -run=^$ — regexp не совпадающий ни с одним тестом (пустая строка от начала до конца). Без -run=^$ сначала выполнятся все тесты.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Когда нужен b.ResetTimer()?',
                    options: [
                        'После setup (инициализации данных) перед циклом b.N',
                        'В конце каждой итерации',
                        'Перед каждым b.N',
                        'Только при параллельных бенчмарках'
                    ],
                    correct: 0,
                    explanation: 'b.ResetTimer() сбрасывает таймер и счётчики аллокаций. Вызывается один раз после setup, перед циклом for i := 0; i < b.N; i++. Иначе время инициализации включается в результат.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Что показывает -benchmem флаг?',
                    options: [
                        'Байт памяти на операцию (B/op) и число аллокаций (allocs/op)',
                        'Максимальное потребление RAM',
                        'Использование кэша процессора',
                        'Количество GC пауз'
                    ],
                    correct: 0,
                    explanation: '-benchmem добавляет в вывод B/op (байт выделено на операцию) и allocs/op (количество аллокаций на операцию). Часто аллокации важнее времени — они вызывают GC паузы.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Зачем использовать _ = result в бенчмарке?',
                    options: [
                        'Чтобы компилятор не оптимизировал вызов функции',
                        'Для подавления ошибки "declared and not used"',
                        'Для корректной работы b.N',
                        'Это необязательно в бенчмарках'
                    ],
                    correct: 0,
                    explanation: 'Компилятор Go агрессивно оптимизирует: если результат не используется, вызов функции может быть полностью удалён. _ = result предотвращает это. Для сложных случаев используют глобальную переменную: var Sink interface{}.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Что делает b.RunParallel?',
                    options: [
                        'Запускает бенчмарк в нескольких горутинах одновременно',
                        'Запускает несколько разных бенчмарков параллельно',
                        'Увеличивает b.N в 4 раза',
                        'Аналог t.Parallel() — откладывает запуск'
                    ],
                    correct: 0,
                    explanation: 'b.RunParallel разделяет b.N итераций между несколькими горутинами. Число горутин = GOMAXPROCS (или задаётся через -cpu). Показывает масштабируемость под нагрузкой.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Как сравнить производительность до и после оптимизации статистически?',
                    options: [
                        'benchstat: go test -bench=. -count=10 > old.txt; (изменить код); go test -bench=. -count=10 > new.txt; benchstat old.txt new.txt',
                        'Просто сравнить ns/op из двух запусков',
                        'go test -bench=. -compare',
                        'Записать результаты вручную и посчитать разницу'
                    ],
                    correct: 0,
                    explanation: 'benchstat использует статистические тесты для определения значимости изменений. Один запуск ненадёжен из-за системного шума. -count=10 даёт 10 замеров для статистики. p < 0.05 = статистически значимо.'
                },
                {
                    id: 'q8',
                    type: 'code-fill',
                    question: 'Правильная структура бенчмарка:',
                    template: 'func BenchmarkFoo(b *testing.B) {\n  setup()\n  b.___Timer()\n  for i := 0; i < b.N; i++ {\n    foo()\n  }\n}',
                    correct: 'Reset',
                    caseSensitive: true,
                    explanation: 'b.ResetTimer() вызывается после setup перед основным циклом. Сбрасывает время и счётчики аллокаций, накопленные во время инициализации.'
                }
            ]
        }
    ]
};
