export default {
    id: '12-02',
    title: 'Single Responsibility Principle',
    description: 'Каждый модуль, класс или функция должны иметь одну причину для изменения. Изучим SRP на реальных примерах Go-кода.',
    estimatedTime: 15,
    xpReward: 15,
    sections: [
        {
            type: 'theory',
            content: `
<h2>S — Single Responsibility Principle</h2>
<p><em>"У модуля должна быть одна и только одна причина для изменения."</em> — Роберт Мартин</p>
<p>Если ваша структура делает слишком много вещей — она нарушает SRP. Это приводит к:</p>
<ul>
    <li>Сложным тестам (нужно мокать всё сразу)</li>
    <li>Хрупкому коду (изменение одной функции ломает другую)</li>
    <li>Невозможности переиспользования</li>
</ul>
`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Плохо: User делает всё',
            code: `package main

// User нарушает SRP — у неё 3 причины для изменения:
// 1. Изменение логики пользователя
// 2. Изменение способа сохранения в БД
// 3. Изменение способа отправки email
type User struct {
    ID    int
    Name  string
    Email string
}

// Бизнес-логика
func (u *User) Validate() error {
    if u.Name == "" {
        return fmt.Errorf("name is required")
    }
    if !strings.Contains(u.Email, "@") {
        return fmt.Errorf("invalid email")
    }
    return nil
}

// Работа с БД — другая ответственность!
func (u *User) Save(db *sql.DB) error {
    _, err := db.Exec("INSERT INTO users (name, email) VALUES ($1, $2)",
        u.Name, u.Email)
    return err
}

// Отправка email — третья ответственность!
func (u *User) SendWelcomeEmail() error {
    // отправка через SMTP...
    return smtp.SendMail(...)
}`,
            explanation: 'User знает о базе данных, SMTP и валидации одновременно. Любое изменение (смена БД, SMTP-сервиса) заставляет трогать одну структуру.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Хорошо: разделяем ответственности',
            code: `package main

import (
    "fmt"
    "strings"
)

// User — только данные пользователя
type User struct {
    ID    int
    Name  string
    Email string
}

// UserValidator — только валидация
type UserValidator struct{}

func (v *UserValidator) Validate(u *User) error {
    if u.Name == "" {
        return fmt.Errorf("name is required")
    }
    if !strings.Contains(u.Email, "@") {
        return fmt.Errorf("invalid email: %s", u.Email)
    }
    return nil
}

// UserRepository — только работа с БД
type UserRepository struct {
    db *sql.DB
}

func (r *UserRepository) Save(u *User) error {
    _, err := r.db.Exec(
        "INSERT INTO users (name, email) VALUES ($1, $2)",
        u.Name, u.Email,
    )
    return err
}

func (r *UserRepository) FindByID(id int) (*User, error) {
    user := &User{}
    err := r.db.QueryRow("SELECT id, name, email FROM users WHERE id=$1", id).
        Scan(&user.ID, &user.Name, &user.Email)
    return user, err
}

// EmailService — только email
type EmailService struct {
    smtpHost string
}

func (s *EmailService) SendWelcome(u *User) error {
    // отправка через SMTP
    fmt.Printf("Sending welcome email to %s\\n", u.Email)
    return nil
}

// UserService — оркестрирует всё вместе
type UserService struct {
    repo      *UserRepository
    validator *UserValidator
    email     *EmailService
}

func (s *UserService) Register(u *User) error {
    if err := s.validator.Validate(u); err != nil {
        return fmt.Errorf("validation: %w", err)
    }
    if err := s.repo.Save(u); err != nil {
        return fmt.Errorf("save: %w", err)
    }
    return s.email.SendWelcome(u)
}`,
            explanation: 'Теперь каждая структура имеет одну причину меняться. Хочешь сменить БД — трогаешь только UserRepository. Меняешь email-провайдер — только EmailService.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p><strong>Правило:</strong> если вы описываете что делает структура/функция и используете слово "и" — скорее всего нарушаете SRP. "UserService сохраняет пользователя <strong>и</strong> отправляет email" — красный флаг.</p>'
        },
        {
            type: 'info-box',
            variant: 'note',
            content: '<p>SRP не значит "один метод на структуру". <code>UserRepository</code> может иметь Save, FindByID, FindAll, Delete — все они относятся к одной ответственности: работа с хранилищем пользователей.</p>'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q12-02-1',
                    type: 'single',
                    question: 'Что означает "одна причина для изменения" в SRP?',
                    options: [
                        'У структуры должен быть только один метод',
                        'Структура должна зависеть только от одного пакета',
                        'Изменение требований одной бизнес-роли должно требовать изменения только этого модуля',
                        'Код должен изменяться не чаще одного раза в месяц'
                    ],
                    correct: 2,
                    explanation: 'SRP говорит о причинах изменения — о бизнес-акторах. Если изменение требований по email заставляет менять класс User — это нарушение SRP.'
                },
                {
                    id: 'q12-02-2',
                    type: 'multiple',
                    question: 'Какие признаки нарушения SRP? (выберите все)',
                    options: [
                        'Структура импортирует пакеты database/sql И net/smtp',
                        'Структура имеет 10 методов',
                        'Методы структуры работают с данными из разных доменов',
                        'Структура называется Manager или Handler',
                        'Структура имеет приватные поля'
                    ],
                    correct: [0, 2, 3],
                    explanation: 'Импорт несвязанных пакетов, методы разных доменов, суффиксы Manager/Helper/Util — часто признак нарушения SRP. Количество методов само по себе — не нарушение.'
                },
                {
                    id: 'q12-02-3',
                    type: 'single',
                    question: 'OrderService нужно сохранять заказ и отправлять SMS. Как правильно?',
                    options: [
                        'Добавить метод SaveAndNotify() в OrderService',
                        'Создать OrderRepository для сохранения и SMSService для уведомлений, OrderService их использует',
                        'Создать два разных OrderService',
                        'Вынести SMS в горутину внутри метода Save()'
                    ],
                    correct: 1,
                    explanation: 'OrderService-оркестратор использует отдельные OrderRepository и SMSService. Каждый отвечает за своё, OrderService только координирует.'
                }
            ]
        }
    ]
};
