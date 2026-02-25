export default {
    id: '04-01',
    title: 'Основы ошибок в Go',
    description: 'Интерфейс error, паттерн result/error, errors.New, fmt.Errorf, sentinel errors — полный разбор философии обработки ошибок',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: курьерская доставка</h2>
                <p>Представьте курьерскую службу. Вы заказываете доставку и ждёте результат. Могут произойти разные ситуации:</p>
                <ul>
                    <li><strong>Успех</strong> — посылка доставлена, курьер возвращает подтверждение</li>
                    <li><strong>Адрес не найден</strong> — курьер звонит и сообщает конкретную причину</li>
                    <li><strong>Получатель недоступен</strong> — другая конкретная причина</li>
                    <li><strong>Дорога закрыта</strong> — ещё одна причина</li>
                </ul>
                <p>Ключевой момент: курьер <strong>всегда</strong> возвращается и <strong>явно сообщает</strong> о проблеме. Он не молчит, не бросает посылку на дороге, не выбрасывает исключение из системы.</p>
                <p>Именно так работают ошибки в Go. Функция <strong>всегда возвращает результат и статус</strong>. Вызывающий код <strong>обязан проверить статус</strong>. Никаких сюрпризов.</p>

                <h2>Зачем такой подход?</h2>
                <p>В языках вроде Java или Python ошибки бросаются как исключения и "летят вверх" по стеку вызовов до первого блока <code>catch</code>. Это удобно, но создаёт скрытые проблемы:</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Исключения (Java/Python)</th>
                            <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Ошибки-значения (Go)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Легко забыть поймать</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Компилятор предупредит об неиспользуемом результате</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px 14px;border:1px solid var(--border)">Невидимы в сигнатуре функции</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Явно видны в возвращаемых типах</td>
                        </tr>
                        <tr>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Сложный поток управления</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Линейный, читаемый код</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px 14px;border:1px solid var(--border)">Overhead на раскрутку стека</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Просто возвращаемое значение, почти бесплатно</td>
                        </tr>
                    </tbody>
                </table>
                <p>Go выбрал явность и предсказуемость. Вы точно знаете, какие функции могут вернуть ошибку — это написано прямо в их сигнатуре.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Интерфейс error — сердце системы</h2>
                <p>В Go <code>error</code> — это встроенный интерфейс, определённый в самом языке:</p>
                <pre style="background:var(--surface-2);padding:16px;border-radius:8px;overflow-x:auto"><code>type error interface {
    Error() string
}</code></pre>
                <p>Это самый маленький полезный интерфейс в Go. Любой тип, у которого есть метод <code>Error() string</code>, автоматически является ошибкой. Ничего лишнего.</p>
                <p>Когда функция возвращает <code>nil</code> вместо ошибки — всё прошло успешно. Когда возвращает не-nil ошибку — что-то пошло не так, и в ошибке написано что именно.</p>

                <h2>Анатомия функции с ошибкой</h2>
                <p>Стандартная сигнатура Go-функции, которая может завершиться с ошибкой:</p>
                <pre style="background:var(--surface-2);padding:16px;border-radius:8px;overflow-x:auto"><code>func ИмяФункции(параметры) (РезультатТип, error) {
    // ...
}</code></pre>
                <p>Соглашения Go:</p>
                <ul>
                    <li>Если функция возвращает ошибку, <code>error</code> — <strong>всегда последнее</strong> возвращаемое значение</li>
                    <li>При ошибке другие возвращаемые значения обычно равны нулевым значениям их типов (0, "", nil)</li>
                    <li>При успехе возвращается <code>nil</code> как ошибка</li>
                    <li>Игнорировать ошибку через <code>_</code> — плохой стиль (если только вы не знаете точно, что делаете)</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Базовый паттерн: result, err := func()',
            code: `package main

import (
    "errors"
    "fmt"
    "strconv"
)

// Функция деления — типичная функция с ошибкой
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("деление на ноль")
    }
    return a / b, nil
}

// Функция парсинга числа с понятным сообщением об ошибке
func parsePositiveInt(s string) (int, error) {
    n, err := strconv.Atoi(s)
    if err != nil {
        return 0, fmt.Errorf("не удалось разобрать %q как число: %v", s, err)
    }
    if n <= 0 {
        return 0, fmt.Errorf("ожидалось положительное число, получено %d", n)
    }
    return n, nil
}

func main() {
    // Паттерн 1: обработка сразу
    result, err := divide(10, 3)
    if err != nil {
        fmt.Println("Ошибка:", err)
        return
    }
    fmt.Printf("10 / 3 = %.4f\n", result) // 10 / 3 = 3.3333

    // Паттерн 2: ошибка — нормальный путь выполнения
    _, err = divide(5, 0)
    if err != nil {
        fmt.Println("Поймали:", err) // Поймали: деление на ноль
        // Программа продолжает работу — это не fatal!
    }

    // Паттерн 3: цепочка вызовов
    n, err := parsePositiveInt("42")
    if err == nil {
        fmt.Println("Получили число:", n) // Получили число: 42
    }

    _, err = parsePositiveInt("abc")
    if err != nil {
        fmt.Println("Ошибка парсинга:", err)
        // не удалось разобрать "abc" как число: strconv.Atoi: ...
    }

    _, err = parsePositiveInt("-5")
    if err != nil {
        fmt.Println("Ошибка валидации:", err)
        // ожидалось положительное число, получено -5
    }
}`,
            explanation: 'Обратите внимание: ошибки — это обычный поток управления, не "исключительная ситуация". divide(5,0) не ломает программу — мы просто проверяем err и продолжаем. Паттерн "если ошибка — return" называется early return и держит основную логику в конце функции без вложенности.'
        },
        {
            type: 'theory',
            content: `
                <h2>Два способа создать ошибку</h2>
                <p>Стандартная библиотека предоставляет два основных конструктора ошибок:</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Функция</th>
                            <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Когда использовать</th>
                            <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Пример</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px 14px;border:1px solid var(--border)"><code>errors.New("текст")</code></td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Статичное сообщение без переменных</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)"><code>errors.New("не авторизован")</code></td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px 14px;border:1px solid var(--border)"><code>fmt.Errorf("шаблон %v", val)</code></td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Нужно включить динамические данные</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)"><code>fmt.Errorf("user %d не найден", id)</code></td>
                        </tr>
                    </tbody>
                </table>
                <p>Важный нюанс: ошибки, созданные через <code>errors.New</code> или <code>fmt.Errorf</code> (без <code>%w</code>), <strong>не несут структурированных данных</strong> — только строку. Если нужно передать структурированные данные (код ошибки, поле, которое не прошло валидацию), используйте кастомные типы ошибок (следующий урок).</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'errors.New vs fmt.Errorf — разбор на практике',
            code: `package main

import (
    "errors"
    "fmt"
)

// --- Пример 1: errors.New для статичных ошибок ---

var errEmptyInput = errors.New("входная строка пуста")

func processInput(s string) (string, error) {
    if s == "" {
        return "", errEmptyInput // возвращаем ту же переменную
    }
    return "обработано: " + s, nil
}

// --- Пример 2: fmt.Errorf для динамичных ошибок ---

type Permission int

const (
    PermRead  Permission = 1
    PermWrite Permission = 2
    PermAdmin Permission = 4
)

func checkAccess(userPerm, requiredPerm Permission) error {
    if userPerm&requiredPerm == 0 {
        return fmt.Errorf(
            "доступ запрещён: требуется permission %d, у пользователя %d",
            requiredPerm, userPerm,
        )
    }
    return nil
}

// --- Пример 3: оборачиваем чужую ошибку (без %w, просто текст) ---

func loadConfig(path string) (map[string]string, error) {
    // Представим, что чтение файла вернуло ошибку
    readErr := errors.New("файл не существует")
    if readErr != nil {
        // Добавляем контекст нашего уровня
        return nil, fmt.Errorf("loadConfig(%q): %v", path, readErr)
        // Вывод: loadConfig("app.yaml"): файл не существует
    }
    return nil, nil
}

func main() {
    // errors.New: сообщение фиксировано
    _, err := processInput("")
    fmt.Println(err) // входная строка пуста

    // fmt.Errorf: сообщение содержит конкретные данные
    err = checkAccess(PermRead, PermAdmin)
    fmt.Println(err)
    // доступ запрещён: требуется permission 4, у пользователя 1

    // Цепочка контекста
    _, err = loadConfig("app.yaml")
    fmt.Println(err)
    // loadConfig("app.yaml"): файл не существует
}`,
            explanation: 'fmt.Errorf с %v включает сообщение чужой ошибки как строку — вы получаете удобный контекст, но теряете возможность проверить тип исходной ошибки через errors.Is. Для сохранения цепочки ошибок используйте %w (урок 03).'
        },
        {
            type: 'theory',
            content: `
                <h2>Sentinel Errors — предопределённые ошибки</h2>
                <p><strong>Sentinel error</strong> (сторожевая ошибка) — это переменная уровня пакета, объявленная заранее. Она служит "маркером" конкретной ситуации ошибки.</p>
                <p>Название происходит от sentinel value — специального значения, означающего особое состояние (как -1 в старом C-коде или NULL в указателях).</p>
                <p>Зачем они нужны? Чтобы <strong>различать причины ошибок программно</strong>. Если вы просто делаете <code>fmt.Errorf("не найдено")</code>, вы не можете надёжно проверить это в вызывающем коде (парсинг строк — плохая идея). Sentinel errors позволяют сравнивать ошибки по идентичности:</p>
                <pre style="background:var(--surface-2);padding:16px;border-radius:8px;overflow-x:auto"><code>// Объявление
var ErrNotFound = errors.New("not found")

// Проверка
if errors.Is(err, ErrNotFound) {
    // точно знаем — это ошибка "не найдено"
}</code></pre>
                <p>Соглашения по именованию:</p>
                <ul>
                    <li>Всегда начинаются с <code>Err</code>: <code>ErrNotFound</code>, <code>ErrTimeout</code>, <code>ErrPermission</code></li>
                    <li>Экспортируемые (с большой буквы) — часть публичного API пакета</li>
                    <li>Неэкспортируемые (маленькая буква) — только внутри пакета</li>
                </ul>
                <p>Примеры из стандартной библиотеки Go:</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Ошибка</th>
                            <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Пакет</th>
                            <th style="padding:10px 14px;border:1px solid var(--border);text-align:left">Когда возникает</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px 14px;border:1px solid var(--border)"><code>io.EOF</code></td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">io</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Конец файла/потока</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px 14px;border:1px solid var(--border)"><code>sql.ErrNoRows</code></td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">database/sql</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Запрос не вернул строк</td>
                        </tr>
                        <tr>
                            <td style="padding:10px 14px;border:1px solid var(--border)"><code>os.ErrNotExist</code></td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">os</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Файл не существует</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px 14px;border:1px solid var(--border)"><code>context.DeadlineExceeded</code></td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">context</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Истёк дедлайн контекста</td>
                        </tr>
                        <tr>
                            <td style="padding:10px 14px;border:1px solid var(--border)"><code>context.Canceled</code></td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">context</td>
                            <td style="padding:10px 14px;border:1px solid var(--border)">Контекст был отменён</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Sentinel errors в реальном API',
            code: `package main

import (
    "errors"
    "fmt"
)

// Sentinel errors — публичный API нашего пакета
var (
    ErrNotFound     = errors.New("запись не найдена")
    ErrUnauthorized = errors.New("требуется авторизация")
    ErrForbidden    = errors.New("доступ запрещён")
    ErrConflict     = errors.New("конфликт: запись уже существует")
)

// Имитация базы данных
var users = map[int]string{
    1: "Alice",
    2: "Bob",
    3: "Charlie",
}

func getUser(requestingUserID, targetID int) (string, error) {
    if requestingUserID == 0 {
        return "", ErrUnauthorized
    }
    if requestingUserID != targetID && requestingUserID != 999 { // 999 = admin
        return "", ErrForbidden
    }
    name, ok := users[targetID]
    if !ok {
        return "", ErrNotFound
    }
    return name, nil
}

// Типичный HTTP-обработчик использует sentinel errors для статус-кодов
func handleGetUser(requestingUserID, targetID int) {
    name, err := getUser(requestingUserID, targetID)

    switch {
    case err == nil:
        fmt.Printf("200 OK: %s\n", name)
    case errors.Is(err, ErrUnauthorized):
        fmt.Println("401 Unauthorized:", err)
    case errors.Is(err, ErrForbidden):
        fmt.Println("403 Forbidden:", err)
    case errors.Is(err, ErrNotFound):
        fmt.Println("404 Not Found:", err)
    default:
        fmt.Println("500 Internal Server Error:", err)
    }
}

func main() {
    fmt.Println("--- Запрос без авторизации ---")
    handleGetUser(0, 1)
    // 401 Unauthorized: требуется авторизация

    fmt.Println("--- Чужой профиль ---")
    handleGetUser(1, 2)
    // 403 Forbidden: доступ запрещён

    fmt.Println("--- Несуществующий пользователь ---")
    handleGetUser(999, 42)
    // 404 Not Found: запись не найдена

    fmt.Println("--- Успешный запрос ---")
    handleGetUser(1, 1)
    // 200 OK: Alice

    fmt.Println("--- Администратор просматривает другого ---")
    handleGetUser(999, 2)
    // 200 OK: Bob
}`,
            explanation: 'Конструкция switch с errors.Is — чистый способ маршрутизации по типу ошибки. В HTTP-сервисах это стандартный паттерн: каждый sentinel error соответствует HTTP-статус коду. Обратите внимание на default — "неизвестная ошибка" → 500, чтобы ничего не потерялось.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Правило именования:</strong> Sentinel errors всегда начинаются с <code>Err</code>: <code>ErrNotFound</code>, <code>ErrTimeout</code>, <code>ErrInvalidInput</code>. Это соглашение Go, которое сигнализирует читателю кода: "это sentinel error, с ней можно делать errors.Is()".</p><p>Для сравнения: типы ошибок (следующий урок) именуются с суффиксом <code>Error</code>: <code>ValidationError</code>, <code>NetworkError</code>.</p>`
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph TD
    A["func getUser() (User, error)"] --> B{"err != nil?"}
    B -->|"nil — успех"| C["Используем User"]
    B -->|"не nil — ошибка"| D{"errors.Is(err, ...)"}
    D --> E["ErrUnauthorized → 401"]
    D --> F["ErrForbidden → 403"]
    D --> G["ErrNotFound → 404"]
    D --> H["неизвестная → 500, log"]
    style A fill:#00add8,color:#fff
    style B fill:#d97706,color:#fff
    style C fill:#10b981,color:#fff
    style D fill:#8b5cf6,color:#fff
    style E fill:#ef4444,color:#fff
    style F fill:#ef4444,color:#fff
    style G fill:#f59e0b,color:#fff
    style H fill:#6b7280,color:#fff`,
            caption: 'Поток обработки ошибок с sentinel errors — маршрутизация по типу ошибки'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<p><strong>Не сравнивайте ошибки через ==</strong> напрямую при работе с обёрнутыми ошибками. Используйте <code>errors.Is(err, ErrSomething)</code> — эта функция проверяет всю цепочку обёрток. Подробнее об обёртывании — в уроке 03.</p><pre style="background:var(--surface-2);padding:12px;border-radius:6px;margin-top:8px"><code>// Плохо — не работает с обёрнутыми ошибками
if err == ErrNotFound { ... }

// Хорошо — работает всегда
if errors.Is(err, ErrNotFound) { ... }</code></pre>`
        },
        {
            type: 'editor',
            title: 'Практика: Банковский счёт с обработкой ошибок',
            instructions: `Реализуйте функции для управления банковским счётом:

1. <code>withdraw(balance, amount float64) (float64, error)</code> — снятие денег:
   - Если <code>amount <= 0</code> → <code>ErrInvalidAmount</code>
   - Если <code>amount > balance</code> → <code>ErrInsufficientFunds</code>
   - Иначе → вернуть новый баланс, nil

2. <code>deposit(balance, amount float64) (float64, error)</code> — пополнение:
   - Если <code>amount <= 0</code> → <code>ErrInvalidAmount</code>
   - Иначе → вернуть новый баланс, nil

В <code>main</code> обработайте каждый возможный исход через <code>errors.Is</code>.`,
            starterCode: `package main

import (
    "errors"
    "fmt"
)

var (
    ErrInsufficientFunds = errors.New("недостаточно средств на счёте")
    ErrInvalidAmount     = errors.New("сумма должна быть положительной")
)

func withdraw(balance, amount float64) (float64, error) {
    // TODO: проверить amount <= 0
    // TODO: проверить amount > balance
    // TODO: вернуть balance - amount, nil
    return 0, nil
}

func deposit(balance, amount float64) (float64, error) {
    // TODO: проверить amount <= 0
    // TODO: вернуть balance + amount, nil
    return 0, nil
}

func main() {
    balance := 500.0
    fmt.Printf("Начальный баланс: %.2f\n", balance)

    // Тест 1: успешное пополнение
    balance, err := deposit(balance, 200)
    if err != nil {
        fmt.Println("Ошибка пополнения:", err)
    } else {
        fmt.Printf("Пополнение 200 → баланс: %.2f\n", balance) // 700.00
    }

    // Тест 2: успешное снятие
    balance, err = withdraw(balance, 150)
    if err != nil {
        fmt.Println("Ошибка снятия:", err)
    } else {
        fmt.Printf("Снятие 150 → баланс: %.2f\n", balance) // 550.00
    }

    // Тест 3: недостаточно средств
    _, err = withdraw(balance, 1000)
    if errors.Is(err, ErrInsufficientFunds) {
        fmt.Println("Отказ: недостаточно средств на счёте") // ожидаем это
    }

    // Тест 4: некорректная сумма
    _, err = deposit(balance, -50)
    if errors.Is(err, ErrInvalidAmount) {
        fmt.Println("Отказ: некорректная сумма") // ожидаем это
    }
}`,
            hints: [
                'В withdraw сначала проверьте amount <= 0, потом amount > balance',
                'Возвращайте точно тот sentinel error из var блока — не создавайте новый errors.New',
                'При успехе: return balance - amount, nil или return balance + amount, nil',
                'errors.Is(err, ErrInsufficientFunds) сравнивает по идентичности переменной'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что такое интерфейс error в Go?',
                    options: [
                        'Встроенный интерфейс с единственным методом Error() string',
                        'Структура с полями Code int и Message string',
                        'Ключевое слово языка для обработки исключений',
                        'Псевдоним для типа string'
                    ],
                    correct: 0,
                    explanation: 'error — минималистичный встроенный интерфейс: type error interface { Error() string }. Любой тип с методом Error() string автоматически реализует его.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Функция вернула (result, nil). Что это означает?',
                    options: [
                        'Функция выполнилась успешно, ошибки нет',
                        'Функция вернула пустой результат',
                        'Произошла неизвестная ошибка',
                        'Функция ещё выполняется'
                    ],
                    correct: 0,
                    explanation: 'nil как значение error означает отсутствие ошибки — успешное выполнение. Конвенция Go: return result, nil при успехе.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Когда использовать fmt.Errorf вместо errors.New?',
                    options: [
                        'Когда нужно включить динамические данные (переменные) в сообщение ошибки',
                        'Когда ошибка критическая',
                        'fmt.Errorf всегда лучше, errors.New устарел',
                        'Когда нужно обернуть другую ошибку через %w'
                    ],
                    correct: 0,
                    explanation: 'fmt.Errorf нужен для динамических сообщений: fmt.Errorf("user %d not found", id). errors.New — для статичных строк. Оба варианта актуальны.'
                },
                {
                    id: 'q4',
                    type: 'multiple',
                    question: 'Какие утверждения о sentinel errors верны? (выберите все правильные)',
                    options: [
                        'Объявляются как var ErrXxx = errors.New(...) на уровне пакета',
                        'Для проверки используется errors.Is(err, ErrXxx)',
                        'Именуются с префиксом Err по соглашению Go',
                        'Могут хранить структурированные данные о контексте ошибки',
                        'Примеры из stdlib: io.EOF, sql.ErrNoRows, os.ErrNotExist'
                    ],
                    correct: [0, 1, 2, 4],
                    explanation: 'Sentinel errors — предопределённые переменные (var ErrXxx), именуются с Err, проверяются через errors.Is. Структурированные данные НЕ хранят — для этого нужны кастомные типы ошибок.'
                },
                {
                    id: 'q5',
                    type: 'code-fill',
                    question: 'Как проверить, является ли ошибка err конкретным sentinel error ErrTimeout?',
                    template: 'if errors.___(err, ErrTimeout) {\n    // обработка\n}',
                    correct: 'Is',
                    explanation: 'errors.Is(err, target) проверяет, совпадает ли err с target, включая обёрнутые ошибки в цепочке.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Функция getUser возвращает (string, error). Вы вызвали её и получили ошибку. Какой будет значение строки?',
                    options: [
                        'Пустая строка "" — нулевое значение типа string',
                        'Строка "error"',
                        'nil',
                        'Зависит от реализации функции, но обычно ""'
                    ],
                    correct: 3,
                    explanation: 'По конвенции Go при ошибке возвращают нулевые значения других результатов ("" для string, 0 для int, nil для указателей). Но это конвенция, не требование — реализация определяет поведение.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Где в сигнатуре функции должен стоять тип error?',
                    options: [
                        'Всегда последним возвращаемым значением',
                        'Всегда первым возвращаемым значением',
                        'Это не важно, можно в любом месте',
                        'error должен быть параметром, не возвращаемым значением'
                    ],
                    correct: 0,
                    explanation: 'Строгое соглашение Go: error — последнее возвращаемое значение. func f() (int, string, error). Нарушение этого соглашения вызовет вопросы при код-ревью.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Что выведет код: err := errors.New("test"); fmt.Println(err)?',
                    options: [
                        'test',
                        '&errors.errorString{s:"test"}',
                        'error: test',
                        'errors.New("test")'
                    ],
                    correct: 0,
                    explanation: 'fmt.Println вызывает метод Error() string на значении error, который возвращает строку переданную в errors.New. Вывод: просто "test".'
                }
            ]
        }
    ]
};
