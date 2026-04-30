// Сервис для отправки email (через Resend HTTP API — работает на Render free tier)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY не задан — email не отправлен');
    return;
  }
  const { error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
  if (error) throw new Error(error.message);
}

const MATERIAL_LABELS = { PLA: 'PLA', ABS: 'ABS', PETG: 'PETG', TPU: 'TPU', NYLON: 'Nylon' };
const QUALITY_LABELS  = { DRAFT: 'Черновик (0.3мм)', STANDARD: 'Стандарт (0.2мм)', HIGH: 'Высокое (0.1мм)', ULTRA: 'Ультра (0.05мм)' };

export const sendOrderConfirmation = async (user, order) => {
  try {
    await sendEmail({
      to: user.email,
      subject: `Заказ #${order.orderNumber} принят — 3D Print Lab`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#3b82f6">Ваш заказ принят!</h2>
          <p>Здравствуйте, <strong>${user.name}</strong>!</p>
          <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:20px 0">
            <h3 style="margin-top:0">Заказ #${order.orderNumber}</h3>
            <p><strong>Материал:</strong> ${MATERIAL_LABELS[order.material] || order.material}</p>
            <p><strong>Качество:</strong> ${QUALITY_LABELS[order.quality] || order.quality}</p>
            <p><strong>Заполнение:</strong> ${order.infill}%</p>
            <p><strong>Количество:</strong> ${order.quantity} шт.</p>
            <p><strong>Объём:</strong> ${order.volume} см³ / ${order.weight} г</p>
            <p style="font-size:18px;margin-top:15px"><strong>Стоимость:</strong> <span style="color:#3b82f6;font-size:22px">${Number(order.price).toLocaleString('ru-RU')} ₽</span></p>
          </div>
          ${order.comments ? `<p><strong>Комментарий:</strong> ${order.comments}</p>` : ''}
          <p>Мы свяжемся с вами в ближайшее время. Срок изготовления: <strong>24–48 часов</strong>.</p>
          <p style="color:#6b7280;font-size:13px">С уважением, команда 3D Print Lab</p>
        </div>
      `,
    });
    console.log(`✉️ Подтверждение заказа #${order.orderNumber} отправлено на ${user.email}`);
  } catch (err) {
    console.error('Ошибка отправки подтверждения заказа:', err.message);
  }
};

export const sendOrderNotificationToAdmin = async (user, order) => {
  try {
    const modelSection = order.modelFile
      ? `<div style="background:#fff3cd;border:1px solid #ffc107;padding:16px;border-radius:8px;margin:16px 0">
           <p style="margin:0 0 8px;font-weight:bold;color:#856404">📎 Файл модели:</p>
           <a href="${order.modelFile}" style="color:#0066cc;word-break:break-all;font-size:13px">${order.modelFile}</a><br><br>
           <a href="${order.modelFile}" style="display:inline-block;background:#ffc107;color:#000;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold">⬇️ Скачать модель</a>
         </div>`
      : `<p style="color:#dc3545">⚠️ Файл модели не прикреплён</p>`;

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `🔔 Новый заказ #${order.orderNumber} от ${user.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
          <div style="background:#3b82f6;padding:20px;border-radius:8px 8px 0 0">
            <h2 style="color:#fff;margin:0">🖨️ Новый заказ #${order.orderNumber}</h2>
          </div>
          <div style="background:#f9fafb;padding:20px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
            <h3 style="margin-top:0">Клиент</h3>
            <p><strong>Имя:</strong> ${user.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${user.email}">${user.email}</a></p>
            <p><strong>Телефон:</strong> ${user.phone || 'Не указан'}</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">
            <h3>Параметры печати</h3>
            <p><strong>Материал:</strong> ${MATERIAL_LABELS[order.material] || order.material}</p>
            <p><strong>Качество:</strong> ${QUALITY_LABELS[order.quality] || order.quality}</p>
            <p><strong>Заполнение:</strong> ${order.infill}%</p>
            <p><strong>Количество:</strong> ${order.quantity} шт.</p>
            <p><strong>Объём:</strong> ${order.volume} см³ / ${order.weight} г</p>
            <p><strong>Стоимость:</strong> <span style="color:#3b82f6;font-size:18px;font-weight:bold">${Number(order.price).toLocaleString('ru-RU')} ₽</span></p>
            ${order.comments ? `<p><strong>Комментарий:</strong> ${order.comments}</p>` : ''}
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">
            <h3>Файл для печати</h3>
            ${modelSection}
            <p style="color:#9ca3af;font-size:12px">Заказ создан: ${new Date(order.createdAt).toLocaleString('ru-RU')}</p>
          </div>
        </div>
      `,
    });
    console.log(`✉️ Уведомление о заказе #${order.orderNumber} отправлено админу`);
  } catch (err) {
    console.error('Ошибка отправки уведомления админу:', err.message);
  }
};

export const sendLikeNotification = async (postAuthor, likerName, postTitle, postId) => {
  if (!postAuthor?.email) return;
  try {
    const siteUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    await sendEmail({
      to: postAuthor.email,
      subject: `${likerName} оценил(а) ваш пост — 3D Print Lab`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h3 style="color:#3b82f6">Новый лайк на ваш пост!</h3>
        <p>Привет, <strong>${postAuthor.name}</strong>!</p>
        <p><strong>${likerName}</strong> оценил(а) ваш пост <strong>"${postTitle}"</strong>.</p>
        <p><a href="${siteUrl}/posts/${postId}" style="color:#3b82f6">Посмотреть пост →</a></p>
        <p style="color:#9ca3af;font-size:13px">Команда 3D Print Lab</p>
      </div>`,
    });
  } catch (e) {
    console.error('Ошибка отправки email о лайке:', e.message);
  }
};

export const sendFollowerNotification = async (targetUser, followerName, followerId) => {
  if (!targetUser?.email) return;
  try {
    const siteUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    await sendEmail({
      to: targetUser.email,
      subject: `${followerName} подписался(ась) на вас — 3D Print Lab`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h3 style="color:#3b82f6">Новый подписчик!</h3>
        <p>Привет, <strong>${targetUser.name}</strong>!</p>
        <p><strong>${followerName}</strong> подписался(ась) на вас.</p>
        <p><a href="${siteUrl}/users/${followerId}" style="color:#3b82f6">Посмотреть профиль →</a></p>
        <p style="color:#9ca3af;font-size:13px">Команда 3D Print Lab</p>
      </div>`,
    });
  } catch (e) {
    console.error('Ошибка отправки email о подписке:', e.message);
  }
};

export const sendCommentNotification = async (postAuthor, commenterName, commentText, postTitle, postId) => {
  if (!postAuthor?.email) return;
  try {
    const siteUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    await sendEmail({
      to: postAuthor.email,
      subject: `Новый комментарий к вашему посту — 3D Print Lab`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h3 style="color:#3b82f6">Новый комментарий!</h3>
        <p>Привет, <strong>${postAuthor.name}</strong>!</p>
        <p><strong>${commenterName}</strong> прокомментировал(а) ваш пост <strong>"${postTitle}"</strong>:</p>
        <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #3b82f6">
          <p style="margin:0;color:#374151">${commentText}</p>
        </div>
        <p><a href="${siteUrl}/posts/${postId}" style="color:#3b82f6">Ответить →</a></p>
        <p style="color:#9ca3af;font-size:13px">Команда 3D Print Lab</p>
      </div>`,
    });
  } catch (e) {
    console.error('Ошибка отправки email о комментарии:', e.message);
  }
};

export const sendWelcomeEmail = async (user) => {
  try {
    await sendEmail({
      to: user.email,
      subject: 'Добро пожаловать в 3D Print Lab!',
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#3b82f6">Добро пожаловать, ${user.name}!</h2>
        <p>Спасибо за регистрацию в <strong>3D Print Lab</strong>!</p>
        <ul>
          <li>Загружайте 3D модели и рассчитывайте стоимость печати</li>
          <li>Оформляйте заказы и отслеживайте их статус</li>
          <li>Делитесь работами в галерее</li>
          <li>Проходите курсы по 3D-печати</li>
        </ul>
        <p style="margin-top:24px;color:#6b7280;font-size:13px">С уважением, команда 3D Print Lab</p>
      </div>`,
    });
    console.log(`✉️ Приветственный email отправлен на ${user.email}`);
  } catch (err) {
    console.error('Ошибка отправки welcome email:', err.message);
  }
};

// Уведомление об изменении статуса заказа
export const sendOrderStatusEmail = async (user, order, status) => {
  const STATUS_LABELS = {
    PENDING: 'Ожидает обработки', CONFIRMED: 'Подтверждён',
    IN_PROGRESS: 'В работе', COMPLETED: 'Выполнен', CANCELLED: 'Отменён',
  };
  try {
    await sendEmail({
      to: user.email,
      subject: `Статус заказа #${order.orderNumber} изменён — 3D Print Lab`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#3b82f6">Статус заказа изменён</h2>
        <p>Здравствуйте, <strong>${user.name}</strong>!</p>
        <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:20px 0;text-align:center">
          <p style="font-size:22px;font-weight:bold;color:#3b82f6;margin:0">${STATUS_LABELS[status] || status}</p>
        </div>
        <p style="color:#6b7280;font-size:13px">С уважением, команда 3D Print Lab</p>
      </div>`,
    });
  } catch (e) {
    console.error('Ошибка отправки email об изменении статуса:', e.message);
  }
};
