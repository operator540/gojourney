export default {
    id: '05-07',
    title: 'Итоговый квиз: Конкурентность',
    description: 'Проверьте знания по горутинам, каналам, select, sync, паттернам и context',
    estimatedTime: 15,
    xpReward: 30,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Проверка знаний</h2>
                <p>Конкурентность — главная фишка Go. Этот квиз покрывает все темы модуля: от горутин до context.</p>
            `
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Начальный размер стека горутины:',
                    options: ['~2 КБ', '~1 МБ', '~64 КБ', '~8 КБ'],
                    correct: 0,
                    explanation: 'Горутина начинает с ~2 КБ (может расти). Поток ОС — обычно ~1 МБ.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что произойдёт при отправке в закрытый канал?',
                    options: ['panic', 'Данные потеряются', 'Ошибка компиляции', 'false'],
                    correct: 0,
                    explanation: 'Отправка в закрытый канал вызывает panic. Чтение — безопасно (нулевое значение).'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Что делает select если несколько веток готовы?',
                    options: ['Выбирает случайную', 'Первую по порядку', 'Все', 'panic'],
                    correct: 0,
                    explanation: 'Go рандомизирует выбор, чтобы не создавать неявных приоритетов.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Как обнаружить data race?',
                    options: ['go run -race', 'go vet', 'go test', 'go lint'],
                    correct: 0,
                    explanation: 'Флаг -race включает детектор гонок данных — находит конкурентный доступ без синхронизации.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Что такое Worker Pool?',
                    options: [
                        'N горутин обрабатывают задачи из общей очереди',
                        'Пул подключений',
                        'Кэш горутин',
                        'Массив каналов'
                    ],
                    correct: 0,
                    explanation: 'Worker Pool = фиксированное число воркеров + канал задач. Контролирует параллелизм.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Где должен быть context.Context?',
                    options: ['Первый параметр функции', 'Последний', 'В структуре', 'Глобально'],
                    correct: 0,
                    explanation: 'Конвенция: ctx context.Context — первый параметр. Не хранить в структурах.'
                },
                {
                    id: 'q7',
                    type: 'code-fill',
                    question: 'Как создать буферизованный канал на 5 int?',
                    template: 'ch := make(chan int, ___)',
                    correct: '5',
                    caseSensitive: false,
                    explanation: 'make(chan T, size) — второй аргумент задаёт размер буфера.'
                },
                {
                    id: 'q8',
                    type: 'multiple',
                    question: 'Какие утверждения верны о каналах? (несколько ответов)',
                    options: [
                        'Закрывает отправитель',
                        'Чтение из закрытого канала безопасно',
                        'Повторный close вызывает panic',
                        'Каналы можно сравнивать через =='
                    ],
                    correct: [0, 1, 2],
                    explanation: 'Каналы можно сравнивать (проверка на nil или идентичность), но это редко используется.'
                },
                {
                    id: 'q9',
                    type: 'single',
                    question: 'Сколько раз выполнится sync.Once.Do()?',
                    options: ['Ровно один раз', 'Один раз на горутину', 'Зависит от CPU', 'Минимум один'],
                    correct: 0,
                    explanation: 'sync.Once гарантирует ровно одно выполнение, потокобезопасно.'
                },
                {
                    id: 'q10',
                    type: 'single',
                    question: 'Что произойдёт если не вызвать cancel() у контекста?',
                    options: [
                        'Утечка ресурсов',
                        'panic',
                        'Ошибка компиляции',
                        'Ничего — GC очистит'
                    ],
                    correct: 0,
                    explanation: 'Без cancel() горутины и таймеры не освободятся. Всегда: defer cancel().'
                }
            ]
        }
    ]
};
