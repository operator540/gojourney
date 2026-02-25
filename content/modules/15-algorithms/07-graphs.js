export default {
  id: '15-07',
  title: 'Графы (BFS, DFS)',
  description: 'Представление графа через adjacency list. BFS с очередью. DFS рекурсивно. Практическое применение.',
  estimatedTime: 30,
  xpReward: 140,
  sections: [
    {
      type: 'theory',
      content: `<h2>Графы</h2>
<p>Граф — множество <strong>вершин (vertices)</strong> и <strong>рёбер (edges)</strong> между ними. Граф описывает связи между объектами.</p>
<h3>Типы графов:</h3>
<ul>
  <li><strong>Ориентированный (directed)</strong> — рёбра имеют направление (A → B)</li>
  <li><strong>Неориентированный (undirected)</strong> — рёбра без направления (A — B)</li>
  <li><strong>Взвешенный (weighted)</strong> — рёбра имеют вес/стоимость</li>
</ul>
<h3>Применение:</h3>
<ul>
  <li>Социальные сети — пользователи и их связи</li>
  <li>GPS навигация — карта дорог и кратчайший путь</li>
  <li>Интернет — веб-страницы и ссылки между ними</li>
  <li>Зависимости пакетов — npm, go modules</li>
</ul>`
    },
    {
      type: 'diagram',
      format: 'mermaid',
      code: `graph LR
    A((1)) --- B((2))
    A --- C((3))
    B --- D((4))
    B --- E((5))
    C --- E((5))
    D --- F((6))
    E --- F((6))
    style A fill:#7c4dff,color:#fff
    style F fill:#f44336,color:#fff`,
      caption: 'Неориентированный граф. Путь из 1 в 6: 1→2→4→6 или 1→2→5→6 или 1→3→5→6'
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'Представление графа через Adjacency List',
      code: `package main

import "fmt"

// Graph — неориентированный граф через список смежности
type Graph struct {
    Vertices int
    AdjList  map[int][]int
}

func NewGraph() *Graph {
    return &Graph{AdjList: make(map[int][]int)}
}

// AddEdge — добавление ребра (неориентированный граф)
func (g *Graph) AddEdge(u, v int) {
    g.AdjList[u] = append(g.AdjList[u], v)
    g.AdjList[v] = append(g.AdjList[v], u)
    g.Vertices++
}

// AddDirectedEdge — добавление ориентированного ребра
func (g *Graph) AddDirectedEdge(from, to int) {
    g.AdjList[from] = append(g.AdjList[from], to)
}

func main() {
    g := NewGraph()
    g.AddEdge(1, 2)
    g.AddEdge(1, 3)
    g.AddEdge(2, 4)
    g.AddEdge(2, 5)
    g.AddEdge(3, 5)
    g.AddEdge(4, 6)
    g.AddEdge(5, 6)

    fmt.Println("Список смежности:")
    for v, neighbors := range g.AdjList {
        fmt.Printf("  %d -> %v\\n", v, neighbors)
    }
}`,
      explanation: 'Adjacency list — самое распространённое представление разреженных графов. Занимает O(V + E) памяти. Adjacency matrix (двумерный массив) занимает O(V²) — используется только для плотных графов.'
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'BFS — обход в ширину',
      code: `package main

import "fmt"

type Graph struct {
    AdjList map[int][]int
}

// BFS — Breadth-First Search
// Обходит граф уровень за уровнем (кратчайший путь по числу рёбер)
func (g *Graph) BFS(start int) []int {
    visited := make(map[int]bool)
    queue := []int{start}
    visited[start] = true
    var order []int

    for len(queue) > 0 {
        // Dequeue
        vertex := queue[0]
        queue = queue[1:]
        order = append(order, vertex)

        // Обходим всех соседей
        for _, neighbor := range g.AdjList[vertex] {
            if !visited[neighbor] {
                visited[neighbor] = true
                queue = append(queue, neighbor)
            }
        }
    }
    return order
}

// BFSShortestPath — кратчайший путь (по числу рёбер)
func (g *Graph) BFSShortestPath(start, end int) []int {
    visited := make(map[int]bool)
    parent := make(map[int]int)
    queue := []int{start}
    visited[start] = true
    parent[start] = -1

    for len(queue) > 0 {
        v := queue[0]
        queue = queue[1:]

        if v == end {
            // Восстанавливаем путь
            var path []int
            for v != -1 {
                path = append([]int{v}, path...)
                v = parent[v]
            }
            return path
        }

        for _, n := range g.AdjList[v] {
            if !visited[n] {
                visited[n] = true
                parent[n] = v
                queue = append(queue, n)
            }
        }
    }
    return nil // путь не найден
}

func main() {
    g := &Graph{AdjList: map[int][]int{
        1: {2, 3},
        2: {1, 4, 5},
        3: {1, 5},
        4: {2, 6},
        5: {2, 3, 6},
        6: {4, 5},
    }}

    fmt.Println("BFS от 1:", g.BFS(1))
    // BFS от 1: [1 2 3 4 5 6]

    path := g.BFSShortestPath(1, 6)
    fmt.Println("Кратчайший путь 1→6:", path)
    // Кратчайший путь 1→6: [1 2 4 6]
}`,
      explanation: 'BFS использует очередь и посещает узлы уровень за уровнем. Гарантирует нахождение кратчайшего пути (по числу рёбер) в невзвешенном графе. Сложность: O(V + E).'
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'DFS — обход в глубину',
      code: `package main

import "fmt"

type Graph struct {
    AdjList map[int][]int
}

// DFS — Depth-First Search (рекурсивный)
// Уходит максимально глубоко по каждой ветке
func (g *Graph) DFS(start int) []int {
    visited := make(map[int]bool)
    var order []int
    g.dfsHelper(start, visited, &order)
    return order
}

func (g *Graph) dfsHelper(v int, visited map[int]bool, order *[]int) {
    visited[v] = true
    *order = append(*order, v)

    for _, neighbor := range g.AdjList[v] {
        if !visited[neighbor] {
            g.dfsHelper(neighbor, visited, order)
        }
    }
}

// HasCycle — проверка наличия цикла в ориентированном графе
func (g *Graph) HasCycle() bool {
    visited := make(map[int]bool)
    inStack := make(map[int]bool)

    var dfs func(v int) bool
    dfs = func(v int) bool {
        visited[v] = true
        inStack[v] = true

        for _, n := range g.AdjList[v] {
            if !visited[n] && dfs(n) {
                return true
            } else if inStack[n] {
                return true // Цикл найден
            }
        }
        inStack[v] = false
        return false
    }

    for v := range g.AdjList {
        if !visited[v] && dfs(v) {
            return true
        }
    }
    return false
}

// IsConnected — проверка связности графа
func (g *Graph) IsConnected() bool {
    if len(g.AdjList) == 0 {
        return true
    }
    var start int
    for k := range g.AdjList {
        start = k
        break
    }
    visited := make(map[int]bool)
    g.dfsHelper(start, visited, &[]int{})
    return len(visited) == len(g.AdjList)
}

func main() {
    g := &Graph{AdjList: map[int][]int{
        1: {2, 3},
        2: {1, 4, 5},
        3: {1, 5},
        4: {2, 6},
        5: {2, 3, 6},
        6: {4, 5},
    }}

    fmt.Println("DFS от 1:", g.DFS(1))
    // DFS от 1: [1 2 4 6 5 3]

    fmt.Println("Граф связный:", g.IsConnected()) // true

    // Граф с циклом
    cyclic := &Graph{AdjList: map[int][]int{
        1: {2},
        2: {3},
        3: {1}, // цикл!
    }}
    fmt.Println("Есть цикл:", cyclic.HasCycle()) // true
}`,
      explanation: 'DFS уходит максимально вглубь перед откатом. Используется для: поиска циклов, топологической сортировки, проверки связности. Сложность: O(V + E).'
    },
    {
      type: 'info-box',
      variant: 'tip',
      content: '<p><strong>BFS vs DFS:</strong> BFS — для кратчайшего пути (по числу рёбер), для обхода по уровням. DFS — для проверки достижимости, поиска циклов, топологической сортировки. Для взвешенных графов используйте алгоритм Дейкстры (кратчайший путь) или A* (поиск с эвристикой).</p>'
    },
    {
      type: 'quiz',
      questions: [
        {
          id: 'q1507-1',
          type: 'single',
          question: 'Какой алгоритм гарантирует нахождение кратчайшего пути в невзвешенном графе?',
          options: ['DFS', 'BFS', 'Оба', 'Ни один из них'],
          correct: 1,
          explanation: 'BFS обходит граф уровень за уровнем и гарантирует, что первый найденный путь до цели — кратчайший (по числу рёбер). DFS этого не гарантирует.'
        },
        {
          id: 'q1507-2',
          type: 'single',
          question: 'Какова сложность BFS и DFS для графа с V вершинами и E рёбрами?',
          options: ['O(V)', 'O(E)', 'O(V + E)', 'O(V * E)'],
          correct: 2,
          explanation: 'O(V + E) — каждую вершину посещаем один раз (V), каждое ребро проходим один раз (E). Это оптимально для обхода графа.'
        },
        {
          id: 'q1507-3',
          type: 'single',
          question: 'Какую структуру данных использует BFS для хранения узлов в очереди обхода?',
          options: ['Stack (стек)', 'Queue (очередь)', 'Priority Queue', 'Hash Map'],
          correct: 1,
          explanation: 'BFS использует очередь (FIFO): добавляем соседей в конец, берём для обработки из начала. Именно это обеспечивает обход по уровням. DFS использует стек (явный или через рекурсию).'
        }
      ]
    }
  ]
};
