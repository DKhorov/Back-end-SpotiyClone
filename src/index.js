// -------------------------------
// Backend сервер для Spotify клона
// -------------------------------

// Импортируем необходимые модули
import express from 'express';
// import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger.js';

// Импортируем пользовательские модули и middleware
import {
  registerValidator,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from './validations/auth.js';
import { uc } from './control/index.js';
import checkAuth from './utils/checkAuth.js';
import { fileFilter, getAudio } from './control/AudioService.js';

// -------------------------------
// Подключение к базе данных MongoDB
// -------------------------------
//  Реализовано получение базы данных через фабрику
// -------------------------------
// mongoose.connect('API_KEY', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => {
//   console.log('Подключено к MongoDB');
// }).catch((err) => {
//   console.error('Ошибка подключения к MongoDB:', err);
// });

// -------------------------------
// Инициализация приложения Express
// -------------------------------
const app = express();

// -------------------------------
// Middleware для обеспечения безопасности
// -------------------------------
app.use(helmet()); // Установка заголовков безопасности
app.use(xss()); // Защита от XSS атак
app.use(cookieParser()); // Парсинг cookies

// -------------------------------
// Ограничение скорости запросов
// -------------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // Ограничение на 100 запросов за окно windowMs для каждого IP
});
app.use(limiter);

// -------------------------------
// Настройка middleware
// -------------------------------
app.use(express.json()); // Парсинг JSON тел запросов
app.use(cors()); // Включение CORS для всех маршрутов

// -------------------------------
// Swagger документация
// -------------------------------
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// -------------------------------
// Конфигурация загрузки файлов
// -------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Указываем папку для сохранения файлов
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Генерируем уникальное имя файла
  },
});
const upload = multer({ storage: storage, fileFilter }); // Инициализируем multer с настройками хранилища

// -------------------------------
// Статические файлы
// -------------------------------
app.use('/uploads', express.static('uploads')); // Позволяем обслуживать статические файлы из папки uploads

// -------------------------------
// Маршруты
// -------------------------------

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Вход пользователя
 *     tags: [Аутентификация]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 5
 *               fullName:
 *                 type: string
 *                 minLength: 3
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 token:
 *                   type: string
 *       404:
 *         description: Пользователь не найден или неверный пароль
 */
app.post('/auth/login', loginValidation, uc.login); // Маршрут для входа

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Аутентификация]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 5
 *               fullName:
 *                 type: string
 *                 minLength: 3
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *               role:
 *                 type: string
 *                 enum: [user, artist, admin]
 *     responses:
 *       200:
 *         description: Пользователь успешно зарегистрирован
 *       500:
 *         description: Ошибка при регистрации
 */
app.post('/auth/register', registerValidator, uc.register); // Маршрут для регистрации

/**
 * @swagger
 * /auth/update-role:
 *   post:
 *     summary: Обновление роли пользователя
 *     tags: [Аутентификация]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [user, artist, admin]
 *     responses:
 *       200:
 *         description: Роль пользователя успешно обновлена
 *       400:
 *         description: Неверные данные
 *       404:
 *         description: Пользователь не найден
 */
app.post('/auth/update-role', uc.updateUserRole); // Маршрут для обновления роли пользователя

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Получение информации о текущем пользователе
 *     tags: [Пользователи]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *       401:
 *         description: Не авторизован
 */
app.get('/user/me', checkAuth, uc.getMe); // Маршрут для получения информации о текущем пользователе

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Запрос на восстановление пароля
 *     tags: [Аутентификация]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Инструкции по восстановлению пароля отправлены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Ошибка при обработке запроса
 */
app.post('/auth/forgot-password', forgotPasswordValidation, uc.forgotPassword); // Маршрут для запроса восстановления пароля

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Сброс пароля
 *     description: Для сброса пароля необходимо указать токен из URL, код из письма и email.
 *     tags: [Аутентификация]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - code
 *               - email
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Токен сброса пароля из URL
 *               code:
 *                 type: string
 *                 description: Код подтверждения из письма
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email пользователя
 *               password:
 *                 type: string
 *                 minLength: 5
 *                 description: Новый пароль
 *     responses:
 *       200:
 *         description: Пароль успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Недействительный токен или код подтверждения
 *       500:
 *         description: Ошибка при сбросе пароля
 */
app.post('/auth/reset-password', resetPasswordValidation, uc.resetPassword); // Маршрут для сброса пароля

// Маршруты аудио
app.post('/audio/upload', upload.single('music'), (req, res) => {
  res.json({ message: 'Файл успешно загружен' });
}); // Маршрут для загрузки аудиофайла
app.get('/audio/get/:songName', getAudio); // Маршрут для получения данных об аудиофайле

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Получение списка всех пользователей
 *     tags: [Пользователи]
 *     responses:
 *       200:
 *         description: Список всех пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       fullName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       avatarUrl:
 *                         type: string
 *                       role:
 *                         type: string
 *       500:
 *         description: Ошибка при получении списка пользователей
 */
app.get('/users', uc.getAllUsers); // Маршрут для получения списка всех пользователей

// -------------------------------
// Обработка ошибок
// -------------------------------
app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// -------------------------------
// Запуск сервера
// -------------------------------
app.listen(4000, (err) => {
  if (err) {
    return console.error('Ошибка сервера:', err);
  }
  console.log('Сервер запущен на порту 4000');
  console.log('Swagger документация доступна по адресу: http://localhost:4000/api-docs');
});
