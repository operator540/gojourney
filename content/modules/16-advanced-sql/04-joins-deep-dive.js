export default {
  id: '16-04',
  title: 'Виды JOIN',
  description: 'INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, CROSS JOIN. Примеры с users и orders. Диаграммы Venn.',
  estimatedTime: 25,
  xpReward: 125,
  sections: [
    {
      type: 'theory',
      content: `<h2>JOIN — объединение таблиц</h2>
<p>JOIN соединяет строки из двух таблиц по условию. Результат зависит от типа JOIN:</p>
<ul>
  <li><strong>INNER JOIN</strong> — только строки, которые совпали в обеих таблицах</li>
  <li><strong>LEFT JOIN</strong> — все строки левой + совпавшие из правой (NULL если нет пары)</li>
  <li><strong>RIGHT JOIN</strong> — все строки правой + совпавшие из левой</li>
  <li><strong>FULL OUTER JOIN</strong> — все строки обеих таблиц</li>
  <li><strong>CROSS JOIN</strong> — декартово произведение (каждая строка с каждой)</li>
</ul>`
    },
    {
      type: 'code-example',
      language: 'bash',
      title: 'Тестовые данные: users и orders',
      code: `-- Создаём таблицы для примеров
CREATE TABLE users (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE orders (
    id      SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    total   NUMERIC(10,2)
);

-- Тестовые данные
INSERT INTO users (name) VALUES
    ('Alice'),   -- id=1, есть заказы
    ('Bob'),     -- id=2, есть заказы
    ('Charlie'), -- id=3, НЕТ заказов
    ('Diana');   -- id=4, НЕТ заказов

INSERT INTO orders (user_id, total) VALUES
    (1, 100.00),  -- заказ Alice
    (1, 250.00),  -- второй заказ Alice
    (2, 75.00),   -- заказ Bob
    (NULL, 50.00); -- заказ без пользователя (осиротевший)`,
      explanation: 'Alice и Bob имеют заказы, Charlie и Diana — нет. Один заказ orphaned (user_id = NULL). Это позволяет наглядно увидеть разницу между типами JOIN.'
    },
    {
      type: 'code-example',
      language: 'bash',
      title: 'INNER JOIN — только совпадения',
      code: `-- INNER JOIN: только пользователи с заказами
SELECT u.name, o.id AS order_id, o.total
FROM users u
INNER JOIN orders o ON o.user_id = u.id;

-- Результат:
-- name  | order_id | total
-- ------+----------+-------
-- Alice |        1 | 100.00
-- Alice |        2 | 250.00
-- Bob   |        3 |  75.00
-- Charlie и Diana не попали (нет заказов)
-- Orphaned заказ (user_id=NULL) тоже не попал

-- Агрегация с INNER JOIN
SELECT u.name, COUNT(o.id) AS orders, SUM(o.total) AS total_spent
FROM users u
INNER JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name
ORDER BY total_spent DESC;

-- Alice  | 2 | 350.00
-- Bob    | 1 |  75.00`,
      explanation: 'INNER JOIN — самый строгий. Пользователи без заказов не попадают в результат. Orphaned заказы тоже не попадают.'
    },
    {
      type: 'code-example',
      language: 'bash',
      title: 'LEFT JOIN — все пользователи',
      code: `-- LEFT JOIN: все пользователи, даже без заказов
SELECT u.name, o.id AS order_id, o.total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;

-- Результат:
-- name    | order_id | total
-- --------+----------+-------
-- Alice   |        1 | 100.00
-- Alice   |        2 | 250.00
-- Bob     |        3 |  75.00
-- Charlie |     NULL |  NULL   <- нет заказов, NULL
-- Diana   |     NULL |  NULL   <- нет заказов, NULL

-- Найти пользователей БЕЗ заказов
SELECT u.name
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;
-- Charlie
-- Diana

-- Эквивалент с NOT EXISTS (часто быстрее)
SELECT u.name
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);`,
      explanation: 'LEFT JOIN сохраняет все строки из левой таблицы. NULL в колонках правой таблицы означает отсутствие совпадения. Паттерн "LEFT JOIN WHERE right.id IS NULL" — эффективный способ найти записи без связанных данных.'
    },
    {
      type: 'code-example',
      language: 'bash',
      title: 'RIGHT JOIN и FULL OUTER JOIN',
      code: `-- RIGHT JOIN: все заказы, даже осиротевшие
SELECT u.name, o.id AS order_id, o.total
FROM users u
RIGHT JOIN orders o ON o.user_id = u.id;

-- Результат:
-- name  | order_id | total
-- ------+----------+-------
-- Alice |        1 | 100.00
-- Alice |        2 | 250.00
-- Bob   |        3 |  75.00
-- NULL  |        4 |  50.00  <- orphaned заказ, NULL для name

-- На практике RIGHT JOIN редко используют
-- Просто меняйте порядок таблиц и используйте LEFT JOIN

-- FULL OUTER JOIN: все строки обеих таблиц
SELECT u.name, o.id AS order_id, o.total
FROM users u
FULL OUTER JOIN orders o ON o.user_id = u.id;

-- Результат: все 4 пользователя + все 4 заказа + NULL там где нет пары
-- Alice   | 1 | 100.00
-- Alice   | 2 | 250.00
-- Bob     | 3 |  75.00
-- Charlie | NULL | NULL
-- Diana   | NULL | NULL
-- NULL    | 4 | 50.00

-- CROSS JOIN: декартово произведение (4 users × 4 orders = 16 строк)
SELECT u.name, o.total
FROM users u
CROSS JOIN orders o;
-- Используется редко, например для генерации всех комбинаций`,
      explanation: 'RIGHT JOIN = LEFT JOIN с перевёрнутыми таблицами. FULL OUTER JOIN полезен для поиска расхождений между таблицами. CROSS JOIN — мощный инструмент для генерации комбинаций, но осторожно с большими таблицами (N×M строк).'
    },
    {
      type: 'diagram',
      format: 'mermaid',
      code: `graph TB
    subgraph INNER["INNER JOIN"]
        I1["◑ только пересечение"]
    end
    subgraph LEFT["LEFT JOIN"]
        L1["◕ вся левая + пересечение"]
    end
    subgraph RIGHT["RIGHT JOIN"]
        R1["◔ вся правая + пересечение"]
    end
    subgraph FULL["FULL OUTER JOIN"]
        F1["● обе таблицы полностью"]
    end
    style INNER fill:#7c4dff,color:#fff
    style LEFT fill:#4CAF50,color:#fff
    style RIGHT fill:#FF9800,color:#fff
    style FULL fill:#f44336,color:#fff`,
      caption: 'Типы JOIN: от самого ограничительного (INNER) до самого включающего (FULL OUTER)'
    },
    {
      type: 'quiz',
      questions: [
        {
          id: 'q1604-1',
          type: 'single',
          question: 'Что вернёт LEFT JOIN для пользователя без заказов?',
          options: [
            'Строка не появится в результате',
            'Строка пользователя с NULL в колонках таблицы orders',
            'Ошибку',
            'Строку с нулями вместо NULL'
          ],
          correct: 1,
          explanation: 'LEFT JOIN сохраняет все строки левой таблицы. Если для пользователя нет совпадений в правой таблице, колонки правой таблицы заполняются NULL.'
        },
        {
          id: 'q1604-2',
          type: 'single',
          question: 'Как найти пользователей, у которых НЕТ заказов?',
          options: [
            'INNER JOIN с условием WHERE total IS NULL',
            'LEFT JOIN orders ON ... WHERE orders.id IS NULL',
            'FULL OUTER JOIN',
            'SELECT FROM users MINUS SELECT FROM orders'
          ],
          correct: 1,
          explanation: 'Паттерн: LEFT JOIN + WHERE right_table.id IS NULL. NULL в колонках правой таблицы — признак отсутствия совпадения. Альтернатива: NOT EXISTS (SELECT 1 FROM orders WHERE user_id = u.id).'
        },
        {
          id: 'q1604-3',
          type: 'single',
          question: 'Сколько строк вернёт CROSS JOIN таблиц с 100 и 50 строками?',
          options: ['150', '50', '5000', '100'],
          correct: 2,
          explanation: 'CROSS JOIN (декартово произведение) возвращает N × M строк: 100 × 50 = 5000. Будьте осторожны с CROSS JOIN больших таблиц — результат может быть огромным.'
        },
        {
          id: 'q1604-4',
          type: 'single',
          question: 'Чем отличается INNER JOIN от WHERE при соединении таблиц?',
          options: [
            'Нет никакой разницы',
            'INNER JOIN явно показывает намерение соединить таблицы, WHERE — фильтрует после соединения',
            'WHERE быстрее',
            'INNER JOIN поддерживает NULL, WHERE нет'
          ],
          correct: 1,
          explanation: 'Семантически "FROM a, b WHERE a.id = b.a_id" и "FROM a INNER JOIN b ON b.a_id = a.id" эквивалентны. Но явный JOIN синтаксис читаемее, и оптимизатор PostgreSQL обрабатывает их одинаково.'
        }
      ]
    }
  ]
};
