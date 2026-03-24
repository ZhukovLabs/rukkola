import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Category extends Document {
  @Prop({ required: true, unique: true, trim: true })
  name!: string;

  @Prop({ required: true, index: true })
  order!: number;

  @Prop({ required: true, index: true })
  isMenuItem!: boolean;

  @Prop({ required: true })
  showGroupTitle!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null, index: true })
  parent?: Types.ObjectId | null;

  @Prop({ default: false, index: true })
  hidden?: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ isMenuItem: 1, parent: 1, order: 1 });

CategorySchema.virtual('id').get(function (this: Category) {
  return this._id.toString();
});

CategorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    const { _id: _, ...rest } = ret;
    return rest;
  },
});

CategorySchema.set('toObject', { virtuals: true });
