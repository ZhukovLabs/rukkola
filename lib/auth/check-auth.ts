'use server';

import {auth, signOut} from "@/lib/auth";
import {User} from "@/models/user";
import {Session} from "@/models/session";
import type {UserRole} from "@/models/user";

type CheckAuthUser = { id: string; role: UserRole };

export const checkAuth = async (): Promise<CheckAuthUser | null> => {
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
