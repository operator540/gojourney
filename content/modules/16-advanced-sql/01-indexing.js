export default {
  id: '16-01',
  title: 'Индексы в PostgreSQL',
  description: 'B-tree, Hash, GIN, GIST, частичные и составные индексы. INCLUDE-колонки. Когда индексы вредят. Аналогия: индекс как оглавление книги.',
  estimatedTime: 30,
  xpReward: 25,
  sections: [
    {
      type: 'theory',
      content: `<h2>Зачем нужны индексы?</h2>
<p>Представьте энциклопедию на 10 000 страниц. Вам нужно найти статью про "Квантовую механику". Два варианта:</p>
<ul>
  <li><strong>Без индекса</strong> — листать страницу за страницей. 10 000 страниц. Это <strong>Sequential Scan</strong>.</li>
  <li><strong>С индексом (оглавлением)</strong> — открываете конец книги, находите "К" → "Кв" → страница 4823. Два прыжка. Это <strong>Index Scan</strong>.</li>
</ul>
<p>В PostgreSQL без индекса запрос <code>SELECT * FROM users WHERE email = 'alice@mail.com'</code> читает <strong>каждую строку</strong> таблицы. Миллион строк — миллион чтений с диска.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Метод</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">1M строк</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">10M строк</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Сложность</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)">Sequential Scan</td>
      <td style="padding:10px;border:1px solid var(--border);color:#f44336">~200ms</td>
      <td style="padding:10px;border:1px solid var(--border);color:#f44336">~2s</td>
      <td style="padding:10px;border:1px solid var(--border)">O(n)</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)">B-tree Index Scan</td>
      <td style="padding:10px;border:1px solid var(--border);color:#4caf50">~0.1ms</td>
      <td style="padding:10px;border:1px solid var(--border);color:#4caf50">~0.13ms</td>
      <td style="padding:10px;border:1px solid var(--border)">O(log n)</td>
    </tr>
  </tbody>
</table>`
    },
    {
      type: 'theory',
      content: `<h2>Типы индексов PostgreSQL</h2>
<p>PostgreSQL поддерживает несколько типов индексов. У каждого своя задача:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Тип</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Для чего</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Операторы</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Пример</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><strong>B-tree</strong></td>
      <td style="padding:10px;border:1px solid var(--border)">Универсальный, сортировка</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>=, &lt;, &gt;, BETWEEN, LIKE 'x%'</code></td>
      <td style="padding:10px;border:1px solid var(--border)">email, дата, число</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><strong>Hash</strong></td>
      <td style="padding:10px;border:1px solid var(--border)">Только точное равенство</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>=</code> только</td>
      <td style="padding:10px;border:1px solid var(--border)">session_token</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><strong>GIN</strong></td>
      <td style="padding:10px;border:1px solid var(--border)">Массивы, JSONB, full-text</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>@&gt;, &lt;@, @@, &amp;&amp;</code></td>
      <td style="padding:10px;border:1px solid var(--border)">tags[], body_tsvector</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><strong>GiST</strong></td>
      <td style="padding:10px;border:1px solid var(--border)">Геометрия, диапазоны, IP</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>&amp;&amp;, @&gt;, &lt;&lt;, &gt;&gt;</code></td>
      <td style="padding:10px;border:1px solid var(--border)">geography, tsrange</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><strong>BRIN</strong></td>
      <td style="padding:10px;border:1px solid var(--border)">Огромные таблицы с корреляцией</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>=, &lt;, &gt;</code></td>
      <td style="padding:10px;border:1px solid var(--border)">created_at в логах</td>
    </tr>
  </tbody>
</table>`
    },
    {
      type: 'code-example',
      language: 'sql',
      title: 'Создание разных типов индексов',
      code: `-- B-tree (по умолчанию) — универсальный
CREATE INDEX idx_users_email ON users(email);

-- Hash — только для = (компактнее B-tree, не поддерживает сортировку)
CREATE INDEX idx_sessions_token ON sessions USING HASH (token);

-- GIN — для массивов и JSONB
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);
CREATE INDEX idx_products_attrs ON products USING GIN (attributes jsonb_path_ops);

-- GiST — для геоданных (расширение PostGIS)
CREATE INDEX idx_locations_geo ON locations USING GIST (coordinates);

-- Функциональный индекс — для поиска без учёта регистра
CREATE INDEX idx_users_email_lower ON users (LOWER(email));
-- Теперь WHERE LOWER(email) = 'alice@mail.com' использует индекс

-- BRIN — минимальные индексы для временных рядов
CREATE INDEX idx_logs_created_brin ON logs USING BRIN (created_at);
-- Размер BRIN в 100x меньше B-tree, но менее точный`,
      explanation: 'B-tree — выбор по умолчанию для 90% случаев. GIN незаменим для поиска по JSONB и массивам. BRIN идеален для таблиц логов где данные вставляются последовательно по времени — создаётся за секунды даже на таблице с миллиардами строк.'
    },
    {
      type: 'code-example',
      language: 'sql',
      title: 'Составные, частичные и INCLUDE индексы',
      code: `-- Составной индекс: работает по Left-Most Prefix правилу
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Ускоряет:
WHERE user_id = 5                      -- ✅ использует индекс
WHERE user_id = 5 AND status = 'done'  -- ✅ использует индекс
-- НЕ ускоряет:
WHERE status = 'done'                  -- ❌ нет user_id слева

-- Частичный индекс — индексирует только подмножество строк
-- Идеально для "активных" записей (99% запросов по active=true)
CREATE INDEX idx_users_active_email
ON users(email)
WHERE is_active = TRUE;
-- Размер в 10x меньше полного индекса если активных 10%

-- Частичный для непрочитанных уведомлений
CREATE INDEX idx_notifications_unread
ON notifications(user_id, created_at DESC)
WHERE is_read = FALSE;

-- INCLUDE — covering index (добавляем данные в индекс без сортировки)
-- Позволяет PostgreSQL не идти в heap за дополнительными колонками
CREATE INDEX idx_orders_user_covering
ON orders(user_id)
INCLUDE (status, total_amount, created_at);

-- Теперь этот запрос не трогает heap вообще (index-only scan):
SELECT user_id, status, total_amount, created_at
FROM orders
WHERE user_id = 42;`,
      explanation: 'Частичные индексы — мощнейший инструмент. Если 95% запросов идут по is_active=true строкам, индекс только на активных записях будет в 20 раз меньше и быстрее. INCLUDE превращает индекс в "мини-таблицу" — PostgreSQL вообще не обращается к основной таблице.'
    },
    {
      type: 'info-box',
      variant: 'tip',
      content: `<p><strong>Правило Left-Most Prefix:</strong> составной индекс <code>(a, b, c)</code> покрывает запросы по <code>a</code>, <code>a,b</code>, <code>a,b,c</code> — но НЕ <code>b</code>, <code>c</code>, <code>b,c</code>. Порядок колонок критичен. Ставьте колонку с наибольшей селективностью (наибольшим числом уникальных значений) первой.</p>`
    },
    {
      type: 'theory',
      content: `<h2>Когда индексы ВРЕДЯТ</h2>
<p>Индекс — не бесплатный обед. У него есть реальная цена:</p>
<ul>
  <li><strong>Замедление INSERT/UPDATE/DELETE</strong> — при каждом изменении данных PostgreSQL обновляет все индексы на таблице</li>
  <li><strong>Место на диске</strong> — индекс занимает от 10% до 100% размера таблицы</li>
  <li><strong>Bloat</strong> — "раздутие" при частых обновлениях требует REINDEX/VACUUM</li>
</ul>
<h3>PostgreSQL игнорирует индекс когда:</h3>
<ul>
  <li>Таблица маленькая (&lt; ~1000 строк) — Seq Scan дешевле</li>
  <li>Низкая селективность: колонка <code>gender</code> с 2 значениями — индекс бесполезен, придёт 50% строк</li>
  <li>Функция на индексированной колонке: <code>WHERE UPPER(name) = 'ALICE'</code> — нужен функциональный индекс</li>
  <li><code>LIKE '%text%'</code> — ведущий % убивает B-tree, нужен GIN + pg_trgm</li>
  <li>Приведение типов: <code>WHERE int_col = '42'</code> (строка vs число) — индекс не используется</li>
</ul>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Антипаттерн</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Решение</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><code>WHERE LOWER(email) = 'x'</code></td>
      <td style="padding:10px;border:1px solid var(--border)"><code>CREATE INDEX ON users (LOWER(email))</code></td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><code>WHERE name LIKE '%alex%'</code></td>
      <td style="padding:10px;border:1px solid var(--border)"><code>CREATE INDEX USING GIN (name gin_trgm_ops)</code></td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><code>WHERE status IN ('a','b','c')</code> (все значения)</td>
      <td style="padding:10px;border:1px solid var(--border)">Убрать индекс, PostgreSQL сам выберет Seq Scan</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><code>WHERE created_at::date = '2024-01-01'</code></td>
      <td style="padding:10px;border:1px solid var(--border)"><code>WHERE created_at >= '2024-01-01' AND created_at &lt; '2024-01-02'</code></td>
    </tr>
  </tbody>
</table>`
    },
    {
      type: 'code-example',
      language: 'sql',
      title: 'Мониторинг индексов — найти неиспользуемые',
      code: `-- Найти индексы которые PostgreSQL никогда не использовал
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan AS times_used,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE '%pkey%'  -- первичные ключи не трогаем
ORDER BY pg_relation_size(indexrelid) DESC;

-- Размер всех индексов таблицы
SELECT
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS size,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'orders'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Посмотреть bloat индексов (требует pgstattuple extension)
-- Если bloat > 30% — стоит запустить REINDEX CONCURRENTLY
SELECT * FROM pgstattuple('idx_users_email');`,
      explanation: 'Неиспользуемые индексы — скрытая проблема. Они замедляют INSERT/UPDATE/DELETE, занимают RAM в shared_buffers, и не дают никакой пользы. Проверяйте pg_stat_user_indexes регулярно. idx_scan = 0 после нескольких дней работы — кандидат на удаление.'
    },
    {
      type: 'editor',
      title: 'Практика: создание оптимального индекса',
      instructions: 'Есть таблица orders с колонками: id, user_id, status, total_amount, created_at. Запрос: SELECT id, total_amount FROM orders WHERE user_id = $1 AND status = \'pending\' ORDER BY created_at DESC LIMIT 10. Напишите CREATE INDEX который максимально ускорит этот запрос (составной + INCLUDE).',
      starterCode: `-- Создайте оптимальный индекс для запроса:
-- SELECT id, total_amount FROM orders
-- WHERE user_id = $1 AND status = 'pending'
-- ORDER BY created_at DESC
-- LIMIT 10

CREATE INDEX idx_orders_optimal
ON orders(???)
INCLUDE (???);`,
      hints: [
        'WHERE содержит user_id и status — они должны быть в индексе',
        'ORDER BY created_at DESC — добавьте created_at с DESC',
        'SELECT id, total_amount — эти поля в INCLUDE убирают обращение к heap',
        'CREATE INDEX idx_orders_optimal ON orders(user_id, status, created_at DESC) INCLUDE (id, total_amount)'
      ]
    },
    {
      type: 'quiz',
      questions: [
        {
          id: 'q1601-1',
          type: 'single',
          question: 'Какой тип индекса следует использовать для поиска по JSONB-полю?',
          options: ['B-tree', 'Hash', 'GIN', 'BRIN'],
          correct: 2,
          explanation: 'GIN (Generalized Inverted Index) — правильный выбор для JSONB, массивов и полнотекстового поиска. B-tree не поддерживает операторы @>, <@, которые используются с JSONB.'
        },
        {
          id: 'q1601-2',
          type: 'single',
          question: 'Ускорит ли индекс (user_id, status) запрос WHERE status = \'active\'?',
          options: [
            'Да, индекс покрывает оба поля',
            'Нет, нарушено правило Left-Most Prefix — status идёт вторым',
            'Да, PostgreSQL умный и разберётся',
            'Зависит от версии PostgreSQL'
          ],
          correct: 1,
          explanation: 'Правило Left-Most Prefix: индекс (user_id, status) ускоряет WHERE user_id = X и WHERE user_id = X AND status = Y, но НЕ WHERE status = Y без user_id. Для поиска только по status нужен отдельный индекс.'
        },
        {
          id: 'q1601-3',
          type: 'single',
          question: 'Что такое частичный (partial) индекс?',
          options: [
            'Индекс который покрывает только часть колонок',
            'Индекс с условием WHERE — индексирует только строки, удовлетворяющие условию',
            'Незавершённый индекс после сбоя',
            'Индекс на первые N символов строки'
          ],
          correct: 1,
          explanation: 'Частичный индекс: CREATE INDEX ... WHERE condition. Индексирует только строки где condition = true. Например, индекс на orders WHERE status = \'pending\' будет в 100x меньше если pending-заказов 1% от всех.'
        },
        {
          id: 'q1601-4',
          type: 'single',
          question: 'Для чего используется INCLUDE в CREATE INDEX?',
          options: [
            'Для добавления условий фильтрации',
            'Для включения дополнительных колонок в индекс без участия в сортировке — позволяет Index-Only Scan',
            'Для объединения нескольких индексов',
            'Для создания уникального ограничения'
          ],
          correct: 1,
          explanation: 'INCLUDE добавляет колонки "на борт" индекса — они хранятся в leaf-узлах B-tree но не участвуют в сортировке. Это позволяет PostgreSQL отдать данные из индекса без обращения к heap (Index-Only Scan), что в 2-5x быстрее.'
        },
        {
          id: 'q1601-5',
          type: 'single',
          question: 'Почему WHERE LOWER(email) = \'alice@mail.com\' не использует обычный индекс на email?',
          options: [
            'PostgreSQL не поддерживает функции в WHERE',
            'Функция LOWER() вычисляется для каждой строки — значение в индексе (оригинальный email) не совпадает с результатом функции',
            'Строковые индексы работают только с UPPER()',
            'Нужно использовать ILIKE вместо LOWER()'
          ],
          correct: 1,
          explanation: 'Индекс хранит оригинальные значения. LOWER(email) — это трансформация, результат которой не хранится в индексе. Решение: функциональный индекс CREATE INDEX ON users (LOWER(email)). Тогда PostgreSQL будет использовать его.'
        },
        {
          id: 'q1601-6',
          type: 'single',
          question: 'Какой тип индекса самый маленький для таблицы логов с миллиардами строк, вставляемых последовательно по времени?',
          options: ['B-tree', 'Hash', 'GIN', 'BRIN'],
          correct: 3,
          explanation: 'BRIN (Block Range Index) хранит min/max значения для каждого диапазона физических блоков. Для данных с высокой корреляцией (временные ряды, последовательные ID) BRIN в 100-1000x меньше B-tree и создаётся мгновенно даже на таблице с миллиардами строк.'
        },
        {
          id: 'q1601-7',
          type: 'single',
          question: 'Что происходит когда PostgreSQL решает что индекс не выгоден?',
          options: [
            'Выдаёт ошибку',
            'Использует другой индекс',
            'Переключается на Sequential Scan (Seq Scan) — читает всю таблицу',
            'Запрашивает у пользователя подтверждение'
          ],
          correct: 2,
          explanation: 'PostgreSQL — умный оптимизатор. Он сравнивает cost индексного и последовательного сканирования и выбирает дешевле. Для маленьких таблиц или запросов которые вернут >10-20% строк, Seq Scan часто дешевле из-за накладных расходов на обход индекса.'
        }
      ]
    }
  ]
};
