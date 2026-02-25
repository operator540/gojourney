export default {
    id: '14-05',
    title: 'Финальный проект: API',
    description: 'Реализация handlers, services, auth middleware в GoNetwork',
    estimatedTime: 30,
    xpReward: 30,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>API эндпоинты GoNetwork</h2>
                <table style="width:100%;border-collapse:collapse">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:8px;border:1px solid var(--border)">Метод</th>
                            <th style="padding:8px;border:1px solid var(--border)">Путь</th>
                            <th style="padding:8px;border:1px solid var(--border)">Описание</th>
                            <th style="padding:8px;border:1px solid var(--border)">Auth</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="padding:8px;border:1px solid var(--border)">POST</td><td style="padding:8px;border:1px solid var(--border)">/auth/register</td><td style="padding:8px;border:1px solid var(--border)">Регистрация</td><td style="padding:8px;border:1px solid var(--border)">—</td></tr>
                        <tr style="background:var(--surface-2)"><td style="padding:8px;border:1px solid var(--border)">POST</td><td style="padding:8px;border:1px solid var(--border)">/auth/login</td><td style="padding:8px;border:1px solid var(--border)">Вход</td><td style="padding:8px;border:1px solid var(--border)">—</td></tr>
                        <tr><td style="padding:8px;border:1px solid var(--border)">GET</td><td style="padding:8px;border:1px solid var(--border)">/users/:id</td><td style="padding:8px;border:1px solid var(--border)">Профиль</td><td style="padding:8px;border:1px solid var(--border)">JWT</td></tr>
                        <tr style="background:var(--surface-2)"><td style="padding:8px;border:1px solid var(--border)">GET</td><td style="padding:8px;border:1px solid var(--border)">/feed</td><td style="padding:8px;border:1px solid var(--border)">Лента</td><td style="padding:8px;border:1px solid var(--border)">JWT</td></tr>
                        <tr><td style="padding:8px;border:1px solid var(--border)">POST</td><td style="padding:8px;border:1px solid var(--border)">/posts</td><td style="padding:8px;border:1px solid var(--border)">Создать пост</td><td style="padding:8px;border:1px solid var(--border)">JWT</td></tr>
                        <tr style="background:var(--surface-2)"><td style="padding:8px;border:1px solid var(--border)">POST</td><td style="padding:8px;border:1px solid var(--border)">/posts/:id/like</td><td style="padding:8px;border:1px solid var(--border)">Лайк</td><td style="padding:8px;border:1px solid var(--border)">JWT</td></tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Auth handler: регистрация и вход',
            code: `// internal/handler/auth.go
package handler

import (
    "net/http"
    "time"

    "github.com/golang-jwt/jwt/v5"
    "github.com/labstack/echo/v4"
    "golang.org/x/crypto/bcrypt"

    "gonetwork/internal/domain"
    "gonetwork/internal/service"
)

type AuthHandler struct {
    userSvc   *service.UserService
    jwtSecret []byte
}

type RegisterRequest struct {
    Username string \`json:"username" validate:"required,min=3,max=50,alphanum"\`
    Email    string \`json:"email"    validate:"required,email"\`
    Password string \`json:"password" validate:"required,min=8"\`
}

type LoginRequest struct {
    Email    string \`json:"email"    validate:"required,email"\`
    Password string \`json:"password" validate:"required"\`
}

type AuthResponse struct {
    Token string       \`json:"token"\`
    User  *domain.User \`json:"user"\`
}

func (h *AuthHandler) Register(c echo.Context) error {
    var req RegisterRequest
    if err := c.Bind(&req); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, "invalid request")
    }
    if err := c.Validate(req); err != nil {
        return err
    }

    // Хешируем пароль
    hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, "internal error")
    }

    user, err := h.userSvc.Create(c.Request().Context(), service.CreateUserInput{
        Username:     req.Username,
        Email:        req.Email,
        PasswordHash: string(hash),
    })
    if err != nil {
        if err == domain.ErrAlreadyExists {
            return echo.NewHTTPError(http.StatusConflict, "user already exists")
        }
        return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
    }

    token, err := h.generateToken(user.ID)
    if err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, "token error")
    }

    return c.JSON(http.StatusCreated, AuthResponse{Token: token, User: user})
}

func (h *AuthHandler) Login(c echo.Context) error {
    var req LoginRequest
    if err := c.Bind(&req); err != nil || c.Validate(req) != nil {
        return echo.NewHTTPError(http.StatusBadRequest, "invalid request")
    }

    user, err := h.userSvc.GetByEmail(c.Request().Context(), req.Email)
    if err != nil || user == nil {
        return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
    }

    // Проверяем пароль
    if err := bcrypt.CompareHashAndPassword(
        []byte(user.PasswordHash), []byte(req.Password),
    ); err != nil {
        return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
    }

    token, err := h.generateToken(user.ID)
    if err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, "token error")
    }

    return c.JSON(http.StatusOK, AuthResponse{Token: token, User: user})
}

func (h *AuthHandler) generateToken(userID int64) (string, error) {
    claims := jwt.MapClaims{
        "user_id": userID,
        "exp":     time.Now().Add(24 * time.Hour).Unix(),
        "iat":     time.Now().Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(h.jwtSecret)
}`,
            explanation: 'bcrypt.GenerateFromPassword — хеширует пароль с автоматической солью. DefaultCost = 10 итераций — баланс скорость/безопасность. CompareHashAndPassword — безопасное сравнение (timing-safe).'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Post handler: создание и лайк',
            code: `// internal/handler/post.go
package handler

import (
    "net/http"
    "strconv"

    "github.com/labstack/echo/v4"
    "gonetwork/internal/domain"
    "gonetwork/internal/service"
)

type PostHandler struct {
    postSvc *service.PostService
}

type CreatePostRequest struct {
    Content string \`json:"content" validate:"required,min=1,max=2000"\`
}

func (h *PostHandler) Create(c echo.Context) error {
    var req CreatePostRequest
    if err := c.Bind(&req); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, "invalid request")
    }
    if err := c.Validate(req); err != nil {
        return err
    }

    // Получаем user_id из middleware
    userID := c.Get("user_id").(int64)

    post, err := h.postSvc.Create(c.Request().Context(), service.CreatePostInput{
        AuthorID: userID,
        Content:  req.Content,
    })
    if err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
    }

    return c.JSON(http.StatusCreated, post)
}

func (h *PostHandler) Like(c echo.Context) error {
    postID, err := strconv.ParseInt(c.Param("id"), 10, 64)
    if err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, "invalid post id")
    }

    userID := c.Get("user_id").(int64)

    err = h.postSvc.Like(c.Request().Context(), userID, postID)
    if err != nil {
        switch err {
        case domain.ErrNotFound:
            return echo.NewHTTPError(http.StatusNotFound, "post not found")
        case domain.ErrAlreadyExists:
            return echo.NewHTTPError(http.StatusConflict, "already liked")
        default:
            return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
        }
    }

    return c.JSON(http.StatusOK, map[string]string{"message": "liked"})
}

func (h *PostHandler) GetFeed(c echo.Context) error {
    userID := c.Get("user_id").(int64)
    limit := 20 // по умолчанию

    posts, err := h.postSvc.GetFeed(c.Request().Context(), userID, limit)
    if err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
    }

    return c.JSON(http.StatusOK, map[string]interface{}{
        "posts": posts,
        "count": len(posts),
    })
}`,
            explanation: 'c.Get("user_id").(int64) — читаем из JWT middleware. strconv.ParseInt — преобразуем path param в число (c.Param всегда string). switch на доменные ошибки → HTTP коды.'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Почему login возвращает одинаковую ошибку "invalid credentials" для неверного email И неверного пароля?',
                    options: [
                        'Это защита: злоумышленник не знает существует ли email',
                        'Для упрощения кода',
                        'Это требование JWT',
                        'Email не проверяется'
                    ],
                    correct: 0,
                    explanation: 'User enumeration attack: если "email not found" и "wrong password" — разные ответы, атакующий может перебирать email-адреса. "invalid credentials" для обоих — ничего не раскрывает.'
                }
            ]
        }
    ]
};
