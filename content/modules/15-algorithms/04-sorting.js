export default {
  id: '15-04',
  title: 'Алгоритмы сортировки',
  description: 'Bubble sort, Selection sort, Quick sort на Go. sort.Slice из stdlib. Сравнение O(n²) vs O(n log n).',
  estimatedTime: 30,
  xpReward: 130,
  sections: [
    {
      type: 'theory',
      content: `<h2>Зачем знать алгоритмы сортировки?</h2>
<p>На собеседованиях сортировка — базовый вопрос. В реальной работе вы используете <code>sort.Slice</code>, но понимание алгоритмов помогает выбирать правильные структуры данных и предсказывать производительность.</p>
<h3>Классификация:</h3>
<ul>
  <li><strong>O(n²)</strong> — Bubble, Selection, Insertion. Просты, но медленны на больших данных</li>
  <li><strong>O(n log n)</strong> — Quick, Merge, Heap. Эффективны для production</li>
  <li><strong>O(n)</strong> — Counting, Radix. Работают только для специфических данных</li>
</ul>`
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'Bubble Sort — O(n²)',
      code: `package main

import "fmt"

// BubbleSort — сравниваем соседей и меняем местами
// Самый простой, но самый медленный из трёх
func BubbleSort(arr []int) []int {
    n := len(arr)
    result := make([]int, n)
    copy(result, arr)

    for i := 0; i < n-1; i++ {
        swapped := false
        for j := 0; j < n-1-i; j++ {
            if result[j] > result[j+1] {
                result[j], result[j+1] = result[j+1], result[j]
                swapped = true
            }
        }
        // Оптимизация: если нет обменов — массив уже отсортирован
        if !swapped {
            break
        }
    }
    return result
}

func main() {
    arr := []int{64, 34, 25, 12, 22, 11, 90}
    fmt.Println("До:", arr)
    fmt.Println("После:", BubbleSort(arr))
}`,
      explanation: 'Bubble Sort: каждый проход "всплывает" максимальный элемент в конец. После i проходов последние i элементов стоят на месте. Оптимизация с флагом swapped даёт O(n) на уже отсортированном массиве.'
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'Selection Sort — O(n²)',
      code: `package main

import "fmt"

// SelectionSort — находим минимум и ставим в начало
func SelectionSort(arr []int) []int {
    n := len(arr)
    result := make([]int, n)
    copy(result, arr)

    for i := 0; i < n-1; i++ {
        minIdx := i
        for j := i + 1; j < n; j++ {
            if result[j] < result[minIdx] {
                minIdx = j
            }
        }
        result[i], result[minIdx] = result[minIdx], result[i]
    }
    return result
}

func main() {
    arr := []int{64, 25, 12, 22, 11}
    fmt.Println("До:", arr)
    fmt.Println("После:", SelectionSort(arr))
    // После: [11 12 22 25 64]
}`,
      explanation: 'Selection Sort: на каждой итерации находим минимальный элемент в неотсортированной части и ставим его на правильное место. Всегда O(n²) обменов в отличие от Bubble Sort.'
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'Quick Sort — O(n log n) в среднем',
      code: `package main

import "fmt"

// QuickSort — рекурсивная сортировка через pivot
func QuickSort(arr []int) []int {
    if len(arr) <= 1 {
        return arr
    }

    pivot := arr[len(arr)/2]
    var left, middle, right []int

    for _, v := range arr {
        switch {
        case v < pivot:
            left = append(left, v)
        case v == pivot:
            middle = append(middle, v)
        default:
            right = append(right, v)
        }
    }

    result := QuickSort(left)
    result = append(result, middle...)
    result = append(result, QuickSort(right)...)
    return result
}

func main() {
    arr := []int{3, 6, 8, 10, 1, 2, 1}
    fmt.Println("До:", arr)
    fmt.Println("После:", QuickSort(arr))
    // После: [1 1 2 3 6 8 10]
}`,
      explanation: 'Quick Sort выбирает опорный элемент (pivot) и делит массив на три части: меньше, равно, больше. Рекурсивно сортирует каждую часть. Средняя сложность O(n log n), худший случай O(n²) при неудачном pivot.'
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'sort.Slice — стандартная библиотека Go',
      code: `package main

import (
    "fmt"
    "sort"
)

type Person struct {
    Name string
    Age  int
}

func main() {
    // Сортировка int slice
    nums := []int{5, 2, 4, 1, 3}
    sort.Ints(nums)
    fmt.Println("Числа:", nums) // [1 2 3 4 5]

    // Сортировка string slice
    words := []string{"banana", "apple", "cherry"}
    sort.Strings(words)
    fmt.Println("Слова:", words) // [apple banana cherry]

    // Сортировка структур через sort.Slice
    people := []Person{
        {"Alice", 30},
        {"Bob", 25},
        {"Charlie", 35},
    }
    sort.Slice(people, func(i, j int) bool {
        return people[i].Age < people[j].Age
    })
    fmt.Println("По возрасту:", people)

    // Обратный порядок
    sort.Slice(people, func(i, j int) bool {
        return people[i].Name > people[j].Name
    })
    fmt.Println("По имени (обратно):", people)

    // Проверка отсортированности
    fmt.Println("Отсортировано:", sort.IntsAreSorted(nums))

    // Бинарный поиск в отсортированном slice
    idx := sort.SearchInts(nums, 3)
    fmt.Println("Индекс 3:", idx) // 2
}`,
      explanation: 'sort.Slice использует интроспективную сортировку (Quicksort + Heapsort + Insertion sort) — O(n log n) гарантировано. sort.SliceStable сохраняет порядок равных элементов. Это то, что нужно использовать в production.'
    },
    {
      type: 'diagram',
      format: 'mermaid',
      code: `graph TD
    A["Выбор алгоритма сортировки"]
    A --> B{"Нужна стабильность?"}
    B -- Да --> C["sort.SliceStable\\nO(n log n)"]
    B -- Нет --> D{"Размер данных?"}
    D -- "< 10 элементов" --> E["Insertion Sort\\nO(n²) но быстро"]
    D -- "10-10000" --> F["sort.Slice\\nO(n log n)"]
    D -- "> 10000" --> G["sort.Slice или\\nMerge Sort"]
    style C fill:#4CAF50,color:#fff
    style F fill:#4CAF50,color:#fff
    style G fill:#4CAF50,color:#fff`,
      caption: 'Как выбрать алгоритм сортировки в зависимости от задачи'
    },
    {
      type: 'theory',
      content: `<h2>Сравнение алгоритмов</h2>
<table style="width:100%;border-collapse:collapse">
  <thead>
    <tr style="background:#2a2a3e">
      <th style="padding:8px;border:1px solid #444">Алгоритм</th>
      <th style="padding:8px;border:1px solid #444">Лучший</th>
      <th style="padding:8px;border:1px solid #444">Средний</th>
      <th style="padding:8px;border:1px solid #444">Худший</th>
      <th style="padding:8px;border:1px solid #444">Память</th>
      <th style="padding:8px;border:1px solid #444">Стабильный</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px;border:1px solid #444">Bubble Sort</td><td style="padding:8px;border:1px solid #444;color:#4CAF50">O(n)</td><td style="padding:8px;border:1px solid #444;color:#f44336">O(n²)</td><td style="padding:8px;border:1px solid #444;color:#f44336">O(n²)</td><td style="padding:8px;border:1px solid #444">O(1)</td><td style="padding:8px;border:1px solid #444;color:#4CAF50">Да</td></tr>
    <tr><td style="padding:8px;border:1px solid #444">Selection Sort</td><td style="padding:8px;border:1px solid #444;color:#f44336">O(n²)</td><td style="padding:8px;border:1px solid #444;color:#f44336">O(n²)</td><td style="padding:8px;border:1px solid #444;color:#f44336">O(n²)</td><td style="padding:8px;border:1px solid #444">O(1)</td><td style="padding:8px;border:1px solid #444;color:#f44336">Нет</td></tr>
    <tr><td style="padding:8px;border:1px solid #444">Quick Sort</td><td style="padding:8px;border:1px solid #444;color:#4CAF50">O(n log n)</td><td style="padding:8px;border:1px solid #444;color:#4CAF50">O(n log n)</td><td style="padding:8px;border:1px solid #444;color:#f44336">O(n²)</td><td style="padding:8px;border:1px solid #444">O(log n)</td><td style="padding:8px;border:1px solid #444;color:#f44336">Нет</td></tr>
    <tr><td style="padding:8px;border:1px solid #444">sort.Slice (Go)</td><td style="padding:8px;border:1px solid #444;color:#4CAF50">O(n log n)</td><td style="padding:8px;border:1px solid #444;color:#4CAF50">O(n log n)</td><td style="padding:8px;border:1px solid #444;color:#4CAF50">O(n log n)</td><td style="padding:8px;border:1px solid #444">O(log n)</td><td style="padding:8px;border:1px solid #444;color:#f44336">Нет</td></tr>
  </tbody>
</table>`
    },
    {
      type: 'quiz',
      questions: [
        {
          id: 'q1504-1',
          type: 'single',
          question: 'Какова худшая сложность Quick Sort и когда она возникает?',
          options: [
            'O(n log n), когда pivot — медиана',
            'O(n²), когда pivot — всегда минимум или максимум',
            'O(n), когда массив уже отсортирован',
            'O(n²) всегда'
          ],
          correct: 1,
          explanation: 'Худший случай Quick Sort O(n²) возникает, когда pivot каждый раз оказывается минимальным или максимальным элементом — например, на уже отсортированном массиве с pivot = первый элемент.'
        },
        {
          id: 'q1504-2',
          type: 'single',
          question: 'Как отсортировать slice структур по полю Name в Go?',
          options: [
            'sort.Sort(people)',
            'sort.Slice(people, func(i, j int) bool { return people[i].Name < people[j].Name })',
            'people.Sort()',
            'sort.Strings(people)'
          ],
          correct: 1,
          explanation: 'sort.Slice принимает slice и функцию less(i, j int) bool. Это самый удобный способ сортировки произвольных структур в Go.'
        },
        {
          id: 'q1504-3',
          type: 'single',
          question: 'Какой алгоритм использует sort.Slice в Go?',
          options: [
            'Чистый Quick Sort',
            'Merge Sort',
            'Интроспективная сортировка (Intro Sort)',
            'Heap Sort'
          ],
          correct: 2,
          explanation: 'sort.Slice в Go использует pdqsort (pattern-defeating quicksort) — вариант интроспективной сортировки, которая комбинирует Quick Sort, Heap Sort и Insertion Sort для гарантированного O(n log n).'
        },
        {
          id: 'q1504-4',
          type: 'single',
          question: 'В чём разница между sort.Slice и sort.SliceStable?',
          options: [
            'sort.SliceStable быстрее',
            'sort.SliceStable сохраняет порядок равных элементов (стабильная сортировка)',
            'sort.Slice работает только с числами',
            'Нет разницы'
          ],
          correct: 1,
          explanation: 'sort.SliceStable — стабильная сортировка: элементы с одинаковым ключом сохраняют исходный относительный порядок. sort.Slice — нестабильная, но немного быстрее.'
        }
      ]
    }
  ]
};
