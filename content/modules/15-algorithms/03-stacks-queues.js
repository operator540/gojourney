export default {
  id: '15-03',
  title: 'Стеки и очереди',
  description: 'Stack (LIFO) и Queue (FIFO) — реализация на Go через slice, применение в реальных задачах.',
  estimatedTime: 20,
  xpReward: 110,
  sections: [
    {
      type: 'theory',
      content: `<h2>Стек (Stack) — LIFO</h2>
<p><strong>LIFO</strong> — Last In, First Out. Последний добавленный элемент извлекается первым. Как стопка тарелок: кладёшь сверху, берёшь тоже сверху.</p>
<h3>Применение стека:</h3>
<ul>
  <li><strong>Call stack</strong> — стек вызовов функций в любом языке программирования</li>
  <li><strong>Undo/Redo</strong> — история действий в редакторах</li>
  <li><strong>Парсинг выражений</strong> — проверка скобок, вычисление RPN</li>
  <li><strong>DFS</strong> — обход графа в глубину (итеративный)</li>
  <li><strong>defer в Go</strong> — работает как стек: последний defer выполняется первым</li>
</ul>`
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'Stack на основе slice',
      code: `package main

import (
    "errors"
    "fmt"
)

type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, error) {
    var zero T
    if len(s.items) == 0 {
        return zero, errors.New("stack is empty")
    }
    top := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return top, nil
}

func (s *Stack[T]) Peek() (T, error) {
    var zero T
    if len(s.items) == 0 {
        return zero, errors.New("stack is empty")
    }
    return s.items[len(s.items)-1], nil
}

func (s *Stack[T]) IsEmpty() bool {
    return len(s.items) == 0
}

func (s *Stack[T]) Size() int {
    return len(s.items)
}

// Пример: проверка правильности скобок
func isBalanced(s string) bool {
    stack := &Stack[rune]{}
    pairs := map[rune]rune{')': '(', ']': '[', '}': '{'}

    for _, ch := range s {
        switch ch {
        case '(', '[', '{':
            stack.Push(ch)
        case ')', ']', '}':
            top, err := stack.Pop()
            if err != nil || top != pairs[ch] {
                return false
            }
        }
    }
    return stack.IsEmpty()
}

func main() {
    s := &Stack[int]{}
    s.Push(1)
    s.Push(2)
    s.Push(3)

    for !s.IsEmpty() {
        val, _ := s.Pop()
        fmt.Printf("Pop: %d\\n", val) // 3, 2, 1
    }

    fmt.Println(isBalanced("({[]})")) // true
    fmt.Println(isBalanced("({[})"))  // false
}`,
      explanation: 'Стек реализован через дженерик — работает с любым типом. Push — O(1), Pop — O(1), Peek — O(1). Пример с проверкой скобок — классическая задача на стек.'
    },
    {
      type: 'theory',
      content: `<h2>Очередь (Queue) — FIFO</h2>
<p><strong>FIFO</strong> — First In, First Out. Первый добавленный элемент извлекается первым. Как очередь в кассу: кто пришёл первым, тот и обслуживается первым.</p>
<h3>Применение очереди:</h3>
<ul>
  <li><strong>Task queue</strong> — очередь задач для воркеров (RabbitMQ, Redis Queue)</li>
  <li><strong>BFS</strong> — обход графа в ширину</li>
  <li><strong>Буфер ввода-вывода</strong> — обработка запросов по порядку</li>
  <li><strong>Rate limiting</strong> — очередь запросов с ограничением</li>
  <li><strong>Планировщик задач</strong> — ОС распределяет процессы через очереди</li>
</ul>`
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'Queue на основе slice',
      code: `package main

import (
    "errors"
    "fmt"
)

type Queue[T any] struct {
    items []T
}

func (q *Queue[T]) Enqueue(item T) {
    q.items = append(q.items, item)
}

// Dequeue через re-slice — O(1) амортизированно, но оставляет память
func (q *Queue[T]) Dequeue() (T, error) {
    var zero T
    if len(q.items) == 0 {
        return zero, errors.New("queue is empty")
    }
    front := q.items[0]
    q.items = q.items[1:]
    return front, nil
}

func (q *Queue[T]) Front() (T, error) {
    var zero T
    if len(q.items) == 0 {
        return zero, errors.New("queue is empty")
    }
    return q.items[0], nil
}

func (q *Queue[T]) IsEmpty() bool {
    return len(q.items) == 0
}

func (q *Queue[T]) Size() int {
    return len(q.items)
}

// Пример: очередь задач
type Task struct {
    ID   int
    Name string
}

func processQueue(tasks []Task) {
    q := &Queue[Task]{}
    for _, t := range tasks {
        q.Enqueue(t)
        fmt.Printf("Enqueued: %s\\n", t.Name)
    }
    fmt.Println("---")
    for !q.IsEmpty() {
        task, _ := q.Dequeue()
        fmt.Printf("Processing: Task #%d - %s\\n", task.ID, task.Name)
    }
}

func main() {
    tasks := []Task{
        {1, "Send email"},
        {2, "Resize image"},
        {3, "Generate report"},
    }
    processQueue(tasks)
}`,
      explanation: 'Enqueue — O(1). Dequeue через q.items[1:] — амортизированно O(1), но backing array не освобождается сразу. Для высоконагруженных систем используют circular buffer или container/ring.'
    },
    {
      type: 'info-box',
      variant: 'note',
      content: `<p>В Go горутины и каналы (<code>chan</code>) — это встроенная очередь с синхронизацией. Буферизованный канал <code>make(chan T, n)</code> — это очередь размером n. В большинстве Go-программ вместо ручной Queue используют именно каналы.</p>`
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'Очередь через канал Go',
      code: `package main

import "fmt"

func main() {
    // Буферизованный канал как очередь
    queue := make(chan string, 5)

    // Enqueue
    queue <- "task1"
    queue <- "task2"
    queue <- "task3"

    // Dequeue
    fmt.Println(<-queue) // task1
    fmt.Println(<-queue) // task2
    fmt.Println(<-queue) // task3
}`,
      explanation: 'Буферизованный канал — идиоматичная очередь в Go. Поддерживает конкурентный доступ без дополнительной синхронизации.'
    },
    {
      type: 'diagram',
      format: 'mermaid',
      code: `graph LR
    subgraph Stack_LIFO
        direction TB
        S1["Push(3)"] --> S2["[1,2,3]"]
        S2 --> S3["Pop() = 3"]
        S3 --> S4["[1,2]"]
    end
    subgraph Queue_FIFO
        direction TB
        Q1["Enqueue(3)"] --> Q2["[1,2,3]"]
        Q2 --> Q3["Dequeue() = 1"]
        Q3 --> Q4["[2,3]"]
    end`,
      caption: 'Stack: последний вошёл — первый вышел. Queue: первый вошёл — первый вышел.'
    },
    {
      type: 'quiz',
      questions: [
        {
          id: 'q1503-1',
          type: 'single',
          question: 'defer в Go выполняет отложенные вызовы в каком порядке?',
          options: [
            'В порядке добавления (FIFO)',
            'В обратном порядке (LIFO)',
            'В случайном порядке',
            'Все одновременно'
          ],
          correct: 1,
          explanation: 'defer работает как стек (LIFO): последний defer выполняется первым при возврате из функции.'
        },
        {
          id: 'q1503-2',
          type: 'single',
          question: 'Какую структуру данных использует BFS (обход в ширину)?',
          options: ['Стек', 'Очередь', 'Массив', 'Хеш-таблицу'],
          correct: 1,
          explanation: 'BFS использует очередь (FIFO): сначала обрабатываем все соседи текущего уровня, затем переходим к следующему уровню.'
        },
        {
          id: 'q1503-3',
          type: 'single',
          question: 'Какой буферизованный канал лучше всего моделирует очередь задач?',
          options: [
            'make(chan Task)',
            'make(chan Task, 0)',
            'make(chan Task, 100)',
            'var ch chan Task'
          ],
          correct: 2,
          explanation: 'make(chan Task, 100) создаёт буферизованный канал на 100 элементов — это и есть очередь. Небуферизованный канал (size 0) блокирует отправителя сразу.'
        }
      ]
    }
  ]
};
