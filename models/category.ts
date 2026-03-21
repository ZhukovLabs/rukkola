import mongoose, {Types, Schema, Document, Model} from 'mongoose'

export type CategoryType = {
    id: string;
    _id: Types.ObjectId,
    name: string
    order: number
    isMenuItem: boolean
    showGroupTitle: boolean
    parent?: Types.ObjectId | null
    hidden?: boolean
} & Document;

const CategorySchema = new Schema<CategoryType>({
    name: {type: String, required: true, unique: true, trim: true},
    order: {type: Number, required: true, index: true},
    isMenuItem: {type: Boolean, required: true, unique: false, index: true},
    showGroupTitle: {type: Boolean, required: true, unique: false},
    parent: {type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true},
    hidden: {type: Boolean, required: false, default: false, index: true},
})

CategorySchema.index({ isMenuItem: 1, parent: 1, order: 1 });

CategorySchema.virtual('id').get(function (this: CategoryType) {
    return this._id.toString();
});

CategorySchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        const { _id: _, ...rest } = ret;
        return rest;
    },
});

CategorySchema.set('toObject', { virtuals: true });

export const Category: Model<CategoryType> =
    mongoose.models?.Category || mongoose.model<CategoryType>('Category', CategorySchema)
