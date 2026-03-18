# 🖨️ 3D Print Lab

Полнофункциональная платформа для онлайн-заказа 3D-печати с визуализацией моделей, галереей работ, курсами и системой подписок.

## 🚀 Технологии

### Backend:
- **Node.js + Express 5** - REST API
- **PostgreSQL + Prisma 6** - База данных и ORM
- **JWT** - Аутентификация
- **Cloudinary** - Хранение изображений и файлов
- **Nodemailer** - Email уведомления
- **Joi** - Валидация данных

### Frontend:
- **React 18 + Vite** - UI библиотека и сборщик
- **React Router 7** - Маршрутизация
- **TailwindCSS** - Стили
- **Three.js** - 3D визуализация моделей
- **Axios** - HTTP клиент
- **React Hook Form** - Управление формами
- **React Hot Toast** - Уведомления

## 📦 Функциональность

✅ **Авторизация и профили**
- Регистрация/Вход с JWT токенами
- Редактирование профиля
- Загрузка аватара (Cloudinary)
- Просмотр профилей других пользователей

✅ **3D-печать заказов**
- Загрузка 3D-моделей (STL, OBJ, PLY, GLTF, GLB)
- Визуализация моделей в Three.js
- Калькулятор стоимости
- Оформление заказов
- Email уведомления

✅ **Галерея работ (Посты)**
- Создание постов с несколькими изображениями
- Просмотр и поиск постов
- Лайки и просмотры

✅ **Поиск**
- Поиск постов и пользователей
- Фильтры по категориям

✅ **Система подписок**
- Подписка/отписка на пользователей
- Просмотр подписчиков и подписок

✅ **Курсы 3D-печати**
- Курсы для разных уровней (Начинающий, Средний, Продвинутый)
- Уроки с текстом и видео
- Отслеживание прогресса
- Запись на курсы

✅ **Темная тема**
- Переключение светлой/темной темы
- Сохранение настроек в localStorage

---

## 🛠️ Установка и запуск

### 1. Клонируйте репозиторий
```bash
git clone <repository-url>
cd 3d-print-website```

### 2. Настройка Backend

#### Установите зависимости:
```bash
cd server
npm install
```

#### Настройте переменные окружения:
Отредактируйте файл `server/.env`:
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/3d_print_db

# Cloudinary (получите на cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (используйте Gmail App Password)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Запустите PostgreSQL:
```bash
docker-compose up -d
```

#### Запустите миграции Prisma:
```bash
npm run prisma:migrate
```

#### Заполните базу тестовыми данными:
```bash
npm run prisma:seed
```

**Тестовые аккаунты:**
- Admin: `admin@3dprint.com` / `password123`
- User1: `ivan@example.com` / `password123`
- User2: `maria@example.com` / `password123`

#### Запустите сервер:
```bash
npm run dev
```

Сервер: `http://localhost:5000`

---

### 3. Настройка Frontend

#### Установите зависимости:
```bash
cd ../client
npm install
```

#### Настройте переменные окружения:
Отредактируйте файл `client/.env`:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

**Важно:** В Cloudinary создайте Upload Preset с режимом "Unsigned".

#### Запустите клиент:
```bash
npm run dev
```

Клиент: `http://localhost:5173`

---

## 🎯 Быстрый старт

```bash
# 1. Запустите PostgreSQL
cd server
docker-compose up -d

# 2. Установите зависимости и запустите backend
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev

# 3. В новом терминале: запустите frontend
cd ../client
npm install
npm run dev
```

Откройте `http://localhost:5173` и войдите с `admin@3dprint.com` / `password123`

---

## 📝 Скрипты

### Server:
- `npm run dev` - Запуск в режиме разработки
- `npm run prisma:migrate` - Запуск миграций
- `npm run prisma:seed` - Заполнение тестовыми данными
- `npm run prisma:studio` - GUI для базы данных

### Client:
- `npm run dev` - Запуск в режиме разработки
- `npm run build` - Сборка для production

---

## 🔒 Роли пользователей

- **USER** - Обычный пользователь (посты, заказы, курсы)
- **ADMIN** - Администратор (управление курсами, статусы заказов)