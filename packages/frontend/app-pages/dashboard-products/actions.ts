// Re-export API functions to maintain backward compatibility with existing imports
export { 
  getProducts,
  getProductById,
  createProduct,
  updateProduct as updateProductData,
  deleteProduct,
  toggleProductVisibility,
  toggleProductAlcohol,
  uploadProductImage,
  reorderProducts,
  swapProductOrder,
  moveProductToPosition,
  getCategories,
} from '@/lib/api/products';

export type { CreateProductInput } from '@/lib/api/products';
