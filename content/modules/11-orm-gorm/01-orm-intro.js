export default {
    id: '11-01',
    title: 'Что такое ORM?',
    description: 'Объектно-реляционное отображение: зачем нужно, плюсы и минусы, когда использовать',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: переводчик между двумя мирами</h2>
                <p>Представьте, что вы — русский разработчик, а база данных — немецкий чиновник. Вы говорите на разных языках: вы думаете объектами и структурами, а чиновник работает только с таблицами и строками.</p>
                <p><strong>ORM (Object-Relational Mapping)</strong> — это переводчик между двумя мирами. Вы работаете с привычными структурами Go, а ORM автоматически переводит это в SQL-запросы и обратно.</p>
                <p>Без ORM вы пишете:</p>
                <pre style="background:var(--surface-2);padding:12px;border-radius:6px;border:1px solid var(--border)"><code>row := db.QueryRow("SELECT id, name, email FROM users WHERE id = $1", 42)
row.Scan(&user.ID, &user.Name, &user.Email)</code></pre>
                <p>С ORM вы пишете:</p>
                <pre style="background:var(--surface-2);padding:12px;border-radius:6px;border:1px solid var(--border)"><code>db.First(&user, 42)</code></pre>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Проблема несоответствия (Impedance Mismatch)</h2>
                <p>Реляционные базы данных и объектно-ориентированное программирование — фундаментально разные парадигмы. Это называют <strong>impedance mismatch</strong> (несоответствие импедансов).</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left">Мир Go (объекты)</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left">Мир БД (реляционный)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px">Структура <code>User</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px">Таблица <code>users</code></td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="border:1px solid var(--border);padding:10px 14px">Экземпляр <code>user{ID: 1}</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px">Строка с <code>id = 1</code></td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px">Поле <code>user.Name</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px">Колонка <code>name</code></td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="border:1px solid var(--border);padding:10px 14px">Слайс <code>[]User</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px">Набор строк (result set)</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px">Вложенная структура <code>user.Address</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px">JOIN двух таблиц</td>
                        </tr>
                    </tbody>
                </table>
                <p>ORM автоматизирует это преобразование, чтобы вы думали в терминах своего языка программирования.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Паттерн Active Record</h2>
                <p>Большинство Go ORM (включая GORM) реализуют паттерн <strong>Active Record</strong>. Суть: каждая структура знает, как сохранить себя в БД.</p>
                <p>Структура — это не просто контейнер данных, она несёт в себе логику взаимодействия с базой:</p>
                <ul>
                    <li>Структура <code>User</code> знает, что она хранится в таблице <code>users</code></li>
                    <li>Через неё можно делать <code>db.Create(&user)</code>, <code>db.Save(&user)</code></li>
                    <li>Имена полей автоматически конвертируются в snake_case: <code>FirstName</code> → <code>first_name</code></li>
                </ul>
                <p>Альтернатива — паттерн <strong>Data Mapper</strong> (используется в sqlboiler, ent), где маппинг вынесен в отдельный слой. Он сложнее, но даёт больший контроль.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Плюсы и минусы ORM</h2>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;color:var(--accent)">Плюсы</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;color:#e05252">Минусы</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px"><strong>Скорость разработки:</strong> CRUD за 1 строку вместо 10</td>
                            <td style="border:1px solid var(--border);padding:10px 14px"><strong>Производительность:</strong> Оверхед на рефлексию, генерацию SQL</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="border:1px solid var(--border);padding:10px 14px"><strong>Безопасность:</strong> Автоматическая защита от SQL-инъекций через параметры</td>
                            <td style="border:1px solid var(--border);padding:10px 14px"><strong>Магия:</strong> Скрытая сложность, сюрпризы при N+1, ленивой загрузке</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px"><strong>Рефакторинг:</strong> Переименовал структуру — изменения отражаются везде</td>
                            <td style="border:1px solid var(--border);padding:10px 14px"><strong>Сложные запросы:</strong> Window functions, CTE, сложные JOIN плохо выражаются через ORM</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="border:1px solid var(--border);padding:10px 14px"><strong>AutoMigrate:</strong> Схема БД автоматически следует за кодом</td>
                            <td style="border:1px solid var(--border);padding:10px 14px"><strong>Кривая обучения:</strong> Нужно знать ORM-специфику поверх SQL</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px"><strong>Переносимость:</strong> Смена PostgreSQL на MySQL — минимум правок</td>
                            <td style="border:1px solid var(--border);padding:10px 14px"><strong>Абстракция течёт:</strong> Всё равно нужно понимать SQL для оптимизации</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Когда использовать ORM, а когда — raw SQL?</h2>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left">Ситуация</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left">Рекомендация</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px">Стандартный CRUD для сущностей (User, Product, Order)</td>
                            <td style="border:1px solid var(--border);padding:10px 14px">ORM — быстро и безопасно</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="border:1px solid var(--border);padding:10px 14px">Аналитические отчёты, GROUP BY, Window functions</td>
                            <td style="border:1px solid var(--border);padding:10px 14px">Raw SQL — полный контроль</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px">Прототип, стартап, MVP</td>
                            <td style="border:1px solid var(--border);padding:10px 14px">ORM — скорость важнее</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="border:1px solid var(--border);padding:10px 14px">Высоконагруженный сервис (тысячи RPS)</td>
                            <td style="border:1px solid var(--border);padding:10px 14px">Сочетание: ORM для простого, raw SQL для критичного</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px">Массовые вставки / bulk operations</td>
                            <td style="border:1px solid var(--border);padding:10px 14px">Raw SQL или специальные методы ORM</td>
                        </tr>
                    </tbody>
                </table>
                <p>Хорошая новость: GORM позволяет использовать оба подхода в одном проекте. Простые операции — через ORM, сложные — через <code>db.Raw()</code>.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'database/sql vs GORM: сравнение',
            code: `// ===== database/sql (стандартная библиотека) =====
func getUserByID_SQL(db *sql.DB, id int) (*User, error) {
    var user User
    row := db.QueryRow(
        "SELECT id, name, email, created_at FROM users WHERE id = $1",
        id,
    )
    err := row.Scan(&user.ID, &user.Name, &user.Email, &user.CreatedAt)
    if err == sql.ErrNoRows {
        return nil, nil
    }
    return &user, err
}

// ===== GORM =====
func getUserByID_GORM(db *gorm.DB, id int) (*User, error) {
    var user User
    result := db.First(&user, id)
    if errors.Is(result.Error, gorm.ErrRecordNotFound) {
        return nil, nil
    }
    return &user, result.Error
}`,
            explanation: 'GORM значительно сокращает код для стандартных операций. Особенно заметно при работе со связями: без ORM пришлось бы писать отдельные запросы и вручную связывать результаты.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Проблема N+1: главная ловушка ORM',
            code: `// ПЛОХО: N+1 запросов!
// 1 запрос на получение пользователей
// + N запросов на заказы каждого
var users []User
db.Find(&users)
for _, user := range users {
    var orders []Order
    db.Where("user_id = ?", user.ID).Find(&orders)
    // Для 100 пользователей = 101 запрос в БД!
}

// ХОРОШО: Preload решает проблему
// Всего 2 запроса, независимо от числа пользователей:
// SELECT * FROM users
// SELECT * FROM orders WHERE user_id IN (1, 2, 3, ...)
db.Preload("Orders").Find(&users)`,
            explanation: 'N+1 — главная проблема при работе с ORM. Если загружаете связанные данные в цикле, всегда используйте Preload или Joins. Это одна из причин, почему нужно понимать SQL даже при использовании ORM.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>ORM в Go — не религия:</strong> В отличие от Ruby on Rails, Go-сообщество не считает ORM обязательным. Многие крупные проекты (Kubernetes, Docker) работают напрямую с <code>database/sql</code>. Выбирайте инструмент под задачу: GORM отлично подходит для бизнес-приложений, а для системного ПО часто лучше <code>database/sql</code> или <code>pgx</code>.</p>`
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<p><strong>ORM не отменяет знание SQL:</strong> Разработчики, которые не понимают SQL и полагаются только на ORM, рано или поздно столкнутся с серьёзными проблемами производительности. ORM — это инструмент, а не замена знаниям. Понимать, какой SQL генерирует ваш код, критически важно.</p>`
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что такое ORM?',
                    options: [
                        'Отдельная база данных для Go',
                        'Технология, которая автоматически преобразует данные между объектами кода и таблицами БД',
                        'Замена SQL, который больше не нужен',
                        'Библиотека для кэширования запросов'
                    ],
                    correct: 1,
                    explanation: 'ORM (Object-Relational Mapping) — это слой, который автоматически преобразует данные между несовместимыми типами систем: объектной моделью (Go-структуры) и реляционной (SQL-таблицы).'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Какой паттерн проектирования использует GORM?',
                    options: [
                        'Data Mapper — маппинг вынесен в отдельный слой',
                        'Active Record — структура сама знает, как работать с БД',
                        'Repository — абстракция над хранилищем',
                        'Singleton — один объект на всё приложение'
                    ],
                    correct: 1,
                    explanation: 'Active Record — паттерн, где объект "активен": он сам умеет сохраняться, обновляться и удаляться из БД. Структура User в GORM — это Active Record.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Что такое проблема N+1?',
                    options: [
                        'Использование N+1 индексов в таблице',
                        'Выполнение 1 запроса для списка + N запросов для каждого элемента списка',
                        'Лимит на N+1 соединений в пуле',
                        'Ошибка при вставке N+1 записи'
                    ],
                    correct: 1,
                    explanation: 'N+1 — это антипаттерн: 1 запрос загружает список из N элементов, потом для каждого элемента делается отдельный запрос. Итого N+1 запросов вместо 2. Решается через Preload или JOIN.'
                },
                {
                    id: 'q4',
                    type: 'multiple',
                    question: 'Выберите ситуации, где ORM предпочтительнее raw SQL:',
                    options: [
                        'Стандартный CRUD: создание, чтение, обновление пользователей',
                        'Сложный аналитический отчёт с Window functions и CTE',
                        'Быстрый прототип или MVP',
                        'Массовая загрузка данных (bulk insert миллионов строк)',
                        'Авторизация и управление профилем пользователя'
                    ],
                    correct: [0, 2, 4],
                    explanation: 'ORM отлично подходит для стандартных CRUD-операций и прототипирования. Для сложных аналитических запросов и массовых операций лучше использовать raw SQL.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Как называется несоответствие между объектной и реляционной моделями?',
                    options: [
                        'Type mismatch',
                        'Impedance mismatch',
                        'Schema conflict',
                        'ORM paradox'
                    ],
                    correct: 1,
                    explanation: 'Impedance mismatch (несоответствие импедансов) — термин из физики, используется для описания концептуального несоответствия между объектно-ориентированной и реляционной парадигмами.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Правда ли, что при использовании ORM знание SQL не нужно?',
                    options: [
                        'Да, ORM полностью абстрагирует от SQL',
                        'Нет, понимание SQL критически важно для оптимизации и отладки',
                        'Только для Junior разработчиков',
                        'Зависит от используемой БД'
                    ],
                    correct: 1,
                    explanation: 'ORM — это инструмент поверх SQL, а не его замена. Не понимая SQL, вы не сможете оптимизировать запросы, правильно использовать индексы или разобраться в проблемах производительности.'
                }
            ]
        }
    ]
};
