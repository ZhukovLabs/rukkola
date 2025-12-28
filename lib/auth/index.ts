import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import {connectToDatabase} from "../mongoose";
import {User, UserType} from "@/models/user";

export const authConfig = {
    providers: [Credentials({
            name: "Credentials",
            credentials: {
                username: {label: "Логин", type: "text"},
                password: {label: "Пароль", type: "password"},
            },
            async authorize(credentials) {
                await connectToDatabase();

                if (!credentials?.username || !credentials?.password) return null;

                const user = (await User.findOne({username: credentials.username}).lean()) as UserType | null;
                if (!user) return null;

                const isValid = await bcrypt.compare(String(credentials.password), String(user.password));
                if (!isValid) return null;

                return {
                    id: user._id.toString(),
                    username: user.username,
                    name: user.name,
                    surname: user.surname ?? "",
                    patronymic: user.patronymic ?? "",
                    role: user.role ?? "moderator",
                };
            }
        }
    )
    ],
    session: {strategy: "jwt"},
    pages: {
        signIn: "/login"
    },
    callbacks: {
        async jwt({token, user}) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.surname = user.surname;
                token.patronymic = user.patronymic;
                token.role = user.role;
            }
            return token;
        }, async session({session, token}) {
            if (token) {
                session.user.id = token.id as string;
                session.user.name = token.name as string;
                session.user.surname = token.surname as string;
                session.user.patronymic = token.patronymic as string;
                session.user.role = token.role as 'moderator' | 'admin';
            }
            return session;
        }
    }, secret: process.env.NEXTAUTH_SECRET,
} satisfies import("next-auth").NextAuthConfig;

const handler = NextAuth(authConfig);

export const {handlers, auth, signIn, signOut} = handler;