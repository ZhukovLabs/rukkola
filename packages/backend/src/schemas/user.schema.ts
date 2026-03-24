import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'moderator';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  username!: string;

  @Prop({ required: true, select: false })
  password!: string;

  @Prop({ required: true })
  name!: string;

  @Prop()
  surname?: string;

  @Prop()
  patronymic?: string;

  @Prop({ type: String, enum: ['admin', 'moderator'], default: 'moderator' })
  role!: UserRole;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 0 })
  failedLoginAttempts!: number;

  @Prop({ type: Date, default: null })
  lockUntil!: Date | null;

  comparePassword!: (candidate: string) => Promise<boolean>;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};
