export default {
    id: '10-05',
    title: 'Транзакции и ACID',
    description: 'ACID свойства, db.Begin/Commit/Rollback, savepoints, уровни изоляции, deadlock — надёжность операций с БД',
    estimatedTime: 35,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Транзакция — это "всё или ничего"</h2>
                <p>Вы переводите деньги другу: списываете 1000 рублей со своего счёта и зачисляете ему. Представьте, что между этими двумя операциями сервер упал. Деньги списаны, но не зачислены — катастрофа.</p>
                <p><strong>Транзакция</strong> объединяет несколько операций в один атомарный блок. Либо выполняются ВСЕ операции (Commit), либо ни одна (Rollback). Никакого промежуточного состояния.</p>
                <p>Транзакции гарантируют <strong>ACID</strong> — четыре фундаментальных свойства надёжной СУБД:</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Свойство</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Что гарантирует</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Пример</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>A — Atomicity</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Всё или ничего</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Перевод денег: оба UPDATE или ни одного</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>C — Consistency</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">БД переходит из одного валидного состояния в другое</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Сумма на всех счетах не изменится</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>I — Isolation</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Транзакции не видят незафиксированные изменения друг друга</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Два кассира не продадут один последний билет</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><strong>D — Durability</strong></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">После Commit данные сохранены даже при сбое</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Перевод подтверждён — даже если сервер упадёт</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Базовый паттерн транзакции с defer Rollback',
            code: `package main

import (
    "context"
    "database/sql"
    "fmt"
)

// TransferMoney — перевод денег между счетами
func TransferMoney(ctx context.Context, db *sql.DB, fromID, toID int, amount float64) error {
    // 1. Начинаем транзакцию
    tx, err := db.BeginTx(ctx, &sql.TxOptions{
        Isolation: sql.LevelSerializable, // Наивысший уровень изоляции для денег
    })
    if err != nil {
        return fmt.Errorf("begin tx: %w", err)
    }
    // 2. defer Rollback — главная защита
    // Если функция завершится с ошибкой (или паникой) до Commit — всё откатится.
    // После успешного Commit вызов Rollback безопасно проигнорируется.
    defer tx.Rollback()

    // 3. Проверяем баланс отправителя (с блокировкой строки FOR UPDATE)
    var balance float64
    err = tx.QueryRowContext(ctx,
        "SELECT balance FROM accounts WHERE id = $1 FOR UPDATE",
        fromID,
    ).Scan(&balance)
    if err != nil {
        return fmt.Errorf("get sender balance: %w", err)
    }
    if balance < amount {
        return fmt.Errorf("insufficient funds: have %.2f, need %.2f", balance, amount)
    }

    // 4. Списываем у отправителя
    _, err = tx.ExecContext(ctx,
        "UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2",
        amount, fromID,
    )
    if err != nil {
        return fmt.Errorf("debit sender: %w", err)
    }

    // 5. Зачисляем получателю
    _, err = tx.ExecContext(ctx,
        "UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2",
        amount, toID,
    )
    if err != nil {
        return fmt.Errorf("credit receiver: %w", err)
    }

    // 6. Записываем в журнал транзакций
    _, err = tx.ExecContext(ctx,
        "INSERT INTO transfer_log (from_id, to_id, amount, created_at) VALUES ($1, $2, $3, NOW())",
        fromID, toID, amount,
    )
    if err != nil {
        return fmt.Errorf("log transfer: %w", err)
    }

    // 7. Фиксируем — всё или ничего
    if err := tx.Commit(); err != nil {
        return fmt.Errorf("commit: %w", err)
    }
    return nil
}`,
            explanation: 'FOR UPDATE блокирует строку на время транзакции — никто другой не может её изменить пока мы не закоммитили. Это предотвращает race condition "два перевода одновременно". BeginTx с контекстом — правильный способ, поддерживает отмену по таймауту. Все запросы внутри транзакции должны идти через tx, не db!'
        },
        {
            type: 'theory',
            content: `
                <h2>Уровни изоляции — компромисс скорости и точности</h2>
                <p>Высокая изоляция = больше блокировок = меньше пропускная способность. PostgreSQL по умолчанию использует Read Committed — хороший баланс для большинства задач.</p>

                <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Уровень</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Защищает от</th>
                            <th style="border:1px solid var(--border);padding:10px 14px;text-align:left;">Когда</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>Read Uncommitted</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Ничего (грязное чтение)</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Никогда в продакшене</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>Read Committed</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Грязного чтения</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">По умолчанию в PostgreSQL</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>Repeatable Read</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Грязного + неповторяемого чтения</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Отчёты, аналитика</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="border:1px solid var(--border);padding:10px 14px;"><code>Serializable</code></td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Всех аномалий</td>
                            <td style="border:1px solid var(--border);padding:10px 14px;">Финансовые операции</td>
                        </tr>
                    </tbody>
                </table>

                <p style="margin-top:16px;"><strong>Проблемы изоляции:</strong></p>
                <ul>
                    <li><strong>Dirty Read</strong>: читаем незафиксированные данные другой транзакции</li>
                    <li><strong>Non-Repeatable Read</strong>: одна транзакция читает строку дважды — результат разный (другая транзакция изменила)</li>
                    <li><strong>Phantom Read</strong>: одна транзакция делает запрос дважды — появляются новые строки (другая вставила)</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Savepoints и вложенная логика',
            code: `package main

import (
    "context"
    "database/sql"
    "fmt"
    "log"
)

// ProcessOrder — сложная логика с частичными откатами
func ProcessOrder(ctx context.Context, db *sql.DB, orderID int) error {
    tx, err := db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }
    defer tx.Rollback()

    // Обновляем статус заказа
    _, err = tx.ExecContext(ctx, "UPDATE orders SET status = 'processing' WHERE id = $1", orderID)
    if err != nil {
        return fmt.Errorf("update order status: %w", err)
    }

    // Savepoint перед попыткой отправить email-уведомление
    // Если email упадёт — откатываем только эту часть, не весь заказ
    _, err = tx.ExecContext(ctx, "SAVEPOINT before_notification")
    if err != nil {
        return err
    }

    _, err = tx.ExecContext(ctx,
        "INSERT INTO email_queue (order_id, template, status) VALUES ($1, 'order_processing', 'pending')",
        orderID,
    )
    if err != nil {
        // Откат только до savepoint — заказ останется обновлённым
        log.Printf("email queue failed, rolling back to savepoint: %v", err)
        _, rbErr := tx.ExecContext(ctx, "ROLLBACK TO SAVEPOINT before_notification")
        if rbErr != nil {
            return fmt.Errorf("rollback to savepoint: %w", rbErr)
        }
        // Продолжаем без email-уведомления
    } else {
        // Освобождаем savepoint если email прошёл успешно
        tx.ExecContext(ctx, "RELEASE SAVEPOINT before_notification")
    }

    // Обновляем инвентарь — это критично, без этого нельзя продолжать
    _, err = tx.ExecContext(ctx,
        "UPDATE inventory SET reserved = reserved + 1 WHERE product_id = (SELECT product_id FROM orders WHERE id = $1)",
        orderID,
    )
    if err != nil {
        return fmt.Errorf("update inventory: %w", err) // Откатит всю транзакцию через defer
    }

    return tx.Commit()
}`,
            explanation: 'Savepoints — это "точки сохранения" внутри транзакции. Можно откатиться к savepoint, не отменяя всю транзакцию. Полезно когда часть операций некритична (уведомления, логи) а основная бизнес-логика должна выполниться в любом случае.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Deadlock prevention — правильный порядок блокировок',
            code: `package main

import (
    "context"
    "database/sql"
    "fmt"
    "sort"
)

// ПРОБЛЕМА: Deadlock
// Горутина 1: блокирует account 1, потом пытается заблокировать account 2
// Горутина 2: блокирует account 2, потом пытается заблокировать account 1
// Обе ждут друг друга — тупик

// РЕШЕНИЕ: всегда блокировать ресурсы в одинаковом порядке (по ID)
func TransferSafe(ctx context.Context, db *sql.DB, fromID, toID int, amount float64) error {
    tx, err := db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead})
    if err != nil {
        return err
    }
    defer tx.Rollback()

    // Определяем порядок блокировки — всегда меньший ID первым
    ids := []int{fromID, toID}
    sort.Ints(ids) // Всегда [меньший, больший]

    // Блокируем оба счёта в детерминированном порядке
    var b1, b2 float64
    err = tx.QueryRowContext(ctx,
        "SELECT balance FROM accounts WHERE id = $1 FOR UPDATE",
        ids[0],
    ).Scan(&b1)
    if err != nil {
        return err
    }

    err = tx.QueryRowContext(ctx,
        "SELECT balance FROM accounts WHERE id = $1 FOR UPDATE",
        ids[1],
    ).Scan(&b2)
    if err != nil {
        return err
    }

    // Проверки и переводы...
    senderBalance := b1
    if ids[0] == toID { // Если порядок изменился — берём правильный баланс
        senderBalance = b2
    }

    if senderBalance < amount {
        return fmt.Errorf("insufficient funds")
    }

    _, err = tx.ExecContext(ctx, "UPDATE accounts SET balance = balance - $1 WHERE id = $2", amount, fromID)
    if err != nil {
        return err
    }
    _, err = tx.ExecContext(ctx, "UPDATE accounts SET balance = balance + $1 WHERE id = $2", amount, toID)
    if err != nil {
        return err
    }

    return tx.Commit()
}`,
            explanation: 'Deadlock — обе горутины ждут ресурсы, которые заблокированы друг другом. PostgreSQL обнаруживает deadlock и завершает одну транзакцию с ошибкой. Решение: всегда захватывать блокировки в одном и том же порядке (по возрастанию ID) — тогда deadlock невозможен.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Retry при deadlock</strong> — правильный паттерн для продакшена:</p>
            <pre style="margin:8px 0;"><code>func TransferWithRetry(ctx context.Context, db *sql.DB, from, to int, amount float64) error {
    const maxRetries = 3
    for i := 0; i < maxRetries; i++ {
        err := Transfer(ctx, db, from, to, amount)
        if err == nil {
            return nil
        }
        // Проверяем что это deadlock (код 40P01 в PostgreSQL)
        var pqErr *pgconn.PgError
        if errors.As(err, &pqErr) && pqErr.Code == "40P01" {
            time.Sleep(time.Duration(i+1) * 50 * time.Millisecond)
            continue // Повторяем попытку
        }
        return err // Другая ошибка — не повторяем
    }
    return fmt.Errorf("max retries exceeded")
}</code></pre>`
        },
        {
            type: 'editor',
            title: 'Практика: Покупка билета',
            instructions: 'Реализуйте функцию BuyTicket(db, userID, eventID int). Логика: 1) Проверить что tickets.available > 0 (с FOR UPDATE). 2) Уменьшить available на 1. 3) Создать запись в purchases (user_id, event_id, bought_at). Использовать транзакцию с defer Rollback.',
            starterCode: `package main

import (
    "context"
    "database/sql"
    "fmt"
)

func BuyTicket(ctx context.Context, db *sql.DB, userID, eventID int) error {
    // 1. Начать транзакцию
    
    // 2. defer tx.Rollback()

    // 3. SELECT available FROM tickets WHERE event_id = $1 FOR UPDATE
    var available int
    // err = tx.QueryRowContext(...).Scan(&available)
    // if err != nil { return ... }

    // 4. Проверить available > 0
    
    // 5. UPDATE tickets SET available = available - 1 WHERE event_id = $1

    // 6. INSERT INTO purchases (user_id, event_id, bought_at) VALUES ($1, $2, NOW())

    // 7. tx.Commit()
    return fmt.Errorf("not implemented")
}`,
            hints: [
                'tx, err := db.BeginTx(ctx, nil)',
                'defer tx.Rollback() — сразу после проверки ошибки Begin',
                'err = tx.QueryRowContext(ctx, "SELECT available FROM tickets WHERE event_id = $1 FOR UPDATE", eventID).Scan(&available)',
                'if available <= 0 { return fmt.Errorf("no tickets available") }',
                'tx.ExecContext(ctx, "UPDATE tickets SET available = available - 1 WHERE event_id = $1", eventID)',
                'tx.ExecContext(ctx, "INSERT INTO purchases (user_id, event_id, bought_at) VALUES ($1, $2, NOW())", userID, eventID)',
                'return tx.Commit()'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что означает "A" в ACID?',
                    options: [
                        'Authentication — аутентификация',
                        'Atomicity — атомарность (всё или ничего)',
                        'Availability — доступность',
                        'Authorization — авторизация'
                    ],
                    correct: 1,
                    explanation: 'Atomicity — все операции транзакции выполняются как единое целое. Либо все успешно, либо ни одна. Это главное свойство транзакций.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Зачем нужен паттерн defer tx.Rollback()?',
                    options: [
                        'Чтобы всегда откатывать транзакцию',
                        'Гарантировать откат при любом пути выхода из функции, включая панику. После Commit — безопасно игнорируется',
                        'Чтобы освободить соединение',
                        'Это ошибка — defer нельзя с Rollback'
                    ],
                    correct: 1,
                    explanation: 'defer выполняется при любом выходе из функции: нормальном, через return с ошибкой, через panic. После Commit вызов Rollback вернёт ошибку sql.ErrTxDone которая тихо игнорируется.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Для чего нужен SELECT ... FOR UPDATE?',
                    options: [
                        'Пометить строку для удаления',
                        'Заблокировать строку — другие транзакции не смогут её изменить пока текущая не завершится',
                        'Ускорить UPDATE запрос',
                        'Создать индекс'
                    ],
                    correct: 1,
                    explanation: 'FOR UPDATE — pessimistic locking. Читаем и сразу блокируем. Пока транзакция не завершится, другие горутины ждут. Обязательно для проверки "достаточно ли баланса/билетов" перед изменением.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Как PostgreSQL реагирует на обнаружение deadlock?',
                    options: [
                        'Ждёт бесконечно',
                        'Завершает обе транзакции с ошибкой',
                        'Завершает одну из транзакций с ошибкой 40P01, давая шанс другой продолжить',
                        'Перезапускает сервер'
                    ],
                    correct: 2,
                    explanation: 'PostgreSQL обнаруживает deadlock и убивает одну транзакцию (обычно "жертву" с наименьшим количеством работы), возвращая ошибку с кодом 40P01. Другая транзакция получает возможность завершиться.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Чем Savepoint отличается от обычного Rollback?',
                    options: [
                        'Savepoint быстрее',
                        'ROLLBACK TO SAVEPOINT откатывает только до точки сохранения, не всю транзакцию',
                        'Savepoint для вложенных транзакций',
                        'Нет разницы'
                    ],
                    correct: 1,
                    explanation: 'Savepoint позволяет частичный откат. Откатили проблемную часть (например, отправку email) но основная транзакция продолжается. Без savepoints при любой ошибке откатывается вся транзакция.'
                },
                {
                    id: 'q6',
                    type: 'multiple',
                    question: 'Какие запросы внутри транзакции должны использовать объект tx, а не db?',
                    options: [
                        'Все SELECT',
                        'Все INSERT',
                        'Все UPDATE',
                        'Все DELETE',
                        'Только финансовые операции'
                    ],
                    correct: [0, 1, 2, 3],
                    explanation: 'Все запросы в рамках транзакции должны выполняться через tx. Запрос через db выполнится вне транзакции на другом соединении — ACID гарантии не будет.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Какой уровень изоляции нужен для финансовых операций?',
                    options: [
                        'Read Uncommitted — самый быстрый',
                        'Read Committed — по умолчанию PostgreSQL',
                        'Repeatable Read или Serializable',
                        'Любой, главное правильный код'
                    ],
                    correct: 2,
                    explanation: 'Для денег нужна максимальная защита. Serializable гарантирует что параллельные транзакции выполняются как будто последовательно — никаких аномалий. Производительность снижается, но для финансов это приемлемо.'
                },
                {
                    id: 'q8',
                    type: 'code-fill',
                    question: 'Заполните: проверка что ошибка при Rollback не маскирует оригинальную ошибку.',
                    code: 'defer func() {\n    if err != nil {\n        tx.___() // Откат при ошибке\n    }\n}()',
                    answer: 'Rollback',
                    explanation: 'Этот паттерн — альтернатива defer tx.Rollback(). Откатываем только если есть ошибка. Но простой defer tx.Rollback() обычно проще и надёжнее.'
                }
            ]
        }
    ]
};
