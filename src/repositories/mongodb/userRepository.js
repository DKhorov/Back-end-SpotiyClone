import BaseUserRepository from '../baseUserRepository.js';
import mongoose from 'mongoose';
import UserModel from '../../models/user.js';
import UserError from '../../errors/userError.js';

class MongoUserRepository extends BaseUserRepository {
  constructor() {
    super();
    console.log('MongoUserRepository initialized');
  }

  async create(data) {
    try {
      const user = new UserModel({
        email: data.email,
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
        passwordHash: data.passwordHash,
        role: data.role || 'user',
      });

      const savedUser = await user.save();
      return {
        id: savedUser._id,
        email: savedUser.email,
        fullName: savedUser.fullName,
        avatarUrl: savedUser.avatarUrl,
        role: savedUser.role,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      };
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error
        throw new UserError('Пользователь с таким email уже существует');
      }
      throw new UserError(error.message);
    }
  }

  async update(id, data) {
    try {
      const updateData = {};

      if (data.fullName !== undefined) updateData.fullName = data.fullName;
      if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
      if (data.role !== undefined) updateData.role = data.role;
      if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;
      if (data.resetPasswordToken !== undefined)
        updateData.resetPasswordToken = data.resetPasswordToken;
      if (data.resetPasswordExpires !== undefined)
        updateData.resetPasswordExpires = data.resetPasswordExpires;

      const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedUser) {
        return null;
      }

      return {
        id: updatedUser._id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role,
        resetPasswordToken: updatedUser.resetPasswordToken,
        resetPasswordExpires: updatedUser.resetPasswordExpires,
      };
    } catch (error) {
      throw new UserError(error.message);
    }
  }

  async delete(id) {
    try {
      const result = await UserModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new UserError(error.message);
    }
  }

  async findById(id) {
    try {
      const user = await UserModel.findById(id);
      if (!user) {
        return null;
      }
      return {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
      };
    } catch (error) {
      throw new UserError(error.message);
    }
  }

  async findByEmail(email) {
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return null;
      }
      return {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        passwordHash: user.passwordHash,
        resetPasswordToken: user.resetPasswordToken,
        resetPasswordExpires: user.resetPasswordExpires,
      };
    } catch (error) {
      throw new UserError(error.message);
    }
  }

  async findByResetToken(token) {
    try {
      const user = await UserModel.findOne({ resetPasswordToken: token });
      if (!user) {
        return null;
      }
      return {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        passwordHash: user.passwordHash,
        resetPasswordToken: user.resetPasswordToken,
        resetPasswordExpires: user.resetPasswordExpires,
      };
    } catch (error) {
      throw new UserError(error.message);
    }
  }

  async findAll() {
    try {
      const users = await UserModel.find();
      return users.map((user) => ({
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        passwordHash: user.passwordHash,
        resetPasswordToken: user.resetPasswordToken,
        resetPasswordExpires: user.resetPasswordExpires,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
    } catch (error) {
      throw new UserError(error.message);
    }
  }
}

export default MongoUserRepository;
