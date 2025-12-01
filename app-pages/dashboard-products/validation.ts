import {z} from 'zod';

export const priceSchema = z.object({
    size: z
        .string()
        .nonempty('Размер обязателен')
        .max(50, 'Размер не должен превышать 50 символов'),
    price: z
        .number({error: 'Цена должна быть числом'})
        .min(0.01, 'Беслпатно не отдаем'),
});

export const productSchema = z.object({
    name: z
        .string()
        .nonempty('Название обязательно')
        .max(100, 'Название не должно превышать 100 символов'),
    description: z
        .string()
        .max(500, 'Описание не должно превышать 500 символов')
        .optional(),
    prices: z
        .array(priceSchema)
        .min(1, 'Должна быть хотя бы одна цена')
        .max(10, 'Не более 10 вариантов цен'),
    categories: z.array(z.string()).optional(),
    hidden: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
