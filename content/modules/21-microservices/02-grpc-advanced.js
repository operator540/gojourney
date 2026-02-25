export default {
    id: '21-02',
    title: 'Продвинутый gRPC',
    description: 'Streaming, interceptors, metadata, deadlines, error handling в gRPC',
    estimatedTime: 30,
    xpReward: 28,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Виды gRPC вызовов</h2>
                <p>gRPC поддерживает 4 типа коммуникации:</p>
                <table style="width:100%;border-collapse:collapse;margin-top:12px">
                    <thead>
                        <tr style="background:var(--surface-2)">
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Тип</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Описание</th>
                            <th style="padding:10px;text-align:left;border:1px solid var(--border)">Пример</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Unary</td>
                            <td style="padding:10px;border:1px solid var(--border)">Один запрос → один ответ</td>
                            <td style="padding:10px;border:1px solid var(--border)">GetUser(id) → User</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Server streaming</td>
                            <td style="padding:10px;border:1px solid var(--border)">Один запрос → поток ответов</td>
                            <td style="padding:10px;border:1px solid var(--border)">ListUsers() → stream User</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid var(--border)">Client streaming</td>
                            <td style="padding:10px;border:1px solid var(--border)">Поток запросов → один ответ</td>
                            <td style="padding:10px;border:1px solid var(--border)">UploadChunks → FileInfo</td>
                        </tr>
                        <tr style="background:var(--surface-2)">
                            <td style="padding:10px;border:1px solid var(--border)">Bidirectional</td>
                            <td style="padding:10px;border:1px solid var(--border)">Поток → поток</td>
                            <td style="padding:10px;border:1px solid var(--border)">Chat stream</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Server Streaming: большие списки',
            code: `// proto/user.proto
// service UserService {
//   rpc ListUsers (ListUsersRequest) returns (stream User);
// }

// server.go
package main

import (
    "fmt"
    "time"

    pb "myapp/proto"
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
)

type UserServiceServer struct {
    pb.UnimplementedUserServiceServer
}

// ListUsers — стримит пользователей по одному (не загружает всех в память)
func (s *UserServiceServer) ListUsers(
    req *pb.ListUsersRequest,
    stream pb.UserService_ListUsersServer,
) error {
    // Симуляция: генерируем пользователей
    for i := 0; i < 100; i++ {
        user := &pb.User{
            Id:    int64(i),
            Name:  fmt.Sprintf("User %d", i),
            Email: fmt.Sprintf("user%d@example.com", i),
        }

        // Проверяем не отменён ли контекст (клиент отключился)
        if err := stream.Context().Err(); err != nil {
            return status.Error(codes.Canceled, "client disconnected")
        }

        // Отправляем пользователя клиенту
        if err := stream.Send(user); err != nil {
            return err
        }

        time.Sleep(10 * time.Millisecond) // имитация задержки БД
    }
    return nil
}

// client.go
func listUsers(client pb.UserServiceClient) error {
    stream, err := client.ListUsers(
        context.Background(),
        &pb.ListUsersRequest{},
    )
    if err != nil {
        return err
    }

    // Получаем пользователей по одному
    for {
        user, err := stream.Recv()
        if err == io.EOF {
            break // стрим завершён
        }
        if err != nil {
            return err
        }
        fmt.Printf("Received: %s (%s)\\n", user.Name, user.Email)
    }
    return nil
}`,
            explanation: 'Server streaming: сервер отправляет N сообщений, клиент читает в цикле до io.EOF. Не нужно загружать 100 000 записей в память — стримим построчно.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'gRPC Interceptors (middleware)',
            code: `package main

import (
    "context"
    "fmt"
    "time"

    "google.golang.org/grpc"
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/metadata"
    "google.golang.org/grpc/status"
)

// Unary interceptor — аналог HTTP middleware
func LoggingInterceptor(
    ctx context.Context,
    req interface{},
    info *grpc.UnaryServerInfo,
    handler grpc.UnaryHandler,
) (interface{}, error) {
    start := time.Now()
    fmt.Printf("→ %s\\n", info.FullMethod)

    resp, err := handler(ctx, req) // вызов следующего

    code := codes.OK
    if err != nil {
        code = status.Code(err)
    }
    fmt.Printf("← %s %v %v\\n", info.FullMethod, code, time.Since(start))
    return resp, err
}

// Auth interceptor — проверяем токен в metadata
func AuthInterceptor(
    ctx context.Context,
    req interface{},
    info *grpc.UnaryServerInfo,
    handler grpc.UnaryHandler,
) (interface{}, error) {
    // Пропускаем публичные методы
    if info.FullMethod == "/auth.AuthService/Login" {
        return handler(ctx, req)
    }

    // Читаем metadata из контекста
    md, ok := metadata.FromIncomingContext(ctx)
    if !ok {
        return nil, status.Error(codes.Unauthenticated, "missing metadata")
    }

    tokens := md.Get("authorization")
    if len(tokens) == 0 {
        return nil, status.Error(codes.Unauthenticated, "missing token")
    }

    // Проверяем токен
    if tokens[0] != "Bearer valid-token" {
        return nil, status.Error(codes.Unauthenticated, "invalid token")
    }

    return handler(ctx, req)
}

func main() {
    // Сервер с несколькими interceptors
    server := grpc.NewServer(
        grpc.ChainUnaryInterceptor(
            LoggingInterceptor,
            AuthInterceptor,
        ),
    )

    // Клиент с interceptor
    conn, _ := grpc.Dial("localhost:9090",
        grpc.WithUnaryInterceptor(func(
            ctx context.Context, method string,
            req, reply interface{}, cc *grpc.ClientConn,
            invoker grpc.UnaryInvoker, opts ...grpc.CallOption,
        ) error {
            // Добавляем токен в каждый запрос
            ctx = metadata.AppendToOutgoingContext(ctx,
                "authorization", "Bearer valid-token",
            )
            return invoker(ctx, method, req, reply, cc, opts...)
        }),
    )
    _ = conn
    _ = server
    fmt.Println("gRPC setup ready")
}`,
            explanation: 'ChainUnaryInterceptor — цепочка interceptors как в HTTP middleware. metadata — gRPC-аналог HTTP заголовков. Клиентский interceptor добавляет auth header автоматически к каждому запросу.'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Deadlines и Cancellation',
            code: `package main

import (
    "context"
    "fmt"
    "time"

    "google.golang.org/grpc"
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
)

func callWithDeadline(client pb.UserServiceClient, id int64) (*pb.User, error) {
    // Устанавливаем дедлайн — 2 секунды на запрос
    ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel()

    user, err := client.GetUser(ctx, &pb.GetUserRequest{Id: id})
    if err != nil {
        // Разбираем тип ошибки
        st, ok := status.FromError(err)
        if !ok {
            return nil, fmt.Errorf("non-gRPC error: %w", err)
        }

        switch st.Code() {
        case codes.DeadlineExceeded:
            return nil, fmt.Errorf("timeout: request took > 2s")
        case codes.NotFound:
            return nil, fmt.Errorf("user %d not found", id)
        case codes.Unauthenticated:
            return nil, fmt.Errorf("auth failed: %s", st.Message())
        default:
            return nil, fmt.Errorf("gRPC error %v: %s", st.Code(), st.Message())
        }
    }
    return user, nil
}

// На сервере: проверяем что клиент всё ещё ждёт
func (s *Server) SlowOperation(ctx context.Context, req *pb.Request) (*pb.Response, error) {
    // Периодически проверяем контекст
    for i := 0; i < 10; i++ {
        select {
        case <-ctx.Done():
            return nil, status.Error(codes.Canceled, "client gone")
        default:
        }

        time.Sleep(500 * time.Millisecond) // тяжёлая работа
    }
    return &pb.Response{Data: "done"}, nil
}`,
            explanation: 'context.WithTimeout — deadline для запроса. Дедлайн передаётся через контекст и соблюдается как клиентом (таймаут ожидания), так и сервером (context.Done()). Всегда устанавливайте дедлайны в продакшне!'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Когда использовать Server Streaming?',
                    options: [
                        'Когда нужно вернуть большой объём данных частями',
                        'Когда клиент отправляет много данных',
                        'Для простых запрос-ответ операций',
                        'Для чата'
                    ],
                    correct: 0,
                    explanation: 'Server streaming: сервер отправляет N сообщений. Идеально для: список 100K записей (не грузим всё в память), live updates, progress reporting.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'gRPC Interceptor — это аналог чего в HTTP?',
                    options: [
                        'Middleware',
                        'Handler',
                        'Router',
                        'Context'
                    ],
                    correct: 0,
                    explanation: 'gRPC Interceptor = HTTP Middleware. Оба оборачивают обработчик, выполняют код до/после, могут прервать цепочку. ChainUnaryInterceptor = e.Use() в Echo.'
                }
            ]
        }
    ]
};
