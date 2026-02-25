# ✅ Чеклист перед запуском

## Проверьте наличие файлов:

### Server:
- [x] `server/package.json` - Зависимости
- [x] `server/.env` - Переменные окружения
- [x] `server/src/app.js` - Express приложение
- [x] `server/src/server.js` - Точка входа
- [x] `server/src/prisma/schema.prisma` - Prisma схема
- [x] `server/src/prisma/seed.js` - Тестовые данные
- [x] `server/docker-compose.yml` - PostgreSQL

### Client:
- [x] `client/package.json` - Зависимости
- [x] `client/.env` - Переменные окружения
- [x] `client/src/App.jsx` - Главный компонент
- [x] `client/src/routes.jsx` - Маршруты

---

## Быстрый тест:

### 1. PostgreSQL запущен?
```bash
cd server
docker-compose ps
# Должен показать running
```

### 2. Зависимости установлены?
```bash
cd server
ls node_modules | wc -l
# Должно быть > 100

cd ../client
ls node_modules | wc -l
# Должно быть > 100
```

### 3. База данных создана?
```bash
cd server
npm run prisma:studio
# Откроется GUI с таблицами
```

### 4. Backend работает?
Откройте в браузере: `http://localhost:5000/health`
Должен показать JSON с `success: true`

### 5. Frontend работает?
Откройте в браузере: `http://localhost:5173`
Должна открыться главная страница

---

## ⚠️ Важные замечания:

1. **Cloudinary** - Без настройки загрузка изображений не будет работать
   - Зарегистрируйтесь на cloudinary.com
   - Создайте Upload Preset (Settings → Upload → Upload presets)
   - Добавьте credentials в `.env` файлы

2. **Email** - Без настройки email уведомления не будут отправляться
   - Создайте Gmail App Password: https://support.google.com/accounts/answer/185833
   - Добавьте в `server/.env`

3. **Порты** - Убедитесь, что порты 5000 и 5173 свободны
   ```bash
   # Windows
   netstat -ano | findstr :5000
   netstat -ano | findstr :5173
   ```

---

## 🎯 Готовы к запуску?

Если все пункты выше ✅, читайте **START.md** для пошаговой инструкции!
