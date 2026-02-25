export default {
    id: '07-01',
    title: 'Пакет net/http',
    description: 'ListenAndServe, интерфейс Handler, ServeMux, graceful shutdown — фундамент любого Go-сервера',
    estimatedTime: 35,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: почтовое отделение</h2>
                <p>Представь HTTP-сервер как почтовое отделение:</p>
                <ul>
                    <li><strong>ListenAndServe</strong> — открываем отделение по адресу (порту)</li>
                    <li><strong>ServeMux</strong> — стойка администратора, которая направляет письма (запросы) нужному окошку</li>
                    <li><strong>Handler</strong> — конкретное окошко, которое обрабатывает запрос</li>
                    <li><strong>http.Request</strong> — само письмо (содержимое, адрес, отправитель)</li>
                    <li><strong>http.ResponseWriter</strong> — конверт с ответом</li>
                </ul>
                <p>Go <strong>не требует</strong> внешних фреймворков — стандартный <code>net/http</code> используется в продакшене крупнейших компаний: Google, Cloudflare, Dropbox.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Зачем net/http, а не фреймворк?</h2>
                <table style="width:100%;border-collapse:collapse;margin:12px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Критерий</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">net/http</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Express (Node)</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">FastAPI (Python)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Зависимости</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">0 (стандартная библиотека)</td>
                            <td style="padding:10px;border:1px solid var(--border)">~50 пакетов</td>
                            <td style="padding:10px;border:1px solid var(--border)">~20 пакетов</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Производительность</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">Очень высокая</td>
                            <td style="padding:10px;border:1px solid var(--border)">Средняя</td>
                            <td style="padding:10px;border:1px solid var(--border)">Низкая</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">URL-параметры</td>
                            <td style="padding:10px;border:1px solid var(--border)">Go 1.22+ (ранее — нет)</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">Из коробки</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">Из коробки</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Middleware</td>
                            <td style="padding:10px;border:1px solid var(--border)">Ручная цепочка</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">app.use()</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">Декораторы</td>
                        </tr>
                    </tbody>
                </table>
                <p><strong>Вывод:</strong> net/http — основа. Для сложного роутинга добавляем <strong>chi</strong> (минимальная зависимость, 100% совместима с net/http).</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Минимальный рабочий сервер',
            code: `package main

import (
    "fmt"
    "net/http"
)

func main() {
    // HandleFunc регистрирует обработчик в DefaultServeMux
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Hello, Go server! Метод: %s, Путь: %s", r.Method, r.URL.Path)
    })

    http.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("pong"))
    })

    fmt.Println("Сервер запущен на :8080")

    // nil = использовать DefaultServeMux
    // Блокирует выполнение до ошибки
    if err := http.ListenAndServe(":8080", nil); err != nil {
        panic(err)
    }
}`,
            explanation: `
                <p><code>http.HandleFunc</code> регистрирует обработчик в глобальном <strong>DefaultServeMux</strong>.</p>
                <p><code>http.ListenAndServe(addr, handler)</code> — блокирующий вызов. Возвращает ошибку только при критическом сбое (порт занят, нет прав).</p>
                <p><strong>Проблема DefaultServeMux</strong>: он глобальный — любая импортированная библиотека может зарегистрировать в нём обработчики. Лучше создавать свой <code>http.NewServeMux()</code>.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Интерфейс http.Handler — сердце net/http</h2>
                <p>Весь net/http построен на одном интерфейсе:</p>
                <pre style="background:var(--surface-2);padding:12px;border-radius:6px;border-left:3px solid var(--accent)"><code>type Handler interface {
    ServeHTTP(ResponseWriter, *Request)
}</code></pre>
                <p>Любой тип, реализующий этот метод, является Handler-ом. Это даёт возможность:</p>
                <ul>
                    <li>Передавать <strong>состояние</strong> в обработчик (DB-соединение, конфиг, логгер)</li>
                    <li>Строить <strong>middleware</strong> — обёртки над Handler</li>
                    <li>Использовать <strong>http.HandlerFunc</strong> — тип-адаптер для функции</li>
                </ul>
                <table style="width:100%;border-collapse:collapse;margin:12px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Способ</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Когда использовать</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>http.HandlerFunc(fn)</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Простая функция, нет состояния</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>struct + ServeHTTP</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Нужен доступ к DB, конфигу, зависимостям</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Handler через структуру — передаём зависимости',
            code: `package main

import (
    "encoding/json"
    "net/http"
    "time"
)

// Handler как структура: держит зависимости
type TimeHandler struct {
    format   string
    location *time.Location
}

func (h *TimeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    now := time.Now().In(h.location)
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "time":     now.Format(h.format),
        "timezone": h.location.String(),
    })
}

// Handler для работы с БД (паттерн dependency injection)
type UserHandler struct {
    db     *sql.DB
    logger *slog.Logger
}

func (h *UserHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    rows, err := h.db.Query("SELECT id, name FROM users")
    if err != nil {
        h.logger.Error("db query failed", "err", err)
        http.Error(w, "internal error", http.StatusInternalServerError)
        return
    }
    defer rows.Close()
    // ...
}

func main() {
    mux := http.NewServeMux()  // Создаём свой ServeMux, не глобальный!

    moscow, _ := time.LoadLocation("Europe/Moscow")
    mux.Handle("/time", &TimeHandler{
        format:   "2006-01-02 15:04:05",
        location: moscow,
    })

    // Функция как Handler через HandleFunc
    mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte(\`{"status":"ok"}\`))
    })

    http.ListenAndServe(":8080", mux)
}`,
            explanation: `
                <p>Структура с <code>ServeHTTP</code> — полноценный Handler. Зависимости (DB, конфиг, логгер) передаём через поля структуры.</p>
                <p>Это называется <strong>Dependency Injection</strong> — вместо глобальных переменных передаём зависимости явно. Упрощает тестирование: заменяем реальную БД на mock.</p>
                <p><code>http.NewServeMux()</code> вместо DefaultServeMux — изолированный мультиплексор, не подвержен загрязнению из других пакетов.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>ServeMux — правила маршрутизации</h2>
                <p>ServeMux матчит запрос по наиболее длинному подходящему шаблону:</p>
                <table style="width:100%;border-collapse:collapse;margin:12px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Шаблон</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Тип</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Матчит</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>/api/users</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Точный</td>
                            <td style="padding:10px;border:1px solid var(--border)">Только /api/users</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>/api/</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Префиксный</td>
                            <td style="padding:10px;border:1px solid var(--border)">/api/, /api/users, /api/x/y</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>GET /users/{id}</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Метод+параметр (Go 1.22+)</td>
                            <td style="padding:10px;border:1px solid var(--border)">GET /users/42, GET /users/alice</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>/</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Catch-all</td>
                            <td style="padding:10px;border:1px solid var(--border)">Всё, что не совпало</td>
                        </tr>
                    </tbody>
                </table>
                <p><strong>Приоритет:</strong> Более длинный шаблон побеждает. <code>/api/users</code> выиграет у <code>/api/</code>.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Продакшен-сервер с таймаутами',
            code: `package main

import (
    "context"
    "fmt"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"
)

func main() {
    mux := http.NewServeMux()

    mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        w.Write([]byte(\`{"status":"ok"}\`))
    })

    mux.HandleFunc("GET /users/{id}", func(w http.ResponseWriter, r *http.Request) {
        id := r.PathValue("id")  // Go 1.22+
        fmt.Fprintf(w, "User ID: %s", id)
    })

    // Всегда используй &http.Server — не http.ListenAndServe напрямую!
    server := &http.Server{
        Addr:    ":8080",
        Handler: mux,

        // Таймауты — защита от медленных клиентов (Slowloris атака)
        ReadTimeout:       5 * time.Second,   // чтение заголовков + тела
        ReadHeaderTimeout: 2 * time.Second,   // только заголовки
        WriteTimeout:      10 * time.Second,  // запись ответа
        IdleTimeout:       60 * time.Second,  // keep-alive соединение
        MaxHeaderBytes:    1 << 20,           // 1 MB — максимум заголовков
    }

    // Запускаем в горутине — не блокируем main
    go func() {
        fmt.Println("Сервер запущен на :8080")
        if err := server.ListenAndServe(); err != http.ErrServerClosed {
            fmt.Printf("Критическая ошибка: %v\\n", err)
            os.Exit(1)
        }
    }()

    // Ожидаем Ctrl+C или kill
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    sig := <-quit
    fmt.Printf("\\nПолучен сигнал: %v. Останавливаемся...\\n", sig)

    // Даём 30 секунд на завершение текущих запросов
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := server.Shutdown(ctx); err != nil {
        fmt.Printf("Принудительная остановка: %v\\n", err)
    }
    fmt.Println("Сервер остановлен")
}`,
            explanation: `
                <p><strong>Почему таймауты обязательны:</strong> без <code>ReadTimeout</code> злоумышленник может отправить запрос очень медленно (Slowloris), заморозив тысячи горутин.</p>
                <p><strong>Graceful shutdown</strong> — вместо резкой остановки (kill -9) ждём завершения текущих запросов. Критично для транзакций и long-polling.</p>
                <p><code>http.ErrServerClosed</code> — нормальная ошибка при вызове <code>Shutdown()</code>. Её не нужно логировать как критическую.</p>
            `
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `
                <p><strong>Никогда не используй http.ListenAndServe в продакшене напрямую!</strong></p>
                <p>Проблемы http.ListenAndServe без структуры &http.Server:</p>
                <ul>
                    <li>Нет таймаутов — уязвим к Slowloris</li>
                    <li>Нет Graceful Shutdown — запросы обрываются резко</li>
                    <li>Нет контроля MaxHeaderBytes</li>
                </ul>
                <p>Всегда создавай <code>&http.Server{...}</code> с явными таймаутами.</p>
            `
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `
                <p><strong>Go 1.22+ значительно улучшил ServeMux:</strong></p>
                <ul>
                    <li>Метод в шаблоне: <code>"GET /users/{id}"</code></li>
                    <li>Параметры пути: <code>r.PathValue("id")</code></li>
                    <li>Wildcard: <code>"GET /files/{path...}"</code></li>
                </ul>
                <p>Для Go < 1.22 или сложных сценариев используй <strong>chi</strong> — он покрывает оба случая.</p>
            `
        },
        {
            type: 'editor',
            title: 'Практика: API с health и version',
            instructions: 'Создайте сервер с двумя эндпоинтами через собственный ServeMux (не DefaultServeMux):\n- GET /health → {"status":"ok","uptime":"..."}\n- GET /version → {"version":"1.0.0","go_version":"go1.22"}\n\nЗапомните время старта (time.Now() в main) и считайте uptime в обработчике.',
            starterCode: `package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

// Храним время старта сервера
var startTime time.Time

func healthHandler(w http.ResponseWriter, r *http.Request) {
    // Установите Content-Type: application/json
    // Верните JSON с полями status и uptime
    // uptime = time.Since(startTime).String()
}

func versionHandler(w http.ResponseWriter, r *http.Request) {
    // Верните JSON с version и go_version
}

func main() {
    startTime = time.Now()

    // Создайте mux := http.NewServeMux()
    // Зарегистрируйте обработчики
    // Запустите сервер на :8080

    fmt.Println("Server started on :8080")
}`,
            hints: [
                'mux := http.NewServeMux() — создай свой мультиплексор',
                'w.Header().Set("Content-Type", "application/json")',
                'json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": time.Since(startTime).String()})',
                'http.ListenAndServe(":8080", mux) — передай mux вторым аргументом',
                'Тест: curl http://localhost:8080/health'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что означает nil вторым аргументом в http.ListenAndServe(":8080", nil)?',
                    options: [
                        'Использовать глобальный DefaultServeMux',
                        'Не использовать обработчиков',
                        'Отключить маршрутизацию',
                        'Это ошибка компиляции'
                    ],
                    correct: 0,
                    explanation: 'nil означает использование http.DefaultServeMux — глобального мультиплексора. Лучше передавать явно созданный http.NewServeMux() для изоляции.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Какой метод должен реализовывать тип, чтобы быть http.Handler?',
                    options: [
                        'ServeHTTP(ResponseWriter, *Request)',
                        'Handle(string, Handler)',
                        'Listen(string) error',
                        'Serve(*Request) Response'
                    ],
                    correct: 0,
                    explanation: 'Интерфейс http.Handler содержит ровно один метод: ServeHTTP(ResponseWriter, *Request). Любой тип с этим методом автоматически реализует интерфейс.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Зачем нужны таймауты ReadTimeout и WriteTimeout в http.Server?',
                    options: [
                        'Защита от медленных клиентов и Slowloris-атак',
                        'Ускорение обработки запросов',
                        'Обязательное требование Go runtime',
                        'Только для HTTPS-серверов'
                    ],
                    correct: 0,
                    explanation: 'Без таймаутов медленный клиент держит соединение бесконечно. При тысячах таких клиентов сервер исчерпает горутины. Это классическая Slowloris-атака.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Маршрут "/api/" (с trailing slash) в ServeMux означает:',
                    options: [
                        'Префиксный матчинг: /api/, /api/users, /api/v1/anything',
                        'Точное совпадение только с /api/',
                        'Матчит /api без слеша',
                        'Wildcard для всех методов'
                    ],
                    correct: 0,
                    explanation: 'Trailing slash в ServeMux создаёт префиксный маршрут. Без слеша — точное совпадение. "/api/" матчит всё, что начинается с /api/.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Почему лучше создавать http.NewServeMux() вместо использования DefaultServeMux?',
                    options: [
                        'DefaultServeMux глобальный — любой пакет может зарегистрировать свои маршруты',
                        'DefaultServeMux медленнее',
                        'DefaultServeMux не поддерживает POST',
                        'NewServeMux поддерживает больше маршрутов'
                    ],
                    correct: 0,
                    explanation: 'DefaultServeMux — глобальная переменная пакета net/http. Любая импортированная библиотека (например, pprof) автоматически регистрирует в нём обработчики. Это угроза безопасности.'
                },
                {
                    id: 'q6',
                    type: 'code-fill',
                    question: 'Как зарегистрировать обработчик только для GET-запросов в Go 1.22+?',
                    code: 'mux.HandleFunc(_____, handler)',
                    answer: '"GET /users"',
                    explanation: 'В Go 1.22+ ServeMux поддерживает метод в шаблоне: "METHOD /path". При запросе другим методом вернётся 405 Method Not Allowed автоматически.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Что такое Graceful Shutdown?',
                    options: [
                        'Остановка сервера после завершения текущих запросов',
                        'Автоматический перезапуск при ошибке',
                        'Плавное увеличение нагрузки при старте',
                        'Логирование всех ошибок перед остановкой'
                    ],
                    correct: 0,
                    explanation: 'server.Shutdown(ctx) перестаёт принимать новые соединения и ждёт завершения активных запросов. Важно для баз данных и транзакций.'
                }
            ]
        }
    ]
};
