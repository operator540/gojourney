export default {
    id: '22-07',
    title: 'Итоговый тест: Gin Framework',
    description: 'Проверь знания Gin: роутинг, middleware, binding, ответы',
    estimatedTime: 20,
    xpReward: 40,

    sections: [
        {
            type: 'info-box',
            variant: 'note',
            content: `<strong>Финальный тест по модулю Gin.</strong> 10 вопросов охватывают весь материал. Требуется 8/10 для получения XP. Удачи!`
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q2207-1',
                    type: 'single',
                    question: 'Что возвращает gin.Default()?',
                    options: [
                        'Чистый роутер без middleware',
                        'Роутер с Logger и Recovery middleware',
                        'Роутер только с Logger',
                        'Роутер с CORS и Auth middleware'
                    ],
                    correct: 1,
                    explanation: 'gin.Default() = gin.New() + gin.Logger() + gin.Recovery(). Logger логирует все запросы. Recovery перехватывает panic и возвращает 500. gin.New() — чистый роутер без ничего.'
                },
                {
                    id: 'q2207-2',
                    type: 'single',
                    question: 'Какой паттерн соответствует wildcard роуту /files/*path?',
                    options: [
                        'Только /files/document.pdf',
                        '/files/docs/pdf/report.pdf и любой путь после /files/',
                        'Только /files/ без ничего после',
                        '/files/:path (то же самое)'
                    ],
                    correct: 1,
                    explanation: '*path — wildcard, захватывает весь остаток URL включая /. Подходит для /files/a/b/c.pdf. :path — именованный параметр, не может содержать / и захватывает только один сегмент.'
                },
                {
                    id: 'q2207-3',
                    type: 'single',
                    question: 'Что происходит после вызова c.AbortWithStatusJSON(401, ...) в middleware?',
                    options: [
                        'Только текущий middleware прерывается',
                        'Все последующие middleware и финальный обработчик не вызываются',
                        'Соединение с клиентом закрывается',
                        'Сервер перезапускается'
                    ],
                    correct: 1,
                    explanation: 'c.Abort() устанавливает флаг что цепочка прервана. Следующие middleware и хендлер не вызываются. Текущий middleware продолжает выполняться до конца функции.'
                },
                {
                    id: 'q2207-4',
                    type: 'single',
                    question: 'Какой тег binding использовать чтобы поле было обязательным и было валидным email?',
                    options: [
                        'binding:"email"',
                        'binding:"required" binding:"email"',
                        'binding:"required,email"',
                        'validate:"required,email"'
                    ],
                    correct: 2,
                    explanation: 'Несколько правил разделяются запятой в одном теге: binding:"required,email". Gin использует go-playground/validator под капотом.'
                },
                {
                    id: 'q2207-5',
                    type: 'single',
                    question: 'Как передать данные от одного middleware к следующему обработчику?',
                    options: [
                        'Через глобальную переменную',
                        'c.Set("key", value) и c.Get("key") в другом обработчике',
                        'Через заголовки запроса',
                        'Невозможно передать данные между middleware'
                    ],
                    correct: 1,
                    explanation: 'c.Set/c.Get хранят данные в контексте текущего запроса. Каждый запрос имеет свой контекст — нет гонок данных. Типичный пример: Auth middleware записывает user_id, хендлер читает его.'
                },
                {
                    id: 'q2207-6',
                    type: 'single',
                    question: 'Чем r.Group("/api") полезен?',
                    options: [
                        'Только для организации кода',
                        'Общий URL prefix + возможность применить middleware только к этой группе',
                        'Увеличивает производительность',
                        'Только для версионирования API'
                    ],
                    correct: 1,
                    explanation: 'Group решает две задачи: общий prefix (не повторять /api в каждом роуте) и изоляция middleware (auth только для защищённых роутов). Группы можно вкладывать.'
                },
                {
                    id: 'q2207-7',
                    type: 'single',
                    question: 'Какой код HTTP означает "ресурс создан"?',
                    options: [
                        '200 OK',
                        '201 Created',
                        '204 No Content',
                        '202 Accepted'
                    ],
                    correct: 1,
                    explanation: '201 Created — стандартный ответ на POST-запрос создания ресурса. 200 — успешная операция. 204 — успех без тела ответа (DELETE). 202 — запрос принят но обработка ещё идёт (async).'
                },
                {
                    id: 'q2207-8',
                    type: 'single',
                    question: 'В чём разница между c.ShouldBind и c.ShouldBindJSON?',
                    options: [
                        'Нет никакой разницы',
                        'ShouldBind автоматически определяет формат по Content-Type, ShouldBindJSON только JSON',
                        'ShouldBind только для form данных',
                        'ShouldBindJSON поддерживает больше типов данных'
                    ],
                    correct: 1,
                    explanation: 'ShouldBind смотрит на Content-Type и выбирает парсер: application/json → JSON, application/x-www-form-urlencoded → form. ShouldBindJSON всегда парсит как JSON независимо от заголовков.'
                },
                {
                    id: 'q2207-9',
                    type: 'single',
                    question: 'Какой режим использовать в production?',
                    options: [
                        'debug — больше логов',
                        'test — для стабильности',
                        'release — gin.SetMode(gin.ReleaseMode)',
                        'production — специальный режим'
                    ],
                    correct: 2,
                    explanation: 'gin.ReleaseMode отключает вывод всех роутов при старте и уменьшает verbose-логирование. Задаётся через gin.SetMode(gin.ReleaseMode) или переменную GIN_MODE=release.'
                },
                {
                    id: 'q2207-10',
                    type: 'single',
                    question: 'Как зарегистрировать middleware только для конкретной группы роутов?',
                    options: [
                        'r.UseGroup("/api", middleware)',
                        'group := r.Group("/api"); group.Use(middleware)',
                        'r.GET("/api", middleware, handler)',
                        'Нельзя, только глобально'
                    ],
                    correct: 1,
                    explanation: 'group.Use() применяет middleware только к роутам этой группы. r.Use() — глобально. Можно также передать middleware прямо в Group: r.Group("/api", authMiddleware).'
                }
            ]
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<strong>Модуль Gin завершён!</strong><br>
Ты знаешь:<br>
✅ Создание роутера, режимы работы<br>
✅ Роутинг: параметры, wildcards, группы<br>
✅ Middleware: написание, цепочки, abort<br>
✅ Binding и валидация входных данных<br>
✅ Форматы ответов и обработка ошибок<br>
✅ Полная структура Gin-проекта<br><br>
<strong>Дальше:</strong> Добавь PostgreSQL через GORM (модуль 11) к своему Gin-API!`
        }
    ]
};
