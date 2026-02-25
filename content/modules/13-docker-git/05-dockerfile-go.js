export default {
    id: '13-05',
    title: 'Dockerfile для Go',
    description: 'Многоэтапная сборка (multi-stage build) для Go: builder stage компилирует бинарник, финальный alpine-образ его запускает. Результат — минимальный образ.',
    estimatedTime: 20,
    xpReward: 20,
    sections: [
        {
            type: 'theory',
            content: `
<h2>Dockerfile для Go-приложений</h2>
<p>Dockerfile — инструкция для сборки Docker-образа. Каждая команда создаёт новый слой.</p>
<h3>Multi-stage build</h3>
<p>Go компилирует бинарник. Зачем тащить весь Go-тулчейн (600MB) в продакшн?</p>
<ul>
    <li><strong>Stage 1 (builder)</strong> — образ golang, компилируем бинарник</li>
    <li><strong>Stage 2 (final)</strong> — минимальный alpine (5MB), копируем только бинарник</li>
</ul>
<p>Итоговый образ: ~10-15MB вместо 600MB+</p>
`
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Dockerfile для Go: multi-stage build',
            code: `# syntax=docker/dockerfile:1

# ========== Stage 1: Builder ==========
FROM golang:1.23-alpine AS builder

# Устанавливаем зависимости для CGO (если нужны)
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app

# Копируем go.mod и go.sum ПЕРВЫМИ
# Docker кешируют слои — если зависимости не изменились,
# этот слой не пересобирается
COPY go.mod go.sum ./
RUN go mod download

# Копируем исходники
COPY . .

# Собираем бинарник
# CGO_ENABLED=0 — статическая сборка (без C-зависимостей)
# -ldflags="-s -w" — убираем debug-символы (меньше размер)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o /bin/app ./cmd/server

# ========== Stage 2: Final ==========
FROM alpine:3.20

# Сертификаты для HTTPS-запросов
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Копируем ТОЛЬКО бинарник из builder
COPY --from=builder /bin/app .

# Опционально: копируем статику, конфиги
# COPY --from=builder /app/web ./web
# COPY --from=builder /app/migrations ./migrations

# Не запускать от root!
RUN adduser -D -u 1001 appuser
USER appuser

EXPOSE 8080

CMD ["/app/app"]`,
            explanation: 'CGO_ENABLED=0 создаёт полностью статический бинарник — работает в alpine без glibc. -ldflags="-s -w" убирает debug-символы, уменьшая размер на 30-40%.'
        },
        {
            type: 'code-example',
            language: 'bash',
            title: '.dockerignore — ускоряем сборку',
            code: `# .dockerignore — как .gitignore, но для Docker

# Git
.git/
.gitignore

# Переменные окружения
.env
*.env

# IDE
.idea/
.vscode/

# Бинарники и артефакты
*.exe
/bin/
/tmp/

# Тестовые файлы (не нужны в продакшне)
*_test.go
/testdata/

# Docker файлы (не нужны в контексте)
Dockerfile
docker-compose*.yml

# README и документация
*.md
/docs/`,
            explanation: '.dockerignore предотвращает копирование ненужных файлов в Docker build context. Это ускоряет сборку (меньше данных передаётся демону Docker) и уменьшает размер образа.'
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Сборка и запуск',
            code: `# Собрать образ с тегом
docker build -t myapp:latest .

# С конкретной версией
docker build -t myapp:1.0.0 .

# Посмотреть размер образа
docker images myapp
# REPOSITORY   TAG       IMAGE ID       SIZE
# myapp        latest    abc123def456   12.4MB

# Запустить
docker run -d \
    --name myapp \
    -p 8080:8080 \
    -e DATABASE_URL=postgres://user:pass@db:5432/mydb \
    -e JWT_SECRET=supersecret \
    myapp:latest

# Посмотреть логи
docker logs -f myapp

# Собрать с BuildKit (быстрее, кеш эффективнее)
DOCKER_BUILDKIT=1 docker build -t myapp:latest .

# Multi-platform сборка (для Apple M1/M2 → Linux amd64)
docker buildx build --platform linux/amd64 -t myapp:latest .`,
            explanation: 'Всегда тегируйте образы конкретной версией (не только :latest). docker buildx позволяет собрать образ для другой архитектуры — полезно для деплоя с Apple Silicon на Linux-серверы.'
        },
        {
            type: 'info-box',
            variant: 'important',
            content: '<p><strong>Безопасность:</strong> никогда не запускайте контейнер от root (USER root). Создайте непривилегированного пользователя. Никогда не встраивайте секреты в Dockerfile — используйте переменные окружения или Docker secrets.</p>'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p><strong>Порядок COPY важен!</strong> Сначала копируйте <code>go.mod</code> и <code>go.sum</code>, запускайте <code>go mod download</code>, затем копируйте исходники. Docker кеширует слои — зависимости не будут скачиваться при каждом изменении кода.</p>'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q13-05-1',
                    type: 'single',
                    question: 'Зачем нужен multi-stage build для Go?',
                    options: [
                        'Для ускорения компиляции',
                        'Чтобы финальный образ содержал только бинарник, без Go-тулчейна (600MB)',
                        'Для поддержки нескольких версий Go',
                        'Для запуска тестов в CI'
                    ],
                    correct: 1,
                    explanation: 'Go-тулчейн весит ~600MB. Готовый бинарник — несколько MB. Multi-stage: builder stage компилирует, final stage берёт только бинарник. Итог: 10-15MB вместо 600MB+.'
                },
                {
                    id: 'q13-05-2',
                    type: 'single',
                    question: 'Что делает CGO_ENABLED=0 при сборке Go?',
                    options: [
                        'Отключает горутины',
                        'Создаёт статически слинкованный бинарник без зависимостей от C-библиотек',
                        'Ускоряет компиляцию',
                        'Включает оптимизации компилятора'
                    ],
                    correct: 1,
                    explanation: 'CGO_ENABLED=0 запрещает использование CGO (C Go). Бинарник статически слинкован и не зависит от glibc — работает в минимальных образах (alpine, scratch) без C-рантайма.'
                },
                {
                    id: 'q13-05-3',
                    type: 'multiple',
                    question: 'Почему go.mod и go.sum копируются ДО исходников?',
                    options: [
                        'Это требование Go-компилятора',
                        'Docker кеширует слои — если зависимости не изменились, go mod download не запускается повторно',
                        'Это ускоряет сборку при изменении только исходников',
                        'Это защита от утечки исходного кода',
                        'go mod download не видит файлы в других слоях'
                    ],
                    correct: [1, 2],
                    explanation: 'Docker кеш работает по принципу: если входные данные слоя не изменились — используется кеш. Копируя go.mod/go.sum отдельно, мы говорим Docker: "скачивай зависимости только когда они изменились".'
                }
            ]
        }
    ]
};
