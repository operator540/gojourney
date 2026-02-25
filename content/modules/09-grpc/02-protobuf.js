export default {
    id: '09-02',
    title: 'Protocol Buffers',
    description: 'Синтаксис .proto файлов, типы данных, сообщения, сервисы, генерация Go кода',
    estimatedTime: 35,
    xpReward: 30,

    sections: [
        {
            type: 'theory',
            content: `
                <h2>Аналогия: чертёж здания</h2>
                <p>Protocol Buffers (Protobuf) — это как чертёж здания. Прежде чем строить, архитектор рисует схему: где стены, двери, комнаты. По этой схеме строители в разных городах возводят одинаковые здания.</p>
                <p><code>.proto</code> файл — это ваш чертёж API. Вы описываете <em>что</em> передаётся между сервисами, а инструмент <code>protoc</code> по этому чертежу генерирует готовый код на Go, Java, Python, C++ и других языках.</p>
                <p>Protobuf решает три задачи одновременно:</p>
                <ul>
                    <li><strong>IDL (Interface Definition Language)</strong> — описание контракта API</li>
                    <li><strong>Сериализация</strong> — компактный бинарный формат передачи данных</li>
                    <li><strong>Кодогенерация</strong> — автоматический клиент и сервер на любом языке</li>
                </ul>
            `
        },
        {
            type: 'theory',
            content: `
                <h2>Структура .proto файла</h2>
                <p>Каждый <code>.proto</code> файл начинается с обязательных директив:</p>
                <ul>
                    <li><code>syntax = "proto3";</code> — версия синтаксиса (всегда первая строка)</li>
                    <li><code>package</code> — пространство имён для предотвращения конфликтов</li>
                    <li><code>option go_package</code> — путь Go-пакета для сгенерированного кода</li>
                    <li><code>import</code> — подключение других .proto файлов (например, google/protobuf/timestamp.proto)</li>
                </ul>
                <p>Далее идут объявления <code>message</code> (структуры данных) и <code>service</code> (RPC методы).</p>

                <h3>Правила числовых тегов полей</h3>
                <p>Каждое поле message получает уникальный числовой тег. Это <em>не порядковый номер</em>, это идентификатор поля в бинарном формате:</p>
                <ul>
                    <li>Теги <strong>1–15</strong> кодируются в 1 байт — используйте для часто встречающихся полей</li>
                    <li>Теги <strong>16–2047</strong> кодируются в 2 байта</li>
                    <li>Теги <strong>19000–19999</strong> зарезервированы Protobuf — нельзя использовать</li>
                    <li>Менять теги у существующих полей <strong>нельзя</strong> — сломается обратная совместимость</li>
                    <li>Удалённые теги нужно объявить через <code>reserved</code></li>
                </ul>
            `
        },
        {
            type: 'code-example',
            language: 'protobuf',
            title: 'Полный пример: user.proto',
            code: `syntax = "proto3";

// Пакет — пространство имён в сгенерированном коде
package users;

// Путь для Go импорта: куда protoc положит сгенерированные файлы
option go_package = "github.com/myapp/gen/users;users";

// Импорт стандартных типов Google
import "google/protobuf/timestamp.proto";

// ========= СЕРВИС (RPC методы) =========
service UserService {
  rpc CreateUser   (CreateUserRequest)  returns (User);
  rpc GetUser      (GetUserRequest)     returns (User);
  rpc UpdateUser   (UpdateUserRequest)  returns (User);
  rpc DeleteUser   (DeleteUserRequest)  returns (DeleteUserResponse);
  rpc ListUsers    (ListUsersRequest)   returns (stream User);  // Server streaming
}

// ========= СООБЩЕНИЯ (структуры данных) =========

message User {
  string   id         = 1;
  string   name       = 2;
  string   email      = 3;
  int32    age        = 4;
  bool     active     = 5;
  Role     role       = 6;                            // enum
  repeated string tags = 7;                           // slice: []string
  map<string, string> metadata = 8;                   // map[string]string
  google.protobuf.Timestamp created_at = 9;           // вложенный тип

  // Зарезервированные теги удалённых полей (нельзя переиспользовать)
  reserved 10, 11;
  reserved "old_field_name";
}

// Enum — перечисление
enum Role {
  ROLE_UNSPECIFIED = 0;  // proto3: первое значение ВСЕГДА 0
  ROLE_USER        = 1;
  ROLE_ADMIN       = 2;
  ROLE_MODERATOR   = 3;
}

message CreateUserRequest {
  string name  = 1;
  string email = 2;
  int32  age   = 3;
  Role   role  = 4;
}

message GetUserRequest    { string id = 1; }
message DeleteUserRequest { string id = 1; }
message DeleteUserResponse { bool success = 1; }

message UpdateUserRequest {
  string id    = 1;
  string name  = 2;  // пустое значение = не обновлять (в proto3 нет null)
  int32  age   = 3;
}

message ListUsersRequest {
  int32  page      = 1;
  int32  page_size = 2;
  bool   active_only = 3;
}`,
            explanation: 'В proto3 все поля имеют нулевые значения по умолчанию (0, "", false, nil). Если нужно различать "не передано" от "передано как 0" — используйте google.protobuf.Int32Value (wrapper types) или oneof.'
        },
        {
            type: 'theory',
            content: `
                <h2>Типы данных Protobuf → Go</h2>

                <table style="width:100%; border-collapse:collapse; margin:16px 0;">
                    <thead>
                        <tr style="background:var(--surface-2);">
                            <th style="padding:10px 14px; border:1px solid var(--border);">Protobuf тип</th>
                            <th style="padding:10px 14px; border:1px solid var(--border);">Go тип</th>
                            <th style="padding:10px 14px; border:1px solid var(--border);">По умолчанию</th>
                            <th style="padding:10px 14px; border:1px solid var(--border);">Примечание</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>double</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>float64</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">0</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">64-bit IEEE 754</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>float</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>float32</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">0</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">32-bit IEEE 754</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>int32</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>int32</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">0</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Неэффективен для отрицательных чисел</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>int64</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>int64</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">0</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Для больших чисел и timestamp-unix</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>sint32</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>int32</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">0</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Эффективен для отрицательных (ZigZag)</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>uint32 / uint64</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>uint32 / uint64</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">0</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Беззнаковые целые</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>bool</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>bool</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">false</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"></td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>string</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>string</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">""</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">UTF-8 или 7-bit ASCII</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>bytes</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>[]byte</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">nil</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Сырые байты</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>repeated T</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>[]T</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">nil</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Слайс элементов</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>map&lt;K, V&gt;</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>map[K]V</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">nil</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">K не может быть float/bytes/message</td>
                        </tr>
                        <tr style="background:var(--surface-2);">
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>MessageType</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);"><code>*MessageType</code></td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">nil</td>
                            <td style="padding:8px 14px; border:1px solid var(--border);">Вложенное сообщение (указатель)</td>
                        </tr>
                    </tbody>
                </table>
            `
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Установка инструментов и генерация кода',
            code: `# 1. Установить компилятор protoc
# Ubuntu/Debian:
sudo apt install -y protobuf-compiler
# macOS:
brew install protobuf
# Manjaro/Arch:
sudo pacman -S protobuf

# 2. Установить Go плагины для protoc
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Убедитесь что ~/go/bin в PATH
export PATH="$PATH:$(go env GOPATH)/bin"

# 3. Структура проекта
# myapp/
# ├── proto/
# │   └── users/
# │       └── user.proto
# ├── gen/               ← сгенерированный код (не редактировать вручную!)
# │   └── users/
# │       ├── user.pb.go
# │       └── user_grpc.pb.go
# └── cmd/server/main.go

# 4. Генерация Go кода из .proto
protoc \\
  --proto_path=proto \\
  --go_out=gen --go_opt=paths=source_relative \\
  --go-grpc_out=gen --go-grpc_opt=paths=source_relative \\
  proto/users/user.proto

# В результате появятся 2 файла:
# gen/users/user.pb.go        — структуры данных (Message типы)
# gen/users/user_grpc.pb.go   — интерфейсы сервера и клиентский stub`,
            explanation: 'protoc генерирует два файла: .pb.go содержит Go-структуры для всех message типов с методами сериализации. _grpc.pb.go содержит интерфейс сервера (нужно реализовать) и клиентский stub (готов к использованию).'
        },
        {
            type: 'code-example',
            language: 'go',
            title: 'Что генерирует protoc: пример сгенерированного кода',
            code: `// Файл gen/users/user.pb.go (упрощённо, protoc генерирует автоматически)

package users

// Структура для message User
type User struct {
    state         protoimpl.MessageState
    sizeCache     protoimpl.SizeCache
    unknownFields protoimpl.UnknownFields

    Id        string            \`protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"\`
    Name      string            \`protobuf:"bytes,2,opt,name=name,proto3" json:"name,omitempty"\`
    Email     string            \`protobuf:"bytes,3,opt,name=email,proto3" json:"email,omitempty"\`
    Age       int32             \`protobuf:"varint,4,opt,name=age,proto3" json:"age,omitempty"\`
    Active    bool              \`protobuf:"varint,5,opt,name=active,proto3" json:"active,omitempty"\`
    Tags      []string          \`protobuf:"bytes,7,rep,name=tags,proto3" json:"tags,omitempty"\`
    Metadata  map[string]string \`protobuf:"bytes,8,rep,name=metadata,proto3" json:"metadata,omitempty" protobuf_key:"bytes,1,opt" protobuf_val:"bytes,2,opt"\`
}

// Файл gen/users/user_grpc.pb.go (упрощённо)

// UserServiceClient — интерфейс клиента (готовый stub, используем в клиентском коде)
type UserServiceClient interface {
    CreateUser(ctx context.Context, in *CreateUserRequest, opts ...grpc.CallOption) (*User, error)
    GetUser(ctx context.Context, in *GetUserRequest, opts ...grpc.CallOption) (*User, error)
    ListUsers(ctx context.Context, in *ListUsersRequest, opts ...grpc.CallOption) (UserService_ListUsersClient, error)
}

// UserServiceServer — интерфейс, который МЫ реализуем
type UserServiceServer interface {
    CreateUser(context.Context, *CreateUserRequest) (*User, error)
    GetUser(context.Context, *GetUserRequest) (*User, error)
    ListUsers(*ListUsersRequest, UserService_ListUsersServer) error
    mustEmbedUnimplementedUserServiceServer()
}

// UnimplementedUserServiceServer — встраивайте в свою структуру сервера
// для прямой совместимости при добавлении новых методов в .proto
type UnimplementedUserServiceServer struct{}`,
            explanation: 'Не редактируйте сгенерированные файлы вручную — они перезапишутся при следующем запуске protoc. Вместо этого добавляйте методы в свои структуры, которые реализуют сгенерированный интерфейс.'
        },
        {
            type: 'info-box',
            variant: 'note',
            content: `<p><strong>Protobuf vs JSON: разница в размере</strong></p>
            <p>Структура User с полями id="abc-123", name="Alice", age=30, active=true:</p>
            <ul>
                <li><strong>JSON</strong>: <code>{"id":"abc-123","name":"Alice","age":30,"active":true}</code> — ~52 байта</li>
                <li><strong>Protobuf</strong>: бинарные данные — ~20 байт (в 2.5 раза меньше)</li>
            </ul>
            <p>При миллионах запросов в день разница в трафике существенная. Плюс парсинг бинарного формата быстрее декодирования JSON в 3–10 раз.</p>`
        },
        {
            type: 'info-box',
            variant: 'warning',
            content: `<p><strong>Обратная совместимость — главное правило Protobuf</strong></p>
            <ul>
                <li>Никогда не меняйте числовой тег у существующего поля</li>
                <li>Никогда не меняйте тип поля (int32 → string)</li>
                <li>Удалённые теги объявляйте через <code>reserved 5, 6;</code></li>
                <li>Новые поля добавляйте со следующим свободным тегом</li>
                <li>Никогда не переиспользуйте теги удалённых полей</li>
            </ul>
            <p>Нарушение этих правил ведёт к silent data corruption — данные прочитаются, но в неправильных полях.</p>`
        },
        {
            type: 'editor',
            title: 'Практика: опишите Product message',
            instructions: 'Напишите полный .proto файл с message Product (id: string, name: string, price: double, in_stock: bool, tags: slice of strings, category: enum с ELECTRONICS и CLOTHING) и сервис ProductService с методом GetProduct.',
            starterCode: `syntax = "proto3";

package store;

option go_package = "github.com/myapp/gen/store;store";

// Опишите enum Category здесь
// Значения: CATEGORY_UNSPECIFIED=0, CATEGORY_ELECTRONICS=1, CATEGORY_CLOTHING=2

// Опишите message Product
// Поля: id(1), name(2), price(3), in_stock(4), tags repeated(5), category(6)

// Опишите GetProductRequest с полем id

// Опишите service ProductService с методом GetProduct`,
            hints: [
                'enum Category { CATEGORY_UNSPECIFIED = 0; CATEGORY_ELECTRONICS = 1; CATEGORY_CLOTHING = 2; }',
                'message Product { string id = 1; string name = 2; double price = 3; bool in_stock = 4; repeated string tags = 5; Category category = 6; }',
                'message GetProductRequest { string id = 1; }',
                'service ProductService { rpc GetProduct (GetProductRequest) returns (Product); }'
            ]
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    question: 'Зачем числовые теги полей в Protobuf (= 1, = 2)?',
                    options: [
                        'Для задания порядка сортировки полей',
                        'Это значения по умолчанию для числовых полей',
                        'Идентификаторы полей в бинарном формате — имена полей не передаются',
                        'Номера версий поля'
                    ],
                    correct: 2,
                    explanation: 'В бинарном формате Protobuf передаёт тег+тип+значение. Имена полей не передаются вообще — только числовые идентификаторы. Это экономит место и ускоряет парсинг.'
                },
                {
                    id: 'q2',
                    type: 'single',
                    question: 'Что означает repeated string tags = 5 в proto3?',
                    options: [
                        'Поле tags будет повторяться 5 раз',
                        'В Go это будет []string — слайс строк',
                        'Поле tags является обязательным',
                        'Тег поля равен 5 строкам'
                    ],
                    correct: 1,
                    explanation: 'repeated — это аналог slice в Go. repeated string tags = 5 генерирует поле Tags []string в Go структуре. Число 5 — это тег поля, не количество элементов.'
                },
                {
                    id: 'q3',
                    type: 'single',
                    question: 'Какое значение должно быть у первого элемента enum в proto3?',
                    options: [
                        '1',
                        '0 — обязательно',
                        'Любое, но уникальное',
                        '-1'
                    ],
                    correct: 1,
                    explanation: 'В proto3 первый элемент enum ОБЯЗАН иметь значение 0. Это нулевое/дефолтное значение. По соглашению называется TYPENAME_UNSPECIFIED = 0.'
                },
                {
                    id: 'q4',
                    type: 'single',
                    question: 'Что произойдёт если изменить тег поля name с = 2 на = 5 в .proto файле?',
                    options: [
                        'Ничего, это просто порядковый номер',
                        'Сломается обратная совместимость: старые клиенты будут читать другое поле',
                        'Компилятор protoc выдаст ошибку',
                        'Поле автоматически переименуется'
                    ],
                    correct: 1,
                    explanation: 'Тег — это идентификатор поля в бинарных данных. Старые клиенты будут искать name по тегу 2, нового его там нет — получат пустую строку. Данные по тегу 5 будут прочитаны как другое поле.'
                },
                {
                    id: 'q5',
                    type: 'single',
                    question: 'Какие файлы генерирует protoc с плагинами --go_out и --go-grpc_out?',
                    options: [
                        'Один файл service.go',
                        'user.pb.go (структуры) и user_grpc.pb.go (интерфейсы сервера и клиент)',
                        'server.go и client.go',
                        'main.go с готовым приложением'
                    ],
                    correct: 1,
                    explanation: '.pb.go содержит Go структуры для всех message типов. _grpc.pb.go содержит интерфейс сервера (реализуем сами) и клиентский stub (используем готовым).'
                },
                {
                    id: 'q6',
                    type: 'code-fill',
                    question: 'Заполните пропуск: как объявить поле emails типа "слайс строк" с тегом 3?',
                    code: `message User {
  string id = 1;
  string name = 2;
  ___ string emails = 3;
}`,
                    answer: 'repeated',
                    explanation: 'repeated — ключевое слово для повторяющихся полей (слайсов/массивов). repeated string emails = 3 генерирует Emails []string в Go.'
                }
            ]
        }
    ]
};
