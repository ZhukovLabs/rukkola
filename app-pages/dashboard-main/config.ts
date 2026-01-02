export const DASHBOARD_TEXTS = {
    welcome: {
        greeting: "Добро пожаловать",
    },
    about: {
        title: "О панели администратора",
        description: [
            "Здесь вы можете управлять продуктами и категориями вашего магазина.",
            "Используйте меню слева для навигации и выбора нужного раздела.",
            "Все изменения сохраняются автоматически. Следите за статистикой и контролируйте содержимое сайта.",
        ],
    },
    sections: {
        products: {
            title: "Управление продуктами",
            description: "Добавляйте новые продукты, редактируйте существующие и скрывайте ненужные.",
        },
        categories: {
            title: "Категории",
            description: "Организуйте продукты по категориям для удобства навигации и отображения на сайте.",
        },
        stats: {
            title: "Статистика",
            description: "Отслеживайте общее количество продуктов и категорий в вашей системе.",
        },
    },
};

import { Product } from "@/models/product";
import { Category } from "@/models/category";
import { User } from "@/models/user";

type DashboardStats = {
    products: number;
    hiddenProducts: number;
    categories: number;
    users: number;
};

type DashboardUser = {
    name?: string;
    surname?: string;
    patronymic?: string;
};

export const getDashboardData = async (
    userId?: string
): Promise<{
    stats: DashboardStats;
    fullName: string;
}> => {
    const [
        products,
        hiddenProducts,
        categories,
        users,
        user,
    ] = await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ hidden: true }),
        Category.countDocuments(),
        User.countDocuments(),
        userId
            ? User.findById(userId)
                .select("name surname patronymic")
                .lean<DashboardUser>()
            : null,
    ]);

    const fullName = user
        ? [user.name, user.surname, user.patronymic]
            .filter(Boolean)
            .join(" ")
        : "";

    return {
        stats: {
            products,
            hiddenProducts,
            categories,
            users,
        },
        fullName,
    };
};
