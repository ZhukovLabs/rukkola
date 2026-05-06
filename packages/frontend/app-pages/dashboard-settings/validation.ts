import {z} from 'zod'

export const passwordComplexitySchema = z.string()
    .min(6, 'Минимум 6 символов')
    .regex(/[A-ZА-Я]/, 'Минимум 1 большая буква')
    .regex(/[a-zа-я]/, 'Минимум 1 маленькая буква')
    .regex(/[^a-zA-Zа-яА-Я0-9]/, 'Минимум 1 спецсимвол')

export const userSchema = z.object({
    username: z.string()
        .min(1, 'Логин обязателен')
        .max(30, 'Максимум 30 символов')
        .regex(/^[a-zA-Z]+$/, 'Только английские буквы'),
    password: passwordComplexitySchema,
    name: z.string()
        .min(1, 'Имя обязательно')
        .max(120, 'Максимум 120 символов'),
    surname: z.string()
        .max(120, 'Максимум 120 символов')
        .optional(),
    patronymic: z.string()
        .max(120, 'Максимум 120 символов')
        .optional(),
    role: z.enum(['moderator', 'admin'], {
        error: 'Выберите роль',
    }),
})

export const editUserSchema = z.object({
    username: z.string()
        .min(1, 'Логин обязателен')
        .max(30, 'Максимум 30 символов')
        .regex(/^[a-zA-Z]+$/, 'Только английские буквы'),
    name: z.string()
        .min(1, 'Имя обязательно')
        .max(120, 'Максимум 120 символов'),
    surname: z.string()
        .max(120, 'Максимум 120 символов')
        .optional(),
    patronymic: z.string()
        .max(120, 'Максимум 120 символов')
        .optional(),
    role: z.enum(['moderator', 'admin'], {
        error: 'Выберите роль',
    }),
})

export const passwordSchema = z
    .object({
        oldPassword: z.string().min(1, 'Введите текущий пароль'),
        newPassword: passwordComplexitySchema,
        confirmPassword: z.string().min(1, 'Подтвердите пароль'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Пароли не совпадают',
        path: ['confirmPassword'],
    })

export type PasswordFormData = z.infer<typeof passwordSchema>
export type UserFormData = z.infer<typeof userSchema>
export type EditUserFormData = z.infer<typeof editUserSchema>