import exclusionsConfig from '@/config/exclusions.json';
import { Category, Product } from '@/types';

export interface ExclusionConfig {
  categories: {
    excluded: string[];
    reason: string;
  };
  products: {
    excluded: string[];
    reason: string;
  };
  settings: {
    enableExclusions: boolean;
    lastUpdated: string;
  };
}

/**
 * Get the exclusion configuration
 */
export function getExclusionConfig(): ExclusionConfig {
  return exclusionsConfig;
}

/**
 * Check if exclusions are enabled
 */
export function areExclusionsEnabled(): boolean {
  return exclusionsConfig.settings.enableExclusions;
}

/**
 * Check if a category should be excluded
 */
export function isCategoryExcluded(categoryId: string): boolean {
  if (!areExclusionsEnabled()) return false;
  return exclusionsConfig.categories.excluded.includes(categoryId);
}

/**
 * Check if a product should be excluded
 */
export function isProductExcluded(productId: string): boolean {
  if (!areExclusionsEnabled()) return false;
  return exclusionsConfig.products.excluded.includes(productId);
}

/**
 * Filter categories based on exclusion list
 */
export function filterExcludedCategories(categories: Category[]): Category[] {
  if (!areExclusionsEnabled()) return categories;
  
  return categories.filter(category => !isCategoryExcluded(category.id));
}

/**
 * Filter products based on exclusion list
 */
export function filterExcludedProducts(products: Product[]): Product[] {
  if (!areExclusionsEnabled()) return products;
  
  return products.filter(product => {
    // Check if product ID is excluded
    if (isProductExcluded(product.id)) {
      return false;
    }
    
    // Check if product's category is excluded
    if (isCategoryExcluded(product.category)) {
      return false;
    }
    
    return true;
  });
}

/**
 * Get excluded category IDs
 */
export function getExcludedCategoryIds(): string[] {
  return exclusionsConfig.categories.excluded;
}

/**
 * Get excluded product IDs
 */
export function getExcludedProductIds(): string[] {
  return exclusionsConfig.products.excluded;
}

/**
 * Add a category to the exclusion list (for runtime exclusion)
 */
export function addCategoryExclusion(categoryId: string): void {
  if (!exclusionsConfig.categories.excluded.includes(categoryId)) {
    exclusionsConfig.categories.excluded.push(categoryId);
  }
}

/**
 * Add a product to the exclusion list (for runtime exclusion)
 */
export function addProductExclusion(productId: string): void {
  if (!exclusionsConfig.products.excluded.includes(productId)) {
    exclusionsConfig.products.excluded.push(productId);
  }
}

/**
 * Remove a category from the exclusion list
 */
export function removeCategoryExclusion(categoryId: string): void {
  const index = exclusionsConfig.categories.excluded.indexOf(categoryId);
  if (index > -1) {
    exclusionsConfig.categories.excluded.splice(index, 1);
  }
}

/**
 * Remove a product from the exclusion list
 */
export function removeProductExclusion(productId: string): void {
  const index = exclusionsConfig.products.excluded.indexOf(productId);
  if (index > -1) {
    exclusionsConfig.products.excluded.splice(index, 1);
  }
}