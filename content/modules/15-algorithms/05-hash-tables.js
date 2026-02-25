export default {
  id: '15-05',
  title: 'Хеш-таблицы',
  description: 'Map в Go — это хеш-таблица. Хеш-функция, коллизии, операции O(1) и практические примеры использования.',
  estimatedTime: 20,
  xpReward: 115,
  sections: [
    {
      type: 'theory',
      content: `<h2>Хеш-таблица — основа map в Go</h2>
<p>Хеш-таблица — структура данных, которая хранит пары ключ-значение и обеспечивает доступ по ключу за O(1) в среднем.</p>
<h3>Как это работает:</h3>
<ol>
  <li><strong>Хеш-функция</strong> преобразует ключ в число (индекс массива)</li>
  <li>Значение сохраняется в ячейке массива с этим индексом</li>
  <li>При поиске: hash(key) → индекс → значение</li>
</ol>
<h3>Коллизии</h3>
<p>Два разных ключа могут дать один и тот же хеш. Это называется <strong>коллизией</strong>. Go решает коллизии через <strong>chaining</strong> (цепочки) — каждая ячейка хранит список элементов с одинаковым хешем.</p>`
    },
    {
      type: 'diagram',
      format: 'mermaid',
      code: `graph LR
    K1["key: 'alice'"] --> H["hash()"]
    K2["key: 'bob'"] --> H
    K3["key: 'charlie'"] --> H
    H --> B0["bucket[0]: bob→25"]
    H --> B2["bucket[2]: alice→30"]
    H --> B5["bucket[5]: charlie→35"]
    style H fill:#7c4dff,color:#fff`,
      caption: 'Хеш-функция распределяет ключи по бакетам. В Go map использует 8-элементные бакеты.'
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'Основные операции с map в Go',
      code: `package main

import "fmt"

func main() {
    // Создание map
    m := make(map[string]int)

    // Вставка — O(1)
    m["alice"] = 30
    m["bob"] = 25
    m["charlie"] = 35

    // Доступ — O(1)
    age := m["alice"]
    fmt.Println("Alice:", age) // 30

    // Проверка существования ключа
    val, ok := m["unknown"]
    if !ok {
        fmt.Println("Ключ не найден, val =", val) // val = 0 (zero value)
    }

    // Удаление — O(1)
    delete(m, "bob")

    // Итерация (порядок не гарантирован!)
    for key, val := range m {
        fmt.Printf("%s: %d\\n", key, val)
    }

    // Инициализация с литералом
    scores := map[string]int{
        "go":     95,
        "python": 88,
        "rust":   92,
    }
    fmt.Println("Go score:", scores["go"])

    // Подсчёт длины
    fmt.Println("Элементов:", len(scores))
}`,
      explanation: 'Все операции с map — O(1) в среднем. Важно: порядок итерации по map в Go намеренно рандомизирован (с Go 1.0). Не полагайтесь на порядок.'
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'Практические паттерны с map',
      code: `package main

import (
    "fmt"
    "sort"
)

func main() {
    // 1. Подсчёт вхождений (frequency counter)
    words := []string{"apple", "banana", "apple", "cherry", "banana", "apple"}
    freq := make(map[string]int)
    for _, w := range words {
        freq[w]++ // Если ключа нет — zero value (0) + 1 = 1
    }
    fmt.Println("Частоты:", freq)

    // 2. Группировка элементов
    people := []struct{ Name, City string }{
        {"Alice", "Moscow"},
        {"Bob", "SPb"},
        {"Charlie", "Moscow"},
        {"Diana", "SPb"},
    }
    byCity := make(map[string][]string)
    for _, p := range people {
        byCity[p.City] = append(byCity[p.City], p.Name)
    }
    fmt.Println("По городам:", byCity)

    // 3. Set (множество) через map[T]struct{}
    seen := make(map[int]struct{})
    nums := []int{1, 2, 3, 2, 1, 4}
    var unique []int
    for _, n := range nums {
        if _, exists := seen[n]; !exists {
            seen[n] = struct{}{}
            unique = append(unique, n)
        }
    }
    sort.Ints(unique)
    fmt.Println("Уникальные:", unique) // [1 2 3 4]

    // 4. Кэш (memoization)
    cache := make(map[int]int)
    var fib func(n int) int
    fib = func(n int) int {
        if n <= 1 {
            return n
        }
        if v, ok := cache[n]; ok {
            return v
        }
        result := fib(n-1) + fib(n-2)
        cache[n] = result
        return result
    }
    fmt.Println("Fib(40):", fib(40)) // 102334155
}`,
      explanation: 'Частые паттерны: frequency counter, groupBy, Set через map[T]struct{} (struct{} не занимает памяти), memoization. Map — универсальный инструмент для задач с поиском за O(1).'
    },
    {
      type: 'info-box',
      variant: 'important',
      content: `<p><strong>Map в Go не потокобезопасна!</strong> Конкурентное чтение — ок, но одновременное чтение и запись вызовет panic. Используйте <code>sync.RWMutex</code> или <code>sync.Map</code> для конкурентного доступа.</p>`
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'Потокобезопасная map через sync.Map',
      code: `package main

import (
    "fmt"
    "sync"
)

func main() {
    var m sync.Map

    // Store — O(1)
    m.Store("key1", "value1")
    m.Store("key2", 42)

    // Load — O(1)
    val, ok := m.Load("key1")
    if ok {
        fmt.Println("key1:", val)
    }

    // LoadOrStore — атомарно
    actual, loaded := m.LoadOrStore("key3", "default")
    fmt.Println("key3:", actual, "existed:", loaded)

    // Delete
    m.Delete("key2")

    // Итерация
    m.Range(func(key, value any) bool {
        fmt.Printf("%v = %v\\n", key, value)
        return true // false = остановить итерацию
    })
}`,
      explanation: 'sync.Map оптимизирована для сценариев "много чтений, мало записей". Обычная map + RWMutex быстрее для high-write сценариев.'
    },
    {
      type: 'quiz',
      questions: [
        {
          id: 'q1505-1',
          type: 'single',
          question: 'Что возвращает map["несуществующий_ключ"] в Go?',
          options: [
            'nil',
            'panic: key not found',
            'Zero value типа значения',
            'Ошибку'
          ],
          correct: 2,
          explanation: 'В Go обращение к несуществующему ключу возвращает zero value типа значения: 0 для int, "" для string, nil для pointer/slice/map. Используйте паттерн val, ok := m[key] для различия "нет ключа" от "значение = zero value".'
        },
        {
          id: 'q1505-2',
          type: 'single',
          question: 'Как реализовать Set (множество) в Go?',
          options: [
            'map[T]bool',
            'map[T]struct{}',
            'Оба варианта верны, но map[T]struct{} экономит память',
            '[]T с дедупликацией'
          ],
          correct: 2,
          explanation: 'Оба варианта работают. map[T]struct{} предпочтительнее: struct{} — пустая структура, занимает 0 байт. map[T]bool занимает дополнительный байт на элемент. В Go это идиоматичный способ создания множества.'
        },
        {
          id: 'q1505-3',
          type: 'single',
          question: 'Что будет при конкурентной записи в обычную map из двух горутин?',
          options: [
            'Данные запишутся корректно',
            'Последняя запись победит',
            'runtime: concurrent map writes — panic',
            'Deadlock'
          ],
          correct: 2,
          explanation: 'Go runtime обнаруживает конкурентный доступ к map и вызывает panic: concurrent map writes. Это сделано намеренно для безопасности. Используйте sync.Mutex или sync.Map.'
        }
      ]
    }
  ]
};
