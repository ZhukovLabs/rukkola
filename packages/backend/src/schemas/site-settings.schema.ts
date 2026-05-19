import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'site-settings', timestamps: true })
export class SiteSettings extends Document {
  @Prop({ default: 'ул. Советская, 60' })
  address!: string;

  @Prop({
    default:
      'https://yandex.by/maps/org/rukkola/22014226743/?ll=31.003680%2C52.438805&z=20.4',
  })
  addressLink!: string;

  @Prop({ default: '(новый универмаг)' })
  addressNote!: string;

  @Prop({ default: '+375 (44) 770-30-03' })
  phone!: string;

  @Prop({ default: 'tel:+375447703003' })
  phoneLink!: string;

  @Prop({ default: '12:00 — 23:00' })
  workHours!: string;

  @Prop({ default: 'без выходных' })
  workHoursNote!: string;
}

export const SiteSettingsSchema = SchemaFactory.createForClass(SiteSettings);

SiteSettingsSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    const { _id: _, __v: __, ...rest } = ret;
    return rest;
  },
});
