export default {
    id: '06-06',
    title: 'Покрытие кода',
    description: 'go test -cover, профиль покрытия, визуализация, интерпретация процентов',
    estimatedTime: 15,
    xpReward: 15,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Code Coverage</h2>
                <p>Покрытие кода (coverage) — процент строк/ветвей кода, выполненных тестами.</p>
                <p>В Go встроена поддержка — никаких дополнительных инструментов не нужно.</p>
                <ul>
                    <li><code>go test -cover</code> — показывает процент покрытия</li>
                    <li><code>-coverprofile</code> — сохраняет профиль в файл</li>
                    <li><code>go tool cover</code> — анализирует профиль</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Команды покрытия',
            code: `# Базовый отчёт
go test -cover ./...

# Вывод:
# ok  mypackage  0.123s  coverage: 78.5% of statements

# Сохранить профиль
go test -coverprofile=coverage.out ./...

# Визуализация в терминале
go tool cover -func=coverage.out

# Визуализация в браузере (HTML)
go tool cover -html=coverage.out

# Открыть HTML автоматически
go tool cover -html=coverage.out -o coverage.html`,
            explanation: 'HTML-отчёт показывает каждую строку: зелёная = покрыта, красная = не покрыта, серая = не исполняемая (комментарии, декларации).'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Пример: функция с ветвями',
            code: `package billing

import "errors"

type Tier string

const (
    TierFree    Tier = "free"
    TierPro     Tier = "pro"
    TierEnterprise Tier = "enterprise"
)

// CalcPrice вычисляет цену с учётом скидки
func CalcPrice(tier Tier, months int) (float64, error) {
    if months <= 0 {
        return 0, errors.New("months must be positive")
    }

    var monthly float64
    switch tier {
    case TierFree:
        return 0, nil
    case TierPro:
        monthly = 9.99
    case TierEnterprise:
        monthly = 49.99
    default:
        return 0, fmt.Errorf("unknown tier: %s", tier)
    }

    total := monthly * float64(months)

    // Скидка за длительную подписку
    if months >= 12 {
        total *= 0.8 // 20% скидка
    } else if months >= 6 {
        total *= 0.9 // 10% скидка
    }

    return total, nil
}`,
            explanation: 'Функция с множеством ветвей. Для 100% покрытия нужно протестировать: каждый tier, months<=0, months<6, months>=6, months>=12.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Тесты для полного покрытия',
            code: `package billing_test

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestCalcPrice(t *testing.T) {
    tests := []struct {
        name    string
        tier    Tier
        months  int
        want    float64
        wantErr bool
    }{
        {"free tier",       TierFree,       1,  0,      false},
        {"pro 1 month",     TierPro,        1,  9.99,   false},
        {"pro 6 months",    TierPro,        6,  53.946, false}, // 9.99*6*0.9
        {"pro 12 months",   TierPro,        12, 95.904, false}, // 9.99*12*0.8
        {"enterprise",      TierEnterprise, 1,  49.99,  false},
        {"invalid months",  TierPro,        0,  0,      true},
        {"negative months", TierPro,        -1, 0,      true},
        {"unknown tier",    "premium",      1,  0,      true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := CalcPrice(tt.tier, tt.months)
            if tt.wantErr {
                assert.Error(t, err)
                return
            }
            assert.NoError(t, err)
            assert.InDelta(t, tt.want, got, 0.001) // погрешность float
        })
    }
}`,
            explanation: 'assert.InDelta — сравнение float с допустимой погрешностью. Все ветви покрыты: 8 тест-кейсов для всех путей выполнения.'
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<p><strong>100% покрытие ≠ хорошие тесты:</strong> Можно иметь 100% покрытие с бесполезными тестами. Важно проверять корректность поведения, а не просто "выполнение строк".<br>
            Рекомендуемый порог для серьёзных проектов: <strong>70-85%</strong>.</p>`
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Покрытие в CI/CD',
            code: `# Проверка порога покрытия (упасть если < 80%)
go test -coverprofile=coverage.out ./...
COVERAGE=$(go tool cover -func=coverage.out | grep total | awk '{print $3}' | tr -d '%')
if (( $(echo "$COVERAGE < 80" | bc -l) )); then
    echo "Coverage $COVERAGE% is below 80%"
    exit 1
fi

# GitHub Actions пример
- name: Run tests with coverage
  run: |
    go test -coverprofile=coverage.out ./...
    go tool cover -html=coverage.out -o coverage.html

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage.out`,
            explanation: 'Интеграция покрытия в CI помогает отслеживать деградацию покрытия при новых коммитах. Codecov и Coveralls — популярные сервисы для визуализации.'
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph LR
    A["go test -coverprofile=cov.out"] --> B["coverage.out"]
    B --> C["go tool cover -func"]
    B --> D["go tool cover -html"]
    C --> E["func-level report"]
    D --> F["HTML визуализация"]
    F --> G["🟢 покрытые строки"]
    F --> H["🔴 непокрытые строки"]
    style A fill:#00add8,color:#fff
    style F fill:#10b981,color:#fff`,
            caption: 'Пайплайн измерения покрытия в Go'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Команда для просмотра покрытия в браузере?',
                    options: [
                        'go tool cover -html=coverage.out',
                        'go test -html=coverage',
                        'go cover -view',
                        'go tool coverage open'
                    ],
                    correct: 0,
                    explanation: 'go tool cover -html=coverage.out открывает HTML-отчёт. Зелёные строки = покрытые, красные = нет. Добавьте -o file.html для сохранения.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Правда ли, что 100% покрытие гарантирует правильность кода?',
                    options: [
                        'Нет — покрытие только показывает выполненные строки, не корректность',
                        'Да — выполнение всех строк означает правильность',
                        'Зависит от типа проекта',
                        'Да, если использовать assert'
                    ],
                    correct: 0,
                    explanation: '100% покрытия можно достичь с тестами без assert. Покрытие показывает какой код выполнялся, но не проверяет правильность результатов.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Флаг для сохранения профиля покрытия:',
                    options: [
                        '-coverprofile=coverage.out',
                        '-coverage=file.out',
                        '-savecoverage',
                        '-profile=cover'
                    ],
                    correct: 0,
                    explanation: 'go test -coverprofile=coverage.out ./... сохраняет профиль для последующего анализа через go tool cover.'
                }
            ]
        }
    ]
};
