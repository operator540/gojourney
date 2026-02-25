export default {
    id: '08-04',
    title: 'Аутентификация (JWT)',
    description: 'JWT структура, создание токена, верификация, refresh tokens, middleware',
    estimatedTime: 25,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>JWT — JSON Web Token</h2>
                <p>JWT — компактный самодостаточный токен для передачи claims между сторонами.</p>
                <p>Структура: <code>header.payload.signature</code></p>
                <ul>
                    <li><strong>Header</strong>: алгоритм и тип ({"alg":"HS256","typ":"JWT"})</li>
                    <li><strong>Payload</strong>: claims — данные (sub, exp, iat, jti...)</li>
                    <li><strong>Signature</strong>: HMAC(header + "." + payload, secret)</li>
                </ul>
                <p>Сервер <strong>не хранит</strong> токены — stateless аутентификация.</p>
            `
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Библиотека',
            code: `go get github.com/golang-jwt/jwt/v5`,
            explanation: 'golang-jwt/jwt v5 — актуальная версия, активно поддерживается.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Создание JWT токена',
            code: `package auth

import (
    "crypto/rand"
    "encoding/hex"
    "time"

    "github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("your-secret-key-change-in-production")

type Claims struct {
    UserID int    \`json:"user_id"\`
    Email  string \`json:"email"\`
    Role   string \`json:"role"\`
    jwt.RegisteredClaims
}

func GenerateToken(userID int, email, role string) (string, error) {
    // jti — уникальный ID токена (предотвращает дубликаты)
    jti := make([]byte, 16)
    rand.Read(jti)

    claims := Claims{
        UserID: userID,
        Email:  email,
        Role:   role,
        RegisteredClaims: jwt.RegisteredClaims{
            ID:        hex.EncodeToString(jti), // jti
            Subject:   strconv.Itoa(userID),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
            Issuer:    "myapp",
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret)
}`,
            explanation: 'jti (JWT ID) — случайный UUID для каждого токена. Без него два токена созданных в одну секунду для одного пользователя будут идентичны!'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Верификация токена',
            code: `package auth

import (
    "errors"
    "fmt"

    "github.com/golang-jwt/jwt/v5"
)

var (
    ErrInvalidToken = errors.New("invalid token")
    ErrExpiredToken  = errors.New("token expired")
)

func ParseToken(tokenStr string) (*Claims, error) {
    token, err := jwt.ParseWithClaims(
        tokenStr,
        &Claims{},
        func(token *jwt.Token) (interface{}, error) {
            // Проверяем алгоритм
            if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
            }
            return jwtSecret, nil
        },
    )

    if err != nil {
        if errors.Is(err, jwt.ErrTokenExpired) {
            return nil, ErrExpiredToken
        }
        return nil, ErrInvalidToken
    }

    claims, ok := token.Claims.(*Claims)
    if !ok || !token.Valid {
        return nil, ErrInvalidToken
    }

    return claims, nil
}`,
            explanation: 'Всегда проверяйте алгоритм подписи! Атака "alg:none" — злоумышленник убирает подпись. jwt.ErrTokenExpired — для отдельной обработки (refresh flow).'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'JWT middleware и Login handler',
            code: `package main

import (
    "context"
    "encoding/json"
    "net/http"
    "strings"
)

type ctxKey string
const claimsKey ctxKey = "claims"

// Middleware: проверяет JWT в заголовке Authorization
func JWTAuth(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        authHeader := r.Header.Get("Authorization")
        if !strings.HasPrefix(authHeader, "Bearer ") {
            http.Error(w, \`{"error":"missing token"}\`, http.StatusUnauthorized)
            return
        }

        tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
        claims, err := ParseToken(tokenStr)
        if err != nil {
            http.Error(w, \`{"error":"invalid token"}\`, http.StatusUnauthorized)
            return
        }

        ctx := context.WithValue(r.Context(), claimsKey, claims)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// Login handler
func loginHandler(w http.ResponseWriter, r *http.Request) {
    var req struct {
        Email    string \`json:"email"\`
        Password string \`json:"password"\`
    }
    json.NewDecoder(r.Body).Decode(&req)

    // Проверка credentials (упрощённо)
    user, err := userService.Authenticate(req.Email, req.Password)
    if err != nil {
        http.Error(w, \`{"error":"invalid credentials"}\`, http.StatusUnauthorized)
        return
    }

    token, _ := GenerateToken(user.ID, user.Email, user.Role)

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "access_token": token,
        "token_type":   "Bearer",
    })
}`,
            explanation: 'Claims передаются через контекст. В обработчике: claims := r.Context().Value(claimsKey).(*Claims) → claims.UserID, claims.Role.'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<p><strong>Безопасность JWT:</strong></p>
            <ul>
                <li>Никогда не храните секрет в коде — используйте переменные окружения</li>
                <li>Короткий TTL access token: 15 минут</li>
                <li>Refresh token в HttpOnly cookie (защита от XSS)</li>
                <li>Храните refresh tokens в БД для инвалидации</li>
                <li>Всегда добавляйте jti для уникальности</li>
            </ul>`
        },
        {
            type: 'editor',
            title: 'Практика: защищённый маршрут',
            instructions: 'Добавьте к chi-роутеру защищённый маршрут GET /api/me, который возвращает данные текущего пользователя из JWT claims.',
            starterCode: `package main

import (
    "encoding/json"
    "net/http"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
)

type ctxKey string
const claimsKey ctxKey = "claims"

type Claims struct {
    UserID int    \`json:"user_id"\`
    Email  string \`json:"email"\`
    Role   string \`json:"role"\`
}

func main() {
    r := chi.NewRouter()
    r.Use(middleware.Logger)

    // Публичный маршрут
    r.Post("/login", loginHandler)

    // Защищённые маршруты
    r.Group(func(r chi.Router) {
        r.Use(JWTAuth) // ваш JWT middleware

        // Реализуйте GET /api/me
        // Достаньте claims из контекста
        // Верните JSON с user_id и email
    })

    http.ListenAndServe(":8080", r)
}`,
            hints: [
                'r.Get("/api/me", func(w http.ResponseWriter, r *http.Request) { ... })',
                'claims := r.Context().Value(claimsKey).(*Claims)',
                'json.NewEncoder(w).Encode(map[string]any{"user_id": claims.UserID, "email": claims.Email})',
                'w.Header().Set("Content-Type", "application/json")'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Зачем в JWT нужен jti (JWT ID)?',
                    options: [
                        'Уникальность токена — предотвращает дубликаты и позволяет инвалидировать конкретный токен',
                        'Идентификатор пользователя',
                        'Время создания',
                        'Алгоритм подписи'
                    ],
                    correct: 0,
                    explanation: 'jti — уникальный ID каждого токена. Без него два токена одного пользователя в одну секунду идентичны. Позволяет хранить список инвалидированных токенов.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Почему нужно проверять алгоритм подписи в jwt.ParseWithClaims?',
                    options: [
                        'Защита от атаки alg:none — токен без подписи',
                        'Для совместимости версий',
                        'Это требование стандарта JWT',
                        'Для ускорения верификации'
                    ],
                    correct: 0,
                    explanation: 'Атака alg:none: злоумышленник меняет header на {"alg":"none"} и убирает подпись. Проверка метода подписи блокирует это.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Где хранить refresh token?',
                    options: [
                        'В HttpOnly cookie (защита от XSS) + в БД (для инвалидации)',
                        'В localStorage браузера',
                        'В Authorization заголовке',
                        'В sessionStorage'
                    ],
                    correct: 0,
                    explanation: 'HttpOnly cookie недоступна для JavaScript. Хранение в БД позволяет инвалидировать (logout, smена пароля). localStorage уязвим для XSS.'
                }
            ]
        }
    ]
};
