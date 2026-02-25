export const achievements = [
    {
        id: 'first_lesson',
        title: 'Первый шаг',
        description: 'Завершите первый урок',
        icon: 'bi-rocket-takeoff',
        xpBonus: 20,
        condition: (state) => Object.keys(state.completedLessons).length >= 1
    },
    {
        id: 'five_lessons',
        title: 'Разгон',
        description: 'Завершите 5 уроков',
        icon: 'bi-speedometer2',
        xpBonus: 30,
        condition: (state) => Object.keys(state.completedLessons).length >= 5
    },
    {
        id: 'ten_lessons',
        title: 'Двузначный',
        description: 'Завершите 10 уроков',
        icon: 'bi-hash',
        xpBonus: 50,
        condition: (state) => Object.keys(state.completedLessons).length >= 10
    },
    {
        id: 'module_01',
        title: 'Основы освоены',
        description: 'Завершите модуль "Основы Go"',
        icon: 'bi-play-circle',
        xpBonus: 50,
        condition: (state) => {
            const ids = ['01-01','01-02','01-03','01-04','01-05','01-06','01-07','01-08'];
            return ids.every(id => state.completedLessons[id]);
        }
    },
    {
        id: 'module_02',
        title: 'Архитектор типов',
        description: 'Завершите модуль "Структуры и интерфейсы"',
        icon: 'bi-bricks',
        xpBonus: 50,
        condition: (state) => {
            const ids = ['02-01','02-02','02-03','02-04','02-05','02-06'];
            return ids.every(id => state.completedLessons[id]);
        }
    },
    {
        id: 'module_07',
        title: 'Серверный мастер',
        description: 'Завершите модуль "HTTP-серверы"',
        icon: 'bi-globe',
        xpBonus: 50,
        condition: (state) => {
            const ids = ['07-01','07-02','07-03','07-04','07-05','07-06','07-07'];
            return ids.every(id => state.completedLessons[id]);
        }
    },
    {
        id: 'quiz_perfect',
        title: 'Отличник',
        description: 'Получите 100% в любом квизе',
        icon: 'bi-trophy',
        xpBonus: 30,
        condition: (state) => Object.values(state.quizScores).some(s => s.score === s.total)
    },
    {
        id: 'quiz_five',
        title: 'Квиз-мастер',
        description: 'Пройдите 5 квизов',
        icon: 'bi-pencil-square',
        xpBonus: 40,
        condition: (state) => Object.keys(state.quizScores).length >= 5
    },
    {
        id: 'streak_3',
        title: 'Три дня подряд',
        description: 'Занимайтесь 3 дня подряд',
        icon: 'bi-fire',
        xpBonus: 30,
        condition: (state) => state.streak >= 3
    },
    {
        id: 'streak_7',
        title: 'Неделя подряд',
        description: 'Занимайтесь 7 дней подряд',
        icon: 'bi-fire',
        xpBonus: 100,
        condition: (state) => state.streak >= 7
    },
    {
        id: 'streak_30',
        title: 'Марафонец',
        description: 'Занимайтесь 30 дней подряд',
        icon: 'bi-gem',
        xpBonus: 300,
        condition: (state) => state.streak >= 30
    },
    {
        id: 'code_warrior',
        title: 'Кодер',
        description: 'Напишите код в 10 редакторах',
        icon: 'bi-keyboard',
        xpBonus: 40,
        condition: (state) => Object.keys(state.editorCode).length >= 10
    },
    {
        id: 'code_master',
        title: 'Мастер кода',
        description: 'Напишите код в 30 редакторах',
        icon: 'bi-code-slash',
        xpBonus: 80,
        condition: (state) => Object.keys(state.editorCode).length >= 30
    },
    {
        id: 'halfway',
        title: 'Экватор',
        description: 'Завершите 50% всех уроков',
        icon: 'bi-flag',
        xpBonus: 150,
        condition: (state) => Object.keys(state.completedLessons).length >= 43
    },
    {
        id: 'xp_100',
        title: 'Уровень 2',
        description: 'Наберите 100 XP',
        icon: 'bi-star',
        xpBonus: 10,
        condition: (state) => state.xp >= 100
    },
    {
        id: 'xp_500',
        title: 'Уровень 6',
        description: 'Наберите 500 XP',
        icon: 'bi-star-fill',
        xpBonus: 25,
        condition: (state) => state.xp >= 500
    },
    {
        id: 'xp_1000',
        title: 'Тысячник',
        description: 'Наберите 1000 XP',
        icon: 'bi-stars',
        xpBonus: 50,
        condition: (state) => state.xp >= 1000
    },
    {
        id: 'concurrency_done',
        title: 'Повелитель горутин',
        description: 'Завершите модуль "Конкурентность"',
        icon: 'bi-lightning-charge',
        xpBonus: 60,
        condition: (state) => {
            const ids = ['05-01','05-02','05-03','05-04','05-05','05-06','05-07'];
            return ids.every(id => state.completedLessons[id]);
        }
    },
    {
        id: 'db_done',
        title: 'Хранитель данных',
        description: 'Завершите модуль "SQL и PostgreSQL"',
        icon: 'bi-database',
        xpBonus: 50,
        condition: (state) => {
            const ids = ['10-01','10-02','10-03','10-04','10-05','10-06','10-07'];
            return ids.every(id => state.completedLessons[id]);
        }
    },
    {
        id: 'docker_done',
        title: 'Контейнеризатор',
        description: 'Завершите модуль "Docker и Git"',
        icon: 'bi-box',
        xpBonus: 50,
        condition: (state) => {
            const ids = ['13-01','13-02','13-03','13-04','13-05','13-06','13-07'];
            return ids.every(id => state.completedLessons[id]);
        }
    },
    {
        id: 'all_complete',
        title: 'Go-мастер',
        description: 'Завершите все 85 уроков',
        icon: 'bi-mortarboard',
        xpBonus: 500,
        condition: (state) => Object.keys(state.completedLessons).length >= 85
    },
    {
        id: 'night_owl',
        title: 'Ночная сова',
        description: 'Завершите урок после полуночи',
        icon: 'bi-moon-stars',
        xpBonus: 15,
        condition: (state) => {
            const timestamps = Object.values(state.completedLessons);
            return timestamps.some(ts => {
                if (typeof ts !== 'number') return false;
                const hour = new Date(ts).getHours();
                return hour >= 0 && hour < 5;
            });
        }
    },
    {
        id: 'early_bird',
        title: 'Ранняя пташка',
        description: 'Завершите урок до 7 утра',
        icon: 'bi-sunrise',
        xpBonus: 15,
        condition: (state) => {
            const timestamps = Object.values(state.completedLessons);
            return timestamps.some(ts => {
                if (typeof ts !== 'number') return false;
                const hour = new Date(ts).getHours();
                return hour >= 5 && hour < 7;
            });
        }
    },
];
