export default {
    id: '11-03',
    title: 'Модели и Теги',
    description: 'Определение моделей, gorm.Model, структурные теги, hooks',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>gorm.Model</h2>
                <p>GORM предоставляет базовую структуру <code>gorm.Model</code>, которую можно встроить в свои модели. Она добавляет:</p>
                <ul>
                    <li><code>ID</code> (uint key)</li>
                    <li><code>CreatedAt</code> (время создания)</li>
                    <li><code>UpdatedAt</code> (время обновления)</li>
                    <li><code>DeletedAt</code> (для Soft Delete)</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Модель с тегами',
            code: `type Product struct {
  gorm.Model
  Code  string \`gorm:"primaryKey"\` // Можно переопределить PK
  Price uint
  Name  string \`gorm:"column:product_name;not null;default:'Unknown'"\` // Кастомные настройки
  Email string \`gorm:"uniqueIndex"\` // Уникальный индекс
  IgnoreMe string \`gorm:"-"\` // Игнорировать поле
}`,
            explanation: 'Теги `gorm:"..."` позволяют детально настроить схему БД: имена колонок, индексы, дефолтные значения и ограничения.'
        },
        {
            type: 'theory',
            content: `
                <h2>Soft Delete</h2>
                <p>Если в модели есть поле <code>DeletedAt</code> (типа <code>gorm.DeletedAt</code>), GORM не удалит запись физически (DELETE запрос), а лишь проставит текущее время в это поле.</p>
                <p>При обычных запросах такие записи будут скрыты. Чтобы найти их, используйте <code>Unscoped()</code>.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Hooks (Хуки)',
            code: `func (u *User) BeforeSave(tx *gorm.DB) (err error) {
  if u.Age < 0 {
    return errors.New("возраст не может быть отрицательным")
  }
  return
}

func (u *User) AfterCreate(tx *gorm.DB) (err error) {
    log.Println("Создан пользователь:", u.ID)
    return
}`,
            explanation: 'Хуки позволяют выполнять логику до или после операций (Save, Create, Update, Delete). Если хук вернет ошибку, транзакция откатится.'
        },
        {
            type: 'editor',
            title: 'Практика: Определение модели',
            instructions: 'Создайте модель "Book" с полями: Title (обязательно), Author, Pages. Встройте gorm.Model. Добавьте хук BeforeCreate, который делает Title заглавным (strings.ToUpper).',
            starterCode: `package main

import (
    "gorm.io/gorm"
    "strings"
)

type Book struct {
    // Встройте gorm.Model
    // Добавьте поля
}

func (b *Book) BeforeCreate(tx *gorm.DB) (err error) {
    // Ваша логика
    return
}

func main() {
    // Тест (симуляция)
}`,
            hints: [
                'type Book struct { gorm.Model; Title string; Author string; Pages int }',
                'b.Title = strings.ToUpper(b.Title)'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что делает тег `gorm:"-"`?',
                    options: [
                        'Делает поле обязательным',
                        'Исключает поле из чтения и записи в БД',
                        'Делает поле индексом',
                        'Удаляет колонку'
                    ],
                    correct: 1,
                    explanation: 'Это способ сказать GORM игнорировать поле структуры (например, если оно нужно только для вычислений в коде).'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Как восстановить "мягко удаленную" (Soft Deleted) запись?',
                    options: [
                        'Это невозможно',
                        'Очистить поле DeletedAt (сделать NULL)',
                        'Скопировать запись',
                        'Изменить ID'
                    ],
                    correct: 1,
                    explanation: 'Soft Delete просто ставит метку времени. Сброс этой метки в NULL делает запись снова "живой".'
                }
            ]
        }
    ]
};
