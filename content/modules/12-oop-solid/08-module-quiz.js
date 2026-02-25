export default {
    id: '12-08',
    title: 'Итоговый квиз: ООП и SOLID',
    description: 'Проверьте знания по всему модулю: ООП в Go, все 5 принципов SOLID и чистая архитектура.',
    estimatedTime: 15,
    xpReward: 30,
    sections: [
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q12-08-1',
                    type: 'single',
                    question: 'Как Go реализует полиморфизм без классов?',
                    options: [
                        'Через ключевое слово virtual',
                        'Через interfaces — неявная реализация по набору методов',
                        'Через embedding struct',
                        'Через generics'
                    ],
                    correct: 1,
                    explanation: 'Интерфейсы в Go реализуются неявно (duck typing). Если тип имеет все методы интерфейса — он его реализует. Это основа полиморфизма в Go.'
                },
                {
                    id: 'q12-08-2',
                    type: 'single',
                    question: 'Struct UserService имеет методы: Register(), Login(), SendEmail(), SaveToDB(). Какой принцип нарушен?',
                    options: [
                        'OCP — не открыт для расширения',
                        'SRP — слишком много ответственностей',
                        'LSP — неправильная замена типов',
                        'ISP — слишком толстый интерфейс'
                    ],
                    correct: 1,
                    explanation: 'UserService делает аутентификацию, отправку email И работу с БД — три ответственности. Нарушение SRP. Нужны UserAuthService, EmailService, UserRepository.'
                },
                {
                    id: 'q12-08-3',
                    type: 'single',
                    question: 'Функция ProcessPayment имеет switch по типу платежа (card/crypto/paypal). Новый метод оплаты требует изменения функции. Это нарушение:',
                    options: [
                        'SRP',
                        'OCP',
                        'LSP',
                        'DIP'
                    ],
                    correct: 1,
                    explanation: 'OCP: код должен быть открыт для расширения, закрыт для изменения. Решение: интерфейс PaymentProcessor с методом Process(). Новые методы — новые типы.'
                },
                {
                    id: 'q12-08-4',
                    type: 'single',
                    question: 'Duck interface Fly() возвращает ошибку "утки не летают" при вызове. Это нарушение:',
                    options: [
                        'SRP',
                        'OCP',
                        'LSP',
                        'ISP'
                    ],
                    correct: 2,
                    explanation: 'LSP: подтипы должны выполнять контракт базового типа. Fly() подразумевает полёт — Duck нарушает контракт. Решение: разделить Bird и Flyer.'
                },
                {
                    id: 'q12-08-5',
                    type: 'single',
                    question: 'Интерфейс Database имеет 15 методов: CRUD + индексы + транзакции + миграции. Нарушение:',
                    options: [
                        'SRP',
                        'OCP',
                        'LSP',
                        'ISP'
                    ],
                    correct: 3,
                    explanation: 'ISP: много маленьких интерфейсов лучше одного большого. Разбить на Reader, Writer, Migrator и т.д. Каждый потребитель берёт только нужное.'
                },
                {
                    id: 'q12-08-6',
                    type: 'single',
                    question: 'NotificationService создаёт внутри себя new(TwilioSMSClient). Если завтра нужен AWS SNS — придётся менять NotificationService. Это нарушение:',
                    options: [
                        'SRP',
                        'OCP',
                        'ISP',
                        'DIP'
                    ],
                    correct: 3,
                    explanation: 'DIP: зависеть от абстракций, не от конкреций. NotificationService должен принимать SMSProvider (интерфейс) через конструктор (DI), а не создавать Twilio напрямую.'
                },
                {
                    id: 'q12-08-7',
                    type: 'multiple',
                    question: 'Что характеризует слой Domain в чистой архитектуре? (выберите все верные)',
                    options: [
                        'Содержит Go-структуры сущностей (Entity)',
                        'Импортирует database/sql для работы с БД',
                        'Определяет интерфейсы репозиториев',
                        'Содержит HTTP handlers',
                        'Не зависит от внешних фреймворков'
                    ],
                    correct: [0, 2, 4],
                    explanation: 'Domain — ядро: чистые сущности, интерфейсы-контракты, без внешних зависимостей. Никакого SQL, HTTP, Redis — только чистый Go.'
                },
                {
                    id: 'q12-08-8',
                    type: 'multiple',
                    question: 'Какие преимущества дают интерфейсы в Go?',
                    options: [
                        'Неявная реализация — не нужно объявлять implements',
                        'Полиморфизм — одна функция работает с разными типами',
                        'Ускорение кода в рантайме',
                        'Тестируемость — можно использовать моки',
                        'Развязывание зависимостей (decoupling)'
                    ],
                    correct: [0, 1, 3, 4],
                    explanation: 'Интерфейсы дают: неявную реализацию (duck typing), полиморфизм, тестируемость через моки, и развязывание зависимостей. Ускорение рантайма — не их задача.'
                }
            ]
        }
    ]
};
