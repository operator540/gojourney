export default {
    id: '09-03',
    title: 'gRPC Сервер',
    description: 'Реализация gRPC сервера на Go, методы сервиса, запуск',
    estimatedTime: 25,
    xpReward: 25,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Реализация сервера</h2>
                <p>Чтобы создать gRPC сервер, нужно:</p>
                <ol>
                    <li>Определить структуру, которая реализует интерфейс, сгенерированный из .proto файла.</li>
                    <li>Реализовать методы этого интерфейса.</li>
                    <li>Создать TCP слушатель (<code>net.Listen</code>).</li>
                    <li>Создать gRPC сервер (<code>grpc.NewServer</code>).</li>
                    <li>Зарегистрировать сервис и запустить сервер.</li>
                </ol>
            `
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Структура сервера',
            code: `package main

import (
    "context"
    "fmt"
    "net"
    "google.golang.org/grpc"
    pb "example.com/project/proto/users" // Импорт сгенерированного кода
)

// Структура сервера (должна реализовывать интерфейс UnimplementedUserServiceServer для совместимости)
type server struct {
    pb.UnimplementedUserServiceServer
}

// Реализация метода CreateUser
func (s *server) CreateUser(ctx context.Context, req *pb.CreateUserRequest) (*pb.UserResponse, error) {
    fmt.Printf("Creating user: %s (age %d)\n", req.Name, req.Age)
    
    // В реальности здесь было бы сохранение в БД
    return &pb.UserResponse{
        Id:     "uuid-1234",
        Name:   req.Name,
        Active: true,
    }, nil
}

func main() {
    // 1. Слушаем TCP порт
    lis, err := net.Listen("tcp", ":50051")
    if err != nil {
        panic(err)
    }

    // 2. Создаем gRPC сервер
    s := grpc.NewServer()

    // 3. Регистрируем нашу реализацию
    pb.RegisterUserServiceServer(s, &server{})

    fmt.Println("Server listening on :50051")
    
    // 4. Запускаем сервер
    if err := s.Serve(lis); err != nil {
        panic(err)
    }
}`,
            explanation: 'UnimplementedUserServiceServer нужен для прямой совместимости: если в .proto добавятся новые методы, код скомпилируется (но вернет ошибку при вызове).'
        },
        {
            type: 'editor',
            title: 'Практика: Метод GetUser',
            instructions: 'Реализуйте метод GetUser для сервера. Он принимает GetUserRequest и возвращает UserResponse. Заполните ответ заглушкой.',
            starterCode: `package main

import (
    "context"
    pb "example.com/project/proto"
)

type server struct {
    pb.UnimplementedUserServiceServer
}

// GetUser(ctx, req) (*UserResponse, error)
func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.UserResponse, error) {
    // Ваш код здесь
    // Создайте и верните &pb.UserResponse{Id: req.Id, Name: "Test User"}
    return nil, nil
}`,
            hints: [
                'return &pb.UserResponse{Id: req.Id, Name: "Test User"}, nil',
                'Не забудьте вторым аргументом вернуть nil (отсутствие ошибки).'
            ]
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: '<p><strong>Context:</strong> Первый аргумент любого gRPC метода — <code>context.Context</code>. Он используется для отмены запросов, таймаутов и передачи метаданных.</p>'
        }
    ]
};
