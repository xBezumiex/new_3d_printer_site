# 3D Print Lab - Backend Server

## Настройка

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения
Скопируйте `.env.example` в `.env` и заполните переменные:
```bash
cp .env.example .env
```

Важные переменные:
- `DATABASE_URL` - URL PostgreSQL базы данных
- `JWT_SECRET` - секретный ключ для JWT
- `CLOUDINARY_*` - ключи Cloudinary
- `SMTP_*` - настройки Gmail SMTP

### 3. Запуск PostgreSQL
Через Docker Compose (из корня проекта):
```bash
docker-compose up -d
```

Или установите PostgreSQL локально.

### 4. Миграции базы данных
После запуска PostgreSQL выполните миграции:
```bash
npm run prisma:migrate
```

Это создаст все таблицы в БД.

### 5. Seed данных (опционально)
Для добавления тестовых данных:
```bash
npm run prisma:seed
```

### 6. Prisma Studio (опционально)
Для просмотра данных через GUI:
```bash
npm run prisma:studio
```

## Запуск сервера

### Development
```bash
npm run dev
```

Сервер запустится на `http://localhost:5000`

### Production
```bash
npm start
```

## API Endpoints

### Авторизация
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - логин
- `GET /api/auth/me` - получить текущего пользователя (требует JWT)

### Заказы
- `POST /api/orders` - создать заказ
- `GET /api/orders` - список заказов
- `GET /api/orders/:id` - детали заказа

### Посты
- `GET /api/posts` - список постов
- `POST /api/posts` - создать пост (требует авторизации)

### Курсы
- `GET /api/courses` - список курсов
- `GET /api/courses/:id` - детали курса

И другие endpoints...

## Структура проекта
```
server/
├── src/
│   ├── config/          # Конфигурация
│   ├── controllers/     # Контроллеры
│   ├── routes/          # Маршруты
│   ├── middlewares/     # Middleware
│   ├── services/        # Бизнес-логика
│   ├── validators/      # Валидаторы
│   ├── utils/           # Утилиты
│   ├── prisma/          # Prisma схема и миграции
│   ├── app.js           # Express приложение
│   └── server.js        # Точка входа
└── package.json
```
