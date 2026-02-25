export default {
    id: '00-04',
    title: 'Лучшие ресурсы для изучения',
    description: 'CS50, книги, сайты, YouTube-каналы, подкасты — всё что нужно',
    estimatedTime: 15,
    xpReward: 10,

    sections: [
        {
            type: 'theory',
            content: `
<h2>Лучшие ресурсы для Go-разработчика</h2>
<p>Список проверен сообществом. Это не спонсорский контент — только реально полезное.</p>

<h3>🎓 Если ты полный новичок в программировании</h3>
<p>Начни с этого ДО или ПАРАЛЛЕЛЬНО с GoJourney:</p>

<div style="display:flex;flex-direction:column;gap:1rem">
    <div style="background:var(--surface-2);padding:1rem;border-radius:8px;border-left:4px solid #f59e0b">
        <h4 style="margin:0 0 0.5rem 0;color:#f59e0b">CS50x — Harvard University (БЕСПЛАТНО)</h4>
        <p style="margin:0 0 0.5rem 0">Лучший бесплатный курс по основам Computer Science в мире. На английском, но есть субтитры. Даёт понимание как работает компьютер, память, алгоритмы — фундамент под всё остальное.</p>
        <p style="margin:0"><strong>Сайт:</strong> <code>cs50.harvard.edu</code> | <strong>Длительность:</strong> ~100 часов | <strong>Язык:</strong> C, Python, SQL, Web</p>
    </div>
    <div style="background:var(--surface-2);padding:1rem;border-radius:8px;border-left:4px solid #60a5fa">
        <h4 style="margin:0 0 0.5rem 0;color:#60a5fa">Stepik — "Поколение Python" (БЕСПЛАТНО, RU)</h4>
        <p style="margin:0 0 0.5rem 0">Если английский пока проблема — этот курс на русском даст базовое понимание программирования. После него переходи к GoJourney.</p>
        <p style="margin:0"><strong>Сайт:</strong> <code>stepik.org</code> | <strong>Длительность:</strong> ~30 часов | <strong>Язык:</strong> Python</p>
    </div>
</div>
`
        },
        {
            type: 'theory',
            content: `
<h3>📚 Книги по Go</h3>
<p>Оценки и советы от сообщества Go-разработчиков:</p>

<table style="width:100%;border-collapse:collapse">
    <tr style="background:var(--surface-2)">
        <th style="padding:10px;border:1px solid var(--border)">Книга</th>
        <th style="padding:10px;border:1px solid var(--border)">Уровень</th>
        <th style="padding:10px;border:1px solid var(--border)">Для кого</th>
        <th style="padding:10px;border:1px solid var(--border)">Рейтинг</th>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)"><strong>"The Go Programming Language"</strong><br><small>Donovan, Kernighan</small></td>
        <td style="padding:10px;border:1px solid var(--border)">Начальный+</td>
        <td style="padding:10px;border:1px solid var(--border)">Есть опыт в другом языке</td>
        <td style="padding:10px;border:1px solid var(--border);color:#f59e0b">★★★★★</td>
    </tr>
    <tr style="background:var(--surface-2)">
        <td style="padding:10px;border:1px solid var(--border)"><strong>"Learning Go"</strong><br><small>Jon Bodner (2021)</small></td>
        <td style="padding:10px;border:1px solid var(--border)">Начальный</td>
        <td style="padding:10px;border:1px solid var(--border)">Начинающий с нуля</td>
        <td style="padding:10px;border:1px solid var(--border);color:#f59e0b">★★★★★</td>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)"><strong>"100 Go Mistakes"</strong><br><small>Teiva Harsanyi (2022)</small></td>
        <td style="padding:10px;border:1px solid var(--border)">Средний</td>
        <td style="padding:10px;border:1px solid var(--border)">После 6+ месяцев Go</td>
        <td style="padding:10px;border:1px solid var(--border);color:#f59e0b">★★★★★</td>
    </tr>
    <tr style="background:var(--surface-2)">
        <td style="padding:10px;border:1px solid var(--border)"><strong>"Concurrency in Go"</strong><br><small>Katherine Cox-Buday</small></td>
        <td style="padding:10px;border:1px solid var(--border)">Продвинутый</td>
        <td style="padding:10px;border:1px solid var(--border)">Специально для горутин</td>
        <td style="padding:10px;border:1px solid var(--border);color:#f59e0b">★★★★☆</td>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)"><strong>"Чистый код"</strong><br><small>Robert Martin (дядя Боб)</small></td>
        <td style="padding:10px;border:1px solid var(--border)">Средний</td>
        <td style="padding:10px;border:1px solid var(--border)">Есть на русском, любой язык</td>
        <td style="padding:10px;border:1px solid var(--border);color:#f59e0b">★★★★☆</td>
    </tr>
    <tr style="background:var(--surface-2)">
        <td style="padding:10px;border:1px solid var(--border)"><strong>"Проектирование систем"</strong><br><small>Alex Xu (System Design)</small></td>
        <td style="padding:10px;border:1px solid var(--border)">Middle+</td>
        <td style="padding:10px;border:1px solid var(--border)">Для собеседований в FAANG</td>
        <td style="padding:10px;border:1px solid var(--border);color:#f59e0b">★★★★★</td>
    </tr>
</table>
`
        },
        {
            type: 'theory',
            content: `
<h3>🌐 Сайты и онлайн-ресурсы</h3>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
    <div style="background:var(--surface-2);padding:1rem;border-radius:8px;border:1px solid var(--border)">
        <h4 style="margin:0 0 0.75rem 0;color:#60a5fa">Для изучения Go</h4>
        <ul style="margin:0;padding-left:1.2rem;line-height:2">
            <li><code>go.dev/tour</code> — официальный тур по Go</li>
            <li><code>gobyexample.com</code> — Go примеры с кодом</li>
            <li><code>exercism.org/tracks/go</code> — задачи с менторингом</li>
            <li><code>gophercises.com</code> — практические упражнения</li>
            <li><code>gophersnippets.com</code> — полезные паттерны</li>
        </ul>
    </div>
    <div style="background:var(--surface-2);padding:1rem;border-radius:8px;border:1px solid var(--border)">
        <h4 style="margin:0 0 0.75rem 0;color:#4ade80">Практика и задачи</h4>
        <ul style="margin:0;padding-left:1.2rem;line-height:2">
            <li><code>leetcode.com</code> — алгоритмические задачи</li>
            <li><code>hackerrank.com/domains/go</code> — Go-задачи</li>
            <li><code>codewars.com</code> — kata-задачи разных уровней</li>
            <li><code>projecteuler.net</code> — математические задачи</li>
            <li><code>github.com/topics/go</code> — реальный open-source код</li>
        </ul>
    </div>
    <div style="background:var(--surface-2);padding:1rem;border-radius:8px;border:1px solid var(--border)">
        <h4 style="margin:0 0 0.75rem 0;color:#a78bfa">Сообщество</h4>
        <ul style="margin:0;padding-left:1.2rem;line-height:2">
            <li><code>reddit.com/r/golang</code> — главный Reddit-форум</li>
            <li><code>gophers.slack.com</code> — Slack сообщество</li>
            <li><code>t.me/golang_ru</code> — русскоязычный Telegram</li>
            <li><code>stackoverflow.com</code> — вопросы с тегом [go]</li>
            <li><code>discord.gg/golang</code> — Discord сервер</li>
        </ul>
    </div>
    <div style="background:var(--surface-2);padding:1rem;border-radius:8px;border:1px solid var(--border)">
        <h4 style="margin:0 0 0.75rem 0;color:#f97316">Новости и статьи</h4>
        <ul style="margin:0;padding-left:1.2rem;line-height:2">
            <li><code>golangweekly.com</code> — еженедельная рассылка</li>
            <li><code>blog.golang.org</code> — официальный блог</li>
            <li><code>threedots.tech</code> — advanced Go паттерны</li>
            <li><code>ardanlabs.com/blog</code> — глубокие статьи</li>
            <li><code>habr.com/hub/go</code> — русскоязычные статьи</li>
        </ul>
    </div>
</div>

<h3 style="margin-top:1.5rem">📺 YouTube-каналы</h3>
<div style="display:flex;flex-direction:column;gap:0.75rem">
    <div style="display:flex;gap:1rem;background:var(--surface-2);padding:0.75rem;border-radius:8px;align-items:center">
        <div style="font-size:1.5rem">🎬</div>
        <div><strong>Anthony GG</strong> — лучший канал по Go на YouTube. Реальные проекты, чистый код. Обязательно.</div>
    </div>
    <div style="display:flex;gap:1rem;background:var(--surface-2);padding:0.75rem;border-radius:8px;align-items:center">
        <div style="font-size:1.5rem">🎬</div>
        <div><strong>TechWorld with Nana</strong> — Docker, Kubernetes, DevOps. Лучшие объяснения.</div>
    </div>
    <div style="display:flex;gap:1rem;background:var(--surface-2);padding:0.75rem;border-radius:8px;align-items:center">
        <div style="font-size:1.5rem">🎬</div>
        <div><strong>ТНИС (Типичный Никита)</strong> — русскоязычный Go канал. Живые проекты.</div>
    </div>
    <div style="display:flex;gap:1rem;background:var(--surface-2);padding:0.75rem;border-radius:8px;align-items:center">
        <div style="font-size:1.5rem">🎬</div>
        <div><strong>Winderton</strong> — русскоязычный, объясняет низкоуровневые концепции очень понятно.</div>
    </div>
</div>
`
        },
        {
            type: 'info-box',
            variant: 'note',
            content: `<strong>Совет по ресурсам:</strong> Не пытайся изучить всё и сразу. Выбери 1-2 ресурса и доведи их до конца. Синдром "а вдруг есть лучший курс" — это прокрастинация в маскировке. GoJourney + один дополнительный ресурс по вкусу — более чем достаточно для старта.`
        },
        {
            type: 'theory',
            content: `
<h3>🛠️ Инструменты которые нужно установить</h3>
<table style="width:100%;border-collapse:collapse">
    <tr style="background:var(--surface-2)">
        <th style="padding:10px;border:1px solid var(--border)">Инструмент</th>
        <th style="padding:10px;border:1px solid var(--border)">Зачем</th>
        <th style="padding:10px;border:1px solid var(--border)">Где скачать</th>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)"><strong>Go</strong></td>
        <td style="padding:10px;border:1px solid var(--border)">Сам язык и компилятор</td>
        <td style="padding:10px;border:1px solid var(--border)"><code>go.dev/dl</code></td>
    </tr>
    <tr style="background:var(--surface-2)">
        <td style="padding:10px;border:1px solid var(--border)"><strong>VS Code</strong></td>
        <td style="padding:10px;border:1px solid var(--border)">Редактор кода (бесплатный)</td>
        <td style="padding:10px;border:1px solid var(--border)"><code>code.visualstudio.com</code></td>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)"><strong>Go extension для VS Code</strong></td>
        <td style="padding:10px;border:1px solid var(--border)">Автодополнение, подсветка, дебаггер</td>
        <td style="padding:10px;border:1px solid var(--border)">Marketplace в VS Code</td>
    </tr>
    <tr style="background:var(--surface-2)">
        <td style="padding:10px;border:1px solid var(--border)"><strong>Git</strong></td>
        <td style="padding:10px;border:1px solid var(--border)">Версионирование кода</td>
        <td style="padding:10px;border:1px solid var(--border)"><code>git-scm.com</code></td>
    </tr>
    <tr>
        <td style="padding:10px;border:1px solid var(--border)"><strong>Docker Desktop</strong></td>
        <td style="padding:10px;border:1px solid var(--border)">Запуск PostgreSQL и других сервисов</td>
        <td style="padding:10px;border:1px solid var(--border)"><code>docker.com/get-started</code></td>
    </tr>
    <tr style="background:var(--surface-2)">
        <td style="padding:10px;border:1px solid var(--border)"><strong>Goland (опционально)</strong></td>
        <td style="padding:10px;border:1px solid var(--border)">IDE от JetBrains, платный но мощнее</td>
        <td style="padding:10px;border:1px solid var(--border)"><code>jetbrains.com/go</code> (бесплатно для студентов)</td>
    </tr>
</table>
`
        },
        {
            type: 'info-box',
            variant: 'note',
            content: `<strong>Не перегружай себя ресурсами.</strong> GoJourney + один дополнительный ресурс — более чем достаточно для старта. Синдром "а вдруг есть лучший курс" — это прокрастинация в маскировке.`
        }
    ]
};
