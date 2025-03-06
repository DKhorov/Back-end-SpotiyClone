// Импорт модуля express для создания сервера

// Импорт модуля jsonwebtoken для работы с JWT (JSON Web Tokens)
import jwt from 'jsonwebtoken'

// Импорт модуля bcrypt для хеширования паролей
import bcrypt from 'bcrypt'

// Импорт кастомного валидатора для регистрации
import {registerValidator} from '../validations/auth.js'

// Импорт функции validationResult из express-validator для обработки ошибок валидации
import {validationResult} from 'express-validator'

// Импорт модели пользователя из файла user.js
import UserModel from '../models/user.js'
import checkAuth from '../utils/checkAuth.js'




export const login = async (req,res) => {
  try{
    const user = await  UserModel.findOne({email: req.body.email});
    if(!user){
      return req.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
    if (!isValidPass){
      return res.status(404).json({
        message: 'Password не найден',
      });
    }

    const token = jwt.sign(
      {
        _id:user._id, // Использование ID пользователя в качестве payload
      }
      , 'secret123', // Секретный ключ для подписи токена
      {
        expiresIn: '30d', // Срок действия токена - 30 дней
      })

    // Возвращение ответа с данными пользователя и токеном
    res.json({
      user, // Данные пользователя
      token, // JWT токен
    });
  }catch(err){
    return res.status(404).json({
      message: 'Говно доля',
    });

  }

}


export const register = async (req,res) => {
  try{
    // Получение пароля из тела запроса
    const password = req.body.password;
    // Генерация "соли" для хеширования пароля
    const salt = await bcrypt.genSalt(10);
    // Хеширование пароля с использованием соли
    const passwordHash = await bcrypt.hash(password , salt)

    // Создание нового документа пользователя с использованием модели UserModel
    const doc = new UserModel({
      email: req.body.email, // Электронная почта пользователя
      fullName: req.body.fullName, // Полное имя пользователя
      avatarUrl: req.body.avatarUrl, // URL аватара пользователя
      passwordHash, // Хешированный пароль
    });

    // Сохранение документа пользователя в базе данных
    const user = await doc.save();
    // Генерация JWT токена для пользователя
    const token = jwt.sign(
      {
        _id:user._id, // Использование ID пользователя в качестве payload
      }
      , 'secret123', // Секретный ключ для подписи токена
      {
        expiresIn: '30d', // Срок действия токена - 30 дней
      })

    // Возвращение ответа с данными пользователя и токеном
    res.json({
      user, // Данные пользователя
      token, // JWT токен
    });
  }catch(err){
    // Логирование ошибки в консоль
    console.log(err)
    // Возвращение статуса 500 и сообщения об ошибке
    res.status(500).json({
        message: 'Sorry! You not is goodman :( Please register again'
    })
  }

}


export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email }, null, null)
    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден"
      });
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
    if (!isValidPass) {
      return res.status(404).json({
        message: 'Password не найден',
      });
    }

    const token = jwt.sign(
        {
          _id:user._id, // Использование ID пользователя в качестве payload
        }
        , 'secret123', // Секретный ключ для подписи токена
        {
          expiresIn: '30d', // Срок действия токена - 30 дней
        })


    const { fullName, email } = user

    // Ответ в виде данных о юзере + токен
    return res.status("200").json({
      name: fullName,
      email: email,
      token
    })

  } catch (err) {
    // Логирование ошибки в консоль
    console.log(err)
    // Возвращение статуса 500 и сообщения об ошибке
    res.status(500).json({
      message: "Error while getting me",
    })
  }
}

