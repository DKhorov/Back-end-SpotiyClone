import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

class EmailService {
  constructor() {
    // Создаем транспорт для отправки писем
    // В реальном приложении здесь будут настройки SMTP-сервера
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.example.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'user@example.com',
        pass: process.env.EMAIL_PASSWORD || 'password',
      },
    });

    // Хранилище для временных кодов
    this.resetCodes = new Map();
  }

  // Метод для отправки письма для сброса пароля
  async sendPasswordResetEmail(email, resetToken, fullName) {
    // Генерируем короткий одноразовый код (6 цифр)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Сохраняем соответствие кода и email
    this.resetCodes.set(resetCode, email);

    // Через 1 час удаляем код из хранилища
    setTimeout(
      () => {
        this.resetCodes.delete(resetCode);
      },
      60 * 60 * 1000,
    );

    // Формируем URL для сброса пароля с токеном
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Формируем содержимое письма
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"SpotifyClone" <noreply@spotifyclone.com>',
      to: email,
      subject: 'Сброс пароля на SpotifyClone',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1DB954;">Сброс пароля на SpotifyClone</h2>
          <p>Здравствуйте, ${fullName}!</p>
          <p>Мы получили запрос на сброс пароля для вашей учетной записи.</p>
          <p>Для сброса пароля выполните два шага:</p>
          <ol>
            <li>Нажмите на кнопку ниже, чтобы перейти на страницу сброса пароля:</li>
            <p>
              <a href="${resetUrl}" style="display: inline-block; background-color: #1DB954; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                Перейти на страницу сброса пароля
              </a>
            </p>
            <li>Введите следующий код подтверждения на странице сброса пароля:</li>
            <p style="font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">
              ${resetCode}
            </p>
          </ol>
          <p>Ссылка и код действительны в течение 1 часа.</p>
          <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
          <p>С уважением,<br>Команда SpotifyClone</p>
        </div>
      `,
    };

    try {
      // Отправляем письмо
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: %s', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Метод для проверки кода и email
  verifyResetCode(code, email) {
    const storedEmail = this.resetCodes.get(code);
    if (storedEmail && storedEmail === email) {
      // Удаляем код после использования
      this.resetCodes.delete(code);
      return true;
    }
    return false;
  }
}

export default new EmailService();
