export default {
  id: '15-06',
  title: 'Деревья и обход',
  description: 'Бинарное дерево поиска (BST) на Go. Вставка, поиск. DFS обходы: inorder, preorder, postorder рекурсивно.',
  estimatedTime: 30,
  xpReward: 135,
  sections: [
    {
      type: 'theory',
      content: `<h2>Бинарное дерево поиска (BST)</h2>
<p>BST — дерево, где для каждого узла выполняется правило:</p>
<ul>
  <li>Все узлы <strong>левого</strong> поддерева < текущего узла</li>
  <li>Все узлы <strong>правого</strong> поддерева > текущего узла</li>
</ul>
<p>Это свойство позволяет искать элементы за O(log n) в сбалансированном дереве.</p>
<h3>Применение деревьев:</h3>
<ul>
  <li><strong>Файловые системы</strong> — директории и файлы</li>
  <li><strong>HTML DOM</strong> — дерево элементов</li>
  <li><strong>Индексы БД</strong> — B-деревья в PostgreSQL</li>
  <li><strong>Компиляторы</strong> — AST (Abstract Syntax Tree)</li>
  <li><strong>JSON парсинг</strong> — вложенные структуры</li>
</ul>`
    },
    {
      type: 'diagram',
      format: 'mermaid',
      code: `graph TD
    A((8)) --> B((4))
    A --> C((12))
    B --> D((2))
    B --> E((6))
    C --> F((10))
    C --> G((14))
    D --> H((1))
    D --> I((3))
    style A fill:#7c4dff,color:#fff
    style B fill:#4CAF50,color:#fff
    style C fill:#4CAF50,color:#fff`,
      caption: 'BST: слева всегда меньше, справа всегда больше. Поиск: O(log n) для сбалансированного дерева.'
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'Реализация BST — вставка и поиск',
      code: `package main

import "fmt"

type TreeNode struct {
    Value int
    Left  *TreeNode
    Right *TreeNode
}

type BST struct {
    Root *TreeNode
}

// Insert — вставка в BST O(log n) в среднем
func (t *BST) Insert(val int) {
    t.Root = insertNode(t.Root, val)
}

func insertNode(node *TreeNode, val int) *TreeNode {
    if node == nil {
        return &TreeNode{Value: val}
    }
    if val < node.Value {
        node.Left = insertNode(node.Left, val)
    } else if val > node.Value {
        node.Right = insertNode(node.Right, val)
    }
    // Дубликаты игнорируются
    return node
}

// Search — поиск O(log n) в среднем
func (t *BST) Search(val int) bool {
    return searchNode(t.Root, val)
}

func searchNode(node *TreeNode, val int) bool {
    if node == nil {
        return false
    }
    if val == node.Value {
        return true
    }
    if val < node.Value {
        return searchNode(node.Left, val)
    }
    return searchNode(node.Right, val)
}

func main() {
    tree := &BST{}
    for _, v := range []int{8, 4, 12, 2, 6, 10, 14, 1, 3} {
        tree.Insert(v)
    }

    fmt.Println("Search 6:", tree.Search(6))   // true
    fmt.Println("Search 7:", tree.Search(7))   // false
    fmt.Println("Search 14:", tree.Search(14)) // true
}`,
      explanation: 'Вставка и поиск в BST — O(log n) для сбалансированного дерева, O(n) в худшем случае (вырожденное дерево — все элементы в одну сторону). Для гарантированного O(log n) используют AVL-деревья или Red-Black деревья.'
    },
    {
      type: 'theory',
      content: `<h2>Обходы дерева (Tree Traversal)</h2>
<p>DFS (Depth-First Search) — три варианта обхода в глубину:</p>
<ul>
  <li><strong>Inorder</strong> (LNR): левое → текущий → правое. Для BST даёт отсортированный порядок</li>
  <li><strong>Preorder</strong> (NLR): текущий → левое → правое. Используется для копирования дерева</li>
  <li><strong>Postorder</strong> (LRN): левое → правое → текущий. Используется для удаления дерева</li>
</ul>`
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'DFS обходы — Inorder, Preorder, Postorder',
      code: `package main

import "fmt"

type TreeNode struct {
    Value int
    Left  *TreeNode
    Right *TreeNode
}

// Inorder: Left → Node → Right
// Результат для BST: отсортированный порядок
func Inorder(node *TreeNode, result *[]int) {
    if node == nil {
        return
    }
    Inorder(node.Left, result)
    *result = append(*result, node.Value)
    Inorder(node.Right, result)
}

// Preorder: Node → Left → Right
// Используется для сериализации дерева
func Preorder(node *TreeNode, result *[]int) {
    if node == nil {
        return
    }
    *result = append(*result, node.Value)
    Preorder(node.Left, result)
    Preorder(node.Right, result)
}

// Postorder: Left → Right → Node
// Используется для подсчёта размера поддерева
func Postorder(node *TreeNode, result *[]int) {
    if node == nil {
        return
    }
    Postorder(node.Left, result)
    Postorder(node.Right, result)
    *result = append(*result, node.Value)
}

// BFS — обход в ширину (уровень за уровнем)
func BFS(root *TreeNode) []int {
    if root == nil {
        return nil
    }
    var result []int
    queue := []*TreeNode{root}
    for len(queue) > 0 {
        node := queue[0]
        queue = queue[1:]
        result = append(result, node.Value)
        if node.Left != nil {
            queue = append(queue, node.Left)
        }
        if node.Right != nil {
            queue = append(queue, node.Right)
        }
    }
    return result
}

func main() {
    //      8
    //    /   \\
    //   4     12
    //  / \\   /  \\
    // 2   6 10  14
    root := &TreeNode{Value: 8,
        Left: &TreeNode{Value: 4,
            Left:  &TreeNode{Value: 2},
            Right: &TreeNode{Value: 6}},
        Right: &TreeNode{Value: 12,
            Left:  &TreeNode{Value: 10},
            Right: &TreeNode{Value: 14}}}

    var inorder, preorder, postorder []int
    Inorder(root, &inorder)
    Preorder(root, &preorder)
    Postorder(root, &postorder)

    fmt.Println("Inorder  (sorted):", inorder)   // [2 4 6 8 10 12 14]
    fmt.Println("Preorder (root 1st):", preorder)  // [8 4 2 6 12 10 14]
    fmt.Println("Postorder(root last):", postorder) // [2 6 4 10 14 12 8]
    fmt.Println("BFS      (by level):", BFS(root)) // [8 4 12 2 6 10 14]
}`,
      explanation: 'Inorder обход BST даёт элементы в отсортированном порядке — это ключевое свойство BST. Все обходы имеют сложность O(n) — нужно посетить каждый узел.'
    },
    {
      type: 'info-box',
      variant: 'tip',
      content: '<p>В стандартной библиотеке Go нет встроенного дерева. Для production используйте пакет <code>github.com/emirpasic/gods</code> — готовые реализации AVL-дерева, Red-Black дерева и других структур данных.</p>'
    },
    {
      type: 'quiz',
      questions: [
        {
          id: 'q1506-1',
          type: 'single',
          question: 'Какой обход BST даёт элементы в отсортированном порядке?',
          options: ['Preorder (NLR)', 'Inorder (LNR)', 'Postorder (LRN)', 'BFS'],
          correct: 1,
          explanation: 'Inorder обход (Left → Node → Right) BST всегда даёт элементы в возрастающем порядке. Это прямое следствие свойства BST: левое поддерево < корень < правое поддерево.'
        },
        {
          id: 'q1506-2',
          type: 'single',
          question: 'Какова сложность поиска в несбалансированном BST в худшем случае?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
          correct: 2,
          explanation: 'В худшем случае BST вырождается в связный список (все элементы вставлены по возрастанию). Тогда поиск требует O(n). Для гарантированного O(log n) нужны самобалансирующиеся деревья (AVL, Red-Black).'
        },
        {
          id: 'q1506-3',
          type: 'single',
          question: 'Какой обход используется для корректного удаления дерева из памяти?',
          options: ['Preorder', 'Inorder', 'Postorder', 'BFS'],
          correct: 2,
          explanation: 'Postorder (Left → Right → Node) обрабатывает узел после его потомков. Это позволяет сначала удалить дочерние узлы, затем родительский — правильный порядок для освобождения памяти.'
        }
      ]
    }
  ]
};
