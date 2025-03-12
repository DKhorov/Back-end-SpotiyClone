import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    avatarUrl: String,
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Список подписчиков
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Список подписок
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('User', UserSchema);