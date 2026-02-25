export default {
  id: '16-05',
  title: 'Уровни изоляции транзакций',
  description: 'ACID. Read Uncommitted, Read Committed, Repeatable Read, Serializable. Dirty read, Non-repeatable read, Phantom read.',
  estimatedTime: 25,
  xpReward: 130,
  sections: [
    {
      type: 'theory',
      content: `<h2>ACID — гарантии транзакций</h2>
<ul>
  <li><strong>A — Atomicity</strong>: транзакция выполняется целиком или не выполняется вообще</li>
  <li><strong>C — Consistency</strong>: транзакция переводит БД из одного корректного состояния в другое</li>
  <li><strong>I — Isolation</strong>: конкурентные транзакции не видят промежуточные состояния друг друга</li>
  <li><strong>D — Durability</strong>: после COMMIT данные сохранены даже при сбое</li>
</ul>
<h2>Проблемы конкурентного доступа</h2>
<ul>
  <li><strong>Dirty Read</strong> — чтение незафиксированных данных другой транзакции</li>
  <li><strong>Non-Repeatable Read</strong> — повторное чтение той же строки даёт разный результат</li>
  <li><strong>Phantom Read</strong> — повторный запрос возвращает другое число строк (новые вставки)</li>
</ul>`
    },
    {
      type: 'diagram',
      format: 'mermaid',
      code: `graph TD
    A["Уровни изоляции"] --> B["Read Uncommitted\\n(наименее строгий)"]
    A --> C["Read Committed\\n(по умолчанию в PostgreSQL)"]
    A --> D["Repeatable Read"]
    A --> E["Serializable\\n(наиболее строгий)"]
    B --> B1["Dirty Read: ДА\\nNon-Rep Read: ДА\\nPhantom: ДА"]
    C --> C1["Dirty Read: НЕТ\\nNon-Rep Read: ДА\\nPhantom: ДА"]
    D --> D1["Dirty Read: НЕТ\\nNon-Rep Read: НЕТ\\nPhantom: ДА*"]
    E --> E1["Dirty Read: НЕТ\\nNon-Rep Read: НЕТ\\nPhantom: НЕТ"]
    style B fill:#f44336,color:#fff
    style C fill:#FF9800,color:#fff
    style D fill:#2196F3,color:#fff
    style E fill:#4CAF50,color:#fff`,
      caption: '* PostgreSQL реализует Repeatable Read через MVCC, поэтому он также защищает от Phantom Read'
    },
    {
      type: 'code-example',
      language: 'bash',
      title: 'Уровни изоляции в PostgreSQL',
      code: `-- Установка уровня изоляции для транзакции
BEGIN;
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
-- ... запросы
COMMIT;

-- Или сразу при BEGIN
BEGIN ISOLATION LEVEL REPEATABLE READ;
-- ... запросы
COMMIT;

-- Проверить текущий уровень изоляции
SHOW transaction_isolation;

-- Изменить уровень по умолчанию для сессии
SET SESSION CHARACTERISTICS AS TRANSACTION
    ISOLATION LEVEL SERIALIZABLE;

-- Демонстрация Non-Repeatable Read
-- Сессия 1 (READ COMMITTED):
BEGIN;
SELECT balance FROM accounts WHERE id = 1; -- 1000

-- Сессия 2 (параллельно):
BEGIN;
UPDATE accounts SET balance = 900 WHERE id = 1;
COMMIT;

-- Сессия 1 (читаем снова):
SELECT balance FROM accounts WHERE id = 1; -- 900 (изменилось!)
COMMIT;

-- С REPEATABLE READ сессия 1 видела бы 1000 оба раза`,
      explanation: 'PostgreSQL по умолчанию использует READ COMMITTED. Для финансовых операций (переводы, списания) используйте REPEATABLE READ или SERIALIZABLE.'
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'Транзакции в Go с уровнями изоляции',
      code: `package main

import (
    "context"
    "database/sql"
    "fmt"
    "log"

    _ "github.com/lib/pq"
)

func transferMoney(db *sql.DB, fromID, toID int, amount float64) error {
    // Используем Serializable для финансовых операций
    tx, err := db.BeginTx(context.Background(), &sql.TxOptions{
        Isolation: sql.LevelSerializable,
    })
    if err != nil {
        return err
    }
    defer func() {
        if err != nil {
            tx.Rollback()
        }
    }()

    // Читаем баланс отправителя
    var balance float64
    err = tx.QueryRow(
        "SELECT balance FROM accounts WHERE id = $1 FOR UPDATE",
        fromID,
    ).Scan(&balance)
    if err != nil {
        return fmt.Errorf("read balance: %w", err)
    }

    if balance < amount {
        return fmt.Errorf("insufficient funds: have %.2f, need %.2f", balance, amount)
    }

    // Списываем
    _, err = tx.Exec(
        "UPDATE accounts SET balance = balance - $1 WHERE id = $2",
        amount, fromID,
    )
    if err != nil {
        return fmt.Errorf("debit: %w", err)
    }

    // Начисляем
    _, err = tx.Exec(
        "UPDATE accounts SET balance = balance + $1 WHERE id = $2",
        amount, toID,
    )
    if err != nil {
        return fmt.Errorf("credit: %w", err)
    }

    return tx.Commit()
}

func main() {
    db, err := sql.Open("postgres", "postgres://user:pass@localhost/db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    if err := transferMoney(db, 1, 2, 100.0); err != nil {
        log.Printf("Transfer failed: %v", err)
    } else {
        fmt.Println("Transfer successful")
    }
}`,
      explanation: 'sql.TxOptions позволяет указать уровень изоляции при открытии транзакции. FOR UPDATE блокирует строку для обновления — предотвращает race condition. defer Rollback — безопасный паттерн: если tx.Commit() уже вызван, Rollback ничего не делает.'
    },
    {
      type: 'info-box',
      variant: 'note',
      content: '<p>В PostgreSQL нет настоящего Read Uncommitted — он ведёт себя как Read Committed. PostgreSQL использует MVCC (Multi-Version Concurrency Control): читатели не блокируют писателей, писатели не блокируют читателей.</p>'
    },
    {
      type: 'quiz',
      questions: [
        {
          id: 'q1605-1',
          type: 'single',
          question: 'Какой уровень изоляции используется в PostgreSQL по умолчанию?',
          options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
          correct: 1,
          explanation: 'PostgreSQL по умолчанию использует Read Committed. Это означает защиту от Dirty Read, но допускает Non-Repeatable Read (повторное чтение может дать разные результаты).'
        },
        {
          id: 'q1605-2',
          type: 'single',
          question: 'Что такое Dirty Read?',
          options: [
            'Чтение из индекса, а не из таблицы',
            'Чтение данных незафиксированной транзакции другой сессии',
            'Чтение NULL значений',
            'Чтение из временных таблиц'
          ],
          correct: 1,
          explanation: 'Dirty Read — транзакция А читает данные, которые изменила транзакция Б, но Б ещё не сделала COMMIT. Если Б откатится, А уже прочитала "грязные" данные, которых не существует.'
        },
        {
          id: 'q1605-3',
          type: 'single',
          question: 'Какой уровень изоляции следует использовать для банковских переводов?',
          options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read или Serializable', 'Уровень не важен'],
          correct: 2,
          explanation: 'Для финансовых операций нужен Repeatable Read или Serializable. Read Committed допускает Non-Repeatable Read: вы проверяете баланс, другая транзакция его списывает, вы снова проверяете — разные значения. Это может привести к двойному списанию.'
        }
      ]
    }
  ]
};
