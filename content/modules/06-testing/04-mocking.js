export default {
    id: '06-04',
    title: 'Мокинг и dependency injection',
    description: 'Интерфейсы для DI, ручные моки, testify/mock, gomock — тестирование изолированных компонентов',
    estimatedTime: 35,
    xpReward: 30,

    sections: [
        {
            type: 'theory',
            content: `
<h2>Двойник актёра на съёмочной площадке</h2>
<p>В кино опасные сцены снимают с дублёром, а не с настоящим актёром. Дублёр выглядит так же, делает нужные движения, но без реального риска. Тест-дублёр (мок) работает так же: выглядит как реальный сервис, но вместо запроса в БД или API — возвращает заготовленный ответ.</p>
<p>Мокинг решает фундаментальную проблему: как протестировать код, который зависит от внешних систем (база данных, внешний API, файловая система) <strong>без этих систем</strong>?</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2,#1e293b)">
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Без мока</th>
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">С моком</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Нужна реальная БД</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Тест работает без БД</td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)">Тест медленный (сеть, I/O)</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Мгновенный тест</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Нельзя воспроизвести ошибки БД</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Легко симулировать любой сценарий</td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)">Тест проверяет БД + бизнес-логику вместе</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Тест проверяет только бизнес-логику</td>
    </tr>
  </tbody>
</table>
<p><strong>Ключевой принцип:</strong> в Go мокинг возможен только через <strong>интерфейсы</strong>. Нельзя замокать конкретный тип — только интерфейс.</p>`
        },
        {
            type: 'theory',
            content: `
<h2>Dependency Injection через интерфейсы</h2>
<p>DI — это когда компонент не создаёт свои зависимости сам, а получает их снаружи. В Go это реализуется через интерфейсы в конструкторе.</p>
<p>Паттерн прост: определите интерфейс для зависимости → примите интерфейс в конструкторе → в production передайте реальную реализацию, в тестах — мок.</p>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Правильная структура кода для тестируемости',
            code: `package user

import "errors"

// 1. Определяем интерфейс зависимости
type UserRepository interface {
    GetByID(id int) (*User, error)
    Save(user *User) error
    Delete(id int) error
}

type EmailSender interface {
    Send(to, subject, body string) error
}

// 2. Сервис принимает интерфейсы
type UserService struct {
    repo   UserRepository
    mailer EmailSender
}

// 3. Конструктор принимает интерфейсы
func NewUserService(repo UserRepository, mailer EmailSender) *UserService {
    return &UserService{repo: repo, mailer: mailer}
}

// Бизнес-логика
func (s *UserService) DeleteUser(id int) error {
    user, err := s.repo.GetByID(id)
    if err != nil {
        return fmt.Errorf("get user: %w", err)
    }
    if err := s.repo.Delete(id); err != nil {
        return fmt.Errorf("delete user: %w", err)
    }
    // Уведомляем email
    _ = s.mailer.Send(user.Email, "Аккаунт удалён", "Ваш аккаунт был удалён")
    return nil
}

// Production: реальные реализации
// svc := NewUserService(postgresRepo, smtpMailer)

// Test: моки
// svc := NewUserService(mockRepo, mockMailer)`,
            explanation: 'UserService не знает, реальная ли БД или мок. Это позволяет тестировать DeleteUser без базы данных. Интерфейсы определяются на стороне потребителя (UserService), а не провайдера (postgresRepo).'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Ручной мок — когда достаточно простого',
            code: `package user_test

import (
    "testing"
    "errors"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

// Ручной мок — простая структура с нужным поведением
type mockUserRepo struct {
    users     map[int]*User
    deletedID int
    returnErr error
}

func (m *mockUserRepo) GetByID(id int) (*User, error) {
    if m.returnErr != nil {
        return nil, m.returnErr
    }
    user, ok := m.users[id]
    if !ok {
        return nil, errors.New("not found")
    }
    return user, nil
}

func (m *mockUserRepo) Save(user *User) error { return m.returnErr }

func (m *mockUserRepo) Delete(id int) error {
    m.deletedID = id // записываем что было вызвано
    return m.returnErr
}

// Ручной мок для EmailSender
type mockEmailSender struct {
    sentTo   string
    sentSubj string
    callCount int
}

func (m *mockEmailSender) Send(to, subject, body string) error {
    m.sentTo = to
    m.sentSubj = subject
    m.callCount++
    return nil
}

// Тест DeleteUser
func TestUserService_DeleteUser(t *testing.T) {
    t.Run("success", func(t *testing.T) {
        repo := &mockUserRepo{
            users: map[int]*User{
                1: {ID: 1, Email: "alice@example.com"},
            },
        }
        mailer := &mockEmailSender{}
        svc := NewUserService(repo, mailer)

        err := svc.DeleteUser(1)
        require.NoError(t, err)

        assert.Equal(t, 1, repo.deletedID)            // проверяем вызов Delete
        assert.Equal(t, 1, mailer.callCount)           // письмо отправлено
        assert.Equal(t, "alice@example.com", mailer.sentTo)
    })

    t.Run("user not found", func(t *testing.T) {
        repo := &mockUserRepo{returnErr: errors.New("db error")}
        mailer := &mockEmailSender{}
        svc := NewUserService(repo, mailer)

        err := svc.DeleteUser(999)
        assert.Error(t, err)
        assert.Equal(t, 0, mailer.callCount) // письмо НЕ отправлено
    })
}`,
            explanation: 'Ручные моки — это просто структуры реализующие интерфейс. Они пишутся быстро и понятны без знания фреймворков. Хранят информацию о вызовах (deletedID, callCount) для верификации поведения.'
        },
        {
            type: 'theory',
            content: `
<h2>testify/mock — когда нужно больше контроля</h2>
<p>Ручные моки хороши для простых случаев. Но когда метод вызывается много раз с разными аргументами, или нужно проверить точный порядок вызовов — <code>testify/mock</code> эффективнее.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2,#1e293b)">
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">Ручной мок</th>
      <th style="padding:10px;text-align:left;border:1px solid var(--border,#334155);color:var(--accent,#94a3b8)">testify/mock</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Просто, без зависимостей</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Больше возможностей</td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)">Сложно настроить разное поведение при разных вызовах</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">On("Method", args).Return(vals) для каждого кейса</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Нет встроенной проверки "метод вызван N раз"</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">AssertNumberOfCalls, AssertCalled</td>
    </tr>
    <tr style="background:var(--surface-2,#0f172a)">
      <td style="padding:10px;border:1px solid var(--border,#334155)">Пишешь весь мок руками</td>
      <td style="padding:10px;border:1px solid var(--border,#334155)">Генерация через mockery</td>
    </tr>
  </tbody>
</table>`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'testify/mock — полный контроль над вызовами',
            code: `package user_test

import (
    "errors"
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    "github.com/stretchr/testify/require"
)

// MockUserRepository — мок созданный с testify/mock
type MockUserRepository struct {
    mock.Mock // встраиваем
}

func (m *MockUserRepository) GetByID(id int) (*User, error) {
    args := m.Called(id) // регистрируем вызов
    // args.Get(0) — первое return значение
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*User), args.Error(1)
}

func (m *MockUserRepository) Save(user *User) error {
    args := m.Called(user)
    return args.Error(0)
}

func (m *MockUserRepository) Delete(id int) error {
    args := m.Called(id)
    return args.Error(0)
}

// Тесты
func TestUserService_WithTestifyMock(t *testing.T) {
    t.Run("success flow", func(t *testing.T) {
        mockRepo := new(MockUserRepository)
        mockMailer := new(MockEmailSender) // аналогично

        user := &User{ID: 1, Email: "alice@example.com"}

        // Настраиваем ожидания
        mockRepo.On("GetByID", 1).Return(user, nil)
        mockRepo.On("Delete", 1).Return(nil)
        mockMailer.On("Send",
            "alice@example.com",
            mock.AnythingOfType("string"), // любая строка
            mock.Anything,
        ).Return(nil)

        svc := NewUserService(mockRepo, mockMailer)
        err := svc.DeleteUser(1)

        require.NoError(t, err)

        // Проверяем что все ожидания выполнены
        mockRepo.AssertExpectations(t)
        mockMailer.AssertExpectations(t)
    })

    t.Run("repo returns error", func(t *testing.T) {
        mockRepo := new(MockUserRepository)
        mockMailer := new(MockEmailSender)

        mockRepo.On("GetByID", 99).Return(nil, errors.New("not found"))
        // Delete и Send не должны вызываться!

        svc := NewUserService(mockRepo, mockMailer)
        err := svc.DeleteUser(99)

        assert.Error(t, err)
        mockRepo.AssertNotCalled(t, "Delete")
        mockMailer.AssertNotCalled(t, "Send")
        mockRepo.AssertExpectations(t)
    })
}`,
            explanation: 'm.Called(args) регистрирует вызов и возвращает настроенные значения. mock.AnythingOfType и mock.Anything — матчеры для гибкого сопоставления. AssertExpectations проверяет что все On() были вызваны.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<strong>mockery — генератор моков:</strong> <code>go install github.com/vektra/mockery/v2@latest</code>, затем <code>mockery --name=UserRepository --dir=. --output=./mocks</code>. Генерирует готовый мок файл с правильным m.Called() для каждого метода. Экономит время на больших интерфейсах.'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: '<strong>Когда НЕ нужен мок:</strong> не мокайте то, что легко создать (простые структуры, математические функции). Не мокайте стандартную библиотеку — используйте интерфейсы для изоляции своего кода. Чрезмерное мокирование делает тесты хрупкими — они проверяют реализацию, а не поведение.'
        },
        {
            type: 'editor',
            title: 'Практика: напишите ручной мок',
            instructions: 'Напишите ручной мок для интерфейса NotificationSender и тест для OrderService.PlaceOrder. PlaceOrder должен: сохранить заказ в репозитории и отправить уведомление пользователю.',
            starterCode: `package order

import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

type Order struct {
    ID     int
    UserID int
    Amount float64
}

type OrderRepository interface {
    Save(order *Order) (*Order, error)
}

type NotificationSender interface {
    Notify(userID int, message string) error
}

type OrderService struct {
    repo   OrderRepository
    notify NotificationSender
}

func NewOrderService(r OrderRepository, n NotificationSender) *OrderService {
    return &OrderService{repo: r, notify: n}
}

func (s *OrderService) PlaceOrder(userID int, amount float64) (*Order, error) {
    order, err := s.repo.Save(&Order{UserID: userID, Amount: amount})
    if err != nil {
        return nil, err
    }
    s.notify.Notify(userID, "Ваш заказ принят")
    return order, nil
}

// --- Напишите моки здесь ---

// mockOrderRepo реализует OrderRepository
type mockOrderRepo struct {
    // Что нужно хранить?
}

// func (m *mockOrderRepo) Save(order *Order) (*Order, error) { ... }

// mockNotify реализует NotificationSender
type mockNotify struct {
    // Что нужно хранить для проверки вызова?
}

// func (m *mockNotify) Notify(userID int, message string) error { ... }

func TestOrderService_PlaceOrder(t *testing.T) {
    // Создайте моки, создайте сервис, вызовите PlaceOrder
    // Проверьте: нет ошибки, заказ создан, уведомление отправлено
}`,
            hints: [
                'mockOrderRepo: savedOrder *Order, nextID int — для хранения сохранённого заказа',
                'Save: присвоить order.ID = m.nextID, сохранить в m.savedOrder, вернуть order, nil',
                'mockNotify: notifiedUserID int, notifyCount int',
                'assert.Equal(t, userID, mock.notifiedUserID) и assert.Equal(t, 1, mock.notifyCount)'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Почему в Go нельзя замокать конкретный тип (структуру)?',
                    options: [
                        'Go не поддерживает наследование, нельзя переопределить методы конкретного типа',
                        'Конкретные типы слишком быстрые для тестов',
                        'Это ограничение testify/mock',
                        'Конкретные типы автоматически мокируются компилятором'
                    ],
                    correct: 0,
                    explanation: 'В Go нет наследования. Нельзя "подменить" метод конкретного типа. Только интерфейсы позволяют подставить другую реализацию. Это заставляет писать код через интерфейсы — что само по себе хорошая практика.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что такое Dependency Injection в контексте тестирования Go?',
                    options: [
                        'Передача зависимостей (репозиторий, сервис) через конструктор в виде интерфейсов',
                        'Автоматическое создание зависимостей фреймворком',
                        'Внедрение кода в существующие функции',
                        'Импорт зависимостей через go.mod'
                    ],
                    correct: 0,
                    explanation: 'DI в Go: компонент получает зависимости через параметры конструктора (интерфейсы), не создаёт их сам. В production передаём реальные реализации, в тестах — моки.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Что делает m.Called(args) в testify/mock?',
                    options: [
                        'Регистрирует вызов метода и возвращает настроенные через On() значения',
                        'Вызывает оригинальный метод',
                        'Считает количество вызовов метода',
                        'Проверяет что метод вызван с правильными аргументами'
                    ],
                    correct: 0,
                    explanation: 'm.Called(args) — центр testify/mock. Регистрирует вызов с аргументами, находит подходящий On() и возвращает настроенные Return() значения. Без m.Called() мок не работает.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Что делает mockObj.AssertExpectations(t)?',
                    options: [
                        'Проверяет что все ожидания On() были вызваны хотя бы раз',
                        'Проверяет что мок не вызывался вообще',
                        'Сбрасывает счётчик вызовов',
                        'Генерирует отчёт о покрытии'
                    ],
                    correct: 0,
                    explanation: 'AssertExpectations проверяет: все On() методы были вызваны ожидаемое количество раз. Если On("Delete", 1) настроен, но Delete не вызвали — тест упадёт. Всегда вызывайте в конце теста.'
                },
                {
                    id: 'q5',
                    type: 'multiple',
                    question: 'Когда лучше использовать ручной мок вместо testify/mock?',
                    options: [
                        'Простой интерфейс с 1-2 методами',
                        'Метод всегда возвращает одно и то же значение',
                        'Нужно проверить порядок нескольких вызовов с разными аргументами',
                        'Не хочется добавлять зависимость от testify'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'Ручной мок хорош для простых случаев — быстро пишется, без внешних зависимостей. testify/mock нужен когда метод вызывается с разными аргументами, нужна сложная логика матчинга или верификация порядка вызовов.'
                },
                {
                    id: 'q6',
                    type: 'code-fill',
                    question: 'Настроить мок: GetByID(5) возвращает user, nil',
                    template: 'mockRepo.___(\"GetByID\", 5).___(user, nil)',
                    correct: 'On().Return',
                    caseSensitive: true,
                    explanation: 'mockRepo.On("Method", args...).Return(values...) — стандартный паттерн настройки testify/mock. On задаёт ожидаемые аргументы, Return — что вернуть.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Что такое mock.AnythingOfType("string") в testify?',
                    options: [
                        'Матчер: принимает любой аргумент типа string',
                        'Проверяет что аргумент равен строке "string"',
                        'Принимает любое значение любого типа',
                        'Создаёт случайную строку для теста'
                    ],
                    correct: 0,
                    explanation: 'mock.AnythingOfType("string") — матчер, принимает любое значение типа string. mock.Anything принимает любое значение любого типа. Полезно когда точное значение аргумента не важно.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Где в Go-проекте принято определять интерфейсы для DI?',
                    options: [
                        'На стороне потребителя (в пакете, который использует зависимость)',
                        'В отдельном пакете interfaces/',
                        'В пакете провайдера (реализации)',
                        'В файле main.go'
                    ],
                    correct: 0,
                    explanation: 'Go-принцип: интерфейсы определяются там, где они используются. UserService определяет UserRepository интерфейс — не в пакете postgres. Это позволяет использовать разные реализации без изменения интерфейса.'
                }
            ]
        }
    ]
};
