import NextAuth, {type NextAuthConfig, type User as NextAuthUser} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {Session as NextAuthSession} from "next-auth";
import {JWT as NextAuthJWT} from "next-auth/jwt";

import {connectToDatabase} from "@/lib/mongoose";
import {User} from "@/models/user";
import {isValidCredentials} from "@/lib/auth/utils";

export const authConfig: NextAuthConfig = {
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                username: {label: "Логин", type: "text"},
                password: {label: "Пароль", type: "password"},
            },

            async authorize(credentials): Promise<NextAuthUser | { error: string }> {
                if (!isValidCredentials(credentials)) return {error: "Некорректные учетные данные"};

                await connectToDatabase();

                const user = await User.findOne({username: credentials!.username!.toLowerCase()}).select("+password");

                if (!user || !user.isActive) {
                    return {error: "Неверный логин или пароль"};
                }

                if (user.lockUntil && user.lockUntil > new Date()) {
                    return {error: "Слишком много попыток входа. Попробуйте позже."};
                }

                const isValid = await user.comparePassword(credentials!.password as string);
                if (!isValid) {
                    user.failedLoginAttempts = (user.failedLoginAttempts ?? 0) + 1;
                    if (user.failedLoginAttempts >= 5) {
                        user.lockUntil = new Date(Date.now() + 5 * 60 * 1000);
                        user.failedLoginAttempts = 0;
                    }
                    await user.save();
                    return {error: "Неверный логин или пароль"};
                }

                user.failedLoginAttempts = 0;
                user.lockUntil = null;

                await user.save();

                return {
                    id: user._id.toString(),
                    username: user.username,
                    name: user.name,
                    role: user.role ?? "moderator",
                };
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

    pages: {
        signIn: "/login",
        signOut: "/login", // Перенаправление после выхода
        error: "/login", // Обработка ошибок
    },

    callbacks: {
        async signIn({user}: { user: NextAuthUser }) {
            if (user?.error) {
                return `/login?error=${encodeURIComponent(user.error)}`;
            }
            return true;
        },

        async jwt({token, user}: { token: NextAuthJWT; user?: NextAuthUser }) {
            if (user && !user.error) {
                token.uid = user.id;
                token.role = user.role;
            }
            return token;
        },

        async session({session, token}: { session: NextAuthSession; token: NextAuthJWT }) {
            if (session.user) {
                session.user.id = token.uid;
                session.user.role = token.role;
            }
            return session;
        },

        async redirect({url, baseUrl}) {
            if (url === "/logout" || url === "/api/auth/signout") {
                return `${baseUrl}/login`;
            }
            return url.startsWith(baseUrl) ? url : baseUrl;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
};

export const {handlers, auth, signIn, signOut} = NextAuth(authConfig);