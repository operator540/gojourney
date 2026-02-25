export default {
    id: '21-04',
    title: 'Observability: Tracing и Metrics',
    description: 'OpenTelemetry трейсинг, Prometheus метрики, structured logging в Go',
    estimatedTime: 30,
    xpReward: 28,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Три столпа observability</h2>
                <p>В микросервисах сложно понять "что происходит". Observability — способность видеть внутреннее состояние системы по внешним данным.</p>
                <ul>
                    <li>📋 <strong>Logs</strong> — события с контекстом. "Что произошло?"</li>
                    <li>📊 <strong>Metrics</strong> — числовые показатели. "Как работает система?"</li>
                    <li>🔍 <strong>Traces</strong> — путь запроса через сервисы. "Где тормозит?"</li>
                </ul>
                <p>Все три нужны. Логи объясняют детали, метрики показывают тренды, трейсы находят bottleneck.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Structured Logging с slog (Go 1.21)',
            code: `package main

import (
    "context"
    "log/slog"
    "os"
    "time"
)

func main() {
    // JSON logger для продакшна (легко парсится ELK/Grafana Loki)
    logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
        Level: slog.LevelInfo,
    }))
    slog.SetDefault(logger)

    // Структурированные поля — лучше чем fmt.Sprintf
    slog.Info("server starting",
        "port", 8080,
        "env", "production",
        "version", "1.2.3",
    )

    // Логирование с контекстом (request ID, user ID)
    ctx := context.Background()
    ctx = context.WithValue(ctx, "request_id", "abc-123")
    ctx = context.WithValue(ctx, "user_id", 42)

    logWithContext(ctx, "user logged in", slog.String("email", "alice@example.com"))

    // Уровни логирования
    slog.Debug("debug info — не видно в prod")
    slog.Info("информационное сообщение")
    slog.Warn("предупреждение", "retry_count", 3)
    slog.Error("ошибка обработки", "error", "connection refused")
}

func logWithContext(ctx context.Context, msg string, args ...slog.Attr) {
    reqID, _ := ctx.Value("request_id").(string)
    userID, _ := ctx.Value("user_id").(int)

    slog.LogAttrs(ctx, slog.LevelInfo, msg,
        append(args,
            slog.String("request_id", reqID),
            slog.Int("user_id", userID),
            slog.String("timestamp", time.Now().Format(time.RFC3339)),
        )...,
    )
}

// Вывод (JSON):
// {"time":"2024-01-15T10:30:00Z","level":"INFO","msg":"server starting","port":8080,"env":"production"}
// {"time":"...","level":"INFO","msg":"user logged in","email":"alice@example.com","request_id":"abc-123","user_id":42}`,
            explanation: 'slog — встроенный structured logger в Go 1.21. JSON формат удобен для log aggregation (ELK, Loki). Структурированные поля (key-value) лучше чем строки — можно фильтровать и агрегировать.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Prometheus метрики',
            code: `package main

import (
    "net/http"
    "time"

    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

// Объявляем метрики
var (
    // Counter — только растёт (запросы, ошибки)
    requestsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "path", "status"},
    )

    // Histogram — распределение значений (latency)
    requestDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "http_request_duration_seconds",
            Help:    "HTTP request latency",
            Buckets: []float64{.005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5},
        },
        []string{"method", "path"},
    )

    // Gauge — текущее значение (goroutines, connections)
    activeConnections = promauto.NewGauge(
        prometheus.GaugeOpts{
            Name: "active_connections",
            Help: "Number of active connections",
        },
    )

    // Кастомные бизнес-метрики
    ordersCreated = promauto.NewCounter(
        prometheus.CounterOpts{
            Name: "orders_created_total",
            Help: "Total orders created",
        },
    )
)

// Middleware для автоматического сбора метрик
func metricsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        // Обёртка для перехвата статус-кода
        wrapped := &statusRecorder{ResponseWriter: w, statusCode: 200}
        next.ServeHTTP(wrapped, r)

        duration := time.Since(start).Seconds()
        status := fmt.Sprintf("%d", wrapped.statusCode)

        requestsTotal.WithLabelValues(r.Method, r.URL.Path, status).Inc()
        requestDuration.WithLabelValues(r.Method, r.URL.Path).Observe(duration)
    })
}

type statusRecorder struct {
    http.ResponseWriter
    statusCode int
}

func (r *statusRecorder) WriteHeader(code int) {
    r.statusCode = code
    r.ResponseWriter.WriteHeader(code)
}

func main() {
    mux := http.NewServeMux()

    // Бизнес эндпоинт
    mux.HandleFunc("/api/orders", func(w http.ResponseWriter, r *http.Request) {
        // Бизнес-логика...
        ordersCreated.Inc()
        w.WriteHeader(201)
    })

    // Метрики доступны для Prometheus scraping
    mux.Handle("/metrics", promhttp.Handler())

    http.ListenAndServe(":8080", metricsMiddleware(mux))
}`,
            explanation: 'promauto автоматически регистрирует метрики. Counter растёт, Histogram показывает percentiles (p50, p95, p99 latency), Gauge — текущее значение. /metrics эндпоинт собирает Prometheus.'
        },
        {
            type: 'theory',
            content: `
                <h2>OpenTelemetry трейсинг</h2>
                <p><strong>Distributed tracing</strong> — отслеживание пути запроса через несколько сервисов. Каждый сервис создаёт span, они объединяются в trace.</p>
                <p>OpenTelemetry (OTel) — стандарт для трейсинга и метрик. Экспортирует в Jaeger, Zipkin, Grafana Tempo.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'OpenTelemetry трейсинг',
            code: `package main

import (
    "context"
    "fmt"

    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/attribute"
    "go.opentelemetry.io/otel/exporters/jaeger"
    "go.opentelemetry.io/otel/sdk/resource"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
    semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
)

var tracer = otel.Tracer("user-service")

func initTracer() func() {
    // Экспортируем в Jaeger
    exp, _ := jaeger.New(jaeger.WithCollectorEndpoint(
        jaeger.WithEndpoint("http://jaeger:14268/api/traces"),
    ))

    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exp),
        sdktrace.WithResource(resource.NewWithAttributes(
            semconv.SchemaURL,
            semconv.ServiceName("user-service"),
            semconv.ServiceVersion("1.0.0"),
        )),
    )
    otel.SetTracerProvider(tp)
    return func() { tp.Shutdown(context.Background()) }
}

func GetUser(ctx context.Context, userID int64) (map[string]string, error) {
    // Создаём span для этой операции
    ctx, span := tracer.Start(ctx, "GetUser")
    defer span.End()

    // Добавляем атрибуты
    span.SetAttributes(attribute.Int64("user.id", userID))

    // Дочерний span для БД запроса
    user, err := queryDatabase(ctx, userID)
    if err != nil {
        span.RecordError(err)
        return nil, err
    }

    span.SetAttributes(attribute.String("user.name", user["name"]))
    return user, nil
}

func queryDatabase(ctx context.Context, id int64) (map[string]string, error) {
    _, span := tracer.Start(ctx, "db.query")
    defer span.End()

    span.SetAttributes(
        attribute.String("db.system", "postgresql"),
        attribute.String("db.statement", "SELECT * FROM users WHERE id = $1"),
    )

    // Симуляция запроса
    return map[string]string{"name": "Alice", "email": "alice@example.com"}, nil
}

func main() {
    shutdown := initTracer()
    defer shutdown()

    ctx := context.Background()
    user, _ := GetUser(ctx, 42)
    fmt.Println("User:", user)
    // В Jaeger UI увидим: GetUser → db.query с атрибутами
}`,
            explanation: 'tracer.Start() создаёт span. span.End() завершает. Дочерний span наследует context — это создаёт иерархию. В Jaeger UI видно сколько времени занял каждый span.'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Какой тип Prometheus метрики использовать для измерения latency?',
                    options: [
                        'Histogram — показывает распределение и позволяет рассчитать percentiles',
                        'Counter',
                        'Gauge',
                        'Summary'
                    ],
                    correct: 0,
                    explanation: 'Histogram: разбивает значения по buckets. Позволяет рассчитать p50, p95, p99 latency через histogram_quantile в PromQL. Counter только растёт, Gauge — текущее значение.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Distributed tracing решает задачу...',
                    options: [
                        'Отслеживания пути запроса через несколько микросервисов',
                        'Сборки метрик CPU и памяти',
                        'Форматирования логов',
                        'Балансировки нагрузки'
                    ],
                    correct: 0,
                    explanation: 'Distributed tracing: запрос проходит через 5 сервисов — tracing показывает где потрачено время. Без него: видим в логах что запрос медленный, но не знаем в каком сервисе затор.'
                }
            ]
        }
    ]
};
