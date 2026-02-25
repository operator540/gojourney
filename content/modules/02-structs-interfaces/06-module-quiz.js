export default {
    id: '02-06',
    title: 'Итоговый квиз: Структуры и интерфейсы',
    description: 'Финальная проверка знаний по всему модулю: structs, methods, interfaces, embedding, type assertions',
    estimatedTime: 25,
    xpReward: 30,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Финальная проверка модуля</h2>
                <p>Вы прошли модуль <strong>«Структуры и интерфейсы»</strong> — фундамент системы типов Go. Этот квиз охватывает все темы:</p>

                <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px; border:1px solid var(--border); text-align:left">Тема</th>
                            <th style="padding:10px; border:1px solid var(--border); text-align:left">Ключевые концепции</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px; border:1px solid var(--border)">Структуры (structs)</td>
                            <td style="padding:10px; border:1px solid var(--border)">Объявление, инициализация, теги, указатели на структуры</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px; border:1px solid var(--border)">Методы (methods)</td>
                            <td style="padding:10px; border:1px solid var(--border)">Value receiver vs pointer receiver, методы на любых типах</td>
                        </tr>
                        <tr>
                            <td style="padding:10px; border:1px solid var(--border)">Интерфейсы (interfaces)</td>
                            <td style="padding:10px; border:1px solid var(--border)">Неявная реализация, any, nil interface, Accept interfaces</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px; border:1px solid var(--border)">Встраивание (embedding)</td>
                            <td style="padding:10px; border:1px solid var(--border)">Продвижение методов, перекрытие, множественное встраивание</td>
                        </tr>
                        <tr>
                            <td style="padding:10px; border:1px solid var(--border)">Type assertions</td>
                            <td style="padding:10px; border:1px solid var(--border)">Comma-ok, type switch, capability checking</td>
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
                    question: 'Какой способ инициализации структуры наиболее устойчив к изменениям?',
                    options: [
                        'User{Name: "Alice", Age: 30} — именованные поля',
                        'User{"Alice", 30} — позиционный',
                        'new(User) — через new',
                        'var u User — нулевое значение'
                    ],
                    correct: 0,
                    explanation: 'Именованная инициализация не ломается при добавлении новых полей в структуру. Позиционный вариант хрупок: добавление поля в середину сломает весь код.'
                },
                {
                    id: 'q2',
                    type: 'multiple',
                    question: 'Когда необходим pointer receiver (*T)? (все верные ответы)',
                    options: [
                        'Когда метод изменяет поля структуры',
                        'Когда структура большая — для избежания копирования',
                        'Когда нужна согласованность с другими методами типа',
                        'Для всех методов без исключения'
                    ],
                    correct: [0, 1, 2],
                    explanation: 'Pointer receiver нужен: 1) для изменения полей, 2) для больших структур (не копировать), 3) для согласованности. Value receiver работает с копией и не может изменить оригинал.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Как в Go тип реализует интерфейс?',
                    options: [
                        'Неявно — достаточно иметь все методы с нужными сигнатурами',
                        'Через ключевое слово implements',
                        'Через ключевое слово extends',
                        'Через регистрацию в реестре типов'
                    ],
                    correct: 0,
                    explanation: 'В Go реализация интерфейсов неявная (structural/duck typing). Нет ключевого слова implements. Если тип имеет все методы интерфейса — он его реализует.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Что такое any в Go?',
                    options: [
                        'Алиас для interface{} — пустой интерфейс, реализуемый любым типом',
                        'Динамический тип для любых значений (как в Python)',
                        'Ключевое слово для дженериков',
                        'Тип, аналогичный null в других языках'
                    ],
                    correct: 0,
                    explanation: 'any = interface{} начиная с Go 1.18. Любой тип реализует пустой интерфейс (у него нет методов). any — это не динамическая типизация, тип всё равно хранится внутри.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Что происходит при встраивании структуры Address в User?',
                    options: [
                        'Поля и методы Address "продвигаются" и доступны напрямую через u.City, u.FullAddress()',
                        'User наследует Address и является его подтипом',
                        'Address копируется в User при компиляции',
                        'Address становится приватным полем User'
                    ],
                    correct: 0,
                    explanation: 'Embedding продвигает поля и методы встроенного типа. u.City эквивалентно u.Address.City. Но User НЕ является Address — в Go нет наследования.'
                },
                {
                    id: 'q6',
                    type: 'code-fill',
                    question: 'Безопасное извлечение string из any: s, ___ := i.(string)',
                    template: 's, ___ := i.(string)',
                    correct: 'ok',
                    caseSensitive: false,
                    explanation: 'Comma-ok паттерн: ok — bool, true если тип совпал. При несовпадении ok=false, s="" — без паники. Без ok — panic при несовпадении типа.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Какой интерфейс реализует тип, имеющий метод Error() string?',
                    options: [
                        'error — встроенный интерфейс Go',
                        'fmt.Stringer — через метод String()',
                        'io.Reader — через метод Read()',
                        'fmt.Formatter — через метод Format()'
                    ],
                    correct: 0,
                    explanation: 'type error interface { Error() string } — встроенный интерфейс. Реализуя Error() string вы можете возвращать свой тип как error.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Что произойдёт, если два встроенных типа имеют метод с одинаковым именем и вы его вызываете напрямую?',
                    options: [
                        'Ошибка компиляции: ambiguous selector',
                        'Вызовется метод первого встроенного типа',
                        'Вызовутся оба метода по очереди',
                        'Panic в runtime'
                    ],
                    correct: 0,
                    explanation: 'Go — статически типизированный язык. Неоднозначность обнаруживается при компиляции. Решение: явное обращение s.Logger.Name() или s.Metrics.Name().'
                },
                {
                    id: 'q9',
                    type: 'single',
                    question: 'Что такое "capability checking" в Go?',
                    options: [
                        'Проверка через type assertion, реализует ли значение опциональный интерфейс',
                        'Проверка прав доступа к файлам',
                        'Проверка версии Go компилятора',
                        'Проверка наличия методов через reflection'
                    ],
                    correct: 0,
                    explanation: 'if f, ok := w.(http.Flusher); ok { f.Flush() } — базовый интерфейс обязателен, расширенные возможности проверяются опционально. Пример из stdlib: io.WriterTo, io.ReaderFrom.'
                },
                {
                    id: 'q10',
                    type: 'multiple',
                    question: 'Какие утверждения об интерфейсах в Go верны? (все верные)',
                    options: [
                        'Nil interface и interface со значением nil — разные вещи',
                        'Интерфейсы можно встраивать в другие интерфейсы',
                        'Функции должны принимать интерфейсы, а возвращать конкретные типы ("Accept interfaces, return structs")',
                        'Интерфейсы в Go рекомендуется делать большими для максимального охвата'
                    ],
                    correct: [0, 1, 2],
                    explanation: 'Nil-интерфейс содержит (nil, nil), а интерфейс со значением nil содержит (*T, nil) — они не равны. Интерфейсы встраиваются. "Accept interfaces, return structs" — ключевой принцип. Интерфейсы должны быть маленькими (1-3 метода).'
                },
                {
                    id: 'q11',
                    type: 'single',
                    question: 'Какой принцип реализует embedding в Go?',
                    options: [
                        'Composition over Inheritance — предпочитайте композицию наследованию',
                        'Open/Closed Principle — открыт для расширения, закрыт для изменения',
                        'Liskov Substitution — подтипы заменяют базовые типы',
                        'Dependency Inversion — зависимость от абстракций'
                    ],
                    correct: 0,
                    explanation: '"Prefer composition over inheritance" — один из главных принципов ООП. Go реализует его через embedding вместо наследования, избегая хрупких иерархий классов.'
                },
                {
                    id: 'q12',
                    type: 'single',
                    question: 'Зачем методу String() string делать реализацию для структуры?',
                    options: [
                        'Для реализации интерфейса fmt.Stringer — fmt.Println автоматически вызовет его',
                        'Для конвертации структуры в JSON',
                        'Для экспорта структуры из пакета',
                        'Это обязательный метод для всех структур'
                    ],
                    correct: 0,
                    explanation: 'fmt.Stringer: type Stringer interface { String() string }. Если тип реализует String(), то fmt.Println, fmt.Sprintf("%v") и другие функции используют его автоматически.'
                }
            ]
        }
    ]
};
