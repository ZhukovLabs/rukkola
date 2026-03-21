import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
}

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection failed');
        }
        
        const collection = db.collection('categories');

        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes);

        const orderIndex = indexes.find(idx => idx.name === 'order_1');
        if (orderIndex && orderIndex.unique) {
            console.log('Dropping unique order index...');
            await collection.dropIndex('order_1');
            console.log('Dropped unique order index');
        }

        console.log('Creating new non-unique order index...');
        await collection.createIndex({ order: 1 });
        console.log('Created non-unique order index');

        const indexesAfter = await collection.indexes();
        console.log('Indexes after migration:', indexesAfter);

        await mongoose.disconnect();
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

migrate();