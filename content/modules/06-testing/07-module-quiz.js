export default {
    id: '06-07',
    title: 'Итоговый квиз: Тестирование в Go',
    description: 'Проверьте знания: unit-тесты, table-driven, testify, моки, бенчмарки, покрытие',
    estimatedTime: 15,
    xpReward: 30,

    sections: [
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Как называется функция теста в Go?',
                    options: [
                        'TestXxx(t *testing.T)',
                        'test_xxx()',
                        'func_test Xxx()',
                        '@Test Xxx()'
                    ],
                    correct: 0,
                    explanation: 'Функция теста: имя начинается с Test, принимает *testing.T. Запуск: go test ./...'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что такое table-driven тест?',
                    options: [
                        'Слайс структур с тест-кейсами + цикл с t.Run',
                        'Тест с SQL-таблицей',
                        'Тест, который генерируется автоматически',
                        'Параллельный тест'
                    ],
                    correct: 0,
                    explanation: 'Table-driven = []struct{{name, input, want}} + for range + t.Run. Главный паттерн тестирования в Go.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'В чём разница t.Error и t.Fatal?',
                    options: [
                        't.Error продолжает тест, t.Fatal останавливает',
                        't.Fatal логирует, t.Error паникует',
                        't.Error для unit-тестов, t.Fatal для интеграционных',
                        'Нет разницы'
                    ],
                    correct: 0,
                    explanation: 't.Error/t.Errorf помечает тест неудачным и продолжает. t.Fatal/t.Fatalf — помечает и немедленно останавливает.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Когда require.NoError лучше assert.NoError?',
                    options: [
                        'Когда следующий код использует результат (разыменование, поля)',
                        'Всегда, require надёжнее',
                        'Только при работе с HTTP',
                        'Когда тест параллельный'
                    ],
                    correct: 0,
                    explanation: 'Если err != nil и мы продолжим работать с nil-результатом — будет паника. require.NoError останавливает тест, предотвращая это.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Как создать мок в Go?',
                    options: [
                        'Создать структуру, реализующую интерфейс',
                        'Использовать reflect для подмены методов',
                        'Изменить глобальные переменные',
                        'Использовать build-теги'
                    ],
                    correct: 0,
                    explanation: 'В Go моки создаются через интерфейсы: сервис принимает интерфейс, в тестах передаём мок-структуру с нужным поведением.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Что значит b.N в бенчмарке?',
                    options: [
                        'Количество итераций — Go подбирает автоматически',
                        'Количество параллельных горутин',
                        'Ограничение времени в мс',
                        'Размер тестовых данных'
                    ],
                    correct: 0,
                    explanation: 'b.N — число итераций, автоматически подобранное Go для получения стабильного результата (обычно ~1 секунда исполнения).'
                },
                {
                    id: 'q7',
                    type: 'single',
                    question: 'Команда для отображения покрытия кода в браузере:',
                    options: [
                        'go tool cover -html=coverage.out',
                        'go test -show-coverage',
                        'go cover open',
                        'go test -html ./...'
                    ],
                    correct: 0,
                    explanation: 'Сначала go test -coverprofile=coverage.out, затем go tool cover -html=coverage.out для открытия в браузере.'
                },
                {
                    id: 'q8',
                    type: 'single',
                    question: 'Для чего используется TestMain(m *testing.M)?',
                    options: [
                        'Setup/teardown для всех тестов пакета (инициализация БД, конфига)',
                        'Главный тест проекта',
                        'Запуск тестов в определённом порядке',
                        'Настройка параллельности'
                    ],
                    correct: 0,
                    explanation: 'TestMain — единственный в пакете. Выполняет setup, вызывает m.Run(), делает teardown. os.Exit(code) обязателен.'
                },
                {
                    id: 'q9',
                    type: 'single',
                    question: 'Что проверяет mock.AssertExpectations(t)?',
                    options: [
                        'Все ожидаемые вызовы (On) действительно произошли',
                        'Правильность возвращаемых значений',
                        'Отсутствие паники',
                        'Что мок не использовался лишний раз'
                    ],
                    correct: 0,
                    explanation: 'AssertExpectations проверяет, что каждый вызов настроенный через .On() был вызван ожидаемое число раз.'
                },
                {
                    id: 'q10',
                    type: 'single',
                    question: 'Флаг -benchmem показывает:',
                    options: [
                        'Аллокации памяти на операцию (B/op, allocs/op)',
                        'Максимальное потребление RAM',
                        'Утечки памяти',
                        'Нагрузку на GC'
                    ],
                    correct: 0,
                    explanation: '-benchmem добавляет: B/op (байт памяти на операцию) и allocs/op (количество аллокаций). Ключево для оптимизации.'
                },
                {
                    id: 'q11',
                    type: 'single',
                    question: 'Суффикс файла теста в Go:',
                    options: [
                        '_test.go',
                        '.test.go',
                        '_spec.go',
                        'test_.go'
                    ],
                    correct: 0,
                    explanation: 'Файлы *_test.go компилируются только при go test. Они могут находиться в пакете xxx или xxx_test для тестирования через внешний интерфейс.'
                },
                {
                    id: 'q12',
                    type: 'single',
                    question: 'Что означает 100% покрытие кода?',
                    options: [
                        'Все строки кода были выполнены — не гарантирует правильность',
                        'Все возможные сценарии протестированы',
                        'Код полностью надёжен',
                        'Тесты проверяют все граничные случаи'
                    ],
                    correct: 0,
                    explanation: '100% покрытие означает только что каждая строка была выполнена. Тесты могут не делать assert — код "покрыт" но поведение не проверено.'
                }
            ]
        }
    ]
};
