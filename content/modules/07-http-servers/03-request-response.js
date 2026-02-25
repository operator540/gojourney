export default {
    id: '07-03',
    title: 'Request и Response',
    description: 'Детали http.Request, заголовки, куки, редиректы, форм-данные, multipart',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Структура http.Request</h2>
                <p>Запрос содержит всё о входящем HTTP-сообщении:</p>
                <ul>
                    <li><code>Method</code> — GET, POST, PUT, DELETE...</li>
                    <li><code>URL</code> — разобранный URL</li>
                    <li><code>Header</code> — заголовки (map[string][]string)</li>
                    <li><code>Body</code> — тело (io.ReadCloser)</li>
                    <li><code>Form</code> — form-данные (после ParseForm)</li>
                    <li><code>RemoteAddr</code> — адрес клиента</li>
                    <li><code>Context()</code> — контекст запроса</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Детальный разбор Request',
            code: `package main

import (
    "fmt"
    "net/http"
)

func inspectHandler(w http.ResponseWriter, r *http.Request) {
    // URL компоненты: /search?q=golang&page=2
    fmt.Println("Path:", r.URL.Path)            // /search
    fmt.Println("RawQuery:", r.URL.RawQuery)    // q=golang&page=2
    fmt.Println("Host:", r.Host)               // localhost:8080

    // Query параметры
    q := r.URL.Query()
    fmt.Println("q:", q.Get("q"))              // golang
    fmt.Println("page:", q.Get("page"))        // 2

    // Все значения параметра (например ?tag=go&tag=web)
    tags := q["tag"]
    fmt.Println("tags:", tags)                 // [go web]

    // Заголовки
    fmt.Println("Auth:", r.Header.Get("Authorization"))
    fmt.Println("UA:", r.Header.Get("User-Agent"))

    // Удалённый адрес клиента
    fmt.Println("RemoteAddr:", r.RemoteAddr)   // 127.0.0.1:54321

    fmt.Fprintf(w, "OK")
}`,
            explanation: 'r.URL.Query() парсит строку запроса. q["tag"] — все значения параметра (для множественных). Header.Get возвращает первое значение.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Работа с куками',
            code: `package main

import (
    "fmt"
    "net/http"
    "time"
)

func setCookieHandler(w http.ResponseWriter, r *http.Request) {
    // Установка куки
    http.SetCookie(w, &http.Cookie{
        Name:     "session",
        Value:    "abc123xyz",
        Path:     "/",
        Expires:  time.Now().Add(24 * time.Hour),
        HttpOnly: true,    // недоступна из JavaScript
        Secure:   true,    // только HTTPS
        SameSite: http.SameSiteStrictMode,
    })
    fmt.Fprintf(w, "Cookie set")
}

func readCookieHandler(w http.ResponseWriter, r *http.Request) {
    // Чтение куки
    cookie, err := r.Cookie("session")
    if err == http.ErrNoCookie {
        http.Error(w, "no session", http.StatusUnauthorized)
        return
    }
    fmt.Fprintf(w, "Session: %s", cookie.Value)
}

func deleteCookieHandler(w http.ResponseWriter, r *http.Request) {
    // Удаление куки — устанавливаем срок в прошлом
    http.SetCookie(w, &http.Cookie{
        Name:    "session",
        Value:   "",
        Expires: time.Unix(0, 0),
        MaxAge:  -1,
    })
    fmt.Fprintf(w, "Cookie deleted")
}`,
            explanation: 'HttpOnly защищает от XSS. Secure — только HTTPS. SameSiteStrictMode защищает от CSRF. MaxAge: -1 удаляет куку немедленно.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Form-данные',
            code: `package main

import (
    "fmt"
    "net/http"
)

func loginHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "POST only", http.StatusMethodNotAllowed)
        return
    }

    // Парсинг application/x-www-form-urlencoded
    if err := r.ParseForm(); err != nil {
        http.Error(w, "invalid form", http.StatusBadRequest)
        return
    }

    username := r.FormValue("username")  // r.ParseForm() вызывает автоматически
    password := r.FormValue("password")

    if username == "" || password == "" {
        http.Error(w, "missing credentials", http.StatusBadRequest)
        return
    }

    fmt.Fprintf(w, "Login: %s", username)
}

func uploadHandler(w http.ResponseWriter, r *http.Request) {
    // multipart/form-data (загрузка файлов)
    // Ограничение 10 МБ
    r.ParseMultipartForm(10 << 20)

    file, header, err := r.FormFile("photo")
    if err != nil {
        http.Error(w, "no file", http.StatusBadRequest)
        return
    }
    defer file.Close()

    fmt.Fprintf(w, "Uploaded: %s (%d bytes)", header.Filename, header.Size)
}`,
            explanation: 'r.FormValue — удобный хелпер: вызывает ParseForm автоматически. r.FormFile — для загрузки файлов. ParseMultipartForm ограничивает размер в памяти.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Редиректы',
            code: `package main

import "net/http"

func redirectHandler(w http.ResponseWriter, r *http.Request) {
    // 301 — постоянный редирект (браузер кэширует)
    http.Redirect(w, r, "/new-location", http.StatusMovedPermanently)
}

func tempRedirectHandler(w http.ResponseWriter, r *http.Request) {
    // 302 — временный редирект
    http.Redirect(w, r, "/temp", http.StatusFound)
}

func postRedirectHandler(w http.ResponseWriter, r *http.Request) {
    // POST → обработка → 303 See Other → GET
    // Паттерн Post/Redirect/Get (PRG) — предотвращает повторную отправку формы
    processForm(r)
    http.Redirect(w, r, "/success", http.StatusSeeOther)
}`,
            explanation: '301 — постоянный (кэшируется браузером). 302 — временный. 303 See Other — после POST, предотвращает дублирование при F5. 307/308 сохраняют метод.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Паттерн PRG (Post/Redirect/Get):</strong> После обработки POST-формы делайте редирект 303 на GET-страницу. Иначе нажатие F5 повторно отправит форму — создаст дубликат заказа/записи.</p>`
        },
        {
            type: 'editor',
            title: 'Практика: форма логина',
            instructions: 'Реализуйте обработчик POST /login, который читает JSON {"username","password"}, проверяет credentials и устанавливает session cookie.',
            starterCode: `package main

import (
    "encoding/json"
    "net/http"
    "time"
)

type LoginRequest struct {
    Username string \`json:"username"\`
    Password string \`json:"password"\`
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "POST only", http.StatusMethodNotAllowed)
        return
    }

    var req LoginRequest
    // Декодируйте JSON тело

    // Проверьте: username=="admin" && password=="secret"
    // Если неверно — 401

    // Установите cookie "session" со значением "token_abc123"
    // HttpOnly: true, Duration: 1 hour

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"status": "logged in"})
}

func main() {
    http.HandleFunc("/login", loginHandler)
    http.ListenAndServe(":8080", nil)
}`,
            hints: [
                'json.NewDecoder(r.Body).Decode(&req)',
                'if req.Username != "admin" || req.Password != "secret" { http.Error(w, "unauthorized", 401) }',
                'http.SetCookie(w, &http.Cookie{Name: "session", Value: "token_abc123", HttpOnly: true, Expires: time.Now().Add(time.Hour)})',
                'Тест: curl -X POST -d \'{"username":"admin","password":"secret"}\' http://localhost:8080/login'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что делает флаг HttpOnly в http.Cookie?',
                    options: [
                        'Делает куку недоступной из JavaScript (защита от XSS)',
                        'Разрешает только HTTP, не HTTPS',
                        'Делает куку видимой только серверу',
                        'Ограничивает время жизни'
                    ],
                    correct: 0,
                    explanation: 'HttpOnly=true запрещает доступ к куке через document.cookie в JavaScript. Это защита от XSS-атак, крадущих сессионные токены.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Какой код редиректа использовать после обработки POST-формы?',
                    options: [
                        '303 See Other (паттерн PRG)',
                        '301 Moved Permanently',
                        '200 OK',
                        '302 Found'
                    ],
                    correct: 0,
                    explanation: '303 See Other — стандарт для PRG паттерна. Браузер делает GET на новый URL. Предотвращает повторную отправку формы при обновлении страницы.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Как прочитать загруженный файл из формы?',
                    options: [
                        'r.ParseMultipartForm(maxMem); r.FormFile("field")',
                        'r.Body.Read()',
                        'r.FormValue("file")',
                        'r.Files["field"]'
                    ],
                    correct: 0,
                    explanation: 'r.FormFile("fieldname") возвращает (multipart.File, *FileHeader, error). Не забудьте вызвать ParseMultipartForm с ограничением памяти.'
                }
            ]
        }
    ]
};
