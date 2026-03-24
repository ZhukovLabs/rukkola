import {z} from 'zod'

export const passwordSchema = z
    .object({
        oldPassword: z.string().min(1, 'Введите текущий пароль'),
        newPassword: z.string().min(6, 'Минимум 6 символов'),
        confirmPassword: z.string().min(1, 'Подтвердите пароль'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Пароли не совпадают',
        path: ['confirmPassword'],
    })

export type PasswordFormData = z.infer<typeof passwordSchema>