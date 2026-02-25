export default {
    id: '14-08',
    title: 'Путь к работе Go-разработчиком',
    description: 'Конкретный план: что делать каждую неделю, что строить, как попасть на работу',
    estimatedTime: 30,
    xpReward: 50,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Ты прошёл весь курс. Что дальше?</h2>
                <p>Знания есть. Но знания — это не работа. Между "я знаю Go" и "мне платят за Go" — конкретные шаги. Этот урок — твой личный план действий.</p>
                <p>Реальный факт: большинство людей учат Go месяцами и никуда не устраиваются, потому что <strong>ждут, что "достаточно выучат"</strong>. Этот момент никогда не наступает. Нужно начинать действовать параллельно с учёбой.</p>

                <div style="background:var(--surface-2);border-left:4px solid var(--accent);padding:16px;border-radius:8px;margin:16px 0">
                    <p style="margin:0"><strong>Цель этого плана:</strong> получить первый оффер на позицию Junior Go Developer за 3-4 месяца активной работы, если у тебя уже есть базовые знания программирования.</p>
                </div>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Роадмап: 3 месяца до первого оффера</h2>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:16px 0">
                    <div style="background:var(--surface-2);border:1px solid var(--accent);border-radius:8px;padding:16px">
                        <p style="color:var(--accent);font-weight:bold;margin:0 0 8px 0">МЕСЯЦ 1: Фундамент</p>
                        <p style="font-size:0.85em;margin:4px 0"><strong>Нед. 1-2:</strong> Модули 1-8 курса</p>
                        <p style="font-size:0.85em;margin:4px 0"><strong>Нед. 3-4:</strong> Модули 9-14</p>
                        <p style="font-size:0.85em;margin:4px 0">+ Первый CLI проект на GitHub</p>
                        <p style="font-size:0.85em;margin:4px 0">+ Exercism каждый день</p>
                    </div>
                    <div style="background:var(--surface-2);border:1px solid #f59e0b;border-radius:8px;padding:16px">
                        <p style="color:#f59e0b;font-weight:bold;margin:0 0 8px 0">МЕСЯЦ 2: Портфолио</p>
                        <p style="font-size:0.85em;margin:4px 0"><strong>Нед. 5-6:</strong> REST API проект</p>
                        <p style="font-size:0.85em;margin:4px 0">PostgreSQL + JWT + Docker</p>
                        <p style="font-size:0.85em;margin:4px 0"><strong>Нед. 7-8:</strong> Тесты + README</p>
                        <p style="font-size:0.85em;margin:4px 0">Начало откликов на вакансии</p>
                    </div>
                    <div style="background:var(--surface-2);border:1px solid #10b981;border-radius:8px;padding:16px">
                        <p style="color:#10b981;font-weight:bold;margin:0 0 8px 0">МЕСЯЦ 3: Оффер</p>
                        <p style="font-size:0.85em;margin:4px 0"><strong>Нед. 9-10:</strong> Второй проект</p>
                        <p style="font-size:0.85em;margin:4px 0">Активные отклики ежедневно</p>
                        <p style="font-size:0.85em;margin:4px 0"><strong>Нед. 11-12:</strong> Интервью</p>
                        <p style="font-size:0.85em;margin:4px 0">🎉 Первый оффер</p>
                    </div>
                </div>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Месяц 1: Строим фундамент</h2>

                <h3>Недели 1-2: Основы + ежедневный код</h3>
                <p>Главное правило — <strong>писать код каждый день, хотя бы 30 минут</strong>. Не читать, не смотреть, а писать. Пальцы должны привыкнуть.</p>
                <ul>
                    <li>Проходи модули 1-6 этого курса</li>
                    <li>Каждый пример из урока — переписывай руками, не копируй</li>
                    <li>Меняй код: добавь новую функцию, сломай и почини</li>
                    <li>Решай 1-2 задачи в день на <a href="https://exercism.org/tracks/go" target="_blank" style="color:var(--accent)">exercism.org/tracks/go</a></li>
                </ul>

                <h3>Недели 3-4: HTTP + БД + первый проект</h3>
                <p>Модули 7-14. И сразу — первый проект. Небольшой, но твой.</p>
                <div style="background:var(--surface-2);padding:16px;border-radius:8px;margin:12px 0">
                    <p style="margin:0 0 8px 0"><strong>Первый проект-идея: CLI-утилита</strong></p>
                    <p style="margin:0">Например: <code>gowatcher</code> — мониторинг папки, который следит за изменениями файлов и выводит уведомление. Или <code>goweather</code> — CLI который показывает погоду через API. Простой проект, который реально работает.</p>
                </div>
                <p>Создаёшь GitHub репозиторий. Пишешь README. Это твоя первая публичная работа.</p>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Месяц 2: Строим портфолио</h2>

                <h3>Основной проект для резюме</h3>
                <p>Один хороший проект лучше десяти плохих. Работодатель откроет GitHub, увидит один проект с нормальным README — это лучше чем 10 репозиториев с "test123" и одним коммитом.</p>

                <p><strong>Что должно быть в проекте для резюме:</strong></p>
                <ul>
                    <li>REST API с несколькими эндпоинтами (минимум 5-7)</li>
                    <li>PostgreSQL — реальная база, не sqlite в памяти</li>
                    <li>JWT аутентификация</li>
                    <li>Миграции (golang-migrate или goose)</li>
                    <li>Тесты — хотя бы unit тесты на сервисный слой</li>
                    <li>Docker Compose — чтобы можно было запустить одной командой</li>
                    <li>Хороший README с описанием, как запустить</li>
                </ul>

                <h3>Идеи для основного проекта</h3>
                <table style="width:100%;border-collapse:collapse">
                    <thead><tr style="background:var(--surface-2)">
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Проект</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Сложность</th>
                        <th style="padding:10px;text-align:left;border:1px solid var(--border)">Что покрывает</th>
                    </tr></thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><strong>URL Shortener</strong></td>
                            <td style="padding:10px;border:1px solid var(--border)">Низкая</td>
                            <td style="padding:10px;border:1px solid var(--border)">REST API, PostgreSQL, Redis для кэша</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><strong>Task Manager API</strong></td>
                            <td style="padding:10px;border:1px solid var(--border)">Средняя</td>
                            <td style="padding:10px;border:1px solid var(--border)">CRUD, JWT, роли пользователей</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><strong>Chat API</strong></td>
                            <td style="padding:10px;border:1px solid var(--border)">Средняя</td>
                            <td style="padding:10px;border:1px solid var(--border)">WebSocket или SSE, горутины</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)"><strong>GoNetwork (финальный проект курса)</strong></td>
                            <td style="padding:10px;border:1px solid var(--border)">Средне-высокая</td>
                            <td style="padding:10px;border:1px solid var(--border)">Всё: JWT, Redis, PostgreSQL, Docker, тесты</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)"><strong>Expense Tracker API</strong></td>
                            <td style="padding:10px;border:1px solid var(--border)">Средняя</td>
                            <td style="padding:10px;border:1px solid var(--border)">Категории, фильтры, отчёты — SQL навыки</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'info-box',
            variant: 'important',
            content: `<p><strong>Критический совет по GitHub:</strong> Не создавай репозиторий "learning-go" с 50 файлами типа "lesson3.go". Работодатели смотрят на реальные проекты, не на учебные упражнения. Учебный код держи локально или в отдельном приватном репо.</p>`
        },
        {
            type: 'theory',
            content: `
                <h2>Месяц 3: Активный поиск работы</h2>

                <h3>Когда начинать отклики?</h3>
                <p>Когда у тебя есть: <strong>1 нормальный проект на GitHub</strong> + <strong>понимание основ Go</strong>. Не ждёт, пока "выучишь всё". Это условие никогда не наступит. Начинай откликаться с месяца 2.</p>

                <h3>Где искать вакансии Go Junior в СНГ</h3>
                <ul>
                    <li><strong>hh.ru</strong> — "Go разработчик", "Golang developer", "backend разработчик Go"</li>
                    <li><strong>Telegram каналы:</strong> @golang_jobs, @go_jobs_cis, @go_jobs</li>
                    <li><strong>LinkedIn</strong> — Go developer, Golang backend engineer</li>
                    <li><strong>Хабр Карьера</strong> — habr.com/ru/jobs</li>
                    <li><strong>Remote jobs:</strong> remote.co, weworkremotely.com (поиск "golang")</li>
                </ul>

                <h3>Как написать резюме</h3>
                <p>Резюме Junior без опыта — это в первую очередь <strong>твои проекты</strong>. Структура:</p>
                <div style="background:var(--surface-2);padding:16px;border-radius:8px;margin:12px 0">
                    <p><strong>Контакты:</strong> имя, email, GitHub (обязательно!), LinkedIn, Telegram</p>
                    <p><strong>Навыки:</strong> Go (Echo/chi, goroutines, channels), PostgreSQL, Redis, Docker, Git, REST API, JWT, тестирование</p>
                    <p><strong>Проекты:</strong> для каждого — 2-3 строки: что это, стек, ссылка на GitHub. Можешь добавить demo видео/гифку</p>
                    <p><strong>Обучение:</strong> этот курс, другие ресурсы</p>
                    <p style="margin:0"><strong>Если есть:</strong> вклад в open source, статьи на Хабре, сертификаты</p>
                </div>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Подготовка к собеседованию</h2>
                <p>Go-собеседования обычно состоят из трёх частей. Вот что реально спрашивают Junior-ов:</p>

                <h3>1. Теория Go (30-40% времени)</h3>
                <table style="width:100%;border-collapse:collapse">
                    <thead><tr style="background:var(--surface-2)">
                        <th style="padding:8px;border:1px solid var(--border)">Вопрос</th>
                        <th style="padding:8px;border:1px solid var(--border)">Ключевые слова ответа</th>
                    </tr></thead>
                    <tbody>
                        <tr>
                            <td style="padding:8px;border:1px solid var(--border)">Горутины vs потоки ОС</td>
                            <td style="padding:8px;border:1px solid var(--border)">~2KB стек, M:N планировщик, миллион горутин OK</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:8px;border:1px solid var(--border)">Как работает канал?</td>
                            <td style="padding:8px;border:1px solid var(--border)">FIFO очередь, буферизованный/небуферизованный, блокировка</td>
                        </tr>
                        <tr>
                            <td style="padding:8px;border:1px solid var(--border)">Slice vs Array</td>
                            <td style="padding:8px;border:1px solid var(--border)">slice — дескриптор (ptr, len, cap), динамический размер</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:8px;border:1px solid var(--border)">Что такое defer?</td>
                            <td style="padding:8px;border:1px solid var(--border)">Откладывает вызов до выхода из функции, LIFO</td>
                        </tr>
                        <tr>
                            <td style="padding:8px;border:1px solid var(--border)">Интерфейсы в Go</td>
                            <td style="padding:8px;border:1px solid var(--border)">Неявная реализация (duck typing), набор методов</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:8px;border:1px solid var(--border)">Race condition — что это?</td>
                            <td style="padding:8px;border:1px solid var(--border)">Два потока читают/пишут без синхронизации, -race флаг</td>
                        </tr>
                        <tr>
                            <td style="padding:8px;border:1px solid var(--border)">panic vs error</td>
                            <td style="padding:8px;border:1px solid var(--border)">panic — программная ошибка (nil ptr), error — ожидаемая</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:8px;border:1px solid var(--border)">Garbage Collector Go</td>
                            <td style="padding:8px;border:1px solid var(--border)">Tri-color mark-and-sweep, конкурентный, паузы <1мс</td>
                        </tr>
                    </tbody>
                </table>

                <h3>2. Живое кодирование (40-50% времени)</h3>
                <p>Типичные задачи для Junior Go:</p>
                <ul>
                    <li>Найти дубликаты в срезе / подсчитать слова в строке (map)</li>
                    <li>FizzBuzz — звучит банально, но проверяют знание синтаксиса</li>
                    <li>Написать горутины: сумма чисел параллельно с WaitGroup</li>
                    <li>Реализовать Stack или Queue через slice</li>
                    <li>Reverse строки / Palindrome check</li>
                    <li>Написать HTTP handler с обработкой ошибок</li>
                </ul>

                <h3>3. Архитектура и опыт (20-30% времени)</h3>
                <ul>
                    <li>"Расскажи про свой проект" — объясни что делает и почему такой стек</li>
                    <li>"Что бы ты улучшил?" — честно говори об ограничениях</li>
                    <li>"Как масштабировать?" — горизонтальное масштабирование, кэш, очереди</li>
                    <li>"Почему Go, а не Python/Java?" — производительность, конкурентность, деплой</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Топ-3 задачи на живом кодировании — выучи наизусть',
            code: `package main

import "fmt"

// ===== ЗАДАЧА 1: подсчёт слов =====
// Спрашивают часто. Демонстрирует знание map.
func wordCount(s string) map[string]int {
    counts := make(map[string]int)
    word := ""
    for _, ch := range s + " " {
        if ch == ' ' || ch == '\\n' {
            if word != "" {
                counts[word]++
                word = ""
            }
        } else {
            word += string(ch)
        }
    }
    return counts
}

// ===== ЗАДАЧА 2: параллельная сумма =====
// Демонстрирует горутины + каналы + WaitGroup
import "sync"

func parallelSum(nums []int) int {
    mid := len(nums) / 2
    ch := make(chan int, 2)
    var wg sync.WaitGroup

    sum := func(slice []int) {
        defer wg.Done()
        s := 0
        for _, n := range slice { s += n }
        ch <- s
    }

    wg.Add(2)
    go sum(nums[:mid])
    go sum(nums[mid:])

    go func() {
        wg.Wait()
        close(ch)
    }()

    total := 0
    for s := range ch { total += s }
    return total
}

// ===== ЗАДАЧА 3: стек =====
// Демонстрирует дженерики + методы
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T)  { s.items = append(s.items, item) }
func (s *Stack[T]) Pop() (T, bool) {
    if len(s.items) == 0 {
        var zero T
        return zero, false
    }
    item := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return item, true
}
func (s *Stack[T]) Len() int { return len(s.items) }

func main() {
    // Тест 1
    fmt.Println(wordCount("hello world hello"))

    // Тест 2
    fmt.Println(parallelSum([]int{1, 2, 3, 4, 5})) // 15

    // Тест 3
    var st Stack[int]
    st.Push(1); st.Push(2); st.Push(3)
    v, _ := st.Pop()
    fmt.Println(v) // 3
}`,
            explanation: 'Три задачи, которые встречаются на собеседованиях чаще всего. Знание этих паттернов наизусть экономит нервы. На интервью не нужен идеальный код — нужен рабочий код, который ты можешь объяснить.'
        },
        {
            type: 'theory',
            content: `
                <h2>Что делать в первые 2 недели после найма</h2>
                <p>Ты нашёл работу. Поздравляем. Вот как не слиться в первые недели:</p>
                <ul>
                    <li><strong>Читай код, а не пиши его.</strong> Первые дни — изучай существующую кодовую базу. Как организован проект? Какие паттерны используются?</li>
                    <li><strong>Задавай вопросы.</strong> Лучше спросить три раза, чем молча делать неправильно неделю.</li>
                    <li><strong>Маленькие PR.</strong> Не пытайся сразу решить большую задачу. Начни с мелкого бага, чтобы понять процесс PR-review.</li>
                    <li><strong>Пиши тесты к своему коду.</strong> Даже если не требуют — это показывает зрелость.</li>
                    <li><strong>Не стесняйся признавать "не знаю".</strong> Сеньоры это ценят больше, чем уверенные ответы наугад.</li>
                </ul>

                <h2>Ресурсы для роста</h2>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
                    <div style="background:var(--surface-2);padding:12px;border-radius:8px">
                        <p style="margin:0 0 8px 0;font-weight:bold">Практика кода</p>
                        <ul style="margin:0;padding-left:16px">
                            <li>exercism.org/tracks/go</li>
                            <li>leetcode.com (тег "Go")</li>
                            <li>gophercises.com</li>
                        </ul>
                    </div>
                    <div style="background:var(--surface-2);padding:12px;border-radius:8px">
                        <p style="margin:0 0 8px 0;font-weight:bold">Чтение</p>
                        <ul style="margin:0;padding-left:16px">
                            <li>go.dev/doc/ (офиц. документация)</li>
                            <li>gobyexample.com</li>
                            <li>blog.golang.org</li>
                        </ul>
                    </div>
                    <div style="background:var(--surface-2);padding:12px;border-radius:8px">
                        <p style="margin:0 0 8px 0;font-weight:bold">Сообщества</p>
                        <ul style="margin:0;padding-left:16px">
                            <li>Telegram: @golang_ru</li>
                            <li>Reddit: r/golang</li>
                            <li>Discord: Gopher's Slack</li>
                        </ul>
                    </div>
                    <div style="background:var(--surface-2);padding:12px;border-radius:8px">
                        <p style="margin:0 0 8px 0;font-weight:bold">Open Source</p>
                        <ul style="margin:0;padding-left:16px">
                            <li>github.com/topics/go — поиск хороших first issues</li>
                            <li>Даже 1 merged PR — плюс в резюме</li>
                        </ul>
                    </div>
                </div>
            `
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Главный секрет:</strong> Работодатели нанимают не за знания, а за потенциал и умение учиться. Покажи им проект, который реально работает. Объясни, почему принял те или иные решения. Скажи, что бы улучшил если было больше времени. Это важнее, чем знать наизусть все вопросы из собеседований.</p>`
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Когда следует начинать откликаться на вакансии?',
                    options: [
                        'Когда есть 1 нормальный проект на GitHub + базовое понимание Go',
                        'Только после изучения всех 21 модуля',
                        'Когда будет 3+ лет опыта',
                        'После прохождения платных курсов'
                    ],
                    correct: 0,
                    explanation: 'Ждать "идеального момента" — главная ловушка. Один реальный проект на GitHub + знание основ — уже достаточно для первых откликов. Собеседования — это тоже опыт и обратная связь.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что важнее всего в проекте для резюме Junior разработчика?',
                    options: [
                        'Что проект реально работает и его можно запустить командой docker compose up',
                        'Количество строк кода',
                        'Использование самых новых технологий',
                        'Красивый UI'
                    ],
                    correct: 0,
                    explanation: 'Работающий проект с README, который запускается одной командой — лучший сигнал. Работодатель буквально клонирует репо и запускает. Если не запускается — это провал. Если работает — уже хорошо.'
                },
                {
                    id: 'q3',
                    type: 'multiple',
                    question: 'Что обязательно должно быть в хорошем проекте для резюме Junior Go? (выбери несколько)',
                    options: [
                        'REST API с аутентификацией JWT',
                        'PostgreSQL (реальная БД)',
                        'Docker Compose для запуска',
                        'Хотя бы базовые тесты',
                        'Микросервисная архитектура',
                        'GraphQL API'
                    ],
                    correct: [0, 1, 2, 3],
                    explanation: 'JWT + PostgreSQL + Docker + тесты — минимальный набор, который показывает что ты умеешь работать в реальных условиях. Микросервисы и GraphQL для Junior необязательны — лучше хорошо сделать простое, чем плохо сложное.'
                }
            ]
        }
    ]
};
