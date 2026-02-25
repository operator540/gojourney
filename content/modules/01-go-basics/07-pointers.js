export default {
    id: '01-07',
    title: 'Указатели',
    description: 'Операторы & и *, передача по значению и по указателю, nil-указатели, new()',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Что такое указатель?</h2>
                <p>Указатель — это переменная, которая хранит <strong>адрес в памяти</strong> другой переменной. В Go указатели безопасны: нет арифметики указателей (как в C/C++), но есть полный контроль над тем, что передаётся по значению, а что по ссылке.</p>
                <p>Два ключевых оператора:</p>
                <ul>
                    <li><code>&x</code> — получить адрес переменной x (оператор взятия адреса)</li>
                    <li><code>*p</code> — получить значение по адресу p (оператор разыменования)</li>
                </ul>
            `
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph LR
    subgraph "Память"
        X["x = 42<br>адрес: 0xc0000"]
        P["p = 0xc0000<br>(указатель на x)"]
    end
    P -->|"*p = 42"| X
    X -->|"&x = 0xc0000"| P
    style X fill:#10b981,color:#fff
    style P fill:#00add8,color:#fff`,
            caption: '& берёт адрес, * разыменовывает указатель'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Основы указателей',
            code: `package main

import "fmt"

func main() {
    x := 42
    p := &x // p — указатель на x (тип *int)

    fmt.Println(x)  // 42      — значение
    fmt.Println(&x) // 0xc0000 — адрес (у вас будет другой)
    fmt.Println(p)  // 0xc0000 — тот же адрес
    fmt.Println(*p) // 42      — значение по адресу

    // Изменение через указатель
    *p = 100
    fmt.Println(x)  // 100 — x изменился!
    fmt.Println(*p) // 100
}`,
            explanation: '& возвращает адрес переменной. * «проходит» по указателю к значению. Изменение *p изменяет исходную переменную.'
        },
        {
            type: 'theory',
            content: `
                <h2>Передача по значению vs по указателю</h2>
                <p>В Go <strong>всё передаётся по значению</strong>. Это значит, что функция получает копию аргумента. Чтобы функция могла изменить оригинал, нужно передать <strong>указатель</strong>.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'По значению vs по указателю',
            code: `package main

import "fmt"

// Получает КОПИЮ — оригинал не изменится
func doubleValue(n int) {
    n *= 2
    fmt.Println("Внутри (копия):", n) // 20
}

// Получает УКАЗАТЕЛЬ — изменяет оригинал
func doublePointer(n *int) {
    *n *= 2
    fmt.Println("Внутри (указатель):", *n) // 20
}

func main() {
    x := 10

    doubleValue(x)
    fmt.Println("После doubleValue:", x) // 10 — не изменился!

    doublePointer(&x)
    fmt.Println("После doublePointer:", x) // 20 — изменился!
}`,
            explanation: 'doubleValue работает с копией, поэтому оригинал не меняется. doublePointer получает адрес и меняет значение по этому адресу.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p><strong>Когда использовать указатели:</strong></p><ul><li>Нужно изменить аргумент в функции</li><li>Структура большая и копирование дорого</li><li>Нужно выразить «значения нет» через nil</li></ul><p><strong>Когда НЕ нужны:</strong> для маленьких типов (int, bool, string), где копирование дёшево.</p>'
        },
        {
            type: 'theory',
            content: `
                <h2>Указатели и структуры</h2>
                <p>Чаще всего указатели используются со структурами — для изменения полей и избежания копирования.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Указатели на структуры',
            code: `package main

import "fmt"

type User struct {
    Name string
    Age  int
}

func birthday(u *User) {
    u.Age++ // Go автоматически разыменовывает: (*u).Age++
}

func main() {
    user := User{Name: "Alice", Age: 29}

    birthday(&user)
    fmt.Println(user.Age) // 30

    // Создание указателя на структуру через &
    admin := &User{Name: "Bob", Age: 35}
    fmt.Println(admin.Name) // Bob — автоматическое разыменование
}`,
            explanation: 'Go автоматически разыменовывает указатель на структуру при доступе к полям: u.Age вместо (*u).Age.'
        },
        {
            type: 'theory',
            content: `
                <h2>nil-указатели и new()</h2>
                <p>Нулевое значение указателя — <code>nil</code>. Разыменование nil-указателя вызывает panic. Функция <code>new(T)</code> выделяет память и возвращает указатель на нулевое значение типа T.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'nil и new()',
            code: `package main

import "fmt"

func main() {
    // nil-указатель
    var p *int
    fmt.Println(p)       // <nil>
    fmt.Println(p == nil) // true
    // fmt.Println(*p)   // PANIC! — разыменование nil

    // new() выделяет память и возвращает указатель
    p = new(int)         // *p == 0 (нулевое значение int)
    fmt.Println(*p)      // 0
    *p = 42
    fmt.Println(*p)      // 42

    // Безопасная проверка перед использованием
    var name *string
    if name != nil {
        fmt.Println(*name)
    } else {
        fmt.Println("name is nil")
    }
}`,
            explanation: 'new(T) выделяет память, инициализирует нулевым значением T и возвращает *T. На практике чаще используют &T{} для структур.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Практический пример: swap',
            code: `package main

import "fmt"

// swap меняет значения двух переменных местами
func swap(a, b *int) {
    *a, *b = *b, *a
}

func main() {
    x, y := 10, 20
    fmt.Println("До:   ", x, y) // 10 20

    swap(&x, &y)
    fmt.Println("После:", x, y) // 20 10
}`,
            explanation: 'Классический пример: swap невозможен без указателей, потому что Go передаёт аргументы по значению.'
        },
        {
            type: 'info-box',
            variant: 'note',
            content: '<p>В Go нет арифметики указателей (<code>p++</code>, <code>p+4</code>), как в C/C++. Это делает Go-указатели безопаснее — невозможно случайно выйти за пределы памяти. Для низкоуровневых операций есть пакет <code>unsafe</code>, но он используется крайне редко.</p>'
        },
        {
            type: 'editor',
            title: 'Практика: Функция с указателями',
            instructions: 'Напишите функцию maxPtr, которая принимает два указателя на int и возвращает указатель на большее из двух значений. Не создавайте новую переменную — верните один из переданных указателей.',
            starterCode: `package main

import "fmt"

func maxPtr(a, b *int) *int {
    // Ваш код здесь
    // Верните указатель на большее значение
    return nil
}

func main() {
    x, y := 10, 25
    result := maxPtr(&x, &y)
    fmt.Println(*result) // Ожидается: 25

    // Изменяем через результат
    *result = 100
    fmt.Println(y) // Ожидается: 100 (result указывает на y)
}`,
            hints: [
                'Сравните *a и *b',
                'Если *a > *b — верните a, иначе — b',
                'Возвращайте указатель (a или b), а не значение'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что делает оператор & ?',
                    options: [
                        'Возвращает адрес переменной',
                        'Разыменовывает указатель',
                        'Проверяет на nil',
                        'Выделяет память'
                    ],
                    correct: 0,
                    explanation: '& — оператор взятия адреса. Возвращает указатель на переменную.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что произойдёт при разыменовании nil-указателя?',
                    options: [
                        'panic во время выполнения',
                        'Вернётся нулевое значение',
                        'Ошибка компиляции',
                        'Программа продолжит работу'
                    ],
                    correct: 0,
                    explanation: 'Разыменование nil-указателя (*p при p == nil) вызывает panic. Всегда проверяйте указатель на nil.'
                },
                {
                    id: 'q3',
                    type: 'code-fill',
                    question: 'Как изменить значение по указателю p на 42?',
                    template: '___p = 42',
                    correct: '*',
                    caseSensitive: true,
                    explanation: '* — оператор разыменования. *p = 42 записывает 42 по адресу, хранящемуся в p.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Почему Go автоматически разыменовывает указатели на структуры?',
                    options: [
                        'Для удобства: u.Name вместо (*u).Name',
                        'Потому что структуры всегда передаются по ссылке',
                        'Для совместимости с C',
                        'Это работает только в main()'
                    ],
                    correct: 0,
                    explanation: 'Go автоматически разыменовывает указатели на структуры при доступе к полям — это синтаксический сахар для удобства.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Есть ли в Go арифметика указателей?',
                    options: [
                        'Нет, Go не поддерживает арифметику указателей',
                        'Да, как в C',
                        'Только для слайсов',
                        'Только с пакетом math'
                    ],
                    correct: 0,
                    explanation: 'Go не поддерживает арифметику указателей (p++, p+n). Это сделано для безопасности.'
                }
            ]
        }
    ]
};
