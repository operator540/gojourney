export default {
    id: '04-05',
    title: 'Итоговый квиз: Обработка ошибок',
    description: 'Финальная проверка: error interface, custom errors, wrapping, errors.Is/As, panic/recover, sentinel errors — весь модуль 04',
    estimatedTime: 20,
    xpReward: 30,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Итог модуля: Обработка ошибок в Go</h2>
                <p>Go отличается от большинства языков — здесь нет исключений. Ошибки это обычные значения, которые явно передаются и проверяются. Это делает код предсказуемым, но требует дисциплины.</p>

                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Тема</th>
                            <th style="padding:10px;border:1px solid var(--border);text-align:left">Ключевые концепции</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">error interface</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>Error() string</code>, <code>if err != nil</code>, множественные возвраты</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Custom errors</td>
                            <td style="padding:10px;border:1px solid var(--border)">Структура с <code>Error() string</code>, дополнительные поля (Code, Field)</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Wrapping</td>
                            <td style="padding:10px;border:1px solid var(--border)"><code>fmt.Errorf("%w")</code>, <code>errors.Is</code>, <code>errors.As</code>, <code>errors.Join</code></td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">panic/recover</td>
                            <td style="padding:10px;border:1px solid var(--border)">Must-паттерн, инварианты, HTTP middleware, safeGo</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Интерфейс error в Go определён как:',
                    options: [
                        'interface { Error() string }',
                        'interface { Error() error }',
                        'struct { Message string }',
                        'type error = string'
                    ],
                    correct: 0,
                    explanation: 'error — встроенный интерфейс с одним методом Error() string. Любой тип с этим методом реализует error. Это основа гибкой системы ошибок Go.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Как правильно создать sentinel error?',
                    options: [
                        'var ErrNotFound = errors.New("не найдено")',
                        'const ErrNotFound = "не найдено"',
                        'type ErrNotFound error',
                        'ErrNotFound := fmt.Errorf("не найдено")'
                    ],
                    correct: 0,
                    explanation: 'var ErrNotFound = errors.New("...") — стандартный способ. var (не const) потому что это значение типа error (интерфейс). Именование: Err + PascalCase описание.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Чем %w отличается от %v в fmt.Errorf?',
                    options: [
                        '%w оборачивает и сохраняет оригинал для errors.Is/As; %v только форматирует строку',
                        '%w форматирует шире, показывая больше деталей',
                        'Ничем — оба делают одно и то же',
                        '%w только для кастомных ошибок, %v для стандартных'
                    ],
                    correct: 0,
                    explanation: '%w (wrap) упаковывает оригинальную ошибку внутрь новой — errors.Is/As её найдут. %v просто конвертирует в строку через .Error() — оригинал теряется навсегда.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'errors.Is(err, target) — когда вернёт true?',
                    options: [
                        'Когда err == target ИЛИ target найден в цепочке обёрток err',
                        'Только когда err == target (прямое равенство)',
                        'Когда err.Error() == target.Error()',
                        'Когда err и target одного типа'
                    ],
                    correct: 0,
                    explanation: 'errors.Is рекурсивно разворачивает цепочку через Unwrap, сравнивая на каждом уровне. Это позволяет находить sentinel error даже через несколько обёрток.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Для чего используется errors.As(err, &target)?',
                    options: [
                        'Извлечь конкретный тип из цепочки ошибок и записать в target',
                        'Сравнить два значения ошибок',
                        'Конвертировать string в error',
                        'Развернуть всю цепочку до оригинала'
                    ],
                    correct: 0,
                    explanation: 'errors.As разворачивает цепочку, ищет ошибку типа *T (где target **T) и заполняет target. После успешного As — работаете с конкретным типом и его полями (Code, Field и т.д.).'
                },
                {
                    id: 'q6',
                    type: 'multiple',
                    question: 'Какие ситуации автоматически вызывают panic в Go? (несколько ответов)',
                    options: [
                        'Выход за границы слайса',
                        'Разыменование nil-указателя',
                        'Деление на ноль (целочисленное)',
                        'Чтение из nil-map',
                        'Запись в nil-map'
                    ],
                    correct: [0, 1, 2, 4],
                    explanation: 'Чтение из nil-map безопасно — возвращает нулевое значение. Запись в nil-map — panic. Все остальные — тоже panic: out-of-range, nil-dereference, integer divide by zero.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Где должен вызываться recover()?',
                    options: [
                        'Только внутри defer-функции',
                        'В любом месте функции',
                        'В начале main()',
                        'В горутине где произошла паника'
                    ],
                    correct: 0,
                    explanation: 'recover() работает ТОЛЬКО внутри defer. Вне defer всегда возвращает nil. Это фундаментальное ограничение — нельзя перехватить панику постфактум.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Что происходит при неперехваченной panic в горутине?',
                    options: [
                        'Вся программа завершается',
                        'Только эта горутина завершается',
                        'Паника игнорируется',
                        'Go runtime перезапускает горутину'
                    ],
                    correct: 0,
                    explanation: 'Неперехваченная паника в любой горутине убивает всю программу. Поэтому в production HTTP-серверах обязателен RecoveryMiddleware, а долгоживущие горутины защищают через safeGo с defer/recover.'
                },
                {
                    id: 'q9',
                    type: 'multiple',
                    question: 'Когда panic УМЕСТЕН? (несколько ответов)',
                    options: [
                        'Must-функции при инициализации (regexp.MustCompile, template.Must)',
                        'Нарушение инварианта структуры данных',
                        'Невозможно подключиться к БД в main()',
                        'Пользователь ввёл неверный email',
                        'Файл с конфигом не найден (runtime)'
                    ],
                    correct: [0, 1, 2],
                    explanation: 'panic — для "это не должно происходить" (баг разработчика) и Must-инициализации. Невалидный email и отсутствующий конфиг — ожидаемые ситуации, обрабатывайте через error.'
                },
                {
                    id: 'q10',
                    type: 'code-fill',
                    question: 'Оберните ошибку с контекстом, сохранив цепочку:',
                    template: 'return fmt.Errorf("getUserByID(%d): ___%w", id, err)',
                    correct: '%',
                    caseSensitive: true,
                    explanation: 'fmt.Errorf("контекст: %w", err) — %w wrap оборачивает ошибку. Оригинал доступен через errors.Is/As. %v обрывает цепочку.'
                },
                {
                    id: 'q11',
                    type: 'single',
                    question: 'Зачем использовать именованный возврат в функции с recover?',
                    options: [
                        'Defer может изменить возвращаемое значение: func f() (err error) { defer func() { err = ... }() }',
                        'Это обязательный синтаксис при использовании recover',
                        'Для читаемости кода',
                        'Именованный возврат не влияет на recover'
                    ],
                    correct: 0,
                    explanation: 'defer выполняется перед передачей результата вызывающей функции. Именованный возврат позволяет defer модифицировать err. Без именованного возврата — нельзя вернуть ошибку из recover через return.'
                },
                {
                    id: 'q12',
                    type: 'single',
                    question: 'errors.Join(e1, e2) (Go 1.20+) — что вернёт errors.Is(joined, e1)?',
                    options: [
                        'true — errors.Is проверяет все объединённые ошибки',
                        'false — Join не поддерживает errors.Is',
                        'Зависит от порядка аргументов',
                        'true только если e1 был первым аргументом'
                    ],
                    correct: 0,
                    explanation: 'errors.Join создаёт ошибку содержащую обе. errors.Is рекурсивно проверяет все вложенные. Оба e1 и e2 доступны через errors.Is независимо от порядка.'
                },
                {
                    id: 'q13',
                    type: 'single',
                    question: 'Что такое Must-паттерн?',
                    options: [
                        'Функция, которая паникует если операция не удалась — используется для инициализации',
                        'Обязательная проверка if err != nil',
                        'Паттерн обёртки ошибок',
                        'Тип функции с множественными возвратами'
                    ],
                    correct: 0,
                    explanation: 'Must-функции (MustConnect, template.Must, regexp.MustCompile) паникуют при ошибке. Применяются при инициализации — ошибка означает баг разработчика, не рантайм-ситуацию. Никогда не используйте Must в обычных обработчиках.'
                }
            ]
        }
    ]
};
