export default {
    id: '07-07',
    title: 'Итоговый квиз: HTTP-серверы',
    description: 'Проверьте знания: net/http, handlers, middleware, chi, JSON API',
    estimatedTime: 15,
    xpReward: 30,

    sections: [
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Метод запуска HTTP-сервера в Go:',
                    options: [
                        'http.ListenAndServe(":8080", handler)',
                        'http.Start(":8080")',
                        'http.Run(":8080", handler)',
                        'http.Serve(":8080")'
                    ],
                    correct: 0,
                    explanation: 'http.ListenAndServe(addr, handler). nil вместо handler использует DefaultServeMux. Для HTTPS: http.ListenAndServeTLS.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что реализует интерфейс http.Handler?',
                    options: [
                        'Метод ServeHTTP(ResponseWriter, *Request)',
                        'Метод Handle(string, Handler)',
                        'Функцию типа func(w, r)',
                        'Метод Serve(*http.Server)'
                    ],
                    correct: 0,
                    explanation: 'http.Handler: ServeHTTP(ResponseWriter, *Request). http.HandlerFunc — тип-адаптер для превращения функции в Handler.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Правильный порядок в обработчике:',
                    options: [
                        'w.Header().Set() → w.WriteHeader() → w.Write()',
                        'w.Write() → w.Header() → w.WriteHeader()',
                        'w.WriteHeader() → w.Write() → w.Header()',
                        'Любой порядок'
                    ],
                    correct: 0,
                    explanation: 'Заголовки нужно установить до WriteHeader. WriteHeader должен быть до Write. После WriteHeader заголовки игнорируются.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Как установить HttpOnly куку?',
                    options: [
                        'http.SetCookie(w, &http.Cookie{Name: "s", Value: "v", HttpOnly: true})',
                        'w.Header().Set("Cookie", "s=v; HttpOnly")',
                        'r.AddCookie(&http.Cookie{HttpOnly: true})',
                        'w.SetCookie("s", "v", http.HttpOnly)'
                    ],
                    correct: 0,
                    explanation: 'http.SetCookie принимает *http.Cookie с полями. HttpOnly: true — защита от XSS. Secure: true — только HTTPS.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Сигнатура middleware в Go:',
                    options: [
                        'func(next http.Handler) http.Handler',
                        'func(w http.ResponseWriter, r *http.Request)',
                        'func(http.Handler) (http.Handler, error)',
                        'type Middleware http.Handler'
                    ],
                    correct: 0,
                    explanation: 'Middleware принимает Handler и возвращает новый Handler. Внутри — вызов next.ServeHTTP(w, r).'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Как передать данные из middleware в обработчик?',
                    options: [
                        'context.WithValue + r.WithContext',
                        'Через глобальную переменную',
                        'Через HTTP заголовок',
                        'Через r.Form'
                    ],
                    correct: 0,
                    explanation: 'ctx := context.WithValue(r.Context(), key, val); next.ServeHTTP(w, r.WithContext(ctx)). В обработчике: r.Context().Value(key).'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Как получить параметр {id} в chi?',
                    options: [
                        'chi.URLParam(r, "id")',
                        'r.PathValue("id")',
                        'r.URL.Params["id"]',
                        'chi.Param(r, "id")'
                    ],
                    correct: 0,
                    explanation: 'chi.URLParam(r, "paramName") для chi v5. r.PathValue("id") — стандартный Go 1.22+. Всегда конвертируйте из строки.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Разница r.Route и r.Group в chi?',
                    options: [
                        'r.Route добавляет префикс пути, r.Group — только группирует',
                        'r.Group создаёт новый роутер',
                        'r.Route только для GET/POST',
                        'r.Group медленнее'
                    ],
                    correct: 0,
                    explanation: 'r.Route("/api", ...) — все маршруты внутри получат /api/... r.Group — без изменения пути, только для применения middleware к набору маршрутов.'
                },
                {
                    id: 'q9',
                    type: 'single',
                    question: 'Что делает json:"-" в теге структуры?',
                    options: [
                        'Полностью исключает поле из JSON',
                        'Устанавливает имя поля как дефис',
                        'Делает поле только для чтения',
                        'Пропускает пустые значения'
                    ],
                    correct: 0,
                    explanation: '"-" — поле никогда не входит в JSON (ни при маршалинге, ни при анмаршалинге). Используйте для паролей, секретов.'
                },
                {
                    id: 'q10',
                    type: 'single',
                    question: 'Зачем http.MaxBytesReader при декодировании JSON?',
                    options: [
                        'Ограничить размер тела запроса (защита от DoS)',
                        'Ускорить чтение',
                        'Валидировать UTF-8',
                        'Автоматически закрыть Body'
                    ],
                    correct: 0,
                    explanation: 'Без ограничения злоумышленник может отправить гигабайтный запрос, исчерпав память сервера. MaxBytesReader ограничивает и возвращает ошибку.'
                },
                {
                    id: 'q11',
                    type: 'single',
                    question: 'Почему Recovery middleware должен быть самым внешним?',
                    options: [
                        'Чтобы ловить паники из всей цепочки middleware и обработчиков',
                        'Для производительности',
                        'Это требование Go',
                        'Чтобы работал Logger'
                    ],
                    correct: 0,
                    explanation: 'defer/recover ловит паники только в своей горутине. Если Recovery снаружи — он защищает всех внутренних. Если внутри — внешние middleware не защищены.'
                }
            ]
        }
    ]
};
