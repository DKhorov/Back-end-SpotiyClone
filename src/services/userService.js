import BaseService from './baseService.js';
import DBFactory from '../config/dbFactory.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

class UserService extends BaseService {
  constructor() {
    const userRepository = DBFactory.getRepository('user');
    super(userRepository);
    this.userRepository = userRepository;
  }

  async findByEmail(email) {
    return await this.userRepository.findByEmail(email);
  }

  async findAll() {
    return await this.userRepository.findAll();
  }

  // Создание токена для сброса пароля
  async createPasswordResetToken(email) {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    // Генерация случайного токена
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Установка срока действия токена (1 час)
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    // Обновление пользователя с токеном и сроком действия
    await this.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    });

    return {
      email: user.email,
      resetToken,
      fullName: user.fullName,
    };
  }

  // Проверка токена сброса пароля и обновление пароля
  async resetPassword(token, newPassword) {
    // Поиск пользователя с указанным токеном и проверка срока действия
    const user = await this.userRepository.findByResetToken(token);

    if (!user) {
      return { success: false, message: 'Недействительный токен сброса пароля' };
    }

    // Проверка срока действия токена
    if (user.resetPasswordExpires < new Date()) {
      return { success: false, message: 'Срок действия токена истек' };
    }

    // Хеширование нового пароля
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Обновление пароля и сброс токена
    await this.update(user.id, {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return { success: true, message: 'Пароль успешно обновлен' };
  }
}

export default UserService;
