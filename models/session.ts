import mongoose, {Schema, Document, Types} from "mongoose";

export interface SessionType extends Document {
    userId: Types.ObjectId;
    token: string;
    createdAt: Date;
    expiresAt: Date;
}

const SessionSchema = new Schema<SessionType>({
        userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
        token: {type: String, required: true},
        createdAt: {type: Date, default: Date.now},
        expiresAt: {type: Date, required: true},
    }
);

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session =
    mongoose.models.Session || mongoose.model<SessionType>("Session", SessionSchema);
