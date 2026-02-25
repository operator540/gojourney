export default {
    id: '08-07',
    title: 'Итоговый квиз: REST API',
    description: 'Проверьте знания: REST, CRUD, валидация, JWT, ошибки, тестирование',
    estimatedTime: 15,
    xpReward: 30,

    sections: [
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что такое stateless в REST?',
                    options: [
                        'Сервер не хранит состояние клиента между запросами',
                        'Сервер без состояния файловой системы',
                        'API без базы данных',
                        'Запросы без заголовков'
                    ],
                    correct: 0,
                    explanation: 'Stateless: каждый запрос самодостаточен. Сервер не помнит предыдущих запросов. Состояние — у клиента (JWT токен, сессия).'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'POST /users/{id}/posts — правильный REST маршрут?',
                    options: [
                        'Да — создать пост конкретного пользователя',
                        'Нет — POST не принимает id',
                        'Нет — нужно POST /posts?user_id=X',
                        'Да, но только если без id в пути'
                    ],
                    correct: 0,
                    explanation: 'POST /users/{id}/posts — создать пост для пользователя. Вложенные ресурсы (2 уровня) — норма. Глубже 3 уровней не рекомендуется.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Разница PUT и PATCH?',
                    options: [
                        'PUT — полная замена ресурса, PATCH — частичное обновление',
                        'PUT быстрее PATCH',
                        'PATCH создаёт ресурс, PUT обновляет',
                        'Нет разницы'
                    ],
                    correct: 0,
                    explanation: 'PUT заменяет ресурс целиком (нужны все поля). PATCH обновляет только указанные поля. PUT идемпотентен, PATCH может быть не идемпотентным.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Какой HTTP код для успешного создания ресурса?',
                    options: [
                        '201 Created',
                        '200 OK',
                        '204 No Content',
                        '202 Accepted'
                    ],
                    correct: 0,
                    explanation: '201 Created + Location заголовок с URL созданного ресурса. Тело — созданный ресурс.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Код для ошибок валидации?',
                    options: [
                        '422 Unprocessable Entity',
                        '400 Bad Request',
                        '403 Forbidden',
                        '409 Conflict'
                    ],
                    correct: 0,
                    explanation: '422 — JSON корректный, но данные не прошли бизнес-валидацию. 400 — синтаксические ошибки (невалидный JSON, неверный тип поля).'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Зачем добавлять jti в JWT токен?',
                    options: [
                        'Уникальность токена и возможность инвалидации',
                        'Хранить ID пользователя',
                        'Время истечения',
                        'Алгоритм шифрования'
                    ],
                    correct: 0,
                    explanation: 'jti = JWT ID. Уникален для каждого токена. Позволяет хранить blacklist инвалидированных токенов. Без jti два токена одного пользователя в одну секунду идентичны.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Почему нельзя раскрывать SQL-ошибки в API?',
                    options: [
                        'Раскрывают структуру БД — помогают атакующему',
                        'SQL-ошибки непонятны клиентам',
                        'Требование Go runtime',
                        'Замедляют ответ'
                    ],
                    correct: 0,
                    explanation: 'SQL ошибки содержат имена таблиц, полей, constraints. Это информация для SQLi атак. Логируйте детали, клиенту — только "internal server error".'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Слоёная архитектура REST API: правильный порядок?',
                    options: [
                        'Handler → Service → Repository → Database',
                        'Repository → Service → Handler → Database',
                        'Service → Handler → Database',
                        'Handler → Database → Service'
                    ],
                    correct: 0,
                    explanation: 'Handler (HTTP) → Service (бизнес-логика) → Repository (данные) → БД. Каждый слой зависит только от следующего через интерфейс.'
                },
                {
                    id: 'q9',
                    type: 'single',
                    question: 'httptest.NewRecorder() используется для:',
                    options: [
                        'Записи HTTP-ответа при тестировании хендлеров',
                        'Запуска реального HTTP сервера',
                        'Создания тестового HTTP клиента',
                        'Мокирования БД'
                    ],
                    correct: 0,
                    explanation: 'ResponseRecorder реализует http.ResponseWriter, записывая заголовки, код и тело. Доступ: w.Code, w.Body, w.Header(), w.Result().'
                },
                {
                    id: 'q10',
                    type: 'single',
                    question: 'Где хранить JWT refresh token?',
                    options: [
                        'HttpOnly cookie + в БД для инвалидации',
                        'localStorage браузера',
                        'В теле access token',
                        'В URL параметре'
                    ],
                    correct: 0,
                    explanation: 'HttpOnly cookie защищает от XSS. БД позволяет инвалидировать при logout/смене пароля. localStorage и URL — небезопасны.'
                }
            ]
        }
    ]
};
