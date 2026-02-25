export default {
    id: '12-03',
    title: 'Open/Closed Principle',
    description: 'Программные сущности должны быть открыты для расширения, но закрыты для изменения. Интерфейсы — главный инструмент OCP в Go.',
    estimatedTime: 15,
    xpReward: 15,
    sections: [
        {
            type: 'theory',
            content: `
<h2>O — Open/Closed Principle</h2>
<p><em>"Программный модуль должен быть открыт для расширения и закрыт для модификации."</em></p>
<p>Это значит: добавление нового функционала не должно требовать изменения существующего кода. В Go это достигается через интерфейсы.</p>
<p>Нарушение OCP легко распознать по <code>switch</code> или <code>if/else</code> по типу объекта — каждый новый тип требует изменения существующей функции.</p>
`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Плохо: switch нарушает OCP',
            code: `package main

import "fmt"

type CustomerType string

const (
    Regular  CustomerType = "regular"
    Premium  CustomerType = "premium"
    VIP      CustomerType = "vip"
)

type Customer struct {
    Name  string
    Type  CustomerType
}

// Каждый новый тип клиента требует ИЗМЕНЕНИЯ этой функции
// Это нарушение OCP
func CalculateDiscount(c Customer, price float64) float64 {
    switch c.Type {
    case Regular:
        return price * 0.0  // без скидки
    case Premium:
        return price * 0.1  // 10%
    case VIP:
        return price * 0.2  // 20%
    // Хочешь добавить SuperVIP? Придётся менять эту функцию!
    default:
        return 0
    }
}

func main() {
    c := Customer{Name: "Иван", Type: Premium}
    fmt.Printf("Скидка: %.2f руб.\\n", CalculateDiscount(c, 1000))
}`,
            explanation: 'При добавлении нового типа клиента (SuperVIP, Corporate) нужно менять CalculateDiscount. Каждое изменение — риск сломать существующую логику.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Хорошо: интерфейс Discounter',
            code: `package main

import "fmt"

// Интерфейс закрыт для изменения
type Discounter interface {
    Discount(price float64) float64
    Name() string
}

// Новые типы добавляем, не трогая существующий код

type RegularCustomer struct{ name string }

func (r *RegularCustomer) Discount(price float64) float64 { return 0 }
func (r *RegularCustomer) Name() string                   { return r.name }

type PremiumCustomer struct{ name string }

func (p *PremiumCustomer) Discount(price float64) float64 { return price * 0.1 }
func (p *PremiumCustomer) Name() string                   { return p.name }

type VIPCustomer struct{ name string }

func (v *VIPCustomer) Discount(price float64) float64 { return price * 0.2 }
func (v *VIPCustomer) Name() string                   { return v.name }

// SuperVIP добавляем БЕЗ изменения существующего кода
type SuperVIPCustomer struct{ name string }

func (s *SuperVIPCustomer) Discount(price float64) float64 { return price * 0.35 }
func (s *SuperVIPCustomer) Name() string                   { return s.name }

// CalculateDiscount не меняется при добавлении новых типов
func CalculateDiscount(d Discounter, price float64) float64 {
    discount := d.Discount(price)
    fmt.Printf("%s получает скидку %.2f руб.\\n", d.Name(), discount)
    return price - discount
}

func main() {
    customers := []Discounter{
        &RegularCustomer{name: "Алексей"},
        &PremiumCustomer{name: "Мария"},
        &VIPCustomer{name: "Пётр"},
        &SuperVIPCustomer{name: "Директор"},
    }

    for _, c := range customers {
        final := CalculateDiscount(c, 1000)
        fmt.Printf("Итого: %.2f руб.\\n\\n", final)
    }
}`,
            explanation: 'CalculateDiscount больше никогда не изменится при добавлении новых типов клиентов. Просто создаём новый тип, реализующий Discounter — и всё работает.'
        },
        {
            type: 'info-box',
            variant: 'important',
            content: '<p><strong>OCP и Go:</strong> Интерфейсы в Go — главный механизм OCP. Определяйте интерфейсы на стороне потребителя (не поставщика), это даёт максимальную гибкость.</p>'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p>Видите <code>switch</code> по типу? Спросите себя: "Буду ли я добавлять новые case в будущем?" Если да — скорее всего, нужен интерфейс.</p>'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q12-03-1',
                    type: 'single',
                    question: 'Что означает "закрыт для модификации" в OCP?',
                    options: [
                        'Код нельзя редактировать вообще',
                        'При добавлении нового функционала существующий протестированный код не должен меняться',
                        'Все методы должны быть приватными',
                        'Нельзя использовать switch'
                    ],
                    correct: 1,
                    explanation: 'Существующий код не трогаем — он уже протестирован и работает. Новый функционал добавляем через новые типы/реализации, не изменяя старые.'
                },
                {
                    id: 'q12-03-2',
                    type: 'single',
                    question: 'Главный инструмент OCP в Go?',
                    options: [
                        'Горутины',
                        'Каналы',
                        'Интерфейсы',
                        'Дженерики'
                    ],
                    correct: 2,
                    explanation: 'Интерфейсы позволяют расширять поведение без изменения существующего кода — это и есть OCP в Go.'
                },
                {
                    id: 'q12-03-3',
                    type: 'multiple',
                    question: 'Какие паттерны помогают соблюдать OCP?',
                    options: [
                        'Стратегия (Strategy pattern)',
                        'Dependency Injection',
                        'Глобальные переменные',
                        'Интерфейсы как параметры функций',
                        'Конкретные типы как параметры функций'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'Strategy, DI и интерфейсные параметры позволяют менять поведение без изменения кода. Глобальные переменные и конкретные типы создают жёсткие связи.'
                }
            ]
        }
    ]
};
