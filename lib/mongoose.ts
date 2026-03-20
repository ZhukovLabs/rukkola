import mongoose from 'mongoose';

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI && typeof window === 'undefined') {
    console.error('CRITICAL: MONGODB_URI is not defined in environment variables');
}

const MONGODB_OPTIONS = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    maxPoolSize: 20,
    minPoolSize: 5,
    connectTimeoutMS: 10000,
    heartbeatFrequencyMS: 10000,
};

const cached: MongooseCache = globalThis.mongooseCache ?? {
    conn: null,
    promise: null,
};

if (!globalThis.mongooseCache) {
    globalThis.mongooseCache = cached;
}

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    cached.conn = null;
    cached.promise = null;
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
    cached.conn = null;
    cached.promise = null;
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
});

export async function connectToDatabase(): Promise<typeof mongoose> {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI не задан в переменных окружения');
    }

    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    if (cached.promise) {
        try {
            cached.conn = await cached.promise;
            return cached.conn;
        } catch {
            cached.promise = null;
            cached.conn = null;
        }
    }

    cached.promise = mongoose.connect(MONGODB_URI, MONGODB_OPTIONS);

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null;
        cached.conn = null;
        console.error('Failed to connect to MongoDB:', err);
        throw new Error('Не удалось подключиться к базе данных');
    }

    return cached.conn;
}
