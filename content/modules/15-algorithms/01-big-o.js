export default {
  id: '15-01',
  title: 'Big O нотация',
  description: 'Как инженеры измеряют эффективность алгоритмов и предсказывают поведение кода при масштабировании.',
  estimatedTime: 30,
  xpReward: 25,

  sections: [
    {
      type: 'theory',
      content: `
<h2>Почему "быстро работает" — не ответ</h2>
<p>Представьте библиотеку. Маленькая библиотека на 100 книг — любой способ найти книгу кажется быстрым. Но что если книг стало 10 миллионов? Перебирать все книги подряд — катастрофа. Искать по каталогу, где книги отсортированы — совсем другое дело.</p>
<p><strong>Big O нотация</strong> — это математический язык для описания того, как растёт время работы алгоритма при росте входных данных. Это не про "сколько миллисекунд", а про <em>форму кривой роста</em>.</p>
<p>Мы всегда оцениваем <strong>худший сценарий</strong> (Worst Case). Надеяться на лучшее — не инженерный подход. Мы проектируем системы так, чтобы они выдерживали худшее.</p>
<p>Правила упрощения:</p>
<ul>
  <li>Константы отбрасываются: O(2n) → O(n), O(5) → O(1)</li>
  <li>Берём доминирующий член: O(n² + n) → O(n²)</li>
  <li>При последовательных операциях — складываем: O(n) + O(m) = O(n + m)</li>
  <li>При вложенных — перемножаем: O(n) × O(m) = O(n × m)</li>
</ul>
`
    },
    {
      type: 'diagram',
      format: 'mermaid',
      code: `graph LR
    subgraph "Рост при n = 1000"
        A["O(1) → 1 операция"]
        B["O(log n) → ~10 операций"]
        C["O(n) → 1,000 операций"]
        D["O(n log n) → ~10,000 операций"]
        E["O(n²) → 1,000,000 операций"]
        F["O(2ⁿ) → ∞ операций"]
    end
    style A fill:#4CAF50,color:#fff
    style B fill:#8BC34A,color:#fff
    style C fill:#FFC107,color:#000
    style D fill:#FF9800,color:#fff
    style E fill:#f44336,color:#fff
    style F fill:#B71C1C,color:#fff`,
      caption: 'При n=1000 разница между O(1) и O(n²) — это разница между 1 и 1 миллионом операций'
    },
    {
      type: 'theory',
      content: `
<h2>O(1) — Константная сложность</h2>
<p>Время выполнения не зависит от размера данных. Будь то 10 элементов или 10 миллиардов — операция занимает одинаковое время.</p>
<p>Как шкаф с пронумерованными ящиками: неважно, сколько ящиков, нужный всегда находится мгновенно — вы просто открываете ящик с нужным номером.</p>
<p>Примеры O(1):</p>
<ul>
  <li>Доступ к элементу массива по индексу <code>arr[i]</code></li>
  <li>Запись/чтение из <code>map</code> (хеш-таблицы)</li>
  <li>Push/Pop из стека</li>
  <li>Вставка в начало связного списка</li>
</ul>
<table style="width:100%;border-collapse:collapse;margin-top:12px">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">n</th>
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Операций</th>
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Время (условно)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid var(--border)">10</td><td style="padding:8px 14px;border:1px solid var(--border);color:var(--accent)">1</td><td style="padding:8px 14px;border:1px solid var(--border)">1 мс</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid var(--border)">1,000</td><td style="padding:8px 14px;border:1px solid var(--border);color:var(--accent)">1</td><td style="padding:8px 14px;border:1px solid var(--border)">1 мс</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid var(--border)">1,000,000</td><td style="padding:8px 14px;border:1px solid var(--border);color:var(--accent)">1</td><td style="padding:8px 14px;border:1px solid var(--border)">1 мс</td></tr>
  </tbody>
</table>
`
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'O(1) — константные операции',
      code: `package main

import "fmt"

func main() {
    arr := []int{10, 20, 30, 40, 50}

    // O(1) — доступ по индексу: прямая адресация памяти
    // CPU вычисляет: базовый_адрес + индекс * размер_элемента
    first := arr[0]     // O(1)
    last := arr[len(arr)-1] // O(1)
    fmt.Println(first, last) // 10 50

    // O(1) — операции с map
    ages := map[string]int{
        "Alice": 30,
        "Bob":   25,
    }
    // Независимо от размера map — всегда одна операция хеширования
    age := ages["Alice"] // O(1)
    fmt.Println(age)     // 30

    // O(1) — получение длины slice/map
    n := len(arr) // Хранится в заголовке slice, не пересчитывается
    fmt.Println(n) // 5
}`,
      explanation: 'Доступ к элементу slice по индексу — это просто арифметика с указателями: адрес = ptr + index * sizeof(int). Независимо от размера массива — всегда одна операция. Map хранит хеш ключа, lookup — O(1) в среднем.'
    },
    {
      type: 'theory',
      content: `
<h2>O(log n) — Логарифмическая сложность</h2>
<p>Каждый шаг вдвое уменьшает размер задачи. Как угадывание числа от 1 до 1000: вы спрашиваете "больше или меньше 500?". После первого вопроса осталось 500 вариантов, после второго — 250, и так далее. За 10 вопросов угадаете любое число до 1024.</p>
<p>Примеры O(log n):</p>
<ul>
  <li>Бинарный поиск в отсортированном массиве</li>
  <li>Поиск в сбалансированном бинарном дереве (BST, AVL, Red-Black)</li>
  <li>Операции с кучей (heap)</li>
</ul>
<table style="width:100%;border-collapse:collapse;margin-top:12px">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">n</th>
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">log₂(n)</th>
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Операций</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid var(--border)">8</td><td style="padding:8px 14px;border:1px solid var(--border);color:var(--accent)">3</td><td style="padding:8px 14px;border:1px solid var(--border)">3</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid var(--border)">1,024</td><td style="padding:8px 14px;border:1px solid var(--border);color:var(--accent)">10</td><td style="padding:8px 14px;border:1px solid var(--border)">10</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid var(--border)">1,000,000</td><td style="padding:8px 14px;border:1px solid var(--border);color:var(--accent)">20</td><td style="padding:8px 14px;border:1px solid var(--border)">20</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid var(--border)">1,000,000,000</td><td style="padding:8px 14px;border:1px solid var(--border);color:var(--accent)">30</td><td style="padding:8px 14px;border:1px solid var(--border)">30</td></tr>
  </tbody>
</table>
`
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'O(log n) — бинарный поиск',
      code: `package main

import "fmt"

// BinarySearch — O(log n)
// Массив ДОЛЖЕН быть отсортирован!
func BinarySearch(arr []int, target int) int {
    left, right := 0, len(arr)-1

    for left <= right {
        mid := left + (right-left)/2 // Избегаем overflow (не (left+right)/2)

        if arr[mid] == target {
            return mid // Нашли!
        } else if arr[mid] < target {
            left = mid + 1 // Ищем в правой половине
        } else {
            right = mid - 1 // Ищем в левой половине
        }
    }
    return -1 // Не найдено
}

func main() {
    arr := []int{1, 3, 5, 7, 9, 11, 13, 15, 17, 19}
    
    // Поиск 7 в массиве из 10 элементов:
    // Шаг 1: mid=4 (arr[4]=9) > 7 → ищем слева
    // Шаг 2: mid=1 (arr[1]=3) < 7 → ищем справа
    // Шаг 3: mid=3 (arr[3]=7) == 7 → найден!
    // Всего 3 шага вместо линейного прохода
    
    idx := BinarySearch(arr, 7)
    fmt.Println("Индекс 7:", idx) // 3
    
    idx = BinarySearch(arr, 6)
    fmt.Println("Индекс 6:", idx) // -1 (нет в массиве)
    
    // В стандартной библиотеке: sort.SearchInts
    // Используйте его в production-коде
}`,
      explanation: 'Бинарный поиск каждую итерацию делит пространство поиска вдвое. Для миллиарда элементов нужно всего ~30 сравнений. Требование: массив должен быть отсортирован. mid = left + (right-left)/2 защищает от integer overflow при больших значениях.'
    },
    {
      type: 'theory',
      content: `
<h2>O(n) и O(n²) — Линейная и квадратичная сложность</h2>
<p><strong>O(n) — линейная.</strong> Время растёт пропорционально данным. Чтобы прочитать список из 1000 пользователей — нужно 1000 шагов. Это норма для задач, где нужно обработать каждый элемент хотя бы раз.</p>
<p><strong>O(n²) — квадратичная. Сигнал тревоги.</strong> Вложенный цикл на n элементах даёт n×n операций. 1000 пользователей → 1 000 000 операций. 100 000 пользователей → 10 000 000 000 операций. Сервер умрёт.</p>
<p>Увидели вложенный цикл на code review — немедленно задавайте вопрос: зачем? Можно ли использовать map для поиска вместо внутреннего цикла?</p>
<table style="width:100%;border-collapse:collapse;margin-top:12px">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">n</th>
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">O(n)</th>
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">O(n log n)</th>
      <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">O(n²)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid var(--border)">100</td><td style="padding:8px 14px;border:1px solid var(--border);color:#4CAF50">100</td><td style="padding:8px 14px;border:1px solid var(--border);color:#8BC34A">664</td><td style="padding:8px 14px;border:1px solid var(--border);color:#FF9800">10,000</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid var(--border)">10,000</td><td style="padding:8px 14px;border:1px solid var(--border);color:#4CAF50">10,000</td><td style="padding:8px 14px;border:1px solid var(--border);color:#8BC34A">130,000</td><td style="padding:8px 14px;border:1px solid var(--border);color:#f44336">100,000,000</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid var(--border)">1,000,000</td><td style="padding:8px 14px;border:1px solid var(--border);color:#4CAF50">1M</td><td style="padding:8px 14px;border:1px solid var(--border);color:#8BC34A">20M</td><td style="padding:8px 14px;border:1px solid var(--border);color:#f44336">1,000,000,000,000</td></tr>
  </tbody>
</table>
`
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'O(n) vs O(n²) — найти пары с суммой',
      code: `package main

import "fmt"

// BAD: O(n²) — вложенный цикл
func hasPairSumSlow(arr []int, target int) bool {
    for i := 0; i < len(arr); i++ {
        for j := i + 1; j < len(arr); j++ { // Вот он — O(n²)
            if arr[i]+arr[j] == target {
                return true
            }
        }
    }
    return false
}

// GOOD: O(n) — используем map для поиска за O(1)
func hasPairSumFast(arr []int, target int) bool {
    seen := make(map[int]bool)
    for _, v := range arr {
        complement := target - v
        if seen[complement] {
            return true // Нашли пару!
        }
        seen[v] = true
    }
    return false
}

// Демонстрация разницы на практике
func main() {
    arr := []int{2, 7, 11, 15, 3, 8}
    target := 9

    fmt.Println("Slow (O(n²)):", hasPairSumSlow(arr, target)) // true: 2+7=9
    fmt.Println("Fast (O(n)):", hasPairSumFast(arr, target))  // true: 2+7=9

    // На 100,000 элементах:
    // O(n²): ~10,000,000,000 сравнений
    // O(n):  ~100,000 сравнений
    // Разница: в 100,000 раз!
}`,
      explanation: 'Классический рефакторинг O(n²) → O(n). Вместо проверки "все со всеми" мы используем map как справочник: для каждого элемента v проверяем, есть ли (target-v) в уже просмотренных. Дополнительная память O(n) для map — стандартный trade-off "память за скорость".'
    },
    {
      type: 'info-box',
      variant: 'tip',
      content: `<p><strong>Правило большого пальца для Big O:</strong></p>
<ul>
  <li>Один цикл → O(n)</li>
  <li>Вложенный цикл → O(n²), осторожно!</li>
  <li>Делим задачу пополам каждый шаг → O(log n)</li>
  <li>Цикл + деление пополам внутри → O(n log n)</li>
  <li>Рекурсия удваивает задачи каждый уровень → O(2ⁿ), опасно!</li>
</ul>
<p>Но помните слова Кнута: <em>"Premature optimization is the root of all evil"</em>. Не оптимизируйте O(n) до O(1) на 50 элементах — читаемость кода важнее. Знайте асимптотику, но оптимизируйте только там, где это действительно нужно.</p>`
    },
    {
      type: 'editor',
      title: 'Определи сложность и оптимизируй',
      description: 'Функция findDuplicates использует O(n²). Перепиши её через map для O(n) сложности.',
      language: 'go',
      initialCode: `package main

import "fmt"

// ЗАДАЧА: эта функция O(n²) — перепиши через map чтобы стала O(n)
func findDuplicates(arr []int) []int {
    var result []int
    for i := 0; i < len(arr); i++ {
        for j := i + 1; j < len(arr); j++ {
            if arr[i] == arr[j] {
                // Проверяем, что ещё не добавили дубликат
                alreadyAdded := false
                for _, r := range result {
                    if r == arr[i] {
                        alreadyAdded = true
                        break
                    }
                }
                if !alreadyAdded {
                    result = append(result, arr[i])
                }
            }
        }
    }
    return result
}

func main() {
    arr := []int{1, 2, 3, 2, 4, 3, 5}
    fmt.Println(findDuplicates(arr)) // [2 3]
}`,
      solution: `package main

import "fmt"

// O(n) через map — считаем вхождения, выбираем дубликаты
func findDuplicates(arr []int) []int {
    count := make(map[int]int)
    for _, v := range arr {
        count[v]++
    }
    var result []int
    for v, c := range count {
        if c > 1 {
            result = append(result, v)
        }
    }
    return result
}

func main() {
    arr := []int{1, 2, 3, 2, 4, 3, 5}
    fmt.Println(findDuplicates(arr)) // [2 3]
}`,
      hints: [
        'Используй map[int]int для подсчёта сколько раз каждое число встречается',
        'Первый проход: count[v]++ для каждого элемента',
        'Второй проход: если count[v] > 1, то v — дубликат',
        'Итоговая сложность: O(n) время + O(n) память'
      ]
    },
    {
      type: 'quiz',
      questions: [
        {
          id: 'q1501-1',
          type: 'single',
          question: 'Какова сложность этого кода?\n\nfor i := 0; i < n; i++ {\n    for j := 0; j < n; j++ {\n        fmt.Println(i, j)\n    }\n}',
          options: ['O(n)', 'O(2n)', 'O(n²)', 'O(n + n)'],
          correct: 2,
          explanation: 'Вложенный цикл: внешний выполняется n раз, внутренний — n раз для каждой итерации внешнего. Итого n × n = n² операций → O(n²).'
        },
        {
          id: 'q1501-2',
          type: 'single',
          question: 'Бинарный поиск каждый шаг делит пространство поиска вдвое. Это какая сложность?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n/2)'],
          correct: 1,
          explanation: 'Деление пространства поиска вдвое на каждом шаге — признак логарифмической сложности O(log n). При n=1,000,000,000 нужно всего ~30 шагов.'
        },
        {
          id: 'q1501-3',
          type: 'single',
          question: 'Вы оптимизировали функцию с O(n²) до O(n), добавив map. Что вы заплатили за это?',
          options: [
            'Ничего, это магия',
            'Дополнительная память O(n) для map',
            'Время компиляции',
            'Точность вычислений'
          ],
          correct: 1,
          explanation: 'Это классический trade-off "время против памяти". Используя map (O(n) памяти), вы снижаете время с O(n²) до O(n). В алгоритмах часто приходится жертвовать памятью ради скорости.'
        },
        {
          id: 'q1501-4',
          type: 'code-fill',
          question: 'len(slice) в Go имеет сложность O(__), потому что длина хранится в заголовке slice.',
          template: 'O(__)',
          correct: '1',
          caseSensitive: false,
          explanation: 'Slice в Go — это структура {ptr, len, cap}. len — это поле, которое уже хранится. Вызов len() просто читает это поле — O(1), не пересчитывает.'
        },
        {
          id: 'q1501-5',
          type: 'single',
          question: 'Какова итоговая сложность: внешний цикл O(n), внутри вызов функции O(log n)?',
          options: ['O(n)', 'O(log n)', 'O(n + log n)', 'O(n log n)'],
          correct: 3,
          explanation: 'Вложенные операции перемножаются: O(n) × O(log n) = O(n log n). Это сложность таких алгоритмов как merge sort, heapsort и сортировка с бинарным поиском.'
        },
        {
          id: 'q1501-6',
          type: 'multiple',
          question: 'Какие операции имеют сложность O(1)? (несколько вариантов)',
          options: [
            'Доступ к map["key"] в Go',
            'Поиск элемента в неотсортированном slice',
            'Доступ к slice[i] по индексу',
            'Удаление из начала slice',
            'Push/Pop в стек на основе slice'
          ],
          correct: [0, 2, 4],
          explanation: 'O(1): map lookup (хеш), slice[i] (арифметика указателей), стек (push/pop последнего). НЕ O(1): поиск в slice — O(n) полный обход; удаление из начала slice — O(n) сдвиг всех элементов.'
        },
        {
          id: 'q1501-7',
          type: 'single',
          question: 'O(n²) алгоритм на 1000 элементах делает ~1,000,000 операций. На 10,000 элементах?',
          options: ['2,000,000', '10,000,000', '100,000,000', '1,000,000,000'],
          correct: 2,
          explanation: 'O(n²): при увеличении n в 10 раз количество операций растёт в 10² = 100 раз. 1,000,000 × 100 = 100,000,000. Вот почему O(n²) убивает highload системы.'
        },
        {
          id: 'q1501-8',
          type: 'single',
          question: 'Упрости O(3n² + 5n + 100) до Big O нотации.',
          options: ['O(3n²)', 'O(n² + n)', 'O(n²)', 'O(n)'],
          correct: 2,
          explanation: 'Правила: убираем константы (3n² → n²), убираем некоминирующие члены (5n и 100 незначительны при больших n). Итого: O(n²).'
        }
      ]
    }
  ]
};
