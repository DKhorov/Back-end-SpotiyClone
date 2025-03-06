import {body} from 'express-validator'

export const registerValidator = [
    body('email').isEmail(),
    body('password').isLength({min:5}),
    body('fullName').isLength({min:3}),
    body('avatarUrl').optional().isURL(),


]



export const loginValidation = [
    body('email').isEmail(),
    body('password').isLength({min:5}),
    body('fullName').isLength({min:3}),
    body('avatarUrl').optional().isURL(),


]


export const PostCreateValidation = [
    body('title').isLength({ min:10}).isString(),
    body('text').isLength({ min:5}).isString(),
    body('tags').optional().isString(),
    body('imageUrl').optional().isString(),


]
