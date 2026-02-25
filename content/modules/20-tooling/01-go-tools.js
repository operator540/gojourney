export default {
    id: '20-01',
    title: 'Go инструменты: швейцарский нож разработчика',
    description: 'Освоишь встроенные инструменты Go: форматирование, анализ кода, генерация, документация и низкоуровневые утилиты.',
    estimatedTime: 30,
    xpReward: 25,
    sections: [
        {
            type: 'theory',
            content: `
<h2>Аналогия: Швейцарский нож разработчика</h2>
<p>Представь, что ты плотник. У тебя есть молоток, рубанок, уровень, рулетка — каждый инструмент делает одно дело, но делает его идеально. Go toolchain устроен точно так же: вместо одного монструозного комбайна — набор точечных инструментов, каждый из которых решает конкретную задачу.</p>
<p>В отличие от других языков, где форматтер, линтер и тест-раннер — это сторонние пакеты от разных авторов, Go поставляет их <strong>встроенными</strong>. Это значит: у всей Go-экосистемы одинаковый стиль кода, одинаковые соглашения, нулевые войны "как правильно форматировать".</p>
<p>Зачем знать инструменты? Потому что CI/CD, код-ревью, pre-commit хуки — всё это использует именно их. Не знаешь <code>go vet</code> — пропускаешь баги, которые компилятор не поймает.</p>
`
        },
        {
            type: 'theory',
            content: `
<h2>go fmt и gofmt: конец войнам за стиль</h2>
<p><code>go fmt</code> — это обёртка над <code>gofmt</code>, которая форматирует исходный код Go по официальному стандарту. Не "один из стандартов" — THE стандарт. Все Go-проекты в мире выглядят одинаково.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Команда</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Что делает</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Флаги</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><code>go fmt ./...</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Форматирует все файлы рекурсивно</td>
      <td style="padding:10px;border:1px solid var(--border)">—</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><code>gofmt -w file.go</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Перезаписывает файл на месте</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>-w</code> (write), <code>-l</code> (list), <code>-d</code> (diff)</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><code>gofmt -d ./...</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Показывает diff без изменений</td>
      <td style="padding:10px;border:1px solid var(--border)">Удобно для CI</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><code>goimports -w ./...</code></td>
      <td style="padding:10px;border:1px solid var(--border)">fmt + автоматическое управление импортами</td>
      <td style="padding:10px;border:1px solid var(--border)">Нужно установить отдельно</td>
    </tr>
  </tbody>
</table>
<p><strong>goimports</strong> делает больше: помимо форматирования, он добавляет отсутствующие импорты и удаляет неиспользуемые. Это must-have для любой IDE и pre-commit хука.</p>
<p>Установка goimports:</p>
<pre style="background:var(--surface-2);padding:12px;border-radius:8px;overflow:auto"><code>go install golang.org/x/tools/cmd/goimports@latest</code></pre>
`
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'go fmt и goimports в действии',
            code: `# Форматировать весь проект
go fmt ./...

# Проверить в CI без изменений (если есть diff — exit code 1)
test -z "$(gofmt -l .)" || (echo "Не отформатировано:" && gofmt -l . && exit 1)

# goimports: форматирование + управление импортами
goimports -w ./...

# gofmt с diff — показать что изменится
gofmt -d main.go

# Настройка в VS Code (settings.json):
# "editor.formatOnSave": true,
# "[go]": { "editor.defaultFormatter": "golang.go" }`,
            explanation: 'В CI принято проверять форматирование командой gofmt -l и завершать пайплайн с ошибкой, если код не отформатирован. Это заставляет разработчиков форматировать код до коммита.'
        },
        {
            type: 'theory',
            content: `
<h2>go vet: статический анализ без компромиссов</h2>
<p><code>go vet</code> находит баги, которые компилятор пропускает. Это не стилевые замечания — это реальные ошибки: неправильные форматные строки, гонки данных, недостижимый код, ошибочные вызовы mutex.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Анализатор</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Что ищет</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Пример ошибки</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><code>printf</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Неправильные форматные строки</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>fmt.Printf("%d", "строка")</code></td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><code>copylocks</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Копирование mutex по значению</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>mu := sync.Mutex{}; mu2 := mu</code></td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><code>unreachable</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Недостижимый код</td>
      <td style="padding:10px;border:1px solid var(--border)">Код после <code>return</code></td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><code>assign</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Бесполезные присваивания</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>x = x</code></td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><code>structtag</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Неверные struct теги</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>json:"name,omitemtpy"</code> (опечатка)</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><code>httpresponse</code></td>
      <td style="padding:10px;border:1px solid var(--border)">HTTP тело не закрыто</td>
      <td style="padding:10px;border:1px solid var(--border)">Забытый <code>resp.Body.Close()</code></td>
    </tr>
  </tbody>
</table>
<p>Запускай <code>go vet ./...</code> перед каждым коммитом. В большинстве зрелых проектов это часть CI и блокирует merge при наличии ошибок.</p>
`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Ошибки которые go vet находит',
            code: `package main

import (
    "fmt"
    "sync"
)

// Ошибка 1: неверная форматная строка
func badPrintf() {
    name := "World"
    // go vet: fmt.Printf format %d has arg name of wrong type string
    fmt.Printf("%d", name)
}

// Ошибка 2: копирование mutex по значению
type SafeCounter struct {
    mu    sync.Mutex
    count int
}

func badCopy() {
    sc := SafeCounter{}
    sc.mu.Lock()
    // go vet: assignment copies lock value to sc2: sync.Mutex
    sc2 := sc // ОПАСНО! Копируем заблокированный мьютекс
    _ = sc2
}

// Ошибка 3: неверный struct tag (опечатка в omitempty)
type User struct {
    // go vet: struct field tag ... not compatible with reflect.StructTag.Get
    Name string \`json:"name,omitemtpy"\` // опечатка!
    Age  int    \`json:"age,omitempty"\`  // правильно
}

// Ошибка 4: недостижимый код
func unreachableCode() int {
    return 42
    fmt.Println("это никогда не выполнится") // go vet: unreachable code
}

// Правильный вариант: всё ок
func correctCode() {
    var mu sync.Mutex
    mu.Lock()
    defer mu.Unlock()
    fmt.Printf("%s", "Hello") // правильный форматтер для строки
}`,
            explanation: 'go vet — это первая линия обороны после компилятора. Он запускается автоматически при go test, поэтому если тесты проходят, базовые vet-ошибки уже исключены. Но явный запуск go vet ./... стоит добавить в Makefile отдельно.'
        },
        {
            type: 'theory',
            content: `
<h2>go generate: автоматизация генерации кода</h2>
<p>Go — статически типизированный язык без шаблонов (до генериков). Исторически это означало много повторяющегося кода. <code>go generate</code> решает проблему: ты пишешь специальный комментарий в коде, запускаешь команду — генератор создаёт код автоматически.</p>
<p>Типичные сценарии использования:</p>
<ul>
  <li><strong>mockgen</strong> — генерация моков для интерфейсов (тестирование)</li>
  <li><strong>stringer</strong> — генерация метода <code>String()</code> для <code>iota</code> констант</li>
  <li><strong>protoc</strong> — генерация gRPC клиентов/серверов из .proto файлов</li>
  <li><strong>sqlc</strong> — генерация типобезопасного кода из SQL-запросов</li>
  <li><strong>wire</strong> — генерация dependency injection кода</li>
</ul>
<p>Синтаксис: специальный комментарий <code>//go:generate команда</code> прямо в .go файле. При запуске <code>go generate ./...</code> Go ищет такие комментарии и выполняет команды.</p>
`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'go generate: stringer и mockgen',
            code: `// === Пример 1: stringer для enum ===
// Файл: direction.go
package main

//go:generate stringer -type=Direction

type Direction int

const (
    North Direction = iota
    South
    East
    West
)

// После go generate создаётся direction_string.go:
// func (d Direction) String() string {
//     return [...]string{"North", "South", "East", "West"}[d]
// }

// === Пример 2: mockgen для тестов ===
// Файл: service.go
package service

//go:generate mockgen -source=service.go -destination=mock/service_mock.go -package=mock

type UserRepository interface {
    FindByID(id int) (*User, error)
    Save(user *User) error
    Delete(id int) error
}

// После go generate создаётся mock/service_mock.go с полным моком интерфейса

// === Пример 3: sqlc из SQL ===
// Файл: query.sql.go (генерируется из query.sql)
//go:generate sqlc generate

// Запуск генерации для всего проекта:
// go generate ./...

// Установка инструментов:
// go install golang.org/x/tools/cmd/stringer@latest
// go install github.com/golang/mock/mockgen@latest`,
            explanation: 'Сгенерированный код принято коммитить в репозиторий, чтобы не требовать от всех разработчиков установки генераторов. Но в CI стоит проверять: если запустить go generate, diff должен быть пустым.'
        },
        {
            type: 'theory',
            content: `
<h2>go doc и pkgsite: документация как first-class citizen</h2>
<p>В Go документация — часть языка, а не опциональный довесок. <code>go doc</code> показывает документацию прямо в терминале, извлекая её из комментариев к пакетам, функциям и типам.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Команда</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Результат</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><code>go doc fmt</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Документация пакета fmt</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><code>go doc fmt.Printf</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Документация конкретной функции</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><code>go doc -all fmt</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Вся документация пакета</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><code>go doc -src fmt.Printf</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Исходный код функции</td>
    </tr>
  </tbody>
</table>
<p><strong>Правила написания godoc:</strong></p>
<ul>
  <li>Комментарий должен начинаться с имени сущности: <code>// UserService manages user operations</code></li>
  <li>Первое предложение — краткое описание (используется в индексе)</li>
  <li>Пустая строка отделяет абзацы</li>
  <li>Отступ в 4 пробела — блок кода в документации</li>
  <li>Ссылки: просто URL, godoc автоматически делает их кликабельными</li>
</ul>
<p><strong>pkgsite</strong> — локальный сервер документации в браузере:</p>
<pre style="background:var(--surface-2);padding:12px;border-radius:8px;overflow:auto"><code>go install golang.org/x/pkgsite/cmd/pkgsite@latest
pkgsite -open .</code></pre>
`
        },
        {
            type: 'theory',
            content: `
<h2>go tool: низкоуровневые утилиты</h2>
<p>Помимо высокоуровневых команд, Go предоставляет низкоуровневые инструменты через <code>go tool</code>. Они нужны реже, но бывают незаменимы при отладке производительности или анализе бинарников.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Инструмент</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Назначение</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Команда</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><code>nm</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Список символов в объектном файле</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>go tool nm ./myapp</code></td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><code>objdump</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Дизассемблер бинарника</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>go tool objdump -s main.main ./myapp</code></td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><code>pprof</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Профилировщик CPU и памяти</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>go tool pprof cpu.prof</code></td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><code>trace</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Визуализация runtime событий</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>go tool trace trace.out</code></td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><code>compile</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Компилятор с флагами отладки</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>go tool compile -S main.go</code></td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><code>vet</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Статический анализ (обёртка)</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>go tool vet ./...</code></td>
    </tr>
  </tbody>
</table>
<p>Практичный пример: <code>go build -gcflags="-m" ./...</code> покажет решения escape analysis — какие переменные уходят в heap, а какие остаются в stack. Это критично для оптимизации производительности.</p>
`
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Pre-commit хук за 3 минуты:</strong> создай файл <code>.git/hooks/pre-commit</code> с содным содержимым:</p>
<pre style="background:var(--surface-2);padding:10px;border-radius:6px;margin-top:8px">#!/bin/sh
gofmt -l . | grep -q '.' && echo "Отформатируй код: gofmt -w ." && exit 1
go vet ./... || exit 1
echo "OK"</pre>
<p style="margin-top:8px">Затем <code>chmod +x .git/hooks/pre-commit</code>. Теперь коммит невозможен, если код не отформатирован или go vet находит ошибки.</p>`
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<p><strong>goimports vs gofmt:</strong> если ты используешь goimports, не нужен отдельный gofmt — goimports включает всё форматирование gofmt плюс управление импортами. Запускать оба — избыточно. В большинстве современных Go-проектов используют goimports как единственный форматтер.</p>`
        },
        {
            type: 'editor',
            title: 'Напиши правильно задокументированный код',
            instructions: 'Реализуй пакет calculator с функциями Add, Subtract и Multiply. Добавь правильные godoc комментарии к каждой функции и к пакету. Добавь struct Tag для JSON с правильным форматированием (без опечаток вроде omitemtpy).',
            starterCode: `// Добавь godoc комментарий для пакета здесь
package calculator

// Result хранит результат вычисления
type Result struct {
    // Добавь JSON теги: value и operation
    Value     float64
    Operation string
}

// Добавь godoc комментарий для функции
func Add(a, b float64) Result {
    // реализуй
    return Result{}
}

// Добавь godoc комментарий для функции
func Subtract(a, b float64) Result {
    // реализуй
    return Result{}
}

// Добавь godoc комментарий для функции
func Multiply(a, b float64) Result {
    // реализуй
    return Result{}
}`,
            hints: [
                'Комментарий к пакету: // Package calculator provides basic arithmetic operations.',
                'Комментарий к функции начинается с её имени: // Add returns the sum of a and b.',
                'JSON теги: \`json:"value"\` и \`json:"operation"\` — без опечаток!',
                'Result{Value: a + b, Operation: "add"} — заполни все поля структуры'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Какая команда форматирует код И управляет импортами одновременно?',
                    options: [
                        'go fmt ./...',
                        'gofmt -w ./...',
                        'goimports -w ./...',
                        'go vet ./...'
                    ],
                    correct: 2,
                    explanation: 'goimports включает всю функциональность gofmt плюс автоматически добавляет недостающие импорты и удаляет неиспользуемые.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'go vet находит ошибку в следующем коде: fmt.Printf("%d", "hello"). Какой анализатор её обнаружит?',
                    options: [
                        'copylocks',
                        'printf',
                        'unreachable',
                        'structtag'
                    ],
                    correct: 1,
                    explanation: 'Анализатор printf проверяет соответствие форматных директив (%d, %s, %f) типам аргументов. %d ожидает целое число, но передана строка.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Что делает директива //go:generate в Go файле?',
                    options: [
                        'Генерирует тесты автоматически при компиляции',
                        'Помечает команду для запуска через go generate',
                        'Включает оптимизацию компилятора',
                        'Создаёт документацию из комментария'
                    ],
                    correct: 1,
                    explanation: '//go:generate — специальный комментарий-маркер. При запуске go generate ./... Go ищет такие комментарии и выполняет указанные команды. Это не влияет на компиляцию.'
                },
                {
                    id: 'q4',
                    type: 'multiple',
                    question: 'Что из перечисленного является типичными use-case для go generate? (выбери все верные)',
                    options: [
                        'Генерация моков интерфейсов (mockgen)',
                        'Автоматическое форматирование кода',
                        'Генерация String() для iota констант (stringer)',
                        'Генерация gRPC кода из .proto файлов',
                        'Запуск тестов'
                    ],
                    correct: [0, 2, 3],
                    explanation: 'go generate запускает внешние инструменты для генерации кода. Типичные случаи: mockgen для моков, stringer для строкового представления констант, protoc для gRPC. Форматирование — это go fmt, тесты — go test.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Какой флаг gofmt показывает diff изменений без модификации файлов?',
                    options: [
                        '-w',
                        '-l',
                        '-d',
                        '-s'
                    ],
                    correct: 2,
                    explanation: 'Флаг -d (diff) показывает изменения в формате unified diff без записи в файл. Удобен для CI: можно проверить что код правильно отформатирован без изменений.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Для чего используется go tool nm?',
                    options: [
                        'Для просмотра сетевых метрик программы',
                        'Для вывода списка символов в скомпилированном бинарнике',
                        'Для запуска named pipes',
                        'Для управления модулями'
                    ],
                    correct: 1,
                    explanation: 'go tool nm выводит таблицу символов объектного файла или бинарника: функции, переменные, типы. Полезно при анализе размера бинарника или поиске включённых зависимостей.'
                },
                {
                    id: 'q7',
                    type: 'code-fill',
                    question: 'Заполни команду для просмотра документации функции fmt.Sprintf в терминале:',
                    code: 'go ___ fmt.Sprintf',
                    answer: 'doc',
                    explanation: 'go doc [пакет].[символ] выводит документацию. Можно читать документацию любого установленного пакета прямо в терминале без браузера.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Как правило должен начинаться godoc комментарий к функции SaveUser?',
                    options: [
                        '// Эта функция сохраняет пользователя в базу данных',
                        '// SaveUser сохраняет пользователя в базу данных',
                        '/* SaveUser */',
                        '// @param user User структура'
                    ],
                    correct: 1,
                    explanation: 'По соглашению godoc, комментарий к экспортированной функции должен начинаться с её имени. Это позволяет инструментам строить осмысленный индекс документации и читать её вне контекста.'
                }
            ]
        }
    ]
};
