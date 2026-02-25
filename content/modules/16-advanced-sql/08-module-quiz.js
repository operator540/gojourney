export default {
  id: '16-08',
  title: 'Итоговый квиз: Advanced SQL',
  description: 'Проверь знания по индексам, EXPLAIN, оптимизации запросов, транзакциям, уровням изоляции, полнотекстовому поиску и блокировкам.',
  estimatedTime: 20,
  xpReward: 40,
  sections: [
    {
      type: 'theory',
      content: `<h2>Проверка знаний: Advanced SQL</h2>
<p>Этот квиз покрывает все темы модуля 16. Здесь нет простых вопросов — только реальные сценарии, с которыми сталкиваются backend-разработчики в продакшене.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr style="background:var(--surface-2)">
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Тема</th>
      <th style="padding:10px;border:1px solid var(--border);text-align:left">Вопросов</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)">Индексы (типы, составные, частичные)</td>
      <td style="padding:10px;border:1px solid var(--border)">3</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)">EXPLAIN и оптимизация</td>
      <td style="padding:10px;border:1px solid var(--border)">2</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)">Транзакции и изоляция</td>
      <td style="padding:10px;border:1px solid var(--border)">3</td>
    </tr>
    <tr style="background:var(--surface-2)">
      <td style="padding:10px;border:1px solid var(--border)">Полнотекстовый поиск</td>
      <td style="padding:10px;border:1px solid var(--border)">2</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid var(--border)">Блокировки и deadlock</td>
      <td style="padding:10px;border:1px solid var(--border)">2</td>
    </tr>
  </tbody>
</table>`
    },
    {
      type: 'quiz',
      questions: [
        {
          id: 'q1608-1',
          type: 'single',
          question: 'Таблица users (10M строк). Запрос: WHERE is_active = TRUE (активных 8%). Какой индекс оптимален?',
          options: [
            'CREATE INDEX ON users(is_active) — обычный B-tree',
            'CREATE INDEX ON users(is_active) WHERE is_active = TRUE — частичный',
            'Индекс не нужен — PostgreSQL справится Seq Scan',
            'CREATE INDEX ON users USING HASH (is_active)'
          ],
          correct: 1,
          explanation: 'Частичный индекс WHERE is_active = TRUE индексирует только 8% строк (800K вместо 10M). Он в 12x меньше полного индекса, быстрее обновляется при INSERT/UPDATE, и PostgreSQL всегда выберет его для запросов по активным пользователям. Hash-индекс не подходит — нужна сортировка.'
        },
        {
          id: 'q1608-2',
          type: 'single',
          question: 'EXPLAIN ANALYZE показывает: "Seq Scan on orders (cost=0.00..45820.00 rows=1000000)" хотя индекс на user_id есть. Запрос: WHERE user_id = 5 AND deleted_at IS NULL. Причина?',
          options: [
            'Индекс повреждён',
            'PostgreSQL оценивает что вернётся слишком много строк или статистика устарела — нужен ANALYZE',
            'Нельзя использовать IS NULL в условии',
            'Нужно перезапустить PostgreSQL'
          ],
          correct: 1,
          explanation: 'Планировщик использует статистику (pg_statistic) для оценки числа строк. Если статистика устарела — он может недооценить или переоценить строки и выбрать Seq Scan. Решение: ANALYZE orders (обновить статистику). Также проверьте: может индекс некомпозитный и нужен (user_id, deleted_at).'
        },
        {
          id: 'q1608-3',
          type: 'single',
          question: 'Что такое Index-Only Scan и когда он возможен?',
          options: [
            'Сканирование только одного индекса без JOIN',
            'PostgreSQL отдаёт данные прямо из индекса без обращения к heap — когда все нужные колонки есть в индексе',
            'Сканирование индекса в обратном порядке',
            'Scan который пропускает NULL-значения'
          ],
          correct: 1,
          explanation: 'Index-Only Scan работает когда все колонки из SELECT и WHERE есть в индексе (через INCLUDE или как ключевые). PostgreSQL не идёт в heap за данными. Это в 2-5x быстрее обычного Index Scan. Требует актуальной visibility map (VACUUM).'
        },
        {
          id: 'q1608-4',
          type: 'single',
          question: 'В EXPLAIN ANALYZE вы видите "Rows Removed by Filter: 980000". Что это означает?',
          options: [
            'Индекс работает эффективно',
            'PostgreSQL прочитал 980K строк и отфильтровал их — индекс не используется или неэффективен',
            'Запрос удалил 980K строк',
            'WHERE условие некорректно'
          ],
          correct: 1,
          explanation: '"Rows Removed by Filter" — это строки которые PostgreSQL прочитал с диска но выбросил после проверки условия. Если это число большое — у вас либо нет нужного индекса, либо индекс неселективен. Нужно создать более точный индекс или переписать запрос.'
        },
        {
          id: 'q1608-5',
          type: 'single',
          question: 'Phantom Read — это:',
          options: [
            'Чтение NULL значений',
            'Чтение незафиксированных данных другой транзакции',
            'Повторный SELECT возвращает другой набор строк из-за INSERT/DELETE в другой транзакции',
            'Чтение из удалённой таблицы'
          ],
          correct: 2,
          explanation: 'Phantom Read: транзакция A выполняет SELECT WHERE age > 18 → 100 строк. Транзакция B вставляет новую строку с age=25 и делает COMMIT. Транзакция A повторяет тот же SELECT → 101 строка. "Фантомная" строка появилась. Защита: SERIALIZABLE или REPEATABLE READ (в PostgreSQL MVCC).'
        },
        {
          id: 'q1608-6',
          type: 'single',
          question: 'Вы делаете перевод денег. Нужно прочитать баланс и обновить его. Что защищает от race condition?',
          options: [
            'READ COMMITTED — достаточно для финансовых операций',
            'SELECT ... FOR UPDATE — блокирует строку для чтения-изменения',
            'Просто BEGIN/COMMIT без FOR UPDATE',
            'TRUNCATE перед операцией'
          ],
          correct: 1,
          explanation: 'SELECT ... FOR UPDATE блокирует строки до конца транзакции. Если другая транзакция пытается взять те же строки — она ждёт. Это пессимистичная блокировка. Без неё возможна race condition: T1 читает balance=1000, T2 читает balance=1000, оба списывают 900, итого -800 вместо -800 только один раз.'
        },
        {
          id: 'q1608-7',
          type: 'single',
          question: 'Как работает FOR UPDATE SKIP LOCKED и где это применяется?',
          options: [
            'Пропускает UPDATE если строка заблокирована — ускоряет массовые обновления',
            'При выборке пропускает уже заблокированные строки вместо ожидания — паттерн job queue',
            'Обновляет строки без блокировки (небезопасно)',
            'Блокирует только ключевые поля строки'
          ],
          correct: 1,
          explanation: 'SKIP LOCKED: если воркер 1 берёт задачу с id=1 (FOR UPDATE), воркер 2 при SKIP LOCKED пропустит её и возьмёт задачу с id=2. Без SKIP LOCKED воркер 2 ждал бы пока воркер 1 отпустит блокировку. Идеальный паттерн для распределённой очереди задач: SELECT * FROM tasks WHERE status=\'pending\' ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED.'
        },
        {
          id: 'q1608-8',
          type: 'single',
          question: 'Что такое tsvector в PostgreSQL?',
          options: [
            'Тип данных для хранения векторных изображений',
            'Нормализованное представление текста для полнотекстового поиска (токены + позиции + веса)',
            'Массив float для ML-эмбеддингов',
            'Тип для хранения JSON-документов'
          ],
          correct: 1,
          explanation: 'tsvector — специальный тип PostgreSQL для полнотекстового поиска. Содержит лексемы (нормализованные слова), их позиции в тексте и веса (A/B/C/D). to_tsvector(\'russian\', \'Бегущие по полю\') → \'бежа\':1 \'пол\':3 — стемминг убирает окончания. GIN-индекс на tsvector делает полнотекстовый поиск молниеносным.'
        },
        {
          id: 'q1608-9',
          type: 'single',
          question: 'Что происходит при Deadlock в PostgreSQL?',
          options: [
            'Обе транзакции ждут вечно',
            'PostgreSQL обнаруживает цикл зависимостей, выбирает "жертву" и откатывает её с ошибкой ERROR: deadlock detected',
            'PostgreSQL перезапускается',
            'Обе транзакции получают блокировки и продолжают'
          ],
          correct: 1,
          explanation: 'PostgreSQL имеет встроенный детектор deadlock (deadlock_timeout = 1s по умолчанию). Обнаружив циклическую зависимость, он выбирает одну транзакцию как "жертву" (обычно ту что держит меньше блокировок) и откатывает её с ошибкой. Другая транзакция продолжает работу. Приложение должно обрабатывать эту ошибку и повторять транзакцию.'
        },
        {
          id: 'q1608-10',
          type: 'single',
          question: 'Вы видите в EXPLAIN: "Hash Join (cost=1500..8500)". Что это значит?',
          options: [
            'PostgreSQL использует Hash-индекс',
            'PostgreSQL хеширует одну таблицу в памяти и проверяет по хешу строки второй — эффективен для больших равностных JOIN',
            'Запрос использует MD5 хеширование',
            'Ошибка в плане выполнения'
          ],
          correct: 1,
          explanation: 'Hash Join: PostgreSQL хеширует меньшую таблицу в памяти (hash table), затем для каждой строки большой таблицы ищет совпадения по хешу. Сложность O(n+m). Эффективен для больших таблиц без подходящего индекса. Если таблица не влезает в work_mem — спиллится на диск (→ медленнее).'
        },
        {
          id: 'q1608-11',
          type: 'single',
          question: 'Зачем нужен VACUUM в PostgreSQL?',
          options: [
            'Для сжатия данных на диске',
            'Для удаления "мёртвых" строк после UPDATE/DELETE (MVCC оставляет старые версии) и обновления visibility map',
            'Для перестроения индексов',
            'Для резервного копирования'
          ],
          correct: 1,
          explanation: 'PostgreSQL использует MVCC: UPDATE не перезаписывает строку, а создаёт новую версию. Старая версия остаётся как "мёртвая строка" (dead tuple). VACUUM находит и убирает мёртвые строки, освобождает место, обновляет visibility map (нужна для Index-Only Scan). AutoVACUUM делает это автоматически, но при массовых обновлениях может не справляться.'
        },
        {
          id: 'q1608-12',
          type: 'single',
          question: 'Какой оператор используется для полнотекстового поиска в PostgreSQL?',
          options: [
            'LIKE с символом %',
            '@@ — проверяет соответствие tsvector и tsquery',
            'CONTAINS()',
            'MATCH AGAINST()'
          ],
          correct: 1,
          explanation: 'Оператор @@ проверяет совпадение: to_tsvector(\'russian\', body) @@ to_tsquery(\'russian\', \'программ & го\') → true/false. tsquery поддерживает AND (&), OR (|), NOT (!), префикс (слово:*). Это нативный полнотекстовый поиск PostgreSQL без внешних инструментов.'
        }
      ]
    }
  ]
};
