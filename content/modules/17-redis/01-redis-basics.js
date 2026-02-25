export default {
  id: '17-01',
  title: 'Redis: база данных в памяти',
  description: 'Что такое Redis, зачем он нужен, запуск через Docker, redis-cli, команды KEY/TTL/PERSIST/EXPIREAT, персистентность RDB vs AOF.',
  estimatedTime: 30,
  xpReward: 25,
  sections: [
    {
      type: 'theory',
      content: `<h2>Зачем нужен Redis?</h2>
<p>Представьте библиотеку. PostgreSQL — это архив в подвале: всё хранится надёжно, но за каждой книгой нужно спускаться. Redis — это стол библиотекаря: 50 самых востребованных книг лежат под рукой. Доступ мгновенный.</p>
<p>Скорость — главная причина. Сравните:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Хранилище</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Латентность</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Throughput</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)">HDD</td>
      <td style="padding:10px;border:1px solid var(--border);color:#f44336">~10ms</td>
      <td style="padding:10px;border:1px solid var(--border)">~200 ops/s</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)">SSD NVMe</td>
      <td style="padding:10px;border:1px solid var(--border);color:#FF9800">~0.1ms</td>
      <td style="padding:10px;border:1px solid var(--border)">~500K ops/s</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)">PostgreSQL (с индексом)</td>
      <td style="padding:10px;border:1px solid var(--border);color:#FF9800">~1-5ms</td>
      <td style="padding:10px;border:1px solid var(--border)">~50K ops/s</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><strong>Redis (RAM)</strong></td>
      <td style="padding:10px;border:1px solid var(--border);color:#4caf50"><strong>&lt; 0.1ms</strong></td>
      <td style="padding:10px;border:1px solid var(--border)"><strong>~1M ops/s</strong></td>
    </tr>
  </tbody>
</table>
<h3>Когда использовать Redis:</h3>
<ul>
  <li><strong>Кэширование</strong> — результаты дорогих SQL-запросов, HTML-страницы</li>
  <li><strong>Сессии</strong> — хранение JWT/session токенов с TTL</li>
  <li><strong>Rate Limiting</strong> — счётчики запросов в секунду</li>
  <li><strong>Очереди задач</strong> — job queue без Kafka/RabbitMQ</li>
  <li><strong>Pub/Sub</strong> — real-time уведомления</li>
  <li><strong>Лидерборды</strong> — рейтинги через Sorted Set</li>
  <li><strong>Distributed Lock</strong> — mutex между несколькими инстансами</li>
</ul>`
    },
    {
      type: 'code-example',
      language: 'bash',
      title: 'Запуск Redis через Docker',
      code: `# Запустить Redis (последняя версия)
docker run -d \\
  --name redis \\
  -p 6379:6379 \\
  redis:7-alpine

# С паролем (рекомендуется даже локально)
docker run -d \\
  --name redis \\
  -p 6379:6379 \\
  redis:7-alpine \\
  redis-server --requirepass "mysecretpassword"

# Подключиться через redis-cli
docker exec -it redis redis-cli

# С паролем
docker exec -it redis redis-cli -a mysecretpassword

# Проверить что Redis живой
127.0.0.1:6379> PING
PONG

# Информация о сервере
127.0.0.1:6379> INFO server
# redis_version:7.2.4
# os:Linux ...

# Docker Compose (для проекта)
# redis:
#   image: redis:7-alpine
#   ports:
#     - "6379:6379"
#   command: redis-server --requirepass ${REDIS_PASSWORD}
#   volumes:
#     - redis_data:/data`,
      explanation: 'redis:7-alpine — минимальный образ ~30MB. requirepass обязателен в production. Без него Redis доступен всем в сети без авторизации. В Docker Compose монтируйте volume /data для персистентности данных между перезапусками.'
    },
    {
      type: 'theory',
      content: `<h2>Основные команды redis-cli</h2>
<p>Redis работает по принципу команда → ответ. Все команды атомарны — выполняются полностью или не выполняются совсем.</p>
<h3>Работа с ключами (Keys):</h3>
<ul>
  <li><code>SET key value</code> — установить значение</li>
  <li><code>GET key</code> — получить значение</li>
  <li><code>DEL key [key2 ...]</code> — удалить ключ(и)</li>
  <li><code>EXISTS key</code> — проверить существование (0 или 1)</li>
  <li><code>KEYS pattern</code> — найти ключи по паттерну (ОПАСНО на prod)</li>
  <li><code>SCAN cursor [MATCH pattern] [COUNT n]</code> — безопасный перебор</li>
  <li><code>TYPE key</code> — тип значения (string/list/hash/set/zset)</li>
  <li><code>RENAME key newkey</code> — переименовать</li>
</ul>
<h3>Работа с TTL (Time To Live):</h3>
<ul>
  <li><code>EX seconds</code> — TTL в секундах (при SET)</li>
  <li><code>PX milliseconds</code> — TTL в миллисекундах (при SET)</li>
  <li><code>EXPIRE key seconds</code> — установить TTL для существующего ключа</li>
  <li><code>EXPIREAT key timestamp</code> — истечение в Unix timestamp</li>
  <li><code>TTL key</code> — сколько секунд осталось (-1 = нет TTL, -2 = ключ не существует)</li>
  <li><code>PTTL key</code> — TTL в миллисекундах</li>
  <li><code>PERSIST key</code> — убрать TTL (сделать постоянным)</li>
</ul>`
    },
    {
      type: 'code-example',
      language: 'bash',
      title: 'Команды SET, GET, TTL, EXPIRE, PERSIST',
      code: `-- Базовые операции
SET name "Alice"                    # OK
GET name                            # "Alice"
EXISTS name                         # (integer) 1
DEL name                            # (integer) 1
GET name                            # (nil)

-- SET с TTL (сессия пользователя на 24 часа)
SET session:user:42 "token_xyz" EX 86400
TTL session:user:42                 # (integer) 86399

-- SET с TTL в миллисекундах
SET cache:page:home "<html>..." PX 30000   # 30 секунд

-- SET только если ключ НЕ существует (NX)
SET lock:job:cleanup "1" EX 300 NX
# OK — если ключа не было (мы получили lock)
# (nil) — если ключ уже существует (кто-то держит lock)

-- SET только если ключ существует (XX)
SET session:user:42 "new_token" EX 86400 XX

-- Посмотреть TTL
TTL session:user:42                 # 86354 (секунды)
PTTL session:user:42                # 86354421 (миллисекунды)

-- Установить TTL для существующего ключа
SET permanent_key "important_data"
TTL permanent_key                   # -1 (нет TTL — живёт вечно)
EXPIRE permanent_key 3600           # установить TTL 1 час
TTL permanent_key                   # 3600

-- Удалить TTL (сделать постоянным)
PERSIST permanent_key
TTL permanent_key                   # -1 (снова вечный)

-- Истечение в конкретный момент (Unix timestamp)
EXPIREAT session:user:42 1893456000  # истечёт 2030-01-01

-- Безопасный перебор ключей (вместо KEYS *)
SCAN 0 MATCH "session:user:*" COUNT 100
# 1) "128" (следующий cursor)
# 2) [список ключей]
SCAN 128 MATCH "session:user:*" COUNT 100  # продолжаем
# 1) "0" (cursor = 0 означает конец итерации)`,
      explanation: 'SET NX — это distributed lock в одной команде. Атомарность гарантирует что только один клиент получит OK. EX обязателен — иначе lock никогда не освободится при сбое. SCAN безопасен на prod: он итерирует по маленьким кускам без блокировки Redis.'
    },
    {
      type: 'info-box',
      variant: 'warning',
      content: `<p><strong>KEYS * на продакшене = катастрофа.</strong> Redis однопоточен. KEYS * перебирает все ключи в одном потоке, блокируя обработку ВСЕХ других запросов. Если у вас 1M ключей — это секунды простоя. Всегда используйте <code>SCAN</code> с небольшим COUNT.</p>`
    },
    {
      type: 'theory',
      content: `<h2>Персистентность: RDB vs AOF</h2>
<p>Redis хранит данные в RAM. При выключении сервера всё теряется — если не настроить персистентность.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Режим</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Как работает</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Потеря данных</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Размер</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><strong>RDB</strong> (снимок)</td>
      <td style="padding:10px;border:1px solid var(--border)">Сохраняет snapshot каждые N секунд</td>
      <td style="padding:10px;border:1px solid var(--border);color:#FF9800">До N секунд</td>
      <td style="padding:10px;border:1px solid var(--border)">Маленький (сжатый)</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><strong>AOF</strong> (лог)</td>
      <td style="padding:10px;border:1px solid var(--border)">Записывает каждую команду в лог</td>
      <td style="padding:10px;border:1px solid var(--border);color:#4caf50">До 1 секунды (fsync)</td>
      <td style="padding:10px;border:1px solid var(--border)">Большой</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><strong>RDB + AOF</strong></td>
      <td style="padding:10px;border:1px solid var(--border)">Оба режима</td>
      <td style="padding:10px;border:1px solid var(--border);color:#4caf50">Минимальная</td>
      <td style="padding:10px;border:1px solid var(--border)">Средний</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><strong>Нет</strong></td>
      <td style="padding:10px;border:1px solid var(--border)">Только RAM</td>
      <td style="padding:10px;border:1px solid var(--border);color:#f44336">Все данные</td>
      <td style="padding:10px;border:1px solid var(--border)">0</td>
    </tr>
  </tbody>
</table>
<p>Для <strong>кэша</strong> персистентность не нужна — данные просто перегрузятся из PostgreSQL. Для <strong>сессий и очередей</strong> рекомендуется AOF с <code>appendfsync everysec</code>.</p>`
    },
    {
      type: 'code-example',
      language: 'bash',
      title: 'Конфигурация Redis и мониторинг',
      code: `# redis.conf — основные настройки
maxmemory 512mb                     # лимит памяти
maxmemory-policy allkeys-lru        # вытеснять самые старые ключи

# Политики вытеснения (eviction policies):
# noeviction — возвращать ошибку при нехватке памяти
# allkeys-lru — вытеснять самые давно не используемые из всех ключей
# volatile-lru — вытеснять самые давно не используемые из ключей с TTL
# allkeys-random — случайные ключи
# volatile-ttl — ключи с наименьшим оставшимся TTL

# Персистентность RDB
save 900 1      # сохранять если 1+ изменений за 15 минут
save 300 10     # сохранять если 10+ изменений за 5 минут
save 60 10000   # сохранять если 10000+ изменений за 1 минуту

# Персистентность AOF
appendonly yes
appendfsync everysec    # fsync каждую секунду (баланс скорость/надёжность)

# Мониторинг в redis-cli
INFO memory             # использование памяти
INFO stats              # статистика команд
INFO keyspace           # количество ключей по БД
CONFIG GET maxmemory    # текущие настройки
MONITOR                 # real-time поток всех команд (ОПАСНО на prod — замедляет)
DEBUG SLEEP 5           # заморозить Redis на 5 секунд (только для тестов!)`,
      explanation: 'allkeys-lru — рекомендуемая политика для кэша: Redis сам вытесняет старые данные при нехватке памяти. volatile-lru — если у части ключей нет TTL и их нельзя вытеснять. MONITOR удобен для отладки локально, но на prod замедляет Redis в 2x — используйте с осторожностью.'
    },
    {
      type: 'editor',
      title: 'Практика: базовые операции в Go',
      instructions: 'Напишите функцию которая сохраняет данные пользователя в Redis с TTL 1 час. Используйте go-redis/v9.',
      starterCode: `package cache

import (
    "context"
    "time"
    "github.com/redis/go-redis/v9"
)

func NewRedisClient() *redis.Client {
    return redis.NewClient(&redis.Options{
        Addr:     "localhost:6379",
        Password: "",
        DB:       0,
    })
}

// SetUserSession сохраняет сессию пользователя с TTL 1 час
func SetUserSession(ctx context.Context, rdb *redis.Client, userID int64, token string) error {
    key := fmt.Sprintf("session:user:%d", userID)
    // Напишите SET с TTL 1 час
    // ???
    return nil
}

// GetUserSession получает токен сессии
func GetUserSession(ctx context.Context, rdb *redis.Client, userID int64) (string, error) {
    key := fmt.Sprintf("session:user:%d", userID)
    // Получите значение, верните ("", redis.Nil) если не найдено
    // ???
    return "", nil
}`,
      hints: [
        'rdb.Set(ctx, key, token, time.Hour).Err()',
        'val, err := rdb.Get(ctx, key).Result()',
        'Если err == redis.Nil — ключ не существует (сессия истекла)',
        'fmt нужно добавить в import'
      ]
    },
    {
      type: 'quiz',
      questions: [
        {
          id: 'q1701-1',
          type: 'single',
          question: 'Что возвращает TTL key если ключ существует но без TTL?',
          options: ['0', '-1', '-2', 'nil'],
          correct: 1,
          explanation: 'TTL возвращает: -1 если ключ существует без TTL (вечный), -2 если ключ не существует вообще, N (секунды) если есть TTL. PTTL делает то же в миллисекундах.'
        },
        {
          id: 'q1701-2',
          type: 'single',
          question: 'SET key value EX 300 NX — что делает NX?',
          options: [
            'Устанавливает TTL в наносекундах',
            'Устанавливает значение только если ключ НЕ существует (Not eXists)',
            'Не уведомлять подписчиков',
            'Использовать следующую версию Redis'
          ],
          correct: 1,
          explanation: 'NX (Not eXists): команда выполняется только если ключ отсутствует. Атомарная операция — идеальна для distributed lock. SET lock NX EX 30: если вернулось OK — мы взяли lock, если nil — уже занят другим процессом.'
        },
        {
          id: 'q1701-3',
          type: 'single',
          question: 'Какую политику вытеснения выбрать для Redis-кэша?',
          options: [
            'noeviction — никогда не вытеснять',
            'allkeys-lru — вытеснять наименее недавно используемые ключи',
            'volatile-random — случайные ключи с TTL',
            'allkeys-random — совсем случайные'
          ],
          correct: 1,
          explanation: 'allkeys-lru — классический выбор для кэша. Redis вытесняет ключи которые давно не запрашивались (LRU = Least Recently Used). Это соответствует принципу: "если давно не спрашивали — вероятно, не понадобится". noeviction вернёт ошибку при нехватке памяти — плохо для кэша.'
        },
        {
          id: 'q1701-4',
          type: 'single',
          question: 'Почему Redis однопоточный?',
          options: [
            'Ограничение архитектуры — так было проще написать',
            'Все операции атомарны без mutex — один поток исключает race condition, а I/O-bound работа эффективна через event loop',
            'Многопоточность не нужна — Redis и так достаточно быстрый',
            'Redis использует несколько потоков начиная с версии 6'
          ],
          correct: 1,
          explanation: 'Однопоточная модель даёт Redis атомарность всех операций без блокировок. Race condition невозможен. Event loop (как в Node.js) эффективно мультиплексирует тысячи соединений. Redis 6+ добавил multi-threading для I/O (чтение из сокетов), но команды всё равно выполняются в одном потоке.'
        }
      ]
    }
  ]
};
