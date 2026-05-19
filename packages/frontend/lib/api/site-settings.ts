import { apiClient } from './client';
import type { ActionResponse } from '@/types';

export type SiteSettingsData = {
  address: string;
  addressLink: string;
  addressNote: string;
  phone: string;
  phoneLink: string;
  workHours: string;
  workHoursNote: string;
};

export type UpdateSiteSettingsInput = Partial<SiteSettingsData>;

export async function getSiteSettings(): Promise<ActionResponse<SiteSettingsData>> {
  return apiClient.get<ActionResponse<SiteSettingsData>>(
    '/site-settings',
    undefined,
    true,
  );
}

export async function updateSiteSettings(
  data: UpdateSiteSettingsInput,
): Promise<ActionResponse<SiteSettingsData>> {
  return apiClient.patch<ActionResponse<SiteSettingsData>>(
    '/site-settings',
    data,
  );
}
