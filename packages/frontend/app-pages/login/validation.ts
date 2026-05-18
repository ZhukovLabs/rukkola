import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, 'Логин должен содержать минимум 3 символа'),
  password: z.string().min(5, 'Пароль должен содержать минимум 5 символов'),
  captchaToken: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;