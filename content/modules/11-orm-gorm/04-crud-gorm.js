export default {
    id: '11-04',
    title: 'CRUD в GORM',
    description: 'Основные операции: Create, Read, Update, Delete',
    estimatedTime: 25,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Create (Создание)</h2>
                <p>Метод <code>Create</code> принимает указатель на структуру (или слайс структур для batch insert).</p>
                <pre><code class="language-go">user := User{Name: "Jinzhu", Age: 18}
result := db.Create(&user) 
// user.ID теперь заполнен (если авто-инкремент)
// result.Error - ошибка
// result.RowsAffected - кол-во затронутых строк</code></pre>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Read (Чтение)</h2>
                <ul>
                    <li><code>First</code> — первая запись по PK (сортировка по ID).</li>
                    <li><code>Take</code> — одна запись (без сортировки).</li>
                    <li><code>Last</code> — последняя запись (сортировка по ID desc).</li>
                    <li><code>Find</code> — все записи, удовлетворяющие условию (возвращает слайс).</li>
                </ul>
                <p>Условия добавляются через <code>Where</code>:</p>
                <pre><code class="language-go">db.Where("name = ?", "jinzhu").First(&user)</code></pre>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Update (Обновление) и Delete (Удаление)',
            code: `// Обновление всех полей (даже пустых)
db.Save(&user)

// Обновление конкретных полей
db.Model(&user).Update("name", "hello")

// Обновление нескольких полей (через struct или map)
// ВНИМАНИЕ: GORM не обновляет поля с нулевыми значениями (0, "", false) через struct
db.Model(&user).Updates(User{Name: "hello", Age: 18}) 

// Удаление
db.Delete(&user, 1) // DELETE FROM users WHERE id = 1`,
            explanation: 'При использовании `Updates` со структурой, поля с zero-values игнорируются. Чтобы обновить поле в 0 или false, используйте `map[string]interface{}` или `Select`/`Omit`.'
        },
        {
            type: 'editor',
            title: 'Практика: CRUD',
            instructions: '1. Создайте пользователя "Admin" (age 30). 2. Найдите его по имени. 3. Обновите возраст до 35. 4. Удалите его. Используйте переменные user, db.',
            starterCode: `package main

import (
    "gorm.io/gorm"
    "fmt"
)

type User struct {
    gorm.Model
    Name string
    Age  int
}

func RunCRUD(db *gorm.DB) error {
    var user User
    // 1. Create
    
    // 2. Read (Find by name)
    
    // 3. Update (Age = 35)
    
    // 4. Delete
    
    return nil
}`,
            hints: [
                'db.Create(&User{Name: "Admin", Age: 30})',
                'db.Where("name = ?", "Admin").First(&user)',
                'db.Model(&user).Update("age", 35)',
                'db.Delete(&user)'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Почему `db.Model(&user).Updates(User{Age: 0})` не обновит возраст в 0?',
                    options: [
                        'Потому что 0 — это ошибка',
                        'Потому что GORM игнорирует zero-values при обновлении через структуру',
                        'Потому что нужно использовать UpdateColumn',
                        'Потому что Age — это int'
                    ],
                    correct: 1,
                    explanation: 'Это сделано, чтобы не затереть данные пустыми значениями. Для установки 0 используйте map: `.Updates(map[string]interface{}{"age": 0})`.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Какой метод возвращает ошибку `ErrRecordNotFound`?',
                    options: [
                        'Find',
                        'First',
                        'Scan',
                        'Where'
                    ],
                    correct: 1,
                    explanation: 'Методы First, Last, Take возвращают ошибку, если запись не найдена. Метод Find не возвращает ошибку (просто пустой слайс).'
                }
            ]
        }
    ]
};
