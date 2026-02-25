export default {
    id: '18-02',
    title: 'Echo: Роутинг и маршруты',
    description: 'Параметры пути, query-строки, группировка маршрутов, статика и кастомный error handler в Echo.',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: почтовая сортировка</h2>
                <p>Роутинг в Echo — это как сортировочный цех на почте. Приходит посылка (HTTP-запрос) с адресом (URL + метод). Сортировщик (router) читает адрес и направляет её в нужное окно (handler). Без чёткой системы адресов — хаос, посылки теряются.</p>
                <p>Echo использует <strong>radix tree</strong> (сжатое префиксное дерево) для маршрутизации — это O(k) где k — длина пути, независимо от числа маршрутов.</p>

                <h2>Параметры пути — динамические сегменты</h2>
                <p>Параметр пути — часть URL, которая меняется от запроса к запросу:</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Паттерн</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">URL пример</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">c.Param()</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">/users/:id</td>
                            <td style="padding:10px;border:1px solid var(--border)">/users/42</td>
                            <td style="padding:10px;border:1px solid var(--border)">c.Param("id") = "42"</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">/users/:uid/posts/:pid</td>
                            <td style="padding:10px;border:1px solid var(--border)">/users/5/posts/99</td>
                            <td style="padding:10px;border:1px solid var(--border)">uid="5", pid="99"</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">/files/*</td>
                            <td style="padding:10px;border:1px solid var(--border)">/files/a/b/c.txt</td>
                            <td style="padding:10px;border:1px solid var(--border)">c.Param("*") = "a/b/c.txt"</td>
                        </tr>
                    </tbody>
                </table>
                <p><strong>Важно:</strong> параметры всегда строки. Конвертируйте через <code>strconv.Atoi</code>, <code>strconv.ParseFloat</code> и всегда обрабатывайте ошибку.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Параметры пути: правильная обработка',
            code: `package main

import (
    "net/http"
    "strconv"

    "github.com/labstack/echo/v4"
)

type User struct {
    ID    int    \`json:"id"\`
    Name  string \`json:"name"\`
    Email string \`json:"email"\`
}

// Имитация БД
var usersDB = map[int]User{
    1: {1, "Alice", "alice@example.com"},
    2: {2, "Bob", "bob@example.com"},
}

// GET /users/:id
func getUser(c echo.Context) error {
    // Всегда string — конвертируем
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        // Возвращаем 400 если id не число
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": "id must be a number",
        })
    }

    user, ok := usersDB[id]
    if !ok {
        return c.JSON(http.StatusNotFound, map[string]string{
            "error": "user not found",
        })
    }

    return c.JSON(http.StatusOK, user)
}

// GET /users/:uid/posts/:pid
func getUserPost(c echo.Context) error {
    uid, _ := strconv.Atoi(c.Param("uid"))
    pid, _ := strconv.Atoi(c.Param("pid"))

    return c.JSON(http.StatusOK, map[string]int{
        "user_id": uid,
        "post_id": pid,
    })
}

// GET /files/*
func serveFile(c echo.Context) error {
    // Wildcard — всё после /files/
    filePath := c.Param("*")
    return c.String(http.StatusOK, "Serving: " + filePath)
}

func main() {
    e := echo.New()

    e.GET("/users/:id", getUser)
    e.GET("/users/:uid/posts/:pid", getUserPost)
    e.GET("/files/*", serveFile)

    e.Logger.Fatal(e.Start(":8080"))
}`,
            explanation: 'Параметры — всегда строки, конвертация обязательна. Wildcard * захватывает весь оставшийся путь включая слэши. Порядок регистрации важен: специфичные маршруты (/users/me) регистрируйте ДО параметрических (/users/:id).'
        },
        {
            type: 'theory',
            content: `
                <h2>Query параметры — ?key=value</h2>
                <p>Query параметры — это пары ключ=значение после <code>?</code> в URL. Используются для фильтрации, сортировки, пагинации:</p>
                <pre style="background:var(--surface-2);padding:12px;border-radius:6px"><code>GET /users?page=2&limit=10&sort=name&order=asc</code></pre>
                <p>Echo предоставляет несколько методов:</p>
                <ul>
                    <li><code>c.QueryParam("key")</code> — одно значение (строка или "" если нет)</li>
                    <li><code>c.QueryParams()</code> — все параметры как <code>url.Values</code></li>
                    <li><code>c.QueryString()</code> — вся строка после ?</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Query параметры с дефолтными значениями',
            code: `package main

import (
    "net/http"
    "strconv"

    "github.com/labstack/echo/v4"
)

type PaginationParams struct {
    Page  int    \`query:"page"\`
    Limit int    \`query:"limit"\`
    Sort  string \`query:"sort"\`
    Order string \`query:"order"\`
}

// GET /users?page=1&limit=20&sort=name&order=asc
func listUsers(c echo.Context) error {
    // Способ 1: вручную с дефолтами
    pageStr := c.QueryParam("page")
    limitStr := c.QueryParam("limit")
    sort := c.QueryParam("sort")
    order := c.QueryParam("order")

    // Дефолтные значения если параметр не передан
    page := 1
    if pageStr != "" {
        if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
            page = p
        }
    }

    limit := 20
    if limitStr != "" {
        if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
            limit = l
        }
    }

    if sort == "" {
        sort = "id"
    }
    if order == "" || (order != "asc" && order != "desc") {
        order = "asc"
    }

    // Способ 2: через BindQueryParams (чище!)
    var params PaginationParams
    if err := c.Bind(&params); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": "bad params"})
    }

    return c.JSON(http.StatusOK, map[string]interface{}{
        "page":  page,
        "limit": limit,
        "sort":  sort,
        "order": order,
        "data":  []string{"user1", "user2"},
    })
}

// QueryParams — множественные значения
// GET /search?tag=go&tag=backend&tag=api
func search(c echo.Context) error {
    tags := c.QueryParams()["tag"] // []string{"go", "backend", "api"}
    return c.JSON(http.StatusOK, map[string]interface{}{"tags": tags})
}`,
            explanation: 'QueryParam всегда возвращает строку. Если параметра нет — пустая строка "". Всегда задавайте дефолтные значения и валидируйте диапазоны (limit не должен быть 1000000). c.Bind с тегом query — более элегантный способ.'
        },
        {
            type: 'theory',
            content: `
                <h2>Группировка маршрутов — e.Group()</h2>
                <p>Группы позволяют:</p>
                <ul>
                    <li>Объединить маршруты с общим префиксом (<code>/api/v1</code>)</li>
                    <li>Применить middleware только к определённым маршрутам</li>
                    <li>Версионировать API</li>
                </ul>
                <p>Типичная структура production API:</p>
                <pre style="background:var(--surface-2);padding:12px;border-radius:6px"><code>/                     — публичный
/health               — health check
/api/v1/users         — версионированный API
/api/v1/posts
/api/v2/users         — новая версия
/admin/dashboard      — только для админов</code></pre>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Группы маршрутов и версионирование API',
            code: `package main

import (
    "net/http"

    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
)

func main() {
    e := echo.New()

    // Глобальные middleware
    e.Use(middleware.Logger())
    e.Use(middleware.Recover())

    // Публичные маршруты (без auth)
    e.GET("/health", healthHandler)
    e.POST("/login", loginHandler)
    e.POST("/register", registerHandler)

    // API v1 — группа с префиксом /api/v1
    v1 := e.Group("/api/v1")
    v1.Use(AuthMiddleware) // JWT проверка для всей группы

    // Пользователи
    v1.GET("/users", listUsers)
    v1.POST("/users", createUser)
    v1.GET("/users/:id", getUser)
    v1.PUT("/users/:id", updateUser)
    v1.DELETE("/users/:id", deleteUser)

    // Посты внутри v1
    v1.GET("/posts", listPosts)
    v1.POST("/posts", createPost)
    v1.GET("/posts/:id", getPost)

    // Подгруппа для конкретного ресурса
    userPosts := v1.Group("/users/:uid/posts")
    userPosts.GET("/", getUserPosts)
    userPosts.POST("/", createUserPost)

    // API v2 — новая версия с другой логикой
    v2 := e.Group("/api/v2")
    v2.Use(AuthMiddleware)
    v2.Use(RateLimitMiddleware) // дополнительный middleware только для v2
    v2.GET("/users", listUsersV2) // улучшенный endpoint

    // Админ-панель — своя группа с доп. проверкой
    admin := e.Group("/admin")
    admin.Use(AuthMiddleware)
    admin.Use(AdminOnlyMiddleware)
    admin.GET("/dashboard", dashboardHandler)
    admin.GET("/users", adminListUsers)
    admin.DELETE("/users/:id", adminDeleteUser)

    e.Logger.Fatal(e.Start(":8080"))
}

// Stub handlers
func healthHandler(c echo.Context) error {
    return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}
func loginHandler(c echo.Context) error     { return c.String(200, "login") }
func registerHandler(c echo.Context) error  { return c.String(200, "register") }
func listUsers(c echo.Context) error        { return c.String(200, "list users v1") }
func listUsersV2(c echo.Context) error      { return c.String(200, "list users v2") }
func createUser(c echo.Context) error       { return c.String(201, "created") }
func getUser(c echo.Context) error          { return c.String(200, "user") }
func updateUser(c echo.Context) error       { return c.String(200, "updated") }
func deleteUser(c echo.Context) error       { return c.NoContent(204) }
func listPosts(c echo.Context) error        { return c.String(200, "posts") }
func createPost(c echo.Context) error       { return c.String(201, "post created") }
func getPost(c echo.Context) error          { return c.String(200, "post") }
func getUserPosts(c echo.Context) error     { return c.String(200, "user posts") }
func createUserPost(c echo.Context) error   { return c.String(201, "user post created") }
func dashboardHandler(c echo.Context) error { return c.String(200, "admin dashboard") }
func adminListUsers(c echo.Context) error   { return c.String(200, "admin users") }
func adminDeleteUser(c echo.Context) error  { return c.NoContent(204) }

func AuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
    return func(c echo.Context) error {
        token := c.Request().Header.Get("Authorization")
        if token == "" {
            return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
        }
        return next(c)
    }
}
func AdminOnlyMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
    return func(c echo.Context) error { return next(c) }
}
func RateLimitMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
    return func(c echo.Context) error { return next(c) }
}`,
            explanation: 'e.Group("/prefix") — создаёт группу с общим префиксом. .Use() на группе применяет middleware только к маршрутам группы. Вложенные группы (v1.Group) позволяют создавать иерархию. Это ключевой паттерн для production API.'
        },
        {
            type: 'theory',
            content: `
                <h2>Статические файлы и кастомный Error Handler</h2>
                <p>Echo умеет раздавать статику (SPA фронтенды, изображения, CSS) и позволяет полностью контролировать формат ошибок.</p>
                <p><strong>Зачем кастомный error handler?</strong> По умолчанию Echo возвращает ошибки в своём формате. В API лучше возвращать ошибки в едином формате JSON всего приложения.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Статика, SPA и кастомный Error Handler',
            code: `package main

import (
    "net/http"

    "github.com/labstack/echo/v4"
)

// Единый формат ошибки для всего API
type APIError struct {
    Code    int    \`json:"code"\`
    Message string \`json:"message"\`
    Details string \`json:"details,omitempty"\`
}

func customErrorHandler(err error, c echo.Context) {
    code := http.StatusInternalServerError
    message := "internal server error"
    details := ""

    // Echo HTTPError — например, из c.JSON(404, ...)
    if he, ok := err.(*echo.HTTPError); ok {
        code = he.Code
        if msg, ok := he.Message.(string); ok {
            message = msg
        } else {
            message = http.StatusText(code)
        }
    } else {
        // Прочие ошибки — не раскрываем детали клиенту
        details = err.Error() // только в dev режиме!
    }

    // Не отправлять ответ если уже начали писать
    if c.Response().Committed {
        return
    }

    c.Logger().Errorf("error: %v", err)

    if c.Request().Method == http.MethodHead {
        c.NoContent(code)
        return
    }

    c.JSON(code, APIError{
        Code:    code,
        Message: message,
        Details: details,
    })
}

func main() {
    e := echo.New()

    // Подключить кастомный error handler
    e.HTTPErrorHandler = customErrorHandler

    // Статические файлы из директории ./public
    // GET /static/style.css → ./public/style.css
    e.Static("/static", "public")

    // Один файл
    e.File("/favicon.ico", "public/favicon.ico")

    // SPA (Single Page Application) — все пути → index.html
    // ВАЖНО: этот маршрут должен быть ПОСЛЕДНИМ
    e.GET("/app/*", func(c echo.Context) error {
        return c.File("public/index.html")
    })

    // API маршруты
    api := e.Group("/api")
    api.GET("/users", func(c echo.Context) error {
        // Ошибки теперь будут в едином формате
        return echo.NewHTTPError(http.StatusNotFound, "users not found")
    })

    e.Logger.Fatal(e.Start(":8080"))
}`,
            explanation: 'e.HTTPErrorHandler = customErrorHandler — глобальный обработчик всех ошибок. echo.NewHTTPError(code, msg) — создать HTTP ошибку из handler. e.Static(prefix, root) — раздача статических файлов. e.File(path, file) — один конкретный файл. SPA маршрут (*) регистрируйте после API маршрутов.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Подводный камень: статические маршруты vs параметрические</strong></p>
            <p>Echo матчит маршруты в порядке их приоритета, а не регистрации. Но лучше явно регистрировать специфичные маршруты первыми:</p>
            <pre><code>// ПРАВИЛЬНО — /users/me не совпадёт с /:id
e.GET("/users/me", getMeHandler)    // специфичный
e.GET("/users/:id", getUserHandler) // параметрический

// ПРОБЛЕМА — если echo не поддерживает ваш порядок,
// /users/me может совпасть с /:id
e.GET("/users/:id", getUserHandler) // сначала параметрический — плохо!</code></pre>`
        },
        {
            type: 'editor',
            title: 'Практика: Версионированный API',
            instructions: 'Создайте Echo-приложение с двумя версиями API. /api/v1/products — возвращает простой список. /api/v2/products — возвращает с пагинацией через query ?page=1&limit=5. Добавьте кастомный error handler.',
            starterCode: `package main

import (
    "net/http"
    "strconv"

    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
)

type Product struct {
    ID    int    \`json:"id"\`
    Name  string \`json:"name"\`
    Price float64 \`json:"price"\`
}

var products = []Product{
    {1, "Go Book", 29.99},
    {2, "Echo Mug", 12.50},
    {3, "Gopher T-Shirt", 19.99},
    {4, "Keyboard", 89.00},
    {5, "Monitor", 299.00},
}

func main() {
    e := echo.New()
    e.Use(middleware.Logger())

    // TODO: Создайте v1 и v2 группы
    // v1: GET /api/v1/products — возвращает все products
    // v2: GET /api/v2/products?page=1&limit=2 — с пагинацией
    // Добавьте кастомный error handler

    e.Logger.Fatal(e.Start(":8080"))
}`,
            hints: [
                'v1 := e.Group("/api/v1") — создание группы',
                'v1.GET("/products", func(c echo.Context) error { return c.JSON(200, products) })',
                'Для пагинации: page, _ := strconv.Atoi(c.QueryParam("page")); if page < 1 { page = 1 }',
                'Срез для страницы: start := (page-1)*limit; end := start+limit',
                'Проверяйте end <= len(products) перед срезом'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Как получить wildcard параметр из маршрута /files/* ?',
                    options: [
                        'c.Param("*")',
                        'c.Wildcard()',
                        'c.QueryParam("*")',
                        'c.Param("path")'
                    ],
                    correct: 0,
                    explanation: 'c.Param("*") — получить всё что совпало с wildcard *. Например для /files/a/b/c.txt вернёт "a/b/c.txt".'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что делает e.Group("/api/v1")?',
                    options: [
                        'Создаёт группу маршрутов с общим префиксом /api/v1',
                        'Защищает маршруты паролем',
                        'Создаёт новый инстанс Echo',
                        'Регистрирует middleware'
                    ],
                    correct: 0,
                    explanation: 'e.Group(prefix) создаёт группу маршрутов с общим URL-префиксом. Маршруты внутри автоматически получают этот префикс.'
                },
                {
                    id: 'q3',
                    type: 'code-fill',
                    question: 'Как получить query параметр ?limit=10 в Echo?',
                    template: 'limit := c.____("limit")',
                    correct: 'QueryParam',
                    caseSensitive: true,
                    explanation: 'c.QueryParam("key") — возвращает значение query параметра как строку. Пустая строка если параметр не передан.'
                },
                {
                    id: 'q4',
                    type: 'multiple',
                    question: 'Для чего используют e.HTTPErrorHandler?',
                    options: [
                        'Переопределить формат ошибок для всего приложения',
                        'Логировать все ошибки в одном месте',
                        'Вернуть JSON вместо HTML в ошибках',
                        'Перезапустить сервер при ошибке'
                    ],
                    correct: [0, 1, 2],
                    explanation: 'Кастомный error handler позволяет унифицировать формат ошибок, централизованно логировать и возвращать JSON вместо дефолтного HTML Echo.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Как раздать статические файлы из директории ./public по пути /static?',
                    options: [
                        'e.Static("/static", "public")',
                        'e.ServeFiles("/static", "public")',
                        'e.Use(echo.Static("public"))',
                        'e.GET("/static/*", staticHandler)'
                    ],
                    correct: 0,
                    explanation: 'e.Static(urlPrefix, fileSystemRoot) — встроенный метод для раздачи статики. Эффективно маппит URL-путь на файловую систему.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Почему маршрут /users/me нужно регистрировать ДО /users/:id?',
                    options: [
                        'Чтобы "me" не совпало с параметром :id',
                        'Это требование компилятора Go',
                        'Для производительности',
                        'Порядок не важен в Echo'
                    ],
                    correct: 0,
                    explanation: 'Если сначала зарегистрировать /users/:id, маршрутизатор может сопоставить запрос /users/me с параметром id="me". Специфичные маршруты всегда регистрируйте первыми.'
                },
                {
                    id: 'q7',
                    type: 'multiple',
                    question: 'Какие методы возвращает c.QueryParams()?',
                    options: [
                        'map[string]string',
                        'url.Values (map[string][]string)',
                        'Поддерживает множественные значения одного ключа',
                        'Только первое значение каждого ключа'
                    ],
                    correct: [1, 2],
                    explanation: 'c.QueryParams() возвращает url.Values — это map[string][]string. Поддерживает множественные значения: ?tag=go&tag=api даст []string{"go","api"} для ключа "tag".'
                }
            ]
        }
    ]
};
