export default {
  id: '16-02',
  title: 'Оптимизация запросов',
  description: 'Медленные запросы, избегание SELECT *, N+1 проблема, использование LIMIT. Практические примеры на SQL.',
  estimatedTime: 20,
  xpReward: 115,
  sections: [
    {
      type: 'theory',
      content: `<h2>Оптимизация SQL-запросов</h2>
<p>Медленные запросы — одна из главных причин тормозов в backend приложениях. 80% проблем с производительностью в PostgreSQL — это неоптимальные запросы, а не нехватка железа.</p>
<h3>Основные антипаттерны:</h3>
<ul>
  <li><strong>SELECT *</strong> — тянет ненужные колонки, мешает индексам</li>
  <li><strong>N+1 проблема</strong> — один запрос + N запросов для каждой записи</li>
  <li><strong>Отсутствие LIMIT</strong> — возврат всей таблицы</li>
  <li><strong>LIKE '%text%'</strong> — невозможно использовать индекс</li>
  <li><strong>Функции в WHERE</strong> — UPPER(name) = 'ALICE' не использует индекс</li>
</ul>`
    },
    {
      type: 'code-example',
      language: 'bash',
      title: 'SELECT * — почему это плохо',
      code: `-- Плохо: тянем все колонки включая большие JSONB/TEXT поля
SELECT * FROM users WHERE id = 1;

-- Хорошо: только нужные колонки
SELECT id, name, email FROM users WHERE id = 1;

-- Плохо: COUNT(*) с WHERE и без индекса
SELECT COUNT(*) FROM orders WHERE status = 'pending';

-- Хорошо: создаём индекс и используем конкретные поля
CREATE INDEX idx_orders_status ON orders(status);
SELECT COUNT(id) FROM orders WHERE status = 'pending';

-- Плохо: LIKE с ведущим символом %
SELECT * FROM users WHERE email LIKE '%@gmail.com';

-- Хорошо: LIKE только с суффиксом (может использовать индекс)
SELECT id, email FROM users WHERE email LIKE 'alice%';`,
      explanation: 'SELECT * мешает индекс-only сканам — PostgreSQL вынужден обращаться к heap для каждой строки. При SELECT конкретных полей, если они покрыты индексом, доступ к heap не нужен.'
    },
    {
      type: 'theory',
      content: `<h2>N+1 проблема</h2>
<p>N+1 — классическая проблема: делаем 1 запрос для получения списка, затем N запросов для каждого элемента.</p>
<pre style="background:#1e1e2e;padding:12px;border-radius:6px;overflow:auto"><code>-- Запрос 1: получаем всех пользователей
SELECT id FROM users LIMIT 100;  -- 100 строк

-- Запросы 2..101: для каждого пользователя отдельный запрос
SELECT * FROM orders WHERE user_id = 1;
SELECT * FROM orders WHERE user_id = 2;
-- ... ещё 98 запросов
</code></pre>
<p>100 запросов вместо 1. При latency 1ms каждый = 100ms накладных расходов только на сеть.</p>`
    },
    {
      type: 'code-example',
      language: 'bash',
      title: 'Решение N+1 через JOIN и IN',
      code: `-- N+1 проблема: отдельный запрос для каждого заказа
-- НЕ ДЕЛАЙТЕ ТАК в цикле приложения!

-- Решение 1: JOIN (если нужны данные из обеих таблиц)
SELECT
    u.id,
    u.name,
    u.email,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(o.total), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.name, u.email;

-- Решение 2: IN (batch запрос по списку ID)
-- Сначала получаем user_ids в приложении
-- SELECT id FROM users LIMIT 100  -> [1, 2, 3, ..., 100]

-- Затем один батч-запрос
SELECT user_id, SUM(total) as total
FROM orders
WHERE user_id IN (1, 2, 3, 4, 5)
GROUP BY user_id;

-- Решение 3: Subquery
SELECT
    u.id,
    u.name,
    (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count
FROM users u
LIMIT 100;
-- Subquery выполняется для каждой строки — тоже N+1, но в рамках одного SQL`,
      explanation: 'JOIN — лучший вариант когда нужны данные из нескольких таблиц. IN — для батч-загрузки связанных данных. Subquery коррелированный (со ссылкой на внешний запрос) — это тот же N+1 внутри SQL.'
    },
    {
      type: 'code-example',
      language: 'bash',
      title: 'LIMIT и пагинация',
      code: `-- Без LIMIT — возвращает всю таблицу (миллионы строк!)
SELECT * FROM logs;  -- опасно!

-- С LIMIT — безопасно
SELECT id, message, created_at
FROM logs
ORDER BY created_at DESC
LIMIT 50;

-- Пагинация через OFFSET (простой, но медленный при больших offset)
SELECT id, name FROM users
ORDER BY id
LIMIT 20 OFFSET 1000;  -- пропустить 1000 строк = медленно

-- Keyset пагинация (cursor-based) — быстрая
-- Первая страница
SELECT id, name FROM users
ORDER BY id
LIMIT 20;

-- Следующая страница: используем последний id предыдущей
SELECT id, name FROM users
WHERE id > 1234  -- последний id предыдущей страницы
ORDER BY id
LIMIT 20;`,
      explanation: 'OFFSET пагинация: PostgreSQL сканирует и пропускает OFFSET строк — O(offset). При OFFSET 100000 это 100k строк впустую. Keyset пагинация использует индекс и работает за O(1) независимо от страницы.'
    },
    {
      type: 'info-box',
      variant: 'tip',
      content: '<p>В Go с библиотекой <code>sqlx</code> или <code>pgx</code> используйте <strong>batch-загрузку</strong>: собирайте все нужные ID, делайте один запрос с <code>IN ($1, $2, ...)</code>. Это решает N+1 на уровне приложения.</p>'
    },
    {
      type: 'quiz',
      questions: [
        {
          id: 'q1602-1',
          type: 'single',
          question: 'В чём суть N+1 проблемы?',
          options: [
            'Запрос возвращает N+1 строк вместо N',
            '1 запрос для списка + N отдельных запросов для каждого элемента',
            'Индекс используется N+1 раз',
            'JOIN выполняется N+1 раз'
          ],
          correct: 1,
          explanation: 'N+1: один запрос возвращает N записей, затем для каждой записи делается отдельный запрос. Итого N+1 запрос вместо одного. Решается через JOIN или batch IN.'
        },
        {
          id: 'q1602-2',
          type: 'single',
          question: 'Почему keyset пагинация (WHERE id > last_id) лучше OFFSET пагинации?',
          options: [
            'Keyset возвращает больше данных',
            'OFFSET заставляет БД сканировать и пропускать N строк, keyset использует индекс',
            'Keyset проще в реализации',
            'OFFSET не поддерживается в PostgreSQL'
          ],
          correct: 1,
          explanation: 'OFFSET 10000 вынуждает PostgreSQL последовательно считать и отбросить 10000 строк. Keyset (WHERE id > last_id ORDER BY id LIMIT n) использует индекс и мгновенно находит начало страницы.'
        },
        {
          id: 'q1602-3',
          type: 'single',
          question: 'Почему LIKE \'%text%\' не может использовать B-tree индекс?',
          options: [
            'Это ошибка синтаксиса',
            'Ведущий % означает "любые символы в начале" — индекс не знает, с чего начать поиск',
            'LIKE не поддерживается в PostgreSQL',
            'Индекс не поддерживает строки'
          ],
          correct: 1,
          explanation: 'B-tree индекс работает по принципу "начало строки известно". LIKE \'text%\' может использовать индекс. LIKE \'%text%\' требует полного сканирования — индекс бесполезен. Для полнотекстового поиска используйте GIN индекс с tsvector.'
        }
      ]
    }
  ]
};
