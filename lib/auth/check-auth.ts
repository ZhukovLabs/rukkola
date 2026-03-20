'use server';

import {auth, signOut} from "@/lib/auth";
import {User} from "@/models/user";
import {Session} from "@/models/session";
import {connectToDatabase} from "@/lib/mongoose";
import type {UserRole} from "@/models/user";

type CheckAuthUser = { id: string; role: UserRole };

type AuthCacheEntry = {
    user: CheckAuthUser;
    expiresAt: number;
};

const authCache = new Map<string, AuthCacheEntry>();
const AUTH_CACHE_TTL = 30 * 1000;

export const checkAuth = async (): Promise<CheckAuthUser | null> => {
    const session = await auth();

    if (!session?.user?.id || !session.user.role || !session.user.sessionToken) {
        return null;
    }

    const {id, role: sessionRole, sessionToken} = session.user;

    const now = Date.now();
    const cached = authCache.get(sessionToken);

    if (cached && cached.expiresAt > now && cached.user.id === id && cached.user.role === sessionRole) {
        return cached.user;
    }

    await connectToDatabase();

    const sessionRecord = await Session.findOne({token: sessionToken})
        .select('expiresAt')
        .lean<{ expiresAt: Date }>()
        .maxTimeMS(5000);

    if (!sessionRecord || sessionRecord.expiresAt < new Date()) {
        authCache.delete(sessionToken);
        await Session.deleteOne({token: sessionToken}).catch(() => {});
        await signOut().catch(() => {});
        return null;
    }

    const user = await User.findById(id)
        .select("role isActive")
        .lean<CheckAuthUser & { isActive: boolean }>()
        .maxTimeMS(5000);

    if (!user || !user.isActive || user.role !== sessionRole) {
        authCache.delete(sessionToken);
        await Session.deleteOne({token: sessionToken}).catch(() => {});
        await signOut().catch(() => {});
        return null;
    }

    authCache.set(sessionToken, {
        user: {id, role: user.role},
        expiresAt: now + AUTH_CACHE_TTL,
    });

    return {
        id,
        role: user.role,
    };
};

export const checkAdminAuth = async (): Promise<{ id: string; role: 'admin' } | null> => {
    const user = await checkAuth();
    if (!user) return null;
    
    if (user.role !== 'admin') {
        return null;
    }
    
    return { id: user.id, role: 'admin' };
}
