export default {
    id: '10-01',
    title: 'Основы SQL',
    description: 'SELECT/INSERT/UPDATE/DELETE, WHERE, JOIN, GROUP BY, агрегатные функции — с нуля до уверенного использования',
    estimatedTime: 35,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>SQL — это язык разговора с базой данных</h2>
                <p>Представьте огромный склад с тысячами ящиков, каждый с ярлыком. Вы хотите найти все ящики с красными товарами стоимостью выше 500 рублей, упаковать их и отправить. Вы не идёте сами перебирать ящики — вы говорите кладовщику: <em>"Выдай мне все красные товары дороже 500, отсортированные по цене"</em>.</p>
                <p><strong>SQL</strong> — это именно такой язык-инструкция. Вы описываете <em>что</em> хотите получить, а база данных сама решает <em>как</em> это найти эффективно.</p>
                <p>Любой Backend-разработчик работает с SQL каждый день. Без него нет хранения пользователей, заказов, сообщений, логов — ничего. SQL существует с 1974 года и никуда не уходит.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Операция</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">SQL команда</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Аналогия</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>Create</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>INSERT INTO</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Добавить строку в Excel</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>Read</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>SELECT</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Найти строки по фильтру</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>Update</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>UPDATE SET</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Отредактировать ячейку</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>Delete</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>DELETE FROM</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Удалить строку</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'sql',
            title: 'SELECT — выборка данных',
            code: `-- Базовая выборка всех столбцов
SELECT * FROM users;

-- Выборка конкретных столбцов с фильтрацией
SELECT id, name, email
FROM users
WHERE age > 18
  AND is_active = TRUE
ORDER BY created_at DESC
LIMIT 10 OFFSET 20;

-- Псевдонимы и вычисляемые поля
SELECT
    id,
    first_name || ' ' || last_name AS full_name,
    EXTRACT(YEAR FROM AGE(birth_date)) AS age,
    email
FROM users
WHERE email LIKE '%@gmail.com';`,
            explanation: 'ORDER BY DESC — сортировка от новых к старым. LIMIT + OFFSET — пагинация (страница 3 по 10 записей: LIMIT 10 OFFSET 20). LIKE с % — поиск по паттерну. || — конкатенация строк в PostgreSQL.'
        },
        {
            type: 'code-example',
            language: 'sql',
            title: 'INSERT, UPDATE, DELETE — мутации данных',
            code: `-- INSERT: добавить запись и сразу получить id
INSERT INTO users (name, email, age, created_at)
VALUES ('Alice', 'alice@example.com', 25, NOW())
RETURNING id, created_at;

-- INSERT нескольких строк за раз
INSERT INTO tags (name, color)
VALUES ('backend', '#3498db'),
       ('frontend', '#e74c3c'),
       ('devops', '#2ecc71');

-- UPDATE: всегда с WHERE!
UPDATE users
SET
    email = 'new@example.com',
    updated_at = NOW()
WHERE id = 42
RETURNING id, email; -- Получить что обновилось

-- DELETE: всегда с WHERE!
DELETE FROM sessions
WHERE expires_at < NOW()
RETURNING id; -- Получить что удалилось`,
            explanation: 'RETURNING — фича PostgreSQL. Позволяет получить данные только что изменённых строк без отдельного SELECT. Незаменимо для получения auto-generated id, timestamps.'
        },
        {
            type: 'info-box',
            variant: 'danger',
            content: `<p><strong>Главное правило:</strong> UPDATE и DELETE без WHERE применяются ко ВСЕМ строкам таблицы.</p>
            <p><code>DELETE FROM users;</code> — удалит всех пользователей навсегда.<br>
            <code>UPDATE orders SET status = 'cancelled';</code> — отменит все заказы в системе.</p>
            <p>Правило продакшена: перед выполнением деструктивного запроса сначала сделайте <code>SELECT</code> с тем же <code>WHERE</code> — убедитесь, что попадаете по нужным строкам.</p>`
        },
        {
            type: 'theory',
            content: `
                <h2>JOIN — объединение таблиц</h2>
                <p>В реальных приложениях данные разнесены по таблицам. Пользователи отдельно, заказы отдельно, товары отдельно. JOIN позволяет собрать всё вместе в одном запросе.</p>
                <p>Представьте две таблицы: <code>orders</code> (id, user_id, total) и <code>users</code> (id, name, email). Чтобы получить "имя пользователя и его заказы" нужен JOIN.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Тип JOIN</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Результат</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Когда использовать</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>INNER JOIN</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Только совпадающие строки с обеих сторон</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Заказы только тех, у кого есть аккаунт</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>LEFT JOIN</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Все строки левой таблицы + совпадения</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Все пользователи, даже без заказов</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>RIGHT JOIN</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Все строки правой таблицы + совпадения</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Редко используется, лучше LEFT</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>FULL OUTER JOIN</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Все строки обеих таблиц</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Сверка данных, отчёты</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'sql',
            title: 'JOIN на реальном примере',
            code: `-- Получить все заказы с именем пользователя и названием товара
SELECT
    o.id AS order_id,
    u.name AS user_name,
    p.name AS product_name,
    o.quantity,
    o.total_price,
    o.created_at
FROM orders o
INNER JOIN users u ON u.id = o.user_id
INNER JOIN products p ON p.id = o.product_id
WHERE o.status = 'pending'
ORDER BY o.created_at DESC;

-- Все пользователи и их количество заказов (включая тех, кто ничего не заказал)
SELECT
    u.id,
    u.name,
    COUNT(o.id) AS orders_count,
    COALESCE(SUM(o.total_price), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name
ORDER BY total_spent DESC;`,
            explanation: 'Псевдонимы таблиц (o, u, p) сокращают запись. COALESCE заменяет NULL на 0 — для пользователей без заказов SUM вернёт NULL. GROUP BY обязателен при использовании агрегатных функций вместе с обычными столбцами.'
        },
        {
            type: 'theory',
            content: `
                <h2>GROUP BY и агрегатные функции</h2>
                <p>Агрегатные функции обрабатывают группы строк и возвращают одно значение на группу. Это основа любой аналитики и статистики.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Функция</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Что делает</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Пример результата</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>COUNT(*)</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Количество строк</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">1500 пользователей</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>SUM(col)</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Сумма значений</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Итого 250000₽</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>AVG(col)</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Среднее значение</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Средний чек 1666₽</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>MIN / MAX</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Минимум / максимум</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Самый дешёвый / дорогой</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>HAVING</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Фильтр после GROUP BY</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Только группы с COUNT > 5</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'sql',
            title: 'GROUP BY + HAVING — статистика продаж',
            code: `-- Топ категорий по выручке за последний месяц
SELECT
    c.name AS category,
    COUNT(o.id) AS orders_count,
    SUM(o.total_price) AS revenue,
    AVG(o.total_price) AS avg_order,
    MAX(o.total_price) AS max_order
FROM orders o
JOIN products p ON p.id = o.product_id
JOIN categories c ON c.id = p.category_id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
  AND o.status = 'completed'
GROUP BY c.id, c.name
HAVING COUNT(o.id) >= 10      -- Только категории с 10+ заказами
ORDER BY revenue DESC
LIMIT 5;`,
            explanation: 'WHERE фильтрует строки ДО группировки. HAVING фильтрует группы ПОСЛЕ GROUP BY. Нельзя использовать агрегаты в WHERE — только в HAVING. INTERVAL — удобный способ работы с датами в PostgreSQL.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Порядок выполнения SQL запроса</strong> (не путайте с порядком написания):</p>
            <ol>
                <li><code>FROM</code> / <code>JOIN</code> — загрузить таблицы</li>
                <li><code>WHERE</code> — отфильтровать строки</li>
                <li><code>GROUP BY</code> — сгруппировать</li>
                <li><code>HAVING</code> — отфильтровать группы</li>
                <li><code>SELECT</code> — выбрать столбцы</li>
                <li><code>ORDER BY</code> — отсортировать</li>
                <li><code>LIMIT</code> / <code>OFFSET</code> — обрезать</li>
            </ol>`
        },
        {
            type: 'editor',
            title: 'Практика: Статистика пользователей',
            instructions: 'Напишите запрос, который вернёт: id и name каждого пользователя, количество его заказов (orders_count) и сумму всех заказов (total_spent). Включите пользователей без заказов (0 заказов). Отсортируйте по total_spent по убыванию.',
            starterCode: `-- Таблицы:
-- users: id, name, email, created_at
-- orders: id, user_id, total_price, status, created_at

-- Напишите запрос здесь:
SELECT
    u.id,
    u.name,
    -- COUNT заказов
    -- SUM суммы заказов (учтите NULL для пользователей без заказов)
FROM users u
-- JOIN с orders
-- GROUP BY
-- ORDER BY total_spent DESC`,
            hints: [
                'Используйте LEFT JOIN чтобы включить пользователей без заказов',
                'COUNT(o.id) посчитает только реальные заказы (NULL не считается)',
                'COALESCE(SUM(o.total_price), 0) заменит NULL на 0',
                'GROUP BY u.id, u.name — нужно группировать по всем не-агрегатным полям'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что вернёт запрос DELETE FROM users без WHERE?',
                    options: [
                        'Ошибку синтаксиса',
                        'Удалит первую строку',
                        'Удалит все строки таблицы',
                        'Удалит таблицу вместе со структурой'
                    ],
                    correct: 2,
                    explanation: 'DELETE без WHERE удаляет все строки, но сохраняет структуру таблицы. DROP TABLE удаляет таблицу целиком.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Какой JOIN вернёт ВСЕХ пользователей, даже тех у кого нет заказов?',
                    options: [
                        'INNER JOIN orders ON orders.user_id = users.id',
                        'LEFT JOIN orders ON orders.user_id = users.id',
                        'RIGHT JOIN orders ON orders.user_id = users.id',
                        'CROSS JOIN orders'
                    ],
                    correct: 1,
                    explanation: 'LEFT JOIN возвращает все строки из левой таблицы (users). Если совпадения нет — поля из правой таблицы будут NULL.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'В чём разница между WHERE и HAVING?',
                    options: [
                        'Нет разницы, взаимозаменяемы',
                        'WHERE фильтрует строки до GROUP BY, HAVING — группы после',
                        'HAVING быстрее WHERE',
                        'WHERE только для числовых полей'
                    ],
                    correct: 1,
                    explanation: 'WHERE выполняется до группировки и не может использовать агрегатные функции. HAVING выполняется после GROUP BY и работает с результатами агрегатов.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Что делает RETURNING в PostgreSQL?',
                    options: [
                        'Откатывает транзакцию',
                        'Возвращает данные изменённых строк без дополнительного SELECT',
                        'Возвращает количество затронутых строк',
                        'Это синтаксис MySQL, в PostgreSQL не работает'
                    ],
                    correct: 1,
                    explanation: 'RETURNING — расширение PostgreSQL. INSERT ... RETURNING id позволяет сразу получить сгенерированный id новой записи.'
                },
                {
                    id: 'q5',
                    type: 'multiple',
                    question: 'Какие из этих операторов являются агрегатными функциями?',
                    options: [
                        'COUNT(*)',
                        'WHERE',
                        'SUM(price)',
                        'ORDER BY',
                        'AVG(age)',
                        'LIMIT'
                    ],
                    correct: [0, 2, 4],
                    explanation: 'Агрегатные функции: COUNT, SUM, AVG, MIN, MAX, STRING_AGG и др. Они обрабатывают группы строк и возвращают одно значение.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Какой порядок выполнения правильный?',
                    options: [
                        'SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY',
                        'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY',
                        'FROM → SELECT → WHERE → ORDER BY → GROUP BY',
                        'WHERE → FROM → SELECT → GROUP BY'
                    ],
                    correct: 1,
                    explanation: 'Логический порядок выполнения: FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. SELECT выполняется почти в конце, поэтому псевдонимы из SELECT нельзя использовать в WHERE.'
                },
                {
                    id: 'q7',
                    type: 'code-fill',
                    question: 'Заполните пропуск: получить количество пользователей по городам, только те города где больше 100 пользователей.',
                    code: 'SELECT city, COUNT(*) AS cnt FROM users GROUP BY city ___ cnt > 100;',
                    answer: 'HAVING',
                    explanation: 'HAVING используется для фильтрации результатов GROUP BY. Нельзя написать WHERE cnt > 100, так как cnt — агрегат.'
                }
            ]
        }
    ]
};
