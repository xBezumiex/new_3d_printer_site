// Сервис для отправки email
import transporter from '../config/email.js';
import { AppError } from '../utils/errors.js';

const FROM_EMAIL = process.env.EMAIL_FROM || '3D Print Lab <noreply@3dprintlab.com>';

/**
 * Отправка email о новом заказе (клиенту)
 * @param {Object} user - Данные пользователя
 * @param {Object} order - Данные заказа
 */
export const sendOrderConfirmation = async (user, order) => {
  try {
    const mailOptions = {
      from: FROM_EMAIL,
      to: user.email,
      subject: `Заказ #${order.orderNumber} - 3D Print Lab`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Ваш заказ принят!</h2>
          <p>Здравствуйте, <strong>${user.name}</strong>!</p>
          <p>Мы получили ваш заказ на 3D-печать.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Детали заказа #${order.orderNumber}</h3>
            <p><strong>Материал:</strong> ${order.material}</p>
            <p><strong>Качество:</strong> ${order.quality}</p>
            <p><strong>Заполнение:</strong> ${order.infill}%</p>
            <p><strong>Количество:</strong> ${order.quantity} шт.</p>
            <p><strong>Объем:</strong> ${order.volume} см³</p>
            <p><strong>Вес:</strong> ${order.weight} г</p>
            <p style="font-size: 18px; margin-top: 15px;"><strong>Стоимость:</strong> <span style="color: #3b82f6; font-size: 24px;">${order.price} ₽</span></p>
          </div>

          ${order.comments ? `<p><strong>Комментарий:</strong> ${order.comments}</p>` : ''}

          <p>Мы свяжемся с вами в ближайшее время для подтверждения деталей.</p>
          <p>Ожидаемый срок изготовления: <strong>24-48 часов</strong></p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #6b7280; font-size: 14px;">
            С уважением,<br>
            Команда 3D Print Lab<br>
            <a href="mailto:${process.env.SMTP_USER}" style="color: #3b82f6;">Связаться с нами</a>
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✉️ Email о заказе #${order.orderNumber} отправлен на ${user.email}`);
  } catch (error) {
    console.error('Ошибка отправки email:', error);
    // Не бросаем ошибку, чтобы заказ все равно создался
    // throw new AppError('Ошибка отправки email', 500);
  }
};

/**
 * Отправка уведомления админу о новом заказе
 * @param {Object} user - Данные пользователя
 * @param {Object} order - Данные заказа
 */
export const sendOrderNotificationToAdmin = async (user, order) => {
  try {
    const ADMIN_EMAIL = process.env.SMTP_USER; // или отдельный email админа

    const mailOptions = {
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🔔 Новый заказ #${order.orderNumber} - 3D Print Lab`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #3b82f6;">Новый заказ!</h2>
          <p>Поступил новый заказ от <strong>${user.name}</strong></p>

          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Заказ #${order.orderNumber}</h3>
            <p><strong>Клиент:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Телефон:</strong> ${user.phone || 'Не указан'}</p>
            <hr>
            <p><strong>Материал:</strong> ${order.material}</p>
            <p><strong>Качество:</strong> ${order.quality}</p>
            <p><strong>Количество:</strong> ${order.quantity} шт.</p>
            <p><strong>Стоимость:</strong> ${order.price} ₽</p>
            ${order.comments ? `<p><strong>Комментарий:</strong> ${order.comments}</p>` : ''}
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✉️ Уведомление о заказе #${order.orderNumber} отправлено админу`);
  } catch (error) {
    console.error('Ошибка отправки email админу:', error);
  }
};

/**
 * Отправка приветственного email после регистрации
 * @param {Object} user - Данные пользователя
 */
export const sendWelcomeEmail = async (user) => {
  try {
    const mailOptions = {
      from: FROM_EMAIL,
      to: user.email,
      subject: 'Добро пожаловать в 3D Print Lab!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Добро пожаловать, ${user.name}!</h2>
          <p>Спасибо за регистрацию в <strong>3D Print Lab</strong>!</p>
          <p>Теперь вы можете:</p>
          <ul>
            <li>Загружать 3D модели и рассчитывать стоимость печати</li>
            <li>Создавать заказы на печать</li>
            <li>Отслеживать статус ваших заказов</li>
            <li>Делиться своими работами в галерее</li>
            <li>Проходить курсы по 3D-печати</li>
          </ul>

          <p>Если у вас есть вопросы, пишите нам на <a href="mailto:${process.env.SMTP_USER}" style="color: #3b82f6;">${process.env.SMTP_USER}</a></p>

          <p style="margin-top: 30px;">
            С уважением,<br>
            Команда 3D Print Lab
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✉️ Приветственный email отправлен на ${user.email}`);
  } catch (error) {
    console.error('Ошибка отправки welcome email:', error);
  }
};
