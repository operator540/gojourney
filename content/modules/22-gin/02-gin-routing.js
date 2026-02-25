export default {
    id: '22-02',
    title: 'Роутинг в Gin',
    description: 'Параметры пути, query-параметры, группы роутов, wildcards',
    estimatedTime: 25,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `<h2>Роутинг в Gin</h2>
<p>Gin использует <strong>radix tree</strong> для роутинга — это позволяет искать нужный обработчик за O(log n) даже при тысячах роутов. Именно это делает Gin таким быстрым.</p>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Все виды роутов',
            code: `r := gin.Default()

// ─── HTTP методы ───────────────────────────────
r.GET("/users", listUsers)
r.POST("/users", createUser)
r.PUT("/users/:id", updateUser)
r.PATCH("/users/:id", patchUser)
r.DELETE("/users/:id", deleteUser)
r.HEAD("/users", headUsers)
r.OPTIONS("/users", optionsUsers)

// Любой метод
r.Any("/webhook", handleWebhook)

// ─── Параметры пути ────────────────────────────
r.GET("/users/:id", func(c *gin.Context) {
    id := c.Param("id")         // ":id" → "123"
    c.JSON(200, gin.H{"id": id})
})

// Wildcard — захватывает всё включая /
r.GET("/static/*filepath", func(c *gin.Context) {
    path := c.Param("filepath") // "/images/logo.png"
    c.File("." + path)
})

// ─── Query параметры ───────────────────────────
// GET /search?q=golang&page=2&limit=20
r.GET("/search", func(c *gin.Context) {
    query := c.Query("q")              // "golang"
    page := c.DefaultQuery("page", "1") // "2" или "1" если нет
    limit := c.DefaultQuery("limit", "10")

    c.JSON(200, gin.H{
        "query": query,
        "page":  page,
        "limit": limit,
    })
})`,
            explanation: ':id — обязательный параметр, не может содержать /. *filepath — wildcard, захватывает весь оставшийся путь включая /. DefaultQuery — возвращает значение по умолчанию если параметр не передан.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Группировка роутов',
            code: `r := gin.Default()

// ─── API v1 группа ─────────────────────────────
v1 := r.Group("/api/v1")
{
    // /api/v1/users
    v1.GET("/users", listUsersV1)
    v1.POST("/users", createUserV1)

    // Вложенная группа /api/v1/users/:id/posts
    users := v1.Group("/users/:id")
    {
        users.GET("/posts", getUserPosts)
        users.POST("/posts", createUserPost)
    }
}

// ─── API v2 группа с middleware ────────────────
v2 := r.Group("/api/v2", authMiddleware())
{
    v2.GET("/users", listUsersV2)  // требует авторизацию
}

// ─── Admin группа с несколькими middleware ─────
admin := r.Group("/admin")
admin.Use(authMiddleware(), adminOnlyMiddleware())
{
    admin.GET("/stats", getStats)
    admin.DELETE("/users/:id", deleteUser)
}`,
            explanation: 'Группы позволяют применить общий prefix и middleware к набору роутов. Фигурные скобки {} — просто стилистика для читаемости, Go их не требует.'
        },
        {
            type: 'editor',
            title: 'Практика: Роутер для блога',
            starterCode: `package main

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()

    // TODO: создай группу /api/v1
    // Внутри группы добавь:
    //   GET  /posts         — список постов
    //   GET  /posts/:id     — один пост
    //   POST /posts         — создать пост
    //   DELETE /posts/:id   — удалить пост

    r.Run(":8080")
}

func listPosts(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"posts": []string{"post1", "post2"}})
}

func getPost(c *gin.Context) {
    id := c.Param("id")
    c.JSON(http.StatusOK, gin.H{"id": id, "title": "My Post"})
}

func createPost(c *gin.Context) {
    c.JSON(http.StatusCreated, gin.H{"message": "created"})
}

func deletePost(c *gin.Context) {
    id := c.Param("id")
    c.JSON(http.StatusOK, gin.H{"deleted": id})
}`,
            hints: [
                'v1 := r.Group("/api/v1")',
                'Внутри группы: v1.GET("/posts", listPosts)',
                'Параметр пути: v1.GET("/posts/:id", getPost)',
                'Не забудь POST и DELETE с :id'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q2202-1',
                    type: 'single',
                    question: 'Чем отличается :id от *filepath в роутинге Gin?',
                    options: [
                        ':id обязательный, *filepath опциональный',
                        ':id не может содержать /, *filepath захватывает весь остаток пути включая /',
                        ':id для чисел, *filepath для строк',
                        'Никакой разницы нет'
                    ],
                    correct: 1,
                    explanation: ':id — именованный параметр, захватывает один сегмент пути (между /). Не может содержать /. *filepath — wildcard, захватывает всё до конца URL включая дополнительные /.'
                }
            ]
        }
    ]
};
