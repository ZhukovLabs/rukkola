import mongoose from 'mongoose';

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

interface GlobalWithMongooseCache {
    mongooseCache?: MongooseCache;
}

const cached: MongooseCache = (globalThis as GlobalWithMongooseCache).mongooseCache ?? {
    conn: null,
    promise: null,
};

if (!(globalThis as GlobalWithMongooseCache).mongooseCache) {
    (globalThis as GlobalWithMongooseCache).mongooseCache = cached;
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

    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected. Reconnecting...');
        cached.conn = null;

        const reconnect = async () => {
            while (true) {
                try {
                    await mongoose.connect(MONGODB_URI, {
                        bufferCommands: false,
                    });
                    console.log('MongoDB reconnected');
                    break;
                } catch (e) {
                    console.log('Reconnection failed. Retrying in 5s...');
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                }
            }
        };

        reconnect();
    });

    return cached.conn;
}
