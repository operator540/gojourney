export default {
    id: '10-04',
    title: 'Продвинутые SQL запросы',
    description: 'CTE, WITH RECURSIVE, оконные функции ROW_NUMBER/RANK/LAG, подзапросы, RETURNING — инструменты аналитики',
    estimatedTime: 35,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>CTE — это черновик перед чистовиком</h2>
                <p>Представьте, что вы пишете сложный отчёт: сначала собираете данные из нескольких источников, потом фильтруете, потом считаете итоги. Обычно это несколько вложенных подзапросов — код становится нечитаемым "лапшой".</p>
                <p><strong>CTE (Common Table Expression)</strong> — это как черновик. Вы даёте каждому промежуточному шагу имя, а потом ссылаетесь на него. PostgreSQL видит финальный запрос, но вы читаете пошаговую логику.</p>
                <p><strong>Оконные функции</strong> — ещё мощнее. Они позволяют делать вычисления над <em>группой строк</em> без GROUP BY. Каждая строка остаётся в результате, но получает дополнительный столбец с агрегатом по "окну" соседних строк.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Инструмент</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Суть</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Когда нужен</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>CTE (WITH)</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Именованный промежуточный запрос</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Читаемость, повторное использование</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>WITH RECURSIVE</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">CTE ссылается сама на себя</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Деревья, иерархии, графы</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>ROW_NUMBER()</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Уникальный номер строки в группе</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Пагинация, дедупликация</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>RANK() / DENSE_RANK()</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Ранг с/без пропусков при одинаковых значениях</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Лидерборды, топы</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>LAG() / LEAD()</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Значение из предыдущей/следующей строки</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Сравнение с предыдущим периодом</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>SUM() OVER()</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Нарастающий итог (running total)</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Финансовые отчёты, графики</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'sql',
            title: 'CTE — читаемые многоступенчатые запросы',
            code: `-- Топ-5 самых прибыльных категорий за квартал,
-- с процентом от общей выручки

WITH
-- Шаг 1: выручка по каждой категории
category_revenue AS (
    SELECT
        c.id,
        c.name AS category_name,
        SUM(oi.quantity * oi.unit_price) AS revenue
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN categories c ON c.id = p.category_id
    JOIN orders o ON o.id = oi.order_id
    WHERE o.created_at >= DATE_TRUNC('quarter', NOW())
      AND o.status = 'completed'
    GROUP BY c.id, c.name
),
-- Шаг 2: общая выручка (одно число)
total_revenue AS (
    SELECT SUM(revenue) AS total FROM category_revenue
)
-- Финальный: собираем вместе
SELECT
    cr.category_name,
    cr.revenue,
    ROUND(cr.revenue / tr.total * 100, 2) AS pct_of_total,
    RANK() OVER (ORDER BY cr.revenue DESC) AS rank
FROM category_revenue cr
CROSS JOIN total_revenue tr
ORDER BY cr.revenue DESC
LIMIT 5;`,
            explanation: 'CROSS JOIN total_revenue — объединяем каждую строку с единственной строкой total (содержащей общую выручку). DATE_TRUNC("quarter", NOW()) — начало текущего квартала. Каждый CTE читается как отдельный шаг алгоритма — никакой лапши из вложенных подзапросов.'
        },
        {
            type: 'code-example',
            language: 'sql',
            title: 'WITH RECURSIVE — обход дерева категорий',
            code: `-- Таблица categories: id, name, parent_id (NULL для корневых)
-- Получить всё дерево категорий начиная с id=5

WITH RECURSIVE category_tree AS (
    -- Базовый случай: стартовая категория
    SELECT
        id,
        name,
        parent_id,
        0 AS depth,
        ARRAY[id] AS path
    FROM categories
    WHERE id = 5

    UNION ALL

    -- Рекурсивный случай: дети
    SELECT
        c.id,
        c.name,
        c.parent_id,
        ct.depth + 1,
        ct.path || c.id
    FROM categories c
    JOIN category_tree ct ON ct.id = c.parent_id
    WHERE ct.depth < 10  -- Защита от бесконечной рекурсии
)
SELECT
    REPEAT('  ', depth) || name AS indented_name, -- Отступы по уровню
    depth,
    path
FROM category_tree
ORDER BY path;

-- Результат:
-- Electronics           depth=0  path={5}
--   Phones              depth=1  path={5,10}
--     Smartphones       depth=2  path={5,10,20}
--     Feature Phones    depth=2  path={5,10,21}
--   Laptops             depth=1  path={5,11}`,
            explanation: 'UNION ALL — не UNION, чтобы не тратить время на дедупликацию. ARRAY[id] || c.id — строим путь от корня. path нужен для правильной сортировки дерева. Без WHERE depth < 10 рекурсия никогда не остановится если в данных есть цикл (A → B → A).'
        },
        {
            type: 'code-example',
            language: 'sql',
            title: 'Оконные функции — аналитика без GROUP BY',
            code: `-- Продажи по менеджерам с ранжированием и сравнением с прошлым месяцем

WITH monthly_sales AS (
    SELECT
        manager_id,
        m.name AS manager_name,
        DATE_TRUNC('month', o.created_at) AS month,
        SUM(o.total_amount) AS sales_amount
    FROM orders o
    JOIN managers m ON m.id = o.manager_id
    WHERE o.status = 'completed'
    GROUP BY manager_id, m.name, DATE_TRUNC('month', o.created_at)
)
SELECT
    manager_name,
    month,
    sales_amount,

    -- Ранг внутри месяца (1 = лучший продавец месяца)
    RANK() OVER (
        PARTITION BY month
        ORDER BY sales_amount DESC
    ) AS rank_in_month,

    -- Нарастающий итог по менеджеру
    SUM(sales_amount) OVER (
        PARTITION BY manager_id
        ORDER BY month
        ROWS UNBOUNDED PRECEDING
    ) AS cumulative_sales,

    -- Продажи в предыдущем месяце (для сравнения роста)
    LAG(sales_amount, 1, 0) OVER (
        PARTITION BY manager_id
        ORDER BY month
    ) AS prev_month_sales,

    -- Рост в процентах
    ROUND(
        (sales_amount - LAG(sales_amount, 1) OVER (PARTITION BY manager_id ORDER BY month))
        / NULLIF(LAG(sales_amount, 1) OVER (PARTITION BY manager_id ORDER BY month), 0) * 100,
        1
    ) AS growth_pct

FROM monthly_sales
ORDER BY month DESC, rank_in_month;`,
            explanation: 'PARTITION BY — "разбить на группы". RANK() с одним PARTITION считает ранг внутри каждого месяца независимо. LAG(col, 1, 0) — значение из предыдущей строки, 0 если предыдущей нет. NULLIF(x, 0) — защита от деления на ноль. ROWS UNBOUNDED PRECEDING — нарастающий итог от начала до текущей строки.'
        },
        {
            type: 'code-example',
            language: 'sql',
            title: 'Подзапросы и RETURNING в Go-контексте',
            code: `-- Подзапрос в WHERE (EXISTS)
-- Найти пользователей, у которых есть хотя бы один заказ > 10000 руб за год
SELECT id, name, email
FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.user_id = u.id
      AND o.total_amount > 10000
      AND o.created_at >= NOW() - INTERVAL '1 year'
);

-- Подзапрос в FROM (деривированная таблица)
-- Топ пользователь каждого города
SELECT *
FROM (
    SELECT
        u.city,
        u.name,
        COUNT(o.id) AS orders_count,
        ROW_NUMBER() OVER (PARTITION BY u.city ORDER BY COUNT(o.id) DESC) AS rn
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    GROUP BY u.city, u.name
) ranked
WHERE rn = 1;  -- Только первый в каждом городе

-- RETURNING для аудит-лога
WITH deleted_users AS (
    DELETE FROM users
    WHERE last_login < NOW() - INTERVAL '2 years'
      AND subscription_status = 'inactive'
    RETURNING id, email, created_at, last_login
)
INSERT INTO archived_users (user_id, email, created_at, last_login, archived_at)
SELECT id, email, created_at, last_login, NOW()
FROM deleted_users;`,
            explanation: 'EXISTS быстрее чем IN для больших подзапросов — останавливается при первом совпадении. ROW_NUMBER() в подзапросе + WHERE rn = 1 — классический паттерн "топ N на группу". Последний пример: удалить старых пользователей и одновременно сохранить их в архив — всё в одном запросе!'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Использование сложных запросов в Go:</strong></p>
            <p>Длинные SQL запросы удобно хранить в отдельных .sql файлах и загружать через embed:</p>
            <pre style="margin:8px 0;"><code>//go:embed queries/top_managers.sql
var topManagersSQL string

// Затем:
rows, err := db.QueryContext(ctx, topManagersSQL, month, limit)</code></pre>
            <p>Это даёт подсветку синтаксиса в IDE, удобное редактирование SQL и возможность использовать одни запросы в нескольких местах.</p>`
        },
        {
            type: 'editor',
            title: 'Практика: Топ-3 продукта каждой категории',
            instructions: 'Напишите запрос, который вернёт топ-3 продукта по продажам (SUM кол-во) в каждой категории. Используйте CTE + ROW_NUMBER(). Таблицы: products(id, name, category_id), order_items(product_id, quantity).',
            starterCode: `-- Используйте CTE для подсчёта продаж по продуктам
WITH product_sales AS (
    SELECT
        p.id,
        p.name,
        p.category_id,
        -- SUM количества из order_items
    FROM products p
    -- JOIN с order_items
    GROUP BY p.id, p.name, p.category_id
),
ranked AS (
    SELECT
        *,
        -- ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)
    FROM product_sales
)
-- Выберите только топ-3 в каждой категории
SELECT id, name, category_id, total_sold, rn
FROM ranked
WHERE -- условие на rn
ORDER BY category_id, rn;`,
            hints: [
                'SUM(oi.quantity) AS total_sold — в product_sales CTE',
                'JOIN order_items oi ON oi.product_id = p.id',
                'ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY total_sold DESC) AS rn',
                'WHERE rn <= 3 — в финальном SELECT'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Чем RANK() отличается от DENSE_RANK()?',
                    options: [
                        'RANK быстрее',
                        'RANK пропускает номера при одинаковых значениях, DENSE_RANK — нет',
                        'DENSE_RANK только для числовых столбцов',
                        'Нет разницы'
                    ],
                    correct: 1,
                    explanation: 'При двух одинаковых результатах: RANK даст 1,1,3 (пропустит 2). DENSE_RANK даст 1,1,2 (без пропусков). ROW_NUMBER всегда даёт уникальные числа: 1,2,3.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Для чего нужен PARTITION BY в оконных функциях?',
                    options: [
                        'Разбить таблицу на части для параллельного выполнения',
                        'Задать "окно" — группу строк, внутри которой применяется функция',
                        'Аналог GROUP BY, убирает строки',
                        'Индексирование по столбцу'
                    ],
                    correct: 1,
                    explanation: 'PARTITION BY разбивает строки на группы (но не убирает строки как GROUP BY). ROW_NUMBER() OVER (PARTITION BY city) нумерует строки независимо внутри каждого города.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Что делает LAG(col, 1, 0) OVER (...)?',
                    options: [
                        'Пропускает 1 строку и берёт следующую',
                        'Значение col из предыдущей строки, 0 если предыдущей нет',
                        'Среднее по последним N строкам',
                        'Задержка выполнения на 1 секунду'
                    ],
                    correct: 1,
                    explanation: 'LAG(col, offset, default) — берёт значение col из строки offset позиций назад. LEAD — вперёд. Незаменимо для сравнения с предыдущим периодом.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'В чём преимущество EXISTS над IN для подзапросов?',
                    options: [
                        'EXISTS поддерживает несколько столбцов',
                        'EXISTS останавливается при первом совпадении, IN проверяет все значения',
                        'IN работает только с числами',
                        'Нет разницы, оптимизатор сам решает'
                    ],
                    correct: 1,
                    explanation: 'EXISTS — полустрогая проверка "существует хоть одна строка". Как только нашли — стоп. IN для больших подзапросов загружает весь список значений в память.'
                },
                {
                    id: 'q5',
                    type: 'multiple',
                    question: 'Какие из следующих — оконные функции PostgreSQL?',
                    options: [
                        'ROW_NUMBER()',
                        'COUNT(*)',
                        'RANK()',
                        'MAX()',
                        'LAG()',
                        'COALESCE()'
                    ],
                    correct: [0, 2, 4],
                    explanation: 'Оконные функции используют синтаксис OVER(). COUNT и MAX могут быть как агрегатными, так и оконными (COUNT(*) OVER() — количество всех строк рядом с каждой строкой).'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Что такое WITH RECURSIVE?',
                    options: [
                        'Оптимизация повторяющихся CTE',
                        'CTE которая ссылается сама на себя для обхода иерархий',
                        'Синтаксический сахар для вложенных подзапросов',
                        'Это только в Oracle, не в PostgreSQL'
                    ],
                    correct: 1,
                    explanation: 'WITH RECURSIVE позволяет CTE вызывать себя — это SQL-версия рекурсивных алгоритмов. Незаменима для деревьев (категории, комментарии, оргструктура), связных списков и графов.'
                },
                {
                    id: 'q7',
                    type: 'code-fill',
                    question: 'Заполните: получить значение столбца amount из СЛЕДУЮЩЕЙ строки (по дате).',
                    code: 'SELECT amount, ___(amount) OVER (ORDER BY date) AS next_amount FROM sales;',
                    answer: 'LEAD',
                    explanation: 'LEAD смотрит вперёд (следующая строка). LAG — назад (предыдущая). Синтаксис одинаковый: LEAD(col, offset, default).'
                }
            ]
        }
    ]
};
