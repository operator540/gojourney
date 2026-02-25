export const curriculum = {
    modules: [
        // ─── ФУНДАМЕНТ ───────────────────────────────────────────────
        {
            id: '01',
            path: '01-go-basics',
            title: 'Основы Go',
            icon: 'bi-play-circle',
            description: 'Переменные, типы, условия, циклы, функции, коллекции, указатели',
            lessons: [
                { id: '01-01', file: '01-hello-go', title: 'Hello, Go!', time: 15 },
                { id: '01-02', file: '02-variables-types', title: 'Переменные и типы данных', time: 25 },
                { id: '01-03', file: '03-control-flow', title: 'Условия и циклы', time: 25 },
                { id: '01-04', file: '04-functions', title: 'Функции', time: 20 },
                { id: '01-05', file: '05-arrays-slices', title: 'Массивы и слайсы', time: 25 },
                { id: '01-06', file: '06-maps', title: 'Карты (maps)', time: 20 },
                { id: '01-07', file: '07-pointers', title: 'Указатели', time: 20 },
                { id: '01-08', file: '08-module-quiz', title: 'Итоговый квиз: Основы', time: 15 },
            ]
        },
        {
            id: '02',
            path: '02-structs-interfaces',
            title: 'Структуры и интерфейсы',
            icon: 'bi-bricks',
            description: 'Пользовательские типы, методы, интерфейсы, композиция',
            lessons: [
                { id: '02-01', file: '01-structs', title: 'Структуры (structs)', time: 20 },
                { id: '02-02', file: '02-methods', title: 'Методы', time: 20 },
                { id: '02-03', file: '03-interfaces', title: 'Интерфейсы', time: 25 },
                { id: '02-04', file: '04-embedding', title: 'Встраивание (embedding)', time: 20 },
                { id: '02-05', file: '05-type-assertions', title: 'Утверждения типов', time: 15 },
                { id: '02-06', file: '06-module-quiz', title: 'Итоговый квиз', time: 15 },
            ]
        },
        {
            id: '03',
            path: '03-packages-modules',
            title: 'Пакеты и модули',
            icon: 'bi-box-seam',
            description: 'Организация кода, go.mod, зависимости, структура проекта',
            lessons: [
                { id: '03-01', file: '01-packages', title: 'Система пакетов Go', time: 20 },
                { id: '03-02', file: '02-go-modules', title: 'Go Modules (go.mod)', time: 20 },
                { id: '03-03', file: '03-dependencies', title: 'Управление зависимостями', time: 15 },
                { id: '03-04', file: '04-project-structure', title: 'Структура Go-проекта', time: 20 },
                { id: '03-05', file: '05-module-quiz', title: 'Итоговый квиз', time: 10 },
            ]
        },
        // ─── ИНСТРУМЕНТЫ РАЗРАБОТЧИКА (ранний старт) ─────────────────
        {
            id: '13',
            path: '13-docker-git',
            title: 'Docker и Git',
            icon: 'bi-box',
            description: 'Git workflow, Docker, Dockerfile для Go, docker-compose',
            lessons: [
                { id: '13-01', file: '01-git-basics', title: 'Основы Git', time: 25 },
                { id: '13-02', file: '02-git-branching', title: 'Ветвление и слияние', time: 20 },
                { id: '13-03', file: '03-git-workflow', title: 'Git Workflow', time: 20 },
                { id: '13-04', file: '04-docker-basics', title: 'Основы Docker', time: 25 },
                { id: '13-05', file: '05-dockerfile-go', title: 'Dockerfile для Go', time: 20 },
                { id: '13-06', file: '06-docker-compose', title: 'docker-compose', time: 20 },
                { id: '13-07', file: '07-module-quiz', title: 'Итоговый квиз', time: 15 },
            ]
        },
        // ─── ЯЗЫК: ПРОДВИНУТЫЕ КОНЦЕПЦИИ ─────────────────────────────
        {
            id: '04',
            path: '04-error-handling',
            title: 'Обработка ошибок',
            icon: 'bi-exclamation-triangle',
            description: 'error interface, кастомные ошибки, wrapping, panic/recover',
            lessons: [
                { id: '04-01', file: '01-error-basics', title: 'Ошибки в Go', time: 20 },
                { id: '04-02', file: '02-custom-errors', title: 'Свои типы ошибок', time: 20 },
                { id: '04-03', file: '03-wrapping-errors', title: 'Оборачивание ошибок', time: 20 },
                { id: '04-04', file: '04-panic-recover', title: 'Panic и recover', time: 15 },
                { id: '04-05', file: '05-module-quiz', title: 'Итоговый квиз', time: 10 },
            ]
        },
        {
            id: '05',
            path: '05-concurrency',
            title: 'Конкурентность',
            icon: 'bi-lightning-charge',
            description: 'Горутины, каналы, select, sync, паттерны, context',
            lessons: [
                { id: '05-01', file: '01-goroutines', title: 'Горутины', time: 20 },
                { id: '05-02', file: '02-channels', title: 'Каналы', time: 25 },
                { id: '05-03', file: '03-select', title: 'Select', time: 20 },
                { id: '05-04', file: '04-sync-package', title: 'Пакет sync', time: 20 },
                { id: '05-05', file: '05-patterns', title: 'Паттерны конкурентности', time: 25 },
                { id: '05-06', file: '06-context', title: 'Контекст (context)', time: 20 },
                { id: '05-07', file: '07-module-quiz', title: 'Итоговый квиз', time: 15 },
            ]
        },
        // ─── АЛГОРИТМЫ (до тестирования — для бенчмарков и собесов) ──
        {
            id: '15',
            path: '15-algorithms',
            title: 'Алгоритмы и Структуры Данных',
            icon: 'bi-diagram-3',
            description: 'Big O, сортировки, поиск, деревья, графы, хеш-таблицы',
            lessons: [
                { id: '15-01', file: '01-big-o', title: 'Сложность алгоритмов (Big O)', time: 25 },
                { id: '15-02', file: '02-arrays-linked-lists', title: 'Массивы и связные списки', time: 25 },
                { id: '15-03', file: '03-stacks-queues', title: 'Стеки и очереди', time: 20 },
                { id: '15-04', file: '04-sorting', title: 'Алгоритмы сортировки', time: 30 },
                { id: '15-05', file: '05-hash-tables', title: 'Хеш-таблицы', time: 25 },
                { id: '15-06', file: '06-trees', title: 'Деревья и обход', time: 30 },
                { id: '15-07', file: '07-graphs', title: 'Графы (BFS, DFS)', time: 35 },
                { id: '15-08', file: '08-module-quiz', title: 'Итоговый квиз', time: 20 },
            ]
        },
        // ─── КАЧЕСТВО КОДА ────────────────────────────────────────────
        {
            id: '06',
            path: '06-testing',
            title: 'Тестирование в Go',
            icon: 'bi-clipboard-check',
            description: 'Unit-тесты, table-driven, testify, моки, бенчмарки, покрытие',
            lessons: [
                { id: '06-01', file: '01-testing-basics', title: 'Основы тестирования', time: 20 },
                { id: '06-02', file: '02-table-driven', title: 'Table-driven тесты', time: 20 },
                { id: '06-03', file: '03-testify', title: 'Библиотека testify', time: 15 },
                { id: '06-04', file: '04-mocking', title: 'Моки и стабы', time: 20 },
                { id: '06-05', file: '05-benchmarks', title: 'Бенчмарки', time: 15 },
                { id: '06-06', file: '06-coverage', title: 'Покрытие кода', time: 15 },
                { id: '06-07', file: '07-module-quiz', title: 'Итоговый квиз', time: 15 },
            ]
        },
        // ─── WEB И API ────────────────────────────────────────────────
        {
            id: '07',
            path: '07-http-servers',
            title: 'HTTP-серверы',
            icon: 'bi-globe',
            description: 'net/http, handlers, middleware, chi, JSON API',
            lessons: [
                { id: '07-01', file: '01-net-http', title: 'Пакет net/http', time: 25 },
                { id: '07-02', file: '02-handlers', title: 'Обработчики и мультиплексор', time: 20 },
                { id: '07-03', file: '03-request-response', title: 'Request и Response', time: 20 },
                { id: '07-04', file: '04-middleware', title: 'Middleware', time: 25 },
                { id: '07-05', file: '05-chi-router', title: 'Роутер chi', time: 20 },
                { id: '07-06', file: '06-json-api', title: 'JSON API', time: 25 },
                { id: '07-07', file: '07-module-quiz', title: 'Итоговый квиз', time: 15 },
            ]
        },
        {
            id: '08',
            path: '08-rest-api',
            title: 'REST API',
            icon: 'bi-link-45deg',
            description: 'Принципы REST, CRUD, валидация, JWT, тестирование API',
            lessons: [
                { id: '08-01', file: '01-rest-principles', title: 'Принципы REST', time: 20 },
                { id: '08-02', file: '02-crud-api', title: 'CRUD API', time: 25 },
                { id: '08-03', file: '03-validation', title: 'Валидация входных данных', time: 20 },
                { id: '08-04', file: '04-authentication', title: 'Аутентификация (JWT)', time: 25 },
                { id: '08-05', file: '05-error-responses', title: 'Обработка ошибок в API', time: 20 },
                { id: '08-06', file: '06-api-testing', title: 'Тестирование API (httptest)', time: 25 },
                { id: '08-07', file: '07-module-quiz', title: 'Итоговый квиз', time: 15 },
            ]
        },
        // ─── БД И КЭШ ────────────────────────────────────────────────
        {
            id: '17',
            path: '17-redis',
            title: 'Redis и Кэширование',
            icon: 'bi-hdd-stack',
            description: 'In-memory DB, кэширование, Pub/Sub, персистентность',
            lessons: [
                { id: '17-01', file: '01-redis-basics', title: 'Что такое Redis?', time: 20 },
                { id: '17-02', file: '02-data-types', title: 'Типы данных Redis', time: 25 },
                { id: '17-03', file: '03-redis-go', title: 'Работа с Redis в Go', time: 25 },
                { id: '17-04', file: '04-caching-patterns', title: 'Паттерны кэширования', time: 30 },
                { id: '17-05', file: '05-pub-sub', title: 'Pub/Sub очереди', time: 20 },
                { id: '17-06', file: '06-module-quiz', title: 'Итоговый квиз', time: 15 },
            ]
        },
        {
            id: '10',
            path: '10-sql-postgresql',
            title: 'SQL и PostgreSQL',
            icon: 'bi-database',
            description: 'SQL основы, PostgreSQL, database/sql, транзакции, миграции',
            lessons: [
                { id: '10-01', file: '01-sql-basics', title: 'Основы SQL', time: 25 },
                { id: '10-02', file: '02-postgresql', title: 'PostgreSQL: основы', time: 20 },
                { id: '10-03', file: '03-database-sql', title: 'Пакет database/sql', time: 25 },
                { id: '10-04', file: '04-queries', title: 'SELECT, INSERT, UPDATE, DELETE', time: 25 },
                { id: '10-05', file: '05-transactions', title: 'Транзакции', time: 20 },
                { id: '10-06', file: '06-migrations', title: 'Миграции', time: 20 },
                { id: '10-07', file: '07-module-quiz', title: 'Итоговый квиз', time: 15 },
            ]
        },
        {
            id: '11',
            path: '11-orm-gorm',
            title: 'ORM и GORM',
            icon: 'bi-arrow-repeat',
            description: 'GORM основы, модели, CRUD, связи, raw SQL vs ORM',
            lessons: [
                { id: '11-01', file: '01-orm-intro', title: 'Что такое ORM', time: 15 },
                { id: '11-02', file: '02-gorm-basics', title: 'Основы GORM', time: 20 },
                { id: '11-03', file: '03-models', title: 'Модели и соглашения', time: 20 },
                { id: '11-04', file: '04-crud-gorm', title: 'CRUD в GORM', time: 25 },
                { id: '11-05', file: '05-associations', title: 'Связи', time: 25 },
                { id: '11-06', file: '06-raw-sql-vs-orm', title: 'Raw SQL vs ORM', time: 20 },
                { id: '11-07', file: '07-module-quiz', title: 'Итоговый квиз', time: 15 },
            ]
        },
        // ─── АЛЬТЕРНАТИВНЫЕ ПРОТОКОЛЫ ────────────────────────────────
        {
            id: '09',
            path: '09-grpc',
            title: 'gRPC',
            icon: 'bi-broadcast',
            description: 'Protocol Buffers, gRPC сервер/клиент, REST vs gRPC',
            lessons: [
                { id: '09-01', file: '01-grpc-intro', title: 'Введение в gRPC', time: 20 },
                { id: '09-02', file: '02-protobuf', title: 'Protocol Buffers', time: 25 },
                { id: '09-03', file: '03-grpc-server', title: 'gRPC сервер', time: 25 },
                { id: '09-04', file: '04-grpc-client', title: 'gRPC клиент', time: 20 },
                { id: '09-05', file: '05-rest-vs-grpc', title: 'REST vs gRPC', time: 20 },
                { id: '09-06', file: '06-module-quiz', title: 'Итоговый квиз', time: 15 },
            ]
        },
        // ─── АРХИТЕКТУРА ──────────────────────────────────────────────
        {
            id: '12',
            path: '12-oop-solid',
            title: 'ООП и SOLID в Go',
            icon: 'bi-building',
            description: 'ООП через интерфейсы, SOLID принципы, чистая архитектура',
            lessons: [
                { id: '12-01', file: '01-oop-in-go', title: 'ООП без классов', time: 20 },
                { id: '12-02', file: '02-solid-srp', title: 'SRP', time: 15 },
                { id: '12-03', file: '03-solid-ocp', title: 'OCP', time: 15 },
                { id: '12-04', file: '04-solid-lsp', title: 'LSP', time: 15 },
                { id: '12-05', file: '05-solid-isp', title: 'ISP', time: 15 },
                { id: '12-06', file: '06-solid-dip', title: 'DIP', time: 15 },
                { id: '12-07', file: '07-clean-architecture', title: 'Чистая архитектура', time: 25 },
                { id: '12-08', file: '08-module-quiz', title: 'Итоговый квиз', time: 15 },
            ]
        },
        // ─── ФИНАЛЬНЫЙ ПРОЕКТ ─────────────────────────────────────────
        {
            id: '14',
            path: '14-clean-code-project',
            title: 'Чистый код и проект',
            icon: 'bi-mortarboard',
            description: 'Clean code, нейминг, итоговый проект, подготовка к собеседованию',
            lessons: [
                { id: '14-01', file: '01-clean-code-principles', title: 'Принципы чистого кода', time: 20 },
                { id: '14-02', file: '02-naming-conventions', title: 'Нейминг в Go', time: 15 },
                { id: '14-03', file: '03-code-review', title: 'Code Review чеклист', time: 15 },
                { id: '14-04', file: '04-project-overview', title: 'Финальный проект: обзор', time: 20 },
                { id: '14-05', file: '05-project-api', title: 'Финальный проект: API', time: 30 },
                { id: '14-06', file: '06-project-db', title: 'Финальный проект: БД', time: 30 },
                { id: '14-07', file: '07-project-deploy', title: 'Финальный проект: деплой', time: 25 },
                { id: '14-08', file: '08-career-roadmap', title: 'Путь к работе Go-разработчиком', time: 30 },
            ]
        },
        // ─── СПЕЦИАЛИЗАЦИЯ / ФАКУЛЬТАТИВ ─────────────────────────────
        {
            id: '16',
            path: '16-advanced-sql',
            title: 'Продвинутый PostgreSQL',
            icon: 'bi-database-gear',
            description: 'Индексы, оптимизация запросов, EXPLAIN, транзакции, ACID',
            lessons: [
                { id: '16-01', file: '01-indexing', title: 'Индексы (B-tree, Hash, GIN)', time: 30 },
                { id: '16-02', file: '02-query-optimization', title: 'Оптимизация запросов', time: 30 },
                { id: '16-03', file: '03-explain', title: 'EXPLAIN и планировщик', time: 25 },
                { id: '16-04', file: '04-joins-deep-dive', title: 'Виды JOIN (Deep Dive)', time: 25 },
                { id: '16-05', file: '05-advanced-transactions', title: 'Уровни изоляции транзакций', time: 30 },
                { id: '16-06', file: '07-locking', title: 'Блокировки (Locks)', time: 20 },
                { id: '16-07', file: '08-module-quiz', title: 'Итоговый квиз', time: 20 },
            ]
        },
        {
            id: '18',
            path: '18-web-frameworks',
            title: 'Web-фреймворки (Echo)',
            icon: 'bi-terminal',
            description: 'Echo Framework, Routing, Middleware, Binding, Validation',
            lessons: [
                { id: '18-01', file: '01-intro-echo', title: 'Введение в Echo', time: 20 },
                { id: '18-02', file: '02-echo-routing', title: 'Роутинг и параметры', time: 20 },
                { id: '18-03', file: '03-middleware-echo', title: 'Middleware в Echo', time: 25 },
                { id: '18-04', file: '04-binding-validation', title: 'Binding и Валидация', time: 25 },
                { id: '18-05', file: '05-context', title: 'Context в Echo', time: 20 },
                { id: '18-06', file: '06-project-refactor', title: 'Рефакторинг проекта на Echo', time: 40 },
                { id: '18-07', file: '07-module-quiz', title: 'Итоговый квиз', time: 15 },
                { id: '18-08', file: '08-interview-prep', title: 'Финальная подготовка к собеседованию', time: 45 },
            ]
        },
        {
            id: '19',
            path: '19-generics',
            title: 'Дженерики (Generics)',
            icon: 'bi-braces',
            description: 'Type Parameters, Constraints, Generic Types & Functions',
            lessons: [
                { id: '19-01', file: '01-intro-generics', title: 'Введение в Дженерики', time: 20 },
                { id: '19-02', file: '02-constraints', title: 'Constraints и интерфейсы', time: 25 },
                { id: '19-03', file: '03-generic-types', title: 'Дженерик типы и структуры', time: 25 },
                { id: '19-04', file: '04-best-practices', title: 'Когда использовать дженерики', time: 20 },
                { id: '19-05', file: '05-module-quiz', title: 'Итоговый квиз', time: 15 },
            ]
        },
        {
            id: '20',
            path: '20-tooling',
            title: 'Tooling и CI/CD',
            icon: 'bi-tools',
            description: 'Makefile, Linters, GitHub Actions, Build tags',
            lessons: [
                { id: '20-01', file: '01-go-tools', title: 'Go инструменты', time: 20 },
                { id: '20-02', file: '02-linting', title: 'Линтеры (golangci-lint)', time: 25 },
                { id: '20-03', file: '03-build-tags', title: 'Build Tags и ldflags', time: 20 },
                { id: '20-04', file: '04-github-actions', title: 'CI/CD с GitHub Actions', time: 30 },
                { id: '20-05', file: '05-module-quiz', title: 'Итоговый квиз', time: 15 },
            ]
        },
        {
            id: '21',
            path: '21-microservices',
            title: 'Микросервисы',
            icon: 'bi-diagram-2',
            description: 'Архитектура, gRPC 2.0, Service Mesh basics',
            lessons: [
                { id: '21-01', file: '01-microservices-intro', title: 'Монолит vs Микросервисы', time: 25 },
                { id: '21-02', file: '02-grpc-advanced', title: 'Продвинутый gRPC', time: 30 },
                { id: '21-03', file: '03-api-gateway', title: 'API Gateway паттерн', time: 25 },
                { id: '21-04', file: '04-observability', title: 'Observability (Tracing/Metrics)', time: 30 },
                { id: '21-05', file: '05-module-quiz', title: 'Итоговый квиз', time: 20 },
            ]
        },
    ],

    getModule(moduleId) {
        return this.modules.find(m => m.id === moduleId);
    },

    getLesson(lessonId) {
        for (const mod of this.modules) {
            const lesson = mod.lessons.find(l => l.id === lessonId);
            if (lesson) return { ...lesson, module: mod };
        }
        return null;
    },

    getLessonByModuleAndId(moduleId, lessonId) {
        const mod = this.getModule(moduleId);
        if (!mod) return null;
        return mod.lessons.find(l => l.id === lessonId);
    },

    getNextLesson(lessonId) {
        const allLessons = this.getAllLessons();
        const idx = allLessons.findIndex(l => l.id === lessonId);
        return idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1] : null;
    },

    getPrevLesson(lessonId) {
        const allLessons = this.getAllLessons();
        const idx = allLessons.findIndex(l => l.id === lessonId);
        return idx > 0 ? allLessons[idx - 1] : null;
    },

    getAllLessons() {
        const all = [];
        for (const mod of this.modules) {
            for (const lesson of mod.lessons) {
                all.push({ ...lesson, moduleId: mod.id, modulePath: mod.path, moduleTitle: mod.title });
            }
        }
        return all;
    },

    getTotalLessonCount() {
        return this.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    },

    getTotalTime() {
        return this.modules.reduce((sum, m) =>
            sum + m.lessons.reduce((s, l) => s + (l.time || 0), 0), 0);
    },

    search(query) {
        if (!query || query.length < 2) return [];
        const q = query.toLowerCase();
        const results = [];
        for (const mod of this.modules) {
            for (const lesson of mod.lessons) {
                const title = lesson.title.toLowerCase();
                const modTitle = mod.title.toLowerCase();
                if (title.includes(q) || modTitle.includes(q)) {
                    results.push({
                        ...lesson,
                        moduleId: mod.id,
                        moduleTitle: mod.title,
                        moduleIcon: mod.icon
                    });
                }
            }
        }
        return results;
    }
};
