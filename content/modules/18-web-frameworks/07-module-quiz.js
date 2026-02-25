export default {
    id: '18-07',
    title: 'Итоговый квиз: Echo Framework',
    description: 'Проверяем знания Echo: routing, middleware, binding, validation, context',
    estimatedTime: 15,
    xpReward: 28,

    sections: [
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Как объявить путь с параметром в Echo?',
                    options: [
                        'e.GET("/users/:id", handler)',
                        'e.GET("/users/{id}", handler)',
                        'e.GET("/users/<id>", handler)',
                        'e.GET("/users/[id]", handler)'
                    ],
                    correct: 0,
                    explanation: 'Echo использует :param синтаксис. e.GET("/users/:id", h) и c.Param("id") для чтения.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Почему middleware Recover() должен идти первым?',
                    options: [
                        'Чтобы перехватывать паники из других middleware и обработчиков',
                        'Требование спецификации Echo',
                        'Для лучшей производительности',
                        'Recover работает одинаково в любой позиции'
                    ],
                    correct: 0,
                    explanation: 'Первый middleware — самый внешний слой. Recover() оборачивает всю цепочку. Паника в Logger() (идущем после) будет поймана Recover() только если он первый.'
                },
                {
                    id: 'q3',
                    type: 'code-fill',
                    question: 'Bind и validate в одном обработчике:\nvar req Request\nc.___(req)\nc.___(req)',
                    template: 'c.___(req)\nc.___(req)',
                    correct: 'Bind(&',
                    caseSensitive: false,
                    explanation: 'c.Bind(&req) — парсит входящие данные. c.Validate(req) — валидирует по тегам. Bind принимает указатель!'
                },
                {
                    id: 'q4',
                    type: 'multiple',
                    question: 'Что умеет c.Bind() в Echo?',
                    options: [
                        'Парсить JSON body',
                        'Читать query параметры (?page=1)',
                        'Парсить multipart формы',
                        'Автоматически валидировать',
                        'Читать path params (:id)'
                    ],
                    correct: [0, 1, 2],
                    explanation: 'Bind парсит: JSON (Content-Type json), form (urlencoded/multipart), query params (тег query). Path params через c.Param(). Валидация отдельно через c.Validate().'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Как передать данные из middleware в handler через echo.Context?',
                    options: [
                        'c.Set("key", value) в middleware, c.Get("key") в handler',
                        'Через глобальную переменную',
                        'Через заголовок запроса',
                        'Через context.WithValue'
                    ],
                    correct: 0,
                    explanation: 'echo.Context хранит данные в рамках одного запроса. c.Set кладёт, c.Get берёт. При type assertion: c.Get("user_id").(int) — укажите ожидаемый тип.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Для чего нужен e.Group("/api")?',
                    options: [
                        'Создать подгруппу роутов с общим префиксом и middleware',
                        'Создать отдельный HTTP сервер',
                        'Настроить timeout для группы запросов',
                        'Объединить несколько обработчиков в один'
                    ],
                    correct: 0,
                    explanation: 'Group("/api") — все роуты добавленные к группе получат префикс /api. Плюс можно применить middleware только к группе: api.Use(JWTMiddleware).'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Что такое e.HTTPErrorHandler?',
                    options: [
                        'Кастомный обработчик всех ошибок — единая точка форматирования ответов об ошибках',
                        'Middleware для логирования ошибок',
                        'Обработчик 404 страницы',
                        'Файл конфигурации ошибок'
                    ],
                    correct: 0,
                    explanation: 'e.HTTPErrorHandler = func(err error, c echo.Context) — переопределяет стандартный. Все ошибки из обработчиков попадают сюда. Используйте для единого формата ошибок в API.'
                }
            ]
        },
        {
            type: 'theory',
            content: `
                <h2>Echo Framework: итоги</h2>
                <ul>
                    <li>⚡ <strong>Echo</strong> — быстрый веб-фреймворк с богатым набором встроенных возможностей</li>
                    <li>🛣️ <strong>Роутинг</strong>: :param, группы с префиксами, любые HTTP методы</li>
                    <li>🔧 <strong>Middleware</strong>: Recover, Logger, CORS, JWT, RateLimit — всё из коробки</li>
                    <li>📦 <strong>Binding</strong>: c.Bind() — JSON, form, query в одном методе</li>
                    <li>✅ <strong>Validation</strong>: интеграция с go-playground/validator через теги</li>
                    <li>🎯 <strong>Context</strong>: c.Set/Get, c.JSON, c.Param, c.QueryParam — удобный API</li>
                    <li>⚠️ <strong>Error handling</strong>: echo.HTTPError + кастомный HTTPErrorHandler</li>
                </ul>
            `
        }
    ]
};
