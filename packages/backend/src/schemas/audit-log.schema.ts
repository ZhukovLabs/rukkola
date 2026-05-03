import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user!: User;

  @Prop({ required: true })
  action!: string;

  @Prop({ required: true })
  details!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
