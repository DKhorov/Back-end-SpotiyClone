console.log("Spotify Clone Back-end");

// Импорт необходимых модулей
import cors from 'cors'; // Модуль для обработки CORS (Cross-Origin Resource Sharing)
import multer from 'multer'; // Модуль для обработки загрузки файлов
import path from 'path';
import express from 'express'; // Фреймворк для создания сервера
import jwt from 'jsonwebtoken'; // Модуль для работы с JWT (JSON Web Tokens)
import mongoose from 'mongoose'; // Модуль для работы с MongoDB
import bcrypt from 'bcrypt'; // Модуль для хеширования паролей
import {registerValidator} from './validations/auth.js'; // Валидатор для регистрации
import {loginValidation} from './validations/auth.js'; // Валидатор для входа
import {validationResult} from 'express-validator'; // Модуль для обработки результатов валидации
import UserModel from './models/user.js'; // Модель пользователя
import {uc} from './control/index.js'; // Импорт контроллеров
import checkAuth from './utils/checkAuth.js'; // Мидлвар для проверки авторизации
import { register } from './control/control.js'; // Функция регистрации
import {fileFilter, getAudio} from "./control/AudioService.js"; // импорт функции с AudioService

// Подключение к MongoDB с использованием mongoose
mongoose
 .connect('mongo-url')
 .then(()=>{console.log("Статус базы данных --- OK")}) // Если подключение успешно, выводим сообщение "DataBase --- OK"
 .catch((err)=>{console.log("Статус базы данных --- ERROR" , err)}); // Если произошла ошибка, выводим сообщение "DataBase --- ERROR" и саму ошибку

// Создание экземпляра приложения express
const app = express();

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Указываем папку для сохранения файлов
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Сохраняем файл с оригинальным именем
    }
});

// Использование middleware для обработки JSON и CORS
app.use(express.json()); // Позволяет парсить JSON-тела запросов
app.use(cors()); // Включает CORS для всех маршрутов

// Настройка статической папки для загрузок
app.use('/uploads', express.static('uploads'));

// Инициализация multer с настройками хранилища
const upload = multer({ storage: storage, fileFilter });

// Маршрут для загрузки файлов !-!-! (поменял маршрут с /upload на /audio/upload) !-!-!
app.post('/audio/upload', upload.single('music'), (req, res) => {

    return res.json({
        url: `/uploads/${req.file.filename}`,
        info: req.file
    })
})

// Ловим и выводим ошибки от мультера
app.use((err, req, res, next) => {

    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message })
    }
    else if (err) {
        return res.status(400).json({ message: err.message })
    }

    next()
});

// Маршрут для получения данных об аудиофайле
app.get("/audio/get/:songName", getAudio)

// Маршруты для аутентификации
app.post('/auth/login', loginValidation, uc.login); // Маршрут для входа
app.post('/auth/register', registerValidator, uc.register); // Маршрут для регистрации

// Маршрут для получения данных о пользователе
app.get("/user/me", /*решил не вставлять валидации никакие*/ uc.getMe)

// Запуск сервера на порту 4000
app.listen(4000, (err) => {
    if (err) {
        return console.log("Статус сервера --- ERROR ");
    }
    console.log("Статус сервера --- OK");
});