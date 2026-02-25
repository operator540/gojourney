export default {
    id: '18-05',
    title: 'Context в Echo',
    description: 'echo.Context: запрос, ответ, хранение данных, cookies, заголовки',
    estimatedTime: 20,
    xpReward: 18,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>echo.Context — сердце каждого запроса</h2>
                <p><code>echo.Context</code> — интерфейс, который объединяет <strong>запрос</strong> и <strong>ответ</strong> в одном объекте. Каждый обработчик получает его как аргумент <code>c echo.Context</code>.</p>
                <p>Основные группы методов:</p>
                <ul>
                    <li><strong>Чтение запроса:</strong> Param, QueryParam, FormValue, Header, Cookie</li>
                    <li><strong>Запись ответа:</strong> JSON, String, HTML, Redirect, Stream</li>
                    <li><strong>Контекст данных:</strong> Set/Get для передачи данных между middleware</li>
                    <li><strong>HTTP запрос/ответ:</strong> Request(), Response() — нативные объекты</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Чтение данных из запроса',
            code: `package main

import (
    "github.com/labstack/echo/v4"
)

func requestInfoHandler(c echo.Context) error {
    // Path parameters (/users/:id/posts/:postId)
    userID := c.Param("id")
    postID := c.Param("postId")

    // Query parameters (?page=1&size=10&sort=asc)
    page := c.QueryParam("page")
    size := c.QueryParamDefault("size", "10") // с дефолтом
    sort := c.QueryParam("sort")

    // Form data (POST формы)
    username := c.FormValue("username")

    // Headers
    contentType := c.Request().Header.Get("Content-Type")
    userAgent := c.Request().UserAgent()
    clientIP := c.RealIP() // учитывает X-Forwarded-For

    // Метод запроса и путь
    method := c.Request().Method
    path := c.Request().URL.Path

    // Request ID (если middleware RequestID подключён)
    requestID := c.Response().Header().Get(echo.HeaderXRequestID)

    return c.JSON(200, map[string]interface{}{
        "user_id":      userID,
        "post_id":      postID,
        "page":         page,
        "size":         size,
        "sort":         sort,
        "username":     username,
        "content_type": contentType,
        "user_agent":   userAgent,
        "client_ip":    clientIP,
        "method":       method,
        "path":         path,
        "request_id":   requestID,
    })
}

func main() {
    e := echo.New()
    e.GET("/users/:id/posts/:postId", requestInfoHandler)
    e.Start(":8080")
}`,
            explanation: 'QueryParamDefault("size", "10") — возвращает default если параметр не передан. RealIP() умнее Request().RemoteAddr — учитывает прокси заголовки X-Real-IP, X-Forwarded-For.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Отправка ответов',
            code: `package main

import (
    "net/http"

    "github.com/labstack/echo/v4"
)

type User struct {
    ID   int    \`json:"id"\`
    Name string \`json:"name"\`
}

func main() {
    e := echo.New()

    // JSON ответ
    e.GET("/json", func(c echo.Context) error {
        return c.JSON(http.StatusOK, User{ID: 1, Name: "Alice"})
    })

    // JSON массив
    e.GET("/users", func(c echo.Context) error {
        users := []User{{1, "Alice"}, {2, "Bob"}}
        return c.JSON(http.StatusOK, users)
    })

    // Строка
    e.GET("/text", func(c echo.Context) error {
        return c.String(http.StatusOK, "Hello, World!")
    })

    // HTML
    e.GET("/html", func(c echo.Context) error {
        return c.HTML(http.StatusOK, "<h1>Hello</h1>")
    })

    // Редирект
    e.GET("/old-path", func(c echo.Context) error {
        return c.Redirect(http.StatusMovedPermanently, "/new-path")
    })

    // Без тела (204 No Content)
    e.DELETE("/items/:id", func(c echo.Context) error {
        // удаляем элемент...
        return c.NoContent(http.StatusNoContent)
    })

    // Файл
    e.GET("/download", func(c echo.Context) error {
        return c.File("./static/report.pdf")
    })

    // Кастомные заголовки ответа
    e.GET("/custom", func(c echo.Context) error {
        c.Response().Header().Set("X-Custom-Header", "my-value")
        c.Response().Header().Set("Cache-Control", "public, max-age=3600")
        return c.JSON(200, map[string]string{"data": "value"})
    })

    e.Start(":8080")
}`,
            explanation: 'c.JSON() автоматически устанавливает Content-Type: application/json. NoContent(204) — стандартный ответ для DELETE/успешных операций без тела.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Cookies в Echo',
            code: `package main

import (
    "net/http"
    "time"

    "github.com/labstack/echo/v4"
)

func main() {
    e := echo.New()

    // Установить cookie
    e.POST("/login", func(c echo.Context) error {
        cookie := &http.Cookie{
            Name:     "session_id",
            Value:    "abc123xyz",
            Path:     "/",
            MaxAge:   3600 * 24 * 7, // 7 дней
            HttpOnly: true,           // недоступен для JS
            Secure:   true,           // только HTTPS
            SameSite: http.SameSiteLaxMode,
        }
        c.SetCookie(cookie)
        return c.JSON(200, map[string]string{"message": "Logged in"})
    })

    // Прочитать cookie
    e.GET("/profile", func(c echo.Context) error {
        cookie, err := c.Cookie("session_id")
        if err != nil {
            if err == http.ErrNoCookie {
                return c.JSON(http.StatusUnauthorized, map[string]string{
                    "error": "Not authenticated",
                })
            }
            return err
        }
        return c.JSON(200, map[string]string{
            "session": cookie.Value,
            "message": "You are logged in",
        })
    })

    // Удалить cookie (установить прошедший MaxAge)
    e.POST("/logout", func(c echo.Context) error {
        c.SetCookie(&http.Cookie{
            Name:    "session_id",
            Value:   "",
            MaxAge:  -1, // удаляет cookie
            Path:    "/",
            Expires: time.Unix(0, 0),
        })
        return c.JSON(200, map[string]string{"message": "Logged out"})
    })

    e.Start(":8080")
}`,
            explanation: 'HttpOnly=true — cookie недоступен через document.cookie (защита от XSS). Secure=true — только по HTTPS. SameSiteLaxMode — защита от CSRF. MaxAge=-1 удаляет cookie.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Доступ к нативным объектам:</strong> <code>c.Request()</code> возвращает <code>*http.Request</code>, <code>c.Response()</code> возвращает <code>*echo.Response</code> (обёртка над <code>http.ResponseWriter</code>). Всё что можно сделать в net/http — можно сделать через них.</p>`
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Как получить path parameter :id из URL /users/42?',
                    options: [
                        'c.Param("id")',
                        'c.QueryParam("id")',
                        'c.FormValue("id")',
                        'c.Get("id")'
                    ],
                    correct: 0,
                    explanation: 'c.Param("id") — для path parameters (:id в роуте). c.QueryParam — для ?id=42. c.FormValue — для POST форм. c.Get — для данных из middleware.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Как вернуть JSON ответ с кодом 201?',
                    options: [
                        'c.JSON(201, data)',
                        'c.JSON(data, 201)',
                        'c.Status(201).JSON(data)',
                        'c.Response().JSON(201, data)'
                    ],
                    correct: 0,
                    explanation: 'c.JSON(statusCode, data) — первый аргумент код статуса, второй данные. Например c.JSON(http.StatusCreated, user).'
                }
            ]
        }
    ]
};
