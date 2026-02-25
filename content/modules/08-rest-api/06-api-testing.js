export default {
    id: '08-06',
    title: 'Тестирование API (httptest)',
    description: 'net/http/httptest, тестирование хендлеров, интеграционные тесты, testcontainers',
    estimatedTime: 25,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>httptest — встроенный инструмент тестирования HTTP</h2>
                <p>Пакет <code>net/http/httptest</code> позволяет тестировать HTTP-обработчики без запуска реального сервера.</p>
                <ul>
                    <li><code>httptest.NewRecorder()</code> — записывает ответ</li>
                    <li><code>httptest.NewRequest()</code> — создаёт запрос</li>
                    <li><code>httptest.NewServer()</code> — реальный HTTP сервер (для клиентов)</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Тест хендлера с httptest',
            code: `package handler_test

import (
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestGetUser_Success(t *testing.T) {
    // Arrange
    repo := newMockUserRepo()
    repo.users[1] = &User{ID: 1, Name: "Alice", Email: "alice@example.com"}
    svc := NewUserService(repo)
    h := NewUserHandler(svc)

    // Act
    req := httptest.NewRequest(http.MethodGet, "/users/1", nil)
    w := httptest.NewRecorder()
    h.Get(w, req) // прямой вызов хендлера

    // Assert
    resp := w.Result()
    assert.Equal(t, http.StatusOK, resp.StatusCode)
    assert.Equal(t, "application/json", resp.Header.Get("Content-Type"))

    var user User
    require.NoError(t, json.NewDecoder(resp.Body).Decode(&user))
    assert.Equal(t, 1, user.ID)
    assert.Equal(t, "Alice", user.Name)
}

func TestGetUser_NotFound(t *testing.T) {
    repo := newMockUserRepo() // пустой репозиторий
    h := NewUserHandler(NewUserService(repo))

    req := httptest.NewRequest(http.MethodGet, "/users/99", nil)
    w := httptest.NewRecorder()
    h.Get(w, req)

    assert.Equal(t, http.StatusNotFound, w.Code)
}`,
            explanation: 'httptest.NewRecorder() — fake ResponseWriter, записывает всё. w.Code — код ответа, w.Body — тело, w.Result() — *http.Response.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Тест с chi роутером',
            code: `package handler_test

import (
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"

    "github.com/go-chi/chi/v5"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

// Вспомогательная функция для запросов
func makeRequest(t *testing.T, router http.Handler, method, path, body string, token string) *httptest.ResponseRecorder {
    t.Helper()
    var bodyReader *strings.Reader
    if body != "" {
        bodyReader = strings.NewReader(body)
    } else {
        bodyReader = strings.NewReader("")
    }

    req := httptest.NewRequest(method, path, bodyReader)
    req.Header.Set("Content-Type", "application/json")
    if token != "" {
        req.Header.Set("Authorization", "Bearer " + token)
    }

    w := httptest.NewRecorder()
    router.ServeHTTP(w, req) // через роутер — chi парсит {id}
    return w
}

func TestPostAPI(t *testing.T) {
    router := setupRouter() // создаём роутер с мок-зависимостями

    t.Run("create post", func(t *testing.T) {
        body := \`{"title":"Test Post","body":"Content"}\`
        w := makeRequest(t, router, "POST", "/api/v1/posts", body, testToken)
        require.Equal(t, http.StatusCreated, w.Code)

        var post Post
        json.NewDecoder(w.Body).Decode(&post)
        assert.NotZero(t, post.ID)
        assert.Equal(t, "Test Post", post.Title)
    })

    t.Run("get post", func(t *testing.T) {
        w := makeRequest(t, router, "GET", "/api/v1/posts/1", "", "")
        assert.Equal(t, http.StatusOK, w.Code)
    })

    t.Run("not found", func(t *testing.T) {
        w := makeRequest(t, router, "GET", "/api/v1/posts/999", "", "")
        assert.Equal(t, http.StatusNotFound, w.Code)
    })
}`,
            explanation: 'router.ServeHTTP(w, req) — запускает через chi: URL параметры парсятся. Вспомогательная makeRequest упрощает тесты. t.Helper() — правильная трассировка ошибок.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'httptest.NewServer — тесты HTTP клиентов',
            code: `package client_test

import (
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/stretchr/testify/assert"
)

func TestHTTPClient(t *testing.T) {
    // Поднимаем реальный HTTP сервер для теста
    server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        assert.Equal(t, "GET", r.Method)
        assert.Equal(t, "/users/1", r.URL.Path)

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]any{"id": 1, "name": "Alice"})
    }))
    defer server.Close() // всегда закрываем!

    // Тестируем наш HTTP клиент с реальным сервером
    client := NewAPIClient(server.URL)
    user, err := client.GetUser(1)

    assert.NoError(t, err)
    assert.Equal(t, "Alice", user.Name)
}`,
            explanation: 'httptest.NewServer запускает реальный TCP-сервер. server.URL — его адрес. Используйте для тестирования HTTP-клиентов. defer server.Close() обязателен.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Table-driven API тесты',
            code: `package api_test

import (
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/stretchr/testify/assert"
)

func TestCreateUser(t *testing.T) {
    router := setupTestRouter()

    tests := []struct {
        name       string
        body       string
        wantStatus int
        wantCode   string
    }{
        {
            name:       "valid user",
            body:       \`{"name":"Alice","email":"alice@example.com"}\`,
            wantStatus: http.StatusCreated,
        },
        {
            name:       "missing name",
            body:       \`{"email":"alice@example.com"}\`,
            wantStatus: http.StatusUnprocessableEntity,
            wantCode:   "VALIDATION_ERROR",
        },
        {
            name:       "invalid email",
            body:       \`{"name":"Alice","email":"not-email"}\`,
            wantStatus: http.StatusUnprocessableEntity,
            wantCode:   "VALIDATION_ERROR",
        },
        {
            name:       "invalid json",
            body:       \`not json\`,
            wantStatus: http.StatusBadRequest,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            w := makeRequest(t, router, "POST", "/api/users", tt.body, "")
            assert.Equal(t, tt.wantStatus, w.Code)

            if tt.wantCode != "" {
                var resp map[string]string
                json.NewDecoder(w.Body).Decode(&resp)
                assert.Equal(t, tt.wantCode, resp["code"])
            }
        })
    }
}`,
            explanation: 'Table-driven тесты для API — тестируем все коды ошибок. wantCode проверяет машиночитаемый код в ответе. Единый формат упрощает добавление кейсов.'
        },
        {
            type: 'editor',
            title: 'Практика: тест DELETE',
            instructions: 'Напишите table-driven тест для DELETE /users/{id}: успех (204), не найден (404), невалидный id (400).',
            starterCode: `package handler_test

import (
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/stretchr/testify/assert"
)

func TestDeleteUser(t *testing.T) {
    tests := []struct {
        name       string
        path       string
        setupUsers map[int]string
        wantStatus int
    }{
        {
            name:       "success",
            path:       "/users/1",
            setupUsers: map[int]string{1: "Alice"},
            wantStatus: http.StatusNoContent,
        },
        {
            name:       "not found",
            path:       "/users/99",
            setupUsers: map[int]string{},
            wantStatus: http.StatusNotFound,
        },
        {
            name:       "invalid id",
            path:       "/users/abc",
            setupUsers: map[int]string{},
            wantStatus: http.StatusBadRequest,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            router := setupTestRouterWithUsers(tt.setupUsers)
            req := httptest.NewRequest(http.MethodDelete, tt.path, nil)
            w := httptest.NewRecorder()
            router.ServeHTTP(w, req)
            assert.Equal(t, tt.wantStatus, w.Code)
        })
    }
}`,
            hints: [
                'Используйте httptest.NewRequest и httptest.NewRecorder',
                'router.ServeHTTP(w, req) — через роутер для парсинга {id}',
                'w.Code — код ответа (или w.Result().StatusCode)',
                'assert.Equal(t, tt.wantStatus, w.Code)'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Зачем router.ServeHTTP(w, req) вместо прямого вызова хендлера?',
                    options: [
                        'Чтобы chi мог распарсить параметры пути {id}',
                        'Для большей скорости',
                        'Чтобы работал middleware',
                        'Оба варианта А и В'
                    ],
                    correct: 3,
                    explanation: 'Через роутер: chi парсит {id} И выполняются все middleware (Auth, Logger). Прямой вызов — только сам хендлер без маршрутизации и middleware.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'httptest.NewRecorder vs httptest.NewServer:',
                    options: [
                        'Recorder — fake writer для unit-тестов; Server — реальный HTTP для тестов клиентов',
                        'Server быстрее Recorder',
                        'Recorder только для GET, Server для POST',
                        'Нет разницы'
                    ],
                    correct: 0,
                    explanation: 'Recorder не открывает сетевое соединение — быстрее для unit/integration тестов хендлеров. Server — реальный TCP, нужен когда тестируем HTTP-клиент.'
                }
            ]
        }
    ]
};
