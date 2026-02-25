export default {
    id: '09-06',
    title: 'Итоговый квиз: gRPC',
    description: 'Проверка знаний по модулю gRPC',
    estimatedTime: 15,
    xpReward: 50,

    sections: [
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что произойдет, если изменить тег поля в .proto файле?',
                    options: [
                        'Ничего страшного',
                        'Сломается обратная совместимость со старыми клиентами/серверами',
                        'Компилятор выдаст ошибку',
                        'Поле автоматически переименуется'
                    ],
                    correct: 1,
                    explanation: 'Тег — это идентификатор поля в бинарном формате. Изменение тега равносильно удалению старого поля и созданию нового.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Какой пакет используется для создания gRPC сервера в Go?',
                    options: [
                        'net/http',
                        'google.golang.org/grpc',
                        'github.com/gorilla/mux',
                        'database/sql'
                    ],
                    correct: 1,
                    explanation: 'Официальный пакет: google.golang.org/grpc.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Как называется файл с описанием API в gRPC?',
                    options: [
                        'api.json',
                        'service.xml',
                        'contract.proto',
                        'schema.yaml'
                    ],
                    correct: 2,
                    explanation: 'Файлы Protocol Buffers имеют расширение .proto.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Что такое UnimplementedUserServiceServer?',
                    options: [
                        'Ошибка компиляции',
                        'Структура для обеспечения прямой совместимости',
                        'Устаревший метод',
                        'Сервер, который не работает'
                    ],
                    correct: 1,
                    explanation: 'Встраивание этой структуры гарантирует, что ваш код будет компилироваться даже если в интерфейс добавятся новые методы (они вернут ошибку Not Implemented).'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Какой метод HTTP используется в gRPC под капотом?',
                    options: [
                        'GET',
                        'POST',
                        'PUT',
                        'CONNECT'
                    ],
                    correct: 1,
                    explanation: 'Все gRPC вызовы — это HTTP/2 POST запросы с определенным Content-Type (application/grpc).'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Можно ли использовать gRPC без Protobuf?',
                    options: [
                        'Нет, это одно и то же',
                        'Да, например с JSON, но это редкость',
                        'Только с XML',
                        'Только в тестовом режиме'
                    ],
                    correct: 1,
                    explanation: 'gRPC спроектирован как агностик к формату (IDL), но Protobuf является стандартом де-факто.'
                }
            ]
        }
    ]
};
