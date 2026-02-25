export default {
    id: '13-06',
    title: 'docker-compose',
    description: 'docker-compose для Go-приложения с PostgreSQL и Redis. Сети, volumes, depends_on. Команды up, down, logs, exec.',
    estimatedTime: 20,
    xpReward: 20,
    sections: [
        {
            type: 'theory',
            content: `
<h2>docker-compose: оркестрация контейнеров</h2>
<p>docker-compose позволяет описать многоконтейнерное приложение в одном YAML-файле. Одна команда <code>docker compose up</code> — и всё работает.</p>
<p>Типичный стек Go-приложения:</p>
<ul>
    <li><strong>app</strong> — Go-сервер</li>
    <li><strong>postgres</strong> — база данных</li>
    <li><strong>redis</strong> — кеш / очереди</li>
</ul>
`
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'docker-compose.yml для Go + PostgreSQL + Redis',
            code: `version: '3.9'

services:
  # ===== Go Application =====
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: myapp
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - APP_ENV=production
      - DATABASE_URL=postgres://postgres:secret@postgres:5432/mydb?sslmode=disable
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=\${JWT_SECRET}  # из .env файла
    depends_on:
      postgres:
        condition: service_healthy  # ждём готовности БД
      redis:
        condition: service_healthy
    networks:
      - backend

  # ===== PostgreSQL =====
  postgres:
    image: postgres:16-alpine
    container_name: myapp-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data  # персистентные данные
      - ./migrations/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"  # только для локальной разработки!
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d mydb"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - backend

  # ===== Redis =====
  redis:
    image: redis:7-alpine
    container_name: myapp-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass redissecret
    volumes:
      - redisdata:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - backend

# ===== Сети =====
networks:
  backend:
    driver: bridge

# ===== Именованные volumes (данные сохраняются между рестартами) =====
volumes:
  pgdata:
  redisdata:`,
            explanation: 'depends_on с condition: service_healthy гарантирует, что app стартует только после готовности БД. Volumes сохраняют данные при рестарте. Сеть backend изолирует контейнеры от внешнего мира.'
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Файл .env для docker-compose',
            code: `# .env — НЕ добавлять в git!
# docker-compose автоматически читает .env

JWT_SECRET=your-super-secret-jwt-key-change-in-production
POSTGRES_PASSWORD=change-me-in-production
APP_ENV=development

# .env.example — добавить в git (без значений)
JWT_SECRET=
POSTGRES_PASSWORD=
APP_ENV=development`,
            explanation: 'docker-compose автоматически читает .env в текущей директории. Значения ${VAR} в docker-compose.yml подставляются из .env. Коммитьте только .env.example с пустыми значениями.'
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Основные команды docker compose',
            code: `# Запустить все сервисы (build если нет образов)
docker compose up

# Запустить в фоне
docker compose up -d

# Пересобрать образы и запустить
docker compose up -d --build

# Запустить только один сервис
docker compose up -d postgres redis

# Остановить все (контейнеры остаются)
docker compose stop

# Остановить и удалить контейнеры (volumes сохраняются)
docker compose down

# Удалить всё включая volumes (ОСТОРОЖНО! удалит данные БД)
docker compose down -v

# Логи всех сервисов
docker compose logs

# Логи конкретного сервиса в реальном времени
docker compose logs -f app

# Выполнить команду в работающем контейнере
docker compose exec postgres psql -U postgres -d mydb

# Выполнить bash в контейнере app
docker compose exec app sh

# Посмотреть статус сервисов
docker compose ps

# Перезапустить сервис
docker compose restart app

# Горизонтальное масштабирование (несколько экземпляров)
docker compose up -d --scale app=3`,
            explanation: 'docker compose (v2) — замена docker-compose (v1). Используйте compose без дефиса. Команды те же. exec позволяет войти в любой контейнер для отладки.'
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'docker-compose для разработки (override)',
            code: `# docker-compose.override.yml — автоматически мержится с docker-compose.yml
# Используется для локальной разработки

version: '3.9'

services:
  app:
    build:
      context: .
      target: builder  # только builder stage — для hot reload
    volumes:
      - .:/app  # монтируем исходники для live reload
    command: ["go", "run", "./cmd/server"]
    environment:
      - APP_ENV=development
      - LOG_LEVEL=debug
    ports:
      - "2345:2345"  # порт для delve debugger

  postgres:
    ports:
      - "5432:5432"  # открываем порт для GUI-клиентов (pgAdmin)`,
            explanation: 'docker-compose.override.yml автоматически применяется поверх основного файла. Удобно разделять продакшн-конфиг и конфиг разработки. В CI/CD используется только docker-compose.yml.'
        },
        {
            type: 'info-box',
            variant: 'important',
            content: '<p><strong>Healthcheck обязателен!</strong> Без него <code>depends_on</code> проверяет только "контейнер запущен", но не "PostgreSQL готов принимать подключения". Используйте <code>condition: service_healthy</code>.</p>'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q13-06-1',
                    type: 'single',
                    question: 'Что делает docker compose down -v?',
                    options: [
                        'Останавливает контейнеры, volumes сохраняются',
                        'Останавливает и удаляет контейнеры И именованные volumes',
                        'Удаляет только образы',
                        'Показывает verbose вывод'
                    ],
                    correct: 1,
                    explanation: 'docker compose down удаляет контейнеры и сети. -v дополнительно удаляет именованные volumes. Осторожно: удалятся все данные PostgreSQL, Redis и т.д.'
                },
                {
                    id: 'q13-06-2',
                    type: 'single',
                    question: 'Зачем нужен healthcheck в docker-compose?',
                    options: [
                        'Для мониторинга использования памяти',
                        'Чтобы depends_on мог дождаться реальной готовности сервиса',
                        'Для автоматического рестарта при падении',
                        'Для балансировки нагрузки'
                    ],
                    correct: 1,
                    explanation: 'Без healthcheck depends_on считает сервис готовым сразу после старта контейнера. С healthcheck и condition: service_healthy — ждёт пока pg_isready вернёт успех.'
                },
                {
                    id: 'q13-06-3',
                    type: 'multiple',
                    question: 'Что хранят Docker volumes?',
                    options: [
                        'Данные PostgreSQL между рестартами контейнера',
                        'Исходный код приложения',
                        'Данные Redis (appendonly)',
                        'Конфигурационные файлы',
                        'Данные сохраняются даже после docker compose down'
                    ],
                    correct: [0, 2, 4],
                    explanation: 'Volumes хранят данные вне контейнера — они переживают docker compose down (без -v). pgdata хранит данные PostgreSQL, redisdata — данные Redis. Исходники обычно монтируются как bind mount, не volume.'
                }
            ]
        }
    ]
};
