import mongoose from 'mongoose';

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

interface GlobalWithMongooseCache {
    mongooseCache?: MongooseCache;
}

declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = globalThis.mongooseCache ?? {
    conn: null,
    promise: null,
};

if (!globalThis.mongooseCache) {
    globalThis.mongooseCache = cached;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI && typeof window === 'undefined') {
    console.warn('MONGODB_URI is not defined in environment variables');
}

const MONGODB_OPTIONS = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
    connectTimeoutMS: 10000,
};

async function connectMongoose(): Promise<typeof mongoose> {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI не задан в переменных окружения');
    }

    cached.promise = mongoose.connect(MONGODB_URI, MONGODB_OPTIONS);
    
    cached.promise.catch((err) => {
        console.error('MongoDB connection error:', err);
        cached.promise = null;
    });

    return cached.promise;
}

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    if (cached.conn) {
        cached.conn = null;
        cached.promise = null;
    }
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    cached.conn = null;
    cached.promise = null;
});

process.on('beforeExit', async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
    }
});

export async function connectToDatabase(): Promise<typeof mongoose> {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI не задан в переменных окружения');
    }

    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = connectMongoose();
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}
