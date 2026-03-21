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

type PendingRequest = {
    promise: Promise<CheckAuthUser | null>;
    createdAt: number;
};

const authCache = new Map<string, AuthCacheEntry>();
const AUTH_CACHE_TTL = 30 * 1000;
const PENDING_REQUEST_TTL = 60_000;
const pendingRequests = new Map<string, PendingRequest>();

let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
    if (cleanupInterval) return;
    cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of authCache.entries()) {
            if (entry.expiresAt < now) {
                authCache.delete(key);
            }
        }
        for (const [key, pending] of pendingRequests.entries()) {
            if (pending.createdAt < now - PENDING_REQUEST_TTL) {
                pendingRequests.delete(key);
            }
        }
    }, 60_000);
}

startCleanup();

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

    const pendingKey = `${sessionToken}:${id}`;
    const existingPending = pendingRequests.get(pendingKey);
    if (existingPending) {
        return existingPending.promise;
    }

    const requestPromise = (async () => {
        try {
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
        } finally {
            pendingRequests.delete(pendingKey);
        }
    })();

    pendingRequests.set(pendingKey, { promise: requestPromise, createdAt: now });
    return requestPromise;
};

export const checkAdminAuth = async (): Promise<{ id: string; role: 'admin' } | null> => {
    const user = await checkAuth();
    if (!user) return null;
    
    if (user.role !== 'admin') {
        return null;
    }
    
    return { id: user.id, role: 'admin' };
}
