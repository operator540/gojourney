export default {
    id: '11-07',
    title: 'Итоговый квиз: ORM и GORM',
    description: 'Проверка знаний по модулю ORM и GORM',
    estimatedTime: 15,
    xpReward: 50,

    sections: [
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что произойдет, если вызвать `db.AutoMigrate(&User{})`, когда таблица `users` уже существует?',
                    options: [
                        'Таблица будет пересоздана (данные удалятся)',
                        'GORM добавит новые колонки, если они есть в структуре',
                        'Ничего не произойдет, GORM пропустит шаг',
                        'Выдаст ошибку "Table exists"'
                    ],
                    correct: 1,
                    explanation: 'AutoMigrate безопасен: он только добавляет новые элементы (таблицы, колонки, индексы), не удаляя существующие.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Как получить записи, включая удаленные через Soft Delete?',
                    options: [
                        'db.Find(&users)',
                        'db.WithDeleted().Find(&users)',
                        'db.Unscoped().Find(&users)',
                        'db.Where("deleted_at IS NOT NULL").Find(&users)'
                    ],
                    correct: 2,
                    explanation: 'Метод `Unscoped()` отключает глобальный скоуп (включая фильтр Soft Delete).'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Какой тег нужно добавить к полю структуры, чтобы GORM игнорировал его?',
                    options: [
                        'gorm:"-"',
                        'gorm:"ignore"',
                        'json:"-"',
                        'sql:"-"'
                    ],
                    correct: 0,
                    explanation: '`gorm:"-"` исключает поле из маппинга в БД.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'В чем разница между `First` и `Find`?',
                    options: [
                        'First возвращает одну запись (и ошибку, если нет), Find — слайс',
                        'First сортирует по дате, Find — по ID',
                        'Find работает быстрее',
                        'Нет разницы'
                    ],
                    correct: 0,
                    explanation: 'First добавляет `ORDER BY id LIMIT 1` и возвращает `ErrRecordNotFound`, если пусто. Find возвращает пустой слайс без ошибки.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Как избежать проблемы N+1 при загрузке связей?',
                    options: [
                        'Использовать циклы for',
                        'Использовать `Preload` или `Joins`',
                        'Увеличить пул соединений',
                        'Использовать Redis'
                    ],
                    correct: 1,
                    explanation: 'Eager Loading (Preload) загружает связи за один дополнительный запрос, вместо запроса на каждую запись в цикле.'
                },
                {
                    id: 'q6',
                    type: 'single',
                    question: 'Для чего нужен метод `Updates`?',
                    options: [
                        'Только для обновления поля updated_at',
                        'Для обновления нескольких полей ненулевыми значениями',
                        'Для создания новой записи, если старой нет',
                        'Для обновления схемы БД'
                    ],
                    correct: 1,
                    explanation: 'Updates обновляет поля, переданные в структуре или мапе. При этом поля с zero-values в структуре игнорируются.'
                }
            ]
        }
    ]
};
