export default {
  id: '15-08',
  title: 'Итоговый квиз: Алгоритмы',
  description: 'Проверь знания по всем темам модуля: Big O, структуры данных, сортировки, деревья, графы.',
  estimatedTime: 15,
  xpReward: 200,
  sections: [
    {
      type: 'quiz',
      questions: [
        {
          id: 'q1508-1',
          type: 'single',
          question: 'Функция выполняет цикл O(n), внутри которого вызывает функцию O(log n). Итоговая сложность?',
          options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'],
          correct: 2,
          explanation: 'Вложенные операции перемножаются: внешний цикл O(n) × внутренняя операция O(log n) = O(n log n).'
        },
        {
          id: 'q1508-2',
          type: 'single',
          question: 'Что происходит с capacity slice при append, когда len == cap?',
          options: [
            'Ошибка компиляции',
            'Go выделяет новый массив примерно вдвое большего размера',
            'Append игнорируется',
            'len уменьшается на 1'
          ],
          correct: 1,
          explanation: 'Go выделяет новый backing array (~2x) и копирует данные. Это делает append амортизированным O(1), хотя единичный вызов может быть O(n).'
        },
        {
          id: 'q1508-3',
          type: 'single',
          question: 'Какой алгоритм сортировки использует стратегию "разделяй и властвуй"?',
          options: ['Bubble Sort', 'Selection Sort', 'Quick Sort', 'Counting Sort'],
          correct: 2,
          explanation: 'Quick Sort делит массив через pivot на части и рекурсивно сортирует каждую. Это классический "разделяй и властвуй" — O(n log n) в среднем.'
        },
        {
          id: 'q1508-4',
          type: 'single',
          question: 'Inorder обход BST даёт элементы в каком порядке?',
          options: [
            'Случайном',
            'Порядке вставки',
            'Отсортированном по возрастанию',
            'Отсортированном по убыванию'
          ],
          correct: 2,
          explanation: 'Inorder (Left → Node → Right) BST всегда даёт элементы в возрастающем порядке — прямое следствие свойства BST.'
        },
        {
          id: 'q1508-5',
          type: 'single',
          question: 'Какова средняя сложность операций с map (хеш-таблицей) в Go?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
          correct: 0,
          explanation: 'Все основные операции с map в Go (insert, lookup, delete) — O(1) в среднем. В худшем случае O(n) при множестве коллизий, но хорошая хеш-функция делает это крайне редким.'
        },
        {
          id: 'q1508-6',
          type: 'multiple',
          question: 'Какие из этих утверждений о BFS верны?',
          options: [
            'Использует очередь (FIFO)',
            'Гарантирует кратчайший путь в невзвешенном графе',
            'Использует стек для обхода',
            'Сложность O(V + E)'
          ],
          correct: [0, 1, 3],
          explanation: 'BFS использует очередь (не стек), обходит уровень за уровнем, гарантирует кратчайший путь, имеет сложность O(V+E). Стек использует DFS.'
        },
        {
          id: 'q1508-7',
          type: 'single',
          question: 'Что такое Stack и Queue соответственно?',
          options: [
            'FIFO и LIFO',
            'LIFO и FIFO',
            'Оба LIFO',
            'Оба FIFO'
          ],
          correct: 1,
          explanation: 'Stack — LIFO (Last In, First Out): последний вошёл, первый вышел. Queue — FIFO (First In, First Out): первый вошёл, первый вышел.'
        }
      ]
    }
  ]
};
