import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Lunch extends Document {
  @Prop({ required: true, trim: true })
  image!: string;

  @Prop({ default: false })
  active!: boolean;
}

export const LunchSchema = SchemaFactory.createForClass(Lunch);

LunchSchema.index({ active: 1 });
