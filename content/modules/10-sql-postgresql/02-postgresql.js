export default {
    id: '10-02',
    title: 'PostgreSQL: от установки до EXPLAIN',
    description: 'Docker-установка, типы данных, индексы, EXPLAIN ANALYZE, команды psql — всё что нужно для реальной работы',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Почему именно PostgreSQL?</h2>
                <p>Представьте, что вы выбираете автомобиль. MySQL — это надёжная Toyota Corolla: везде работает, все знают. PostgreSQL — это BMW с полным приводом: больше возможностей, строже следит за стандартами, не позволяет ехать неправильно.</p>
                <p>PostgreSQL используют: Instagram, Reddit, GitLab, Notion, Supabase, большинство финтех-компаний. Причина — надёжность и богатство возможностей при полностью открытом исходном коде.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Фича</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Описание</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Зачем нужно</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>JSONB</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Бинарный JSON с индексацией</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Гибкие схемы данных без NoSQL</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>CTE / Window Functions</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Сложные аналитические запросы</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Отчёты, ранжирование</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>Full-Text Search</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Встроенный поиск по тексту</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Поиск без Elasticsearch</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>Строгие типы</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">UUID, INET, ARRAY, ENUM</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Целостность данных на уровне БД</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>MVCC</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Читатели не блокируют писателей</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Высокая конкурентность</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'yaml',
            title: 'Запуск PostgreSQL через Docker Compose',
            code: `# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: myapp_postgres
    environment:
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: secretpassword
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      # Автоматическое выполнение SQL при первом запуске:
      - ./migrations/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d myapp"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:`,
            explanation: 'Alpine образ намного легче. healthcheck позволяет другим сервисам ждать когда Postgres будет готов (depends_on: condition: service_healthy). Volumes сохраняют данные между перезапусками контейнера.'
        },
        {
            type: 'theory',
            content: `
                <h2>Типы данных PostgreSQL</h2>
                <p>PostgreSQL строго типизирован. Правильный выбор типа — это производительность и целостность данных. Например, хранить IP-адрес как TEXT вместо INET — это как хранить дату как строку.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Тип</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Описание</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Пример значения</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>SERIAL / BIGSERIAL</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Автоинкремент (4/8 байт)</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">1, 2, 3...</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>UUID</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">128-битный уникальный ID</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>VARCHAR(n) / TEXT</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Строки с ограничением / без</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">"Hello World"</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>NUMERIC(p,s)</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Точные числа (деньги!)</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">1234.56</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>TIMESTAMPTZ</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Временная метка с timezone</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">2024-01-15 10:30:00+03</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>JSONB</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Бинарный JSON с индексами</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">{"key": "value"}</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>integer[]</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Массив любого типа</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">{1, 2, 3}</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>INET</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">IP адрес (IPv4/IPv6)</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">192.168.0.1/24</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'sql',
            title: 'Создание таблицы с правильными типами',
            code: `-- Расширение для генерации UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    -- UUID лучше SERIAL для распределённых систем
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username    VARCHAR(50) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    -- NUMERIC(10,2) для денег — никогда FLOAT!
    balance     NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    -- TIMESTAMPTZ хранит в UTC, отображает в timezone сессии
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login  TIMESTAMPTZ,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    -- JSONB для гибких метаданных
    metadata    JSONB DEFAULT '{}',
    -- Массив тегов
    roles       TEXT[] DEFAULT ARRAY['user'],
    -- CONSTRAINT для валидации на уровне БД
    CONSTRAINT users_balance_check CHECK (balance >= 0),
    CONSTRAINT users_email_format CHECK (email ~* '^[^@]+@[^@]+\\.[^@]+$')
);

-- Индексы
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_metadata ON users USING GIN(metadata);`,
            explanation: 'NUMERIC(10,2) хранит ровно 2 знака после запятой. FLOAT даёт погрешность (0.1 + 0.2 ≠ 0.3). Для денег всегда NUMERIC. TIMESTAMPTZ vs TIMESTAMP: всегда используйте TIMESTAMPTZ — он хранит время в UTC и правильно конвертирует при смене timezone. GIN-индекс нужен для поиска внутри JSONB и массивов.'
        },
        {
            type: 'theory',
            content: `
                <h2>Индексы: когда запросы тормозят</h2>
                <p>Индекс — это как оглавление книги. Без него PostgreSQL читает все строки таблицы ("sequential scan"). С индексом — прыгает сразу к нужным строкам ("index scan").</p>
                <p>Таблица с 10 миллионами строк без индекса: запрос <code>WHERE email = 'user@example.com'</code> займёт секунды. С индексом — миллисекунды.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Тип индекса</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Для чего</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>B-tree</code> (по умолчанию)</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Равенство, диапазоны, сортировка</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>GIN</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">JSONB, массивы, полнотекстовый поиск</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>GiST</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Геоданные (PostGIS), диапазоны</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>Partial index</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Индекс по части строк (WHERE)</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'sql',
            title: 'EXPLAIN ANALYZE — рентген запроса',
            code: `-- Посмотреть план выполнения запроса
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) as orders_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name;

-- Пример вывода:
-- HashAggregate  (cost=1250.50..1350.50 rows=1000 width=100)
--                (actual time=45.234..48.567 rows=850 loops=1)
--   ->  Hash Left Join  (cost=450.00..1150.50 rows=5000 width=60)
--                       (actual time=12.345..35.678 rows=5000 loops=1)
--       ->  Seq Scan on users  (cost=0..200 rows=5000 width=50)
--                              (actual time=0.1..8.5 rows=850 loops=1)
--             Filter: (created_at > '2024-01-01')

-- После добавления индекса:
CREATE INDEX idx_users_created_at ON users(created_at);

-- Seq Scan заменится на Index Scan — запрос ускорится в 10-100x`,
            explanation: 'cost=X..Y — оценка стоимости (X — до первой строки, Y — до последней). actual time — реальное время. Seq Scan на большой таблице — сигнал для добавления индекса. Rows — сколько строк обработано. Чем больше расхождение между rows estimate и actual rows — тем хуже статистика.'
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Основные команды psql',
            code: `# Подключение к PostgreSQL
psql -h localhost -U appuser -d myapp

# Внутри psql:
\\l                    # Список баз данных
\\c myapp              # Переключиться на БД myapp
\\dt                   # Список таблиц
\\d users              # Структура таблицы users
\\di                   # Список индексов
\\du                   # Список пользователей/ролей
\\timing on            # Включить таймер запросов
\\x                    # Расширенный вывод (vertical)
\\e                    # Открыть редактор для SQL
\\q                    # Выйти

# Запуск SQL файла
\\i /path/to/migration.sql

# Из терминала (не внутри psql):
psql -h localhost -U appuser -d myapp -c "SELECT version();"
psql -h localhost -U appuser -d myapp -f migration.sql`,
            explanation: '\\d tablename — самая полезная команда. Показывает все колонки, типы, constraints и индексы таблицы. \\timing показывает реальное время выполнения каждого запроса.'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<p><strong>FLOAT vs NUMERIC для денег:</strong></p>
            <p>Никогда не используйте <code>FLOAT</code> или <code>DOUBLE</code> для финансовых данных. Числа с плавающей точкой имеют погрешность представления:</p>
            <p><code>SELECT 0.1 + 0.2 = 0.3;</code> — вернёт <code>false</code> для FLOAT!</p>
            <p>Используйте <code>NUMERIC(19, 4)</code> или храните суммы в копейках (целое число).</p>`
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Какой тип данных использовать для хранения денежных сумм?',
                    options: [
                        'FLOAT',
                        'DOUBLE PRECISION',
                        'NUMERIC(10, 2)',
                        'REAL'
                    ],
                    correct: 2,
                    explanation: 'NUMERIC/DECIMAL хранит числа точно, без погрешностей плавающей точки. FLOAT(0.1 + 0.2) даст 0.30000000000000004.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что делает EXPLAIN ANALYZE?',
                    options: [
                        'Исправляет медленные запросы автоматически',
                        'Показывает план выполнения и реальные метрики запроса',
                        'Анализирует синтаксис SQL на ошибки',
                        'Создаёт индексы автоматически'
                    ],
                    correct: 1,
                    explanation: 'EXPLAIN показывает план без выполнения. EXPLAIN ANALYZE реально выполняет запрос и показывает plan vs actual — это главный инструмент оптимизации.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Какой индекс нужен для поиска внутри JSONB поля?',
                    options: [
                        'B-tree индекс',
                        'HASH индекс',
                        'GIN индекс',
                        'BRIN индекс'
                    ],
                    correct: 2,
                    explanation: 'GIN (Generalized Inverted Index) предназначен для составных значений: JSONB, массивы, полнотекстовый поиск. B-tree не умеет искать внутри JSON.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Чем TIMESTAMPTZ отличается от TIMESTAMP?',
                    options: [
                        'TIMESTAMPTZ занимает больше места',
                        'TIMESTAMPTZ хранит в UTC и учитывает часовые пояса',
                        'TIMESTAMP точнее',
                        'Это одно и то же'
                    ],
                    correct: 1,
                    explanation: 'TIMESTAMPTZ хранит время в UTC и конвертирует при отображении. TIMESTAMP хранит "наивное" время без timezone. Для продакшена всегда TIMESTAMPTZ.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Что означает "Seq Scan" в выводе EXPLAIN?',
                    options: [
                        'Запрос использует индекс',
                        'PostgreSQL читает таблицу построчно, индекс не используется',
                        'Запрос выполняется параллельно',
                        'Данные читаются из кэша'
                    ],
                    correct: 1,
                    explanation: 'Sequential Scan = полный перебор таблицы. Для больших таблиц это медленно. Index Scan = использование индекса. Seq Scan на маленьких таблицах — нормально.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Зачем нужен partial index?',
                    options: [
                        'Для индексирования только части столбцов',
                        'Для индексирования только строк, удовлетворяющих условию WHERE',
                        'Для уменьшения точности поиска',
                        'Это устаревший тип индекса'
                    ],
                    correct: 1,
                    explanation: 'Partial index: CREATE INDEX idx ON orders(user_id) WHERE status = \'pending\'. Если 99% заказов выполнено, индекс будет только по 1% строк — маленький и быстрый.'
                }
            ]
        }
    ]
};
