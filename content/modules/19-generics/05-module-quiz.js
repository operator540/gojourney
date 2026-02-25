export default {
    id: '19-05',
    title: 'Итоговый квиз: Дженерики',
    description: 'Проверяем знания по дженерикам Go — constraints, generic types, best practices',
    estimatedTime: 15,
    xpReward: 30,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Проверим знания по дженерикам</h2>
                <p>Этот квиз охватывает все темы модуля: введение в дженерики, constraints, generic типы и best practices.</p>
            `
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что означает [T comparable] в объявлении функции?',
                    options: [
                        'T должен поддерживать операторы == и !=',
                        'T должен поддерживать <, >, <=, >=',
                        'T должен быть числовым типом',
                        'T — это любой тип'
                    ],
                    correct: 0,
                    explanation: 'comparable — встроенный constraint для типов поддерживающих == и !=. Это нужно для ключей map, поиска, дедупликации. Для < и > нужен cmp.Ordered.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'type MyFloat float64. Будет ли MyFloat удовлетворять constraint ~float64?',
                    options: [
                        'Да, потому что underlying type MyFloat = float64',
                        'Нет, MyFloat — другой тип',
                        'Только если явно написать MyFloat(x)',
                        'Зависит от версии Go'
                    ],
                    correct: 0,
                    explanation: '~float64 означает "float64 и все типы с underlying type = float64". MyFloat имеет underlying type = float64, поэтому удовлетворяет ~float64.'
                },
                {
                    id: 'q3',
                    type: 'code-fill',
                    question: 'Дополните объявление generic функции Contains для слайса:\nfunc Contains___(slice []T, item T) bool',
                    template: 'func Contains___(slice []T, item T) bool',
                    correct: '[T comparable]',
                    caseSensitive: false,
                    explanation: '[T comparable] — T должен быть comparable для сравнения через == внутри функции.'
                },
                {
                    id: 'q4',
                    type: 'multiple',
                    question: 'Какие из следующих операций можно выполнить с T any?',
                    options: [
                        'Присвоить значение: var x T',
                        'Создать слайс: make([]T, 0)',
                        'Сравнить: a == b где a, b T',
                        'Передать как аргумент функции',
                        'Сложить: a + b где a, b T'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'С any: создавать переменные, слайсы, передавать аргументами — да. Сравнивать == нельзя (нужен comparable). Арифметику нельзя (нужен Number/Ordered constraint).'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Можно ли в методе generic структуры объявить новый type parameter?',
                    options: [
                        'Нет, только использовать параметры из объявления структуры',
                        'Да, добавив в квадратных скобках',
                        'Да, через ключевое слово extend',
                        'Да, если constraint это допускает'
                    ],
                    correct: 0,
                    explanation: 'Методы на generic типах могут только использовать type parameters объявленные в типе. Для новых type parameters нужны свободные функции (не методы).'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Какой пакет Go 1.21 содержит готовые generic утилиты для работы с map?',
                    options: ['maps', 'maputils', 'generic', 'collections'],
                    correct: 0,
                    explanation: 'В Go 1.21 добавлен пакет maps с generic функциями Keys(), Values(), Clone(), Copy() и другими.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Функция используется только с int. Нужны ли дженерики?',
                    options: [
                        'Нет, просто напишите func с конкретным типом int',
                        'Да, всегда лучше generic',
                        'Да, для совместимости с будущим кодом',
                        'Зависит от размера функции'
                    ],
                    correct: 0,
                    explanation: 'Дженерики нужны когда есть реальное дублирование кода для разных типов. Если функция нужна только для int — делайте func Add(a, b int) int. Не усложняйте без причины.'
                },
                {
                    id: 'q8',
                    type: 'multiple',
                    question: 'Какие утверждения про дженерики в Go верны?',
                    options: [
                        'Добавлены в Go 1.18',
                        'any — псевдоним interface{}',
                        'Дженерики всегда медленнее конкретных функций',
                        'Type inference позволяет не писать тип явно',
                        'Constraints — это интерфейсы'
                    ],
                    correct: [0, 1, 3, 4],
                    explanation: 'Go 1.18 ✓, any=interface{} ✓, type inference ✓, constraints=interface ✓. Дженерики НЕ всегда медленнее — для примитивов компилятор генерирует специализированный код.'
                }
            ]
        },
        {
            type: 'theory',
            content: `
                <h2>Дженерики: итоги модуля</h2>
                <ul>
                    <li>🧪 <strong>Go 1.18</strong> — дженерики появились в 2022 году, это крупнейшее изменение языка</li>
                    <li>📐 <strong>Type parameters</strong> объявляются в <code>[T Constraint]</code> — для функций и типов</li>
                    <li>🔒 <strong>Constraints = интерфейсы</strong>: any, comparable, union types (<code>int | float64</code>), методы</li>
                    <li>〜 <strong>Тильда</strong> <code>~T</code> включает все типы с underlying type = T</li>
                    <li>🗂️ <strong>Generic типы</strong>: Stack, Queue, Set, Cache, Result, Optional — мощные паттерны</li>
                    <li>📦 <strong>stdlib</strong>: Go 1.21 добавил <code>slices</code>, <code>maps</code>, <code>cmp</code> на основе дженериков</li>
                    <li>⚖️ <strong>Когда использовать</strong>: алгоритмы, контейнеры, утилиты. НЕ бизнес-логика</li>
                </ul>
                <p>Отличная работа! Вы завершили модуль по дженерикам. Переходите к следующему модулю — Tooling и CI/CD.</p>
            `
        }
    ]
};
