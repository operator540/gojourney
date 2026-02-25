export default {
    id: '06-02',
    title: 'Table-driven тесты',
    description: 'Табличные тесты — главный паттерн Go: []struct, t.Run подтесты, параллельные тесты',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
<h2>Рецепт с вариациями</h2>
<p>Представьте шеф-повара, который тестирует рецепт: одно и то же блюдо с разными ингредиентами — солью, сахаром, специями. Он не переписывает весь процесс готовки для каждого варианта. Он меняет только входные параметры и фиксирует результат.</p>
<p>Именно так работает <strong>table-driven подход</strong> — главный паттерн тестирования в Go. Вместо копирования одной и той же логики проверки вы описываете <em>таблицу вариантов</em> и прогоняете их через единый цикл.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:#1e293b">
      <th style="padding:10px;text-align:left;border:1px solid #334155;color:#94a3b8">Без table-driven</th>
      <th style="padding:10px;text-align:left;border:1px solid #334155;color:#94a3b8">С table-driven</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid #334155">TestAdd_Positive, TestAdd_Negative, TestAdd_Zero — 3 функции</td>
      <td style="padding:10px;border:1px solid #334155">Один TestAdd с таблицей из 3 строк</td>
    </tr>
    <tr style="background:#0f172a">
      <td style="padding:10px;border:1px solid #334155">Добавить кейс = копировать функцию</td>
      <td style="padding:10px;border:1px solid #334155">Добавить кейс = добавить строку в таблицу</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid #334155">Логика проверки дублируется</td>
      <td style="padding:10px;border:1px solid #334155">Логика проверки — один раз в цикле</td>
    </tr>
    <tr style="background:#0f172a">
      <td style="padding:10px;border:1px solid #334155">Нет имён у сценариев</td>
      <td style="padding:10px;border:1px solid #334155">Каждый кейс — именованный подтест</td>
    </tr>
  </tbody>
</table>
<p>Table-driven — это не просто стиль кода. Это официально рекомендованный подход в <a href="https://go.dev/wiki/TableDrivenTests" style="color:#38bdf8">Go Wiki</a>.</p>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Классический table-driven тест',
            code: `package math

import "testing"

func Add(a, b int) int { return a + b }

func TestAdd(t *testing.T) {
    // Таблица тест-кейсов — анонимная структура
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive numbers",  2,       3,       5},
        {"negative numbers",  -1,      -2,      -3},
        {"mixed signs",       -1,      5,       4},
        {"zeros",             0,       0,       0},
        {"large numbers",     1000000, 2000000, 3000000},
        {"one zero",          5,       0,       5},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := Add(tt.a, tt.b)
            if got != tt.expected {
                t.Errorf("Add(%d, %d) = %d; want %d",
                    tt.a, tt.b, got, tt.expected)
            }
        })
    }
}`,
            explanation: 'Слайс анонимных структур — таблица. tt (table test) — конвенция для переменной текущего кейса. t.Run создаёт именованные подтесты. Добавить новый кейс = одна строка в таблице.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<strong>Конвенция именования переменной:</strong> <code>tt</code> (table test) — самое распространённое имя для текущего кейса в цикле. Также встречается <code>tc</code> (test case). Важно единообразие в проекте, а не конкретное имя.'
        },
        {
            type: 'theory',
            content: `
<h2>Тестирование ошибок и граничных случаев</h2>
<p>Table-driven особенно хорош когда функция возвращает ошибку. Поле <code>wantErr</code> в таблице явно документирует: этот кейс должен вернуть ошибку, тот — нет. Это читается как спецификация функции.</p>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Тест функции с ошибками',
            code: `package validator

import (
    "errors"
    "testing"
)

var (
    ErrTooShort = errors.New("password too short")
    ErrNoDigit  = errors.New("password must contain a digit")
)

func ValidatePassword(pwd string) error {
    if len(pwd) < 8 {
        return ErrTooShort
    }
    for _, ch := range pwd {
        if ch >= '0' && ch <= '9' {
            return nil
        }
    }
    return ErrNoDigit
}

func TestValidatePassword(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        wantErr error // nil означает успех
    }{
        {"valid password",           "mypass123",  nil},
        {"too short",                "abc1",        ErrTooShort},
        {"no digit",                 "abcdefgh",    ErrNoDigit},
        {"minimum length with digit","abcdefg1",    nil},
        {"empty string",             "",            ErrTooShort},
        {"only digits",              "12345678",    nil},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidatePassword(tt.input)
            if !errors.Is(err, tt.wantErr) {
                t.Errorf("ValidatePassword(%q) = %v; want %v",
                    tt.input, err, tt.wantErr)
            }
        })
    }
}`,
            explanation: 'errors.Is — правильный способ сравнивать ошибки. Поле wantErr = nil означает ожидание успеха. Таблица из 6 строк покрывает все ветви функции.'
        },
        {
            type: 'theory',
            content: `
<h2>Параллельные подтесты с t.Parallel()</h2>
<p>По умолчанию подтесты выполняются последовательно. Добавьте <code>t.Parallel()</code> — и они запустятся одновременно. Это ускоряет тесты с I/O (сетевые запросы, работа с БД), где большую часть времени тест ждёт ответа.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:#1e293b">
      <th style="padding:10px;text-align:left;border:1px solid #334155;color:#94a3b8">Аспект</th>
      <th style="padding:10px;text-align:left;border:1px solid #334155;color:#94a3b8">Последовательно</th>
      <th style="padding:10px;text-align:left;border:1px solid #334155;color:#94a3b8">Параллельно</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid #334155">Время (3 теста по 100ms)</td>
      <td style="padding:10px;border:1px solid #334155">~300ms</td>
      <td style="padding:10px;border:1px solid #334155">~100ms</td>
    </tr>
    <tr style="background:#0f172a">
      <td style="padding:10px;border:1px solid #334155">Безопасность данных</td>
      <td style="padding:10px;border:1px solid #334155">Нет гонок</td>
      <td style="padding:10px;border:1px solid #334155">Нужна осторожность</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid #334155">Когда использовать</td>
      <td style="padding:10px;border:1px solid #334155">Всегда по умолчанию</td>
      <td style="padding:10px;border:1px solid #334155">Тесты с сетью, БД, I/O</td>
    </tr>
  </tbody>
</table>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Параллельные table-driven тесты',
            code: `package api_test

import "testing"

func TestFetchUser(t *testing.T) {
    tests := []struct {
        name   string
        userID int
        want   string
    }{
        {"user 1", 1, "Alice"},
        {"user 2", 2, "Bob"},
        {"user 3", 3, "Charlie"},
    }

    for _, tt := range tests {
        // Go 1.22+: переменная range создаётся заново на каждой итерации
        // Go < 1.22: нужно tt := tt здесь, чтобы захватить копию
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel() // Этот подтест запускается параллельно

            // Имитация HTTP запроса (медленная операция)
            user := fetchUserFromAPI(tt.userID)
            if user.Name != tt.want {
                t.Errorf("fetchUser(%d).Name = %q; want %q",
                    tt.userID, user.Name, tt.want)
            }
        })
    }
}

// Запуск с ограничением параллельности:
// go test -parallel 4 ./...`,
            explanation: 't.Parallel() вызывается в начале подтеста. Внешний TestFetchUser ждёт завершения всех параллельных подтестов. Флаг -parallel N контролирует максимальное количество одновременных тестов.'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: '<strong>Go < 1.22 и замыкания:</strong> В Go до версии 1.22 переменная цикла <code>tt</code> разделялась между итерациями. При использовании t.Parallel() к моменту запуска подтеста <code>tt</code> уже могла указывать на последний элемент. Решение: добавьте <code>tt := tt</code> перед t.Run. С Go 1.22 эта проблема устранена — каждая итерация получает свою копию переменной.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Расширенная таблица: несколько возвращаемых значений',
            code: `package calc_test

import (
    "errors"
    "testing"
)

func Divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

func TestDivide(t *testing.T) {
    tests := []struct {
        name    string
        a, b    float64
        want    float64
        wantErr bool
    }{
        {"10 / 2",     10, 2,  5.0,  false},
        {"divide zero","0, 5",  0.0, 0, false}, // намеренно неверно для демо
        {"by zero",    5,  0,  0,    true},
        {"-10 / 2",   -10, 2, -5.0,  false},
        {"1 / 3",      1,  3,  0.333, false},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := Divide(tt.a, tt.b)

            if (err != nil) != tt.wantErr {
                t.Errorf("Divide(%g, %g) error = %v; wantErr = %v",
                    tt.a, tt.b, err, tt.wantErr)
                return // выходим если ошибка неожиданная
            }

            if !tt.wantErr {
                const epsilon = 0.001
                if diff := got - tt.want; diff > epsilon || diff < -epsilon {
                    t.Errorf("Divide(%g, %g) = %g; want %g",
                        tt.a, tt.b, got, tt.want)
                }
            }
        })
    }
}`,
            explanation: 'wantErr bool — стандартный паттерн для тестов с ошибками. return после проверки ошибки — если ошибка неожиданна, не проверяем значение. Epsilon для float сравнений.'
        },
        {
            type: 'editor',
            title: 'Практика: table-driven тест',
            instructions: 'Напишите table-driven тест для функции IsEven(n int) bool. Создайте минимум 6 кейсов: чётные положительные, нечётные положительные, ноль, отрицательные чётные, отрицательные нечётные. Используйте t.Run.',
            starterCode: `package math

import "testing"

func IsEven(n int) bool {
    return n%2 == 0
}

func TestIsEven(t *testing.T) {
    tests := []struct {
        name     string
        input    int
        expected bool
    }{
        // Добавьте 6+ кейсов
        // {"zero", 0, true},
        // ...
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Ваш код здесь: вызовите IsEven и сравните с expected
        })
    }
}`,
            hints: [
                '{"zero", 0, true}, {"positive even", 4, true}, {"positive odd", 3, false}',
                '{"negative even", -6, true}, {"negative odd", -7, false}, {"large even", 1000, true}',
                'got := IsEven(tt.input)',
                'if got != tt.expected { t.Errorf("IsEven(%d) = %v; want %v", tt.input, got, tt.expected) }'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что такое table-driven тест в Go?',
                    options: [
                        'Слайс структур с тест-кейсами + цикл с t.Run',
                        'Тест, читающий данные из SQL-таблицы',
                        'Тест с CSV-файлом в качестве входных данных',
                        'Автоматически сгенерированный тест'
                    ],
                    correct: 0,
                    explanation: 'Table-driven = []struct с полями name/input/want + for range + t.Run. Официально рекомендованный паттерн в Go Wiki.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Какое имя переменной принято для текущего тест-кейса в цикле?',
                    options: [
                        'tt (table test)',
                        'test',
                        'item',
                        'case'
                    ],
                    correct: 0,
                    explanation: 'tt — самое распространённое имя. tc (test case) тоже используется. Главное — единообразие в проекте.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Что делает t.Parallel() в подтесте?',
                    options: [
                        'Подтест запускается параллельно с другими параллельными подтестами',
                        'Тест запускается дважды для проверки стабильности',
                        'Тест пропускается если уже выполняется параллельный тест',
                        'Тест запускается в отдельном процессе'
                    ],
                    correct: 0,
                    explanation: 't.Parallel() позволяет подтесту работать одновременно с другими параллельными тестами. Ускоряет тесты с I/O.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Почему в Go < 1.22 нужна строка "tt := tt" перед t.Run с t.Parallel()?',
                    options: [
                        'Переменная цикла разделялась итерациями, к моменту запуска указывала на последний элемент',
                        'tt — зарезервированное слово, нужно переименование',
                        'Для ускорения копированием переменной в стек',
                        'Требование компилятора для параллельных тестов'
                    ],
                    correct: 0,
                    explanation: 'В Go < 1.22 переменная range-цикла была одна на весь цикл. При параллельном запуске все подтесты закрывались над одной переменной. tt := tt создавала новую переменную на каждой итерации. В Go 1.22 исправлено.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Каким инструментом корректно сравниваются ошибки в table-driven тестах?',
                    options: [
                        'errors.Is(err, tt.wantErr)',
                        'err == tt.wantErr',
                        'err.Error() == tt.wantErr.Error()',
                        'reflect.DeepEqual(err, tt.wantErr)'
                    ],
                    correct: 0,
                    explanation: 'errors.Is проверяет цепочку ошибок (unwrapping). err == nil для проверки успеха тоже допустим. Сравнение через == не работает для обёрнутых ошибок.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Главное преимущество table-driven тестов:',
                    options: [
                        'Добавить новый сценарий = одна строка в таблице без дублирования кода',
                        'Тесты выполняются быстрее',
                        'Меньше импортов',
                        'Автоматическая генерация тест-кейсов'
                    ],
                    correct: 0,
                    explanation: 'Главный плюс — логика проверки написана один раз в цикле. Новый кейс = новая строка в слайсе. Это устраняет дублирование и делает покрытие очевидным.'
                }
            ]
        }
    ]
};
