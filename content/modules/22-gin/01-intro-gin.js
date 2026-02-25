export default {
    id: '22-01',
    title: 'Введение в Gin',
    description: 'Что такое Gin, почему он популярен, первый сервер',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
<h2>Gin — самый популярный Go-фреймворк</h2>
<p>Gin — это HTTP-фреймворк для Go с самым большим числом звёзд на GitHub среди Go-проектов (75k+ stars). Он используется в Tencent, Alibaba, многих стартапах по всему миру.</p>

<h3>Gin vs net/http vs Echo vs chi</h3>
<table style="width:100%;border-collapse:collapse">
    <tr style="background:var(--surface-2)">
        <th style="padding:10px;border:1px solid var(--border)">Критерий</th>
        <th style="padding:10px;border:1px solid var(--border)">net/http</th>
        <th style="padding:10px;border:1px solid var(--border)">chi</th>
        <th style="padding:10px;border:1px solid var(--border)">Echo</th>
        <th style="padding:10px;border:1px solid var(--border);color:#f59e0b">Gin</th>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)">⚡ Производительность</td>
        <td style="padding:10px;border:1px solid var(--border)">Базовая</td>
        <td style="padding:10px;border:1px solid var(--border)">Высокая</td>
        <td style="padding:10px;border:1px solid var(--border)">Высокая</td>
        <td style="padding:10px;border:1px solid var(--border);color:#4ade80">Очень высокая</td>
    </tr>
    <tr style="background:var(--surface-2)">
        <td style="padding:10px;border:1px solid var(--border)">⭐ GitHub Stars</td>
        <td style="padding:10px;border:1px solid var(--border)">stdlib</td>
        <td style="padding:10px;border:1px solid var(--border)">~17k</td>
        <td style="padding:10px;border:1px solid var(--border)">~30k</td>
        <td style="padding:10px;border:1px solid var(--border);color:#f59e0b">75k+</td>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)">📖 Документация</td>
        <td style="padding:10px;border:1px solid var(--border)">Хорошая</td>
        <td style="padding:10px;border:1px solid var(--border)">Минимальная</td>
        <td style="padding:10px;border:1px solid var(--border)">Хорошая</td>
        <td style="padding:10px;border:1px solid var(--border);color:#4ade80">Отличная</td>
    </tr>
    <tr style="background:var(--surface-2)">
        <td style="padding:10px;border:1px solid var(--border)">🧩 Middleware</td>
        <td style="padding:10px;border:1px solid var(--border)">Ручное</td>
        <td style="padding:10px;border:1px solid var(--border)">Много готовых</td>
        <td style="padding:10px;border:1px solid var(--border)">Много готовых</td>
        <td style="padding:10px;border:1px solid var(--border);color:#4ade80">Огромная экосистема</td>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)">🎯 Лучше для</td>
        <td style="padding:10px;border:1px solid var(--border)">Понимания основ</td>
        <td style="padding:10px;border:1px solid var(--border)">Минимализм</td>
        <td style="padding:10px;border:1px solid var(--border)">Чистый API</td>
        <td style="padding:10px;border:1px solid var(--border);color:#f59e0b">Быстрая разработка</td>
    </tr>
</table>

<h3>Когда выбирать Gin</h3>
<ul>
    <li>Нужна <strong>скорость разработки</strong> — богатая экосистема, много готового</li>
    <li>Много вакансий требуют знания Gin — <strong>востребован на рынке</strong></li>
    <li>Команда пришла из PHP/Laravel/Express — <strong>похожие концепции</strong></li>
    <li>Нужны готовые middleware: CORS, auth, rate limiting — <strong>всё есть из коробки</strong></li>
</ul>
`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Установка и первый сервер',
            code: `// 1. Установка
// go get github.com/gin-gonic/gin

package main

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

func main() {
    // Создаём роутер с дефолтными middleware (Logger + Recovery)
    r := gin.Default()

    // GET /ping — простой healthcheck
    r.GET("/ping", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message": "pong",
            "status":  "ok",
        })
    })

    // POST /users — создать пользователя
    r.POST("/users", func(c *gin.Context) {
        var user struct {
            Name  string \`json:"name"  binding:"required"\`
            Email string \`json:"email" binding:"required,email"\`
        }

        // Gin автоматически парсит JSON и валидирует теги binding
        if err := c.ShouldBindJSON(&user); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        c.JSON(http.StatusCreated, gin.H{
            "id":    1,
            "name":  user.Name,
            "email": user.Email,
        })
    })

    // Запуск на :8080
    r.Run(":8080")
}`,
            explanation: 'gin.Default() создаёт роутер с Logger (логирует запросы) и Recovery (перехватывает panic). gin.H — это просто map[string]interface{}. ShouldBindJSON — парсит тело запроса и валидирует поля.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<strong>gin.New() vs gin.Default():</strong><br>
            <code>gin.Default()</code> — с Logger и Recovery middleware (используй для разработки)<br>
            <code>gin.New()</code> — чистый роутер без middleware (настраивай сам для production)`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Режимы работы Gin',
            code: `package main

import "github.com/gin-gonic/gin"

func main() {
    // Режимы: debug (по умолчанию), release, test
    // В production ВСЕГДА используй release mode!
    gin.SetMode(gin.ReleaseMode)

    // Или через переменную окружения:
    // GIN_MODE=release go run main.go

    r := gin.New()

    // Добавляем только нужные middleware вручную
    r.Use(gin.Logger())    // логирование запросов
    r.Use(gin.Recovery())  // восстановление после panic

    r.GET("/", func(c *gin.Context) {
        c.String(200, "Hello from Gin in release mode!")
    })

    r.Run(":8080")
}`,
            explanation: 'В debug режиме Gin выводит все роуты при старте и подробные логи. В release — только ошибки. Разница в производительности незначительная, но в production принято использовать release.'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q2201-1',
                    type: 'single',
                    question: 'Чем gin.Default() отличается от gin.New()?',
                    options: [
                        'Default() быстрее New()',
                        'Default() включает Logger и Recovery middleware по умолчанию',
                        'New() поддерживает больше методов роутинга',
                        'Никакой разницы нет'
                    ],
                    correct: 1,
                    explanation: 'gin.Default() = gin.New() + Logger middleware + Recovery middleware. Logger пишет лог каждого запроса, Recovery перехватывает panic и возвращает 500 вместо падения сервера.'
                },
                {
                    id: 'q2201-2',
                    type: 'single',
                    question: 'Какой режим Gin нужно использовать в production?',
                    options: [
                        'debug — больше информации',
                        'test — для стабильности',
                        'release — меньше логов, лучше производительность',
                        'production — специальный режим'
                    ],
                    correct: 2,
                    explanation: 'gin.ReleaseMode (или GIN_MODE=release) отключает дебаг-вывод роутов при старте и уменьшает verbose логирование. В production это стандартная практика.'
                }
            ]
        }
    ]
};
