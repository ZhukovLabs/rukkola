'use server';

import {auth} from "@/lib/auth/index";
import {connectToDatabase} from "@/lib/mongoose";
import {User} from "@/models/user";

export async function checkAuth() {
    const session = await auth();

    if (!session || !session.user) {
        throw new Error('Не авторизовано');
    }

    const sessionUser = session.user as { id: string; role: string };

    if (!sessionUser.id) {
        throw new Error('Не авторизовано');
    }

    await connectToDatabase();

    const user = await User.findById(sessionUser.id).select('role').lean();

    if (!user) {
        throw new Error('Пользователь не найден или был удалён');
    }

    if (user.role !== sessionUser.role) {
        throw new Error('Роль пользователя изменилась. Требуется повторный вход');
    }

    return {
        id: sessionUser.id,
        role: user.role as string,
    };
}