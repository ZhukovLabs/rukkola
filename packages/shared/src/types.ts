// =====================
// Common API Response
// =====================
export type ApiResponse<T = null> = {
  success: boolean;
  message: string;
  data?: T;
};

// =====================
// Auth Types
// =====================
export type UserRole = 'admin' | 'moderator';

export interface LoginRequest {
  username: string;
  password: string;
  captchaToken?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    name: string;
    role: UserRole;
  };
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

// =====================
// Product Types
// =====================
export interface PortionPrice {
  size: string;
  price: number;
}

export interface ProductDto {
  id: string;
  name: string;
  description?: string | null;
  prices: PortionPrice[];
  image?: string | null;
  categories: CategoryRefDto[];
  hidden: boolean;
  isAlcohol: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryRefDto {
  id: string;
  name: string;
}

export interface ProductListResponse {
  products: ProductDto[];
  total: number;
  totalPages: number;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  prices: PortionPrice[];
  categories?: string[];
  hidden?: boolean;
  isAlcohol?: boolean;
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  prices: PortionPrice[];
  categories: string[];
  hidden: boolean;
  isAlcohol: boolean;
}

// =====================
// Category Types
// =====================
export interface CategoryDto {
  id: string;
  name: string;
  order: number;
  isMenuItem: boolean;
  showGroupTitle: boolean;
  parent?: string | null;
  hidden?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  parentId?: string | null;
  isMenuItem?: boolean;
  showGroupTitle?: boolean;
}

// =====================
// Lunch Types
// =====================
export interface LunchDto {
  _id: string;
  image: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// =====================
// User Types (Admin)
// =====================
export interface SerializedUser {
  _id: string;
  username: string;
  name: string;
  surname?: string;
  patronymic?: string;
  role: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  name: string;
  surname?: string;
  patronymic?: string;
  role?: string;
}

export interface UpdateUserRequest {
  username?: string;
  name?: string;
  surname?: string;
  patronymic?: string;
  role?: string;
}

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// =====================
// Menu (Public) Types
// =====================
export interface MenuProductDto {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  prices: PortionPrice[];
  hidden: boolean;
  isAlcohol: boolean;
  order: number;
}

export interface MenuSubgroupDto {
  id: string;
  name: string;
  order: number;
  showGroupTitle: boolean;
  products: MenuProductDto[];
}

export interface MenuGroupDto {
  id: string;
  categoryName: string;
  categoryOrder: number;
  showGroupTitle: boolean;
  subgroups: MenuSubgroupDto[];
  directProducts: MenuProductDto[];
}

export interface MenuDataResponse {
  activeLunch: {
    id: string;
    image: string | null;
    active: boolean;
  } | null;
  categories: Array<{
    id: string;
    name: string;
    parent: string | null;
    order: number;
    showGroupTitle: boolean;
  }>;
}

export interface MenuProductsResponse {
  groupedProducts: MenuGroupDto[];
  uncategorizedProducts: MenuProductDto[];
}

// =====================
// Dashboard Stats
// =====================
export interface DashboardStatsResponse {
  stats: {
    totalProducts: number;
    hiddenProducts: number;
    totalCategories: number;
    totalUsers: number;
  };
  fullName: string | null;
}

// =====================
// Reorder Types
// =====================
export interface ReorderItem {
  id: string;
  order: number;
}
