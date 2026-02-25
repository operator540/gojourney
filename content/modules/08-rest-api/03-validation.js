export default {
    id: '08-03',
    title: 'Валидация входных данных',
    description: 'Ручная валидация, go-playground/validator с тегами, кастомные правила, нормализация данных, структурированные ошибки с полями',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: паспортный контроль</h2>
                <p>На границе паспортный контроль проверяет каждый документ: срок действия, подпись, фото совпадает с лицом. Без этой проверки в страну попадут все подряд — с поддельными документами, несовершеннолетние, нежелательные лица.</p>
                <p>Валидация входных данных — это паспортный контроль вашего API. Без неё в базу данных попадут:</p>
                <ul>
                    <li>Пустые строки там где ожидается имя</li>
                    <li>Отрицательные цены</li>
                    <li>"admin@" вместо настоящего email</li>
                    <li>SQL-инъекции и XSS-скрипты</li>
                    <li>Числа где ожидается текст</li>
                </ul>
                <p><strong>Золотое правило</strong>: никогда не доверяйте входным данным. Валидируйте всё на входе — на слое Handler, до передачи в Service.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Два подхода к валидации в Go</h2>

                <table style="width:100%; border-collapse:collapse; margin:16px 0;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="padding:10px 14px; border:1px solid var(--border); color:var(--accent);">Подход</th>
                            <th style="padding:10px 14px; border:1px solid var(--border);">Плюсы</th>
                            <th style="padding:10px 14px; border:1px solid var(--border);">Минусы</th>
                            <th style="padding:10px 14px; border:1px solid var(--border);">Когда использовать</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><strong>Ручная</strong></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Полный контроль, кастомные сообщения, нет зависимостей</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Много boilerplate кода для сложных структур</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Простые структуры, кастомная бизнес-логика</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:8px 14px; border:1px solid var(--border);"><strong>go-playground/validator</strong></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Декларативно, теги прямо в структуре, 100+ встроенных правил</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Сообщения по умолчанию технические, нужна кастомизация</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Большие формы, стандартные правила</td>
                        </tr>
                    </tbody>
                </table>

                <p>В реальных проектах часто комбинируют оба подхода: validator для форматной проверки + ручная для бизнес-логики (уникальность email, доступность username и т.д.).</p>

                <h3>Что валидировать</h3>
                <ul>
                    <li><strong>Обязательность</strong>: поле передано и не пустое</li>
                    <li><strong>Тип</strong>: число, строка, дата (JSON декодер уже проверяет базовые типы)</li>
                    <li><strong>Формат</strong>: email, URL, UUID, телефон — регулярные выражения</li>
                    <li><strong>Диапазон</strong>: min/max для чисел, min/max длина для строк</li>
                    <li><strong>Допустимые значения</strong>: enum — одно из разрешённых значений</li>
                    <li><strong>Межполевые правила</strong>: если поле A передано, поле B обязательно</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Ручная валидация — полный пример с кастомными ошибками',
            code: `package handler

import (
    "fmt"
    "regexp"
    "strings"
    "time"
)

// FieldError — ошибка конкретного поля
type FieldError struct {
    Field   string \`json:"field"\`
    Message string \`json:"message"\`
    Value   any    \`json:"value,omitempty"\` // что пришло (для отладки)
}

// ValidationErrors — список ошибок, реализует интерфейс error
type ValidationErrors []FieldError

func (ve ValidationErrors) Error() string {
    if len(ve) == 0 {
        return ""
    }
    msgs := make([]string, len(ve))
    for i, e := range ve {
        msgs[i] = fmt.Sprintf("%s: %s", e.Field, e.Message)
    }
    return strings.Join(msgs, "; ")
}

func (ve ValidationErrors) HasErrors() bool {
    return len(ve) > 0
}

// ===== ПРЕДВАРИТЕЛЬНО СКОМПИЛИРОВАННЫЕ REGEX =====
// regexp.MustCompile вызывается один раз при старте — не в каждом запросе!

var (
    emailRegex = regexp.MustCompile(
        \`^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$\`,
    )
    phoneRegex = regexp.MustCompile(\`^\\+?[1-9]\\d{6,14}$\`)
    slugRegex  = regexp.MustCompile(\`^[a-z0-9]+(?:-[a-z0-9]+)*$\`)
)

// ===== DTO С ВАЛИДАЦИЕЙ =====

type RegisterInput struct {
    Name      string \`json:"name"\`
    Email     string \`json:"email"\`
    Password  string \`json:"password"\`
    BirthDate string \`json:"birth_date"\` // "YYYY-MM-DD"
    Phone     string \`json:"phone"\`       // опциональный
    Role      string \`json:"role"\`
}

func (r *RegisterInput) Normalize() {
    // Нормализация ДО валидации
    r.Name  = strings.TrimSpace(r.Name)
    r.Email = strings.TrimSpace(strings.ToLower(r.Email))
    r.Phone = strings.TrimSpace(r.Phone)
    r.Role  = strings.TrimSpace(strings.ToLower(r.Role))
    if r.Role == "" {
        r.Role = "user"
    }
}

func (r RegisterInput) Validate() ValidationErrors {
    var errs ValidationErrors

    // Name
    switch {
    case r.Name == "":
        errs = append(errs, FieldError{"name", "обязательное поле", nil})
    case len(r.Name) < 2:
        errs = append(errs, FieldError{"name", "минимум 2 символа", r.Name})
    case len(r.Name) > 100:
        errs = append(errs, FieldError{"name", "максимум 100 символов", len(r.Name)})
    }

    // Email
    if r.Email == "" {
        errs = append(errs, FieldError{"email", "обязательное поле", nil})
    } else if !emailRegex.MatchString(r.Email) {
        errs = append(errs, FieldError{"email", "неверный формат email", r.Email})
    }

    // Password
    if len(r.Password) < 8 {
        errs = append(errs, FieldError{"password", "минимум 8 символов", nil})
    } else if !hasUppercase(r.Password) || !hasDigit(r.Password) {
        errs = append(errs, FieldError{
            "password",
            "должен содержать заглавную букву и цифру",
            nil,
        })
    }

    // BirthDate (опциональный, но если есть — должен быть правильный формат)
    if r.BirthDate != "" {
        t, err := time.Parse("2006-01-02", r.BirthDate)
        if err != nil {
            errs = append(errs, FieldError{"birth_date", "формат: YYYY-MM-DD", r.BirthDate})
        } else if t.After(time.Now()) {
            errs = append(errs, FieldError{"birth_date", "не может быть в будущем", r.BirthDate})
        }
    }

    // Phone (опциональный)
    if r.Phone != "" && !phoneRegex.MatchString(r.Phone) {
        errs = append(errs, FieldError{"phone", "неверный формат телефона", r.Phone})
    }

    // Role — enum validation
    validRoles := map[string]bool{"user": true, "admin": true, "moderator": true}
    if !validRoles[r.Role] {
        errs = append(errs, FieldError{
            "role",
            "допустимые значения: user, admin, moderator",
            r.Role,
        })
    }

    return errs
}

func hasUppercase(s string) bool {
    for _, r := range s {
        if r >= 'A' && r <= 'Z' {
            return true
        }
    }
    return false
}

func hasDigit(s string) bool {
    for _, r := range s {
        if r >= '0' && r <= '9' {
            return true
        }
    }
    return false
}`,
            explanation: 'Ключевые моменты: 1) Normalize() до Validate() — убираем лишние пробелы, нормализуем регистр. 2) Regex компилируем один раз на уровне пакета — не в каждом запросе. 3) Возвращаем ВСЕ ошибки сразу — пользователь исправит всё за один раз. 4) Опциональные поля проверяются только если непусты.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'go-playground/validator — декларативная валидация через теги',
            code: `package handler

import (
    "errors"
    "fmt"
    "strings"

    "github.com/go-playground/validator/v10"
)

// ===== СТРУКТУРА С ТЕГАМИ ВАЛИДАЦИИ =====

type CreateProductInput struct {
    Name        string   \`json:"name"         validate:"required,min=2,max=200"\`
    Slug        string   \`json:"slug"         validate:"required,slug"\`
    Price       float64  \`json:"price"        validate:"required,gt=0,lte=999999"\`
    Stock       int      \`json:"stock"        validate:"min=0"\`
    CategoryID  int      \`json:"category_id"  validate:"required,gt=0"\`
    Tags        []string \`json:"tags"         validate:"max=10,dive,min=1,max=50"\`
    Description string   \`json:"description"  validate:"max=2000"\`
    Email       string   \`json:"email"        validate:"omitempty,email"\`
}

// ===== ГЛОБАЛЬНЫЙ ЭКЗЕМПЛЯР ВАЛИДАТОРА =====
// Создаём один раз — он кэширует reflection данные структур

var validate *validator.Validate

func init() {
    validate = validator.New()

    // Используем json теги как имена полей (а не Go-имена)
    validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
        name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
        if name == "-" {
            return ""
        }
        return name
    })

    // Кастомный валидатор: slug (a-z, 0-9, дефисы)
    validate.RegisterValidation("slug", validateSlug)
}

func validateSlug(fl validator.FieldLevel) bool {
    return slugRegex.MatchString(fl.Field().String())
}

// ===== КРАСИВЫЕ СООБЩЕНИЯ ОБ ОШИБКАХ =====

func translateValidationErrors(err error) []FieldError {
    var ve validator.ValidationErrors
    if !errors.As(err, &ve) {
        return []FieldError{{"_", err.Error(), nil}}
    }

    result := make([]FieldError, 0, len(ve))
    for _, e := range ve {
        var msg string
        switch e.Tag() {
        case "required":
            msg = "обязательное поле"
        case "min":
            if e.Type().Kind() == reflect.String {
                msg = fmt.Sprintf("минимум %s символов", e.Param())
            } else {
                msg = fmt.Sprintf("минимальное значение: %s", e.Param())
            }
        case "max":
            if e.Type().Kind() == reflect.String {
                msg = fmt.Sprintf("максимум %s символов", e.Param())
            } else {
                msg = fmt.Sprintf("максимальное значение: %s", e.Param())
            }
        case "gt":
            msg = fmt.Sprintf("должно быть больше %s", e.Param())
        case "gte":
            msg = fmt.Sprintf("должно быть не меньше %s", e.Param())
        case "lte":
            msg = fmt.Sprintf("должно быть не больше %s", e.Param())
        case "email":
            msg = "неверный формат email"
        case "slug":
            msg = "только строчные буквы, цифры и дефисы"
        case "oneof":
            msg = fmt.Sprintf("допустимые значения: %s", strings.ReplaceAll(e.Param(), " ", ", "))
        case "dive":
            msg = fmt.Sprintf("элемент массива не прошёл валидацию: %s", e.Param())
        default:
            msg = fmt.Sprintf("не прошло правило: %s", e.Tag())
        }

        result = append(result, FieldError{
            Field:   e.Field(),
            Message: msg,
        })
    }
    return result
}

// ===== ИСПОЛЬЗОВАНИЕ В ХЕНДЛЕРЕ =====

func createProductHandler(w http.ResponseWriter, r *http.Request) {
    var input CreateProductInput
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        writeError(w, http.StatusBadRequest, "invalid JSON")
        return
    }

    if err := validate.Struct(input); err != nil {
        fieldErrs := translateValidationErrors(err)
        writeJSON(w, http.StatusUnprocessableEntity, map[string]any{
            "error":  "validation failed",
            "fields": fieldErrs,
        })
        return
    }

    // Данные валидны — передаём в сервис
    // ...
}`,
            explanation: 'validate.RegisterTagNameFunc — заставляет validator использовать json теги ("name") вместо Go имён ("Name") в сообщениях ошибок. RegisterValidation — добавляет кастомное правило. dive — проваливается внутрь массива для валидации каждого элемента.'
        },
        {
            type: 'theory',
            content: `
                <h2>Популярные теги validator/v10</h2>

                <table style="width:100%; border-collapse:collapse; margin:16px 0;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="padding:10px 14px; border:1px solid var(--border); color:var(--accent);">Тег</th>
                            <th style="padding:10px 14px; border:1px solid var(--border);">Описание</th>
                            <th style="padding:10px 14px; border:1px solid var(--border);">Пример</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>required</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Поле не пустое (не нулевое значение)</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>validate:"required"</code></td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>omitempty</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Пропустить остальные правила если пусто</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>validate:"omitempty,email"</code></td>
                        </tr>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>min=N, max=N</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Длина строки или числовой диапазон</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>validate:"min=2,max=100"</code></td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>gt=N, gte=N, lt=N, lte=N</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Greater/Less than (equal)</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>validate:"gt=0,lte=1000"</code></td>
                        </tr>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>email</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Формат email</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>validate:"required,email"</code></td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>url, uri</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Формат URL/URI</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>validate:"omitempty,url"</code></td>
                        </tr>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>uuid, uuid4</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Формат UUID</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>validate:"required,uuid4"</code></td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>oneof=a b c</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Одно из перечисленных значений</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>validate:"oneof=user admin mod"</code></td>
                        </tr>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>dive</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Применить следующие правила к элементам слайса/map</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>validate:"dive,min=1,max=50"</code></td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>len=N</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Точная длина строки или размер слайса</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>validate:"len=6"</code></td>
                        </tr>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>numeric, alpha, alphanum</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Только цифры / буквы / буквы+цифры</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>validate:"numeric"</code></td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>eqfield=Field</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Равно другому полю (подтверждение пароля)</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>validate:"eqfield=Password"</code></td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Межполевая валидация и кастомные правила',
            code: `package handler

import (
    "reflect"
    "time"

    "github.com/go-playground/validator/v10"
)

// ===== СТРУКТУРА С МЕЖПОЛЕВОЙ ВАЛИДАЦИЕЙ =====

type CreateEventInput struct {
    Title       string    \`json:"title"        validate:"required,min=3,max=200"\`
    StartAt     time.Time \`json:"start_at"     validate:"required"\`
    EndAt       time.Time \`json:"end_at"       validate:"required,gtfield=StartAt"\`
    MaxCapacity int       \`json:"max_capacity" validate:"min=1,max=100000"\`
    MinAge      int       \`json:"min_age"      validate:"min=0,max=120"\`
    MaxAge      int       \`json:"max_age"      validate:"omitempty,gtefield=MinAge,max=120"\`
    Type        string    \`json:"type"         validate:"required,oneof=online offline hybrid"\`
    Price       float64   \`json:"price"        validate:"min=0"\`
    Currency    string    \`json:"currency"     validate:"omitempty,len=3,alpha"\`
}

// ===== КАСТОМНЫЙ ВАЛИДАТОР: будущая дата =====

func validateFutureDate(fl validator.FieldLevel) bool {
    t, ok := fl.Field().Interface().(time.Time)
    if !ok {
        return false
    }
    return t.After(time.Now())
}

// ===== КАСТОМНЫЙ ВАЛИДАТОР: кредитная карта =====
// (упрощённо — алгоритм Луна)

func validateCreditCard(fl validator.FieldLevel) bool {
    number := fl.Field().String()
    sum := 0
    nDigits := len(number)
    parity := nDigits % 2

    for i := 0; i < nDigits; i++ {
        digit := int(number[i] - '0')
        if digit < 0 || digit > 9 {
            return false
        }
        if i%2 == parity {
            digit *= 2
            if digit > 9 {
                digit -= 9
            }
        }
        sum += digit
    }
    return sum%10 == 0
}

// ===== РЕГИСТРАЦИЯ И ИСПОЛЬЗОВАНИЕ =====

func setupValidator() *validator.Validate {
    v := validator.New()

    // Кастомные правила
    v.RegisterValidation("future_date", validateFutureDate)
    v.RegisterValidation("credit_card", validateCreditCard)

    // Кастомный тип: валидация time.Time
    v.RegisterCustomTypeFunc(func(field reflect.Value) interface{} {
        if t, ok := field.Interface().(time.Time); ok {
            if t.IsZero() {
                return nil
            }
            return t
        }
        return nil
    }, time.Time{})

    return v
}

// Пример структуры с кастомными правилами
type PaymentInput struct {
    Amount     float64 \`json:"amount"      validate:"required,gt=0"\`
    CardNumber string  \`json:"card_number" validate:"required,credit_card"\`
    ExpiryDate string  \`json:"expiry_date" validate:"required,len=5"\`
    CVV        string  \`json:"cvv"         validate:"required,len=3,numeric"\`
}`,
            explanation: 'gtfield=StartAt — поле должно быть больше другого поля. gtefield=MinAge — больше или равно. RegisterCustomTypeFunc — учим validator работать с time.Time. RegisterValidation — добавляем произвольную логику проверки через замыкание.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Полный хендлер с валидацией и красивыми ответами',
            code: `package handler

import (
    "encoding/json"
    "net/http"
)

// Стандартный формат ответа об ошибках валидации
type ValidationResponse struct {
    Error  string       \`json:"error"\`
    Fields []FieldError \`json:"fields"\`
}

func (h *ProductHandler) Create(w http.ResponseWriter, r *http.Request) {
    // 1. Парсинг JSON
    var input CreateProductInput
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]string{
            "error": "invalid JSON: " + err.Error(),
        })
        return
    }

    // 2. Нормализация (trim, toLower и т.д.)
    input.Slug = strings.ToLower(strings.TrimSpace(input.Slug))
    input.Name = strings.TrimSpace(input.Name)

    // 3. Валидация
    if err := validate.Struct(input); err != nil {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusUnprocessableEntity)
        json.NewEncoder(w).Encode(ValidationResponse{
            Error:  "validation failed",
            Fields: translateValidationErrors(err),
        })
        return
    }

    // 4. Передаём в сервис — данные гарантированно чистые
    product, err := h.svc.Create(input)
    if err != nil {
        // ... обработка бизнес ошибок
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(product)
}

/* Пример ответа при ошибках валидации:
POST /api/v1/products
{"name": "", "slug": "Bad Slug!", "price": -5}

HTTP 422 Unprocessable Entity
{
    "error": "validation failed",
    "fields": [
        {"field": "name",  "message": "обязательное поле"},
        {"field": "slug",  "message": "только строчные буквы, цифры и дефисы"},
        {"field": "price", "message": "должно быть больше 0"},
        {"field": "category_id", "message": "обязательное поле"}
    ]
}
*/`,
            explanation: '422 Unprocessable Entity — данные распарсены корректно, но не прошли семантическую проверку. 400 Bad Request — синтаксически невалидный JSON. Важно: возвращайте ВСЕ ошибки сразу, а не останавливайтесь на первой.'
        },
        {
            type: 'info-box',
            variant: 'note',
            content: `<strong>Нормализация данных — до валидации</strong>
            <p>Всегда нормализуйте данные перед валидацией:</p>
            <ul>
                <li><code>strings.TrimSpace()</code> — убираем пробелы по краям</li>
                <li><code>strings.ToLower()</code> — email, slug в нижний регистр</li>
                <li><code>strings.ToUpper()</code> — коды валют (USD, EUR)</li>
                <li>Телефон: убираем пробелы, скобки, дефисы перед проверкой regex</li>
            </ul>
            <p>Иначе " alice@example.com " (с пробелами) пройдёт как второй аккаунт того же человека.</p>`
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<strong>Не раскрывайте внутренние детали в ошибках</strong>
            <p>Плохо: <code>"error": "pq: insert into users: duplicate key value violates unique constraint users_email_key"</code></p>
            <p>Хорошо: <code>"error": "email already registered"</code></p>
            <p>Детали SQL ошибок утекают схему БД. Логируйте подробно внутри — отдавайте клиенту только то что нужно для исправления ошибки.</p>`
        },
        {
            type: 'editor',
            title: 'Практика: валидация заказа',
            instructions: 'Реализуйте метод Validate() для CreateOrderInput. Правила: user_id > 0, items непустой (хотя бы 1 элемент), у каждого item: product_id > 0, quantity >= 1 и <= 100. Возвращайте ВСЕ ошибки сразу.',
            starterCode: `package main

import "fmt"

type OrderItem struct {
    ProductID int \`json:"product_id"\`
    Quantity  int \`json:"quantity"\`
}

type CreateOrderInput struct {
    UserID int         \`json:"user_id"\`
    Items  []OrderItem \`json:"items"\`
    Note   string      \`json:"note"\`
}

type FieldError struct {
    Field   string \`json:"field"\`
    Message string \`json:"message"\`
}

func (input CreateOrderInput) Validate() []FieldError {
    var errs []FieldError

    // Ваша валидация здесь:
    // 1. user_id должен быть > 0
    // 2. items не должен быть пустым
    // 3. Для каждого items[i]:
    //    - product_id > 0
    //    - quantity от 1 до 100

    _ = fmt.Sprintf // подсказка: используйте для форматирования "items[0].product_id"
    return errs
}`,
            hints: [
                'if input.UserID <= 0 { errs = append(errs, FieldError{"user_id", "должен быть положительным"}) }',
                'if len(input.Items) == 0 { errs = append(errs, FieldError{"items", "нужен хотя бы один товар"}) }',
                'for i, item := range input.Items { field := fmt.Sprintf("items[%d]", i)',
                'if item.ProductID <= 0 { errs = append(errs, FieldError{field+".product_id", "обязательное поле"}) }',
                'if item.Quantity < 1 || item.Quantity > 100 { errs = append(errs, FieldError{field+".quantity", "от 1 до 100"}) }'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Почему regexp.MustCompile нужно вызывать на уровне пакета (var emailRegex = ...), а не внутри функции валидации?',
                    options: [
                        'regexp.MustCompile нельзя вызывать внутри функций',
                        'Компиляция regex — дорогая операция, делаем один раз при старте, а не при каждом запросе',
                        'Глобальные переменные быстрее локальных',
                        'Это требование стандарта Go'
                    ],
                    correct: 1,
                    explanation: 'regexp.Compile парсит и компилирует выражение в автомат — это занимает время. При 1000 req/s вызов внутри функции даст 1000 ненужных компиляций в секунду. На уровне пакета — компиляция происходит один раз при инициализации программы.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Какой HTTP статус код правильный для ошибок валидации (семантически неверные данные)?',
                    options: [
                        '400 Bad Request — всегда для ошибок клиента',
                        '422 Unprocessable Entity — данные распарсены, но семантически неверны',
                        '403 Forbidden — клиенту запрещено отправлять такие данные',
                        '500 Internal Server Error'
                    ],
                    correct: 1,
                    explanation: '400 — синтаксическая ошибка (невалидный JSON, неверный тип). 422 — данные технически корректны (JSON распарсился), но не прошли бизнес-правила (email без @, отрицательная цена). Многие API используют 400 для обоих — это тоже приемлемо.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Что делает тег validate:"omitempty,email" у поля Email string?',
                    options: [
                        'Email обязателен, но может быть пустым',
                        'Если Email пустой — правило email не проверяется; если непустой — проверяем формат',
                        'Email необязателен и всегда игнорируется',
                        'omitempty делает поле скрытым в JSON'
                    ],
                    correct: 1,
                    explanation: 'omitempty = "пропусти остальные правила если поле пустое". Итого: если Email == "" — всё ок, поле необязательно. Если Email = "bad" — проверяем правило email и получаем ошибку. Полезно для опциональных полей с форматными ограничениями.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Зачем нормализовать email (strings.ToLower) перед валидацией?',
                    options: [
                        'Для ускорения регулярного выражения',
                        'Чтобы "Alice@Example.COM" и "alice@example.com" считались одним email, а не разными',
                        'email в верхнем регистре не валидный',
                        'Это требование RFC для email адресов'
                    ],
                    correct: 1,
                    explanation: 'Email технически case-insensitive для домена и обычно для локальной части. Без нормализации "Alice@Example.com" и "alice@example.com" — разные строки. Пользователь зарегистрируется дважды с одним email. Нормализация до нижнего регистра решает проблему.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Что делает тег validate:"dive,min=1" у поля Tags []string?',
                    options: [
                        'Проверяет что в Tags минимум 1 элемент',
                        'Проваливается внутрь слайса и применяет min=1 к каждому элементу',
                        'Tags должен содержать элемент "1"',
                        'Запрещает вложенные слайсы'
                    ],
                    correct: 1,
                    explanation: 'dive — директива "зайди внутрь коллекции". validate:"max=10,dive,min=1,max=50" означает: слайс максимум 10 элементов, а каждый элемент-строка: минимум 1 и максимум 50 символов.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Почему нужно возвращать ВСЕ ошибки валидации сразу, а не только первую?',
                    options: [
                        'Технически невозможно вернуть только первую',
                        'Пользователю удобнее исправить все проблемы за один запрос, а не делать их по одной',
                        'Первая ошибка может быть неточной',
                        'Это требование HTTP стандарта'
                    ],
                    correct: 1,
                    explanation: 'UX: если API возвращает ошибки по одной, пользователь делает N запросов для исправления N ошибок. Это раздражает. Возврат всех ошибок сразу позволяет исправить форму за один раз. go-playground/validator возвращает ValidationErrors — слайс всех ошибок.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Где вызывать validate.RegisterTagNameFunc чтобы json-теги использовались как имена полей?',
                    options: [
                        'В каждом хендлере перед валидацией',
                        'В init() или при создании экземпляра validator.New()',
                        'В middleware',
                        'В main() каждый раз'
                    ],
                    correct: 1,
                    explanation: 'validator.New() создаётся один раз глобально. RegisterTagNameFunc настраивает его один раз при инициализации — в init() или в конструкторе. После этого все вызовы validate.Struct() используют json имена в ошибках вместо Go имён (Name → name).'
                }
            ]
        }
    ]
};
