import mongoose, {Schema, Document, Model, Types} from 'mongoose'

export type LunchType = {
    _id: Types.ObjectId
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

LunchSchema.index({ active: 1 })

export const Lunch: Model<LunchType> =
    mongoose.models?.Lunch || mongoose.model<LunchType>('Lunch', LunchSchema)
