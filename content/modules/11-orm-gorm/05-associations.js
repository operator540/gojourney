export default {
    id: '11-05',
    title: 'Связи (Associations)',
    description: 'Belongs To, Has One, Has Many, Many to Many, Preloading',
    estimatedTime: 25,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Типы связей</h2>
                <ul>
                    <li><strong>Belongs To:</strong> <code>User</code> принадлежит <code>Company</code> (User.CompanyID).</li>
                    <li><strong>Has One:</strong> У <code>User</code> есть один <code>CreditCard</code>.</li>
                    <li><strong>Has Many:</strong> У <code>User</code> много <code>Orders</code>.</li>
                    <li><strong>Many To Many:</strong> У <code>User</code> много <code>Languages</code>, и наоборот.</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Определение связей',
            code: `// Belongs To
type User struct {
  gorm.Model
  Name      string
  CompanyID int
  Company   Company
}

type Company struct {
  ID   int
  Name string
}

// Has Many
type User struct {
  gorm.Model
  Orders []Order
}

type Order struct {
  gorm.Model
  UserID uint
  Price  float64
}`,
            explanation: 'GORM автоматически определяет Foreign Keys по имени типа + ID (например, UserID). Можно переопределить тегами `gorm:"foreignKey:UserRefer"`'
        },
        {
            type: 'theory',
            content: `
                <h2>Eager Loading (Preload)</h2>
                <p>По умолчанию GORM не загружает связи (Lazy Loading). Чтобы загрузить их, используйте <code>Preload</code>.</p>
                <pre><code class="language-go">// Загрузить пользователя вместе с заказами
db.Preload("Orders").Find(&users)

// Вложенный Preload
db.Preload("Orders.Items").Find(&users)

// Preload с условиями
db.Preload("Orders", "state = ?", "paid").Find(&users)</code></pre>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Joins',
            code: `// Join работает быстрее для one-to-one, так как это один SQL запрос
db.Joins("Company").Find(&users)

// Join с условием
db.Joins("Company", db.Where(&Company{Alive: true})).Find(&users)`,
            explanation: 'Preload делает 2 запроса (SELECT * FROM users; SELECT * FROM orders WHERE user_id IN (...)). Joins делает один запрос с LEFT JOIN.'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Какой метод делает 2 SQL запроса для загрузки связей?',
                    options: [
                        'Joins',
                        'Preload',
                        'Select',
                        'Association'
                    ],
                    correct: 1,
                    explanation: 'Preload сначала грузит основную модель, потом собирает ID и делает второй запрос для загрузки привязанных данных.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Как определить связь Many-to-Many?',
                    options: [
                        'Создать таблицу вручную',
                        'Использовать тег `gorm:"many2many:user_languages;"`',
                        'Никак, GORM не поддерживает M2M',
                        'Через Has Many'
                    ],
                    correct: 1,
                    explanation: 'GORM автоматически создаст промежуточную таблицу (join table) с указанным именем.'
                }
            ]
        }
    ]
};
