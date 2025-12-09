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
        name: {type: String, required: true, trim: true},
        description: {type: String, required: false},
        prices: {type: [PortionPriceSchema], required: false},
        image: {type: String, required: false},
        categories: [{type: Schema.Types.ObjectId, ref: 'Category', required: false}],
        hidden: {type: Boolean, required: false, default: false},
    },
    {timestamps: true}
)

export const Product: Model<ProductType> =
    mongoose.models?.Product || mongoose.model<ProductType>('Product', ProductSchema)
