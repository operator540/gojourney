export default {
    id: '17-06',
    title: 'Итоговый квиз: Redis и Кэширование',
    description: 'Проверяем знания по Redis — типы данных, паттерны кэширования, go-redis',
    estimatedTime: 15,
    xpReward: 30,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Финальная проверка: Redis</h2>
                <p>Проверяем знания по всему модулю Redis — от базовых концепций до паттернов использования.</p>
            `
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Какой тип данных Redis лучше всего подходит для лидерборда?',
                    options: [
                        'Sorted Set (ZSet)',
                        'List',
                        'Hash',
                        'Set'
                    ],
                    correct: 0,
                    explanation: 'Sorted Set: каждый элемент имеет score, автосортировка. ZADD добавляет, ZINCRBY увеличивает очки, ZREVRANGE 0 9 возвращает топ-10. Идеально для рейтингов.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что вернёт команда GET для несуществующего ключа в go-redis?',
                    options: [
                        'Ошибку redis.Nil',
                        'Пустую строку и nil ошибку',
                        'Панику',
                        '"" (пустая строка)'
                    ],
                    correct: 0,
                    explanation: 'redis.Nil — специальная sentinel ошибка: "ключ не существует". Проверяем через err == redis.Nil. Это отдельно от реальных ошибок подключения/сети.'
                },
                {
                    id: 'q3',
                    type: 'multiple',
                    question: 'Для каких задач Redis Pub/Sub НЕ подходит?',
                    options: [
                        'Надёжная доставка (сообщение нельзя потерять)',
                        'Real-time уведомления онлайн-пользователей',
                        'Очередь задач с гарантией обработки',
                        'Инвалидация кэша на нескольких серверах',
                        'Доставка заказов'
                    ],
                    correct: [0, 2, 4],
                    explanation: 'Pub/Sub — fire and forget: сообщение теряется если нет активных подписчиков. Для надёжных очередей — Streams или List+BLPOP.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'В чём отличие Write-Through от Cache-Aside?',
                    options: [
                        'Write-Through обновляет кэш синхронно при каждой записи; Cache-Aside заполняет кэш при чтении (cache miss)',
                        'Write-Through быстрее Cache-Aside',
                        'Cache-Aside только для чтения, Write-Through только для записи',
                        'Write-Through удаляет кэш при записи, Cache-Aside сохраняет'
                    ],
                    correct: 0,
                    explanation: 'Write-Through: запись → БД + кэш одновременно. Кэш всегда актуален. Cache-Aside: чтение → check cache → if miss: БД → fill cache. Запись просто инвалидирует кэш.'
                },
                {
                    id: 'q5',
                    type: 'code-fill',
                    question: 'Команда для атомарного установления ключа ТОЛЬКО если он не существует:\nrdb.___(ctx, "lock", "1", 5*time.Second)',
                    template: 'rdb.___(ctx, "lock", "1", 5*time.Second)',
                    correct: 'SetNX',
                    caseSensitive: false,
                    explanation: 'SetNX (SET if Not eXists) — атомарная операция. Возвращает true если ключ был создан, false если уже существовал. Основа для distributed locks.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Для чего нужен Pipeline в Redis?',
                    options: [
                        'Объединить несколько команд в один round-trip и сократить latency',
                        'Обеспечить транзакционность операций',
                        'Увеличить размер хранимых данных',
                        'Автоматически сжимать данные'
                    ],
                    correct: 0,
                    explanation: 'Pipeline отправляет N команд за 1 round-trip вместо N round-trips. При сетевой задержке 1мс — 1000 команд займут 1мс вместо 1000мс. TxPipelined добавляет транзакцию.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Hash vs String (JSON) для хранения объекта. Когда Hash лучше?',
                    options: [
                        'Когда нужно часто обновлять отдельные поля объекта',
                        'Hash всегда лучше String',
                        'Когда объект большой (>1 МБ)',
                        'String всегда быстрее Hash'
                    ],
                    correct: 0,
                    explanation: 'Hash: HSET user:42 score 100 — обновляем одно поле без перезаписи всего объекта. String: нужно GET→unmarshal→update→marshal→SET. Hash выигрывает при частых частичных обновлениях.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Что такое XACK в Redis Streams?',
                    options: [
                        'Подтверждение обработки сообщения, убирает из pending list',
                        'Добавление нового сообщения в стрим',
                        'Удаление стрима',
                        'Создание consumer group'
                    ],
                    correct: 0,
                    explanation: 'XACK говорит Redis: "это сообщение обработано, убери из pending". Без XACK — сообщение остаётся в pending и может быть перехвачено другим воркером при падении первого.'
                }
            ]
        },
        {
            type: 'theory',
            content: `
                <h2>Redis: итоги модуля</h2>
                <ul>
                    <li>⚡ <strong>Redis</strong> — in-memory хранилище с персистентностью, sub-миллисекундные latency</li>
                    <li>📦 <strong>5 основных типов</strong>: String, List, Hash, Set, Sorted Set — каждый для своих задач</li>
                    <li>🔌 <strong>go-redis v9</strong> — стандартный клиент, поддерживает всё включая Streams и Cluster</li>
                    <li>🗂️ <strong>Cache-Aside</strong> — самый популярный паттерн: проверь кэш → miss → БД → заполни кэш</li>
                    <li>📡 <strong>Pub/Sub</strong> — real-time события, но без гарантий доставки</li>
                    <li>🌊 <strong>Streams</strong> — надёжные очереди с consumer groups и подтверждением (XACK)</li>
                    <li>⚠️ <strong>TTL</strong> — всегда устанавливайте TTL чтобы кэш не рос бесконечно</li>
                </ul>
            `
        }
    ]
};
