export default {
    id: '06-03',
    title: 'Testify — удобные утверждения',
    description: 'assert vs require, Equal/NotNil/Contains/Error, suite, testify/mock — почему весь Go-мир использует testify',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
<h2>Судебный пристав vs Детектив</h2>
<p>Стандартный <code>testing</code> — как детектив: он фиксирует все улики и продолжает расследование даже после нахождения серьёзной проблемы. Хорошо для независимых проверок. Но когда нужно немедленно остановить всё при критической ошибке — нужен судебный пристав. Testify даёт оба режима с читаемым синтаксисом.</p>
<p>Testify — самая популярная библиотека тестирования в экосистеме Go. Она не заменяет <code>testing</code>, а надстраивается над ним, предоставляя:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2,#1e293b)">
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Стандартный testing</th>
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Testify</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>if got != want { t.Errorf(...) }</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>assert.Equal(t, want, got)</code></td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)">Ручное сравнение ошибок</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>assert.NoError(t, err)</code></td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Нет удобного сравнения структур</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>assert.Equal</code> с глубоким сравнением</td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)">Нет моков из коробки</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Пакет <code>testify/mock</code></td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Нет test suite</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Пакет <code>testify/suite</code> с Setup/Teardown</td>
    </tr>
  </tbody>
</table>
<p>Установка: <code>go get github.com/stretchr/testify</code></p>
<p>Testify состоит из 4 пакетов: <code>assert</code>, <code>require</code>, <code>mock</code>, <code>suite</code>. Каждый решает свою задачу.</p>`
        },
        {
            type: 'theory',
            content: `
<h2>assert vs require: продолжать или стоп</h2>
<p>Главное различие — поведение после провала утверждения:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2,#1e293b)">
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Пакет</th>
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">При провале</th>
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Аналог в testing</th>
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Когда</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>assert</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Фиксирует FAIL, тест продолжается</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>t.Errorf</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Независимые проверки</td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>require</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Фиксирует FAIL, тест стоп</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>t.Fatalf</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Предусловия, nil-защита</td>
    </tr>
  </tbody>
</table>
<p><strong>Практическое правило:</strong> используйте <code>require</code> для первой проверки (получили ли объект/ошибку), затем <code>assert</code> для деталей.</p>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'assert vs require на практике',
            code: `package user_test

import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestGetUser(t *testing.T) {
    user, err := GetUser(42)

    // require: если ошибка — user == nil, дальше будет паника
    // тест немедленно останавливается
    require.NoError(t, err)
    require.NotNil(t, user)

    // assert: все эти проверки независимы
    // все три провала будут видны в отчёте
    assert.Equal(t, 42, user.ID)
    assert.Equal(t, "Alice", user.Name)
    assert.NotEmpty(t, user.Email)
}

func TestCreateUser_Validation(t *testing.T) {
    err := CreateUser("")

    // require.Error: тест не имеет смысла если err == nil
    require.Error(t, err)

    // Теперь можно проверять детали ошибки
    assert.Contains(t, err.Error(), "name")
    assert.ErrorIs(t, err, ErrValidation)
}`,
            explanation: 'require.NoError + require.NotNil защищают от паники при nil. assert.Equal с глубоким сравнением работает для структур, слайсов, мап. assert.Contains ищет подстроку или элемент в коллекции.'
        },
        {
            type: 'theory',
            content: `
<h2>Ключевые функции testify/assert</h2>
<p>Testify предоставляет более 60 функций-утверждений. Вот самые важные:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2,#1e293b)">
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Функция</th>
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Проверяет</th>
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Пример</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>Equal(t, want, got)</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Глубокое равенство</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>assert.Equal(t, user, got)</code></td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>NotEqual(t, a, b)</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Не равны</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>assert.NotEqual(t, 0, id)</code></td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>Nil(t, obj)</code> / <code>NotNil</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">nil / не nil</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>assert.NotNil(t, result)</code></td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>Error(t, err)</code> / <code>NoError</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Ошибка / нет ошибки</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>assert.NoError(t, err)</code></td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>ErrorIs(t, err, target)</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">errors.Is проверка</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>assert.ErrorIs(t, err, ErrNotFound)</code></td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>Contains(t, s, sub)</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Подстрока / элемент</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>assert.Contains(t, list, item)</code></td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>Len(t, obj, n)</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Длина коллекции</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>assert.Len(t, users, 3)</code></td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>True(t, cond)</code> / <code>False</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Булево значение</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>assert.True(t, isValid)</code></td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>WithinDuration</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Время в диапазоне</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>assert.WithinDuration(t, want, got, time.Second)</code></td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>Panics(t, func)</code></td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Функция паникует</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)"><code>assert.Panics(t, func() { divide(1,0) })</code></td>
    </tr>
  </tbody>
</table>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Богатый набор утверждений testify',
            code: `package store_test

import (
    "testing"
    "time"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

type User struct {
    ID        int
    Name      string
    Email     string
    CreatedAt time.Time
    Tags      []string
}

func TestUserOperations(t *testing.T) {
    store := NewUserStore()

    // Создание
    created, err := store.Create(User{Name: "Alice", Email: "alice@example.com"})
    require.NoError(t, err)

    // Числовые проверки
    assert.NotEqual(t, 0, created.ID)        // ID присвоен
    assert.Greater(t, created.ID, 0)         // Положительный

    // Строковые проверки
    assert.Equal(t, "Alice", created.Name)
    assert.Contains(t, created.Email, "@")
    assert.NotEmpty(t, created.Email)

    // Временные проверки
    assert.WithinDuration(t, time.Now(), created.CreatedAt, time.Second)

    // Добавляем тег и проверяем коллекцию
    err = store.AddTag(created.ID, "admin")
    require.NoError(t, err)

    updated, err := store.Get(created.ID)
    require.NoError(t, err)

    assert.Len(t, updated.Tags, 1)
    assert.Contains(t, updated.Tags, "admin")

    // Удаление и проверка отсутствия
    err = store.Delete(created.ID)
    require.NoError(t, err)

    _, err = store.Get(created.ID)
    assert.ErrorIs(t, err, ErrNotFound)
}`,
            explanation: 'assert.Greater, assert.Len, assert.Contains работают с любыми совместимыми типами. assert.WithinDuration — для проверки временных меток без точного совпадения. Читается как спецификация.'
        },
        {
            type: 'theory',
            content: `
<h2>Test Suite — структурированные наборы тестов</h2>
<p>Представьте тест как экзамен в школе. У каждого класса (suite) есть подготовка перед экзаменом (SetupSuite), настройка перед каждым вопросом (SetupTest), сам вопрос (Test*), и уборка после (TearDownTest, TearDownSuite).</p>
<p><code>testify/suite</code> реализует именно этот паттерн. Особенно полезен когда тестам нужны разделяемые ресурсы: база данных, HTTP-сервер, временные файлы.</p>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'testify/suite — организованные тесты с lifecycle',
            code: `package user_test

import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
    "github.com/stretchr/testify/suite"
)

// UserServiceSuite — набор тестов для UserService
type UserServiceSuite struct {
    suite.Suite          // встраиваем Suite
    service *UserService // разделяемый ресурс
    db      *TestDB
}

// SetupSuite — один раз перед всеми тестами набора
func (s *UserServiceSuite) SetupSuite() {
    s.db = NewTestDB()
    s.service = NewUserService(s.db)
}

// TearDownSuite — один раз после всех тестов
func (s *UserServiceSuite) TearDownSuite() {
    s.db.Close()
}

// SetupTest — перед каждым тестом
func (s *UserServiceSuite) SetupTest() {
    s.db.Truncate("users") // чистим таблицу
}

// Тесты — методы начинающиеся с Test
func (s *UserServiceSuite) TestCreateUser() {
    user, err := s.service.Create("Alice", "alice@example.com")
    s.Require().NoError(err)
    s.Assert().Equal("Alice", user.Name)
    s.Assert().NotZero(user.ID)
}

func (s *UserServiceSuite) TestCreateUser_DuplicateEmail() {
    _, err := s.service.Create("Alice", "alice@example.com")
    s.Require().NoError(err)

    _, err = s.service.Create("Bob", "alice@example.com")
    s.Assert().Error(err)
    s.Assert().ErrorIs(err, ErrDuplicateEmail)
}

func (s *UserServiceSuite) TestGetUser_NotFound() {
    _, err := s.service.Get(999)
    s.Assert().ErrorIs(err, ErrNotFound)
}

// Точка входа — обязательна
func TestUserService(t *testing.T) {
    suite.Run(t, new(UserServiceSuite))
}`,
            explanation: 's.Require() и s.Assert() — это require и assert привязанные к текущему тесту. SetupTest чистит БД перед каждым тестом — тесты изолированы. suite.Run запускает все Test* методы.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<strong>Порядок lifecycle в suite:</strong> SetupSuite → (SetupTest → TestXxx → TearDownTest) × N → TearDownSuite. TearDownTest вызывается даже если тест упал. Это гарантирует очистку ресурсов.'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: '<strong>Порядок аргументов в assert.Equal:</strong> <code>assert.Equal(t, <strong>want</strong>, got)</code> — сначала ожидаемое, потом фактическое. Это важно для читаемости сообщений об ошибках: "expected: 5, actual: 3" vs "expected: 3, actual: 5". Testify следует этому соглашению везде.'
        },
        {
            type: 'editor',
            title: 'Практика: перепишите тест на testify',
            instructions: 'Перепишите тест функции ParseAge используя testify. Функция ParseAge(s string) (int, error) возвращает возраст если он от 0 до 150, иначе ошибку. Используйте require для ошибки парсинга, assert для остальных проверок.',
            starterCode: `package user

import (
    "errors"
    "strconv"
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

var ErrInvalidAge = errors.New("invalid age")

func ParseAge(s string) (int, error) {
    n, err := strconv.Atoi(s)
    if err != nil {
        return 0, ErrInvalidAge
    }
    if n < 0 || n > 150 {
        return 0, ErrInvalidAge
    }
    return n, nil
}

func TestParseAge(t *testing.T) {
    // Кейс 1: валидный возраст "25"
    age, err := ParseAge("25")
    // require: если ошибка — дальше бессмысленно
    // assert: проверить что age == 25

    // Кейс 2: невалидная строка "abc"
    _, err = ParseAge("abc")
    // assert что err != nil
    // assert что err это ErrInvalidAge

    // Кейс 3: возраст за пределами "200"
    _, err = ParseAge("200")
    // assert.ErrorIs для ErrInvalidAge
}`,
            hints: [
                'require.NoError(t, err) — первая проверка, останавливает при ошибке',
                'assert.Equal(t, 25, age) — проверка значения',
                'assert.Error(t, err) и assert.ErrorIs(t, err, ErrInvalidAge)',
                'для кейса 3: assert.ErrorIs(t, err, ErrInvalidAge)'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Чем отличается assert от require в testify?',
                    options: [
                        'assert продолжает тест после провала, require — останавливает',
                        'require строже проверяет типы, assert использует interface{}',
                        'assert только для значений, require только для ошибок',
                        'Нет разницы, это псевдонимы'
                    ],
                    correct: 0,
                    explanation: 'assert = t.Errorf (тест продолжается). require = t.Fatalf (тест стоп). Используйте require для nil-защиты и предусловий, assert для независимых проверок.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Правильный порядок аргументов в assert.Equal?',
                    options: [
                        'assert.Equal(t, want, got)',
                        'assert.Equal(t, got, want)',
                        'assert.Equal(got, want, t)',
                        'assert.Equal(t, got)'
                    ],
                    correct: 0,
                    explanation: 'Соглашение testify: сначала t, потом ожидаемое (want), потом фактическое (got). Это влияет на читаемость сообщения об ошибке: "expected: X, actual: Y".'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Какая функция testify аналогична errors.Is?',
                    options: [
                        'assert.ErrorIs(t, err, target)',
                        'assert.EqualError(t, err, target)',
                        'assert.IsError(t, err, target)',
                        'assert.SameError(t, err, target)'
                    ],
                    correct: 0,
                    explanation: 'assert.ErrorIs использует errors.Is внутри, поддерживает unwrapping цепочки ошибок. assert.EqualError сравнивает строковое представление ошибки — менее надёжно.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Что делает SetupTest в testify/suite?',
                    options: [
                        'Вызывается перед каждым тестом набора',
                        'Вызывается один раз перед всем набором',
                        'Настраивает конфигурацию suite',
                        'Регистрирует тест в глобальном реестре'
                    ],
                    correct: 0,
                    explanation: 'SetupTest выполняется перед каждым Test* методом. Идеально для сброса состояния (очистка БД, сброс моков). SetupSuite — один раз перед всем набором.'
                },
                {
                    id: 'q5',
                    type: 'code-fill',
                    question: 'Проверить что слайс users содержит 3 элемента:',
                    template: 'assert.___(t, users, 3)',
                    correct: 'Len',
                    caseSensitive: true,
                    explanation: 'assert.Len работает со слайсами, мапами, строками, каналами — всем что имеет длину. Выводит понятное сообщение: "expected length: 3, but got: 2".'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Как запустить testify suite в стандартном go test?',
                    options: [
                        'func TestMyService(t *testing.T) { suite.Run(t, new(MyServiceSuite)) }',
                        'func TestMyService(t *testing.T) { MyServiceSuite.Run() }',
                        'suite.Register(new(MyServiceSuite))',
                        'go test -suite MyServiceSuite'
                    ],
                    correct: 0,
                    explanation: 'suite.Run(t, new(MySuite)) — обязательная обёртка. Это стандартная TestXxx функция, которую находит go test. Внутри suite.Run запускает все методы начинающиеся с Test.'
                },
                {
                    id: 'q7',
                    type: 'multiple',
                    question: 'Какие утверждения testify корректно проверяют ошибку?',
                    options: [
                        'assert.Error(t, err)',
                        'assert.ErrorIs(t, err, ErrNotFound)',
                        'assert.NoError(t, err)',
                        'assert.EqualError(t, err, "not found")'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'assert.Error — ошибка не nil. assert.ErrorIs — конкретный тип через errors.Is. assert.EqualError — строка ошибки. assert.NoError проверяет ОТСУТСТВИЕ ошибки.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Что проверяет assert.Contains(t, "hello world", "world")?',
                    options: [
                        'Что строка "hello world" содержит подстроку "world"',
                        'Что слайс содержит элемент',
                        'Оба: работает и со строками, и с коллекциями',
                        'Что "world" содержит "hello world"'
                    ],
                    correct: 2,
                    explanation: 'assert.Contains универсален: строка содержит подстроку, слайс содержит элемент, мапа содержит ключ. Один метод для разных типов.'
                }
            ]
        }
    ]
};
