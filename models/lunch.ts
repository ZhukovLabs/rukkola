import mongoose, { Schema, Document, Model } from 'mongoose'

export type LunchType = {
    image: string
    active: boolean
    createdAt?: Date
    updatedAt?: Date
} & Document

const LunchSchema = new Schema<LunchType>(
    {
        image: { type: String, required: true, trim: true },
        active: { type: Boolean, default: false },
    },
    { timestamps: true }
)

export const Lunch: Model<LunchType> =
    mongoose.models?.Lunch || mongoose.model<LunchType>('Lunch', LunchSchema)
