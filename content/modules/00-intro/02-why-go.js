export default {
    id: '00-02',
    title: 'Почему Go? Принцип 80/20',
    description: 'Почему стоит начинать с Go и как учиться по принципу Парето',
    estimatedTime: 20,
    xpReward: 15,

    sections: [
        {
            type: 'theory',
            content: `
<h2>Почему именно Go?</h2>
<p>Существует более 700 языков программирования. Почему Go?</p>

<h3>Оценка Go от senior-разработчиков</h3>
<p>Опросы сообщества Stack Overflow, JetBrains и Go Community Survey 2023-2024 дают такую картину:</p>
<table style="width:100%;border-collapse:collapse">
    <tr style="background:var(--surface-2)">
        <th style="padding:10px;border:1px solid var(--border)">Критерий</th>
        <th style="padding:10px;border:1px solid var(--border)">Go</th>
        <th style="padding:10px;border:1px solid var(--border)">Python</th>
        <th style="padding:10px;border:1px solid var(--border)">Java</th>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)">⚡ Скорость выполнения</td>
        <td style="padding:10px;border:1px solid var(--border);color:#4ade80">Очень быстро</td>
        <td style="padding:10px;border:1px solid var(--border);color:#f97316">Медленно</td>
        <td style="padding:10px;border:1px solid var(--border);color:#facc15">Быстро</td>
    </tr>
    <tr style="background:var(--surface-2)">
        <td style="padding:10px;border:1px solid var(--border)">📖 Простота изучения</td>
        <td style="padding:10px;border:1px solid var(--border);color:#4ade80">Очень просто</td>
        <td style="padding:10px;border:1px solid var(--border);color:#4ade80">Просто</td>
        <td style="padding:10px;border:1px solid var(--border);color:#f97316">Сложно</td>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)">💰 Зарплата (РФ, 2024)</td>
        <td style="padding:10px;border:1px solid var(--border);color:#4ade80">250-700к/мес</td>
        <td style="padding:10px;border:1px solid var(--border);color:#facc15">180-500к/мес</td>
        <td style="padding:10px;border:1px solid var(--border);color:#facc15">200-600к/мес</td>
    </tr>
    <tr style="background:var(--surface-2)">
        <td style="padding:10px;border:1px solid var(--border)">🏢 Кто использует</td>
        <td style="padding:10px;border:1px solid var(--border)">Google, Uber, Cloudflare, ВК, Ozon</td>
        <td style="padding:10px;border:1px solid var(--border)">Instagram, Netflix, Яндекс</td>
        <td style="padding:10px;border:1px solid var(--border)">Amazon, Goldman Sachs, банки</td>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)">🎯 Лучше всего для</td>
        <td style="padding:10px;border:1px solid var(--border)">Backend, microservices, DevOps-инструменты</td>
        <td style="padding:10px;border:1px solid var(--border)">Data Science, скрипты, ML</td>
        <td style="padding:10px;border:1px solid var(--border)">Enterprise, Android, большие системы</td>
    </tr>
</table>

<h3>Что говорят разработчики о Go</h3>
<div style="display:flex;flex-direction:column;gap:1rem;margin-top:1rem">
    <blockquote style="border-left:3px solid #60a5fa;padding:1rem;background:var(--surface-2);border-radius:0 8px 8px 0;margin:0">
        <p style="margin:0 0 0.5rem 0">"Go стал моим любимым языком. Ты пишешь код быстро, он читается как английский, а работает как C++. За 3 месяца я с Python перешёл на Go и не пожалел."</p>
        <small style="color:var(--text-muted)">— Senior Backend Developer, 8 лет опыта</small>
    </blockquote>
    <blockquote style="border-left:3px solid #4ade80;padding:1rem;background:var(--surface-2);border-radius:0 8px 8px 0;margin:0">
        <p style="margin:0 0 0.5rem 0">"Go — единственный язык, где я не спорю с компилятором, а благодарю его. Он заставляет писать понятный код и не даёт накосячить."</p>
        <small style="color:var(--text-muted)">— Lead Engineer, Yandex Cloud</small>
    </blockquote>
    <blockquote style="border-left:3px solid #a78bfa;padding:1rem;background:var(--surface-2);border-radius:0 8px 8px 0;margin:0">
        <p style="margin:0 0 0.5rem 0">"Я изучил Go за 6 месяцев параллельно с работой продавцом. Первая работа разработчиком — 180к/мес. Сейчас через 2 года — 450к. Go сделал это возможным."</p>
        <small style="color:var(--text-muted)">— Junior→Middle разработчик, история смены профессии</small>
    </blockquote>
</div>
`
        },
        {
            type: 'theory',
            content: `
<h2>Принцип 80/20 в программировании</h2>
<p>Принцип Парето гласит: <strong>20% усилий дают 80% результата</strong>. В программировании это работает так:</p>

<h3>80% реальных задач покрывается 20% знаний</h3>
<p>Опытные Go-разработчики сходятся во мнении: чтобы устроиться на первую работу, тебе нужно хорошо знать небольшой набор концепций:</p>
`
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `pie title Что реально нужно Junior Go-разработчику
    "Синтаксис и типы" : 15
    "Структуры и интерфейсы" : 15
    "Ошибки и обработка" : 10
    "HTTP и REST API" : 20
    "SQL и база данных" : 15
    "Git и Docker" : 10
    "Тесты" : 10
    "Конкурентность" : 5`,
            caption: '80% задач junior-разработчика покрывается этим набором. Остальное — учишь по мере необходимости'
        },
        {
            type: 'theory',
            content: `
<h3>Как применять 80/20 при изучении</h3>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem">
    <div style="background:var(--surface-2);padding:1rem;border-radius:8px;border:1px solid var(--border)">
        <h4 style="color:#f87171;margin-top:0">❌ Неэффективно (100%)</h4>
        <ul style="margin:0;padding-left:1.2rem">
            <li>Читать всю документацию подряд</li>
            <li>Учить редкие возможности языка</li>
            <li>Смотреть курсы, не практикуясь</li>
            <li>Пытаться понять всё перед стартом</li>
            <li>Изучать 5 языков одновременно</li>
        </ul>
    </div>
    <div style="background:var(--surface-2);padding:1rem;border-radius:8px;border:1px solid var(--border)">
        <h4 style="color:#4ade80;margin-top:0">✅ Эффективно (20%→80%)</h4>
        <ul style="margin:0;padding-left:1.2rem">
            <li>Один язык, один фреймворк — до конца</li>
            <li>Практика сразу после теории</li>
            <li>Маленький реальный проект</li>
            <li>Писать код каждый день (хотя бы 30 мин)</li>
            <li>Гуглить вместо запоминания синтаксиса</li>
        </ul>
    </div>
</div>

<h3>Конкретный план 80/20 для этого курса</h3>
<p>Если у тебя ограниченное время — вот <strong>минимальный путь к первой работе</strong>:</p>
<ol>
    <li><strong>Обязательно:</strong> модули 1-8 (основы → REST API) — это ядро</li>
    <li><strong>Обязательно:</strong> модуль 13 (Git + Docker) — без этого не возьмут</li>
    <li><strong>Обязательно:</strong> модуль 14 (финальный проект) — это твоё портфолио</li>
    <li><strong>По возможности:</strong> модули 10-11 (SQL + GORM) — очень часто спрашивают</li>
    <li><strong>Потом, на работе:</strong> всё остальное — учишь по мере задач</li>
</ol>

<p>Итого: <strong>10 модулей из 22</strong> дадут тебе 80% того, что нужно для первой работы.</p>
`
        },
        {
            type: 'info-box',
            variant: 'important',
            content: `<strong>Главная ошибка новичков:</strong> Они стараются изучить ВСЁ перед тем как начать практиковаться. В результате — полгода теории, никакого кода, потеря мотивации. Правильный путь: изучил тему → сразу написал код → перешёл дальше. Не понял что-то? Окей, двигайся вперёд — многое станет понятным позже.`
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q0002-1',
                    type: 'single',
                    question: 'Что означает принцип 80/20 применительно к обучению?',
                    options: [
                        '80% времени теория, 20% практика',
                        '20% ключевых знаний дают 80% результата на работе',
                        'Нужно знать 80% языка перед первой работой',
                        'Учиться 20 часов в неделю'
                    ],
                    correct: 1,
                    explanation: 'Принцип Парето: небольшая часть знаний даёт большую часть результата. В Go: хорошее знание основ + HTTP + SQL достаточно для Junior-позиции.'
                },
                {
                    id: 'q0002-2',
                    type: 'multiple',
                    question: 'Что входит в "ядро" знаний для Junior Go-разработчика? (несколько вариантов)',
                    options: [
                        'Синтаксис Go и структуры',
                        'Алгоритмы на графах',
                        'REST API и HTTP',
                        'Микросервисная архитектура',
                        'Git и Docker',
                        'Работа с базой данных'
                    ],
                    correct: [0, 2, 4, 5],
                    explanation: 'Ядро Junior: синтаксис, REST API, Git/Docker, SQL. Алгоритмы на графах и микросервисы — это Middle/Senior уровень.'
                }
            ]
        }
    ]
};
