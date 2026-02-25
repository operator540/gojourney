export default {
  id: '16-07',
  title: 'Блокировки в PostgreSQL',
  description: 'Row-level locks. SELECT FOR UPDATE. Deadlock и как избежать. Advisory locks.',
  estimatedTime: 20,
  xpReward: 120,
  sections: [
    {
      type: 'theory',
      content: `<h2>Блокировки (Locks)</h2>
<p>Блокировки защищают данные при конкурентном доступе. PostgreSQL использует несколько уровней блокировок:</p>
<ul>
  <li><strong>Table-level locks</strong> — блокировка всей таблицы (например, при ALTER TABLE)</li>
  <li><strong>Row-level locks</strong> — блокировка отдельных строк</li>
  <li><strong>Advisory locks</strong> — пользовательские блокировки (не привязаны к данным)</li>
</ul>
<h3>Режимы row-level блокировок:</h3>
<ul>
  <li><strong>FOR UPDATE</strong> — эксклюзивная блокировка (никто другой не может UPDATE/DELETE/lock)</li>
  <li><strong>FOR SHARE</strong> — разделяемая блокировка (другие могут читать, но не менять)</li>
  <li><strong>FOR NO KEY UPDATE</strong> — эксклюзивная, но не блокирует внешние ключи</li>
  <li><strong>FOR KEY SHARE</strong> — блокирует только изменение ключей</li>
</ul>`
    },
    {
      type: 'code-example',
      language: 'bash',
      title: 'SELECT FOR UPDATE — пессимистичная блокировка',
      code: `-- Пример: безопасный перевод денег с SELECT FOR UPDATE
-- Транзакция 1:
BEGIN;
-- Блокируем обе строки для обновления
SELECT id, balance
FROM accounts
WHERE id IN (1, 2)
ORDER BY id  -- ВАЖНО: всегда в одном порядке чтобы избежать deadlock
FOR UPDATE;

-- Теперь транзакция 2 будет ждать, пока транзакция 1 завершится

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- NOWAIT — не ждать, вернуть ошибку сразу
SELECT * FROM accounts WHERE id = 1 FOR UPDATE NOWAIT;
-- ERROR: could not obtain lock on row in relation "accounts"

-- SKIP LOCKED — пропустить заблокированные строки
-- Полезно для очередей задач!
SELECT * FROM tasks
WHERE status = 'pending'
ORDER BY created_at
LIMIT 1
FOR UPDATE SKIP LOCKED;
-- Разные воркеры получат разные строки`,
      explanation: 'FOR UPDATE блокирует строку до конца транзакции. FOR UPDATE SKIP LOCKED — идеальный паттерн для job queue: несколько воркеров берут разные задачи без конфликтов.'
    },
    {
      type: 'theory',
      content: `<h2>Deadlock — взаимная блокировка</h2>
<p>Deadlock возникает когда транзакция A ждёт блокировку, удерживаемую транзакцией B, а транзакция B ждёт блокировку, удерживаемую транзакцией A.</p>
<pre style="background:#1e1e2e;padding:12px;border-radius:6px">
T1: LOCK row 1 → ждёт row 2 (заблокирован T2)
T2: LOCK row 2 → ждёт row 1 (заблокирован T1)
→ DEADLOCK!
</pre>
<p>PostgreSQL автоматически обнаруживает deadlock и откатывает одну из транзакций.</p>`
    },
    {
      type: 'code-example',
      language: 'bash',
      title: 'Как избежать Deadlock',
      code: `-- ПРОБЛЕМА: разный порядок блокировок → deadlock
-- Транзакция 1:
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
-- ждёт...
SELECT * FROM accounts WHERE id = 2 FOR UPDATE;

-- Транзакция 2 (параллельно):
BEGIN;
SELECT * FROM accounts WHERE id = 2 FOR UPDATE;
-- ждёт...
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
-- DEADLOCK!

-- РЕШЕНИЕ 1: всегда блокировать в одном порядке (по id)
-- Транзакция 1 и 2:
SELECT * FROM accounts
WHERE id IN (1, 2)
ORDER BY id ASC  -- оба блокируют сначала id=1, потом id=2
FOR UPDATE;

-- РЕШЕНИЕ 2: один SELECT блокирует все нужные строки сразу
SELECT * FROM accounts WHERE id = ANY(ARRAY[1, 2]) FOR UPDATE;

-- РЕШЕНИЕ 3: использовать Advisory Lock
-- (не привязан к конкретным строкам)
SELECT pg_advisory_xact_lock(1); -- блокировка с ключом 1
SELECT pg_advisory_xact_lock(2); -- блокировка с ключом 2
-- освобождается автоматически при COMMIT/ROLLBACK`,
      explanation: 'Главное правило: всегда блокируй ресурсы в одном и том же порядке. Если транзакции блокируют строки в разном порядке — deadlock неизбежен при конкурентном доступе.'
    },
    {
      type: 'code-example',
      language: 'bash',
      title: 'Advisory Locks — пользовательские блокировки',
      code: `-- Advisory locks не привязаны к строкам/таблицам
-- Используются как mutex для произвольных операций

-- Session-level advisory lock (держится до конца сессии)
SELECT pg_advisory_lock(123456);        -- блокирующий
SELECT pg_try_advisory_lock(123456);    -- неблокирующий (true/false)
SELECT pg_advisory_unlock(123456);      -- освобождение

-- Transaction-level (освобождается при COMMIT/ROLLBACK)
BEGIN;
SELECT pg_advisory_xact_lock(42);
-- ... критическая секция ...
COMMIT; -- блокировка освобождается автоматически

-- Практический пример: distributed mutex в Go
-- Предотвращаем параллельный запуск крона
SELECT pg_try_advisory_lock(hashtext('daily-cleanup-job'))`,
      explanation: 'Advisory locks — легковесный способ реализовать распределённый mutex через PostgreSQL. Полезно для: предотвращения параллельного запуска джобов, rate limiting, distributed locking без Redis.'
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'Advisory Lock в Go — distributed mutex',
      code: `package main

import (
    "context"
    "database/sql"
    "fmt"
    "log"
)

// TryWithAdvisoryLock выполняет fn если удалось получить блокировку
func TryWithAdvisoryLock(ctx context.Context, db *sql.DB, lockKey int64, fn func() error) error {
    tx, err := db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }
    defer tx.Rollback()

    // Пытаемся получить блокировку (неблокирующий)
    var acquired bool
    err = tx.QueryRowContext(ctx,
        "SELECT pg_try_advisory_xact_lock($1)", lockKey,
    ).Scan(&acquired)
    if err != nil {
        return err
    }

    if !acquired {
        return fmt.Errorf("lock is held by another process")
    }

    // Блокировку получили — выполняем работу
    if err := fn(); err != nil {
        return err
    }

    return tx.Commit()
}

func runDailyJob(db *sql.DB) {
    lockKey := int64(12345) // уникальный ключ для этого джоба
    err := TryWithAdvisoryLock(context.Background(), db, lockKey, func() error {
        fmt.Println("Running daily cleanup job...")
        // ... работа ...
        return nil
    })
    if err != nil {
        log.Printf("Job skipped or failed: %v", err)
    }
}`,
      explanation: 'pg_try_advisory_xact_lock возвращает true если блокировка получена, false если уже занята. При COMMIT/ROLLBACK блокировка освобождается автоматически. Идеально для cron-джобов в distributed системах.'
    },
    {
      type: 'quiz',
      questions: [
        {
          id: 'q1606-1',
          type: 'single',
          question: 'Что делает FOR UPDATE SKIP LOCKED?',
          options: [
            'Блокирует все строки и пропускает обновление заблокированных',
            'Пропускает уже заблокированные строки вместо ожидания',
            'Обновляет строки без блокировки',
            'Вызывает ошибку при обнаружении заблокированных строк'
          ],
          correct: 1,
          explanation: 'SKIP LOCKED: если строка заблокирована другой транзакцией — пропустить её и взять следующую доступную. Идеальный паттерн для job queue: несколько воркеров берут разные задачи без конфликтов.'
        },
        {
          id: 'q1606-2',
          type: 'single',
          question: 'Как PostgreSQL реагирует на обнаруженный deadlock?',
          options: [
            'Ждёт бесконечно',
            'Завершает обе транзакции с ошибкой',
            'Откатывает одну из транзакций и возвращает ошибку',
            'Автоматически разрешает конфликт'
          ],
          correct: 2,
          explanation: 'PostgreSQL обнаруживает deadlock (обычно за несколько секунд) и откатывает одну из транзакций (выбирает "жертву") с ошибкой ERROR: deadlock detected. Другая транзакция может продолжить работу.'
        },
        {
          id: 'q1606-3',
          type: 'single',
          question: 'Какое главное правило предотвращения deadlock при блокировке нескольких строк?',
          options: [
            'Блокировать строки только в порядке убывания ID',
            'Всегда блокировать строки в одном и том же порядке во всех транзакциях',
            'Блокировать строки по одной, не вместе',
            'Использовать READ COMMITTED вместо SERIALIZABLE'
          ],
          correct: 1,
          explanation: 'Главное правило: все транзакции должны блокировать ресурсы в одном и том же порядке (например, всегда по возрастанию ID). Если T1 блокирует {1, 2} и T2 блокирует {1, 2} в одном порядке — deadlock невозможен.'
        }
      ]
    }
  ]
};
