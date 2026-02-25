export default {
    id: '09-01',
    title: 'Введение в gRPC',
    description: 'Что такое RPC, история появления gRPC, HTTP/2, Protocol Buffers, 4 типа взаимодействия',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: вызов функции по телефону</h2>
                <p>Представьте, что вы — программа на одном компьютере, и вам нужно вычислить факториал числа. Вы могли бы сделать это локально, но вычисление очень тяжёлое, и на соседнем суперкомпьютере уже есть готовая функция <code>factorial(n)</code>.</p>
                <p><strong>REST-подход</strong>: вы пишете письмо по определённому шаблону (<em>"GET /factorial?n=10"</em>), отправляете его по почте, ждёте ответа в конверте с JSON-текстом, распаковываете и читаете.</p>
                <p><strong>RPC-подход</strong>: вы просто <em>звоните</em> на соседний компьютер и говорите <em>"factorial(10)"</em> — и получаете ответ напрямую, как будто функция локальная. Никаких конвертов, никаких шаблонов письма.</p>
                <p>Это и есть суть <strong>Remote Procedure Call (RPC)</strong> — вызов функции на удалённом сервере так, будто она находится в вашем же коде.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Что такое gRPC и зачем он появился</h2>
                <p>В 2015 году Google опубликовал <strong>gRPC</strong> (gRPC Remote Procedure Calls) — фреймворк для RPC следующего поколения. До этого Google десятилетиями использовал внутреннюю систему Stubby для связи между тысячами микросервисов. gRPC — это открытая версия Stubby, построенная на открытых стандартах.</p>
                <p>Ключевая проблема, которую решает gRPC:</p>
                <ul>
                    <li><strong>Скорость сериализации</strong>: JSON медленный и объёмный. В Google каждый лишний байт и каждая миллисекунда на парсинг умножаются на миллионы запросов в секунду.</li>
                    <li><strong>Строгие контракты</strong>: в большой команде нужно точно знать, какие поля есть в запросе/ответе и каких типов они. С JSON это превращается в хаос документации.</li>
                    <li><strong>Полиглотность</strong>: у Google сервисы на Go, Java, Python, C++, Dart... Нужен единый способ вызова между языками.</li>
                    <li><strong>Стриминг</strong>: HTTP/1.1 плохо подходит для потоковой передачи данных. HTTP/2 решает это нативно.</li>
                </ul>

                <table style="width:100%; border-collapse:collapse; margin:16px 0;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="padding:10px 14px; border:1px solid var(--border); text-align:left;">Характеристика</th>
                            <th style="padding:10px 14px; border:1px solid var(--border); text-align:left;">REST/JSON</th>
                            <th style="padding:10px 14px; border:1px solid var(--border); text-align:left;">gRPC/Protobuf</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Протокол</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">HTTP/1.1</td>
                            <td style="padding:9px 14px; border:1px solid var(--border); color:var(--accent);">HTTP/2</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:9px 14px; border:1px solid var(--border);">Формат данных</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Текст (JSON)</td>
                            <td style="padding:9px 14px; border:1px solid var(--border); color:var(--accent);">Бинарный (Protobuf)</td>
                        </tr>
                        <tr>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Типизация</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Слабая (документация)</td>
                            <td style="padding:9px 14px; border:1px solid var(--border); color:var(--accent);">Строгая (.proto схема)</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:9px 14px; border:1px solid var(--border);">Кодогенерация</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Опционально</td>
                            <td style="padding:9px 14px; border:1px solid var(--border); color:var(--accent);">Встроенная (protoc)</td>
                        </tr>
                        <tr>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Стриминг</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Сложно (SSE/WS)</td>
                            <td style="padding:9px 14px; border:1px solid var(--border); color:var(--accent);">Нативный (4 типа)</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:9px 14px; border:1px solid var(--border);">Браузер</td>
                            <td style="padding:9px 14px; border:1px solid var(--border); color:var(--accent);">Полная поддержка</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Нужен gRPC-Web</td>
                        </tr>
                        <tr>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Скорость (примерно)</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">1x</td>
                            <td style="padding:9px 14px; border:1px solid var(--border); color:var(--accent);">5–10x быстрее</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>HTTP/2: почему это важно</h2>
                <p>gRPC работает поверх HTTP/2, и это даёт ряд ключевых преимуществ перед HTTP/1.1:</p>

                <p><strong>1. Мультиплексирование (Multiplexing)</strong><br>
                В HTTP/1.1 каждый запрос занимает своё соединение — если хочешь 10 параллельных запросов, нужно 10 TCP-соединений. HTTP/2 отправляет много запросов через <em>одно</em> соединение параллельно, используя концепцию <em>потоков (streams)</em>.</p>

                <p><strong>2. Header Compression (HPACK)</strong><br>
                HTTP/1.1 повторяет заголовки в каждом запросе (<code>Content-Type</code>, <code>Authorization</code>, etc). HTTP/2 сжимает их и не повторяет одинаковые заголовки.</p>

                <p><strong>3. Binary Framing</strong><br>
                HTTP/1.1 передаёт текст. HTTP/2 передаёт бинарные фреймы — парсить их быстрее и надёжнее.</p>

                <p><strong>4. Нативный стриминг</strong><br>
                HTTP/2 поддерживает двунаправленный стриминг по одному соединению — gRPC использует это для 4 типов взаимодействия.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>4 типа gRPC взаимодействия</h2>
                <p>Это главное отличие gRPC от REST — нативные паттерны стриминга:</p>

                <table style="width:100%; border-collapse:collapse; margin:16px 0;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="padding:10px 14px; border:1px solid var(--border);">Тип</th>
                            <th style="padding:10px 14px; border:1px solid var(--border);">Запрос</th>
                            <th style="padding:10px 14px; border:1px solid var(--border);">Ответ</th>
                            <th style="padding:10px 14px; border:1px solid var(--border);">Пример использования</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:9px 14px; border:1px solid var(--border); font-weight:600; color:var(--accent);">Unary</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Один</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Один</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">GetUser, CreateOrder</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:9px 14px; border:1px solid var(--border); font-weight:600; color:var(--accent);">Server Streaming</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Один</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Поток</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Live feed, логи в реальном времени</td>
                        </tr>
                        <tr>
                            <td style="padding:9px 14px; border:1px solid var(--border); font-weight:600; color:var(--accent);">Client Streaming</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Поток</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Один</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Загрузка файла чанками</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:9px 14px; border:1px solid var(--border); font-weight:600; color:var(--accent);">Bidirectional Streaming</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Поток</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Поток</td>
                            <td style="padding:9px 14px; border:1px solid var(--border);">Чат, видеозвонок, игры</td>
                        </tr>
                    </tbody>
                </table>

                <p>В .proto файле все 4 типа описываются одинаково — через ключевое слово <code>stream</code>:</p>
            `
        },
        {
            type: 'code-example',
            language: 'protobuf',
            title: '4 типа взаимодействия в .proto',
            code: `syntax = "proto3";

service ChatService {
  // 1. Unary: один запрос → один ответ
  rpc GetMessage (GetMessageRequest) returns (Message);

  // 2. Server Streaming: один запрос → поток ответов
  rpc ListMessages (ListRequest) returns (stream Message);

  // 3. Client Streaming: поток запросов → один ответ
  rpc SendBulkMessages (stream Message) returns (SendResult);

  // 4. Bidirectional Streaming: поток ↔ поток
  rpc Chat (stream Message) returns (stream Message);
}

message Message {
  string id   = 1;
  string text = 2;
  string from = 3;
}

message GetMessageRequest { string id = 1; }
message ListRequest       { string room_id = 1; }
message SendResult        { int32 sent_count = 1; }`,
            explanation: 'Ключевое слово stream перед типом означает стриминг. Слева от returns — поток запросов от клиента, справа — поток ответов от сервера. Обе стороны могут быть потоками одновременно (Bidirectional).'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Как выглядит gRPC вызов vs REST вызов',
            code: `// ===== REST подход =====
resp, err := http.Get("http://users-service/users/42")
// Получаем []byte, парсим JSON вручную, нет гарантий типов

body, _ := io.ReadAll(resp.Body)
var user map[string]interface{}
json.Unmarshal(body, &user)
name := user["name"].(string) // рантайм паника если поля нет!

// ===== gRPC подход =====
// client — это типизированный stub, сгенерированный из .proto
user, err := client.GetUser(ctx, &pb.GetUserRequest{Id: 42})
// user — *pb.User со всеми полями, известными на этапе компиляции
fmt.Println(user.Name) // компилятор проверит, что поле Name существует

// Если сервис изменил схему — код не скомпилируется, а не упадёт в рантайме`,
            explanation: 'Главное преимущество gRPC в Go — типобезопасность. Сгенерированный клиент знает все методы и типы на этапе компиляции. Ошибки несовместимости схем обнаруживаются при сборке, а не на проде.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Когда выбирать gRPC?</strong></p>
            <ul>
                <li>Микросервисы, которые общаются между собой (backend-to-backend)</li>
                <li>Нужна высокая производительность (нагруженные сервисы)</li>
                <li>Разные языки программирования в одной системе</li>
                <li>Нужен стриминг данных (real-time, большие файлы)</li>
                <li>Строгие API контракты важнее удобства отладки</li>
            </ul>`
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<p><strong>Когда gRPC не лучший выбор:</strong></p>
            <ul>
                <li>Публичный API для сторонних разработчиков — REST понятнее и Postman/curl работает из коробки</li>
                <li>Браузерный фронтенд — нужен дополнительный gRPC-Web прокси</li>
                <li>Простые CRUD операции без жёстких требований к скорости</li>
            </ul>`
        },
        {
            type: 'editor',
            title: 'Практика: определи тип gRPC взаимодействия',
            instructions: 'Опишите в синтаксисе proto3 сервис NotificationService с методом Subscribe, который принимает один запрос и возвращает поток уведомлений (Server Streaming). Добавьте сообщения SubscribeRequest и Notification.',
            starterCode: `syntax = "proto3";

service NotificationService {
  // Метод Subscribe: клиент подписывается и получает поток уведомлений
  // Добавьте rpc метод здесь
}

message SubscribeRequest {
  // user_id типа string, тег 1
}

message Notification {
  // title типа string, тег 1
  // body типа string, тег 2
}`,
            hints: [
                'Server Streaming: один запрос → поток ответов',
                'rpc Subscribe (SubscribeRequest) returns (stream Notification);',
                'string user_id = 1;',
                'string title = 1; string body = 2;'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'На каком транспортном протоколе работает gRPC?',
                    options: [
                        'HTTP/1.1',
                        'HTTP/2',
                        'WebSockets',
                        'Raw TCP без HTTP'
                    ],
                    correct: 1,
                    explanation: 'gRPC использует HTTP/2 как транспорт — это даёт мультиплексирование, бинарные фреймы и нативный стриминг.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что такое Unary RPC?',
                    options: [
                        'Один запрос и поток ответов',
                        'Один запрос и один ответ',
                        'Поток запросов и один ответ',
                        'Двунаправленный поток'
                    ],
                    correct: 1,
                    explanation: 'Unary — самый простой тип: клиент отправляет один запрос, сервер возвращает один ответ. Аналог обычного HTTP запроса.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Вы строите функцию загрузки большого файла чанками на сервер. Какой тип gRPC подходит?',
                    options: [
                        'Unary RPC',
                        'Server Streaming RPC',
                        'Client Streaming RPC',
                        'Bidirectional Streaming RPC'
                    ],
                    correct: 2,
                    explanation: 'Client Streaming: клиент отправляет поток данных (чанков), а сервер в конце возвращает один ответ (результат загрузки).'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Чем принципиально отличается RPC от REST?',
                    options: [
                        'RPC использует только бинарные данные',
                        'REST быстрее RPC',
                        'REST работает с ресурсами, RPC — с вызовами процедур (функций)',
                        'RPC не поддерживает аутентификацию'
                    ],
                    correct: 2,
                    explanation: 'REST — архитектурный стиль манипуляции ресурсами (GET /users/1). RPC — парадигма вызова функций на удалённом сервере (GetUser(1)).'
                },
                {
                    id: 'q5',
                    type: 'multiple',
                    question: 'Какие преимущества даёт HTTP/2 по сравнению с HTTP/1.1? (несколько вариантов)',
                    options: [
                        'Мультиплексирование запросов через одно соединение',
                        'Сжатие заголовков (HPACK)',
                        'Поддержка cookies',
                        'Бинарные фреймы вместо текста',
                        'Поддержка JSON из коробки'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'HTTP/2 добавляет мультиплексирование, HPACK-сжатие заголовков и бинарный формат фреймов. Cookies и JSON существовали до HTTP/2 и не являются его фичами.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Какой синтаксис proto используется в современных gRPC проектах?',
                    options: [
                        'proto1',
                        'proto2',
                        'proto3',
                        'proto4'
                    ],
                    correct: 2,
                    explanation: 'proto3 — текущий стандарт. proto2 тоже используется (он позволяет optional поля явно), но proto3 проще и является рекомендуемым по умолчанию.'
                }
            ]
        }
    ]
};
