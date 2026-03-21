import mongoose, {Schema, Document, Types} from "mongoose";

export interface SessionType extends Document {
    userId: Types.ObjectId;
    token: string;
    ip?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
}

const SessionSchema = new Schema<SessionType>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        token: {type: String, required: true, unique: true, index: true},
        ip: {type: String},
        userAgent: {type: String},
        expiresAt: {type: Date, required: true},
    },
    {timestamps: true}
);

SessionSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});
SessionSchema.index({userId: 1});

export const Session =
    mongoose.models?.Session ||
    mongoose.model<SessionType>("Session", SessionSchema);
