import NextAuth, {type NextAuthConfig, type User as NextAuthUser} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {Session as NextAuthSession} from "next-auth";
import {JWT as NextAuthJWT} from "next-auth/jwt";
import {v4 as uuidv4} from "uuid";

import {connectToDatabase} from "@/lib/mongoose";
import {User} from "@/models/user";
import {isValidCredentials} from "@/lib/auth/utils";
import {Session} from "@/models/session";
import {checkRateLimit} from "@/lib/auth/rate-limit";
import {verifyCaptcha} from "@/lib/auth/captcha";

export const authConfig: NextAuthConfig = {
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                username: {label: "Логин", type: "text"},
                password: {label: "Пароль", type: "password"},
                captchaToken: {label: "CAPTCHA Token", type: "text"},
            },

            async authorize(credentials, req): Promise<NextAuthUser | { error: string }> {
                if (!isValidCredentials(credentials)) return {error: "Некорректные учетные данные"};

                const ip =
                    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
                    req.headers.get("x-real-ip") ??
                    "unknown";

                const rateLimitResult = checkRateLimit(ip);
                if (!rateLimitResult.allowed) {
                    const remainingMinutes = rateLimitResult.blockedUntil
                        ? Math.ceil((rateLimitResult.blockedUntil - Date.now()) / 60000)
                        : 30;
                    return {error: `Слишком много попыток входа. Попробуйте через ${remainingMinutes} мин.`};
                }

                const captchaResult = await verifyCaptcha(credentials!.captchaToken);
                if (!captchaResult.success) {
                    return {error: captchaResult.error || "CAPTCHA не пройдена"};
                }

                await connectToDatabase();

                const user = await User.findOne({username: credentials!.username!.toLowerCase()}).select("+password");

                if (!user || !user.isActive) {
                    return {error: "Неверный логин или пароль"};
                }

                if (user.lockUntil && user.lockUntil > new Date()) {
                    return {error: "Слишком много попыток входа. Попробуйте позже."};
                }

                if (!user.name) {
                    user.name = user.username;
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

                const userAgent = req.headers.get("user-agent") ?? "unknown";

                return {
                    id: user._id.toString(),
                    username: user.username,
                    name: user.name || user.username,
                    role: user.role ?? "moderator",

                    ip,
                    userAgent
                };
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

    pages: {
        signIn: "/login",
        signOut: "/",
        error: "/login",
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

                const sessionToken = uuidv4();

                await connectToDatabase();

                await Session.create({
                    userId: user.id,
                    token: sessionToken,
                    ip: user.ip,
                    userAgent: user.userAgent,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });

                token.sessionToken = sessionToken;
            }

            return token;
        },

        async session({session, token}: { session: NextAuthSession; token: NextAuthJWT }) {
            if (session.user) {
                session.user.id = token.uid;
                session.user.role = token.role;
                session.user.sessionToken = token.sessionToken;
            }
            return session;
        },
    },
    events: {
        async signOut(message) {
            //@ts-expect-error - ok
            const sessionToken = message?.token?.sessionToken;
            if (!sessionToken) return;

            try {
                await Session.deleteOne({token: sessionToken});
            } catch (err) {
                console.error("Ошибка при удалении сессии:", err);
            }
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export const {handlers, auth, signIn, signOut} = NextAuth(authConfig);