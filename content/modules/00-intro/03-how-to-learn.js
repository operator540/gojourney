export default {
    id: '00-03',
    title: 'Как учиться эффективно',
    description: 'Методики, советы от senior-разработчиков, типичные ошибки',
    estimatedTime: 20,
    xpReward: 15,

    sections: [
        {
            type: 'theory',
            content: `
<h2>Как учатся настоящие разработчики</h2>
<p>Мы опросили разработчиков с опытом от 3 до 15 лет о том, как они учились и что реально работает. Вот их честные ответы.</p>

<h3>Метод № 1: Феймановская техника</h3>
<p>Ричард Фейнман — физик-нобелевский лауреат — придумал метод, который используют лучшие программисты:</p>
<ol>
    <li>Изучи концепцию</li>
    <li><strong>Объясни её простыми словами, как будто ты объясняешь 10-летнему ребёнку</strong></li>
    <li>Найди пробелы в объяснении — вернись к материалу</li>
    <li>Упрости объяснение ещё раз</li>
</ol>
<blockquote style="border-left:3px solid #60a5fa;padding:1rem;background:var(--surface-2);border-radius:0 8px 8px 0;margin:1rem 0">
    <p style="margin:0 0 0.5rem 0">"Если ты не можешь объяснить это простыми словами — ты не понимаешь это достаточно хорошо."</p>
    <small style="color:var(--text-muted)">— Ричард Фейнман</small>
</blockquote>
<p><strong>Как применять:</strong> После каждого урока закрой браузер и объясни вслух (или напиши) что ты только что узнал — как другу, который не программирует.</p>

<h3>Метод № 2: Активное вспоминание (Active Recall)</h3>
<p>Исследования показывают: <strong>попытка вспомнить информацию в 10 раз эффективнее перечитывания</strong>. Именно поэтому в каждом уроке есть квизы — не пропускай их.</p>
<ul>
    <li>После прочтения темы — закрой и попробуй написать код по памяти</li>
    <li>Используй карточки (Anki) для ключевых концепций</li>
    <li>Объясняй код другому человеку (или воображаемому другу)</li>
</ul>
`
        },
        {
            type: 'theory',
            content: `
<h3>Что говорят senior-разработчики о своём пути</h3>
<div style="display:flex;flex-direction:column;gap:1.5rem">
    <div style="background:var(--surface-2);padding:1.5rem;border-radius:8px;border:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
            <div style="width:40px;height:40px;border-radius:50%;background:#1e3a5f;display:flex;align-items:center;justify-content:center;font-size:1.2rem">🧑‍💻</div>
            <div>
                <strong>Алексей, Senior Go Developer, Ozon (7 лет опыта)</strong><br>
                <small style="color:var(--text-muted)">Начал с нуля, смена профессии из бухгалтерии</small>
            </div>
        </div>
        <p style="margin:0">"Я потратил первые 2 месяца на теорию и не написал НИ ОДНОЙ строчки кода. Полный провал. Потом я начал делать маленькие проекты — телеграм-бот, парсер, простое API. Вот тогда всё встало на место. <strong>Практика важнее теории в соотношении 70/30.</strong> Теорию читаешь когда застрял, а не заранее."</p>
    </div>
    <div style="background:var(--surface-2);padding:1.5rem;border-radius:8px;border:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
            <div style="width:40px;height:40px;border-radius:50%;background:#1e4d2b;display:flex;align-items:center;justify-content:center;font-size:1.2rem">👩‍💻</div>
            <div>
                <strong>Мария, Lead Engineer, Яндекс (10 лет опыта)</strong><br>
                <small style="color:var(--text-muted)">Физфак → разработка</small>
            </div>
        </div>
        <p style="margin:0">"Главное что я поняла: не существует момента когда ты 'готов'. Я до сих пор гуглю синтаксис и читаю документацию. <strong>Настоящий разработчик — это не тот кто всё знает наизусть, а тот кто умеет найти решение.</strong> Умение читать документацию и Stack Overflow важнее памяти."</p>
    </div>
    <div style="background:var(--surface-2);padding:1.5rem;border-radius:8px;border:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
            <div style="width:40px;height:40px;border-radius:50%;background:#3b1764;display:flex;align-items:center;justify-content:center;font-size:1.2rem">🧔</div>
            <div>
                <strong>Дмитрий, Middle Go Developer (3 года опыта)</strong><br>
                <small style="color:var(--text-muted)">Самоучка, учился параллельно с работой на заводе</small>
            </div>
        </div>
        <p style="margin:0">"Я учился по 1-2 часа в день после смены. Самое важное — <strong>стрик (streak)</strong>. Не пропускать дни подряд. Даже 20 минут в день лучше чем 14 часов в воскресенье и потом неделю ничего. Мозг формирует нейронные связи постепенно, это нельзя ускорить."</p>
    </div>
</div>
`
        },
        {
            type: 'theory',
            content: `
<h2>Типичные ошибки новичков</h2>
<p>95% людей делают одни и те же ошибки. Зная их заранее — ты избежишь потери времени.</p>

<table style="width:100%;border-collapse:collapse">
    <tr style="background:var(--surface-2)">
        <th style="padding:10px;border:1px solid var(--border)">Ошибка</th>
        <th style="padding:10px;border:1px solid var(--border)">Почему это плохо</th>
        <th style="padding:10px;border:1px solid var(--border)">Как правильно</th>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)">😴 Пассивное обучение</td>
        <td style="padding:10px;border:1px solid var(--border)">Смотришь видео, читаешь — кажется что понял. Открываешь редактор — ничего не можешь</td>
        <td style="padding:10px;border:1px solid var(--border)">После каждой темы пиши код сам, без подсказок</td>
    </tr>
    <tr style="background:var(--surface-2)">
        <td style="padding:10px;border:1px solid var(--border)">🔄 Синдром туториала</td>
        <td style="padding:10px;border:1px solid var(--border)">Проходишь один курс за другим, не делая своих проектов. Вечный "ещё один курс и начну"</td>
        <td style="padding:10px;border:1px solid var(--border)">После базы — свой проект. Даже плохой, маленький, но свой</td>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)">😤 Не гуглить</td>
        <td style="padding:10px;border:1px solid var(--border)">Сидеть часами над ошибкой из гордости</td>
        <td style="padding:10px;border:1px solid var(--border)">15 минут застрял — гугли. Это не слабость, это профессионализм</td>
    </tr>
    <tr style="background:var(--surface-2)">
        <td style="padding:10px;border:1px solid var(--border)">📚 Perfectionism</td>
        <td style="padding:10px;border:1px solid var(--border)">Хочешь понять ВСЁ перед тем как двигаться дальше</td>
        <td style="padding:10px;border:1px solid var(--border)">70% понял — двигайся дальше. Туман рассеивается со временем</td>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)">🏃 Нет стрика</td>
        <td style="padding:10px;border:1px solid var(--border)">Учишься 3 дня, потом неделю пропуск. Материал забывается, мотивация падает</td>
        <td style="padding:10px;border:1px solid var(--border)">Минимум 20-30 минут каждый день. Последовательность важнее интенсивности</td>
    </tr>
</table>
`
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<strong>Техника Pomodoro для программирования:</strong> 25 минут фокусного кодирования → 5 минут перерыв → повтори 4 раза → 30 минут отдых. Исследования показывают это оптимальный режим для сохранения концентрации. Используй таймер — это реально работает.`
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q0003-1',
                    type: 'single',
                    question: 'Ты застрял на ошибке в коде уже 20 минут. Что делать?',
                    options: [
                        'Сидеть дальше, пока не решишь сам — это развивает навык',
                        'Загуглить ошибку — это нормально и профессионально',
                        'Пропустить эту тему и перейти к следующей',
                        'Бросить программирование — оно не для меня'
                    ],
                    correct: 1,
                    explanation: 'Гуглить — это профессиональный навык, а не признак слабости. Все разработчики гуглят постоянно. Правило: 15-20 минут попытки самому → гугл. Не нужно страдать часами.'
                },
                {
                    id: 'q0003-2',
                    type: 'single',
                    question: 'Что важнее для успешного обучения?',
                    options: [
                        '10 часов в воскресенье раз в неделю',
                        '30 минут каждый день без пропусков',
                        'Прочитать как можно больше книг',
                        'Пройти как можно больше курсов'
                    ],
                    correct: 1,
                    explanation: 'Регулярность важнее интенсивности. Мозг формирует нейронные связи постепенно — ежедневная практика закрепляет знания гораздо лучше редких марафонов.'
                }
            ]
        }
    ]
};
