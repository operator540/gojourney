export default {
    id: '14-06',
    title: 'Финальный проект: БД',
    description: 'Миграции, репозитории, SQL запросы для GoNetwork',
    estimatedTime: 30,
    xpReward: 28,

    sections: [
        {
            type: 'code-example',
            language: 'go',
            title: 'Миграции: схема БД',
            code: `-- migrations/001_create_users.up.sql
CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    bio           TEXT         NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- migrations/002_create_posts.up.sql
CREATE TABLE posts (
    id         BIGSERIAL PRIMARY KEY,
    author_id  BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- migrations/003_create_likes.up.sql
CREATE TABLE post_likes (
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id    BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

-- migrations/004_create_follows.up.sql
CREATE TABLE follows (
    follower_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);`,
            explanation: 'PRIMARY KEY (user_id, post_id) — составной ключ гарантирует уникальность лайка. CHECK (follower_id != following_id) — нельзя подписаться на себя. CASCADE — при удалении пользователя удаляются его лайки/подписки.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Repository: пользователи',
            code: `// internal/repository/user.go
package repository

import (
    "context"
    "database/sql"
    "errors"

    "gonetwork/internal/domain"
)

type UserRepository struct {
    db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user domain.User) (*domain.User, error) {
    query := \`
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, username, email, bio, created_at, updated_at
    \`
    var u domain.User
    err := r.db.QueryRowContext(ctx, query,
        user.Username, user.Email, user.PasswordHash,
    ).Scan(&u.ID, &u.Username, &u.Email, &u.Bio, &u.CreatedAt, &u.UpdatedAt)

    if err != nil {
        if isUniqueViolation(err) {
            return nil, domain.ErrAlreadyExists
        }
        return nil, err
    }
    return &u, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id int64) (*domain.User, error) {
    query := \`
        SELECT id, username, email, bio, created_at, updated_at
        FROM users WHERE id = $1
    \`
    var u domain.User
    err := r.db.QueryRowContext(ctx, query, id).
        Scan(&u.ID, &u.Username, &u.Email, &u.Bio, &u.CreatedAt, &u.UpdatedAt)

    if errors.Is(err, sql.ErrNoRows) {
        return nil, domain.ErrNotFound
    }
    if err != nil {
        return nil, err
    }
    return &u, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
    query := \`
        SELECT id, username, email, password_hash, bio, created_at, updated_at
        FROM users WHERE email = $1
    \`
    var u domain.User
    err := r.db.QueryRowContext(ctx, query, email).
        Scan(&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.Bio, &u.CreatedAt, &u.UpdatedAt)

    if errors.Is(err, sql.ErrNoRows) {
        return nil, domain.ErrNotFound
    }
    return &u, err
}

func isUniqueViolation(err error) bool {
    // pq.Error code 23505 = unique_violation
    return err != nil && contains(err.Error(), "unique")
}

func contains(s, substr string) bool {
    return len(s) >= len(substr) && (s == substr ||
        len(s) > 0 && containsStr(s, substr))
}

func containsStr(s, sub string) bool {
    for i := 0; i <= len(s)-len(sub); i++ {
        if s[i:i+len(sub)] == sub { return true }
    }
    return false
}`,
            explanation: 'RETURNING — PostgreSQL возвращает вставленную запись, не нужен отдельный SELECT. sql.ErrNoRows → domain.ErrNotFound — маппинг DB-ошибки в доменную. GetByEmail включает password_hash для аутентификации.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Repository: лента с Redis кэшем',
            code: `// internal/repository/feed.go
package repository

import (
    "context"
    "database/sql"
    "encoding/json"
    "fmt"
    "time"

    "github.com/redis/go-redis/v9"
    "gonetwork/internal/domain"
)

type FeedRepository struct {
    db  *sql.DB
    rdb *redis.Client
}

// GetFeed возвращает посты от пользователей на которых подписан userID
func (r *FeedRepository) GetFeed(ctx context.Context, userID int64, limit int) ([]domain.Post, error) {
    // Проверяем кэш
    cacheKey := fmt.Sprintf("feed:%d", userID)
    if cached, err := r.rdb.Get(ctx, cacheKey).Bytes(); err == nil {
        var posts []domain.Post
        if err := json.Unmarshal(cached, &posts); err == nil {
            return posts, nil
        }
    }

    // SQL: посты от подписок + лайки через JOIN
    query := \`
        SELECT
            p.id, p.author_id, p.content, p.created_at,
            u.username, u.bio,
            COUNT(pl.post_id) as likes_count
        FROM posts p
        JOIN users u ON u.id = p.author_id
        JOIN follows f ON f.following_id = p.author_id AND f.follower_id = $1
        LEFT JOIN post_likes pl ON pl.post_id = p.id
        GROUP BY p.id, u.id
        ORDER BY p.created_at DESC
        LIMIT $2
    \`

    rows, err := r.db.QueryContext(ctx, query, userID, limit)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var posts []domain.Post
    for rows.Next() {
        var p domain.Post
        p.Author = &domain.User{}
        err := rows.Scan(
            &p.ID, &p.AuthorID, &p.Content, &p.CreatedAt,
            &p.Author.Username, &p.Author.Bio,
            &p.LikesCount,
        )
        if err != nil {
            return nil, err
        }
        posts = append(posts, p)
    }
    if err := rows.Err(); err != nil {
        return nil, err
    }

    // Кладём в кэш на 1 минуту
    if data, err := json.Marshal(posts); err == nil {
        r.rdb.Set(ctx, cacheKey, data, time.Minute)
    }

    return posts, nil
}

// Like — добавить лайк, инвалидировать кэш лент
func (r *FeedRepository) Like(ctx context.Context, userID, postID int64) error {
    _, err := r.db.ExecContext(ctx,
        "INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)",
        userID, postID,
    )
    if err != nil {
        if isUniqueViolation(err) {
            return domain.ErrAlreadyExists
        }
        return err
    }

    // Инвалидируем кэш ленты пользователя
    r.rdb.Del(ctx, fmt.Sprintf("feed:%d", userID))
    return nil
}`,
            explanation: 'JOIN follows — только посты от подписок. COUNT(pl.post_id) — количество лайков без N+1 запросов. После лайка инвалидируем кэш — следующий запрос ленты загрузит свежие данные.'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Зачем всегда нужен defer rows.Close() после sql.QueryContext?',
                    options: [
                        'Освобождает соединение обратно в pool когда мы закончили с результатами',
                        'Коммитит транзакцию',
                        'Закрывает БД соединение навсегда',
                        'Это опционально в Go'
                    ],
                    correct: 0,
                    explanation: 'rows.Close() обязателен: без него соединение из pool не освобождается. При ошибке в rows.Next() — defer гарантирует вызов Close. Без Close при N запросах — connection pool истощится.'
                }
            ]
        }
    ]
};
