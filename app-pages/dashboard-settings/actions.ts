'use server';

import { connectToDatabase } from "@/lib/mongoose";
import { User, UserType } from '@/models/user'
import bcrypt from "bcryptjs";
import { checkAuth } from "@/lib/auth/actions";
import { revalidatePath } from "next/cache";

type CreateUserData = {
    username: string
    password: string
    name: string
    surname?: string
    patronymic?: string
    role?: string
}

function serializeUser(user: any): UserType {
    return {
        _id: user._id.toString(),
        username: user.username,
        name: user.name,
        surname: user.surname,
        patronymic: user.patronymic,
        role: user.role,
    } as UserType
}

export async function createUser(data: CreateUserData) {
    try {
        const user = await checkAuth();
        if (user.role !== 'admin') {
            return { success: false, message: 'Недостаточно прав' }
        }

        await connectToDatabase();

        const existing = await User.findOne({ username: data.username });
        if (existing) {
            return { success: false, message: 'Пользователь с таким логином уже существует' }
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = new User({
            username: data.username,
            password: hashedPassword,
            name: data.name,
            surname: data.surname || '',
            patronymic: data.patronymic || '',
            role: data.role || 'moderator',
        });

        await newUser.save();

        revalidatePath('/dashboard/settings');

        return { success: true, data: serializeUser(newUser) };
    } catch (err: any) {
        console.error(err);
        return { success: false, message: 'Произошла ошибка при создании пользователя' }
    }
}

export async function getUsers() {
    try {
        const user = await checkAuth();
        if (user.role !== 'admin') {
            return { success: false, message: 'Недостаточно прав' }
        }

        await connectToDatabase();

        const users = await User.find().lean().exec();
        return { success: true, data: users.map(serializeUser) };
    } catch (err: any) {
        console.error(err);
        return { success: false, message: 'Не удалось получить пользователей' }
    }
}

export async function updateUser(id: string, data: Partial<UserType>) {
    try {
        const currentUser = await checkAuth();
        if (currentUser.role !== 'admin') {
            return { success: false, message: 'Недостаточно прав' }
        }

        await connectToDatabase();

        const updated = await User.findByIdAndUpdate(id, data, { new: true }).lean().exec()
        if (!updated) {
            return { success: false, message: 'Пользователь не найден' }
        }

        revalidatePath('/dashboard/settings');
        revalidatePath('/dashboard');

        return { success: true, data: serializeUser(updated) };
    } catch (err: any) {
        console.error(err);
        return { success: false, message: 'Не удалось обновить пользователя' }
    }
}

export async function deleteUser(id: string) {
    try {
        const currentUser = await checkAuth();
        if (currentUser.role !== 'admin') {
            return { success: false, message: 'Недостаточно прав' }
        }
        if (id === currentUser.id) {
            return { success: false, message: 'Нельзя удалить самого себя' }
        }

        await connectToDatabase();

        const deleted = await User.findByIdAndDelete(id).lean().exec();
        if (!deleted) {
            return { success: false, message: 'Пользователь не найден' }
        }

        revalidatePath('/dashboard/settings');
        return { success: true, data: serializeUser(deleted) };
    } catch (err: any) {
        console.error(err);
        return { success: false, message: 'Не удалось удалить пользователя' }
    }
}

export async function updatePassword(userId: string, oldPassword: string, newPassword: string) {
    try {
        const currentUser = await checkAuth();
        if (userId !== currentUser.id) {
            return { success: false, message: 'Можно изменить пароль только для себя' }
        }

        await connectToDatabase()

        const user = await User.findById(userId);
        if (!user) return { success: false, message: 'Пользователь не найден' }

        const isValid = await bcrypt.compare(oldPassword, user.password)
        if (!isValid) return { success: false, message: 'Неверный текущий пароль' }

        user.password = await bcrypt.hash(newPassword, 10)
        await user.save()

        return { success: true, message: 'Пароль успешно обновлён' }
    } catch (err: any) {
        console.error(err);
        return { success: false, message: 'Не удалось обновить пароль' }
    }
}
