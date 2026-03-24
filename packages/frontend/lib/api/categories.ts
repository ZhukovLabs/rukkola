import { apiClient } from './client';
import type { ActionResponse } from '@/types';

// ---- Types ----

export type CategoryItem = {
  _id: string;
  name: string;
  order: number;
  isMenuItem: boolean;
  showGroupTitle: boolean;
  parent?: string | null;
  hidden?: boolean;
};

export type CreateCategoryInput = {
  name: string;
  parentId?: string | null;
  isMenuItem?: boolean;
  showGroupTitle?: boolean;
};

// ---- API Functions ----

export async function getCategories(): Promise<ActionResponse<CategoryItem[]>> {
  return apiClient.get<ActionResponse<CategoryItem[]>>('/categories');
}

export async function createCategory(
  data: CreateCategoryInput,
): Promise<ActionResponse<{ id: string }>> {
  return apiClient.post<ActionResponse<{ id: string }>>('/categories', data);
}

export async function updateCategoryName(
  id: string,
  name: string,
): Promise<ActionResponse> {
  return apiClient.patch<ActionResponse>(`/categories/${id}/name`, { name });
}

export async function deleteCategory(
  id: string,
): Promise<ActionResponse> {
  return apiClient.delete<ActionResponse>(`/categories/${id}`);
}

export async function toggleCategoryField(
  id: string,
  field: 'isMenuItem' | 'showGroupTitle',
): Promise<ActionResponse> {
  return apiClient.patch<ActionResponse>(`/categories/${id}/toggle`, { field });
}

export async function moveCategory(
  id: string,
  direction: 'up' | 'down',
): Promise<ActionResponse> {
  return apiClient.patch<ActionResponse>(`/categories/${id}/move`, { direction });
}

export async function moveCategoryToPosition(
  categoryId: string,
  newPosition: number,
): Promise<ActionResponse> {
  return apiClient.patch<ActionResponse>(
    `/categories/${categoryId}/move-to-position`,
    { newPosition },
  );
}

export async function reorderCategories(
  updates: { id: string; order: number }[],
): Promise<ActionResponse> {
  return apiClient.patch<ActionResponse>('/categories/reorder', { updates });
}

export async function markCategoryProductsAlcohol(
  categoryId: string,
): Promise<ActionResponse<{ updatedCount: number }>> {
  return apiClient.patch<ActionResponse<{ updatedCount: number }>>(
    `/categories/${categoryId}/mark-alcohol`,
  );
}

export async function markCategoryProductsNonAlcohol(
  categoryId: string,
): Promise<ActionResponse<{ updatedCount: number }>> {
  return apiClient.patch<ActionResponse<{ updatedCount: number }>>(
    `/categories/${categoryId}/mark-non-alcohol`,
  );
}
