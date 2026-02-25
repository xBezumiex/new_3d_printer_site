// Конфигурация Email (Nodemailer)
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Создание транспорта для Gmail SMTP
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true для порта 465, false для других
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS // App Password от Gmail
  }
});

// Проверка подключения
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Ошибка подключения к SMTP:', error.message);
  } else {
    console.log('✅ SMTP сервер готов к отправке писем');
  }
});

export default transporter;
