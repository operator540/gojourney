export default {
  id: '15-02',
  title: 'Массивы и связные списки',
  description: 'Array vs Slice под капотом, реализация LinkedList на Go, Big O операций и когда что использовать.',
  estimatedTime: 25,
  xpReward: 120,
  sections: [
    {
      type: 'theory',
      content: `<h2>Массивы и срезы в Go под капотом</h2>
<p>В Go есть два смежных типа: <strong>array</strong> (фиксированный размер) и <strong>slice</strong> (динамический). Slice — это структура из трёх полей:</p>
<ul>
  <li><strong>ptr</strong> — указатель на backing array</li>
  <li><strong>len</strong> — текущая длина</li>
  <li><strong>cap</strong> — ёмкость backing array</li>
</ul>
<p>Когда len превышает cap при append, Go выделяет новый массив (~2x) и копирует данные. Это амортизированное O(1) для append, но единичный append может быть O(n).</p>`
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'Array vs Slice — внутреннее устройство',
      code: `package main

import "fmt"

func main() {
    // Array — фиксированный, на стеке
    arr := [5]int{1, 2, 3, 4, 5}
    fmt.Println("Array:", arr)

    // Slice — динамический, указатель на heap
    s := make([]int, 0, 4)
    fmt.Printf("len=%d cap=%d\\n", len(s), cap(s))

    for i := 0; i < 8; i++ {
        s = append(s, i)
        fmt.Printf("append(%d): len=%d cap=%d\\n", i, len(s), cap(s))
    }

    // Два среза на одном backing array
    a := []int{10, 20, 30, 40, 50}
    b := a[1:3] // [20, 30]
    b[0] = 999
    fmt.Println("a после изменения b:", a) // [10 999 30 40 50]
}`,
      explanation: 'Срезы разделяют backing array. Изменение одного среза влияет на другой, если они перекрываются. При append() после превышения cap — создаётся новый независимый массив.'
    },
    {
      type: 'theory',
      content: `<h2>Связный список (Linked List)</h2>
<p>Связный список — структура, где каждый элемент (<strong>Node</strong>) хранит данные и указатель на следующий узел. В отличие от массива, элементы не лежат в памяти подряд.</p>
<p>Типы связных списков:</p>
<ul>
  <li><strong>Односвязный</strong> — указатель только на следующий</li>
  <li><strong>Двусвязный</strong> — указатели на следующий и предыдущий</li>
  <li><strong>Кольцевой</strong> — последний ссылается на первый</li>
</ul>`
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'Реализация односвязного списка',
      code: `package main

import "fmt"

type Node struct {
    Value int
    Next  *Node
}

type LinkedList struct {
    Head *Node
    Size int
}

// PushFront — вставка в начало O(1)
func (l *LinkedList) PushFront(val int) {
    node := &Node{Value: val, Next: l.Head}
    l.Head = node
    l.Size++
}

// PushBack — вставка в конец O(n)
func (l *LinkedList) PushBack(val int) {
    node := &Node{Value: val}
    if l.Head == nil {
        l.Head = node
    } else {
        cur := l.Head
        for cur.Next != nil {
            cur = cur.Next
        }
        cur.Next = node
    }
    l.Size++
}

// Delete — удаление по значению O(n)
func (l *LinkedList) Delete(val int) bool {
    if l.Head == nil {
        return false
    }
    if l.Head.Value == val {
        l.Head = l.Head.Next
        l.Size--
        return true
    }
    cur := l.Head
    for cur.Next != nil {
        if cur.Next.Value == val {
            cur.Next = cur.Next.Next
            l.Size--
            return true
        }
        cur = cur.Next
    }
    return false
}

// Print — вывод списка
func (l *LinkedList) Print() {
    cur := l.Head
    for cur != nil {
        fmt.Printf("%d -> ", cur.Value)
        cur = cur.Next
    }
    fmt.Println("nil")
}

func main() {
    list := &LinkedList{}
    list.PushBack(1)
    list.PushBack(2)
    list.PushBack(3)
    list.PushFront(0)
    list.Print() // 0 -> 1 -> 2 -> 3 -> nil

    list.Delete(2)
    list.Print() // 0 -> 1 -> 3 -> nil
    fmt.Println("Size:", list.Size)
}`,
      explanation: 'PushFront — O(1) т.к. просто меняем Head. PushBack и Delete — O(n) т.к. нужно дойти до нужного узла. Поиск по индексу — всегда O(n) в отличие от массива O(1).'
    },
    {
      type: 'diagram',
      format: 'mermaid',
      code: `graph LR
    A["Head\\n[0]"] --> B["Node\\n[1]"] --> C["Node\\n[2]"] --> D["Node\\n[3]"] --> E["nil"]
    style A fill:#4CAF50,color:#fff
    style E fill:#f44336,color:#fff`,
      caption: 'Структура односвязного списка: каждый узел хранит значение и указатель на следующий'
    },
    {
      type: 'theory',
      content: `<h2>Big O операций: сравнение</h2>
<table style="width:100%;border-collapse:collapse">
  <thead>
    <tr style="background:#2a2a3e">
      <th style="padding:8px;border:1px solid #444">Операция</th>
      <th style="padding:8px;border:1px solid #444">Array/Slice</th>
      <th style="padding:8px;border:1px solid #444">Linked List</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px;border:1px solid #444">Доступ по индексу</td><td style="padding:8px;border:1px solid #444;color:#4CAF50">O(1)</td><td style="padding:8px;border:1px solid #444;color:#f44336">O(n)</td></tr>
    <tr><td style="padding:8px;border:1px solid #444">Поиск по значению</td><td style="padding:8px;border:1px solid #444">O(n)</td><td style="padding:8px;border:1px solid #444">O(n)</td></tr>
    <tr><td style="padding:8px;border:1px solid #444">Вставка в начало</td><td style="padding:8px;border:1px solid #444;color:#f44336">O(n)</td><td style="padding:8px;border:1px solid #444;color:#4CAF50">O(1)</td></tr>
    <tr><td style="padding:8px;border:1px solid #444">Вставка в конец</td><td style="padding:8px;border:1px solid #444;color:#4CAF50">O(1)*</td><td style="padding:8px;border:1px solid #444">O(n)</td></tr>
    <tr><td style="padding:8px;border:1px solid #444">Удаление из начала</td><td style="padding:8px;border:1px solid #444;color:#f44336">O(n)</td><td style="padding:8px;border:1px solid #444;color:#4CAF50">O(1)</td></tr>
    <tr><td style="padding:8px;border:1px solid #444">Память</td><td style="padding:8px;border:1px solid #444;color:#4CAF50">Компактная</td><td style="padding:8px;border:1px solid #444;color:#f44336">+указатели</td></tr>
  </tbody>
</table>
<p><small>* амортизированное O(1) для slice append</small></p>
<h3>Когда что использовать?</h3>
<ul>
  <li><strong>Slice</strong> — в 95% случаев. Кэш-дружелюбен, быстрый доступ по индексу, меньше аллокаций.</li>
  <li><strong>Linked List</strong> — когда часто вставляете/удаляете в начало или середину, размер непредсказуем и важна память.</li>
</ul>`
    },
    {
      type: 'info-box',
      variant: 'tip',
      content: '<p>В стандартной библиотеке Go есть <code>container/list</code> — двусвязный список. Но на практике slice почти всегда быстрее из-за cache locality. CPU кэш любит последовательную память.</p>'
    },
    {
      type: 'quiz',
      questions: [
        {
          id: 'q1502-1',
          type: 'single',
          question: 'Что произойдёт с capacity slice при append, если len == cap?',
          options: [
            'Вернётся ошибка',
            'Go выделит новый массив примерно вдвое большего размера',
            'Append будет проигнорирован',
            'Slice автоматически ссылается на другой массив'
          ],
          correct: 1,
          explanation: 'При превышении cap Go выделяет новый backing array (~2x) и копирует туда данные. Старый массив перестаёт использоваться.'
        },
        {
          id: 'q1502-2',
          type: 'single',
          question: 'Какова сложность доступа к элементу по индексу в связном списке?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
          correct: 2,
          explanation: 'В связном списке нет прямого доступа по индексу. Чтобы добраться до i-го элемента, нужно пройти от Head через i указателей — O(n).'
        },
        {
          id: 'q1502-3',
          type: 'single',
          question: 'Два среза b := a[1:3] и a ссылаются на один backing array. Что произойдёт при изменении b[0]?',
          options: [
            'Изменится только b[0], a не затронется',
            'Изменится a[1], т.к. b[0] — это a[1] в общем массиве',
            'Go создаст копию массива для b',
            'Возникнет panic'
          ],
          correct: 1,
          explanation: 'b := a[1:3] создаёт срез, указывающий на тот же backing array с offset 1. b[0] — это a[1]. Изменение b[0] = X изменяет a[1] = X.'
        }
      ]
    }
  ]
};
