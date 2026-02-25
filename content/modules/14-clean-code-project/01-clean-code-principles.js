export default {
    id: '14-01',
    title: 'Принципы чистого кода',
    description: 'Читаемость, простота, DRY, KISS, YAGNI — как писать код, который легко понять и поддерживать через год.',
    estimatedTime: 30,
    xpReward: 25,
    sections: [
        {
            type: 'theory',
            content: `
<h2>Код читают чаще, чем пишут</h2>
<p>Представь библиотеку, где книги расставлены в случайном порядке, страницы перемешаны, а названия зашифрованы. Найти нужную информацию — мучение. Плохой код — та же библиотека. <strong>Чистый код — это уважение к тем, кто будет работать с ним после тебя</strong> (и к себе через полгода).</p>
<p>По исследованиям разработчики тратят <strong>до 70% времени на чтение</strong> существующего кода и лишь 30% на написание нового. Инвестиция в читаемость окупается многократно.</p>
<h3>Что такое «чистый код»?</h3>
<ul>
    <li>Код, который выражает намерение автора без дополнительных пояснений</li>
    <li>Код с минимальным количеством удивлений (principle of least astonishment)</li>
    <li>Код, который легко изменить, не сломав ничего другого</li>
    <li>Код, который проходит все тесты и не дублирует знания</li>
</ul>
`
        },
        {
            type: 'theory',
            content: `
<h2>DRY — Don't Repeat Yourself</h2>
<p>Каждое знание должно иметь <strong>единственное, однозначное, авторитетное представление</strong> в системе. Дублирование — главный враг обслуживаемости.</p>
<p>Когда логика повторяется в нескольких местах, изменение требует обновления всех копий. Одну забудешь — получишь баг.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
    <thead>
        <tr style="background:var(--surface-2)">
            <th style="padding:10px;border:1px solid var(--border);text-align:left">Плохо (WET)</th>
            <th style="padding:10px;border:1px solid var(--border);text-align:left">Хорошо (DRY)</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding:10px;border:1px solid var(--border)">Валидация email в регистрации, логине, смене пароля — три копии</td>
            <td style="padding:10px;border:1px solid var(--border)">Функция <code>validateEmail()</code> вызывается везде</td>
        </tr>
        <tr style="background:var(--surface-2)">
            <td style="padding:10px;border:1px solid var(--border)">SQL-запрос для получения пользователя в 5 хэндлерах</td>
            <td style="padding:10px;border:1px solid var(--border)">Метод <code>repo.GetUserByID()</code></td>
        </tr>
        <tr>
            <td style="padding:10px;border:1px solid var(--border)">Константа налоговой ставки 0.2 разбросана по коду</td>
            <td style="padding:10px;border:1px solid var(--border)"><code>const TaxRate = 0.2</code></td>
        </tr>
    </tbody>
</table>
`
        },
        {
            type: 'theory',
            content: `
<h2>KISS и YAGNI</h2>
<p><strong>KISS (Keep It Simple, Stupid)</strong> — простейшее решение, которое работает, лучше умного, которое сложно понять. Сложность не означает профессионализм.</p>
<p><strong>YAGNI (You Aren't Gonna Need It)</strong> — не пиши код для функций, которые «могут понадобиться». Напишешь, когда понадобятся. Преждевременная абстракция — корень многих проблем.</p>
<blockquote style="border-left:4px solid var(--accent);margin:16px 0;padding:8px 16px;background:var(--surface-2)">
    <p style="margin:0"><em>«Сделай так, чтобы работало. Сделай так, чтобы было правильно. Сделай так, чтобы было быстро.»</em> — Kent Beck</p>
    <p style="margin:4px 0 0 0;opacity:0.7;font-size:0.9em">В таком порядке, не наоборот.</p>
</blockquote>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
    <thead>
        <tr style="background:var(--surface-2)">
            <th style="padding:10px;border:1px solid var(--border);text-align:left">Принцип</th>
            <th style="padding:10px;border:1px solid var(--border);text-align:left">Суть</th>
            <th style="padding:10px;border:1px solid var(--border);text-align:left">Нарушение</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding:10px;border:1px solid var(--border)"><strong>DRY</strong></td>
            <td style="padding:10px;border:1px solid var(--border)">Без дублирования</td>
            <td style="padding:10px;border:1px solid var(--border)">Copy-paste программирование</td>
        </tr>
        <tr style="background:var(--surface-2)">
            <td style="padding:10px;border:1px solid var(--border)"><strong>KISS</strong></td>
            <td style="padding:10px;border:1px solid var(--border)">Максимальная простота</td>
            <td style="padding:10px;border:1px solid var(--border)">Over-engineering</td>
        </tr>
        <tr>
            <td style="padding:10px;border:1px solid var(--border)"><strong>YAGNI</strong></td>
            <td style="padding:10px;border:1px solid var(--border)">Только необходимое</td>
            <td style="padding:10px;border:1px solid var(--border)">Код «на будущее»</td>
        </tr>
    </tbody>
</table>
`
        },
        {
            type: 'theory',
            content: `
<h2>Правило бойскаута и маленькие шаги</h2>
<p><strong>«Оставь код чище, чем нашёл»</strong> — правило бойскаута применительно к коду. Не нужно переписывать весь файл. Улучши имя одной переменной, вынеси повторяющийся блок в функцию, добавь пропущенную проверку ошибки.</p>
<p>Технический долг накапливается постепенно — так же постепенно его нужно отдавать. Один маленький рефакторинг в день × 250 рабочих дней = огромная разница за год.</p>
`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Нарушение DRY — дублирование логики',
            code: `// ПЛОХО: логика валидации дублируется
func RegisterUser(email, password string) error {
    if len(email) == 0 || !strings.Contains(email, "@") {
        return errors.New("invalid email")
    }
    if len(password) < 8 {
        return errors.New("password too short")
    }
    // ... сохранение
    return nil
}

func UpdateEmail(userID int, email string) error {
    if len(email) == 0 || !strings.Contains(email, "@") {
        return errors.New("invalid email") // ДУБЛИРОВАНИЕ
    }
    // ... обновление
    return nil
}

// ХОРОШО: единая точка валидации
func validateEmail(email string) error {
    if len(email) == 0 || !strings.Contains(email, "@") {
        return errors.New("invalid email")
    }
    return nil
}

func validatePassword(password string) error {
    if len(password) < 8 {
        return fmt.Errorf("password must be at least 8 chars, got %d", len(password))
    }
    return nil
}

func RegisterUser(email, password string) error {
    if err := validateEmail(email); err != nil {
        return err
    }
    if err := validatePassword(password); err != nil {
        return err
    }
    // ... сохранение
    return nil
}

func UpdateEmail(userID int, email string) error {
    if err := validateEmail(email); err != nil {
        return err
    }
    // ... обновление
    return nil
}`,
            explanation: 'DRY не только про code duplication. Это про knowledge duplication. Если логика валидации email изменится (добавим проверку домена), обновим ОДНО место.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'YAGNI — не пиши код "на будущее"',
            code: `// ПЛОХО: YAGNI нарушен — "на всякий случай"
type UserRepository interface {
    GetByID(id int) (*User, error)
    GetByEmail(email string) (*User, error)
    GetByPhone(phone string) (*User, error)         // "может понадобится"
    GetByUsername(username string) (*User, error)    // "может понадобится"
    GetByExternalID(provider, id string) (*User, error) // "для OAuth потом"
    ListWithFilters(filters UserFilters) ([]*User, error) // "вдруг захотят"
    BulkCreate(users []*User) error                 // "для импорта"
    ExportToCSV() ([]byte, error)                   // "бизнес попросит"
}

// ХОРОШО: только то, что нужно СЕЙЧАС
type UserRepository interface {
    GetByID(id int) (*User, error)
    GetByEmail(email string) (*User, error)
    Create(user *User) error
    Update(user *User) error
}

// Добавишь методы, когда появится реальная задача.
// Сейчас каждый лишний метод — это код, который надо:
// - реализовать
// - протестировать
// - поддерживать
// - объяснять новым разработчикам`,
            explanation: 'YAGNI экономит время. Каждая нереализованная фича — сэкономленные часы разработки, тестирования и будущей поддержки. Добавить метод позже намного проще, чем удалить уже используемый.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'KISS — простота vs. умность',
            code: `// ПЛОХО: "умный" код с битовыми операциями
// Что делает эта функция? Сходу не скажешь.
func processFlags(flags uint8) (bool, bool, bool) {
    return flags&0x01 != 0, flags&0x02 != 0, flags&0x04 != 0
}

// ХОРОШО: явное лучше неявного
type UserPermissions struct {
    CanRead   bool
    CanWrite  bool
    CanDelete bool
}

func NewPermissions(canRead, canWrite, canDelete bool) UserPermissions {
    return UserPermissions{
        CanRead:   canRead,
        CanWrite:  canWrite,
        CanDelete: canDelete,
    }
}

// ПЛОХО: рекурсивный факториал выглядит красиво, но...
func factorial(n int) int {
    if n <= 1 { return 1 }
    return n * factorial(n-1) // stack overflow при n > ~10000
}

// ХОРОШО: итеративный вариант проще и надёжнее
func factorial(n int) int {
    result := 1
    for i := 2; i <= n; i++ {
        result *= i
    }
    return result
}`,
            explanation: 'KISS не означает писать примитивно. Это значит выбирать более простое решение из нескольких работающих. Bitwise tricks уместны в low-level коде, но не в бизнес-логике.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Тест читаемости:</strong> если новый разработчик не может понять, что делает функция за 30 секунд — код недостаточно чистый. Комментарий «что делает» — симптом плохого кода. Комментарий «почему сделано именно так» — признак хорошего.</p>`
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<p><strong>DRY — не абсолют.</strong> Иногда небольшое дублирование лучше неправильной абстракции. Если два куска кода выглядят похоже, но меняются по разным причинам — не объединяй их насильно. <em>«Wrong abstraction is worse than duplication»</em> — Sandi Metz.</p>`
        },
        {
            type: 'editor',
            title: 'Рефакторинг: применяем DRY и KISS',
            instructions: `Перед тобой код с нарушениями DRY и KISS. Задача:\n1. Вынеси повторяющуюся логику расчёта скидки в отдельную функцию\n2. Упрости условие проверки VIP-статуса\n3. Функция должна корректно обрабатывать все три типа заказов`,
            starterCode: `package main

import "fmt"

// ЗАДАНИЕ: отрефакторируй этот код
// Примени DRY — убери дублирование логики скидки
// Примени KISS — упрости условие VIP

func processOrder(orderType string, amount float64, isVIP bool, loyaltyYears int) float64 {
    var discount float64

    if orderType == "electronics" {
        if isVIP == true || loyaltyYears >= 3 {
            discount = amount * 0.15
        } else {
            discount = amount * 0.05
        }
    }

    if orderType == "clothing" {
        if isVIP == true || loyaltyYears >= 3 {
            discount = amount * 0.15
        } else {
            discount = amount * 0.05
        }
    }

    if orderType == "food" {
        if isVIP == true || loyaltyYears >= 3 {
            discount = amount * 0.10
        } else {
            discount = amount * 0.02
        }
    }

    return amount - discount
}

func main() {
    fmt.Println(processOrder("electronics", 1000, true, 0))
    fmt.Println(processOrder("food", 500, false, 5))
}`,
            hints: [
                'Заметь: условие isVIP || loyaltyYears >= 3 повторяется — вынеси в переменную isPremium',
                'Логика скидки для electronics и clothing одинакова — это нарушение DRY',
                'isVIP == true это то же самое, что просто isVIP',
                'Создай вспомогательную функцию calculateDiscount(amount float64, premiumRate, regularRate float64) float64'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что означает принцип DRY?',
                    options: [
                        'Код должен быть написан быстро',
                        'Каждое знание имеет единственное представление в системе',
                        'Не используй сторонние библиотеки',
                        'Всегда используй интерфейсы'
                    ],
                    correct: 1,
                    explanation: 'DRY — Don\'t Repeat Yourself. Принцип об устранении дублирования знаний, не просто дублирования кода.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Команда собирается добавить поддержку OAuth "на будущее", хотя сейчас нет такой задачи. Какой принцип нарушается?',
                    options: ['DRY', 'KISS', 'YAGNI', 'SRP'],
                    correct: 2,
                    explanation: 'YAGNI — You Aren\'t Gonna Need It. Не пиши код для функций, которые могут понадобиться в будущем.'
                },
                {
                    id: 'q3',
                    type: 'multiple',
                    question: 'Что характеризует чистый код? (несколько правильных ответов)',
                    options: [
                        'Использует максимально сложные алгоритмы',
                        'Выражает намерение автора без дополнительных комментариев',
                        'Легко изменить, не сломав другие части',
                        'Всегда занимает минимальное количество строк',
                        'Минимум удивлений для читающего'
                    ],
                    correct: [1, 2, 4],
                    explanation: 'Чистый код читаем, изменяем и предсказуем. Краткость — не самоцель.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Сколько процентов времени разработчики тратят на чтение кода (по исследованиям)?',
                    options: ['30%', '50%', '70%', '90%'],
                    correct: 2,
                    explanation: 'До 70% времени уходит на чтение существующего кода. Поэтому читаемость критически важна.'
                },
                {
                    id: 'q5',
                    type: 'code-fill',
                    question: 'Упрости условие: `if isAdmin == true { ... }`. Как написать правильно?',
                    options: [
                        'if isAdmin == true { ... }',
                        'if isAdmin != false { ... }',
                        'if isAdmin { ... }',
                        'if bool(isAdmin) { ... }'
                    ],
                    correct: 2,
                    explanation: 'Булевые переменные не нужно сравнивать с true/false. if isAdmin { } — идиоматично и читаемо.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Правило бойскаута применительно к коду означает:',
                    options: [
                        'Всегда переписывай старый код полностью',
                        'Не трогай чужой код',
                        'Оставь код чище, чем нашёл',
                        'Добавляй комментарии ко всем функциям'
                    ],
                    correct: 2,
                    explanation: 'Маленькие улучшения при каждом касании кода суммируются в большое качество со временем.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Когда допустимо небольшое дублирование кода?',
                    options: [
                        'Никогда — DRY абсолютен',
                        'Когда два куска кода меняются по разным причинам',
                        'Когда разработчик спешит',
                        'Только в тестовом коде'
                    ],
                    correct: 1,
                    explanation: 'Неправильная абстракция хуже дублирования. Если два куска кода похожи, но имеют разные причины для изменения — объединять их опасно.'
                }
            ]
        }
    ]
};
