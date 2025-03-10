import { body } from 'express-validator';

export const registerValidator = [
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
  body('fullName').isLength({ min: 3 }),
  body('avatarUrl').optional().isURL(),
  body('role').optional().isIn(['user', 'artist', 'admin']),
];

export const loginValidation = [
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
  body('fullName').isLength({ min: 3 }),
  body('avatarUrl').optional().isURL(),
];

export const PostCreateValidation = [
  body('title').isLength({ min: 10 }).isString(),
  body('text').isLength({ min: 5 }).isString(),
  body('tags').optional().isString(),
  body('imageUrl').optional().isString(),
];

// Валидация для запроса восстановления пароля
export const forgotPasswordValidation = [body('email').isEmail()];

// Валидация для сброса пароля
export const resetPasswordValidation = [
  body('token').isString().withMessage('Токен обязателен'),
  body('code').isString().withMessage('Код подтверждения обязателен'),
  body('email').isEmail().withMessage('Укажите корректный email'),
  body('password').isLength({ min: 5 }).withMessage('Пароль должен содержать минимум 5 символов'),
];
