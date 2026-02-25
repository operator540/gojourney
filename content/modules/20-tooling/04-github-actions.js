export default {
    id: '20-04',
    title: 'CI/CD с GitHub Actions',
    description: 'Автоматические тесты, линтинг и деплой через GitHub Actions',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>GitHub Actions — CI/CD для Go проектов</h2>
                <p>GitHub Actions запускает автоматические задачи при событиях в репозитории (push, pull request, tag).</p>
                <p>Типичный Go pipeline:</p>
                <ul>
                    <li><strong>lint</strong> — проверка стиля кода (golangci-lint)</li>
                    <li><strong>test</strong> — запуск тестов + coverage</li>
                    <li><strong>build</strong> — сборка бинарника</li>
                    <li><strong>docker</strong> — сборка и push Docker образа</li>
                    <li><strong>deploy</strong> — деплой на сервер</li>
                </ul>
                <p>Конфигурация: файл <code>.github/workflows/ci.yml</code></p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: '.github/workflows/ci.yml — полный CI pipeline',
            code: `# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  GO_VERSION: '1.22'

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-go@v5
        with:
          go-version: \${{ env.GO_VERSION }}
          cache: true

      - name: golangci-lint
        uses: golangci/golangci-lint-action@v4
        with:
          version: latest
          args: --timeout=5m

  test:
    name: Test
    runs-on: ubuntu-latest
    needs: lint

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: testdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-go@v5
        with:
          go-version: \${{ env.GO_VERSION }}
          cache: true

      - name: Run tests
        run: go test -v -race -coverprofile=coverage.out ./...
        env:
          DATABASE_URL: postgres://postgres:testpass@localhost:5432/testdb?sslmode=disable
          REDIS_URL: redis://localhost:6379

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage.out

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-go@v5
        with:
          go-version: \${{ env.GO_VERSION }}
          cache: true

      - name: Build
        run: |
          VERSION=\$(git describe --tags --always)
          COMMIT=\$(git rev-parse --short HEAD)
          go build \\
            -ldflags "-s -w -X main.Version=\$VERSION -X main.Commit=\$COMMIT" \\
            -o bin/server ./cmd/server

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: server
          path: bin/server`,
            explanation: 'needs: lint — test запускается только после успешного lint. Services — запускают Docker контейнеры для тестов (PostgreSQL, Redis). -race флаг обнаруживает race conditions.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Release workflow: Docker + деплой',
            code: `# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'  # запускается при тегах v1.0.0, v1.2.3 etc.

jobs:
  docker:
    name: Build & Push Docker
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/\${{ github.repository }}
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    needs: docker
    environment: production

    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            docker pull ghcr.io/\${{ github.repository }}:latest
            docker-compose -f /app/docker-compose.yml up -d --no-deps app
            docker system prune -f`,
            explanation: 'Trigger: пуш тега v* (v1.0.0). Docker meta автоматически тегирует образ по semver. environment: production требует одобрения (защищённое окружение). secrets — зашифрованные переменные.'
        },
        {
            type: 'theory',
            content: `
                <h2>Секреты и переменные окружения</h2>
                <p>Никогда не хардкодите токены в workflow файлах. Используйте:</p>
                <ul>
                    <li><strong>secrets.*</strong> — зашифрованные секреты (tokens, keys), видны только при запуске</li>
                    <li><strong>vars.*</strong> — обычные переменные (не секретные)</li>
                    <li><strong>env:</strong> — переменные для конкретного шага/job</li>
                    <li><strong>GITHUB_TOKEN</strong> — автоматический токен для операций с репозиторием</li>
                </ul>
            `
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Полезные практики CI для Go:</strong></p>
            <ul>
                <li>Всегда запускайте тесты с <code>-race</code> — обнаруживает race conditions</li>
                <li>Используйте <code>cache: true</code> в setup-go — кэширует модули</li>
                <li>Запускайте Docker сервисы для интеграционных тестов прямо в CI</li>
                <li>Проверяйте <code>go vet ./...</code> — статический анализ</li>
                <li>Настройте codecov/coveralls для мониторинга покрытия</li>
            </ul>`
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Зачем использовать -race флаг в go test в CI?',
                    options: [
                        'Для обнаружения race conditions — конкурентных ошибок',
                        'Для ускорения тестов',
                        'Для уменьшения coverage',
                        'Обязателен для Docker-based тестов'
                    ],
                    correct: 0,
                    explanation: '-race включает race detector: инструментирует код и обнаруживает параллельный доступ к данным без синхронизации. Замедляет тесты 2-20x, но ловит скрытые баги.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Как хранить API токены в GitHub Actions?',
                    options: [
                        'В secrets репозитория, обращаться через ${{ secrets.MY_TOKEN }}',
                        'В env: секции как обычный текст',
                        'В отдельном файле .env',
                        'В README файле в зашифрованном виде'
                    ],
                    correct: 0,
                    explanation: 'GitHub Secrets: Settings → Secrets and variables → Actions → New secret. Значения зашифрованы и не отображаются в логах. Используются через ${{ secrets.NAME }}.'
                }
            ]
        }
    ]
};
