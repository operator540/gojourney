export default {
    id: '20-03',
    title: 'Build Tags и ldflags',
    description: 'Условная компиляция, build constraints, ldflags для версий и флагов',
    estimatedTime: 20,
    xpReward: 18,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Build Tags — условная компиляция</h2>
                <p>Build tags (build constraints) позволяют включать или исключать файлы из компиляции в зависимости от условий:</p>
                <ul>
                    <li>Операционная система (linux, darwin, windows)</li>
                    <li>Архитектура (amd64, arm64)</li>
                    <li>Кастомные флаги (integration, prod, mock)</li>
                    <li>Версия Go (go1.18, go1.21)</li>
                </ul>
                <p>Синтаксис (Go 1.17+): <code>//go:build условие</code> — первая строка файла</p>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Build tags: платформо-зависимый код',
            code: `// file: storage_linux.go
//go:build linux

package storage

import "fmt"

func GetTempDir() string {
    fmt.Println("Linux: используем /tmp")
    return "/tmp"
}

// file: storage_darwin.go
//go:build darwin

package storage

import "fmt"

func GetTempDir() string {
    fmt.Println("macOS: используем /var/tmp")
    return "/var/tmp"
}

// file: storage_windows.go
//go:build windows

package storage

import (
    "fmt"
    "os"
)

func GetTempDir() string {
    dir := os.Getenv("TEMP")
    fmt.Println("Windows:", dir)
    return dir
}

// Компилятор автоматически выбирает правильный файл:
// go build → linux файл на Linux, darwin на macOS, etc.

// Также можно в имени файла (без тега):
// storage_linux.go   — только Linux
// storage_windows.go — только Windows
// storage.go         — все платформы`,
            explanation: 'Go автоматически выбирает файл по суффиксу _GOOS или //go:build тегу. Это позволяет иметь разную реализацию для каждой платформы без if/else в коде.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Кастомные build tags для тестов',
            code: `// file: db_real.go
//go:build !mock

package db

import "database/sql"

func NewDB(dsn string) (*sql.DB, error) {
    return sql.Open("postgres", dsn)
}

// file: db_mock.go
//go:build mock

package db

import "database/sql"

// Мок реализация для тестов без реальной БД
func NewDB(dsn string) (*sql.DB, error) {
    // Возвращаем in-memory SQLite для тестов
    return sql.Open("sqlite3", ":memory:")
}

// Запуск с обычной БД:
// go run .

// Запуск с моком:
// go run -tags mock .
// go test -tags mock ./...

// file: integration_test.go
//go:build integration

package myapp_test

import (
    "testing"
    "net/http"
)

// Этот тест запускается только с -tags integration
func TestAPIIntegration(t *testing.T) {
    resp, err := http.Get("http://localhost:8080/health")
    if err != nil {
        t.Fatal(err)
    }
    if resp.StatusCode != 200 {
        t.Errorf("expected 200, got %d", resp.StatusCode)
    }
}

// Обычные тесты (без тега):
// go test ./...

// Интеграционные тесты:
// go test -tags integration ./...`,
            explanation: '!mock = "не mock". Обычный запуск использует реальную БД, с -tags mock — мок. Интеграционные тесты отдельно от unit — не замедляют CI для каждого PR.'
        },
        {
            type: 'theory',
            content: `
                <h2>ldflags — встраивание данных при сборке</h2>
                <p><code>-ldflags "-X package.Variable=value"</code> позволяет задать значение переменных во время линковки. Используется для:</p>
                <ul>
                    <li>Версии приложения (из git tag)</li>
                    <li>Времени сборки</li>
                    <li>Commit hash</li>
                    <li>Флаги окружения (prod/staging)</li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'ldflags: версионирование бинарника',
            code: `// version/version.go
package version

// Значения задаются через ldflags при сборке
var (
    Version   = "dev"           // git tag
    GitCommit = "unknown"       // git rev-parse --short HEAD
    BuildTime = "unknown"       // дата сборки
    GoVersion = "unknown"       // версия Go
)

func Info() map[string]string {
    return map[string]string{
        "version":    Version,
        "git_commit": GitCommit,
        "build_time": BuildTime,
        "go_version": GoVersion,
    }
}

// cmd/server/main.go
package main

import (
    "fmt"
    "myapp/version"
)

func main() {
    fmt.Println("Version:", version.Version)
    fmt.Println("Commit:", version.GitCommit)

    // ...
}

// Makefile для сборки:
// VERSION := $(shell git describe --tags --always)
// COMMIT  := $(shell git rev-parse --short HEAD)
// BUILD   := $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")
//
// build:
//     go build -ldflags "\
//         -X myapp/version.Version=$(VERSION) \
//         -X myapp/version.GitCommit=$(COMMIT) \
//         -X myapp/version.BuildTime=$(BUILD)" \
//         -o bin/server ./cmd/server
//
// ./bin/server --version
// Version: v1.2.3
// Commit:  abc1234
// Build:   2024-01-15T10:30:00Z`,
            explanation: '-X package.VarName=value задаёт значение переменной пакета. Переменная должна быть var (не const). Makefile автоматически берёт версию из git.'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: `<p><strong>Полезные ldflags:</strong></p>
            <ul style="margin-top:8px">
                <li><code>-s -w</code> — strip debug info, уменьшает бинарник на 30-40%</li>
                <li><code>-X pkg.Var=val</code> — задать переменную</li>
            </ul>
            <pre style="font-size:12px;margin-top:8px">go build -ldflags "-s -w -X main.Version=1.0.0" -o app .</pre>`
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Как запустить тесты с кастомным build tag "integration"?',
                    options: [
                        'go test -tags integration ./...',
                        'go test --integration ./...',
                        'go test -build integration ./...',
                        'BUILD_TAGS=integration go test ./...'
                    ],
                    correct: 0,
                    explanation: '-tags принимает список тегов через запятую или пробел. go test -tags "integration mock" запускает с обоими тегами.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Для чего используются ldflags -X?',
                    options: [
                        'Задать значение переменной пакета во время линковки',
                        'Задать переменную окружения',
                        'Включить build tag',
                        'Задать путь к зависимостям'
                    ],
                    correct: 0,
                    explanation: '-ldflags "-X package.VarName=value" — встраивает значение в бинарник при сборке. Используется для версий, commit hash, build time.'
                }
            ]
        }
    ]
};
