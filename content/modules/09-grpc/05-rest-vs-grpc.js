export default {
    id: '09-05',
    title: 'REST vs gRPC',
    description: 'Сравнение архитектурных стилей, когда что использовать',
    estimatedTime: 20,
    xpReward: 15,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>REST API или gRPC?</h2>
                <p>Выбор между REST и gRPC зависит от требований вашего проекта. Нет "лучшей" технологии, есть подходящая.</p>
                <table class="table table-bordered">
                    <thead><tr><th>Характеристика</th><th>REST (JSON)</th><th>gRPC (Protobuf)</th></tr></thead>
                    <tbody>
                        <tr><td><strong>Протокол</strong></td><td>HTTP/1.1 (обычно)</td><td>HTTP/2</td></tr>
                        <tr><td><strong>Формат данных</strong></td><td>Текстовый (JSON)</td><td>Бинарный (Protobuf)</td></tr>
                        <tr><td><strong>Читаемость</strong></td><td>Человекочитаемый</td><td>Нужен декодер</td></tr>
                        <tr><td><strong>Кодогенерация</strong></td><td>Опционально (OpenAPI)</td><td>Нативная (protoc)</td></tr>
                        <tr><td><strong>Браузеры</strong></td><td>Полная поддержка</td><td>Ограничена (gRPC-Web)</td></tr>
                        <tr><td><strong>Стриминг</strong></td><td>Сложно (WebSockets/SSE)</td><td>Нативный (Bidirectional)</td></tr>
                        <tr><td><strong>Скорость</strong></td><td>Средняя</td><td>Высокая</td></tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p><strong>Совет:</strong> Используйте <strong>gRPC</strong> для межсервисного общения (backend-to-backend) в микросервисах. Используйте <strong>REST</strong> для публичных API и общения с фронтендом (SPA, Mobile), либо используйте gRPC-Gateway для трансляции gRPC в REST.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Когда выбирать REST?</h2>
                <ul>
                    <li>Нужен публичный API для сторонних разработчиков.</li>
                    <li>Простые CRUD операции с ресурсами.</li>
                    <li>Клиент — браузер (без прослоек gRPC-Web).</li>
                    <li>Нужна простота отладки (curl, Postman).</li>
                </ul>
                
                <h2>Когда выбирать gRPC?</h2>
                <ul>
                    <li>Микросервисная архитектура (внутренний трафик).</li>
                    <li>Высокие требования к производительности (Low Latency).</li>
                    <li>Полиглотная среда (сервисы на Go, Java, Python, C++).</li>
                    <li>Нужен стриминг данных.</li>
                </ul>
            `
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Где gRPC показывает себя лучше всего?',
                    options: [
                        'В публичных API для браузера',
                        'В простых одностраничных сайтах',
                        'Во внутреннем общении микросервисов',
                        'При передаче статических HTML страниц'
                    ],
                    correct: 2,
                    explanation: 'Низкая латентность, бинарный формат и HTTP/2 делают gRPC идеальным для общения между сервисами внутри дата-центра.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Может ли браузер напрямую вызвать gRPC сервис?',
                    options: [
                        'Да, chrome поддерживает gRPC нативно',
                        'Нет, нужен gRPC-Web прокси',
                        'Только если использовать HTTP/1.1',
                        'Только в Firefox'
                    ],
                    correct: 1,
                    explanation: 'Браузеры не предоставляют полного доступа к HTTP/2 фреймам, поэтому нужен gRPC-Web и прокси (например, Envoy).'
                }
            ]
        }
    ]
};
