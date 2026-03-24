import { apiClient } from '@/lib/api/client';

export const uploadImageToApi = async (productId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  await apiClient.upload(`/products/${productId}/upload`, formData);
};
