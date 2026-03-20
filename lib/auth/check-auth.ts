'use server';

import {auth, signOut} from "@/lib/auth";
import {User} from "@/models/user";
import {Session} from "@/models/session";
import {connectToDatabase} from "@/lib/mongoose";
import type {UserRole} from "@/models/user";

type CheckAuthUser = { id: string; role: UserRole };

export const checkAuth = async (): Promise<CheckAuthUser | null> => {
    await connectToDatabase();

    const session = await auth();

    if (!session?.user?.id || !session.user.role || !session.user.sessionToken) {
        await signOut();
        return null;
    }

    const {id, role: sessionRole, sessionToken} = session.user;

    const sessionRecord = await Session.findOne({token: sessionToken}).lean<{ expiresAt: Date }>();
    if (!sessionRecord || sessionRecord.expiresAt < new Date()) {
        await signOut();
        return null;
    }

    const user = await User.findById(id)
        .select("role isActive")
        .lean<CheckAuthUser & { isActive: boolean }>();

    if (!user || !user.isActive || user.role !== sessionRole) {
        await Session.deleteOne({token: sessionToken});
        await signOut();
        return null;
    }

    return {
        id,
        role: user.role,
    };
}

export const checkAdminAuth = async (): Promise<{ id: string; role: 'admin' } | null> => {
    const user = await checkAuth();
    if (!user) return null;
    
    if (user.role !== 'admin') {
        return null;
    }
    
    return { id: user.id, role: 'admin' };
}
