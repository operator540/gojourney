export default {
  id: '16-06',
  title: 'Полнотекстовый поиск в PostgreSQL',
  description: 'tsvector, tsquery, pg_trgm, GIN-индексы. Строим поиск как в Google прямо в Postgres.',
  estimatedTime: 30,
  xpReward: 25,

  sections: [
    {
      type: 'theory',
      content: `
        <h2>Зачем не LIKE?</h2>
        <p>Представьте библиотеку. <code>LIKE '%книга%'</code> — это охранник, который читает каждый ярлык на каждой полке от начала до конца. Полнотекстовый поиск — это <strong>предметный указатель</strong> в конце книги: сразу открываешь нужную страницу.</p>
        <p>Три проблемы <code>LIKE '%text%'</code>:</p>
        <ol>
          <li><strong>Не использует B-Tree индексы</strong> — только Sequential Scan</li>
          <li><strong>Нет морфологии</strong> — "бежит" не найдёт "бег"</li>
          <li><strong>Нет ранжирования</strong> — не знает, насколько результат релевантен</li>
        </ol>
        <p>PostgreSQL имеет встроенный полнотекстовый поиск уровня Elasticsearch для большинства задач.</p>
      `
    },
    {
      type: 'theory',
      content: `
        <h2>tsvector и tsquery — сердце FTS</h2>
        <p><code>tsvector</code> — нормализованный документ. Каждое слово приводится к <strong>лексеме</strong> (нормальной форме): "бежит", "бежал", "бежать" → <code>бежа</code>. Позиции слов сохраняются для ранжирования.</p>
        <p><code>tsquery</code> — поисковый запрос с операторами: <code>&amp;</code> (AND), <code>|</code> (OR), <code>!</code> (NOT), <code>&lt;-&gt;</code> (FOLLOWED BY).</p>

        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead>
            <tr style="background:var(--surface-2)">
              <th style="padding:10px;border:1px solid var(--border);text-align:left">Функция</th>
              <th style="padding:10px;border:1px solid var(--border);text-align:left">Описание</th>
              <th style="padding:10px;border:1px solid var(--border);text-align:left">Пример результата</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:10px;border:1px solid var(--border)"><code>to_tsvector('russian', text)</code></td>
              <td style="padding:10px;border:1px solid var(--border)">Преобразует текст в tsvector</td>
              <td style="padding:10px;border:1px solid var(--border)"><code>'бежа':1 'быстр':2</code></td>
            </tr>
            <tr style="background:var(--surface-2)">
              <td style="padding:10px;border:1px solid var(--border)"><code>to_tsquery('russian', text)</code></td>
              <td style="padding:10px;border:1px solid var(--border)">Создаёт поисковый запрос (требует нормализации)</td>
              <td style="padding:10px;border:1px solid var(--border)"><code>'бежа' &amp; 'быстр'</code></td>
            </tr>
            <tr>
              <td style="padding:10px;border:1px solid var(--border)"><code>plainto_tsquery('russian', text)</code></td>
              <td style="padding:10px;border:1px solid var(--border)">Простой текст → tsquery (AND между словами)</td>
              <td style="padding:10px;border:1px solid var(--border)"><code>'бежа' &amp; 'быстр'</code></td>
            </tr>
            <tr style="background:var(--surface-2)">
              <td style="padding:10px;border:1px solid var(--border)"><code>websearch_to_tsquery('russian', text)</code></td>
              <td style="padding:10px;border:1px solid var(--border)">Google-стиль: "фраза", OR, -минус</td>
              <td style="padding:10px;border:1px solid var(--border)"><code>'фраз' &lt;-&gt; 'запрос'</code></td>
            </tr>
            <tr>
              <td style="padding:10px;border:1px solid var(--border)"><code>ts_rank(tsvector, tsquery)</code></td>
              <td style="padding:10px;border:1px solid var(--border)">Вычисляет релевантность (0..1)</td>
              <td style="padding:10px;border:1px solid var(--border)"><code>0.0759</code></td>
            </tr>
          </tbody>
        </table>
      `
    },
    {
      type: 'code-example',
      language: 'sql',
      title: 'Полнотекстовый поиск: от простого к production',
      code: `-- 1. Простой поиск без индекса (медленно, для понимания)
SELECT title, body
FROM articles
WHERE to_tsvector('russian', title || ' ' || body)
      @@ plainto_tsquery('russian', 'PostgreSQL индексы');

-- 2. Добавляем ранжирование
SELECT
    title,
    ts_rank(
        to_tsvector('russian', title || ' ' || body),
        plainto_tsquery('russian', 'PostgreSQL индексы')
    ) AS rank
FROM articles
WHERE to_tsvector('russian', title || ' ' || body)
      @@ plainto_tsquery('russian', 'PostgreSQL индексы')
ORDER BY rank DESC
LIMIT 10;

-- 3. Production-подход: добавить столбец tsvector с автообновлением
ALTER TABLE articles ADD COLUMN search_vector tsvector;

-- Заполнить существующие данные (title весит больше body — вес A/B)
UPDATE articles SET search_vector =
    setweight(to_tsvector('russian', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(body, '')), 'B');

-- Триггер для автоматического обновления
CREATE OR REPLACE FUNCTION articles_search_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('russian', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('russian', coalesce(NEW.body, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_search_trigger
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION articles_search_update();

-- 4. GIN индекс на столбец (мгновенный поиск)
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

-- 5. Быстрый запрос с подсветкой результатов
SELECT
    title,
    ts_headline('russian', body,
        plainto_tsquery('russian', $1),
        'MaxWords=50, MinWords=20, StartSel=<mark>, StopSel=</mark>'
    ) AS snippet,
    ts_rank(search_vector, plainto_tsquery('russian', $1)) AS rank
FROM articles
WHERE search_vector @@ plainto_tsquery('russian', $1)
ORDER BY rank DESC
LIMIT 20;`,
      explanation: 'setweight присваивает весовые категории A, B, C, D (убывает важность). Заголовок важнее тела статьи — ts_rank учитывает это. GIN индекс ускоряет @@ оператор в тысячи раз.'
    },
    {
      type: 'theory',
      content: `
        <h2>pg_trgm — поиск с опечатками</h2>
        <p>Расширение <code>pg_trgm</code> (trigram) разбивает строки на тройки символов ("три" → "тр", "ри", "и") и сравнивает наборы. Это даёт:</p>
        <ul>
          <li><strong>Fuzzy search</strong> — "postgresq" найдёт "postgresql"</li>
          <li><strong>ILIKE с индексом</strong> — <code>LIKE '%text%'</code> теперь использует GIN/GiST</li>
          <li><strong>Схожесть строк</strong> — функция <code>similarity()</code> возвращает 0..1</li>
        </ul>

        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead>
            <tr style="background:var(--surface-2)">
              <th style="padding:10px;border:1px solid var(--border);text-align:left">Оператор/Функция</th>
              <th style="padding:10px;border:1px solid var(--border);text-align:left">Что делает</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:10px;border:1px solid var(--border)"><code>similarity(a, b)</code></td>
              <td style="padding:10px;border:1px solid var(--border)">Число от 0 до 1: насколько похожи строки</td>
            </tr>
            <tr style="background:var(--surface-2)">
              <td style="padding:10px;border:1px solid var(--border)"><code>a % b</code></td>
              <td style="padding:10px;border:1px solid var(--border)">similarity(a,b) > 0.3 (threshold)</td>
            </tr>
            <tr>
              <td style="padding:10px;border:1px solid var(--border)"><code>a &lt;-&gt; b</code></td>
              <td style="padding:10px;border:1px solid var(--border)">Расстояние (1 - similarity), удобно для ORDER BY</td>
            </tr>
            <tr style="background:var(--surface-2)">
              <td style="padding:10px;border:1px solid var(--border)"><code>SHOW pg_trgm.similarity_threshold</code></td>
              <td style="padding:10px;border:1px solid var(--border)">Текущий порог для оператора %</td>
            </tr>
          </tbody>
        </table>
      `
    },
    {
      type: 'code-example',
      language: 'sql',
      title: 'pg_trgm: fuzzy search и ILIKE с индексом',
      code: `-- Включить расширение
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN индекс для ILIKE и % оператора
CREATE INDEX idx_users_name_trgm ON users
    USING GIN(name gin_trgm_ops);

-- Теперь это ИСПОЛЬЗУЕТ индекс (раньше — Seq Scan!)
SELECT id, name FROM users
WHERE name ILIKE '%алекс%';

-- Fuzzy поиск: найти похожие имена (с опечатками)
SELECT name, similarity(name, 'Александр') AS sim
FROM users
WHERE name % 'Александр'  -- similarity > 0.3
ORDER BY sim DESC
LIMIT 10;

-- Автодополнение: начинается с введённых символов
SELECT DISTINCT name
FROM users
WHERE name ILIKE $1 || '%'
ORDER BY name
LIMIT 10;

-- Комбинация: FTS + pg_trgm для лучшего результата
SELECT
    p.title,
    ts_rank(p.search_vector, query) AS fts_rank,
    similarity(p.title, $1) AS trgm_sim
FROM products p,
     plainto_tsquery('russian', $1) AS query
WHERE p.search_vector @@ query
   OR p.title % $1
ORDER BY fts_rank DESC, trgm_sim DESC
LIMIT 20;`,
      explanation: 'gin_trgm_ops — специальный класс операторов для GIN индекса с тригаммами. Без него ILIKE всё равно будет Seq Scan. Комбинирование FTS и pg_trgm даёт и морфологию, и толерантность к опечаткам.'
    },
    {
      type: 'code-example',
      language: 'go',
      title: 'Полнотекстовый поиск в Go (pgx)',
      code: `package search

import (
    "context"
    "fmt"

    "github.com/jackc/pgx/v5/pgxpool"
)

type Article struct {
    ID      int
    Title   string
    Snippet string
    Rank    float64
}

type SearchService struct {
    db *pgxpool.Pool
}

func NewSearchService(db *pgxpool.Pool) *SearchService {
    return &SearchService{db: db}
}

// Search выполняет полнотекстовый поиск статей с подсветкой результата
func (s *SearchService) Search(ctx context.Context, query string, limit, offset int) ([]Article, error) {
    sql := \`
        SELECT
            id,
            title,
            ts_headline(
                'russian', body,
                websearch_to_tsquery('russian', $1),
                'MaxWords=40, MinWords=15, StartSel=<b>, StopSel=</b>'
            ) AS snippet,
            ts_rank(search_vector, websearch_to_tsquery('russian', $1)) AS rank
        FROM articles
        WHERE search_vector @@ websearch_to_tsquery('russian', $1)
        ORDER BY rank DESC
        LIMIT $2 OFFSET $3
    \`

    rows, err := s.db.Query(ctx, sql, query, limit, offset)
    if err != nil {
        return nil, fmt.Errorf("search query: %w", err)
    }
    defer rows.Close()

    var results []Article
    for rows.Next() {
        var a Article
        if err := rows.Scan(&a.ID, &a.Title, &a.Snippet, &a.Rank); err != nil {
            return nil, fmt.Errorf("scan article: %w", err)
        }
        results = append(results, a)
    }
    return results, rows.Err()
}

// FuzzySearch — поиск с опечатками через pg_trgm
func (s *SearchService) FuzzySearch(ctx context.Context, query string) ([]Article, error) {
    sql := \`
        SELECT id, title, 0 AS snippet,
               similarity(title, $1) AS rank
        FROM articles
        WHERE title % $1
        ORDER BY rank DESC
        LIMIT 10
    \`
    rows, err := s.db.Query(ctx, sql, query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var results []Article
    for rows.Next() {
        var a Article
        var _ string // snippet placeholder
        if err := rows.Scan(&a.ID, &a.Title, &_, &a.Rank); err != nil {
            return nil, err
        }
        results = append(results, a)
    }
    return results, rows.Err()
}`,
      explanation: 'websearch_to_tsquery понимает Google-синтаксис: "точная фраза", OR, -исключить. Это удобнее для пользовательского ввода, чем to_tsquery (который требует валидных лексем).'
    },
    {
      type: 'info-box',
      variant: 'tip',
      content: `
        <p><strong>Когда PostgreSQL FTS достаточно, а когда нужен Elasticsearch?</strong></p>
        <ul>
          <li><strong>Postgres FTS:</strong> таблица до 50-100M записей, поиск по 2-3 полям, нет сложной агрегации фасетов</li>
          <li><strong>Elasticsearch:</strong> сотни миллионов документов, сложные фасеты/агрегации, мультиязычность, нужен горизонтальный масштаб</li>
        </ul>
        <p>Для большинства проектов <strong>Postgres с GIN-индексом более чем достаточен</strong> и не требует отдельной инфраструктуры.</p>
      `
    },
    {
      type: 'editor',
      title: 'Практика: поиск с ранжированием',
      instructions: 'Напишите SQL-запрос для поиска продуктов по названию и описанию. Заголовок (name) должен иметь больший вес (A), описание (description) — меньший (B). Используйте $1 как параметр поиска.',
      starterCode: `-- Таблица: products (id, name, description, search_vector)
-- GIN индекс уже создан на search_vector

-- Напишите запрос:
-- 1. Ищет по search_vector через @@
-- 2. Ранжирует через ts_rank
-- 3. Возвращает id, name, rank
-- 4. Сортирует по убыванию rank
-- 5. Лимит 10 строк

SELECT
    -- ???
FROM products
WHERE -- ???
ORDER BY -- ???
LIMIT 10;`,
      hints: [
        'plainto_tsquery(\'russian\', $1) — для преобразования пользовательского запроса',
        'ts_rank(search_vector, plainto_tsquery(...)) — для ранжирования',
        'Оператор @@ проверяет совпадение tsvector с tsquery'
      ]
    },
    {
      type: 'quiz',
      questions: [
        {
          id: 'q1606-1',
          type: 'single',
          question: 'Что такое tsvector?',
          options: [
            'Тип данных для хранения векторов чисел',
            'Нормализованный список лексем с позициями для полнотекстового поиска',
            'Специальный индекс PostgreSQL',
            'Функция для разбивки строки на слова'
          ],
          correct: 1,
          explanation: 'tsvector хранит нормализованные лексемы (основные формы слов) и их позиции в тексте. Например, "бежит быстро" → \'бежа\':1 \'быстр\':2. Используется для полнотекстового поиска.'
        },
        {
          id: 'q1606-2',
          type: 'single',
          question: 'Какой тип индекса нужно создать для tsvector-колонки?',
          options: ['B-Tree', 'Hash', 'GIN', 'BRIN'],
          correct: 2,
          explanation: 'GIN (Generalized Inverted Index) — оптимален для tsvector. Он хранит инвертированный индекс: каждая лексема указывает на список документов, содержащих её. GiST тоже работает, но GIN быстрее при поиске.'
        },
        {
          id: 'q1606-3',
          type: 'single',
          question: 'Какая функция создаёт tsquery в "google-стиле" (поддерживает "фразы", OR, -исключения)?',
          options: [
            'to_tsquery()',
            'plainto_tsquery()',
            'websearch_to_tsquery()',
            'phraseto_tsquery()'
          ],
          correct: 2,
          explanation: 'websearch_to_tsquery() понимает: "точная фраза" (фразовый поиск), OR (дизъюнкция), -слово (исключение). Лучший выбор для пользовательских поисковых запросов.'
        },
        {
          id: 'q1606-4',
          type: 'single',
          question: 'Чем pg_trgm отличается от стандартного FTS?',
          options: [
            'pg_trgm работает только с английским языком',
            'pg_trgm поддерживает поиск с опечатками и ускоряет ILIKE \'%text%\'',
            'pg_trgm — это замена GIN индекса',
            'pg_trgm хранит данные в оперативной памяти'
          ],
          correct: 1,
          explanation: 'pg_trgm разбивает строки на тройки символов (триграммы) и сравнивает наборы. Это даёт fuzzy search (устойчивость к опечаткам) и позволяет использовать GIN/GiST индексы для ILIKE \'%text%\', что обычно невозможно с B-Tree.'
        },
        {
          id: 'q1606-5',
          type: 'single',
          question: 'Что делает оператор @@ в PostgreSQL?',
          options: [
            'Конкатенирует строки',
            'Проверяет, содержит ли tsvector совпадение с tsquery',
            'Создаёт индекс',
            'Вычисляет схожесть строк'
          ],
          correct: 1,
          explanation: '@@ — оператор полнотекстового совпадения. tsvector @@ tsquery возвращает true, если документ содержит слова из запроса. Используется в WHERE для фильтрации.'
        },
        {
          id: 'q1606-6',
          type: 'code-fill',
          question: 'Функция для вычисления релевантности совпадения в полнотекстовом поиске:',
          template: 'SELECT ts_____( search_vector, query ) AS rank FROM articles;',
          correct: 'rank',
          caseSensitive: false,
          explanation: 'ts_rank() вычисляет число от 0 до 1 на основе частоты и позиции совпадений. Чем выше — тем релевантнее документ. ts_rank_cd() дополнительно учитывает близость слов.'
        },
        {
          id: 'q1606-7',
          type: 'multiple',
          question: 'Выберите ВСЕ преимущества хранения search_vector как отдельного столбца:',
          options: [
            'Не нужно вычислять to_tsvector() при каждом поиске',
            'Можно создать GIN индекс',
            'Автоматически обновляется без триггера',
            'Поддерживает взвешенные поля (setweight)'
          ],
          correct: [0, 1, 3],
          explanation: 'Отдельный столбец: быстрее поиск (индекс), поддерживает setweight. Но он НЕ обновляется автоматически — нужен триггер или обновление в приложении.'
        }
      ]
    }
  ]
};
