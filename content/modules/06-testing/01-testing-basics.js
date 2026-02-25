export default {
    id: '06-01',
    title: 'Основы тестирования',
    description: 'testing.T, t.Error/Fatal/Run, TestMain, t.Helper — фундамент тестирования в Go',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
<h2>QA-инженер внутри языка</h2>
<p>Представьте, что в каждой компании по контракту работает QA-инженер — но не сторонний, а встроенный в команду с первого дня. Он знает кодовую базу, работает с теми же инструментами и его отчёты понятны без перевода.</p>
<p>Именно так устроено тестирование в Go: это <strong>часть языка</strong>, а не внешняя надстройка. Пакет <code>testing</code> и команда <code>go test</code> доступны из коробки — без установки, без конфигурации.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:#1e293b">
      <th style="padding:10px;text-align:left;border:1px solid #334155;color:#94a3b8">Другие языки</th>
      <th style="padding:10px;text-align:left;border:1px solid #334155;color:#94a3b8">Go</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid #334155">JUnit, pytest, Jest — внешние библиотеки</td>
      <td style="padding:10px;border:1px solid #334155">Встроенный пакет <code>testing</code></td>
    </tr>
    <tr style="background:#0f172a">
      <td style="padding:10px;border:1px solid #334155">Нужна установка и конфигурация</td>
      <td style="padding:10px;border:1px solid #334155"><code>go test ./...</code> сразу работает</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid #334155">Тесты часто в отдельной папке</td>
      <td style="padding:10px;border:1px solid #334155">Тесты живут рядом с кодом</td>
    </tr>
    <tr style="background:#0f172a">
      <td style="padding:10px;border:1px solid #334155">Разные форматы именования</td>
      <td style="padding:10px;border:1px solid #334155">Строгая конвенция: <code>TestXxx(t *testing.T)</code></td>
    </tr>
  </tbody>
</table>
<p>Три правила для файлов тестов в Go:</p>
<ul>
  <li>Имя файла заканчивается на <code>_test.go</code></li>
  <li>Функции тестов: <code>func TestXxx(t *testing.T)</code> — X заглавная</li>
  <li>Запуск: <code>go test ./...</code> — автоматически находит все тесты</li>
</ul>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Первый тест: math.go + math_test.go',
            code: `// math.go — основной код
package math

func Add(a, b int) int {
    return a + b
}

func Abs(n int) int {
    if n < 0 {
        return -n
    }
    return n
}

// math_test.go — тесты рядом с кодом
package math

import "testing"

func TestAdd(t *testing.T) {
    result := Add(2, 3)
    if result != 5 {
        t.Errorf("Add(2, 3) = %d; want 5", result)
    }
}

func TestAbs(t *testing.T) {
    result := Abs(-5)
    if result != 5 {
        t.Errorf("Abs(-5) = %d; want 5", result)
    }
}`,
            explanation: 'Оба файла — в одном пакете math. Тест-файл не компилируется в production binary — только при go test. t.Errorf отмечает тест как FAIL, но выполнение продолжается.'
        },
        {
            type: 'theory',
            content: `
<h2>t.Error vs t.Fatal: когда остановить тест</h2>
<p>Представьте проверку автомобиля перед поездкой. Если нет бензина — дальше проверять бесполезно. Если слегка спущено колесо — можно зафиксировать и продолжить осмотр. Та же логика в тестах:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:#1e293b">
      <th style="padding:10px;text-align:left;border:1px solid #334155;color:#94a3b8">Метод</th>
      <th style="padding:10px;text-align:left;border:1px solid #334155;color:#94a3b8">Поведение</th>
      <th style="padding:10px;text-align:left;border:1px solid #334155;color:#94a3b8">Когда использовать</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid #334155"><code>t.Error / t.Errorf</code></td>
      <td style="padding:10px;border:1px solid #334155">Фиксирует FAIL, тест продолжается</td>
      <td style="padding:10px;border:1px solid #334155">Проверки независимы друг от друга</td>
    </tr>
    <tr style="background:#0f172a">
      <td style="padding:10px;border:1px solid #334155"><code>t.Fatal / t.Fatalf</code></td>
      <td style="padding:10px;border:1px solid #334155">Фиксирует FAIL, тест стоп</td>
      <td style="padding:10px;border:1px solid #334155">Дальнейшие проверки бессмысленны (nil, ошибка)</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid #334155"><code>t.Log / t.Logf</code></td>
      <td style="padding:10px;border:1px solid #334155">Только логирует, не провал</td>
      <td style="padding:10px;border:1px solid #334155">Отладочная информация (видна при -v)</td>
    </tr>
    <tr style="background:#0f172a">
      <td style="padding:10px;border:1px solid #334155"><code>t.Skip / t.Skipf</code></td>
      <td style="padding:10px;border:1px solid #334155">Пропускает тест</td>
      <td style="padding:10px;border:1px solid #334155">Нет ресурса (БД, API) или -short флаг</td>
    </tr>
  </tbody>
</table>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Error vs Fatal на практике',
            code: `package service_test

import "testing"

func TestGetUser_FatalExample(t *testing.T) {
    user, err := GetUser(1)

    // Fatal: если err != nil, user == nil, следующая строка вызовет панику
    // Поэтому останавливаем тест немедленно
    if err != nil {
        t.Fatalf("GetUser(1) вернул ошибку: %v", err)
    }

    // Дальше идут независимые проверки — используем Error
    if user.ID != 1 {
        t.Errorf("user.ID = %d; want 1", user.ID)
    }
    if user.Name == "" {
        t.Errorf("user.Name пустой")
    }
    if user.Email == "" {
        t.Errorf("user.Email пустой")
    }
    // Все три ошибки будут показаны, не только первая
}

func TestDivide_SkipExample(t *testing.T) {
    if testing.Short() {
        t.Skip("пропускаем в -short режиме")
    }
    // долгий тест...
}`,
            explanation: 'Первая проверка — Fatal: если user == nil, обращение user.ID вызовет панику. Остальные проверки — Error: они независимы, все ошибки полезны.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Подтесты с t.Run',
            code: `package math

import "testing"

func TestAdd_Subtests(t *testing.T) {
    t.Run("positive numbers", func(t *testing.T) {
        if Add(2, 3) != 5 {
            t.Error("2 + 3 should be 5")
        }
    })

    t.Run("negative numbers", func(t *testing.T) {
        if Add(-1, -2) != -3 {
            t.Error("-1 + -2 should be -3")
        }
    })

    t.Run("zero", func(t *testing.T) {
        if Add(0, 0) != 0 {
            t.Error("0 + 0 should be 0")
        }
    })
}

// Запуск конкретного подтеста через -run:
// go test -run TestAdd_Subtests/negative
// go test -run TestAdd_Subtests/neg  — работает как regexp`,
            explanation: 't.Run создаёт именованные подтесты. Вывод go test -v показывает каждый подтест отдельно. Флаг -run принимает regexp — можно запускать только нужные подтесты.'
        },
        {
            type: 'theory',
            content: `
<h2>Полезные флаги go test</h2>
<p>Знание флагов экономит время при отладке и интеграции в CI:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:#1e293b">
      <th style="padding:10px;text-align:left;border:1px solid #334155;color:#94a3b8">Флаг</th>
      <th style="padding:10px;text-align:left;border:1px solid #334155;color:#94a3b8">Что делает</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid #334155"><code>go test ./...</code></td>
      <td style="padding:10px;border:1px solid #334155">Тесты всех пакетов рекурсивно</td>
    </tr>
    <tr style="background:#0f172a">
      <td style="padding:10px;border:1px solid #334155"><code>-v</code></td>
      <td style="padding:10px;border:1px solid #334155">Verbose: имена тестов и t.Log вывод</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid #334155"><code>-run TestAdd</code></td>
      <td style="padding:10px;border:1px solid #334155">Только тесты, совпадающие с regexp</td>
    </tr>
    <tr style="background:#0f172a">
      <td style="padding:10px;border:1px solid #334155"><code>-count=1</code></td>
      <td style="padding:10px;border:1px solid #334155">Отключить кэширование результатов</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid #334155"><code>-short</code></td>
      <td style="padding:10px;border:1px solid #334155">Сигнал для пропуска медленных тестов</td>
    </tr>
    <tr style="background:#0f172a">
      <td style="padding:10px;border:1px solid #334155"><code>-timeout 30s</code></td>
      <td style="padding:10px;border:1px solid #334155">Таймаут (по умолчанию 10m)</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid #334155"><code>-race</code></td>
      <td style="padding:10px;border:1px solid #334155">Детектор гонок данных</td>
    </tr>
  </tbody>
</table>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'TestMain — setup и teardown',
            code: `package db_test

import (
    "fmt"
    "os"
    "testing"
)

var testDB *Database

func TestMain(m *testing.M) {
    // === SETUP — выполняется ДО всех тестов ===
    fmt.Println("Поднимаем тестовую БД...")
    var err error
    testDB, err = setupTestDatabase()
    if err != nil {
        fmt.Printf("Не удалось поднять БД: %v\n", err)
        os.Exit(1)
    }

    // === ЗАПУСК ТЕСТОВ ===
    code := m.Run()

    // === TEARDOWN — выполняется ПОСЛЕ всех тестов ===
    fmt.Println("Чистим тестовую БД...")
    testDB.Close()

    // os.Exit обязателен — передаёт код выхода
    os.Exit(code)
}

func TestInsertUser(t *testing.T) {
    // testDB уже готов, инициализация прошла в TestMain
    err := testDB.Insert("users", map[string]any{"name": "Alice"})
    if err != nil {
        t.Fatalf("Insert failed: %v", err)
    }
}`,
            explanation: 'TestMain — единственная точка входа для всего пакета тестов. os.Exit(code) обязателен — без него код выхода потеряется. Идеально для БД, HTTP-серверов, временных файлов.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 't.Helper() — правильные сообщения об ошибках',
            code: `package math

import "testing"

// БЕЗ t.Helper() — ошибка укажет на строку ВНУТРИ assertEqual, не на вызов
func assertEqualBad(t *testing.T, got, want int) {
    if got != want {
        t.Errorf("got %d, want %d", got, want) // строка 9 — бесполезно
    }
}

// С t.Helper() — ошибка укажет на строку ВЫЗОВА хелпера
func assertEqual(t *testing.T, got, want int) {
    t.Helper() // <-- вот это меняет всё
    if got != want {
        t.Errorf("got %d, want %d", got, want)
    }
}

func TestAddWithHelper(t *testing.T) {
    assertEqual(t, Add(2, 3), 5)   // ← ошибка укажет на эту строку
    assertEqual(t, Add(-1, 1), 0)  // ← или на эту
    assertEqual(t, Add(0, 0), 0)
}`,
            explanation: 't.Helper() говорит тестовому фреймворку: эта функция — вспомогательная. При провале показывай строку вызова, не строку внутри хелпера. Всегда используйте в хелперах.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<strong>Конвенция именования:</strong> <code>TestИмяФункции_Сценарий</code>. Например: <code>TestAdd_NegativeNumbers</code>, <code>TestParse_InvalidInput</code>, <code>TestGetUser_NotFound</code>. Подчёркивание разделяет функцию и сценарий — это не обязательно, но общепринято.'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: '<strong>Кэширование тестов:</strong> Go кэширует результаты успешных тестов. Если код не изменился — тест не запустится повторно (выведет <code>(cached)</code>). Используйте <code>-count=1</code> для принудительного запуска или <code>go clean -testcache</code> для очистки кэша.'
        },
        {
            type: 'editor',
            title: 'Практика: тесты с подтестами',
            instructions: 'Напишите тест функции Max(a, b int) int с тремя подтестами через t.Run: когда a > b, когда a < b, когда a == b. Используйте t.Errorf для сообщений об ошибках.',
            starterCode: `package math

import "testing"

func Max(a, b int) int {
    if a > b {
        return a
    }
    return b
}

func TestMax(t *testing.T) {
    // Подтест 1: a больше b
    t.Run("a_greater", func(t *testing.T) {
        // Max(5, 3) должен вернуть 5
    })

    // Подтест 2: a меньше b
    t.Run("b_greater", func(t *testing.T) {
        // Max(2, 7) должен вернуть 7
    })

    // Подтест 3: равные значения
    t.Run("equal", func(t *testing.T) {
        // Max(4, 4) должен вернуть 4
    })
}`,
            hints: [
                'got := Max(5, 3); if got != 5 { t.Errorf("Max(5,3) = %d; want 5", got) }',
                'для b_greater: got := Max(2, 7); if got != 7 { t.Errorf(...) }',
                'для equal: Max(4, 4) должен вернуть 4 — любое из двух равных значений',
                'запуск конкретного подтеста: go test -run TestMax/equal -v'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Как должен называться файл с тестами в Go?',
                    options: [
                        '*_test.go',
                        'test_*.go',
                        '*.test.go',
                        'tests/*.go'
                    ],
                    correct: 0,
                    explanation: 'Конвенция Go: файлы тестов заканчиваются на _test.go. Они компилируются только при запуске go test, не попадают в production binary.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Чем t.Fatal отличается от t.Error?',
                    options: [
                        't.Fatal помечает FAIL и немедленно останавливает тест',
                        't.Fatal выбрасывает panic',
                        't.Fatal отличается только форматированием вывода',
                        'Ничем, это псевдонимы'
                    ],
                    correct: 0,
                    explanation: 't.Error продолжает выполнение теста после фиксации ошибки. t.Fatal вызывает runtime.Goexit() — немедленно завершает текущую горутину теста. Используйте Fatal когда nil-результат сделает дальнейшие проверки бессмысленными или опасными.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Что делает t.Helper()?',
                    options: [
                        'При провале показывает строку вызова хелпера, а не строку внутри него',
                        'Запускает функцию в отдельной горутине',
                        'Пропускает тест если хелпер не реализован',
                        'Создаёт подтест с именем хелпера'
                    ],
                    correct: 0,
                    explanation: 't.Helper() регистрирует функцию как вспомогательную. Когда произойдёт ошибка, в стектрейсе будет показана строка вызова хелпера, а не строка внутри него. Всегда добавляйте в собственные assert-функции.'
                },
                {
                    id: 'q4',
                    type: 'code-fill',
                    question: 'Запустить тесты всех пакетов рекурсивно:',
                    template: 'go test ___',
                    correct: './...',
                    caseSensitive: true,
                    explanation: './... — рекурсивный glob-паттерн в Go. Запускает тесты во всех пакетах текущего модуля.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Для чего нужен TestMain(m *testing.M)?',
                    options: [
                        'Setup/teardown один раз для всех тестов пакета',
                        'Это главный тест проекта, запускается первым',
                        'Запускает тесты в определённом порядке',
                        'Генерирует отчёт о тестировании'
                    ],
                    correct: 0,
                    explanation: 'TestMain — единственный в пакете. Выполняет инициализацию (БД, конфиг), вызывает m.Run() для запуска всех тестов, затем cleanup. os.Exit(code) обязателен в конце.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Какой флаг отключает кэширование результатов тестов?',
                    options: [
                        '-count=1',
                        '-nocache',
                        '-fresh',
                        '-force'
                    ],
                    correct: 0,
                    explanation: 'Go кэширует результаты успешных тестов. -count=1 заставляет запускать тесты каждый раз независимо от изменений. Также помогает go clean -testcache.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Как запустить только подтест "negative" внутри TestAdd?',
                    options: [
                        'go test -run TestAdd/negative',
                        'go test -subtest TestAdd.negative',
                        'go test -name TestAdd:negative',
                        'go test -filter negative'
                    ],
                    correct: 0,
                    explanation: '-run принимает regexp. Формат для подтестов: TestFunctionName/subtestname. Например: go test -run TestAdd/negative -v'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Что делает t.Skip() в тесте?',
                    options: [
                        'Помечает тест как SKIP и прекращает его выполнение',
                        'Пропускает следующую проверку',
                        'Откладывает тест до следующего запуска',
                        'То же что t.Fatal — останавливает тест с ошибкой'
                    ],
                    correct: 0,
                    explanation: 't.Skip() помечает тест статусом SKIP (не FAIL) и завершает его. Используется с testing.Short() для пропуска медленных тестов: if testing.Short() { t.Skip(...) }'
                }
            ]
        }
    ]
};
