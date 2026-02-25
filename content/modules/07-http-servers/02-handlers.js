export default {
    id: '07-02',
    title: 'Обработчики запросов',
    description: 'ResponseWriter методы, статус-коды, чтение запроса, паттерны URL, статические файлы',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: официант в ресторане</h2>
                <p>Каждый HTTP-обработчик — это официант, который:</p>
                <ol>
                    <li><strong>Получает заказ</strong> — читает <code>*http.Request</code> (метод, URL, заголовки, тело)</li>
                    <li><strong>Готовит ответ</strong> — обрабатывает данные, обращается к БД</li>
                    <li><strong>Подаёт блюдо</strong> — пишет в <code>http.ResponseWriter</code> (статус, заголовки, тело)</li>
                </ol>
                <p>Важное правило официанта: <strong>сначала скажи что несёшь, потом неси</strong>. В HTTP: сначала установи заголовки и статус-код, потом пиши тело.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>ResponseWriter — три метода в правильном порядке</h2>
                <table style="width:100%;border-collapse:collapse;margin:12px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Метод</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Что делает</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Порядок</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>Header().Set(k, v)</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Устанавливает HTTP-заголовок</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">1-й</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>WriteHeader(code)</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Отправляет статус-код (по умолчанию 200)</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">2-й</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>Write([]byte)</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Пишет тело ответа</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">3-й</td>
                        </tr>
                    </tbody>
                </table>
                <p><strong>После WriteHeader</strong> нельзя изменить заголовки — они уже отправлены клиенту.<br>
                <strong>После Write</strong> нельзя изменить статус — WriteHeader вызывается автоматически с 200 при первом Write.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'ResponseWriter в действии',
            code: `package main

import (
    "encoding/json"
    "net/http"
)

func createUserHandler(w http.ResponseWriter, r *http.Request) {
    // ШАГ 1: Устанавливаем заголовки
    w.Header().Set("Content-Type", "application/json")
    w.Header().Set("X-Request-ID", "req-001")
    w.Header().Add("Cache-Control", "no-store")   // Add добавляет, Set заменяет

    // ШАГ 2: Устанавливаем статус-код
    w.WriteHeader(http.StatusCreated)  // 201

    // ШАГ 3: Пишем тело
    json.NewEncoder(w).Encode(map[string]any{
        "id":    42,
        "name":  "Alice",
        "email": "alice@example.com",
    })
}

// Хелперы для типичных ответов — выноси в отдельный файл
func writeJSON(w http.ResponseWriter, status int, v any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    if err := json.NewEncoder(w).Encode(v); err != nil {
        // Логируй ошибку, но не пытайся изменить ответ — уже отправлен
        return
    }
}

func writeError(w http.ResponseWriter, status int, message string) {
    writeJSON(w, status, map[string]string{
        "error": message,
    })
}

// Использование хелперов
func getUserHandler(w http.ResponseWriter, r *http.Request) {
    user, err := findUser(1)
    if err != nil {
        writeError(w, http.StatusNotFound, "пользователь не найден")
        return  // Важно: return после writeError!
    }
    writeJSON(w, http.StatusOK, user)
}`,
            explanation: `
                <p><strong>Частая ошибка:</strong> забыть <code>return</code> после ошибки. Без return код продолжит выполнение и попытается вызвать WriteHeader повторно — Go запишет предупреждение в лог.</p>
                <p><code>json.NewEncoder(w).Encode(v)</code> — потоковая запись, без промежуточного буфера. Эффективнее чем <code>json.Marshal</code> + <code>w.Write()</code>.</p>
                <p>Выноси writeJSON/writeError в общий пакет — это устраняет дублирование во всех обработчиках.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Коды статусов HTTP — что когда возвращать</h2>
                <table style="width:100%;border-collapse:collapse;margin:12px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Код</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Константа Go</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Когда использовать</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">200</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>StatusOK</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Успешный GET/PUT/PATCH</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">201</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>StatusCreated</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Успешный POST, ресурс создан</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">204</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>StatusNoContent</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">DELETE, PUT без тела ответа</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">400</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>StatusBadRequest</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Невалидный JSON, отсутствуют поля</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">401</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>StatusUnauthorized</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Нет токена или токен невалиден</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">403</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>StatusForbidden</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Нет прав (авторизован, но запрещено)</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">404</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>StatusNotFound</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Ресурс не найден</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">405</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>StatusMethodNotAllowed</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Метод не поддерживается</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">422</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>StatusUnprocessableEntity</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">JSON валиден, но данные некорректны</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">500</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>StatusInternalServerError</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Непредвиденная ошибка на сервере</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Чтение HTTP-запроса — все источники данных',
            code: `package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

// Запрос: POST /api/users/42?verbose=true
// Headers: Authorization: Bearer token123, Content-Type: application/json
// Body: {"name": "Alice", "email": "alice@example.com"}

type UpdateUserRequest struct {
    Name  string \`json:"name"\`
    Email string \`json:"email"\`
}

func updateUserHandler(w http.ResponseWriter, r *http.Request) {
    // 1. Метод запроса
    fmt.Println("Метод:", r.Method)             // POST

    // 2. URL компоненты
    fmt.Println("Путь:", r.URL.Path)            // /api/users/42
    fmt.Println("Query:", r.URL.RawQuery)       // verbose=true
    fmt.Println("Host:", r.Host)               // localhost:8080

    // 3. Query параметры
    verbose := r.URL.Query().Get("verbose")     // "true"
    page := r.URL.Query().Get("page")           // "" (отсутствует)
    tags := r.URL.Query()["tag"]               // []string{"go","web"} для ?tag=go&tag=web

    // 4. Заголовки (case-insensitive)
    auth := r.Header.Get("Authorization")       // "Bearer token123"
    ct := r.Header.Get("Content-Type")         // "application/json"
    ua := r.Header.Get("User-Agent")

    // 5. Параметр пути (Go 1.22+)
    id := r.PathValue("id")                    // "42" (из /users/{id})

    // 6. Адрес клиента
    fmt.Println("RemoteAddr:", r.RemoteAddr)   // "127.0.0.1:54321"

    // 7. Тело запроса (JSON)
    var req UpdateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "invalid JSON: "+err.Error(), http.StatusBadRequest)
        return
    }
    defer r.Body.Close()  // Всегда закрывай Body

    fmt.Printf("Обновляем пользователя %s: name=%s, verbose=%s, tags=%v, auth=%s, ct=%s, ua=%s, page=%s",
        id, req.Name, verbose, tags, auth, ct, ua, page)

    writeJSON(w, http.StatusOK, map[string]any{"id": id, "name": req.Name})
}`,
            explanation: `
                <p><strong>r.URL.Query()</strong> — парсит query string один раз и возвращает <code>url.Values</code> (map[string][]string). Всегда используй <code>.Get()</code> для первого значения или <code>["key"]</code> для всех значений.</p>
                <p><strong>r.PathValue("id")</strong> — только Go 1.22+. Для старых версий или chi используй <code>chi.URLParam(r, "id")</code>.</p>
                <p><strong>defer r.Body.Close()</strong> — обязателен для освобождения ресурсов соединения. Без него возможна утечка горутин при keep-alive соединениях.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Проверка метода и паттерн Router по методам',
            code: `package main

import (
    "net/http"
)

// Старый способ (Go < 1.22): ручная проверка метода
func usersHandlerLegacy(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case http.MethodGet:
        listUsers(w, r)
    case http.MethodPost:
        createUser(w, r)
    default:
        // 405 с заголовком Allow — стандарт RFC 7231
        w.Header().Set("Allow", "GET, POST")
        http.Error(w, "метод не поддерживается", http.StatusMethodNotAllowed)
    }
}

// Новый способ (Go 1.22+): метод в маршруте
func setupRoutesModern(mux *http.ServeMux) {
    mux.HandleFunc("GET /users",          listUsers)
    mux.HandleFunc("POST /users",         createUser)
    mux.HandleFunc("GET /users/{id}",     getUser)
    mux.HandleFunc("PUT /users/{id}",     updateUser)
    mux.HandleFunc("DELETE /users/{id}",  deleteUser)

    // Wildcard путь (Go 1.22+)
    mux.HandleFunc("GET /files/{path...}", serveFile)
}

// Статические файлы
func setupStaticFiles(mux *http.ServeMux) {
    // Файлы из папки ./static
    fileServer := http.FileServer(http.Dir("./static"))
    mux.Handle("/static/", http.StripPrefix("/static/", fileServer))

    // SPA: все пути → index.html (кроме /api/)
    mux.Handle("/", http.FileServer(http.Dir("./dist")))
}`,
            explanation: `
                <p>Go 1.22+ делает ServeMux конкурентом chi для большинства задач. Метод в шаблоне автоматически возвращает 405 при несовпадении метода.</p>
                <p><code>http.StripPrefix</code> убирает префикс перед поиском файла: запрос <code>/static/css/app.css</code> ищет файл <code>./static/css/app.css</code>.</p>
                <p><code>{path...}</code> — wildcard: захватывает оставшуюся часть пути включая слеши.</p>
            `
        },
        {
            type: 'info-box',
            variant: 'danger',
            content: `
                <p><strong>Классическая ошибка: изменение заголовков после Write</strong></p>
                <pre style="background:rgba(0,0,0,0.3);padding:10px;border-radius:4px;margin:8px 0"><code>// НЕПРАВИЛЬНО:
w.Write([]byte("hello"))
w.Header().Set("Content-Type", "application/json")  // Уже поздно!
w.WriteHeader(201)  // Уже поздно — 200 отправлен при Write!

// ПРАВИЛЬНО:
w.Header().Set("Content-Type", "application/json")
w.WriteHeader(201)
w.Write([]byte("hello"))</code></pre>
                <p>Go запишет в лог: <em>"superfluous response.WriteHeader call"</em>. Клиент получит заголовки по умолчанию и код 200 вместо 201.</p>
            `
        },
        {
            type: 'editor',
            title: 'Практика: CRUD обработчики',
            instructions: 'Реализуйте in-memory хранилище задач с обработчиком /tasks:\n- GET /tasks — список всех задач (JSON)\n- POST /tasks — создать задачу (принять JSON, вернуть 201 с созданной задачей)\n\nИспользуй sync.Mutex для потокобезопасности.',
            starterCode: `package main

import (
    "encoding/json"
    "net/http"
    "sync"
)

type Task struct {
    ID    int    \`json:"id"\`
    Title string \`json:"title"\`
    Done  bool   \`json:"done"\`
}

var (
    tasks  []Task
    mu     sync.Mutex
    nextID = 1
)

func tasksHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")

    switch r.Method {
    case http.MethodGet:
        // Верни список задач
        // mu.Lock() / defer mu.Unlock() для потокобезопасности

    case http.MethodPost:
        // Декодируй JSON тело
        // Добавь задачу с nextID, верни 201

    default:
        w.Header().Set("Allow", "GET, POST")
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
    }
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/tasks", tasksHandler)
    http.ListenAndServe(":8080", mux)
}`,
            hints: [
                'GET: mu.Lock(); defer mu.Unlock(); json.NewEncoder(w).Encode(tasks)',
                'POST: var t Task; json.NewDecoder(r.Body).Decode(&t); defer r.Body.Close()',
                'mu.Lock(); t.ID = nextID; nextID++; tasks = append(tasks, t); mu.Unlock()',
                'w.WriteHeader(http.StatusCreated); json.NewEncoder(w).Encode(t)',
                'Тест: curl -X POST -H "Content-Type: application/json" -d \'{"title":"Buy milk"}\' http://localhost:8080/tasks'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что произойдёт если вызвать w.WriteHeader(201) после w.Write([]byte("data"))?',
                    options: [
                        'WriteHeader будет проигнорирован, клиент получит код 200',
                        'Код ответа изменится на 201',
                        'Ошибка компиляции',
                        'Паника в runtime'
                    ],
                    correct: 0,
                    explanation: 'При первом вызове Write Go автоматически вызывает WriteHeader(200). Последующий вызов WriteHeader игнорируется и логируется как "superfluous response.WriteHeader call".'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Как получить query параметр ?page=2 из запроса?',
                    options: [
                        'r.URL.Query().Get("page")',
                        'r.Query("page")',
                        'r.URL.Params["page"]',
                        'r.FormValue("page")'
                    ],
                    correct: 0,
                    explanation: 'r.URL.Query() парсит query string и возвращает url.Values. .Get("key") возвращает первое значение или пустую строку. r.FormValue тоже работает, но это для form-данных.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Какой статус-код вернуть после успешного создания ресурса через POST?',
                    options: [
                        '201 Created',
                        '200 OK',
                        '204 No Content',
                        '202 Accepted'
                    ],
                    correct: 0,
                    explanation: '201 Created — стандарт для успешного POST, когда ресурс создан. 200 OK — для GET/PUT. 204 — когда ресурс обновлён/удалён без тела ответа.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Зачем defer r.Body.Close() в обработчике?',
                    options: [
                        'Освобождение ресурсов TCP-соединения, предотвращение утечки горутин',
                        'Очистка памяти от данных запроса',
                        'Обязательное требование компилятора',
                        'Автоматически закрывает соединение с клиентом'
                    ],
                    correct: 0,
                    explanation: 'r.Body — io.ReadCloser поверх сетевого соединения. Без Close() буфер не освободится, а при keep-alive соединениях горутина может "зависнуть".'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Что делает http.StripPrefix("/static/", handler)?',
                    options: [
                        'Убирает "/static/" из URL перед передачей следующему обработчику',
                        'Удаляет HTTP-заголовки с префиксом',
                        'Блокирует запросы к /static/',
                        'Добавляет CORS заголовки'
                    ],
                    correct: 0,
                    explanation: 'StripPrefix убирает префикс из пути. Запрос /static/css/app.css → FileServer получает /css/app.css → ищет файл ./static/css/app.css.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Разница между 401 Unauthorized и 403 Forbidden:',
                    options: [
                        '401 — нет токена/невалиден; 403 — токен валиден, но нет прав',
                        '401 — нет прав; 403 — неверный пароль',
                        'Это одинаковые коды',
                        '401 для API, 403 для веб-страниц'
                    ],
                    correct: 0,
                    explanation: '401 (Unauthorized) означает "не аутентифицирован" — нужно войти в систему. 403 (Forbidden) — "аутентифицирован, но нет доступа" — например, обычный пользователь запрашивает admin-ресурс.'
                }
            ]
        }
    ]
};
