export default {
    id: '12-06',
    title: 'Dependency Inversion Principle',
    description: 'Зависеть от абстракций, не от конкреций. DIP — основа тестируемого и гибкого кода. Связь с Dependency Injection.',
    estimatedTime: 18,
    xpReward: 18,
    sections: [
        {
            type: 'theory',
            content: `
<h2>D — Dependency Inversion Principle</h2>
<p>DIP состоит из двух правил:</p>
<ol>
    <li><strong>Модули высокого уровня</strong> не должны зависеть от модулей низкого уровня. Оба должны зависеть от абстракций.</li>
    <li><strong>Абстракции</strong> не должны зависеть от деталей. Детали должны зависеть от абстракций.</li>
</ol>
<p>Проще: <code>OrderService</code> (бизнес-логика) не должен знать, что данные хранятся в MySQL, PostgreSQL или файле. Он работает с интерфейсом <code>OrderRepository</code>.</p>
`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Плохо: прямая зависимость от реализации',
            code: `package main

import (
    "database/sql"
    "fmt"
)

// Конкретная реализация — PostgreSQL
type MySQLOrderRepository struct {
    db *sql.DB
}

func (r *MySQLOrderRepository) FindByID(id int) (string, error) {
    var order string
    err := r.db.QueryRow("SELECT name FROM orders WHERE id=?", id).Scan(&order)
    return order, err
}

// OrderService ЖЁСТКО зависит от MySQLOrderRepository
// Нарушение DIP: модуль высокого уровня зависит от деталей
type OrderService struct {
    repo *MySQLOrderRepository // конкретный тип!
}

func NewOrderService(db *sql.DB) *OrderService {
    return &OrderService{
        repo: &MySQLOrderRepository{db: db},
    }
}

func (s *OrderService) GetOrder(id int) (string, error) {
    return s.repo.FindByID(id)
}

// Проблемы:
// 1. Нельзя заменить MySQL на PostgreSQL без изменения OrderService
// 2. Нельзя написать unit-тест без реальной БД
// 3. OrderService знает о деталях хранилища`,
            explanation: 'OrderService создаёт MySQLOrderRepository сам — он жёстко привязан к MySQL. Захочешь сменить БД или написать тест — придётся менять OrderService.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Хорошо: зависим от интерфейса',
            code: `package main

import (
    "database/sql"
    "fmt"
)

// Абстракция — интерфейс (определяем на стороне потребителя!)
type OrderRepository interface {
    FindByID(id int) (*Order, error)
    Save(o *Order) error
    Delete(id int) error
}

type Order struct {
    ID   int
    Name string
}

// Деталь реализации — PostgreSQL
type PostgreSQLOrderRepository struct {
    db *sql.DB
}

func (r *PostgreSQLOrderRepository) FindByID(id int) (*Order, error) {
    o := &Order{}
    err := r.db.QueryRow("SELECT id, name FROM orders WHERE id=$1", id).
        Scan(&o.ID, &o.Name)
    return o, err
}

func (r *PostgreSQLOrderRepository) Save(o *Order) error {
    _, err := r.db.Exec("INSERT INTO orders (name) VALUES ($1)", o.Name)
    return err
}

func (r *PostgreSQLOrderRepository) Delete(id int) error {
    _, err := r.db.Exec("DELETE FROM orders WHERE id=$1", id)
    return err
}

// OrderService зависит от ИНТЕРФЕЙСА, не от PostgreSQL
type OrderService struct {
    repo OrderRepository // интерфейс!
}

// Dependency Injection через конструктор
func NewOrderService(repo OrderRepository) *OrderService {
    return &OrderService{repo: repo}
}

func (s *OrderService) GetOrder(id int) (*Order, error) {
    return s.repo.FindByID(id)
}

func (s *OrderService) CreateOrder(name string) error {
    o := &Order{Name: name}
    return s.repo.Save(o)
}

// --- Для тестов ---

// MockOrderRepository — in-memory реализация для тестов
type MockOrderRepository struct {
    orders map[int]*Order
}

func NewMockRepo() *MockOrderRepository {
    return &MockOrderRepository{orders: make(map[int]*Order)}
}

func (m *MockOrderRepository) FindByID(id int) (*Order, error) {
    if o, ok := m.orders[id]; ok {
        return o, nil
    }
    return nil, fmt.Errorf("not found")
}

func (m *MockOrderRepository) Save(o *Order) error {
    m.orders[o.ID] = o
    return nil
}

func (m *MockOrderRepository) Delete(id int) error {
    delete(m.orders, id)
    return nil
}

func main() {
    // Продакшн: реальная БД
    // db, _ := sql.Open("postgres", "...")
    // svc := NewOrderService(&PostgreSQLOrderRepository{db: db})

    // Тест: мок-репозиторий, БД не нужна
    mockRepo := NewMockRepo()
    mockRepo.orders[1] = &Order{ID: 1, Name: "Заказ #1"}

    svc := NewOrderService(mockRepo) // DI в действии
    order, err := svc.GetOrder(1)
    if err != nil {
        fmt.Println("Ошибка:", err)
        return
    }
    fmt.Println("Заказ:", order.Name)
}`,
            explanation: 'OrderService не знает о PostgreSQL. Можно подключить любую реализацию OrderRepository: PostgreSQL, MySQL, Redis, in-memory мок для тестов — без изменения OrderService.'
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph LR
    subgraph "Высокий уровень"
        OS[OrderService]
    end
    subgraph "Абстракция"
        OR[OrderRepository<br/>interface]
    end
    subgraph "Детали реализации"
        PG[PostgreSQLRepo]
        MK[MockRepo]
        MY[MySQLRepo]
    end
    OS -->|зависит от| OR
    PG -->|реализует| OR
    MK -->|реализует| OR
    MY -->|реализует| OR`,
            caption: 'DIP: OrderService зависит от интерфейса. Реализации зависят от интерфейса. Стрелки "инвертированы" относительно прямой зависимости.'
        },
        {
            type: 'info-box',
            variant: 'important',
            content: '<p><strong>DIP != DI.</strong> Dependency Inversion Principle — это принцип проектирования. Dependency Injection (DI) — паттерн его реализации. DI через конструктор — самый Go-идиоматичный способ.</p>'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q12-06-1',
                    type: 'single',
                    question: 'Где в Go-коде должен быть объявлен интерфейс согласно DIP?',
                    options: [
                        'В пакете, который его реализует (например, в пакете database)',
                        'В отдельном пакете interfaces/',
                        'На стороне потребителя — в пакете, который его использует',
                        'В файле main.go'
                    ],
                    correct: 2,
                    explanation: 'В Go интерфейс лучше определять на стороне потребителя. OrderService определяет нужный ему интерфейс OrderRepository — не пакет БД.'
                },
                {
                    id: 'q12-06-2',
                    type: 'single',
                    question: 'Какой главный практический бонус DIP?',
                    options: [
                        'Код работает быстрее',
                        'Можно писать unit-тесты без реальных зависимостей (БД, HTTP, файлы)',
                        'Меньше строк кода',
                        'Автоматическая документация'
                    ],
                    correct: 1,
                    explanation: 'DIP позволяет подменять реализации через интерфейс. В тестах используем мок-репозиторий вместо реальной БД — тесты быстрые, изолированные, надёжные.'
                },
                {
                    id: 'q12-06-3',
                    type: 'multiple',
                    question: 'Что такое Dependency Injection (DI)?',
                    options: [
                        'Зависимости передаются извне, а не создаются внутри',
                        'Конструктор принимает интерфейсы вместо конкретных типов',
                        'Использование глобальных переменных для зависимостей',
                        'Паттерн реализации DIP',
                        'Инструмент для автогенерации кода'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'DI — передача зависимостей снаружи (через конструктор, параметры). Это реализация DIP. Глобальные переменные — антипаттерн, противоположность DI.'
                }
            ]
        }
    ]
};
