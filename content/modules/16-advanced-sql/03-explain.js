export default {
  id: '16-03',
  title: 'EXPLAIN и планировщик запросов',
  description: 'EXPLAIN ANALYZE. Seq Scan vs Index Scan. Как читать вывод EXPLAIN. Практические примеры.',
  estimatedTime: 20,
  xpReward: 120,
  sections: [
    {
      type: 'theory',
      content: `<h2>EXPLAIN — инструмент отладки PostgreSQL</h2>
<p><code>EXPLAIN</code> показывает план выполнения запроса — как PostgreSQL собирается его выполнять. <code>EXPLAIN ANALYZE</code> реально выполняет запрос и показывает фактические данные.</p>
<h3>Ключевые типы сканирования:</h3>
<ul>
  <li><strong>Seq Scan</strong> — последовательное сканирование всей таблицы. Плохо для больших таблиц без LIMIT.</li>
  <li><strong>Index Scan</strong> — использует B-tree индекс. Быстро для поиска по конкретным значениям.</li>
  <li><strong>Index Only Scan</strong> — все нужные данные в индексе. Самый быстрый вариант.</li>
  <li><strong>Bitmap Heap Scan</strong> — сначала строит bitmap совпадений, затем читает heap. Хорош для нескольких условий.</li>
</ul>`
    },
    {
      type: 'code-example',
      language: 'bash',
      title: 'Читаем вывод EXPLAIN ANALYZE',
      code: `-- Пример 1: Seq Scan (медленно на большой таблице)
EXPLAIN ANALYZE
SELECT * FROM users WHERE name = 'Alice';

-- Вывод:
-- Seq Scan on users  (cost=0.00..18334.00 rows=1 width=100)
--                    (actual time=45.234..89.432 rows=1 loops=1)
--   Filter: (name = 'Alice')
--   Rows Removed by Filter: 1000000
-- Planning Time: 0.5 ms
-- Execution Time: 89.5 ms

-- Создаём индекс
CREATE INDEX idx_users_name ON users(name);

-- Пример 2: Index Scan (быстро)
EXPLAIN ANALYZE
SELECT * FROM users WHERE name = 'Alice';

-- Вывод:
-- Index Scan using idx_users_name on users
--   (cost=0.43..8.45 rows=1 width=100)
--   (actual time=0.045..0.052 rows=1 loops=1)
--   Index Cond: (name = 'Alice')
-- Planning Time: 0.3 ms
-- Execution Time: 0.1 ms`,
      explanation: 'cost=X..Y: X — стоимость получения первой строки, Y — общая стоимость. rows — ожидаемое число строк. actual time — реальное время в мс. Rows Removed by Filter показывает сколько строк было отброшено — признак отсутствия индекса.'
    },
    {
      type: 'code-example',
      language: 'bash',
      title: 'Как читать план: cost, rows, loops',
      code: `-- Сложный запрос с JOIN
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name
ORDER BY order_count DESC
LIMIT 10;

-- Пример вывода (снизу вверх — порядок выполнения):
-- Limit  (cost=245.00..245.03 rows=10 width=45)
--         (actual time=12.3..12.3 rows=10 loops=1)
--   -> Sort  (cost=245.00..246.00 rows=400 width=45)
--             (actual time=12.3..12.3 rows=10 loops=1)
--       Sort Key: (count(o.id)) DESC
--       Sort Method: top-N heapsort  Memory: 26kB
--     -> HashAggregate  (cost=220.00..225.00 rows=400 width=45)
--         -> Hash Left Join  (cost=50.00..200.00 rows=400)
--             Hash Cond: (o.user_id = u.id)
--             -> Seq Scan on orders o  (cost=0.00..100.00 rows=5000)
--             -> Hash  (cost=45.00..45.00 rows=400)
--                 -> Index Scan using idx_users_created on users u
--                     Index Cond: (created_at > '2024-01-01')`,
      explanation: 'Читать EXPLAIN нужно снизу вверх — это порядок выполнения. Самый вложенный узел выполняется первым. Ищите "Seq Scan" на больших таблицах, большие значения "rows removed", "loops" > 1.'
    },
    {
      type: 'code-example',
      language: 'bash',
      title: 'Полезные варианты EXPLAIN',
      code: `-- Базовый EXPLAIN — только план, без выполнения
EXPLAIN SELECT * FROM users WHERE id = 1;

-- ANALYZE — выполняет запрос и показывает реальные данные
EXPLAIN ANALYZE SELECT * FROM users WHERE id = 1;

-- BUFFERS — показывает использование кэша (shared hit vs read)
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM users WHERE email = 'alice@example.com';

-- FORMAT JSON — для программного разбора
EXPLAIN (FORMAT JSON) SELECT * FROM users;

-- VERBOSE — дополнительные детали
EXPLAIN (ANALYZE, VERBOSE, BUFFERS)
SELECT u.name, o.total
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.id = 5;

-- auto_explain: автологирование медленных запросов (в postgresql.conf)
-- shared_preload_libraries = 'auto_explain'
-- auto_explain.log_min_duration = 1000  -- запросы > 1 секунды
-- auto_explain.log_analyze = on`,
      explanation: 'BUFFERS показывает "shared hit=X read=Y": hit — данные из кэша (быстро), read — с диска (медленно). Высокое read = нужно больше shared_buffers или данные не помещаются в кэш.'
    },
    {
      type: 'info-box',
      variant: 'tip',
      content: '<p>Используйте <a href="https://explain.depesz.com" target="_blank">explain.depesz.com</a> или <a href="https://explain.tensor.ru" target="_blank">explain.tensor.ru</a> — онлайн визуализаторы вывода EXPLAIN. Вставляете текст вывода — получаете красивую диаграмму с подсветкой узких мест.</p>'
    },
    {
      type: 'quiz',
      questions: [
        {
          id: 'q1603-1',
          type: 'single',
          question: 'В чём разница между EXPLAIN и EXPLAIN ANALYZE?',
          options: [
            'EXPLAIN быстрее, ANALYZE точнее',
            'EXPLAIN только показывает план, ANALYZE реально выполняет запрос',
            'ANALYZE создаёт индексы автоматически',
            'Нет разницы'
          ],
          correct: 1,
          explanation: 'EXPLAIN только строит план без выполнения — безопасно. EXPLAIN ANALYZE реально выполняет запрос и показывает фактические данные (actual time, actual rows). Для UPDATE/DELETE с ANALYZE используйте транзакцию: BEGIN; EXPLAIN ANALYZE ...; ROLLBACK;'
        },
        {
          id: 'q1603-2',
          type: 'single',
          question: 'Что означает "Seq Scan" в выводе EXPLAIN?',
          options: [
            'Запрос использует sequence (последовательность)',
            'PostgreSQL последовательно сканирует всю таблицу строка за строкой',
            'Запрос использует индекс',
            'Выполняется подзапрос'
          ],
          correct: 1,
          explanation: 'Seq Scan (Sequential Scan) — последовательное чтение всей таблицы с диска. Для маленьких таблиц это нормально. Для больших таблиц с WHERE — признак отсутствия индекса.'
        },
        {
          id: 'q1603-3',
          type: 'single',
          question: 'В каком порядке нужно читать план EXPLAIN с вложенными узлами?',
          options: [
            'Сверху вниз',
            'Снизу вверх (самый вложенный узел — первый)',
            'Слева направо',
            'Порядок не важен'
          ],
          correct: 1,
          explanation: 'EXPLAIN показывает дерево операций. Выполнение идёт снизу вверх: самый вложенный (с наибольшим отступом) узел выполняется первым, результат передаётся вверх.'
        }
      ]
    }
  ]
};
