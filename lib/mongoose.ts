import mongoose from 'mongoose';

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

const cached: MongooseCache = (globalThis as any).mongooseCache ?? {
    conn: null,
    promise: null,
};

if (!(globalThis as any).mongooseCache) {
    (globalThis as any).mongooseCache = cached;
}

export async function connectToDatabase() {
    const MONGODB_URI = process.env.MONGODB_URI as string;

    if (!MONGODB_URI) {
        throw new Error('Добавь MONGODB_URI в .env.local');
    }

    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}