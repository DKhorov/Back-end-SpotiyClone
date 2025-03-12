import UserModel from '../models/user.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

class UserService {
  async findByEmail(email) {
    return UserModel.findOne({ email });
  }


  async findAll() {
    return UserModel.find({}, '-passwordHash');
  }

  async create(userData) {
    const user = new UserModel(userData);
    return user.save();
  }

  async update(id, updateData) {
    return UserModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async createPasswordResetToken(email) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    return resetToken;
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error('Token is invalid or has expired');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return user;
  }

  async findById(id) {
    return UserModel.findById(id);
  }

  // Подписаться на пользователя
  async followUser(userId, followerId) {
    const user = await this.findById(userId); // Пользователь, на которого подписываются
    const follower = await this.findById(followerId); // Пользователь, который подписывается

    if (!user || !follower) {
      throw new Error('User not found');
    }

    // Проверяем, что подписка еще не существует
    if (!user.followers.includes(followerId)) {
      user.followers.push(followerId); // Добавляем подписчика
      follower.following.push(userId); // Добавляем в список подписок
      await user.save();
      await follower.save();
    }

    return user;
  }

  // Отписаться от пользователя
  async unfollowUser(userId, followerId) {
    const user = await this.findById(userId); // Пользователь, от которого отписываются
    const follower = await this.findById(followerId); // Пользователь, который отписывается

    if (!user || !follower) {
      throw new Error('User not found');
    }

    // Удаляем подписчика
    user.followers = user.followers.filter((id) => id.toString() !== followerId);
    follower.following = follower.following.filter((id) => id.toString() !== userId);
    await user.save();
    await follower.save();

    return user;
  }

  // Получить список подписчиков
  async getFollowers(userId) {
    const user = await UserModel.findById(userId).populate('followers', 'fullName email avatarUrl');
    return user.followers;
  }

  // Получить количество подписчиков
  async getFollowersCount(userId) {
    const user = await this.findById(userId);
    return user.followers.length;
  }
}

export default UserService;