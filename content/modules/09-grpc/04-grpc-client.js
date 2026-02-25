export default {
    id: '09-04',
    title: 'gRPC Клиент',
    description: 'Создание gRPC клиента, подключение к серверу, вызов методов',
    estimatedTime: 20,
    xpReward: 20,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Реализация клиента</h2>
                <p>Для создания клиента нужно:</p>
                <ol>
                    <li>Установить соединение с сервером (<code>grpc.Dial</code>).</li>
                    <li>Создать клиентскую заглушку (stub) с помощью сгенерированной функции (<code>NewUserServiceClient</code>).</li>
                    <li>Вызывать методы, передавая контекст и запрос.</li>
                </ol>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Клиентский код',
            code: `package main

import (
    "context"
    "fmt"
    "time"
    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials/insecure"
    pb "example.com/project/proto/users"
)

func main() {
    // 1. Подключаемся к серверу
    // WithTransportCredentials(insecure...) нужно если нет TLS
    conn, err := grpc.Dial("localhost:50051", 
        grpc.WithTransportCredentials(insecure.NewCredentials()))
    if err != nil {
        panic(err)
    }
    defer conn.Close()

    // 2. Создаем клиент
    client := pb.NewUserServiceClient(conn)

    // 3. Вызываем удаленный метод
    ctx, cancel := context.WithTimeout(context.Background(), time.Second)
    defer cancel()

    req := &pb.CreateUserRequest{
        Name: "Bob",
        Email: "bob@example.com",
        Age: 30,
    }

    resp, err := client.CreateUser(ctx, req)
    if err != nil {
        panic(err)
    }

    fmt.Printf("Created user ID: %s\n", resp.Id)
}`,
            explanation: 'grpc.Dial устанавливает асинхронное соединение. Чтобы ждать соединения, можно использовать опцию WithBlock() (но это не рекомендуется в Go 1.18+).'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p><strong>Таймауты:</strong> Всегда используйте <code>context.WithTimeout</code> или <code>WithDeadline</code> для RPC вызовов, чтобы клиент не завис вечно при сетевых проблемах.</p>'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Что делает grpc.Dial?',
                    options: [
                        'Создает пул потоков',
                        'Создает соединение (ClientConn) с сервером',
                        'Отправляет HTTP GET запрос',
                        'Генерирует .proto файлы'
                    ],
                    correct: 1,
                    explanation: 'grpc.Dial создает абстракцию соединения, которая управляет реальными TCP соединениями, реконнектами и балансировкой.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Какой тип credentials нужен для локальной разработки без TLS?',
                    options: [
                        'credentials.NewTLS(nil)',
                        'insecure.NewCredentials()',
                        'oauth.NewCredentials()',
                        'Никакой'
                    ],
                    correct: 1,
                    explanation: 'По умолчанию gRPC требует TLS. Для отключения нужно явно передать insecure credentials.'
                }
            ]
        }
    ]
};
