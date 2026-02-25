export default {
    id: '00-01',
    title: 'Добро пожаловать в программирование',
    description: 'Что такое программирование, зачем это нужно и что вас ждёт',
    estimatedTime: 15,
    xpReward: 10,

    sections: [
        {
            type: 'theory',
            content: `
<h2>Привет, будущий разработчик 👋</h2>
<p>Если ты открыл этот курс и <strong>вообще не понимаешь, что такое программирование</strong> — это нормально. Все начинали с нуля. Этот вводный раздел специально для тебя.</p>

<h3>Что такое программирование?</h3>
<p>Программирование — это способ <strong>объяснить компьютеру, что делать</strong>. Компьютер сам по себе тупой — он не понимает "сделай красиво" или "покажи мне что-нибудь интересное". Он понимает только точные инструкции.</p>
<p>Программа — это набор таких инструкций. Например:</p>
<ul>
    <li>Когда пользователь нажал кнопку — показать сообщение</li>
    <li>Взять число из базы данных — умножить на 2 — вернуть результат</li>
    <li>Каждый день в 9:00 — отправить письмо</li>
</ul>
<p>Язык программирования — это способ записать эти инструкции так, чтобы компьютер их понял.</p>

<h3>Почему это не так страшно, как кажется</h3>
<p>Многие думают: "Программирование — это для математиков и гениев". Это миф. Программирование — это <strong>навык, как и любой другой</strong>. Ты не рождаешься умея готовить, водить машину или играть на гитаре. Ты учишься.</p>
<blockquote style="border-left: 3px solid var(--accent); padding-left: 1rem; margin: 1rem 0; color: var(--text-muted); font-style: italic;">
    "Большинство хороших программистов занимаются программированием не потому, что ожидают оплату или признание, а потому что это весело."<br>
    — Linus Torvalds, создатель Linux и Git
</blockquote>
`
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph LR
    A["👶 Полный новичок"] --> B["📚 Изучаешь основы\n(1-2 месяца)"]
    B --> C["🔨 Пишешь первые\nпрограммы"]
    C --> D["📈 Понимаешь\nконцепции"]
    D --> E["💼 Junior разработчик\n(6-12 месяцев)"]
    E --> F["🚀 Middle/Senior\n(2-5 лет)"]
    style A fill:#374151,color:#f9fafb
    style E fill:#1e3a5f,color:#60a5fa
    style F fill:#1e4d2b,color:#4ade80`,
            caption: 'Типичный путь разработчика. Это реально — тысячи людей прошли этот путь'
        },
        {
            type: 'theory',
            content: `
<h2>Что тебя ждёт в этом курсе</h2>
<p>GoJourney — это курс по языку программирования <strong>Go (Golang)</strong>. Это не абстрактная теория — к концу курса ты напишешь реальный REST API, который можно показать на собеседовании.</p>

<h3>Как устроен курс</h3>
<table style="width:100%;border-collapse:collapse">
    <tr style="background:var(--surface-2)">
        <th style="padding:10px;border:1px solid var(--border);text-align:left">Этап</th>
        <th style="padding:10px;border:1px solid var(--border);text-align:left">Что изучаешь</th>
        <th style="padding:10px;border:1px solid var(--border);text-align:left">Результат</th>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)">🌱 Фундамент</td>
        <td style="padding:10px;border:1px solid var(--border)">Синтаксис Go, структуры, пакеты, Git/Docker</td>
        <td style="padding:10px;border:1px solid var(--border)">Понимаешь код, можешь читать чужой</td>
    </tr>
    <tr style="background:var(--surface-2)">
        <td style="padding:10px;border:1px solid var(--border)">⚙️ Практика</td>
        <td style="padding:10px;border:1px solid var(--border)">Ошибки, конкурентность, алгоритмы, тесты</td>
        <td style="padding:10px;border:1px solid var(--border)">Пишешь рабочий код самостоятельно</td>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)">🌐 Web/API</td>
        <td style="padding:10px;border:1px solid var(--border)">HTTP, REST, БД, Redis, gRPC</td>
        <td style="padding:10px;border:1px solid var(--border)">Строишь backend-сервисы</td>
    </tr>
    <tr style="background:var(--surface-2)">
        <td style="padding:10px;border:1px solid var(--border)">🏗️ Архитектура</td>
        <td style="padding:10px;border:1px solid var(--border)">SOLID, чистый код, финальный проект</td>
        <td style="padding:10px;border:1px solid var(--border)">Junior-разработчик с портфолио</td>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)">🎓 Специализация</td>
        <td style="padding:10px;border:1px solid var(--border)">Advanced SQL, Echo/Gin, Generics, Микросервисы</td>
        <td style="padding:10px;border:1px solid var(--border)">Готов к Middle-уровню</td>
    </tr>
</table>
`
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<strong>Совет от тех, кто прошёл этот путь:</strong> Не пытайся всё понять сразу. Программирование — это как изучение иностранного языка. Сначала ты просто повторяешь фразы, не понимая почему так. Потом начинаешь чувствовать язык. Главное — не останавливаться.`
        }
    ]
};
