export default {
    id: '18-04',
    title: 'Binding и Валидация',
    description: 'Автоматический binding JSON/form/query, валидация с go-playground/validator',
    estimatedTime: 25,
    xpReward: 22,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Binding — автоматический парсинг запросов</h2>
                <p>Echo умеет автоматически парсить входящие данные из разных источников:</p>
                <ul>
                    <li><strong>JSON body</strong> — Content-Type: application/json</li>
                    <li><strong>Form data</strong> — Content-Type: application/x-www-form-urlencoded</li>
                    <li><strong>Multipart form</strong> — загрузка файлов</li>
                    <li><strong>Query params</strong> — <code>?page=1&size=10</code></li>
                    <li><strong>Path params</strong> — <code>/users/:id</code></li>
                </ul>
                <p>Всё это через один метод: <code>c.Bind(&struct)</code></p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'c.Bind() — парсинг из разных источников',
            code: `package main

import (
    "net/http"

    "github.com/labstack/echo/v4"
)

// Теги для маппинга полей из разных источников
type CreateUserRequest struct {
    Name  string \`json:"name"  form:"name"  query:"name"\`
    Email string \`json:"email" form:"email" query:"email"\`
    Age   int    \`json:"age"   form:"age"   query:"age"\`
}

// Пагинация из query params
type Pagination struct {
    Page  int \`query:"page"\`
    Size  int \`query:"size"\`
    Sort  string \`query:"sort"\`
}

func main() {
    e := echo.New()

    // POST /users — парсит JSON body
    e.POST("/users", func(c echo.Context) error {
        var req CreateUserRequest
        if err := c.Bind(&req); err != nil {
            return c.JSON(http.StatusBadRequest, map[string]string{
                "error": "Invalid request body",
            })
        }
        return c.JSON(http.StatusCreated, map[string]interface{}{
            "message": "Created",
            "user":    req,
        })
    })

    // GET /users?page=1&size=20&sort=name
    e.GET("/users", func(c echo.Context) error {
        var p Pagination
        p.Page = 1  // значения по умолчанию
        p.Size = 10
        if err := c.Bind(&p); err != nil {
            return echo.ErrBadRequest
        }
        return c.JSON(200, map[string]interface{}{
            "page": p.Page,
            "size": p.Size,
            "sort": p.Sort,
        })
    })

    // Отдельное чтение параметров
    e.GET("/users/:id", func(c echo.Context) error {
        id := c.Param("id")      // path param: /users/42 → "42"
        format := c.QueryParam("format") // query: ?format=json
        token := c.Request().Header.Get("Authorization")

        return c.JSON(200, map[string]string{
            "id":     id,
            "format": format,
            "token":  token,
        })
    })

    e.Start(":8080")
}`,
            explanation: 'c.Bind() автоматически определяет источник по Content-Type. Для query params всегда использует теги query. Всегда обрабатывайте ошибку Bind()!'
        },
        {
            type: 'theory',
            content: `
                <h2>Валидация с go-playground/validator</h2>
                <p>Echo не включает валидацию из коробки, но легко интегрируется с популярной библиотекой <code>go-playground/validator/v10</code>.</p>
                <p>Теги валидации пишутся в поле структуры: <code>validate:"required,email,min=3"</code></p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Настройка валидатора в Echo',
            code: `package main

import (
    "net/http"

    "github.com/go-playground/validator/v10"
    "github.com/labstack/echo/v4"
)

// Обёртка для интеграции с Echo
type CustomValidator struct {
    validator *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
    if err := cv.validator.Struct(i); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, err.Error())
    }
    return nil
}

// Структуры с тегами валидации
type RegisterRequest struct {
    Username string \`json:"username" validate:"required,min=3,max=50,alphanum"\`
    Email    string \`json:"email"    validate:"required,email"\`
    Password string \`json:"password" validate:"required,min=8"\`
    Age      int    \`json:"age"      validate:"required,min=18,max=120"\`
    Website  string \`json:"website"  validate:"omitempty,url"\`
}

type LoginRequest struct {
    Email    string \`json:"email"    validate:"required,email"\`
    Password string \`json:"password" validate:"required"\`
}

func main() {
    e := echo.New()

    // Регистрируем валидатор
    e.Validator = &CustomValidator{
        validator: validator.New(),
    }

    e.POST("/register", func(c echo.Context) error {
        var req RegisterRequest

        // Bind + Validate в одном блоке
        if err := c.Bind(&req); err != nil {
            return c.JSON(http.StatusBadRequest, map[string]string{
                "error": "Invalid JSON",
            })
        }
        if err := c.Validate(req); err != nil {
            return err // HTTPError уже создан в CustomValidator
        }

        return c.JSON(http.StatusCreated, map[string]interface{}{
            "message":  "Registered successfully",
            "username": req.Username,
            "email":    req.Email,
        })
    })

    e.POST("/login", func(c echo.Context) error {
        var req LoginRequest
        if err := c.Bind(&req); err != nil || c.Validate(req) != nil {
            return c.JSON(http.StatusBadRequest, map[string]string{
                "error": "Invalid credentials format",
            })
        }
        return c.JSON(200, map[string]string{"token": "jwt-token"})
    })

    e.Start(":8080")
}`,
            explanation: 'CustomValidator реализует echo.Validator interface. e.Validator = ... регистрирует его. Теперь c.Validate(req) автоматически валидирует структуру по тегам.'
        },
        {
            type: 'theory',
            content: `
                <h2>Популярные теги валидации</h2>
                <table style="width:100%;border-collapse:collapse;margin-top:8px">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:8px;text-align:left;border:1px solid var(--border)">Тег</th>
                            <th style="padding:8px;text-align:left;border:1px solid var(--border)">Описание</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="padding:8px;border:1px solid var(--border)"><code>required</code></td><td style="padding:8px;border:1px solid var(--border)">Обязательное поле</td></tr>
                        <tr style="background:var(--surface-2)"><td style="padding:8px;border:1px solid var(--border)"><code>email</code></td><td style="padding:8px;border:1px solid var(--border)">Валидный email</td></tr>
                        <tr><td style="padding:8px;border:1px solid var(--border)"><code>min=N, max=N</code></td><td style="padding:8px;border:1px solid var(--border)">Мин/макс значение или длина строки</td></tr>
                        <tr style="background:var(--surface-2)"><td style="padding:8px;border:1px solid var(--border)"><code>len=N</code></td><td style="padding:8px;border:1px solid var(--border)">Точная длина</td></tr>
                        <tr><td style="padding:8px;border:1px solid var(--border)"><code>alphanum</code></td><td style="padding:8px;border:1px solid var(--border)">Только буквы и цифры</td></tr>
                        <tr style="background:var(--surface-2)"><td style="padding:8px;border:1px solid var(--border)"><code>url, uri</code></td><td style="padding:8px;border:1px solid var(--border)">Валидный URL/URI</td></tr>
                        <tr><td style="padding:8px;border:1px solid var(--border)"><code>uuid</code></td><td style="padding:8px;border:1px solid var(--border)">UUID формат</td></tr>
                        <tr style="background:var(--surface-2)"><td style="padding:8px;border:1px solid var(--border)"><code>oneof=a b c</code></td><td style="padding:8px;border:1px solid var(--border)">Одно из значений</td></tr>
                        <tr><td style="padding:8px;border:1px solid var(--border)"><code>omitempty</code></td><td style="padding:8px;border:1px solid var(--border)">Пропустить если поле пустое</td></tr>
                        <tr style="background:var(--surface-2)"><td style="padding:8px;border:1px solid var(--border)"><code>eqfield=Field</code></td><td style="padding:8px;border:1px solid var(--border)">Равно другому полю структуры</td></tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Красивые сообщения об ошибках',
            code: `package main

import (
    "fmt"
    "net/http"
    "strings"

    "github.com/go-playground/validator/v10"
    "github.com/labstack/echo/v4"
)

type ValidationError struct {
    Field   string \`json:"field"\`
    Message string \`json:"message"\`
}

type ValidationErrors struct {
    Errors []ValidationError \`json:"errors"\`
}

func formatValidationErrors(err error) ValidationErrors {
    var result ValidationErrors
    for _, e := range err.(validator.ValidationErrors) {
        field := strings.ToLower(e.Field())
        var msg string
        switch e.Tag() {
        case "required":
            msg = fmt.Sprintf("%s обязательно", field)
        case "email":
            msg = "Некорректный email"
        case "min":
            msg = fmt.Sprintf("%s: минимум %s символов", field, e.Param())
        case "max":
            msg = fmt.Sprintf("%s: максимум %s символов", field, e.Param())
        case "alphanum":
            msg = fmt.Sprintf("%s: только буквы и цифры", field)
        default:
            msg = fmt.Sprintf("%s: нарушение правила %s", field, e.Tag())
        }
        result.Errors = append(result.Errors, ValidationError{Field: field, Message: msg})
    }
    return result
}

type SmartValidator struct {
    v *validator.Validate
}

func (sv *SmartValidator) Validate(i interface{}) error {
    if err := sv.v.Struct(i); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, formatValidationErrors(err))
    }
    return nil
}

type UpdateProfileRequest struct {
    Name     string \`json:"name"     validate:"required,min=2,max=100"\`
    Bio      string \`json:"bio"      validate:"omitempty,max=500"\`
    Website  string \`json:"website"  validate:"omitempty,url"\`
    Role     string \`json:"role"     validate:"required,oneof=admin user moderator"\`
}

func main() {
    e := echo.New()
    e.Validator = &SmartValidator{v: validator.New()}

    e.PUT("/profile/:id", func(c echo.Context) error {
        var req UpdateProfileRequest
        if err := c.Bind(&req); err != nil {
            return c.JSON(http.StatusBadRequest, map[string]string{"error": "Bad JSON"})
        }
        if err := c.Validate(req); err != nil {
            // err.(*echo.HTTPError).Message содержит ValidationErrors
            return err
        }
        return c.JSON(200, map[string]string{"message": "Updated"})
    })

    e.Start(":8080")
}`,
            explanation: 'validator.ValidationErrors — слайс ошибок по каждому полю. e.Tag() — нарушенное правило, e.Param() — параметр (например, "8" для min=8). formatValidationErrors возвращает читаемые сообщения.'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Какой тег validate использовать для поля Email в структуре?',
                    options: [
                        'validate:"required,email"',
                        'validate:"required,string"',
                        'validate:"email,format"',
                        'json:"email,required"'
                    ],
                    correct: 0,
                    explanation: 'required — поле обязательно, email — проверяет формат email адреса. Теги пишутся в поле validate, а не json.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Зачем нужен тег omitempty?',
                    options: [
                        'Пропускает валидацию если поле пустое (опциональное поле)',
                        'Omit поле из JSON ответа',
                        'Заменяет required',
                        'Устанавливает значение по умолчанию'
                    ],
                    correct: 0,
                    explanation: 'omitempty: если поле пустое (0, "", nil) — валидация для него пропускается. Полезно для опциональных полей: validate:"omitempty,url" — если website указан, должен быть URL; если пустой — ок.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Как ограничить значение поля Role одним из: "admin", "user", "moderator"?',
                    options: [
                        'validate:"oneof=admin user moderator"',
                        'validate:"in=admin,user,moderator"',
                        'validate:"enum=admin|user|moderator"',
                        'validate:"contains=admin,user"'
                    ],
                    correct: 0,
                    explanation: 'oneof разделяет допустимые значения пробелами: validate:"oneof=admin user moderator". Если придёт другое значение — валидация упадёт.'
                }
            ]
        }
    ]
};
