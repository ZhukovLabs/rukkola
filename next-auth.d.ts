import "next-auth";
import "next-auth/react";
import "next";
import "next-auth/core/types";

declare module "next-auth" {
    interface Session {
        user: {
            id?: string;
            role?: "admin" | "moderator";
        } & DefaultSession["user"];
    }

    interface User {
        id?: string;
        username?: string;
        name?: string;
        role?: "admin" | "moderator";
        error?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        uid?: string;
        role?: "admin" | "moderator";
    }
}

declare module "next-auth/adapters" {
    interface AdapterUser {
        id?: string;
        username?: string;
        name?: string;
        role?: "admin" | "moderator";
        error?: string;
    }
}
