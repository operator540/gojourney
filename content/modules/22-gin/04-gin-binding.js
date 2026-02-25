export default {
    id: '22-04',
    title: 'Binding и валидация в Gin',
    description: 'ShouldBind, BindJSON, валидация через теги, кастомные валидаторы',
    estimatedTime: 25,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `<h2>Binding — парсинг входящих данных</h2>
<p>Gin предоставляет мощную систему <strong>binding</strong> — автоматического разбора данных запроса (JSON, form, query) в Go-структуры с одновременной валидацией через теги.</p>

<table style="width:100%;border-collapse:collapse">
    <tr style="background:var(--surface-2)">
        <th style="padding:10px;border:1px solid var(--border)">Метод</th>
        <th style="padding:10px;border:1px solid var(--border)">При ошибке</th>
        <th style="padding:10px;border:1px solid var(--border)">Используй когда</th>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)"><code>c.ShouldBindJSON</code></td>
        <td style="padding:10px;border:1px solid var(--border)">Возвращает ошибку</td>
        <td style="padding:10px;border:1px solid var(--border)">Хочешь сам обработать ошибку</td>
    </tr>
    <tr style="background:var(--surface-2)">
        <td style="padding:10px;border:1px solid var(--border)"><code>c.BindJSON</code></td>
        <td style="padding:10px;border:1px solid var(--border)">Автоматически 400 + Abort</td>
        <td style="padding:10px;border:1px solid var(--border)">Быстрые прототипы</td>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)"><code>c.ShouldBind</code></td>
        <td style="padding:10px;border:1px solid var(--border)">Возвращает ошибку</td>
        <td style="padding:10px;border:1px solid var(--border)">Авто-определяет формат по Content-Type</td>
    </tr>
    <tr style="background:var(--surface-2)">
        <td style="padding:10px;border:1px solid var(--border)"><code>c.ShouldBindQuery</code></td>
        <td style="padding:10px;border:1px solid var(--border)">Возвращает ошибку</td>
        <td style="padding:10px;border:1px solid var(--border)">Только query-параметры</td>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)"><code>c.ShouldBindUri</code></td>
        <td style="padding:10px;border:1px solid var(--border)">Возвращает ошибку</td>
        <td style="padding:10px;border:1px solid var(--border)">Параметры пути (:id)</td>
    </tr>
</table>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Binding JSON с валидацией',
            code: `package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

// ─── Структура с тегами валидации ──────────────
type CreateUserRequest struct {
    Name     string \`json:"name"     binding:"required,min=2,max=50"\`
    Email    string \`json:"email"    binding:"required,email"\`
    Age      int    \`json:"age"      binding:"required,min=18,max=120"\`
    Password string \`json:"password" binding:"required,min=8"\`
    Role     string \`json:"role"     binding:"omitempty,oneof=admin user moderator"\`
}

func CreateUser(c *gin.Context) {
    var req CreateUserRequest

    // ShouldBindJSON парсит тело И валидирует теги
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error":   "validation failed",
            "details": err.Error(),
        })
        return
    }

    // Теперь req.Name гарантированно не пустой,
    // req.Email — валидный email, req.Age >= 18
    c.JSON(http.StatusCreated, gin.H{
        "id":    42,
        "name":  req.Name,
        "email": req.Email,
    })
}`,
            explanation: 'binding:"required" — поле обязательно. min/max — для строк длина, для чисел значение. email — встроенная валидация email. oneof — только одно из перечисленных значений. omitempty — пропустить валидацию если поле пустое.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Binding из разных источников',
            code: `// ─── Binding URI параметров ────────────────────
type UserURI struct {
    ID   int    \`uri:"id"   binding:"required,min=1"\`
    Slug string \`uri:"slug" binding:"required"\`
}

func GetUser(c *gin.Context) {
    var uri UserURI
    if err := c.ShouldBindUri(&uri); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    // uri.ID — уже int, не строка!
}

// ─── Binding Query параметров ───────────────────
type SearchQuery struct {
    Q     string \`form:"q"     binding:"required,min=1"\`
    Page  int    \`form:"page"  binding:"omitempty,min=1"\`
    Limit int    \`form:"limit" binding:"omitempty,min=1,max=100"\`
    Sort  string \`form:"sort"  binding:"omitempty,oneof=asc desc"\`
}

// GET /search?q=golang&page=2&limit=20&sort=asc
func Search(c *gin.Context) {
    var q SearchQuery
    if err := c.ShouldBindQuery(&q); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    if q.Page == 0 { q.Page = 1 }
    if q.Limit == 0 { q.Limit = 10 }
    // ...
}

// ─── Binding Form Data (multipart/urlencoded) ──
type UploadForm struct {
    Title string \`form:"title" binding:"required"\`
    Tags  string \`form:"tags"\`
}

func UploadFile(c *gin.Context) {
    var form UploadForm
    if err := c.ShouldBind(&form); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    file, err := c.FormFile("file")
    if err != nil {
        c.JSON(400, gin.H{"error": "file required"})
        return
    }

    c.SaveUploadedFile(file, "./uploads/"+file.Filename)
    c.JSON(200, gin.H{"title": form.Title, "file": file.Filename})
}`,
            explanation: 'Тег form:"..." используется для query-параметров и form-данных. uri:"..." — для path параметров. ShouldBind автоматически выбирает парсер по Content-Type.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Красивые ошибки валидации',
            code: `import (
    "errors"
    "github.com/go-playground/validator/v10"
)

// ─── Красивые ответы вместо технических ошибок ─
func handleValidationError(err error) gin.H {
    var ve validator.ValidationErrors
    if errors.As(err, &ve) {
        errs := make([]gin.H, len(ve))
        for i, e := range ve {
            errs[i] = gin.H{
                "field":   e.Field(),
                "tag":     e.Tag(),
                "message": fieldErrorToMsg(e),
            }
        }
        return gin.H{"errors": errs}
    }
    return gin.H{"error": err.Error()}
}

func fieldErrorToMsg(e validator.FieldError) string {
    switch e.Tag() {
    case "required":
        return e.Field() + " обязательное поле"
    case "email":
        return "Некорректный email"
    case "min":
        return e.Field() + " слишком короткое (мин. " + e.Param() + ")"
    case "max":
        return e.Field() + " слишком длинное (макс. " + e.Param() + ")"
    case "oneof":
        return e.Field() + " должно быть одним из: " + e.Param()
    }
    return e.Field() + " некорректное значение"
}

// Использование в хендлере:
func CreateUser(c *gin.Context) {
    var req CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, handleValidationError(err))
        return
    }
    // ...
}`,
            explanation: 'validator.ValidationErrors — это слайс ошибок по каждому полю. Можно итерировать и давать понятные пользователю сообщения вместо технических строк.'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q2204-1',
                    type: 'single',
                    question: 'В чём разница между c.ShouldBindJSON и c.BindJSON?',
                    options: [
                        'Нет никакой разницы',
                        'ShouldBindJSON возвращает ошибку, BindJSON автоматически отвечает 400 и вызывает Abort',
                        'ShouldBindJSON быстрее',
                        'BindJSON поддерживает больше форматов'
                    ],
                    correct: 1,
                    explanation: 'ShouldBindJSON возвращает ошибку для самостоятельной обработки. BindJSON при ошибке сам вызывает c.AbortWithStatus(400) — меньше контроля. В production используй ShouldBindJSON для кастомных ответов об ошибках.'
                },
                {
                    id: 'q2204-2',
                    type: 'single',
                    question: 'Какой тег использовать для binding параметров пути (:id)?',
                    options: [
                        'json:"id"',
                        'form:"id"',
                        'uri:"id"',
                        'path:"id"'
                    ],
                    correct: 2,
                    explanation: 'uri:"..." — для параметров пути при использовании c.ShouldBindUri(). form:"..." — для query и form данных. json:"..." — для JSON тела.'
                }
            ]
        }
    ]
};
