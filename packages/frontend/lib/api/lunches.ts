import { apiClient } from './client';
import type { ActionResponse } from '@/types';

// ---- Types ----

export type LunchItem = {
  _id: string;
  image: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// ---- API Functions ----

export async function getAllLunches(): Promise<ActionResponse<LunchItem[]>> {
  return apiClient.get<ActionResponse<LunchItem[]>>('/lunches');
}

export async function uploadLunch(
  file: File,
): Promise<ActionResponse<{ image: string; id: string }>> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.upload<ActionResponse<{ image: string; id: string }>>(
    '/lunches/upload',
    formData,
  );
}

export async function deleteLunch(
  id: string,
): Promise<ActionResponse> {
  return apiClient.delete<ActionResponse>(`/lunches/${id}`);
}

export async function activateLunch(
  id: string,
): Promise<ActionResponse<{ _id: string; image: string; active: boolean }>> {
  return apiClient.patch<ActionResponse<{ _id: string; image: string; active: boolean }>>(
    `/lunches/${id}/activate`,
  );
}

export async function deactivateAllLunches(): Promise<ActionResponse> {
  return apiClient.patch<ActionResponse>('/lunches/deactivate');
}
