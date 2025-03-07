import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
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
    enum: ['user', 'artist', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true,
});

export default mongoose.model('User', UserSchema);