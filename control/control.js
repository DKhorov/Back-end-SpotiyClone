// Импорт модуля express для создания сервера

// Импорт модуля jsonwebtoken для работы с JWT (JSON Web Tokens)
import jwt from "jsonwebtoken";

// Импорт модуля bcrypt для хеширования паролей
import bcrypt from "bcrypt";

// Импорт кастомного валидатора для регистрации
import { registerValidator } from "../validations/auth.js";

// Импорт функции validationResult из express-validator для обработки ошибок валидации
import { validationResult } from "express-validator";

// Импорт модели пользователя из файла user.js
import UserModel from "../models/user.js";
import checkAuth from "../utils/checkAuth.js";

import UserService from "../services/userService.js";
import UserError from "../errors/userError.js";

const userService = new UserService();

export const login = async (req, res) => {
  try {
    // const user = await UserModel.findOne({ email: req.body.email });
    const user = await userService.findByEmail(req.body.email);
    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }
    console.log(req.body)
    console.log(user)
    const isValidPass = await bcrypt.compare(
      req.body.password,
      user.passwordHash
    );
    console.log(isValidPass)
    if (!isValidPass) {
      return res.status(404).json({
        message: "Password не найден",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id, // Использование ID пользователя в качестве payload
      },
      "secret123", // Секретный ключ для подписи токена
      {
        expiresIn: "30d", // Срок действия токена - 30 дней
      }
    );

    // Exclude passwordHash from the user data
    const { passwordHash, ...userData } = user;

    // Check if the user is an admin and customize the response
    if (user.role === "admin") {
      return res.json({
        message: "Привет, админ!",
        user: userData, // Данные пользователя без passwordHash
        token, // JWT токен
      });
    }

    // Default response for non-admin users
    res.json({
      user: userData, // Данные пользователя без passwordHash
      token, // JWT токен
    });
  } catch (err) {
    console.log(err);
    if (err instanceof UserError) {
      return res.status(400).json({
        message: err.message,
      });
    }
    return res.status(404).json({
      message: "Error while trying to login or register user",
    });
  }
};

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash,
      role: req.body.role || "user", // Добавляем роль из запроса или устанавливаем 'user' по умолчанию
    });

    // const user = await doc.save();
    //теперь нужно создать пользователя через сервис
    const user = await userService.create(doc);

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash: _, ...userData } = user;

    return res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    if (err instanceof UserError) {
      return res.status(400).json({
        message: err.message,
      });
    }
    return res.status(500).json({
      message: "Sorry! You not is goodman :( Please register again", 
    });
  }
};

export const getMe = async (req, res) => {
  try {
    // const user = await UserModel.findOne({ email: req.body.email }, null, null);
    const user = await userService.findByEmail(req.body.email);
    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user.passwordHash
    );
    if (!isValidPass) {
      return res.status(404).json({
        message: "Password не найден",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id, // Использование ID пользователя в качестве payload
      },
      "secret123", // Секретный ключ для подписи токена
      {
        expiresIn: "30d", // Срок действия токена - 30 дней
      }
    );

    const { fullName, email } = user;

    // Ответ в виде данных о юзере + токен
    return res.status("200").json({
      name: fullName,
      email: email,
      token,
    });
  } catch (err) {
    // Логирование ошибки в консоль
    console.log(err);
    if (err instanceof UserError) {
      return res.status(400).json({
        message: err.message,
      });
    }
    // Возвращение статуса 500 и сообщения об ошибке
    res.status(500).json({
      message: "Error while getting me",
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    if (!["user", "artist", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // const updatedUser = await UserModel.findOneAndUpdate(
    //   { email: email },
    //   { role: role },
    //   { new: true }
    // );

    const user = await userService.findByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
      role: role,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
    };

    const updatedUser = await userService.update(user.id, updateData);

    res.json({
      success: true,
      user: {
        email: user.email,
        role: updatedUser.role,
        fullName: updatedUser.fullName,
      },
    });
  } catch (err) {
    console.error(err);
    if (err instanceof UserError) {
      return res.status(400).json({
        message: err.message,
      });
    }
    res.status(500).json({
      message: "An error occurred while updating user role",
    });
  }
};
