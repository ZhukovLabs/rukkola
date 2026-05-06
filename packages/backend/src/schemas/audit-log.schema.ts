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

  @Prop({ required: false })
  entityType?: string;

  @Prop({ required: false })
  entityId?: string;

  @Prop({ required: false })
  ip?: string;

  @Prop({ required: false })
  userAgent?: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  metadata?: Record<string, any>;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
