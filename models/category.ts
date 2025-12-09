import mongoose, {Types, Schema, Document, Model} from 'mongoose'

export type CategoryType = {
    _id: Types.ObjectId,
    name: string
    order: number
    isMenuItem: boolean
    showGroupTitle: boolean
    parent?: Types.ObjectId | null
} & Document;

const CategorySchema = new Schema<CategoryType>({
    name: {type: String, required: true, unique: true, trim: true},
    order: {type: Number, required: true, unique: true},
    isMenuItem: {type: Boolean, required: true, unique: false},
    showGroupTitle: {type: Boolean, required: true, unique: false},
    parent: {type: Schema.Types.ObjectId, ref: 'Category', default: null},
})

export const Category: Model<CategoryType> =
    mongoose.models?.Category || mongoose.model<CategoryType>('Category', CategorySchema)
