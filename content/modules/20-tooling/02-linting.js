export default {
    id: '20-02',
    title: 'Линтинг с golangci-lint',
    description: 'Настроишь golangci-lint — мета-линтер для Go, который запускает десятки анализаторов одновременно. Научишься конфигурировать .golangci.yml под реальные проекты.',
    estimatedTime: 35,
    xpReward: 28,
    sections: [
        {
            type: 'theory',
            content: `
<h2>Аналогия: Линтер как технический редактор</h2>
<p>Представь, что ты пишешь книгу. Компилятор Go — это корректор, который проверяет орфографию и грамматику (синтаксис). <code>go vet</code> — это редактор, который находит смысловые ошибки. А линтер — это опытный технический редактор, который говорит: "здесь функция слишком длинная", "здесь переменная затеняет другую", "здесь ты не обработал ошибку".</p>
<p>Линтер не запрещает писать плохой код — но делает плохой код видимым. Это дисциплина, встроенная в процесс разработки.</p>
<p><strong>golangci-lint</strong> — это не один линтер, а агрегатор. Он запускает 50+ линтеров параллельно, кэширует результаты и выдаёт единый отчёт. Используется в большинстве серьёзных Go-проектов: Kubernetes, Docker, HashiCorp Vault.</p>
`
        },
        {
            type: 'theory',
            content: `
<h2>Установка и первый запуск</h2>
<p>Устанавливать golangci-lint через <code>go install</code> — <strong>плохая идея</strong>. Версия может отличаться у разных разработчиков. Правильный способ — бинарник фиксированной версии.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Способ</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Команда</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Когда использовать</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)">curl (Linux/Mac)</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin v1.61.0</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Локальная разработка</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)">GitHub Actions</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>golangci/golangci-lint-action@v6</code></td>
      <td style="padding:10px;border:1px solid var(--border)">CI/CD пайплайн</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)">Docker</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>docker run golangci/golangci-lint:v1.61 golangci-lint run</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Изолированная среда</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)">Homebrew (Mac)</td>
      <td style="padding:10px;border:1px solid var(--border)"><code>brew install golangci-lint</code></td>
      <td style="padding:10px;border:1px solid var(--border)">Mac-разработка</td>
    </tr>
  </tbody>
</table>
<p>После установки проверь:</p>
<pre style="background:var(--surface-2);padding:12px;border-radius:8px;overflow:auto"><code>golangci-lint version
golangci-lint run ./...      # запуск с настройками по умолчанию
golangci-lint run --fix ./... # автоматическое исправление где возможно</code></pre>
`
        },
        {
            type: 'code-example',
            language: 'yaml',
            title: 'Полный .golangci.yml для production проекта',
            code: `# .golangci.yml — кладём в корень проекта
version: "2"

run:
  timeout: 5m
  go: "1.23"
  # Исключаем тесты из некоторых проверок
  tests: true

linters:
  enable:
    # Включены по умолчанию
    - errcheck      # проверяет что ошибки не игнорируются
    - gosimple      # упрощение кода
    - govet         # аналог go vet
    - ineffassign   # бесполезные присваивания
    - staticcheck   # продвинутый статический анализ
    - unused        # неиспользуемый код
    
    # Дополнительные (включаем явно)
    - revive        # заменитель golint, более гибкий
    - gocyclo       # цикломатическая сложность
    - funlen        # длина функций
    - gocognit      # когнитивная сложность
    - gocritic      # общие советы по коду
    - godot         # точка в конце комментариев
    - misspell      # орфографические ошибки в комментариях
    - nolintlint    # корректное использование //nolint
    - prealloc      # оптимизация pre-allocation слайсов
    - unconvert     # ненужные конвертации типов
    - unparam       # неиспользуемые параметры функций
    - whitespace    # лишние пустые строки
    - wsl           # стиль пустых строк (опционально)

linters-settings:
  errcheck:
    # Не проверять закрытие io.Closer в defer
    check-type-assertions: true
    check-blank: true

  gocyclo:
    # Максимальная цикломатическая сложность функции
    min-complexity: 15

  funlen:
    # Максимальная длина функции
    lines: 80
    statements: 50

  gocognit:
    # Когнитивная сложность (сложнее цикломатической)
    min-complexity: 20

  revive:
    rules:
      - name: exported
        arguments:
          - "checkPrivateReceivers"
          - "sayRepetitiveInsteadOfStutters"
      - name: var-naming
      - name: package-comments

  govet:
    enable-all: true

  misspell:
    locale: US

issues:
  # Исключения для конкретных паттернов
  exclude-rules:
    # В тестах разрешаем длинные функции
    - path: "_test.go"
      linters:
        - funlen
        - gocognit
    
    # В main.go разрешаем некоторые паттерны
    - path: "main.go"
      linters:
        - gochecknoglobals
    
    # Игнорировать конкретные тексты ошибок
    - text: "Error return value of .*(Close|Write|Flush).*"
      linters:
        - errcheck

  # Максимум одинаковых ошибок
  max-same-issues: 3
  # Показывать только новые проблемы (от base ветки)
  # new: true`,
            explanation: 'Конфигурация .golangci.yml — это баланс между строгостью и практичностью. Начни с малого (errcheck, govet, staticcheck), добавляй линтеры постепенно. Жёсткие правила без исключений убьют продуктивность команды.'
        },
        {
            type: 'theory',
            content: `
<h2>Ключевые линтеры: что они ищут</h2>
<p>Понимать что делает каждый линтер важно — иначе ошибки будут непонятны и раздражать.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Линтер</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Находит</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Приоритет</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><strong>errcheck</strong></td>
      <td style="padding:10px;border:1px solid var(--border)">Игнорированные ошибки: <code>os.Remove(file)</code> без обработки err</td>
      <td style="padding:10px;border:1px solid var(--border)"><span style="color:var(--accent)">Критический</span></td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><strong>staticcheck</strong></td>
      <td style="padding:10px;border:1px solid var(--border)">Deprecated API, всегда-false условия, невозможные конверсии</td>
      <td style="padding:10px;border:1px solid var(--border)"><span style="color:var(--accent)">Критический</span></td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><strong>shadow</strong></td>
      <td style="padding:10px;border:1px solid var(--border)">Переменная затеняет переменную из внешнего scope</td>
      <td style="padding:10px;border:1px solid var(--border)">Высокий</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><strong>revive</strong></td>
      <td style="padding:10px;border:1px solid var(--border)">Неэкспортированные типы в экспортированных функциях, stuttering (pkg.PkgType)</td>
      <td style="padding:10px;border:1px solid var(--border)">Высокий</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><strong>funlen</strong></td>
      <td style="padding:10px;border:1px solid var(--border)">Функции длиннее N строк — признак нарушения SRP</td>
      <td style="padding:10px;border:1px solid var(--border)">Средний</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><strong>gocyclo</strong></td>
      <td style="padding:10px;border:1px solid var(--border)">Цикломатическая сложность > N (много ветвлений)</td>
      <td style="padding:10px;border:1px solid var(--border)">Средний</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)"><strong>prealloc</strong></td>
      <td style="padding:10px;border:1px solid var(--border)">Слайсы без предварительного выделения размера</td>
      <td style="padding:10px;border:1px solid var(--border)">Производительность</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)"><strong>misspell</strong></td>
      <td style="padding:10px;border:1px solid var(--border)">Орфографические ошибки в комментариях и строках</td>
      <td style="padding:10px;border:1px solid var(--border)">Низкий</td>
    </tr>
  </tbody>
</table>
`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Типичные ошибки которые находит golangci-lint',
            code: `package main

import (
    "fmt"
    "os"
)

// Ошибка 1: errcheck — игнорированная ошибка
func badErrcheck() {
    os.Remove("/tmp/file.txt") // golangci-lint: Error return value of os.Remove is not checked
    
    // Правильно:
    if err := os.Remove("/tmp/file.txt"); err != nil {
        fmt.Println("failed to remove:", err)
    }
}

// Ошибка 2: shadow — переменная err затеняет внешнюю
func badShadow() error {
    err := doSomething()
    if err != nil {
        // golangci-lint: declaration of "err" shadows declaration at line above
        if result, err := doSomethingElse(); err == nil {
            fmt.Println(result)
        }
        return err // какой err здесь? внешний или внутренний?
    }
    return nil
}

// Правильно: явные имена
func goodShadow() error {
    err := doSomething()
    if err != nil {
        result, err2 := doSomethingElse()
        if err2 == nil {
            fmt.Println(result)
        }
        return err
    }
    return nil
}

// Ошибка 3: prealloc — слайс без предварительного размера
func badPrealloc(n int) []int {
    var result []int // golangci-lint: Consider pre-allocating result
    for i := 0; i < n; i++ {
        result = append(result, i*i)
    }
    return result
}

// Правильно: make с известным размером
func goodPrealloc(n int) []int {
    result := make([]int, 0, n) // предварительно выделяем capacity
    for i := 0; i < n; i++ {
        result = append(result, i*i)
    }
    return result
}

// Исключение: когда нужно игнорировать линтер
func mustIgnore() {
    //nolint:errcheck // файл временный, ошибка не критична
    os.Remove("/tmp/definitely-temp.txt")
}

func doSomething() error    { return nil }
func doSomethingElse() (string, error) { return "", nil }`,
            explanation: 'Директива //nolint:имя-линтера позволяет подавить конкретное предупреждение. ВСЕГДА добавляй комментарий почему (// файл временный...). Голый //nolint без объяснения — плохая практика, линтер nolintlint за это ругает.'
        },
        {
            type: 'theory',
            content: `
<h2>staticcheck: продвинутый анализ</h2>
<p><strong>staticcheck</strong> — это отдельный мощный инструмент, который также входит в golangci-lint. Он выходит за рамки синтаксиса и ищет реальные логические ошибки.</p>
<p>Категории проверок staticcheck:</p>
<ul>
  <li><code>SA</code> — Static Analysis: реальные баги (неправильный mutex, всегда-true условие, неиспользуемые результаты каналов)</li>
  <li><code>S</code> — Simple: упрощение кода (strings.Index(s, x) >= 0 → strings.Contains(s, x))</li>
  <li><code>ST</code> — Style: стилевые замечания</li>
  <li><code>QF</code> — Quick Fix: автоматически исправляемые паттерны</li>
</ul>
<p>Примеры находок:</p>
<pre style="background:var(--surface-2);padding:12px;border-radius:8px;overflow:auto"><code>// SA4006: переменная объявлена, но не используется перед переприсваиванием
x := computeExpensive()
x = 42 // staticcheck: этот x никогда не был прочитан

// SA1006: Printf без форматных директив
fmt.Printf(userInput) // опасно! используй fmt.Print или fmt.Printf("%s", userInput)

// S1039: ненужный Sprintf
s := fmt.Sprintf("%s", str) // staticcheck: используй просто str</code></pre>
`
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Стратегия внедрения в существующий проект:</strong> если ты добавляешь golangci-lint в проект с историей, сразу включить все линтеры — это сотни ошибок. Используй режим <code>--new-from-rev=HEAD~1</code> или <code>--new</code> — он показывает только новые проблемы относительно базовой ветки. Так линтер не блокирует работу, но новый код пишется чисто.</p>`
        },
        {
            type: 'info-box',
            variant: 'danger',
            content: `<p><strong>Не злоупотребляй //nolint!</strong> Если в проекте больше 5% строк содержат //nolint — линтер бесполезен. Линтер — это инструмент обучения и дисциплины, а не препятствие для обхода. Каждое //nolint должно иметь объяснение и быть одобрено на код-ревью.</p>`
        },
        {
            type: 'editor',
            title: 'Исправь код чтобы он прошёл линтер',
            instructions: 'В коде ниже несколько проблем которые обнаружит golangci-lint: игнорированная ошибка, variable shadowing, слайс без предварительного выделения. Исправь все проблемы.',
            starterCode: `package main

import (
    "fmt"
    "os"
    "strconv"
)

func processNumbers(count int) []string {
    // Проблема 1: слайс без предварительного выделения
    var results []string
    
    for i := 0; i < count; i++ {
        results = append(results, strconv.Itoa(i))
    }
    
    return results
}

func saveToFile(filename, content string) error {
    err := os.WriteFile(filename, []byte(content), 0644)
    if err != nil {
        // Проблема 2: variable shadowing
        if info, err := os.Stat(filename); err == nil {
            fmt.Println("file size:", info.Size())
        }
        return err
    }
    return nil
}

func cleanup(filename string) {
    // Проблема 3: игнорированная ошибка
    os.Remove(filename)
}

func main() {
    nums := processNumbers(10)
    content := fmt.Sprintf("%v", nums)
    
    if err := saveToFile("/tmp/test.txt", content); err != nil {
        fmt.Println("error:", err)
    }
    
    cleanup("/tmp/test.txt")
}`,
            hints: [
                'Для слайса используй make([]string, 0, count) — задаём capacity заранее',
                'В saveToFile замени внутренний err на err2 или info, statErr := os.Stat(...)',
                'В cleanup: if err := os.Remove(filename); err != nil { ... }',
                'Можно использовать //nolint:errcheck с комментарием, но лучше обработать ошибку'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Почему НЕ рекомендуется устанавливать golangci-lint через go install?',
                    options: [
                        'go install не поддерживает внешние инструменты',
                        'Разные разработчики получат разные версии, что приводит к непоследовательным результатам',
                        'golangci-lint не является Go-пакетом',
                        'go install слишком медленный для CI'
                    ],
                    correct: 1,
                    explanation: 'При установке через go install без явной версии (@v1.61.0) разные разработчики и CI могут получить разные версии инструмента, что приводит к разным результатам проверки.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что делает линтер errcheck?',
                    options: [
                        'Проверяет синтаксис обработки ошибок',
                        'Находит места где возвращаемая ошибка не проверяется',
                        'Проверяет что все функции возвращают error',
                        'Анализирует типы ошибок'
                    ],
                    correct: 1,
                    explanation: 'errcheck находит вызовы функций, которые возвращают error, когда этот error просто игнорируется (не присваивается переменной и не проверяется). Например: os.Remove(file) без err :='
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Что такое variable shadowing и почему это проблема?',
                    options: [
                        'Переменная имеет неправильное имя',
                        'Внутренняя переменная с тем же именем скрывает внешнюю, создавая неоднозначность',
                        'Переменная объявлена дважды в одном scope',
                        'Переменная не инициализирована'
                    ],
                    correct: 1,
                    explanation: 'Shadowing происходит когда во внутреннем блоке объявляется переменная с тем же именем что и во внешнем. Это создаёт неоднозначность: какая err возвращается — внешняя или внутренняя? Это источник трудноуловимых багов.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Как правильно написать //nolint директиву?',
                    options: [
                        '//nolint',
                        '// nolint: all',
                        '//nolint:errcheck // временно, файл удалится при перезапуске',
                        '/* nolint */'
                    ],
                    correct: 2,
                    explanation: 'Правильный формат: //nolint:имя-линтера с обязательным комментарием почему. Голый //nolint без указания конкретного линтера — плохая практика (отключает все), а без объяснения — нарушение nolintlint правила.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Что делает линтер prealloc?',
                    options: [
                        'Предварительно загружает все пакеты',
                        'Находит слайсы которые можно создать с заранее известным capacity через make',
                        'Оптимизирует работу с памятью на уровне ОС',
                        'Проверяет использование unsafe.Pointer'
                    ],
                    correct: 1,
                    explanation: 'prealloc находит циклы where слайс наполняется через append, но его размер известен заранее. В таких случаях make([]T, 0, n) эффективнее: не происходит множественных reallocations по мере роста слайса.'
                },
                {
                    id: 'q6',
                    type: 'multiple',
                    question: 'Какие проверки выполняет staticcheck? (выбери все верные)',
                    options: [
                        'Обнаруживает переменные объявленные, но не прочитанные перед переписыванием (SA4006)',
                        'Проверяет форматирование пробелов (tabs vs spaces)',
                        'Находит fmt.Printf(userInput) без форматной строки (потенциальный format injection)',
                        'Упрощает strings.Index(s,x) >= 0 до strings.Contains (S категория)',
                        'Проверяет длину имён переменных'
                    ],
                    correct: [0, 2, 3],
                    explanation: 'staticcheck делает реальный анализ логики: неиспользованные значения, небезопасные паттерны, упрощаемые выражения. Форматирование — это gofmt, длина имён — другие линтеры.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Как запустить golangci-lint только для новых изменений (не трогая старый код)?',
                    options: [
                        'golangci-lint run --only-new',
                        'golangci-lint run --new-from-rev=HEAD~1',
                        'golangci-lint run --skip-old',
                        'golangci-lint diff'
                    ],
                    correct: 1,
                    explanation: 'Флаг --new-from-rev позволяет проверять только код, изменённый относительно указанного коммита. Это идеально для внедрения в legacy-проект: новый код чистый, старый не трогаем постепенно.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Что означает настройка funlen: lines: 80 в .golangci.yml?',
                    options: [
                        'Максимальная длина строки 80 символов',
                        'Максимум 80 функций в файле',
                        'Функция не должна превышать 80 строк',
                        'Минимальная длина функции 80 строк'
                    ],
                    correct: 2,
                    explanation: 'funlen ограничивает максимальную длину функции. Функция > 80 строк обычно нарушает Single Responsibility Principle и её тяжело тестировать. Линтер заставляет декомпозировать большие функции.'
                }
            ]
        }
    ]
};
