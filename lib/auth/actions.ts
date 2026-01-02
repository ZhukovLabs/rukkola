'use server';

import {auth, signOut} from "@/lib/auth";
import {User} from "@/models/user";
import type {UserRole} from "@/models/user";

type CheckAuthUser = { id: string; role: UserRole }

export async function checkAuth(): Promise<CheckAuthUser | null> {
    const session = await auth();

    if (!session?.user?.id || !session.user.role) {
        await signOut();
        return null;
    }

    const {id, role: sessionRole} = session.user;

    const user = await User.findById(id)
        .select("role isActive")
        .lean<CheckAuthUser & { isActive: boolean }>();

    if (!user || !user.isActive || user.role !== sessionRole) {
        await signOut();
        return null;
    }

    return {
        id,
        role: user.role,
    };
}
