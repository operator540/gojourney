export default {
    id: '08-01',
    title: 'Принципы REST',
    description: 'HTTP методы, статус-коды, ресурсы, идемпотентность, версионирование и HATEOAS — полное погружение в архитектуру REST',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Представьте библиотеку</h2>
                <p>В библиотеке есть <strong>ресурсы</strong> — книги. У каждой книги есть <strong>идентификатор</strong> — шифр на корешке (например, <code>ФА-7829</code>). Чтобы работать с книгами, вы используете стандартные <strong>операции</strong>: взять книгу, сдать книгу, узнать есть ли книга в наличии, обновить карточку книги.</p>
                <p>REST — это именно такая система для веб. Вместо книжных шифров — URL. Вместо операций библиотекаря — HTTP методы. И самое главное: библиотекарь не помнит вас между визитами (stateless) — каждый раз вы предъявляете читательский билет заново.</p>
                <p><strong>REST (Representational State Transfer)</strong> — архитектурный стиль, описанный Roy Fielding в 2000 году. Это не протокол и не стандарт — это набор ограничений, которые делают API предсказуемым, масштабируемым и понятным.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>6 принципов REST</h2>
                <p>Fielding выделил 6 ограничений (constraints). API, соблюдающий все 6 — настоящий RESTful:</p>
                <table style="width:100%; border-collapse:collapse; margin:16px 0;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="padding:10px 14px; text-align:left; border-bottom:2px solid var(--border); color:var(--accent);">Принцип</th>
                            <th style="padding:10px 14px; text-align:left; border-bottom:2px solid var(--border);">Что означает</th>
                            <th style="padding:10px 14px; text-align:left; border-bottom:2px solid var(--border);">Зачем нужен</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom:1px solid var(--border);">
                            <td style="padding:10px 14px; font-weight:bold;">Client-Server</td>
                            <td style="padding:10px 14px;">Клиент и сервер независимы</td>
                            <td style="padding:10px 14px;">Можно менять UI без изменения API и наоборот</td>
                        </tr>
                        <tr style="border-bottom:1px solid var(--border); background:var(--surface-2);">
                            <td style="padding:10px 14px; font-weight:bold;">Stateless</td>
                            <td style="padding:10px 14px;">Сервер не хранит состояние клиента</td>
                            <td style="padding:10px 14px;">Масштабирование: любой сервер обработает запрос</td>
                        </tr>
                        <tr style="border-bottom:1px solid var(--border);">
                            <td style="padding:10px 14px; font-weight:bold;">Cacheable</td>
                            <td style="padding:10px 14px;">Ответы можно кэшировать</td>
                            <td style="padding:10px 14px;">Снижение нагрузки, ускорение клиентов</td>
                        </tr>
                        <tr style="border-bottom:1px solid var(--border); background:var(--surface-2);">
                            <td style="padding:10px 14px; font-weight:bold;">Uniform Interface</td>
                            <td style="padding:10px 14px;">Единый интерфейс для всех ресурсов</td>
                            <td style="padding:10px 14px;">Предсказуемость: зная REST, знаешь любой API</td>
                        </tr>
                        <tr style="border-bottom:1px solid var(--border);">
                            <td style="padding:10px 14px; font-weight:bold;">Layered System</td>
                            <td style="padding:10px 14px;">Клиент не знает о промежуточных серверах</td>
                            <td style="padding:10px 14px;">Можно добавлять балансировщики, кэши незаметно</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:10px 14px; font-weight:bold;">Code on Demand*</td>
                            <td style="padding:10px 14px;">Сервер может слать исполняемый код</td>
                            <td style="padding:10px 14px;">Опционально. JavaScript в браузере — пример</td>
                        </tr>
                    </tbody>
                </table>
                <p>На практике большинство API называют себя "REST", соблюдая первые 5 принципов. Это приемлемо.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Ресурсы, URL и HTTP методы</h2>
                <p>В REST <strong>всё — ресурс</strong>. URL — это адрес ресурса (существительное), HTTP метод — действие (глагол).</p>
                <p><strong>Правила хороших URL:</strong></p>
                <ul>
                    <li>Используйте существительные во множественном числе: <code>/users</code>, <code>/posts</code>, <code>/orders</code></li>
                    <li>Не используйте глаголы: <code>/getUser</code>, <code>/createPost</code> — это не REST</li>
                    <li>Строчные буквы и дефисы: <code>/blog-posts</code>, не <code>/blogPosts</code></li>
                    <li>Вложенность максимум 2-3 уровня: <code>/users/{id}/posts/{postId}</code></li>
                </ul>
                <table style="width:100%; border-collapse:collapse; margin:16px 0;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="padding:10px 14px; text-align:left; border-bottom:2px solid var(--border); color:var(--accent);">URL</th>
                            <th style="padding:10px 14px; text-align:left; border-bottom:2px solid var(--border); color:var(--accent);">Метод</th>
                            <th style="padding:10px 14px; text-align:left; border-bottom:2px solid var(--border);">Действие</th>
                            <th style="padding:10px 14px; text-align:left; border-bottom:2px solid var(--border);">Код ответа</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom:1px solid var(--border);"><td style="padding:10px 14px;"><code>/users</code></td><td style="padding:10px 14px; color:#22c55e;">GET</td><td style="padding:10px 14px;">Список всех пользователей</td><td style="padding:10px 14px;">200 OK</td></tr>
                        <tr style="border-bottom:1px solid var(--border); background:var(--surface-2);"><td style="padding:10px 14px;"><code>/users</code></td><td style="padding:10px 14px; color:#f59e0b;">POST</td><td style="padding:10px 14px;">Создать пользователя</td><td style="padding:10px 14px;">201 Created</td></tr>
                        <tr style="border-bottom:1px solid var(--border);"><td style="padding:10px 14px;"><code>/users/{id}</code></td><td style="padding:10px 14px; color:#22c55e;">GET</td><td style="padding:10px 14px;">Получить пользователя</td><td style="padding:10px 14px;">200 OK</td></tr>
                        <tr style="border-bottom:1px solid var(--border); background:var(--surface-2);"><td style="padding:10px 14px;"><code>/users/{id}</code></td><td style="padding:10px 14px; color:#3b82f6;">PUT</td><td style="padding:10px 14px;">Полная замена пользователя</td><td style="padding:10px 14px;">200 OK</td></tr>
                        <tr style="border-bottom:1px solid var(--border);"><td style="padding:10px 14px;"><code>/users/{id}</code></td><td style="padding:10px 14px; color:#8b5cf6;">PATCH</td><td style="padding:10px 14px;">Частичное обновление</td><td style="padding:10px 14px;">200 OK</td></tr>
                        <tr style="border-bottom:1px solid var(--border); background:var(--surface-2);"><td style="padding:10px 14px;"><code>/users/{id}</code></td><td style="padding:10px 14px; color:#ef4444;">DELETE</td><td style="padding:10px 14px;">Удалить пользователя</td><td style="padding:10px 14px;">204 No Content</td></tr>
                        <tr><td style="padding:10px 14px;"><code>/users/{id}/posts</code></td><td style="padding:10px 14px; color:#22c55e;">GET</td><td style="padding:10px 14px;">Посты пользователя</td><td style="padding:10px 14px;">200 OK</td></tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'CRUD роутинг с chi — правильная структура URL',
            code: `package main

import (
    "net/http"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
)

func main() {
    r := chi.NewRouter()
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)

    // Версионирование API — хорошая практика
    // /api/v1 позволяет выпустить /api/v2 без поломки старых клиентов
    r.Route("/api/v1", func(r chi.Router) {

        // Ресурс: пользователи
        r.Get("/users", listUsers)       // GET  /api/v1/users
        r.Post("/users", createUser)     // POST /api/v1/users

        r.Route("/users/{id}", func(r chi.Router) {
            r.Get("/", getUser)          // GET    /api/v1/users/123
            r.Put("/", updateUser)       // PUT    /api/v1/users/123
            r.Patch("/", patchUser)      // PATCH  /api/v1/users/123
            r.Delete("/", deleteUser)    // DELETE /api/v1/users/123

            // Вложенный ресурс: посты пользователя
            // Максимум 2-3 уровня вложенности — глубже нечитаемо
            r.Get("/posts", getUserPosts)   // GET /api/v1/users/123/posts
            r.Post("/posts", createUserPost) // POST /api/v1/users/123/posts
        })

        // Ресурс: посты
        r.Get("/posts", listPosts)
        r.Post("/posts", createPost)

        r.Route("/posts/{id}", func(r chi.Router) {
            r.Get("/", getPost)
            r.Put("/", updatePost)
            r.Delete("/", deletePost)

            // Действия — исключение из правил. Когда нет подходящего HTTP метода:
            r.Post("/publish", publishPost) // POST /api/v1/posts/123/publish
            r.Post("/like", likePost)       // POST /api/v1/posts/123/like
        })
    })

    http.ListenAndServe(":8080", r)
}

// Заглушки для компиляции
func listUsers(w http.ResponseWriter, r *http.Request)      {}
func createUser(w http.ResponseWriter, r *http.Request)     {}
func getUser(w http.ResponseWriter, r *http.Request)        {}
func updateUser(w http.ResponseWriter, r *http.Request)     {}
func patchUser(w http.ResponseWriter, r *http.Request)      {}
func deleteUser(w http.ResponseWriter, r *http.Request)     {}
func getUserPosts(w http.ResponseWriter, r *http.Request)   {}
func createUserPost(w http.ResponseWriter, r *http.Request) {}
func listPosts(w http.ResponseWriter, r *http.Request)      {}
func createPost(w http.ResponseWriter, r *http.Request)     {}
func getPost(w http.ResponseWriter, r *http.Request)        {}
func updatePost(w http.ResponseWriter, r *http.Request)     {}
func deletePost(w http.ResponseWriter, r *http.Request)     {}
func publishPost(w http.ResponseWriter, r *http.Request)    {}
func likePost(w http.ResponseWriter, r *http.Request)       {}`,
            explanation: 'Версионирование /api/v1 в пути — самый распространённый подход. Альтернативы: заголовок Accept: application/vnd.api+json;version=1 или Accept-Version: v1. Действия типа /publish — допустимое исключение, когда нет подходящего CRUD-метода.'
        },
        {
            type: 'theory',
            content: `
                <h2>HTTP статус-коды — язык API</h2>
                <p>Статус-коды — это часть контракта REST. Клиент должен понимать результат <strong>без чтения тела ответа</strong>. Правильные коды = профессиональный API.</p>
                <table style="width:100%; border-collapse:collapse; margin:16px 0;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="padding:10px 14px; text-align:left; border-bottom:2px solid var(--border); color:var(--accent);">Код</th>
                            <th style="padding:10px 14px; text-align:left; border-bottom:2px solid var(--border);">Название</th>
                            <th style="padding:10px 14px; text-align:left; border-bottom:2px solid var(--border);">Когда использовать</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom:1px solid var(--border);"><td style="padding:10px 14px; color:#22c55e; font-weight:bold;">200</td><td style="padding:10px 14px;">OK</td><td style="padding:10px 14px;">Успешный GET, PUT, PATCH — есть тело ответа</td></tr>
                        <tr style="border-bottom:1px solid var(--border); background:var(--surface-2);"><td style="padding:10px 14px; color:#22c55e; font-weight:bold;">201</td><td style="padding:10px 14px;">Created</td><td style="padding:10px 14px;">Успешный POST — ресурс создан</td></tr>
                        <tr style="border-bottom:1px solid var(--border);"><td style="padding:10px 14px; color:#22c55e; font-weight:bold;">204</td><td style="padding:10px 14px;">No Content</td><td style="padding:10px 14px;">Успешный DELETE — тела нет</td></tr>
                        <tr style="border-bottom:1px solid var(--border); background:var(--surface-2);"><td style="padding:10px 14px; color:#f59e0b; font-weight:bold;">400</td><td style="padding:10px 14px;">Bad Request</td><td style="padding:10px 14px;">Невалидный JSON, неверный тип поля</td></tr>
                        <tr style="border-bottom:1px solid var(--border);"><td style="padding:10px 14px; color:#f59e0b; font-weight:bold;">401</td><td style="padding:10px 14px;">Unauthorized</td><td style="padding:10px 14px;">Нет токена или токен невалиден</td></tr>
                        <tr style="border-bottom:1px solid var(--border); background:var(--surface-2);"><td style="padding:10px 14px; color:#f59e0b; font-weight:bold;">403</td><td style="padding:10px 14px;">Forbidden</td><td style="padding:10px 14px;">Токен есть, но нет прав на операцию</td></tr>
                        <tr style="border-bottom:1px solid var(--border);"><td style="padding:10px 14px; color:#f59e0b; font-weight:bold;">404</td><td style="padding:10px 14px;">Not Found</td><td style="padding:10px 14px;">Ресурс не существует</td></tr>
                        <tr style="border-bottom:1px solid var(--border); background:var(--surface-2);"><td style="padding:10px 14px; color:#f59e0b; font-weight:bold;">409</td><td style="padding:10px 14px;">Conflict</td><td style="padding:10px 14px;">Конфликт: email уже занят, версия устарела</td></tr>
                        <tr style="border-bottom:1px solid var(--border);"><td style="padding:10px 14px; color:#f59e0b; font-weight:bold;">422</td><td style="padding:10px 14px;">Unprocessable Entity</td><td style="padding:10px 14px;">JSON корректен, но данные не прошли валидацию</td></tr>
                        <tr style="border-bottom:1px solid var(--border); background:var(--surface-2);"><td style="padding:10px 14px; color:#f59e0b; font-weight:bold;">429</td><td style="padding:10px 14px;">Too Many Requests</td><td style="padding:10px 14px;">Rate limiting — слишком много запросов</td></tr>
                        <tr><td style="padding:10px 14px; color:#ef4444; font-weight:bold;">500</td><td style="padding:10px 14px;">Internal Server Error</td><td style="padding:10px 14px;">Ошибка сервера — логируем, клиенту общий ответ</td></tr>
                    </tbody>
                </table>
                <p><strong>Тонкость 401 vs 403:</strong> 401 = "Кто вы?" (нет аутентификации), 403 = "Я знаю кто вы, но нет" (нет авторизации).</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Идемпотентность — почему это важно',
            code: `package main

import (
    "encoding/json"
    "errors"
    "net/http"
    "strconv"

    "github.com/go-chi/chi/v5"
)

// Идемпотентность: повторный вызов с теми же данными
// даёт тот же результат что и первый вызов.
//
// Зачем это важно? Надёжность:
// - Потеря сети: клиент не знает, дошёл ли запрос
// - Идемпотентный метод можно повторить безопасно
// - POST нельзя повторять — создаст дубликат

// ✅ GET — идемпотентен: повторный запрос = те же данные
func getProduct(w http.ResponseWriter, r *http.Request) {
    id, _ := strconv.Atoi(chi.URLParam(r, "id"))
    product, err := db.FindProduct(id)
    if errors.Is(err, ErrNotFound) {
        w.WriteHeader(http.StatusNotFound)
        return
    }
    writeJSON(w, http.StatusOK, product)
}

// ✅ PUT — идемпотентен: устанавливает конкретное состояние
// PUT /products/5 с одними данными всегда = один результат
func replaceProduct(w http.ResponseWriter, r *http.Request) {
    id, _ := strconv.Atoi(chi.URLParam(r, "id"))
    var input ProductInput
    json.NewDecoder(r.Body).Decode(&input)

    // Полная замена — идемпотентна
    product := Product{
        ID:    id,
        Name:  input.Name,
        Price: input.Price,
        Stock: input.Stock,
    }
    db.Save(&product) // save = upsert
    writeJSON(w, http.StatusOK, product)
}

// ❌ POST — НЕ идемпотентен: каждый вызов создаёт новый ресурс
func createProduct(w http.ResponseWriter, r *http.Request) {
    var input ProductInput
    json.NewDecoder(r.Body).Decode(&input)

    // Каждый вызов = новый продукт с новым ID
    product := Product{Name: input.Name, Price: input.Price}
    db.Create(&product) // новый ID каждый раз!
    writeJSON(w, http.StatusCreated, product)
}

// ✅ DELETE — идемпотентен: результат = ресурс не существует
// Первый DELETE → 204 (удалён)
// Повторный DELETE → 404 (уже не существует, но состояние то же!)
func deleteProduct(w http.ResponseWriter, r *http.Request) {
    id, _ := strconv.Atoi(chi.URLParam(r, "id"))
    if err := db.Delete(id); errors.Is(err, ErrNotFound) {
        w.WriteHeader(http.StatusNotFound)
        return
    }
    w.WriteHeader(http.StatusNoContent) // 204 — тела нет!
}

// Защита POST от дубликатов: Idempotency-Key
// Клиент генерирует UUID, сервер дедуплицирует по ключу
func createOrder(w http.ResponseWriter, r *http.Request) {
    idempotencyKey := r.Header.Get("Idempotency-Key")
    if idempotencyKey != "" {
        // Проверяем, не обработан ли уже этот ключ
        if cached := cache.Get(idempotencyKey); cached != nil {
            writeJSON(w, http.StatusOK, cached) // возвращаем прошлый ответ
            return
        }
    }
    // ... создаём заказ, сохраняем в кэш по ключу
}`,
            explanation: 'Идемпотентность критична для надёжных систем. Stripe и другие API требуют Idempotency-Key для POST запросов — клиент генерирует UUID, сервер дедуплицирует. DELETE возвращает 404 при повторном вызове, но это всё равно идемпотентно — состояние системы одинаково.'
        },
        {
            type: 'theory',
            content: `
                <h2>Версионирование API</h2>
                <p>API — это контракт. Изменение контракта ломает клиентов. Версионирование решает эту проблему.</p>
                <table style="width:100%; border-collapse:collapse; margin:16px 0;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="padding:10px 14px; text-align:left; border-bottom:2px solid var(--border); color:var(--accent);">Подход</th>
                            <th style="padding:10px 14px; text-align:left; border-bottom:2px solid var(--border);">Пример</th>
                            <th style="padding:10px 14px; text-align:left; border-bottom:2px solid var(--border);">Плюсы / Минусы</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom:1px solid var(--border);"><td style="padding:10px 14px; font-weight:bold;">URL path</td><td style="padding:10px 14px;"><code>/api/v1/users</code></td><td style="padding:10px 14px;">✅ Просто, видно в логах. ❌ URL "засоряется"</td></tr>
                        <tr style="border-bottom:1px solid var(--border); background:var(--surface-2);"><td style="padding:10px 14px; font-weight:bold;">Query param</td><td style="padding:10px 14px;"><code>/api/users?v=1</code></td><td style="padding:10px 14px;">✅ Гибко. ❌ Не кэшируется корректно</td></tr>
                        <tr style="border-bottom:1px solid var(--border);"><td style="padding:10px 14px; font-weight:bold;">Header</td><td style="padding:10px 14px;"><code>Accept-Version: v1</code></td><td style="padding:10px 14px;">✅ Чистые URL. ❌ Сложнее тестировать в браузере</td></tr>
                        <tr><td style="padding:10px 14px; font-weight:bold;">Content-Type</td><td style="padding:10px 14px;"><code>Accept: application/vnd.api.v1+json</code></td><td style="padding:10px 14px;">✅ Стандарт REST. ❌ Самый сложный</td></tr>
                    </tbody>
                </table>
                <p><strong>На практике 90% API используют URL path</strong> — это наглядно, легко понять из логов, просто реализовать. GitHub, Stripe, Twitter — все используют <code>/v1/</code> в пути.</p>
            `
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<strong>HATEOAS — опциональный 6-й уровень REST</strong>
            <p>HATEOAS (Hypermedia As The Engine Of Application State) — ответ содержит ссылки на следующие действия. Клиент не знает URL заранее — он "открывает" API как веб-страницу:</p>
            <pre style="background:var(--surface-2); padding:12px; border-radius:6px; margin-top:8px; font-size:13px;">{
  "id": 123,
  "name": "Alice",
  "_links": {
    "self":   { "href": "/users/123" },
    "posts":  { "href": "/users/123/posts" },
    "delete": { "href": "/users/123", "method": "DELETE" }
  }
}</pre>
            <p>На практике HATEOAS редко реализуется полностью. Большинство "REST API" — это скорее HTTP API с соглашениями. Это нормально.</p>`
        },
        {
            type: 'editor',
            title: 'Практика: REST роутинг для интернет-магазина',
            instructions: 'Создайте chi-роутер для ресурсов /api/v1/products и /api/v1/orders. Для products: все 5 CRUD маршрутов. Для orders: GET список, POST создание, GET/{id} получение, POST/{id}/cancel отмена заказа.',
            starterCode: `package main

import (
    "encoding/json"
    "net/http"
    "strconv"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
)

type Product struct {
    ID    int     \`json:"id"\`
    Name  string  \`json:"name"\`
    Price float64 \`json:"price"\`
    Stock int     \`json:"stock"\`
}

type Order struct {
    ID     int    \`json:"id"\`
    Status string \`json:"status"\`
}

var products = map[int]Product{1: {1, "Go Book", 29.99, 100}}
var orders = map[int]Order{1: {1, "pending"}}
var nextProductID, nextOrderID = 2, 2

func main() {
    r := chi.NewRouter()
    r.Use(middleware.Logger)

    r.Route("/api/v1", func(r chi.Router) {
        // TODO: Добавьте маршруты для products:
        // GET /products, POST /products
        // GET /products/{id}, PUT /products/{id}, DELETE /products/{id}

        // TODO: Добавьте маршруты для orders:
        // GET /orders, POST /orders
        // GET /orders/{id}
        // POST /orders/{id}/cancel
    })

    http.ListenAndServe(":8080", r)
}`,
            hints: [
                'r.Route("/products", func(r chi.Router) { r.Get("/", ...) r.Post("/", ...) })',
                'r.Route("/products/{id}", func(r chi.Router) { r.Get("/", ...) r.Put("/", ...) r.Delete("/", ...) })',
                'id, err := strconv.Atoi(chi.URLParam(r, "id")) — для парсинга {id}',
                'Для cancel: r.Post("/orders/{id}/cancel", cancelOrder) — действия через POST',
                'DELETE возвращает w.WriteHeader(http.StatusNoContent) — тела нет!',
                'json.NewEncoder(w).Encode(products) — для списка',
                '_ = strconv.Atoi — чтобы не было ошибки "unused import"'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что означает "stateless" в REST?',
                    options: [
                        'Сервер не хранит состояние клиента между запросами — каждый запрос самодостаточен',
                        'API работает без базы данных',
                        'Сервер не хранит файлы',
                        'Запросы не имеют заголовков'
                    ],
                    correct: 0,
                    explanation: 'Stateless: каждый запрос несёт всё необходимое (токен, параметры). Сервер не помнит предыдущих запросов. Это позволяет горизонтально масштабировать — любой сервер в кластере обработает запрос.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Какой HTTP метод использовать для создания ресурса?',
                    options: [
                        'POST → 201 Created',
                        'GET → 200 OK',
                        'PUT → 200 OK',
                        'CREATE → 201 Created'
                    ],
                    correct: 0,
                    explanation: 'POST /users создаёт ресурс, возвращает 201 Created. Тело ответа — созданный ресурс. Хорошая практика: добавить заголовок Location: /users/123 с URL нового ресурса.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Что такое идемпотентность?',
                    options: [
                        'Повторный вызов с теми же данными даёт тот же результат',
                        'Запрос не изменяет данные на сервере',
                        'Запрос всегда завершается успехом',
                        'Запрос не требует авторизации'
                    ],
                    correct: 0,
                    explanation: 'GET, PUT, DELETE — идемпотентны. POST — нет (каждый вызов создаёт новый ресурс). Идемпотентность важна для retry-логики: при ошибке сети клиент может безопасно повторить PUT/DELETE.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'В чём разница между 401 и 403?',
                    options: [
                        '401 = нет аутентификации ("Кто вы?"), 403 = нет авторизации ("Я знаю кто вы, но нет")',
                        '401 = неверный пароль, 403 = истёк токен',
                        '401 для API, 403 для веб-страниц',
                        'Разницы нет — оба означают "нет доступа"'
                    ],
                    correct: 0,
                    explanation: '401 Unauthorized (неудачное название) = нет токена или токен невалидный. 403 Forbidden = токен действителен, личность установлена, но нет прав на операцию. Например: удалить чужой пост — это 403.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Какой код возвращать при успешном DELETE?',
                    options: [
                        '204 No Content — успех без тела ответа',
                        '200 OK — всегда при успехе',
                        '201 Created — ресурс изменён',
                        '202 Accepted — операция принята'
                    ],
                    correct: 0,
                    explanation: '204 No Content — стандарт для DELETE. Нет тела ответа. 200 OK тоже допустимо, если хотите вернуть удалённый объект. 202 Accepted — для асинхронных операций (удаление поставлено в очередь).'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Почему URL /getUser/123 нарушает принципы REST?',
                    options: [
                        'URL должен именовать ресурс (существительное), действие — в HTTP методе: GET /users/123',
                        '/getUser слишком длинный',
                        'Нужно использовать query параметры: /user?id=123',
                        'REST не поддерживает числовые ID'
                    ],
                    correct: 0,
                    explanation: 'В REST URL = существительное (ресурс), HTTP метод = глагол (действие). /getUser — это RPC-стиль. Правильно: GET /users/123. Метод GET уже говорит что мы получаем данные, не нужно дублировать в URL.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'POST /api/v1/posts/123/publish — это REST нарушение?',
                    options: [
                        'Нет — это допустимое исключение для действий, которые сложно выразить CRUD-ом',
                        'Да — нельзя использовать глаголы в URL',
                        'Да — нужно PUT /api/v1/posts/123 с {"status":"published"}',
                        'Да — нужно POST /api/v1/publishes'
                    ],
                    correct: 0,
                    explanation: 'Оба варианта приемлемы. POST /posts/123/publish — читаемо и явно. PUT /posts/123 с телом {"status":"published"} — более "чистый" REST. На практике действия через POST широко приняты (GitHub, Stripe используют этот подход).'
                },
                {
                    id: 'q8',
                    type: 'multiple',
                    question: 'Какие HTTP методы идемпотентны? (выберите все правильные)',
                    options: [
                        'GET',
                        'POST',
                        'PUT',
                        'DELETE',
                        'PATCH'
                    ],
                    correct: [0, 2, 3],
                    explanation: 'GET, PUT, DELETE — идемпотентны. POST всегда создаёт новый ресурс. PATCH может быть неидемпотентным (например: PATCH /counter с {"increment": 1} — каждый вызов меняет результат).'
                }
            ]
        }
    ]
};
