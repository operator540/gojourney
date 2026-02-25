export default {
    id: '12-05',
    title: 'Interface Segregation Principle',
    description: 'Клиенты не должны зависеть от методов, которые они не используют. Много маленьких интерфейсов лучше одного большого.',
    estimatedTime: 15,
    xpReward: 15,
    sections: [
        {
            type: 'theory',
            content: `
<h2>I — Interface Segregation Principle</h2>
<p><em>"Клиенты не должны зависеть от интерфейсов, которые они не используют."</em></p>
<p>Толстый интерфейс — интерфейс с большим количеством методов, из которых реализации используют лишь часть. Это ведёт к:</p>
<ul>
    <li>Фиктивным реализациям (пустые методы, panic)</li>
    <li>Сложным моккам в тестах</li>
    <li>Нарушению LSP (реализации делают "not implemented")</li>
</ul>
<p>В Go принято: <strong>чем меньше интерфейс — тем лучше</strong>. Идеал — 1-2 метода.</p>
`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Плохо: толстый интерфейс Worker',
            code: `package main

import "fmt"

// Fat interface — нарушает ISP
// Роботы не едят и не спят!
type Worker interface {
    Work() string
    Eat() string  // роботы не едят
    Sleep() string // роботы не спят
}

type HumanWorker struct {
    name string
}

func (h *HumanWorker) Work() string  { return h.name + " работает" }
func (h *HumanWorker) Eat() string   { return h.name + " ест" }
func (h *HumanWorker) Sleep() string { return h.name + " спит" }

// Робот вынужден реализовывать ненужные методы
type RobotWorker struct {
    id string
}

func (r *RobotWorker) Work() string {
    return "Робот " + r.id + " работает"
}

// Заглушки — нарушение ISP и LSP одновременно!
func (r *RobotWorker) Eat() string {
    panic("роботы не едят!") // нарушение контракта
}
func (r *RobotWorker) Sleep() string {
    return "" // молчаливое игнорирование — тоже плохо
}

func makeWork(w Worker) {
    fmt.Println(w.Work())
    fmt.Println(w.Eat()) // RobotWorker здесь паникует!
}`,
            explanation: 'RobotWorker вынужден реализовывать Eat и Sleep, хотя роботу это не нужно. Это приводит к паникам, пустым методам и ненадёжному коду.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Хорошо: сегрегированные интерфейсы',
            code: `package main

import "fmt"

// Маленькие, сфокусированные интерфейсы
type Worker interface {
    Work() string
}

type Eater interface {
    Eat() string
}

type Sleeper interface {
    Sleep() string
}

// Составной интерфейс при необходимости
type HumanInterface interface {
    Worker
    Eater
    Sleeper
}

type HumanWorker struct {
    name string
}

func (h *HumanWorker) Work() string  { return h.name + " работает" }
func (h *HumanWorker) Eat() string   { return h.name + " ест" }
func (h *HumanWorker) Sleep() string { return h.name + " спит" }

// Робот реализует только то, что ему нужно
type RobotWorker struct {
    id string
}

func (r *RobotWorker) Work() string {
    return fmt.Sprintf("Робот %s выполняет задачу", r.id)
}

// Функции принимают только нужные интерфейсы
func ManageWork(w Worker) {
    fmt.Println(w.Work())
}

func ManageBreak(e Eater, s Sleeper) {
    fmt.Println(e.Eat())
    fmt.Println(s.Sleep())
}

func main() {
    human := &HumanWorker{name: "Иван"}
    robot := &RobotWorker{id: "R2D2"}

    ManageWork(human) // OK
    ManageWork(robot) // OK — робот тоже Worker

    ManageBreak(human, human) // OK — человек ест и спит
    // ManageBreak(robot, robot) — ошибка компиляции!
    // RobotWorker не реализует Eater и Sleeper
}`,
            explanation: 'Теперь RobotWorker реализует только Worker — то, что ему действительно нужно. Компилятор предотвращает неправильное использование. Тесты проще — мокать нужно только используемые методы.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p><strong>Золотое правило Go:</strong> "Accept interfaces, return structs." Принимайте минимально необходимый интерфейс, возвращайте конкретные типы. Это даёт максимальную гибкость.</p>'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Реальный пример: io.Reader и io.Writer',
            code: `package main

import (
    "fmt"
    "strings"
    "io"
)

// io.Reader — один метод
// type Reader interface {
//     Read(p []byte) (n int, err error)
// }

// io.Writer — один метод
// type Writer interface {
//     Write(p []byte) (n int, err error)
// }

// Функция принимает только то, что нужно — Reader
func CountBytes(r io.Reader) (int, error) {
    buf := make([]byte, 1024)
    total := 0
    for {
        n, err := r.Read(buf)
        total += n
        if err == io.EOF {
            break
        }
        if err != nil {
            return total, err
        }
    }
    return total, nil
}

func main() {
    // strings.Reader реализует io.Reader
    r := strings.NewReader("Hello, ISP World!")
    n, _ := CountBytes(r)
    fmt.Printf("Байт: %d\\n", n)
}`,
            explanation: 'Стандартная библиотека Go — образец ISP. io.Reader, io.Writer, io.Closer — крохотные интерфейсы. Поэтому они применимы к файлам, сети, буферам, строкам — к чему угодно.'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q12-05-1',
                    type: 'single',
                    question: 'Что такое "толстый интерфейс"?',
                    options: [
                        'Интерфейс с большим количеством методов, часть из которых не нужна некоторым реализациям',
                        'Интерфейс, занимающий много памяти',
                        'Интерфейс с методами, принимающими много параметров',
                        'Интерфейс, реализованный более чем 10 типами'
                    ],
                    correct: 0,
                    explanation: 'Толстый (fat) интерфейс — содержит методы, которые не все реализации могут или должны поддерживать. Это вынуждает создавать заглушки и нарушать LSP.'
                },
                {
                    id: 'q12-05-2',
                    type: 'single',
                    question: 'Какое максимальное количество методов считается идеальным для Go-интерфейса?',
                    options: [
                        '1-2 метода',
                        '5-7 методов',
                        '10 методов',
                        'Нет ограничений'
                    ],
                    correct: 0,
                    explanation: 'В Go принято делать маленькие интерфейсы: io.Reader, io.Writer, fmt.Stringer — по одному методу. Это максимальная гибкость и совместимость.'
                },
                {
                    id: 'q12-05-3',
                    type: 'multiple',
                    question: 'Что означает правило "Accept interfaces, return structs"?',
                    options: [
                        'Параметры функций должны быть интерфейсами',
                        'Функции должны возвращать интерфейсы для гибкости',
                        'Функции должны возвращать конкретные типы (structs)',
                        'Это помогает тестировать код через моки',
                        'Это запрещает использование конкретных типов'
                    ],
                    correct: [0, 2, 3],
                    explanation: 'Принимать интерфейсы = гибкость для вызывающего кода. Возвращать structs = вызывающий сам решает, какой интерфейс ему нужен. Это облегчает тестирование через моки.'
                }
            ]
        }
    ]
};
