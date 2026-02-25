export default {
    id: '22-05',
    title: 'Ответы и обработка ошибок в Gin',
    description: 'JSON, XML, файлы, редиректы, централизованная обработка ошибок',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `<h2>Форматы ответов в Gin</h2>
<p>Gin поддерживает множество форматов ответов. Правильно структурированные ответы — признак профессионального API.</p>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Все форматы ответов',
            code: `func main() {
    r := gin.Default()

    // ─── JSON (самый частый) ─────────────────────
    r.GET("/json", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "hello",
            "count":   42,
        })
    })

    // ─── Структура вместо gin.H ──────────────────
    r.GET("/user", func(c *gin.Context) {
        type User struct {
            ID   int    \`json:"id"\`
            Name string \`json:"name"\`
        }
        c.JSON(200, User{ID: 1, Name: "Alice"})
    })

    // ─── IndentedJSON — красивый для дебага ──────
    r.GET("/pretty", func(c *gin.Context) {
        c.IndentedJSON(200, gin.H{"data": "pretty printed"})
    })

    // ─── XML ─────────────────────────────────────
    r.GET("/xml", func(c *gin.Context) {
        type Resp struct {
            Message string \`xml:"message"\`
        }
        c.XML(200, Resp{Message: "hello xml"})
    })

    // ─── Строка ──────────────────────────────────
    r.GET("/text", func(c *gin.Context) {
        c.String(200, "Hello, %s!", "World")
    })

    // ─── HTML ─────────────────────────────────────
    r.LoadHTMLGlob("templates/*")
    r.GET("/page", func(c *gin.Context) {
        c.HTML(200, "index.html", gin.H{
            "title": "My Page",
        })
    })

    // ─── Файл ─────────────────────────────────────
    r.GET("/download", func(c *gin.Context) {
        c.File("./files/report.pdf")
        // Или с принудительным скачиванием:
        // c.FileAttachment("./files/report.pdf", "report.pdf")
    })

    // ─── Редирект ─────────────────────────────────
    r.GET("/old", func(c *gin.Context) {
        c.Redirect(http.StatusMovedPermanently, "/new")
    })

    r.Run(":8080")
}`,
            explanation: 'gin.H — это map[string]interface{}. Для production используй структуры со json-тегами — это даёт контроль над именами полей и скрывает лишнее. IndentedJSON удобен для дебага но медленнее — не используй в production.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Стандартная структура API-ответа',
            code: `// ─── Единый формат ответов ──────────────────────
type Response struct {
    Success bool        \`json:"success"\`
    Data    interface{} \`json:"data,omitempty"\`
    Error   string      \`json:"error,omitempty"\`
    Meta    *Meta       \`json:"meta,omitempty"\`
}

type Meta struct {
    Page    int \`json:"page"\`
    Limit   int \`json:"limit"\`
    Total   int \`json:"total"\`
}

// Хелперы
func OK(c *gin.Context, data interface{}) {
    c.JSON(http.StatusOK, Response{Success: true, Data: data})
}

func Created(c *gin.Context, data interface{}) {
    c.JSON(http.StatusCreated, Response{Success: true, Data: data})
}

func BadRequest(c *gin.Context, msg string) {
    c.JSON(http.StatusBadRequest, Response{Success: false, Error: msg})
}

func NotFound(c *gin.Context, msg string) {
    c.JSON(http.StatusNotFound, Response{Success: false, Error: msg})
}

func InternalError(c *gin.Context) {
    c.JSON(http.StatusInternalServerError, Response{
        Success: false,
        Error:   "internal server error",
    })
}

// Использование в хендлере:
func GetUser(c *gin.Context) {
    id := c.Param("id")
    user, err := db.FindUser(id)
    if err != nil {
        if errors.Is(err, ErrNotFound) {
            NotFound(c, "user not found")
            return
        }
        InternalError(c)
        return
    }
    OK(c, user)
}`,
            explanation: 'Единый формат ответов — стандарт в production API. Клиент всегда знает чего ожидать. omitempty скрывает пустые поля — ответ об ошибке не будет содержать null data, успешный — не будет содержать пустой error.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Централизованная обработка ошибок',
            code: `// ─── Кастомные типы ошибок ─────────────────────
type AppError struct {
    Code    int
    Message string
}

func (e *AppError) Error() string { return e.Message }

var (
    ErrNotFound   = &AppError{Code: 404, Message: "not found"}
    ErrForbidden  = &AppError{Code: 403, Message: "forbidden"}
    ErrBadRequest = &AppError{Code: 400, Message: "bad request"}
)

// ─── Error handler middleware ───────────────────
func ErrorHandler() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Next()

        // Обрабатываем ошибки после выполнения хендлера
        if len(c.Errors) > 0 {
            err := c.Errors.Last().Err

            var appErr *AppError
            if errors.As(err, &appErr) {
                c.JSON(appErr.Code, Response{
                    Success: false,
                    Error:   appErr.Message,
                })
                return
            }

            // Неизвестная ошибка
            c.JSON(500, Response{
                Success: false,
                Error:   "internal server error",
            })
        }
    }
}

// ─── Использование в хендлере ──────────────────
func GetUser(c *gin.Context) {
    user, err := db.FindUser(c.Param("id"))
    if err != nil {
        // Добавляем ошибку — middleware обработает
        _ = c.Error(ErrNotFound)
        return
    }
    OK(c, user)
}

// ─── Регистрация ────────────────────────────────
func main() {
    r := gin.New()
    r.Use(gin.Recovery())
    r.Use(ErrorHandler()) // регистрируем

    r.GET("/users/:id", GetUser)
    r.Run(":8080")
}`,
            explanation: 'c.Error() добавляет ошибку в контекст запроса. ErrorHandler middleware читает их после вызова c.Next(). Это паттерн централизованной обработки ошибок — хендлеры не занимаются форматированием ошибок сами.'
        },
        {
            type: 'editor',
            title: 'Практика: Единый формат ответа',
            starterCode: `package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

// TODO: Напиши хендлер GetProduct
// GET /products/:id
// Логика:
//   - Если id == "0" → вернуть 400 с {"success": false, "error": "invalid id"}
//   - Если id == "999" → вернуть 404 с {"success": false, "error": "not found"}
//   - Иначе → вернуть 200 с {"success": true, "data": {"id": id, "name": "Product"}}
// Используй c.Param("id") для получения id

func GetProduct(c *gin.Context) {
    // твой код здесь
}`,
            hints: [
                'id := c.Param("id")',
                'c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "..."})',
                'Используй if/else if для трёх случаев',
                'c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{"id": id, "name": "Product"}})'
            ]
        }
    ]
};
