// Конфигурация CORS
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://xbezumiex.github.io',
  process.env.CLIENT_URL,
].filter(Boolean);

export const corsOptions = {
  origin: (origin, callback) => {
    // Разрешить запросы без origin (мобильные приложения, Postman, curl)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} не разрешён`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
