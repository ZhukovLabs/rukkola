import { apiClient } from './client';
import type { ActionResponse } from '@/types';

// ---- Types ----

export type MenuLunch = {
  _id: string;
  image: string;
  active: boolean;
};

export type MenuCategory = {
  _id: string;
  name: string;
  order: number;
  isMenuItem: boolean;
  showGroupTitle: boolean;
  parent?: string | null;
  hidden?: boolean;
};

export type MenuProduct = {
  _id: { toString(): string } | string;
  name: string;
  description?: string | null;
  image?: string | null;
  prices?: Array<{ size: string; price: number }>;
  isAlcohol?: boolean;
  order: number;
};

export type MenuSubgroup = {
  _id: string;
  name: string;
  order: number;
  showGroupTitle: boolean;
  products: MenuProduct[];
};

export type MenuGroup = {
  _id: string;
  name: string;
  order: number;
  showGroupTitle: boolean;
  subgroups: MenuSubgroup[];
  directProducts: MenuProduct[];
};

export type MenuData = {
  activeLunch: MenuLunch | null;
  categories: MenuCategory[];
};

export type MenuProductsData = {
  groupedProducts: MenuGroup[];
  uncategorizedProduct: MenuProduct[];
};

export type MenuProductDetail = {
  id: string;
  image?: string;
  name: string;
  description?: string;
};

// ---- API Functions ----

export async function getMenuData(
  showAlcohol = false,
): Promise<ActionResponse<MenuData>> {
  const params = new URLSearchParams();
  params.set('showAlcohol', String(showAlcohol));

  return apiClient.get<ActionResponse<MenuData>>(`/menu?${params.toString()}`);
}

export async function getMenuProducts(
  showAlcohol = false,
): Promise<ActionResponse<MenuProductsData>> {
  const params = new URLSearchParams();
  params.set('showAlcohol', String(showAlcohol));

  return apiClient.get<ActionResponse<MenuProductsData>>(
    `/menu/products?${params.toString()}`,
  );
}

export async function getMenuProductById(
  id: string,
): Promise<ActionResponse<MenuProductDetail>> {
  return apiClient.get<ActionResponse<MenuProductDetail>>(`/menu/product/${id}`);
}
