import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class PortionPrice {
  @Prop({ required: true })
  size!: string;

  @Prop({ required: true })
  price!: number;
}

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true, trim: true, index: 'text' })
  name!: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: [{ size: String, price: Number, _id: false }], required: false })
  prices!: PortionPrice[];

  @Prop({ required: false })
  image?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }], index: true })
  categories!: Types.ObjectId[];

  @Prop({ default: false, index: true })
  hidden!: boolean;

  @Prop({ default: false, index: true })
  isAlcohol!: boolean;

  @Prop({ default: 0 })
  order!: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ hidden: 1, isAlcohol: 1 });
ProductSchema.index({ categories: 1, hidden: 1 });
ProductSchema.index({ categories: 1, order: 1 });

ProductSchema.virtual('id').get(function (this: Product) {
  return this._id.toString();
});

ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    const { _id: _, ...rest } = ret;
    return rest;
  },
});

ProductSchema.set('toObject', { virtuals: true });
