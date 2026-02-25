export default {
    id: '18-01',
    title: 'Введение в Echo',
    description: 'Почему фреймворки облегчают жизнь, чем Echo лучше net/http, и как построить первое приложение.',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: швейцарский нож vs обычный нож</h2>
                <p>Представьте: вы готовите сложный ужин. Обычный нож (<code>net/http</code>) справится с большинством задач, но для каждой специфической операции (нарезка, открывашка, штопор) нужно искать отдельный инструмент. <strong>Echo</strong> — это швейцарский нож: роутинг, middleware, валидация, JSON — всё готово из коробки, в одном месте, с удобными рукоятями.</p>
                <p>Но и швейцарский нож уступит специализированному инструменту в крайних случаях. Понимать ограничения так же важно, как возможности.</p>

                <h2>Зачем вообще фреймворк?</h2>
                <p>Стандартная библиотека <code>net/http</code> — это Golang-идиоматика в чистом виде. Но реальные проекты требуют:</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Задача</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">net/http (сколько кода)</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Echo (сколько кода)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Параметры пути <code>/users/:id</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">~15 строк (ручной парсинг)</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">1 строка: <code>c.Param("id")</code></td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Bind JSON тела</td>
                            <td style="padding:10px;border:1px solid var(--border)">5-8 строк + обработка ошибок</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">1 строка: <code>c.Bind(&req)</code></td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Middleware (logger, CORS)</td>
                            <td style="padding:10px;border:1px solid var(--border)">Написать с нуля</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">Встроенные, одна строка</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Отправить JSON 200</td>
                            <td style="padding:10px;border:1px solid var(--border)">3 строки (Header + Encode)</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">1 строка: <code>c.JSON(200, obj)</code></td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Группы маршрутов</td>
                            <td style="padding:10px;border:1px solid var(--border)">Нет, вручную</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">Встроено: <code>e.Group("/api")</code></td>
                        </tr>
                    </tbody>
                </table>
                <p>Echo убирает бойлерплейт и позволяет сосредоточиться на бизнес-логике.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Архитектура Echo: жизненный цикл запроса</h2>
                <p>Понимание того, как Echo обрабатывает запрос, критично для правильного использования:</p>
                <ol>
                    <li><strong>Router</strong> — определяет, какой handler вызвать по методу + пути</li>
                    <li><strong>Middleware chain</strong> — цепочка функций, которые выполняются ДО и ПОСЛЕ handler</li>
                    <li><strong>Handler</strong> — ваша бизнес-логика, принимает <code>echo.Context</code></li>
                    <li><strong>echo.Context</strong> — обёртка над <code>*http.Request</code> и <code>http.ResponseWriter</code></li>
                </ol>
                <p>Ключевой объект — <strong>echo.Context</strong>. Это не просто обёртка, это хранилище состояния запроса: параметры пути, query-параметры, тело, пользовательские данные (через <code>c.Set/c.Get</code>), логгер.</p>
            `
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `sequenceDiagram
    participant Client
    participant Router
    participant MW as Middleware Chain
    participant Handler
    participant Response

    Client->>Router: HTTP Request
    Router->>MW: Matched route + params
    MW->>MW: Logger → Recovery → Auth → ...
    MW->>Handler: echo.Context (request + params)
    Handler->>Handler: Бизнес-логика
    Handler->>Response: c.JSON() / c.String()
    Response-->>Client: HTTP Response`,
            caption: 'Жизненный цикл запроса в Echo'
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Установка и инициализация проекта',
            code: `# Новый модуль
mkdir myapp && cd myapp
go mod init myapp

# Установить Echo v4
go get github.com/labstack/echo/v4

# Структура проекта
myapp/
├── main.go
├── handlers/
│   ├── user.go
│   └── product.go
├── middleware/
│   └── auth.go
└── go.mod`,
            explanation: 'Echo v4 — актуальная стабильная версия. Структура проекта: handlers отдельно от main.go — хорошая практика даже для небольших приложений.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Полноценное Echo приложение — Hello World++',
            code: `package main

import (
    "net/http"

    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
)

// Структура для JSON-ответа
type Response struct {
    Message string \`json:"message"\`
    Status  int    \`json:"status"\`
}

func main() {
    // echo.New() создаёт экземпляр Echo с настройками по умолчанию
    // Внутри: radix tree router, пул echo.Context, дефолтный логгер
    e := echo.New()

    // Скрыть баннер (опционально — в проде лучше убрать)
    e.HideBanner = true

    // Глобальные middleware — применяются ко ВСЕМ маршрутам
    e.Use(middleware.Logger())   // логирует каждый запрос
    e.Use(middleware.Recover())  // ловит panic, возвращает 500

    // Простые маршруты
    e.GET("/", func(c echo.Context) error {
        return c.String(http.StatusOK, "Hello, World!")
    })

    // JSON ответ
    e.GET("/health", func(c echo.Context) error {
        return c.JSON(http.StatusOK, Response{
            Message: "ok",
            Status:  200,
        })
    })

    // Параметр пути
    e.GET("/hello/:name", func(c echo.Context) error {
        name := c.Param("name")
        return c.String(http.StatusOK, "Hello, " + name + "!")
    })

    // e.Logger.Fatal = запуск + автоматический Fatal если ошибка
    e.Logger.Fatal(e.Start(":8080"))
}`,
            explanation: 'echo.New() — создаёт готовый к работе инстанс. e.Use() — регистрирует глобальный middleware. e.GET/POST/PUT/DELETE — регистрация маршрутов. e.Start(":8080") — запуск HTTP-сервера. e.Logger.Fatal — если Start вернёт ошибку (порт занят и т.д.), приложение завершится с логом.'
        },
        {
            type: 'theory',
            content: `
                <h2>echo.Context — сердце Echo</h2>
                <p>Каждый handler получает <code>echo.Context</code>. Это интерфейс с богатым API:</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Категория</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Методы</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Пример</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><strong>Параметры</strong></td>
                            <td style="padding:10px;border:1px solid var(--border)">Param, QueryParam, FormValue</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">c.Param("id")</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><strong>Тело запроса</strong></td>
                            <td style="padding:10px;border:1px solid var(--border)">Bind, BindJSON, BindQuery</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">c.Bind(&req)</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><strong>Ответы</strong></td>
                            <td style="padding:10px;border:1px solid var(--border)">JSON, String, HTML, Redirect, NoContent</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">c.JSON(200, obj)</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><strong>Заголовки</strong></td>
                            <td style="padding:10px;border:1px solid var(--border)">Request().Header, Response().Header()</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">c.Request().Header.Get("Auth")</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><strong>Хранилище</strong></td>
                            <td style="padding:10px;border:1px solid var(--border)">Set, Get</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">c.Set("user", u) / c.Get("user")</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><strong>Логгер</strong></td>
                            <td style="padding:10px;border:1px solid var(--border)">Logger()</td>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">c.Logger().Info("done")</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Bind и валидация — получение данных из запроса',
            code: `package main

import (
    "net/http"
    "github.com/labstack/echo/v4"
)

type CreateUserRequest struct {
    Name  string \`json:"name"  form:"name"  query:"name"\`
    Email string \`json:"email" form:"email" query:"email"\`
    Age   int    \`json:"age"   form:"age"   query:"age"\`
}

func createUser(c echo.Context) error {
    req := new(CreateUserRequest)

    // Bind автоматически парсит:
    // - JSON тело (Content-Type: application/json)
    // - Form данные (Content-Type: application/x-www-form-urlencoded)
    // - Query параметры
    if err := c.Bind(req); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": "invalid request body",
        })
    }

    // Проверка обязательных полей
    if req.Name == "" || req.Email == "" {
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": "name and email are required",
        })
    }

    // Сохраняем в БД (условно)
    user := map[string]interface{}{
        "id":    42,
        "name":  req.Name,
        "email": req.Email,
        "age":   req.Age,
    }

    return c.JSON(http.StatusCreated, user)
}

// Тест: curl -X POST http://localhost:8080/users \\
//   -H "Content-Type: application/json" \\
//   -d '{"name":"Alice","email":"alice@example.com","age":30}'`,
            explanation: 'c.Bind — умный биндер: смотрит на Content-Type и автоматически парсит JSON, Form или Query. Теги json/form/query контролируют откуда брать данные. Всегда проверяйте ошибку Bind!'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<p><strong>Важно: Echo vs net/http совместимость</strong></p>
            <p>Echo handler имеет сигнатуру <code>func(echo.Context) error</code>, а не <code>http.HandlerFunc</code>. Для совместимости используйте <code>echo.WrapHandler</code>:</p>
            <pre><code>// Обернуть стандартный net/http handler для Echo
e.GET("/old", echo.WrapHandler(http.HandlerFunc(oldHandler)))</code></pre>
            <p>Это важно при интеграции сторонних middleware, написанных для <code>net/http</code>.</p>`
        },
        {
            type: 'theory',
            content: `
                <h2>HTTP методы и маршруты Echo</h2>
                <p>Echo поддерживает все стандартные HTTP методы и некоторые дополнительные:</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Метод Echo</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">HTTP метод</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Типичное использование</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">e.GET()</td>
                            <td style="padding:10px;border:1px solid var(--border)">GET</td>
                            <td style="padding:10px;border:1px solid var(--border)">Чтение данных</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">e.POST()</td>
                            <td style="padding:10px;border:1px solid var(--border)">POST</td>
                            <td style="padding:10px;border:1px solid var(--border)">Создание ресурса</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">e.PUT()</td>
                            <td style="padding:10px;border:1px solid var(--border)">PUT</td>
                            <td style="padding:10px;border:1px solid var(--border)">Полное обновление</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">e.PATCH()</td>
                            <td style="padding:10px;border:1px solid var(--border)">PATCH</td>
                            <td style="padding:10px;border:1px solid var(--border)">Частичное обновление</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">e.DELETE()</td>
                            <td style="padding:10px;border:1px solid var(--border)">DELETE</td>
                            <td style="padding:10px;border:1px solid var(--border)">Удаление ресурса</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border);color:var(--accent)">e.Any()</td>
                            <td style="padding:10px;border:1px solid var(--border)">Все методы</td>
                            <td style="padding:10px;border:1px solid var(--border)">Webhook endpoints</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'editor',
            title: 'Практика: REST API с Echo',
            instructions: 'Создайте Echo-приложение с CRUD-маршрутами для задач (todos). Реализуйте: GET /todos, POST /todos, GET /todos/:id. Используйте c.Bind для чтения тела и c.JSON для ответа.',
            starterCode: `package main

import (
    "net/http"
    "strconv"

    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
)

type Todo struct {
    ID    int    \`json:"id"\`
    Title string \`json:"title"\`
    Done  bool   \`json:"done"\`
}

var todos = []Todo{
    {1, "Изучить Echo", false},
    {2, "Написать API", false},
}

// TODO: реализуйте listTodos, createTodo, getTodo

func main() {
    e := echo.New()
    e.Use(middleware.Logger())

    // Зарегистрируйте маршруты здесь

    e.Logger.Fatal(e.Start(":8080"))
}`,
            hints: [
                'func listTodos(c echo.Context) error { return c.JSON(http.StatusOK, todos) }',
                'Для POST используйте: req := new(Todo); c.Bind(req)',
                'Для GET /:id: id, _ := strconv.Atoi(c.Param("id"))',
                'Добавляйте todo в слайс: todos = append(todos, *req)',
                'Если todo не найден — return c.JSON(http.StatusNotFound, ...)'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Какой интерфейс принимает каждый Echo handler?',
                    options: ['http.ResponseWriter + *http.Request', 'echo.Context', 'echo.HandlerFunc', 'context.Context'],
                    correct: 1,
                    explanation: 'Все Echo handlers имеют сигнатуру func(echo.Context) error. echo.Context оборачивает стандартные http объекты.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что делает e.Use(middleware.Logger())?',
                    options: [
                        'Логирует только ошибки',
                        'Добавляет глобальный middleware для всех маршрутов',
                        'Включает дебаг-режим',
                        'Регистрирует новый маршрут'
                    ],
                    correct: 1,
                    explanation: 'e.Use() регистрирует глобальный middleware, который выполняется для КАЖДОГО запроса. middleware.Logger() выводит метод, путь, статус и время ответа.'
                },
                {
                    id: 'q3',
                    type: 'code-fill',
                    question: 'Как получить параметр пути :name в Echo handler?',
                    template: 'name := c.____("name")',
                    correct: 'Param',
                    caseSensitive: true,
                    explanation: 'c.Param("name") — получить параметр пути. c.QueryParam — query параметр. c.FormValue — из формы.'
                },
                {
                    id: 'q4',
                    type: 'multiple',
                    question: 'Какие форматы данных умеет парсить c.Bind()?',
                    options: ['JSON (application/json)', 'Form (application/x-www-form-urlencoded)', 'XML', 'Query параметры', 'Multipart form'],
                    correct: [0, 1, 3, 4],
                    explanation: 'c.Bind поддерживает JSON, Form, Query и Multipart form. XML — нет (нужен отдельный биндер).'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Что вернёт handler, если написать: return c.JSON(201, user)?',
                    options: [
                        'Ответ с кодом 201 и user как JSON с правильным Content-Type',
                        'Ответ с кодом 200',
                        'Ошибку компиляции',
                        'Пустой ответ'
                    ],
                    correct: 0,
                    explanation: 'c.JSON(statusCode, obj) автоматически сериализует obj в JSON, устанавливает Content-Type: application/json и HTTP статус код.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Зачем нужен middleware.Recover()?',
                    options: [
                        'Для восстановления БД после краша',
                        'Перехватывает panic в handler и возвращает 500 вместо краша сервера',
                        'Кэширует ответы',
                        'Ограничивает частоту запросов'
                    ],
                    correct: 1,
                    explanation: 'middleware.Recover() (или Recoverer) перехватывает panic внутри handler. Без него один panic убьёт весь сервер. С Recover — запрос получит 500, сервер продолжит работу.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Как обернуть стандартный net/http handler для использования в Echo?',
                    options: [
                        'echo.WrapHandler(http.HandlerFunc(h))',
                        'echo.Convert(h)',
                        'e.Use(h)',
                        'Нельзя — несовместимо'
                    ],
                    correct: 0,
                    explanation: 'echo.WrapHandler позволяет использовать стандартные net/http handler в Echo. Полезно при интеграции сторонних библиотек.'
                },
                {
                    id: 'q8',
                    type: 'multiple',
                    question: 'Что содержит echo.Context?',
                    options: [
                        'Доступ к *http.Request',
                        'Доступ к http.ResponseWriter',
                        'Параметры пути',
                        'Базу данных',
                        'Хранилище ключ-значение через Set/Get'
                    ],
                    correct: [0, 1, 2, 4],
                    explanation: 'echo.Context оборачивает Request и ResponseWriter, содержит параметры пути и хранилище через c.Set/c.Get. БД там нет — её передают через замыкание или dependency injection.'
                }
            ]
        }
    ]
};
