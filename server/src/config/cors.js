// Конфигурация CORS
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://xbezumiex.github.io',
  'https://new-3d-printer-site.vercel.app',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

export const corsOptions = {
  origin: (origin, callback) => {
    // Разрешить запросы без origin (мобильные приложения, Postman, curl)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    const err = new Error(`CORS: origin ${origin} не разрешён`);
    err.statusCode = 403;
    callback(err);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
