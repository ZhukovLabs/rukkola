import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SiteSettings } from '../../schemas/site-settings.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

const DEFAULT_SETTINGS = {
  address: 'ул. Советская, 60',
  addressLink:
    'https://yandex.by/maps/org/rukkola/22014226743/?ll=31.003680%2C52.438805&z=20.4',
  addressNote: '(новый универмаг)',
  phone: '+375 (44) 770-30-03',
  phoneLink: 'tel:+375447703003',
  workHours: '12:00 — 23:00',
  workHoursNote: 'без выходных',
};

type SiteSettingsDoc = {
  address: string;
  addressLink: string;
  addressNote: string;
  phone: string;
  phoneLink: string;
  workHours: string;
  workHoursNote: string;
};

@Injectable()
export class SiteSettingsService {
  constructor(
    @InjectModel(SiteSettings.name)
    private siteSettingsModel: Model<SiteSettings>,
    private auditLogService: AuditLogService,
  ) {}

  async getSettings(): Promise<SiteSettingsDoc> {
    let settings = await this.siteSettingsModel.findOne().lean<SiteSettingsDoc>();
    if (!settings) {
      const created = await this.siteSettingsModel.create(DEFAULT_SETTINGS);
      settings = created.toObject() as unknown as SiteSettingsDoc;
    }
    return settings;
  }

  async updateSettings(
    data: Partial<SiteSettingsDoc>,
    userId?: string,
  ): Promise<SiteSettingsDoc> {
    let settings = await this.siteSettingsModel.findOne();
    if (!settings) {
      settings = new this.siteSettingsModel(DEFAULT_SETTINGS);
    }

    const fields = [
      'address',
      'addressLink',
      'addressNote',
      'phone',
      'phoneLink',
      'workHours',
      'workHoursNote',
    ] as const;

    for (const field of fields) {
      if (data[field] !== undefined) {
        (settings as any)[field] = data[field];
      }
    }

    await settings.save();

    if (userId) {
      await this.auditLogService.createLog(
        userId,
        'Обновление контактов сайта',
        'Изменены контактные данные в футере',
        { entityType: 'site-settings' },
      );
    }

    return settings.toObject() as unknown as SiteSettingsDoc;
  }
}
