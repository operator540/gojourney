export default {
    id: '02-04',
    title: 'Встраивание (embedding)',
    description: 'Композиция вместо наследования — встраивание структур и интерфейсов, продвижение методов, множественное embedding',
    estimatedTime: 30,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: встраивание как миксины</h2>
                <p>Представьте, что вы собираете конструктор. У вас есть готовые блоки: <strong>блок GPS</strong> (умеет определять координаты), <strong>блок камеры</strong> (умеет фотографировать), <strong>блок связи</strong> (умеет звонить). Вы берёте смартфон и <em>встраиваете</em> в него все эти блоки — и смартфон сразу умеет всё, что умеют блоки, без переписывания кода.</p>
                <p>Это и есть <strong>embedding</strong> в Go. Не «наследование» (когда потомок является родителем), а <strong>композиция</strong> (когда структура содержит другую и получает её возможности).</p>

                <h2>Почему Go отказался от наследования?</h2>
                <p>В языках с наследованием (Java, C++, Python) возникает проблема: <strong>хрупкий базовый класс</strong>. Изменение родительского класса ломает всех потомков. Связи становятся настолько глубокими, что код сложно понять и изменить.</p>
                <p>Go выбрал <strong>«composition over inheritance»</strong> — один из главных принципов объектно-ориентированного проектирования. Структуры не наследуют друг друга, а <em>включают</em> друг друга. Это проще, предсказуемее и гибче.</p>

                <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px; border:1px solid var(--border); text-align:left">Аспект</th>
                            <th style="padding:10px; border:1px solid var(--border); text-align:left">Наследование (Java)</th>
                            <th style="padding:10px; border:1px solid var(--border); text-align:left">Embedding (Go)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px; border:1px solid var(--border)">Связь типов</td>
                            <td style="padding:10px; border:1px solid var(--border)">«is-a» (Dog is an Animal)</td>
                            <td style="padding:10px; border:1px solid var(--border)">«has-a» (Dog has a Body)</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px; border:1px solid var(--border)">Синтаксис</td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>extends Animal</code></td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>Body</code> (анонимное поле)</td>
                        </tr>
                        <tr>
                            <td style="padding:10px; border:1px solid var(--border)">Методы</td>
                            <td style="padding:10px; border:1px solid var(--border)">Наследуются, могут быть override</td>
                            <td style="padding:10px; border:1px solid var(--border)">Продвигаются, могут быть перекрыты</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px; border:1px solid var(--border)">Иерархия</td>
                            <td style="padding:10px; border:1px solid var(--border)">Деревья классов, хрупкие связи</td>
                            <td style="padding:10px; border:1px solid var(--border)">Плоская, гибкая, меняется легко</td>
                        </tr>
                        <tr>
                            <td style="padding:10px; border:1px solid var(--border)">Ключевое слово</td>
                            <td style="padding:10px; border:1px solid var(--border)"><code>extends</code>, <code>implements</code></td>
                            <td style="padding:10px; border:1px solid var(--border)">Нет ключевых слов</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Базовое встраивание структур',
            code: `package main

import "fmt"

// Address — самостоятельная структура
type Address struct {
    City    string
    Street  string
    ZipCode string
}

// FullAddress — метод структуры Address
func (a Address) FullAddress() string {
    return fmt.Sprintf("%s, %s %s", a.Street, a.City, a.ZipCode)
}

// User встраивает Address — это анонимное поле
type User struct {
    Name  string
    Email string
    Age   int
    Address // <-- встраивание: нет имени поля, только тип
}

func main() {
    u := User{
        Name:  "Алиса",
        Email: "alice@example.com",
        Age:   30,
        Address: Address{
            City:    "Москва",
            Street:  "Тверская, 1",
            ZipCode: "101000",
        },
    }

    // ПРОДВИЖЕНИЕ: поля Address доступны напрямую
    fmt.Println(u.City)          // Москва
    fmt.Println(u.Street)        // Тверская, 1
    fmt.Println(u.ZipCode)       // 101000

    // ПРОДВИЖЕНИЕ: методы Address тоже доступны напрямую
    fmt.Println(u.FullAddress()) // Тверская, 1, Москва 101000

    // Можно обратиться через имя встроенного типа (явно)
    fmt.Println(u.Address.City)        // Москва
    fmt.Println(u.Address.FullAddress()) // тот же результат
}`,
            explanation: 'Address встроен анонимно — без имени поля. Go автоматически "продвигает" (promotes) все его поля и методы в User. Они работают как если бы были определены прямо в User. Но они по-прежнему принадлежат Address.'
        },
        {
            type: 'theory',
            content: `
                <h2>Продвижение методов и перекрытие</h2>
                <p>Когда встроенный тип имеет метод, этот метод становится доступен на внешнем типе — это называется <strong>продвижение метода (method promotion)</strong>.</p>
                <p>Если внешний тип объявляет <strong>метод с тем же именем</strong>, он <em>перекрывает</em> продвинутый. Встроенный метод при этом не исчезает — он остаётся доступен через явное обращение к встроенному типу.</p>
                <p>Это похоже на CSS: более специфичные правила перекрывают общие, но общие продолжают существовать.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Перекрытие продвинутых методов',
            code: `package main

import "fmt"

type Animal struct {
    Name string
}

func (a Animal) Speak() string {
    return fmt.Sprintf("%s издаёт звук", a.Name)
}

func (a Animal) Breathe() string {
    return fmt.Sprintf("%s дышит", a.Name)
}

func (a Animal) Describe() string {
    return fmt.Sprintf("Животное: %s", a.Name)
}

// Dog встраивает Animal
type Dog struct {
    Animal
    Breed string
}

// Dog ПЕРЕКРЫВАЕТ метод Speak
func (d Dog) Speak() string {
    return fmt.Sprintf("%s лает: Гав!", d.Name)
}

// Dog ПЕРЕКРЫВАЕТ метод Describe
func (d Dog) Describe() string {
    return fmt.Sprintf("Собака %s (%s)", d.Name, d.Breed)
}

// Breathe — НЕ перекрыт, продвигается из Animal

func main() {
    d := Dog{
        Animal: Animal{Name: "Рекс"},
        Breed:  "Немецкая овчарка",
    }

    // Вызов перекрытых методов — используется Dog.Speak()
    fmt.Println(d.Speak())    // Рекс лает: Гав!
    fmt.Println(d.Describe()) // Собака Рекс (Немецкая овчарка)

    // Вызов продвинутого метода — используется Animal.Breathe()
    fmt.Println(d.Breathe())  // Рекс дышит

    // Доступ к оригинальным методам через имя типа
    fmt.Println(d.Animal.Speak())    // Рекс издаёт звук (оригинал)
    fmt.Println(d.Animal.Describe()) // Животное: Рекс (оригинал)

    // Доступ к полям Animal напрямую
    fmt.Println(d.Name)  // Рекс (продвинуто из Animal)
    fmt.Println(d.Breed) // Немецкая овчарка (собственное поле Dog)
}`,
            explanation: 'Dog перекрывает Speak и Describe, но Breathe продвигается из Animal. Оригинальные методы всегда доступны через d.Animal.Speak(). Собственные поля Dog (Breed) и продвинутые из Animal (Name) работают одинаково.'
        },
        {
            type: 'theory',
            content: `
                <h2>Множественное встраивание</h2>
                <p>Структура может встраивать <strong>несколько типов</strong> одновременно. Это позволяет собирать функциональность из независимых компонентов — как миксины в других языках.</p>
                <p>Главная опасность — <strong>конфликт имён</strong>: если два встроенных типа имеют поле или метод с одинаковым именем, обращение к нему вызовет ошибку компиляции. Решение — обращаться явно через имя типа.</p>

                <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px; border:1px solid var(--border); text-align:left">Ситуация</th>
                            <th style="padding:10px; border:1px solid var(--border); text-align:left">Поведение</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px; border:1px solid var(--border)">Уникальный метод во встроенном типе</td>
                            <td style="padding:10px; border:1px solid var(--border)">Продвигается автоматически</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px; border:1px solid var(--border)">Внешний тип имеет тот же метод</td>
                            <td style="padding:10px; border:1px solid var(--border)">Перекрывает продвинутый</td>
                        </tr>
                        <tr>
                            <td style="padding:10px; border:1px solid var(--border)">Два встроенных типа с одним именем</td>
                            <td style="padding:10px; border:1px solid var(--border)">Ошибка компиляции при неявном обращении</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px; border:1px solid var(--border)">Явное обращение через имя типа</td>
                            <td style="padding:10px; border:1px solid var(--border)">Всегда работает, конфликтов нет</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Множественное встраивание и конфликты',
            code: `package main

import "fmt"

// Logger — компонент логирования
type Logger struct {
    Prefix string
}

func (l Logger) Log(msg string) {
    fmt.Printf("[%s] %s\\n", l.Prefix, msg)
}

func (l Logger) Name() string {
    return "Logger:" + l.Prefix
}

// Metrics — компонент метрик
type Metrics struct {
    RequestCount int
}

func (m *Metrics) Track() {
    m.RequestCount++
}

func (m Metrics) Name() string { // КОНФЛИКТ с Logger.Name()
    return "Metrics"
}

// Cache — компонент кэширования
type Cache struct {
    data map[string]string
}

func NewCache() Cache {
    return Cache{data: make(map[string]string)}
}

func (c *Cache) Set(key, value string) {
    c.data[key] = value
}

func (c Cache) Get(key string) (string, bool) {
    v, ok := c.data[key]
    return v, ok
}

// Server встраивает три компонента
type Server struct {
    Logger
    Metrics
    Cache
    Port int
}

func main() {
    s := Server{
        Logger:  Logger{Prefix: "APP"},
        Cache:   NewCache(),
        Port:    8080,
    }

    // Методы Logger продвигаются
    s.Log("Сервер запущен на порту 8080") // [APP] Сервер запущен...
    s.Track()
    s.Track()
    fmt.Println("Запросов:", s.RequestCount) // Запросов: 2

    // Методы Cache продвигаются
    s.Set("user:1", "Alice")
    if val, ok := s.Get("user:1"); ok {
        fmt.Println("Кэш:", val) // Кэш: Alice
    }

    // КОНФЛИКТ: Logger.Name() и Metrics.Name() — ошибка!
    // fmt.Println(s.Name()) // ambiguous selector s.Name

    // Решение: явное обращение
    fmt.Println(s.Logger.Name())  // Logger:APP
    fmt.Println(s.Metrics.Name()) // Metrics
}`,
            explanation: 'Server получает методы Log, Track, Set, Get из трёх встроенных типов. Конфликт имён (Name) решается явным обращением через имя типа. Track использует pointer receiver — Metrics должен быть встроен не как указатель, тогда &s.Metrics используется автоматически.'
        },
        {
            type: 'theory',
            content: `
                <h2>Встраивание интерфейсов</h2>
                <p>Интерфейсы тоже можно встраивать — это создаёт <strong>составные интерфейсы</strong>. Именно так устроена стандартная библиотека Go: <code>io.ReadWriter</code>, <code>io.ReadCloser</code>, <code>io.ReadWriteCloser</code>.</p>
                <p>Это очень мощный паттерн: вы определяете маленькие, сфокусированные интерфейсы (1-2 метода), а большие собираете из маленьких. Так достигается максимальная гибкость.</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Встраивание интерфейсов — паттерн io',
            code: `package main

import "fmt"

// Маленькие интерфейсы — по одному методу
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type Closer interface {
    Close() error
}

// Составные интерфейсы через встраивание
type ReadWriter interface {
    Reader // встраиваем Reader
    Writer // встраиваем Writer
}

// Эквивалентно:
// type ReadWriter interface {
//     Read(p []byte) (n int, err error)
//     Write(p []byte) (n int, err error)
// }

type ReadWriteCloser interface {
    Reader
    Writer
    Closer
}

// Buffer реализует ReadWriteCloser
type Buffer struct {
    data   []byte
    closed bool
}

func (b *Buffer) Read(p []byte) (int, error) {
    n := copy(p, b.data)
    b.data = b.data[n:]
    return n, nil
}

func (b *Buffer) Write(p []byte) (int, error) {
    b.data = append(b.data, p...)
    return len(p), nil
}

func (b *Buffer) Close() error {
    b.closed = true
    fmt.Println("Buffer закрыт")
    return nil
}

// Функция принимает составной интерфейс
func process(rwc ReadWriteCloser) {
    rwc.Write([]byte("hello"))
    buf := make([]byte, 5)
    n, _ := rwc.Read(buf)
    fmt.Printf("Прочитано: %s\\n", buf[:n])
    rwc.Close()
}

func main() {
    b := &Buffer{}
    process(b)
    // Прочитано: hello
    // Buffer закрыт
}`,
            explanation: 'ReadWriteCloser = Reader + Writer + Closer. Buffer реализует все три метода, поэтому автоматически реализует и все три интерфейса, и их комбинации. Именно так работает io.ReadWriteCloser в стандартной библиотеке.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `
                <p><strong>Принцип Go: маленькие интерфейсы.</strong> Самый популярный интерфейс в стандартной библиотеке — <code>io.Reader</code> — имеет ровно один метод. Держите интерфейсы маленькими (1-3 метода). Большие интерфейсы создавайте через встраивание маленьких.</p>
                <p>Встраивание в структурах работает иначе чем в интерфейсах: в структурах вы встраиваете <em>реализацию</em>, в интерфейсах — <em>контракт</em>.</p>
            `
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `
                <p><strong>Встраивание ≠ наследование.</strong> Ключевые отличия:</p>
                <ul>
                    <li>Нет полиморфизма: если Dog встраивает Animal, то Dog не является Animal. <code>var a Animal = Dog{}</code> — ошибка.</li>
                    <li>Нет <code>super</code> или доступа к «родителю» — только явное обращение через имя типа.</li>
                    <li>Встроенный тип не знает о внешнем — он самодостаточен.</li>
                </ul>
            `
        },
        {
            type: 'editor',
            title: 'Практика: Встраивание',
            instructions: 'Создайте Employee, встраивающий Person (Name, Age) и Job (Title, Salary). Добавьте метод Info() string. Убедитесь что поля Name, Title доступны напрямую через e.Name, e.Title.',
            starterCode: `package main

import "fmt"

type Person struct {
    Name string
    Age  int
}

func (p Person) Greet() string {
    return fmt.Sprintf("Привет, я %s!", p.Name)
}

type Job struct {
    Title  string
    Salary float64
}

func (j Job) SalaryInfo() string {
    return fmt.Sprintf("%s (%.0f₽/мес)", j.Title, j.Salary)
}

// TODO: определите Employee, встраивающий Person и Job
type Employee struct {
    // ваш код
}

// TODO: метод Info() — полная информация
// Формат: "Alice, 30 лет — Developer (120000₽/мес)"
func (e Employee) Info() string {
    // ваш код
    return ""
}

func main() {
    e := Employee{
        Person: Person{Name: "Alice", Age: 30},
        Job:    Job{Title: "Developer", Salary: 120000},
    }

    // Продвинутые поля
    fmt.Println(e.Name)   // Alice
    fmt.Println(e.Title)  // Developer

    // Продвинутые методы
    fmt.Println(e.Greet())      // Привет, я Alice!
    fmt.Println(e.SalaryInfo()) // Developer (120000₽/мес)

    // Собственный метод
    fmt.Println(e.Info()) // Alice, 30 лет — Developer (120000₽/мес)
}`,
            hints: [
                'В Employee просто напишите Person и Job на отдельных строках — без имён полей',
                'Info(): fmt.Sprintf("%s, %d лет — %s (%.0f₽/мес)", e.Name, e.Age, e.Title, e.Salary)',
                'e.Name работает потому что Name продвигается из Person',
                'e.Greet() работает потому что метод Greet продвигается из Person'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что такое "продвижение метода" (method promotion) в Go?',
                    options: [
                        'Методы встроенного типа становятся доступны на внешнем типе напрямую',
                        'Метод получает более высокий приоритет в планировщике',
                        'Метод становится публичным (экспортированным)',
                        'Метод переносится из интерфейса в структуру'
                    ],
                    correct: 0,
                    explanation: 'Продвижение: если тип A встроен в B, то методы A доступны через b.Method() так же, как b.A.Method(). Методы "всплывают" на уровень выше.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что произойдёт, если два встроенных типа имеют метод с одинаковым именем, и вы вызываете этот метод напрямую?',
                    options: [
                        'Ошибка компиляции: ambiguous selector',
                        'Вызовется метод первого по порядку встроенного типа',
                        'Вызовутся оба метода',
                        'Будет выбран случайный метод'
                    ],
                    correct: 0,
                    explanation: 'Go запрещает неоднозначные вызовы. Если Logger и Metrics оба имеют Name(), то s.Name() — ошибка компиляции. Решение: s.Logger.Name() или s.Metrics.Name().'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Является ли встраивание наследованием в Go?',
                    options: [
                        'Нет — это композиция ("has-a"), а не наследование ("is-a")',
                        'Да, полноценное наследование',
                        'Да, но только для интерфейсов',
                        'Только если встраивается указатель'
                    ],
                    correct: 0,
                    explanation: 'Встраивание — это "has-a" (Dog has an Animal). В Go нет "is-a". Dog, встраивающий Animal, НЕ является Animal — его нельзя присвоить переменной типа Animal.'
                },
                {
                    id: 'q4',
                    type: 'code-fill',
                    question: 'Как обратиться к оригинальному методу Speak() встроенного типа Animal, если Dog его перекрывает?',
                    template: 'd.___.Speak()',
                    correct: 'Animal',
                    caseSensitive: true,
                    explanation: 'Явное обращение через имя встроенного типа: d.Animal.Speak() вызывает оригинальный метод, а не перекрытый.'
                },
                {
                    id: 'q5',
                    type: 'multiple',
                    question: 'Что происходит при встраивании структуры Address в User? (все верные ответы)',
                    options: [
                        'Поля Address становятся доступны напрямую: u.City',
                        'Методы Address становятся доступны напрямую: u.FullAddress()',
                        'User становится подтипом Address',
                        'К Address можно обратиться явно: u.Address.City'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'Встраивание продвигает и поля, и методы. Явный доступ через имя типа всегда работает. Но подтипов в Go нет — User не является Address.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Зачем встраивают интерфейсы в другие интерфейсы?',
                    options: [
                        'Для создания составных (composite) интерфейсов из маленьких',
                        'Для реализации интерфейса структурой',
                        'Для добавления метода в уже существующий интерфейс',
                        'Для проверки типов через type assertion'
                    ],
                    correct: 0,
                    explanation: 'io.ReadWriter = io.Reader + io.Writer. Встраивание интерфейсов позволяет строить большие контракты из маленьких сфокусированных интерфейсов.'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Какой принцип реализует embedding в Go?',
                    options: [
                        'Composition over Inheritance (предпочитайте композицию наследованию)',
                        'Interface Segregation Principle (принцип разделения интерфейсов)',
                        'Dependency Inversion (инверсия зависимостей)',
                        'Open/Closed Principle (открытости/закрытости)'
                    ],
                    correct: 0,
                    explanation: '"Prefer composition over inheritance" — один из главных принципов ООП. Go реализует его на уровне языка через embedding вместо классического наследования.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Как встроить структуру Address в User?',
                    options: [
                        'Просто написать Address без имени поля: type User struct { Address; Name string }',
                        'Написать address Address с именем поля',
                        'Использовать ключевое слово embed',
                        'Импортировать пакет embed'
                    ],
                    correct: 0,
                    explanation: 'Встраивание — это анонимное поле: только тип без имени. Это и отличает embedding от обычного поля address Address.'
                }
            ]
        }
    ]
};
