export default {
    id: '13-04',
    title: 'Основы Docker',
    description: 'Docker — контейнеризация приложений. Контейнер vs VM, Image vs Container, основные команды docker run, ps, stop, rm.',
    estimatedTime: 20,
    xpReward: 20,
    sections: [
        {
            type: 'theory',
            content: `
<h2>Что такое Docker?</h2>
<p>Docker позволяет упаковать приложение со всеми зависимостями в <strong>контейнер</strong> — изолированную среду. "Works on my machine" больше не проблема.</p>
<h3>Image vs Container</h3>
<ul>
    <li><strong>Image</strong> — шаблон, неизменяемый. Как класс в ООП. Хранится в Docker Hub или локально.</li>
    <li><strong>Container</strong> — запущенный экземпляр Image. Как объект класса. Может быть запущено множество контейнеров из одного Image.</li>
</ul>
`
        },
        {
            type: 'diagram',
            format: 'mermaid',
            code: `graph TB
    subgraph "Virtual Machine"
        APP1[App A]
        LIB1[Libraries]
        OS1[Guest OS]
        HYP[Hypervisor]
        HW1[Hardware]
        APP1 --> LIB1 --> OS1 --> HYP --> HW1
    end
    subgraph "Docker"
        APP2[App A]
        LIB2[Libraries]
        APP3[App B]
        LIB3[Libraries]
        ENG[Docker Engine]
        OS2[Host OS]
        HW2[Hardware]
        APP2 --> LIB2
        APP3 --> LIB3
        LIB2 & LIB3 --> ENG --> OS2 --> HW2
    end`,
            caption: 'VM включает полную ОС (гигабайты). Контейнер использует ядро хост-ОС — запускается за секунды, весит мегабайты.'
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Основные команды Docker',
            code: `# Запустить контейнер (скачает image если нет локально)
docker run hello-world

# Запустить интерактивно (bash внутри ubuntu)
docker run -it ubuntu bash

# Запустить в фоне (detached mode)
docker run -d nginx

# Запустить с маппингом портов (хост:контейнер)
docker run -d -p 8080:80 nginx
# теперь localhost:8080 → nginx внутри контейнера

# Запустить с именем
docker run -d --name my-nginx -p 8080:80 nginx

# Запустить с переменными окружения
docker run -d \
    -e POSTGRES_PASSWORD=secret \
    -e POSTGRES_DB=mydb \
    -p 5432:5432 \
    postgres:16

# Список запущенных контейнеров
docker ps

# Все контейнеры (включая остановленные)
docker ps -a

# Остановить контейнер
docker stop my-nginx

# Запустить остановленный
docker start my-nginx

# Удалить контейнер (должен быть остановлен)
docker rm my-nginx

# Остановить и удалить одной командой
docker rm -f my-nginx`,
            explanation: '-d запускает в фоне. -p маппит порты. -e задаёт переменные окружения. --name даёт понятное имя вместо случайного.'
        },
        {
            type: 'code-example',
            language: 'bash',
            title: 'Работа с Images',
            code: `# Список локальных images
docker images

# Скачать image
docker pull postgres:16

# Удалить image
docker rmi nginx

# Удалить все неиспользуемые образы
docker image prune

# Посмотреть логи контейнера
docker logs my-app

# Логи в реальном времени
docker logs -f my-app

# Выполнить команду внутри запущенного контейнера
docker exec -it my-postgres psql -U postgres

# Скопировать файл из контейнера
docker cp my-app:/app/config.json ./config.json

# Информация о контейнере (IP, volumes, etc.)
docker inspect my-postgres

# Очистить всё (контейнеры, сети, образы)
docker system prune -a`,
            explanation: 'docker exec позволяет войти в работающий контейнер. docker logs — первый инструмент при дебагге. docker inspect показывает всю конфигурацию.'
        },
        {
            type: 'info-box',
            variant: 'note',
            content: '<p><strong>Docker Hub</strong> — публичный реестр образов (hub.docker.com). Официальные образы: <code>postgres</code>, <code>redis</code>, <code>nginx</code>, <code>golang</code>. Всегда указывайте конкретный тег (<code>postgres:16</code>), не <code>:latest</code> — для воспроизводимости.</p>'
        },
        {
            type: 'info-box',
            variant: 'tip',
            content: '<p>Контейнеры <strong>stateless</strong> — данные теряются при удалении. Для сохранения данных используйте <strong>volumes</strong>: <code>docker run -v /host/path:/container/path postgres</code> или именованные volume: <code>-v pgdata:/var/lib/postgresql/data</code>.</p>'
        },
        {
            type: 'quiz',
            questions: [
                {
                    id: 'q13-04-1',
                    type: 'single',
                    question: 'В чём ключевое отличие Docker-контейнера от виртуальной машины?',
                    options: [
                        'Контейнер быстрее только на Linux',
                        'Контейнер использует ядро хост-ОС, VM содержит полную ОС',
                        'Контейнер не поддерживает сети',
                        'VM изолированнее, контейнер нет'
                    ],
                    correct: 1,
                    explanation: 'Контейнер разделяет ядро ОС с хостом — поэтому запускается за секунды и весит мегабайты. VM содержит полную ОС — запуск минуты, размер гигабайты.'
                },
                {
                    id: 'q13-04-2',
                    type: 'single',
                    question: 'Что произойдёт с данными в PostgreSQL-контейнере при docker rm?',
                    options: [
                        'Данные сохранятся в docker image',
                        'Данные сохранятся автоматически',
                        'Данные потеряются — контейнер stateless',
                        'Данные перенесутся в другой контейнер'
                    ],
                    correct: 2,
                    explanation: 'Контейнеры stateless — данные хранятся в файловой системе контейнера и теряются при удалении. Для персистентности нужны volumes (-v флаг).'
                },
                {
                    id: 'q13-04-3',
                    type: 'single',
                    question: 'Команда docker run -d -p 8080:80 nginx означает:',
                    options: [
                        'Запустить nginx в фоне, порт 80 хоста → порт 8080 контейнера',
                        'Запустить nginx в фоне, порт 8080 хоста → порт 80 контейнера',
                        'Запустить nginx интерактивно на двух портах',
                        'Остановить nginx на порту 8080'
                    ],
                    correct: 1,
                    explanation: 'Формат -p хост:контейнер. -p 8080:80 значит: запросы на localhost:8080 перенаправляются на порт 80 внутри контейнера. -d = detached (фоновый режим).'
                },
                {
                    id: 'q13-04-4',
                    type: 'multiple',
                    question: 'Как выполнить bash-команду внутри запущенного контейнера?',
                    options: [
                        'docker exec -it container_name bash',
                        'docker exec -it container_name psql -U postgres',
                        'docker run container_name bash',
                        'docker attach container_name',
                        'docker enter container_name'
                    ],
                    correct: [0, 1, 3],
                    explanation: 'docker exec -it запускает команду в работающем контейнере. docker attach подключается к основному процессу (осторожно с Ctrl+C). docker run создаёт НОВЫЙ контейнер.'
                }
            ]
        }
    ]
};
