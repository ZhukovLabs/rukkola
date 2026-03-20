import mongoose from 'mongoose';

mongoose.set('bufferCommands', true);
mongoose.set('bufferTimeoutMS', 300000);

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

if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (MONGODB_URI) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
    }
}

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Reconnecting...');
    cached.conn = null;
    cached.promise = null;

    const reconnect = async () => {
        while (true) {
            try {
                await mongoose.connect(process.env.MONGODB_URI!, {
                    serverSelectionTimeoutMS: 30000,
                    socketTimeoutMS: 45000,
                });
                console.log('MongoDB reconnected');
                break;
            } catch {
                console.log('Reconnection failed. Retrying in 5s...');
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    };

    reconnect();
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

export async function connectToDatabase() {
    if (!process.env.MONGODB_URI) {
        throw new Error('Добавь MONGODB_URI в .env.local');
    }

    if (cached.conn) return cached.conn;

    if (cached.promise) {
        cached.conn = await cached.promise;
    }

    return cached.conn;
}
