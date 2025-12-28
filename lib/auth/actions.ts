'use server';

import {auth, signOut} from "@/lib/auth/index";
import {connectToDatabase} from "@/lib/mongoose";
import {User} from "@/models/user";

export async function checkAuth() {
    const session = await auth();

    if (!session || !session.user) {
        return await signOut();
    }

    const sessionUser = session.user as { id: string; role: string };

    if (!sessionUser.id) {
        return await signOut();
    }

    const user = await User.findById(sessionUser.id).select('role').lean();

    if (!user) {
        return await signOut();
    }

    if (user.role !== sessionUser.role) {
        return await signOut();
    }

    return {
        id: sessionUser.id,
        role: user.role as string,
    };
}