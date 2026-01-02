import mongoose, {Schema, Document, Types} from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "admin" | "moderator";

export interface UserType extends Document {
    _id: Types.ObjectId;
    username: string;
    password: string;
    name: string;
    surname?: string;
    patronymic?: string;
    role: UserRole;
    isActive: boolean;

    failedLoginAttempts: number,
    lockUntil: Date | null;

    comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<UserType>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        name: {type: String, required: true},
        surname: String,
        patronymic: String,
        role: {
            type: String,
            enum: ["admin", "moderator"],
            default: "moderator",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        failedLoginAttempts: {type: Number, default: 0, select: true},
        lockUntil: {type: Date, default: null, select: true},
    },
    {timestamps: true},
);

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

UserSchema.methods.comparePassword = function (candidate: string) {
    return bcrypt.compare(candidate, this.password);
};

export const User =
    mongoose.models.User || mongoose.model<UserType>("User", UserSchema);
