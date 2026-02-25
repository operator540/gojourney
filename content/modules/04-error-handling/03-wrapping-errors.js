export default {
    id: '04-03',
    title: 'Оборачивание ошибок',
    description: 'fmt.Errorf %w, errors.Is, errors.As, цепочки ошибок, sentinel errors — добавление контекста без потери оригинала',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: Матрёшка ошибок</h2>
                <p>Представьте матрёшку: снаружи красивая кукла с надписью <em>«handleRequest: getUserByID: findInDB: запись не найдена»</em>. Открываете — внутри следующая: <em>«getUserByID: findInDB: запись не найдена»</em>. Ещё глубже — <em>«findInDB: запись не найдена»</em>. И в самой сердцевине — оригинальная ошибка: <em>«sql: no rows in result set»</em>.</p>
                <p>Именно так работает оборачивание ошибок в Go. Каждый слой кода добавляет свою обёртку с контекстом, но оригинальная ошибка сохраняется внутри — к ней можно достучаться через <code>errors.Is</code> и <code>errors.As</code>.</p>

                <h2>Зачем оборачивать?</h2>
                <p>Без оборачивания вы получаете бесполезные логи:</p>
                <pre style="background:var(--surface-2);padding:12px;border-radius:6px;border-left:3px solid var(--accent)">sql: no rows in result set</pre>
                <p>С оборачиванием — полный путь от проблемы до её причины:</p>
                <pre style="background:var(--surface-2);padding:12px;border-radius:6px;border-left:3px solid var(--accent)">handleRequest: getUserByID(42): findInDB: sql: no rows in result set</pre>
                <p>Сразу видно: запрашивали пользователя с id=42, проблема в слое БД. Это экономит часы отладки в проде.</p>

                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Подход</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Пример</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Сохраняет оригинал?</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>fmt.Errorf("%v", err)</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Только строка</td>
                            <td style="padding:10px;border:1px solid var(--border)">Нет — errors.Is не работает</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>fmt.Errorf("%w", err)</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Обёртка с контекстом</td>
                            <td style="padding:10px;border:1px solid var(--border)">Да — errors.Is/As работают</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>errors.Join(e1, e2)</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Несколько ошибок</td>
                            <td style="padding:10px;border:1px solid var(--border)">Да — обе ошибки сохраняются</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'fmt.Errorf с %w — добавляем контекст, сохраняем оригинал',
            code: `package main

import (
    "errors"
    "fmt"
)

// Sentinel error — ошибка-значение, с которой сравнивают через errors.Is
var ErrNotFound = errors.New("запись не найдена")

// Слой: база данных
func findInDB(id int) error {
    if id > 100 {
        return ErrNotFound // возвращаем sentinel
    }
    return nil
}

// Слой: репозиторий
func getUserByID(id int) error {
    err := findInDB(id)
    if err != nil {
        // %w оборачивает: добавляет контекст И сохраняет оригинал внутри
        return fmt.Errorf("getUserByID(%d): %w", id, err)
    }
    return nil
}

// Слой: HTTP-обработчик
func handleRequest(id int) error {
    err := getUserByID(id)
    if err != nil {
        return fmt.Errorf("handleRequest: %w", err)
    }
    return nil
}

func main() {
    err := handleRequest(999)

    // Строковое представление — вся цепочка
    fmt.Println(err)
    // handleRequest: getUserByID(999): запись не найдена

    // errors.Is рекурсивно разворачивает цепочку
    fmt.Println(errors.Is(err, ErrNotFound)) // true
    // Находит ErrNotFound даже через две обёртки!

    // Для сравнения: %v теряет оригинал
    wrapped := fmt.Errorf("context: %v", ErrNotFound) // %v, не %w
    fmt.Println(errors.Is(wrapped, ErrNotFound)) // false — оригинал потерян!
}`,
            explanation: '%w (wrap) — ключевое отличие от %v. %w упаковывает оригинальную ошибку внутрь новой, так что errors.Is может её найти рекурсивно. %v просто форматирует в строку — оригинал теряется навсегда. Никогда не путайте их.'
        },
        {
            type: 'theory',
            content: `
                <h2>Sentinel Errors — именованные ошибки-значения</h2>
                <p><strong>Sentinel error</strong> — глобальная переменная типа <code>error</code>, с которой сравнивают через <code>errors.Is</code>. Это идиома Go для публичного API: вместо сравнения строк — сравнение значений.</p>
                <p>Правила именования: префикс <code>Err</code> + описание в PascalCase.</p>

                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Пакет</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Sentinel errors</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Использование</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>io</code></td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>io.EOF</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Конец потока данных</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><code>sql</code></td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>sql.ErrNoRows</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Запрос вернул 0 строк</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><code>context</code></td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>context.Canceled</code>, <code>context.DeadlineExceeded</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Отмена / таймаут</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Ваш код</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>ErrNotFound</code>, <code>ErrPermission</code></td>
                            <td style="padding:10px;border:1px solid var(--border)">Бизнес-ошибки</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'errors.Is и errors.As — проверка и извлечение',
            code: `package main

import (
    "errors"
    "fmt"
)

// --- Sentinel error ---
var ErrPermission = errors.New("нет прав доступа")

// --- Типизированная ошибка ---
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation: поле %q: %s", e.Field, e.Message)
}

func validateAge(age int) error {
    if age < 0 || age > 150 {
        return &ValidationError{Field: "age", Message: "должен быть 0-150"}
    }
    return nil
}

func processUser(age int) error {
    if err := validateAge(age); err != nil {
        return fmt.Errorf("processUser: %w", err)
    }
    return nil
}

func main() {
    // --- errors.Is: сравнение значений ---
    err1 := fmt.Errorf("operation failed: %w", ErrPermission)
    fmt.Println(errors.Is(err1, ErrPermission)) // true — находит в цепочке
    fmt.Println(err1 == ErrPermission)           // false — обёртка != sentinel!

    // --- errors.As: извлечение конкретного типа ---
    err2 := processUser(-5)
    var valErr *ValidationError
    if errors.As(err2, &valErr) {
        // errors.As разворачивает цепочку и заполняет valErr
        fmt.Printf("Ошибка валидации поля: %s\\n", valErr.Field)   // age
        fmt.Printf("Сообщение: %s\\n", valErr.Message)             // должен быть 0-150
    }

    // ВАЖНО: не используйте == для сравнения обёрнутых ошибок!
    // err == ErrPermission — false (это обёртка)
    // errors.Is(err, ErrPermission) — true (ищет внутри)
}`,
            explanation: 'errors.Is — для sentinel errors (сравнение значений по всей цепочке). errors.As — для типизированных ошибок (извлечение конкретного типа из цепочки и заполнение переменной). Никогда не сравнивайте обёрнутые ошибки через ==.'
        },
        {
            type: 'info-box',
            variant: 'important',
            content: `<p><strong>Золотое правило:</strong></p>
            <ul>
                <li>Используйте <code>%w</code> (не <code>%v</code>!) чтобы сохранить цепочку</li>
                <li>Используйте <code>errors.Is</code> (не <code>==</code>!) для сравнения</li>
                <li>Используйте <code>errors.As</code> (не type assertion!) для извлечения типа</li>
            </ul>
            <p>Прямое <code>err == ErrNotFound</code> сработает только если ошибка НЕ обёрнута. Как только добавили <code>%w</code> — только <code>errors.Is</code>.</p>`
        },
        {
            type: 'theory',
            content: `
                <h2>Паттерн: контекст на каждом архитектурном слое</h2>
                <p>В многослойной архитектуре (Handler → Service → Repository) каждый слой добавляет <em>свой</em> контекст через <code>%w</code>, не теряя оригинал. Это обеспечивает «хлебные крошки» для отладки.</p>
                <p>Формат контекста: <code>"ИмяФункции(аргументы): %w"</code></p>

                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Слой</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Задача</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Пример оборачивания</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Repository</td>
                            <td style="padding:10px;border:1px solid var(--border)">Добавить SQL-контекст</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>fmt.Errorf("UserRepo.FindByID(%d): %w", id, err)</code></td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Service</td>
                            <td style="padding:10px;border:1px solid var(--border)">Перевести в бизнес-ошибку</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>fmt.Errorf("UserService.GetUser: %w", ErrNotFound)</code></td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Handler</td>
                            <td style="padding:10px;border:1px solid var(--border)">Определить HTTP-ответ</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>errors.Is(err, ErrNotFound)</code> → 404</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Многослойная архитектура: полный пример',
            code: `package main

import (
    "database/sql"
    "errors"
    "fmt"
    "log"
    "net/http"
)

// Бизнес-ошибки (публичное API)
var (
    ErrNotFound   = errors.New("не найдено")
    ErrForbidden  = errors.New("нет доступа")
)

// Repository — знает о SQL
type UserRepo struct{}

func (r *UserRepo) FindByID(id int) (string, error) {
    // Имитируем sql.ErrNoRows
    if id == 0 {
        return "", fmt.Errorf("UserRepo.FindByID(%d): %w", id, sql.ErrNoRows)
    }
    return fmt.Sprintf("user_%d", id), nil
}

// Service — знает о бизнес-логике
type UserService struct {
    repo *UserRepo
}

func (s *UserService) GetUser(id int) (string, error) {
    user, err := s.repo.FindByID(id)
    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            // Транслируем SQL-ошибку в бизнес-ошибку
            return "", fmt.Errorf("UserService.GetUser(%d): %w", id, ErrNotFound)
        }
        return "", fmt.Errorf("UserService.GetUser(%d): %w", id, err)
    }
    return user, nil
}

// Handler — знает о HTTP
type UserHandler struct {
    service *UserService
}

func (h *UserHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    user, err := h.service.GetUser(0)
    if err != nil {
        log.Printf("GetUser error: %v", err)
        // Полный путь: UserService.GetUser(0): UserRepo.FindByID(0): sql: no rows

        switch {
        case errors.Is(err, ErrNotFound):
            http.Error(w, "пользователь не найден", http.StatusNotFound)
        case errors.Is(err, ErrForbidden):
            http.Error(w, "нет доступа", http.StatusForbidden)
        default:
            http.Error(w, "внутренняя ошибка", http.StatusInternalServerError)
        }
        return
    }
    fmt.Fprint(w, user)
}

func main() {
    svc := &UserService{repo: &UserRepo{}}
    _, err := svc.GetUser(0)
    fmt.Println(err)
    // UserService.GetUser(0): UserRepo.FindByID(0): sql: no rows in result set
    fmt.Println(errors.Is(err, ErrNotFound)) // true
    fmt.Println(errors.Is(err, sql.ErrNoRows)) // false — транслировали на уровне сервиса
}`,
            explanation: 'Repository оборачивает sql.ErrNoRows с контекстом. Service видит sql.ErrNoRows и транслирует его в ErrNotFound (скрывает детали реализации БД). Handler проверяет ErrNotFound через errors.Is и возвращает 404. Каждый слой отвечает за своё.'
        },
        {
            type: 'theory',
            content: `
                <h2>errors.Unwrap и errors.Join (Go 1.20+)</h2>
                <p><code>errors.Unwrap</code> снимает одну обёртку — используется редко, т.к. <code>errors.Is</code>/<code>errors.As</code> делают это автоматически.</p>
                <p><code>errors.Join</code> (Go 1.20) объединяет несколько ошибок в одну. Полезно когда нужно выполнить несколько операций и вернуть все ошибки сразу.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'errors.Join — несколько ошибок в одной',
            code: `package main

import (
    "errors"
    "fmt"
)

var (
    ErrDB    = errors.New("ошибка БД")
    ErrCache = errors.New("ошибка кэша")
    ErrQueue = errors.New("ошибка очереди")
)

// Выполняем три операции — хотим знать обо всех ошибках
func syncAll() error {
    var errs []error

    if err := syncToDB(); err != nil {
        errs = append(errs, fmt.Errorf("syncDB: %w", err))
    }
    if err := syncToCache(); err != nil {
        errs = append(errs, fmt.Errorf("syncCache: %w", err))
    }
    if err := syncToQueue(); err != nil {
        errs = append(errs, fmt.Errorf("syncQueue: %w", err))
    }

    // errors.Join объединяет — если errs пуст, вернёт nil
    return errors.Join(errs...)
}

func syncToDB() error    { return ErrDB }
func syncToCache() error { return ErrCache }
func syncToQueue() error { return nil }

func main() {
    err := syncAll()
    if err != nil {
        fmt.Println(err)
        // syncDB: ошибка БД
        // syncCache: ошибка кэша

        // errors.Is проверяет ВСЕ объединённые ошибки
        fmt.Println(errors.Is(err, ErrDB))    // true
        fmt.Println(errors.Is(err, ErrCache)) // true
        fmt.Println(errors.Is(err, ErrQueue)) // false — syncToQueue() вернул nil
    }
}`,
            explanation: 'errors.Join объединяет слайс ошибок в одну. Если передать nil — вернёт nil. errors.Is рекурсивно проверяет все вложенные ошибки. Полезно для batch-операций где нужно знать о всех сбоях.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Типичные ошибки при оборачивании:</strong></p>
            <ul>
                <li><strong>Двойной контекст:</strong> не пишите <code>"getUserByID: db error: %w"</code> если err уже содержит "db error" — контекст будет дублироваться</li>
                <li><strong>%v вместо %w:</strong> <code>fmt.Errorf("op: %v", err)</code> обрывает цепочку</li>
                <li><strong>Оборачивание nil:</strong> всегда проверяйте <code>if err != nil</code> перед оборачиванием</li>
                <li><strong>Слишком много обёрток:</strong> оборачивайте один раз на слой, не несколько</li>
            </ul>`
        },
        {
            type: 'editor',
            title: 'Практика: Трёхслойная цепочка ошибок',
            instructions: 'Реализуйте трёхслойную цепочку: fetchData → processData → handleRequest. Каждый слой должен обернуть ошибку через %w с контекстом. В main проверьте errors.Is для ErrTimeout и errors.As для извлечения *NetworkError с полем Code.',
            starterCode: `package main

import (
    "errors"
    "fmt"
)

var ErrTimeout = errors.New("таймаут соединения")

type NetworkError struct {
    Code    int
    Message string
}

func (e *NetworkError) Error() string {
    return fmt.Sprintf("network error %d: %s", e.Code, e.Message)
}

func fetchData(url string) error {
    // Имитируем сетевую ошибку
    return &NetworkError{Code: 503, Message: "сервис недоступен"}
}

func processData(url string) error {
    err := fetchData(url)
    if err != nil {
        // TODO: оберните с контекстом через %w
        return err
    }
    return nil
}

func handleRequest(url string) error {
    err := processData(url)
    if err != nil {
        // TODO: оберните с контекстом через %w
        return err
    }
    return nil
}

func main() {
    err := handleRequest("https://api.example.com/users")
    fmt.Println(err)
    // Ожидается: handleRequest: processData("https://..."): network error 503: ...

    // Извлечь NetworkError через errors.As
    var netErr *NetworkError
    if errors.As(err, &netErr) {
        fmt.Printf("Код ошибки: %d\\n", netErr.Code) // 503
    }

    // Проверить ErrTimeout
    timeoutErr := fmt.Errorf("op: %w", ErrTimeout)
    fmt.Println(errors.Is(timeoutErr, ErrTimeout)) // true
}`,
            hints: [
                'processData: return fmt.Errorf("processData(%q): %w", url, err)',
                'handleRequest: return fmt.Errorf("handleRequest: %w", err)',
                'errors.As(err, &netErr) разворачивает цепочку и ищет *NetworkError',
                'Не забудьте %w (не %v!) — иначе errors.As не сработает'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Какой спецификатор в fmt.Errorf сохраняет оригинальную ошибку для errors.Is/As?',
                    options: [
                        '%w — wrap, оборачивает и сохраняет',
                        '%v — verbose, форматирует со всеми полями',
                        '%e — error, специальный для ошибок',
                        '%s — string, стандартный'
                    ],
                    correct: 0,
                    explanation: '%w (wrap) упаковывает оригинальную ошибку внутрь новой. errors.Is/As рекурсивно её находят. %v просто форматирует строку — оригинал теряется.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'errors.Is(err, target) вернёт true если:',
                    options: [
                        'err == target ИЛИ target найден где-то в цепочке обёрток err',
                        'err и target имеют одинаковый тип',
                        'err.Error() == target.Error()',
                        'Только если err == target (прямое равенство)'
                    ],
                    correct: 0,
                    explanation: 'errors.Is рекурсивно разворачивает цепочку через Unwrap, проверяя == на каждом уровне. Можно реализовать кастомный Is(target error) bool метод для нестандартного сравнения.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Что делает errors.As(err, &target)?',
                    options: [
                        'Находит в цепочке err ошибку нужного типа и записывает в target',
                        'Конвертирует ошибку к нужному типу',
                        'Сравнивает типы двух ошибок',
                        'То же что и errors.Is, но для типов'
                    ],
                    correct: 0,
                    explanation: 'errors.As разворачивает цепочку, ищет ошибку типа *T (где target *T) и заполняет target. После успешного As вы работаете с конкретным типом и его полями.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Что делает errors.Unwrap?',
                    options: [
                        'Снимает одну обёртку — возвращает внутреннюю ошибку',
                        'Разворачивает всю цепочку до оригинала',
                        'Удаляет все обёртки одновременно',
                        'Форматирует ошибку без контекста'
                    ],
                    correct: 0,
                    explanation: 'Unwrap снимает ровно одну обёртку. Для полного разворачивания нужен цикл. На практике используйте errors.Is/As — они делают это автоматически.'
                },
                {
                    id: 'q5',
                    type: 'multiple',
                    question: 'Что верно про sentinel errors? (несколько ответов)',
                    options: [
                        'Объявляются как var ErrXxx = errors.New(...)',
                        'Сравниваются через errors.Is, не через ==',
                        'Именуются с префиксом Err',
                        'Не могут быть обёрнуты через %w'
                    ],
                    correct: [0, 1, 2],
                    explanation: 'Sentinel errors: var ErrXxx = errors.New(...), именование с Err, сравнение через errors.Is. Их МОЖНО оборачивать через %w — errors.Is найдёт оригинал внутри обёртки.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Что делает errors.Join(e1, e2) (Go 1.20+)?',
                    options: [
                        'Объединяет обе ошибки в одну; errors.Is проверяет обе',
                        'Конкатенирует строки ошибок через newline',
                        'Возвращает первую непустую ошибку',
                        'Аналог fmt.Errorf("%v %v", e1, e2)'
                    ],
                    correct: 0,
                    explanation: 'errors.Join создаёт ошибку с несколькими вложенными. errors.Is/As рекурсивно проверяют обе. Если все nil — вернёт nil. Полезно для batch-операций.'
                },
                {
                    id: 'q7',
                    type: 'code-fill',
                    question: 'Оберните err с контекстом, сохранив оригинал для errors.Is:',
                    template: 'return fmt.Errorf("getUserByID(%d): ___%w", id, err)',
                    correct: '%',
                    caseSensitive: true,
                    explanation: 'Используйте %w для оборачивания. Полный формат: fmt.Errorf("контекст: %w", err). Оригинал сохраняется для errors.Is/As.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Почему нельзя сравнивать обёрнутую ошибку через ==?',
                    options: [
                        'Обёртка — другой объект, == сравнивает адреса/значения, а не цепочку',
                        'Это синтаксически запрещено',
                        '== для ошибок работает через .Error() строку',
                        '== работает нормально'
                    ],
                    correct: 0,
                    explanation: 'fmt.Errorf("%w", ErrNotFound) создаёт новый объект-обёртку. Он не равен ErrNotFound по == (это другой адрес). errors.Is специально разворачивает цепочку для поиска.'
                }
            ]
        }
    ]
};
