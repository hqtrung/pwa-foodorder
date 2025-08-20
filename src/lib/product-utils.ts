import { Product, Category } from '@/types';
import { vietnameseIncludes } from './vietnamese-utils';

/**
 * Unified sorting function that applies consistent ordering across all product listings
 * Sorting priority: Category Order > Popularity > Name
 */
export function sortProducts(
  products: Product[], 
  categories: Category[]
): Product[] {
  // Create a map of category ID to sequence for sorting
  const categorySequenceMap = new Map<string, number>();
  categories.forEach(category => {
    categorySequenceMap.set(category.id, category.sequence || 999);
  });

  return products.sort((a, b) => {
    // 1. First priority: Sort by category sequence
    const aSequence = categorySequenceMap.get(a.category) || 999;
    const bSequence = categorySequenceMap.get(b.category) || 999;
    if (aSequence !== bSequence) {
      return aSequence - bSequence;
    }

    // 2. Second priority: Sort by popularity within same category
    const aIsPopular = a.tags?.includes('popular') ? 1 : 0;
    const bIsPopular = b.tags?.includes('popular') ? 1 : 0;
    if (aIsPopular !== bIsPopular) {
      return bIsPopular - aIsPopular; // Popular products first
    }

    // 3. Third priority: Sort by name alphabetically (Vietnamese-aware)
    return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
  });
}

/**
 * Centralized product filtering function
 */
export function filterProducts(
  products: Product[],
  options: {
    searchQuery?: string;
    categoryId?: string;
    showAvailableOnly?: boolean;
  }
): Product[] {
  let filtered = [...products];

  // Apply search filter first (searches all products with Vietnamese accent-insensitive matching)
  if (options.searchQuery?.trim().length >= 2) {
    const query = options.searchQuery.trim();
    filtered = filtered.filter(product =>
      vietnameseIncludes(product.name, query) ||
      vietnameseIncludes(product.description, query)
    );
  }

  // Apply category filter ONLY when not searching (to allow global search)
  if (options.categoryId && (!options.searchQuery || options.searchQuery.trim().length < 2)) {
    filtered = filtered.filter(product => product.category === options.categoryId);
  }

  // Filter by availability
  if (options.showAvailableOnly) {
    filtered = filtered.filter(product => product.isAvailable);
  }

  return filtered;
}

/**
 * Combined filter and sort function for convenience
 */
export function filterAndSortProducts(
  products: Product[],
  categories: Category[],
  options: {
    searchQuery?: string;
    categoryId?: string;
    showAvailableOnly?: boolean;
  }
): Product[] {
  const filtered = filterProducts(products, options);
  return sortProducts(filtered, categories);
}