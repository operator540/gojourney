export default {
    id: '12-04',
    title: 'Liskov Substitution Principle',
    description: 'Подтипы должны быть заменяемы своими базовыми типами без нарушения корректности программы. Разберём классический пример с птицами.',
    estimatedTime: 15,
    xpReward: 15,
    sections: [
        {
            type: 'theory',
            content: `
<h2>L — Liskov Substitution Principle</h2>
<p><em>"Объекты подклассов должны заменять объекты базовых классов без изменения корректности программы."</em> — Барбара Лисков</p>
<p>Проще говоря: если функция принимает интерфейс <code>Bird</code>, то <strong>любой</strong> объект реализующий Bird должен работать корректно в этой функции.</p>
<p>Нарушение LSP — когда реализация интерфейса не делает то, что от неё ожидают, или паникует, или возвращает "не поддерживается".</p>
`
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Плохо: Penguin нарушает LSP',
            code: `package main

import (
    "fmt"
    "errors"
)

// Bird — общий интерфейс для птиц
type Bird interface {
    Fly() error
    Sound() string
}

type Sparrow struct{}

func (s *Sparrow) Fly() error   { return nil } // воробей летает
func (s *Sparrow) Sound() string { return "Чирик" }

type Eagle struct{}

func (e *Eagle) Fly() error   { return nil } // орёл летает
func (e *Eagle) Sound() string { return "Клёкот" }

// Пингвин — птица, но НЕ ЛЕТАЕТ
// Это нарушение LSP!
type Penguin struct{}

func (p *Penguin) Fly() error {
    return errors.New("пингвины не летают!") // сюрприз!
}
func (p *Penguin) Sound() string { return "Кряк" }

// Функция ожидает, что ЛЮБАЯ Bird умеет летать
func MakeBirdFly(b Bird) {
    if err := b.Fly(); err != nil {
        // Откуда здесь ошибка?? Bird же должна летать!
        panic(fmt.Sprintf("сломанный код: %v", err))
    }
    fmt.Println("Птица летит!")
}

func main() {
    MakeBirdFly(&Sparrow{}) // OK
    MakeBirdFly(&Eagle{})   // OK
    MakeBirdFly(&Penguin{}) // ПАНИКА! LSP нарушен
}`,
            explanation: 'Penguin реализует Bird, но не выполняет контракт. Функция MakeBirdFly ожидает, что любой Bird может летать — это нарушает LSP и ломает программу.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Хорошо: разделяем интерфейсы',
            code: `package main

import "fmt"

// Bird — базовый интерфейс, только то, что умеют ВСЕ птицы
type Bird interface {
    Sound() string
    Breathe() string
}

// Flyer — отдельный интерфейс для летающих
type Flyer interface {
    Bird
    Fly() string
}

// Swimmer — для плавающих
type Swimmer interface {
    Bird
    Swim() string
}

type Sparrow struct{}

func (s *Sparrow) Sound() string   { return "Чирик" }
func (s *Sparrow) Breathe() string { return "дышит" }
func (s *Sparrow) Fly() string     { return "летит в небе" }

type Eagle struct{}

func (e *Eagle) Sound() string   { return "Клёкот" }
func (e *Eagle) Breathe() string { return "дышит" }
func (e *Eagle) Fly() string     { return "парит высоко" }

// Пингвин реализует Bird и Swimmer, но НЕ Flyer
type Penguin struct{}

func (p *Penguin) Sound() string   { return "Кряк" }
func (p *Penguin) Breathe() string { return "дышит" }
func (p *Penguin) Swim() string    { return "плывёт быстро" }

func MakeFly(f Flyer) {
    fmt.Printf("%s: %s\\n", f.Sound(), f.Fly())
}

func MakeSwim(s Swimmer) {
    fmt.Printf("%s: %s\\n", s.Sound(), s.Swim())
}

func main() {
    sparrow := &Sparrow{}
    eagle := &Eagle{}
    penguin := &Penguin{}

    MakeFly(sparrow) // Чирик: летит в небе
    MakeFly(eagle)   // Клёкот: парит высоко
    // MakeFly(penguin) — ошибка компиляции! Penguin не Flyer

    MakeSwim(penguin) // Кряк: плывёт быстро
}`,
            explanation: 'Разделив интерфейс, мы не можем случайно передать Penguin туда, где ожидается Flyer — компилятор поймает ошибку. LSP соблюдён.'
        },
        {
            type: 'info-box',
            variant: 'important',
            content: '<p><strong>Признак нарушения LSP:</strong> если реализация метода делает <code>panic</code>, возвращает "not implemented" или ведёт себя неожиданно — LSP нарушен. Контракт интерфейса — это не только сигнатура, но и ожидаемое поведение.</p>'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p>LSP тесно связан с ISP (следующий урок). Часто нарушение LSP — признак того, что интерфейс слишком большой и требует разделения.</p>'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q12-04-1',
                    type: 'single',
                    question: 'Что нарушает LSP в примере с Penguin?',
                    options: [
                        'Penguin написан неправильно',
                        'Fly() возвращает ошибку вместо выполнения ожидаемого поведения',
                        'Метод Sound() возвращает неправильное значение',
                        'Penguin не является птицей биологически'
                    ],
                    correct: 1,
                    explanation: 'LSP нарушается когда реализация не выполняет контракт интерфейса. Bird.Fly() подразумевает "птица умеет летать", но Penguin.Fly() возвращает ошибку — это неожиданное поведение.'
                },
                {
                    id: 'q12-04-2',
                    type: 'single',
                    question: 'Как правильно решить проблему с Penguin?',
                    options: [
                        'Добавить проверку if p, ok := b.(*Penguin) в MakeBirdFly',
                        'Сделать Penguin отдельным типом без интерфейса',
                        'Разделить интерфейс Bird на Bird и Flyer',
                        'Заставить Penguin летать через исключение'
                    ],
                    correct: 2,
                    explanation: 'Правильное решение — разделить интерфейс. Bird содержит общее поведение, Flyer добавляет Fly(). Penguin реализует Bird, но не Flyer — компилятор предотвратит неправильное использование.'
                },
                {
                    id: 'q12-04-3',
                    type: 'multiple',
                    question: 'Какие признаки нарушения LSP? (выберите все)',
                    options: [
                        'Метод интерфейса делает panic("not implemented")',
                        'Метод возвращает errors.New("not supported")',
                        'Реализация добавляет новые методы помимо интерфейса',
                        'Метод делает что-то неожиданное (летающая птица тонет)',
                        'Структура встраивает другую структуру'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'panic, "not supported" и неожиданное поведение — нарушения LSP. Добавление новых методов и embedding — нормальные практики Go.'
                }
            ]
        }
    ]
};
