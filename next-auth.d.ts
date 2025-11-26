import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface User extends DefaultUser {
        id: string;
        username: string;
        name: string;
        surname: string;
        patronymic: string;
        role: "admin" | "moderator";
    }

    interface Session {
        user: {
            id: string;
            username: string;
            name: string;
            surname: string;
            patronymic: string;
            role: "admin" | "moderator";
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username: string;
        name: string;
        surname: string;
        patronymic: string;
        role: "admin" | "moderator";
        provider?: string;
        iat?: number;
        exp?: number;
    }
}
