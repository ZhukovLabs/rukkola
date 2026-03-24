export { apiClient, getToken, setToken, removeToken, ApiError, API_BASE_URL } from './client';

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
  toggleProductAlcohol,
  uploadProductImage,
  reorderProducts,
  moveProductToPosition,
  getCategories as getProductCategories,
} from './products';

export type {
  PortionPrice,
  ProductCategory,
  ProductListItem,
  ProductDetail,
  ProductsResponse,
  CreateProductInput,
  UpdateProductInput,
  CategoryOption,
} from './products';

export {
  getCategories,
  createCategory,
  updateCategoryName,
  deleteCategory,
  toggleCategoryField,
  moveCategory,
  moveCategoryToPosition,
  reorderCategories,
  markCategoryProductsAlcohol,
  markCategoryProductsNonAlcohol,
} from './categories';

export type {
  CategoryItem,
  CreateCategoryInput,
} from './categories';

export {
  getAllLunches,
  uploadLunch,
  deleteLunch,
  activateLunch,
  deactivateAllLunches,
} from './lunches';

export type {
  LunchItem,
} from './lunches';

export {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
} from './users';

export type {
  SerializedUser,
  CreateUserInput,
  UpdateUserInput,
} from './users';

export {
  getMenuData,
  getMenuProducts,
  getMenuProductById,
} from './menu';

export type {
  MenuLunch,
  MenuCategory,
  MenuProduct,
  MenuSubgroup,
  MenuGroup,
  MenuData,
  MenuProductsData,
  MenuProductDetail,
} from './menu';

export {
  getDashboardStats,
} from './dashboard';

export type {
  DashboardStats,
  DashboardData,
} from './dashboard';
