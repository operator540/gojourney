export default {
    id: '11-02',
    title: 'Основы GORM',
    description: 'Подключение к БД, конфигурация, AutoMigrate',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Библиотека GORM</h2>
                <p><strong>GORM</strong> — самая популярная ORM библиотека для Go. Она поддерживает MySQL, PostgreSQL, SQLite, SQL Server.</p>
                <p>В основе GORM лежит использование драйверов <code>database/sql</code>, но она предоставляет более высокоуровневый API.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Подключение (PostgreSQL)',
            code: `package main

import (
  "gorm.io/driver/postgres"
  "gorm.io/gorm"
  "gorm.io/gorm/logger"
)

func main() {
  dsn := "host=localhost user=gorm password=gorm dbname=gorm port=9920 sslmode=disable"
  
  // gorm.Open возвращает *gorm.DB
  db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
    // Настройка логгера (полезно для отладки SQL)
    Logger: logger.Default.LogMode(logger.Info),
  })
  
  if err != nil {
    panic("failed to connect database")
  }

  // Получение generic *sql.DB для настройки пула
  sqlDB, _ := db.DB()
  sqlDB.SetMaxIdleConns(10)
  sqlDB.SetMaxOpenConns(100)
}`,
            explanation: 'GORM использует драйверы (например, pgx для Postgres) под капотом. Объект `db` потокобезопасен.'
        },
        {
            type: 'theory',
            content: `
                <h2>AutoMigrate</h2>
                <p>GORM умеет автоматически создавать и изменять таблицы на основе ваших Go структур. Это называется <strong>Auto Migration</strong>.</p>
                <p><code>db.AutoMigrate(&User{})</code> создаст таблицу <code>users</code>, если её нет, и добавит новые колонки, если они появились в структуре.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Пример миграции',
            code: `type User struct {
  ID   uint
  Name string
  Age  int
}

// В main():
db.AutoMigrate(&User{}) 
// Создаст таблицу: CREATE TABLE "users" ("id" serial,"name" text,"age" bigint, PRIMARY KEY ("id"))`,
            explanation: 'AutoMigrate никогда не удаляет колонки или данные, чтобы случайно не повредить продуктив. Только создает и добавляет.'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Удалит ли AutoMigrate колонку, если убрать поле из структуры?',
                    options: [
                        'Да, сразу',
                        'Нет, это безопасно',
                        'Спросит подтверждение',
                        'Выдаст ошибку'
                    ],
                    correct: 1,
                    explanation: 'AutoMigrate спроектирован так, чтобы не удалять данные. Если вы уберете поле из структуры, колонка в БД останется.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Зачем нужен Logger с уровнем Info в GORM?',
                    options: [
                        'Чтобы писать логи в файл',
                        'Чтобы видеть, какой SQL генерирует GORM',
                        'Чтобы замедлить выполнение',
                        'Для красоты'
                    ],
                    correct: 1,
                    explanation: 'Это критически важно при разработке — видеть реальный SQL, который отправляется в базу, чтобы отлаживать запросы и проверять индексы.'
                }
            ]
        }
    ]
};
