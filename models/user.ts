import mongoose, { Schema, Document, Types } from 'mongoose';

export type UserType = {
    _id: Types.ObjectId;
    username: string;
    password: string;
    name: string;
    surname?: string;
    patronymic?: string;
    role?: 'admin' | 'moderator';
} & Document;

const UserSchema = new Schema<UserType>({
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    surname: String,
    patronymic: String,
    role: { type: String, enum: ['admin', 'moderator'], default: 'moderator' }
});

export const User = (mongoose.models?.User as mongoose.Model<UserType>) || mongoose.model<UserType>('User', UserSchema);
