import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger.js';
import {
  registerValidator,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from './validations/auth.js';
import { uc } from './control/index.js';
import checkAuth from './utils/checkAuth.js';
import { fileFilter, getAudio } from './control/AudioService.js';

mongoose.connect('API_KEY', {
  appName: 'Cluster0', // Указываем имя приложения здесь, если это необходимо
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


const app = express();

app.use(helmet());
app.use(xss());
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);
app.use(express.json());
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, fileFilter });

app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, uc.login);
app.post('/auth/register', registerValidator, uc.register);
app.get('/auth/me', checkAuth, uc.getMe);
app.post('/auth/forgot-password', forgotPasswordValidation, uc.forgotPassword);
app.post('/auth/reset-password', resetPasswordValidation, uc.resetPassword);
app.get('/users', checkAuth, uc.getAllUsers);
app.patch('/users/:userId/role', checkAuth, uc.updateUserRole);
app.post('/upload', checkAuth, upload.single('audio'), (req, res) => {
  res.json({ message: 'Файл успешно загружен', file: req.file });
});
app.get('/audio/:filename', getAudio);
app.post('/users/:userId/follow', checkAuth, uc.followUser);
app.post('/users/:userId/unfollow', checkAuth, uc.unfollowUser);
app.get('/users/:userId/followers', checkAuth, uc.getFollowers);


app.use((err, req, res) => {
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

app.listen(4000, (err) => {
  if (err) return console.error('Ошибка сервера:', err);
  console.log('Сервер запущен на порту 4000');
  console.log('Swagger документация доступна по адресу: http://localhost:4000/api-docs');
});