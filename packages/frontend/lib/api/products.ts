import { apiClient } from './client';
import type { ActionResponse } from '@/types';

// ---- Types ----

export type PortionPrice = {
  size: string;
  price: number;
};

export type ProductCategory = {
  id: string;
  name: string;
  order?: number;
  parent?: string;
};

export type ProductListItem = {
  id: string;
  name: string;
  description: string;
  isAlcohol?: boolean;
  prices: PortionPrice[];
  image: string;
  hidden?: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
  categories: ProductCategory[];
  sortOrder: number;
  categoryId?: string;
  parentCategoryId?: string;
  categoryOrder: number;
  parentCategoryOrder: number;
};

export type ProductDetail = {
  id: string;
  name: string;
  description: string;
  prices: PortionPrice[];
  image: string;
  categories: { id: string; name: string }[];
  hidden?: boolean;
  isAlcohol?: boolean;
  order?: number;
};

export type ProductsResponse = {
  products: ProductListItem[];
  total: number;
  totalPages: number;
};

export type CreateProductInput = {
  name: string;
  description?: string;
  prices: PortionPrice[];
  categories?: string[];
  hidden?: boolean;
  isAlcohol?: boolean;
};

export type UpdateProductInput = {
  name: string;
  description?: string;
  prices: PortionPrice[];
  categories?: string[];
  hidden: boolean;
  isAlcohol: boolean;
};

export type CategoryOption = {
  id: string;
  name: string;
  order: number;
};

// ---- API Functions ----

export async function getProducts(
  page = 1,
  limit = 10,
  search?: string,
  category?: string,
): Promise<ActionResponse<ProductsResponse>> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (search) params.set('search', search);
  if (category) params.set('category', category);

  return apiClient.get<ActionResponse<ProductsResponse>>(
    `/products?${params.toString()}`,
  );
}

export async function getProductById(
  id: string,
): Promise<ActionResponse<ProductDetail>> {
  return apiClient.get<ActionResponse<ProductDetail>>(`/products/${id}`);
}

export async function createProduct(
  data: CreateProductInput,
): Promise<ActionResponse<{ id: string }>> {
  return apiClient.post<ActionResponse<{ id: string }>>('/products', data);
}

export async function updateProduct(
  id: string,
  data: UpdateProductInput,
): Promise<ActionResponse<{ id: string }>> {
  return apiClient.patch<ActionResponse<{ id: string }>>(`/products/${id}`, data);
}

export async function deleteProduct(
  productId: string,
): Promise<ActionResponse<{ id: string }>> {
  return apiClient.delete<ActionResponse<{ id: string }>>(`/products/${productId}`);
}

export async function toggleProductVisibility(
  productId: string,
): Promise<ActionResponse<{ id: string; hidden: boolean }>> {
  return apiClient.patch<ActionResponse<{ id: string; hidden: boolean }>>(
    `/products/${productId}/visibility`,
  );
}

export async function toggleProductAlcohol(
  productId: string,
): Promise<ActionResponse<{ id: string; isAlcohol: boolean }>> {
  return apiClient.patch<ActionResponse<{ id: string; isAlcohol: boolean }>>(
    `/products/${productId}/alcohol`,
  );
}

export async function uploadProductImage(
  productId: string,
  file: File,
): Promise<ActionResponse<{ image: string }>> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.upload<ActionResponse<{ image: string }>>(
    `/products/${productId}/upload`,
    formData,
  );
}

export async function reorderProducts(
  updates: Array<{ id: string; order: number }>,
): Promise<ActionResponse<{ success: boolean }>> {
  return apiClient.patch<ActionResponse<{ success: boolean }>>(
    '/products/reorder',
    { updates },
  );
}

export async function swapProductOrder(
  orderedIds: string[],
  pageOffset: number,
): Promise<ActionResponse<{ success: boolean }>> {
  return apiClient.patch<ActionResponse<{ success: boolean }>>(
    '/products/swap',
    { orderedIds, pageOffset },
  );
}

export async function moveProductToPosition(
  productId: string,
  newPosition: number,
  search?: string,
  category?: string,
): Promise<ActionResponse<{ success: boolean }>> {
  return apiClient.patch<ActionResponse<{ success: boolean }>>(
    `/products/${productId}/move`,
    { newPosition, search, category },
  );
}

export async function getCategories(): Promise<ActionResponse<CategoryOption[]>> {
  return apiClient.get<ActionResponse<CategoryOption[]>>('/products/categories');
}
