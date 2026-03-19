import mongoose, {Schema, Document, Model, Types} from 'mongoose'
import './category';

export type PortionPrice = {
    size: string
    price: number
}

export type ProductType = {
    _id: Types.ObjectId
    name: string
    description: string
    prices: PortionPrice[]
    image: string
    categories: mongoose.Types.ObjectId[]
    hidden?: boolean
    isAlcohol?: boolean
    createdAt?: Date
    updatedAt?: Date
} & Document;

const PortionPriceSchema = new Schema<PortionPrice>(
    {
        size: {type: String, required: true},
        price: {type: Number, required: true},
    },
    {_id: false}
)

const ProductSchema = new Schema<ProductType>(
    {
        name: {type: String, required: true, trim: true, index: 'text'},
        description: {type: String, required: false},
        prices: {type: [PortionPriceSchema], required: false},
        image: {type: String, required: false},
        categories: [{type: Schema.Types.ObjectId, ref: 'Category', required: false, index: true}],
        hidden: {type: Boolean, required: false, default: false, index: true},
        isAlcohol: {type: Boolean, required: false, default: false, index: true},
    },
    {timestamps: true}
)

ProductSchema.index({ hidden: 1, isAlcohol: 1 });
ProductSchema.index({ categories: 1, hidden: 1 });

ProductSchema.virtual('id').get(function (this: ProductType) {
    return this._id.toString();
});

ProductSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        const { _id: _, ...rest } = ret;
        return rest;
    },
});

ProductSchema.set('toObject', {virtuals: true});

export const Product: Model<ProductType> =
    mongoose.models?.Product || mongoose.model<ProductType>('Product', ProductSchema)
