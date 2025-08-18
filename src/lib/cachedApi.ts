'use client';

import { apiClient, ApiCategory, ApiProduct, ApiCacheStatus } from './api';
import { simpleCache } from '@/services/simpleCache';

interface CacheOptions {
  forceRefresh?: boolean;
  allowStale?: boolean;
}

export class CachedAPI {
  private api = apiClient;
  
  // Cache keys
  private readonly CACHE_KEYS = {
    categories: 'categories',
    products: 'products',
    productsByCategory: (id: number) => `products_category_${id}`,
    cacheStatus: 'cache_status'
  };

  // TTL values (in milliseconds)
  private readonly TTL = {
    categories: 60 * 60 * 1000,    // 1 hour
    products: 30 * 60 * 1000,      // 30 minutes
    cacheStatus: 5 * 60 * 1000     // 5 minutes
  };

  /**
   * Get categories with caching
   */
  async getCategories(options: CacheOptions = {}): Promise<ApiCategory[]> {
    const cacheKey = this.CACHE_KEYS.categories;
    
    // If force refresh is requested, skip cache
    if (!options.forceRefresh) {
      const cached = simpleCache.get(cacheKey);
      if (cached) {
        console.log('Categories loaded from cache');
        
        // Fetch fresh data in background if cache is getting old
        this.refreshInBackground(() => this.fetchCategories(), cacheKey);
        return cached;
      }
    }

    try {
      // Fetch fresh data from API
      const fresh = await this.fetchCategories();
      simpleCache.set(cacheKey, fresh, this.TTL.categories);
      console.log('Categories loaded from API and cached');
      return fresh;
    } catch (error) {
      // console.error('Failed to fetch categories from API:', error);
      
      // If API fails and we allow stale data, try to return expired cache
      if (options.allowStale) {
        const stale = simpleCache.getStale(cacheKey);
        if (stale) {
          console.warn('API failed, returning stale cached categories');
          return stale;
        }
      }
      
      throw error;
    }
  }

  /**
   * Get products with caching
   */
  async getProducts(categoryId?: number, options: CacheOptions = {}): Promise<ApiProduct[]> {
    const cacheKey = categoryId 
      ? this.CACHE_KEYS.productsByCategory(categoryId)
      : this.CACHE_KEYS.products;
    
    // If force refresh is requested, skip cache
    if (!options.forceRefresh) {
      const cached = simpleCache.get(cacheKey);
      if (cached) {
        console.log(`Products${categoryId ? ` for category ${categoryId}` : ''} loaded from cache`);
        
        // Fetch fresh data in background if cache is getting old
        this.refreshInBackground(() => this.fetchProducts(categoryId), cacheKey);
        return cached;
      }
    }

    try {
      // Fetch fresh data from API
      const fresh = await this.fetchProducts(categoryId);
      simpleCache.set(cacheKey, fresh, this.TTL.products);
      console.log(`Products${categoryId ? ` for category ${categoryId}` : ''} loaded from API and cached`);
      return fresh;
    } catch (error) {
      // console.error(`Failed to fetch products${categoryId ? ` for category ${categoryId}` : ''} from API:`, error);
      
      // If API fails and we allow stale data, try to return expired cache
      if (options.allowStale) {
        const stale = simpleCache.getStale(cacheKey);
        if (stale) {
          console.warn(`API failed, returning stale cached products${categoryId ? ` for category ${categoryId}` : ''}`);
          return stale;
        }
      }
      
      throw error;
    }
  }

  /**
   * Get single product (no caching for individual products to keep it simple)
   */
  async getProduct(id: number): Promise<ApiProduct> {
    return this.api.getProduct(id);
  }

  /**
   * Get cache status with caching
   */
  async getCacheStatus(options: CacheOptions = {}): Promise<ApiCacheStatus> {
    const cacheKey = this.CACHE_KEYS.cacheStatus;
    
    if (!options.forceRefresh) {
      const cached = simpleCache.get(cacheKey);
      if (cached) {
        console.log('Cache status loaded from cache');
        return cached;
      }
    }

    try {
      const fresh = await this.api.getCacheStatus();
      simpleCache.set(cacheKey, fresh, this.TTL.cacheStatus);
      console.log('Cache status loaded from API and cached');
      return fresh;
    } catch (error) {
      // console.error('Failed to fetch cache status from API:', error);
      
      if (options.allowStale) {
        const stale = simpleCache.getStale(cacheKey);
        if (stale) {
          console.warn('API failed, returning stale cached status');
          return stale;
        }
      }
      
      throw error;
    }
  }

  /**
   * Force refresh all cached data
   */
  async refreshAll(): Promise<void> {
    console.log('Refreshing all cached data...');
    
    try {
      const [categories, products] = await Promise.all([
        this.getCategories({ forceRefresh: true }),
        this.getProducts(undefined, { forceRefresh: true })
      ]);
      
      console.log(`Refreshed ${categories.length} categories and ${products.length} products`);
    } catch (error) {
      console.error('Failed to refresh cached data:', error);
      throw error;
    }
  }

  /**
   * Check if we have cached data (even if expired)
   */
  hasCachedData(): {
    categories: boolean;
    products: boolean;
    cacheStatus: boolean;
  } {
    return {
      categories: simpleCache.hasStale(this.CACHE_KEYS.categories),
      products: simpleCache.hasStale(this.CACHE_KEYS.products),
      cacheStatus: simpleCache.hasStale(this.CACHE_KEYS.cacheStatus)
    };
  }

  /**
   * Check if we have fresh (non-expired) cached data
   */
  hasFreshData(): {
    categories: boolean;
    products: boolean;
    cacheStatus: boolean;
  } {
    return {
      categories: simpleCache.has(this.CACHE_KEYS.categories),
      products: simpleCache.has(this.CACHE_KEYS.products),
      cacheStatus: simpleCache.has(this.CACHE_KEYS.cacheStatus)
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return simpleCache.getStats();
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    simpleCache.clear();
    console.log('All cached data cleared');
  }

  /**
   * Remove specific cache entry
   */
  removeCacheEntry(type: 'categories' | 'products' | 'cacheStatus'): void {
    const key = type === 'categories' ? this.CACHE_KEYS.categories :
                type === 'products' ? this.CACHE_KEYS.products :
                this.CACHE_KEYS.cacheStatus;
    
    simpleCache.remove(key);
    console.log(`Removed ${type} from cache`);
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
  }

  /**
   * Get data with automatic offline fallback
   */
  async getCategoriesWithFallback(): Promise<ApiCategory[]> {
    const isOnline = this.isOnline();
    
    return this.getCategories({
      forceRefresh: false,
      allowStale: !isOnline // Allow stale data when offline
    });
  }

  /**
   * Get products with automatic offline fallback
   */
  async getProductsWithFallback(categoryId?: number): Promise<ApiProduct[]> {
    const isOnline = this.isOnline();
    
    return this.getProducts(categoryId, {
      forceRefresh: false,
      allowStale: !isOnline // Allow stale data when offline
    });
  }

  /**
   * Private method to fetch categories from API
   */
  private async fetchCategories(): Promise<ApiCategory[]> {
    return this.api.getCategories();
  }

  /**
   * Private method to fetch products from API
   */
  private async fetchProducts(categoryId?: number): Promise<ApiProduct[]> {
    return this.api.getProducts(categoryId);
  }

  /**
   * Refresh data in background (non-blocking)
   */
  private refreshInBackground(fetchFn: () => Promise<any>, cacheKey: string): void {
    // Don't refresh if we just cached this data recently (within 5 minutes)
    const cached = simpleCache.get(cacheKey);
    if (cached) {
      // Check if the cache entry is less than 5 minutes old
      const fiveMinutes = 5 * 60 * 1000;
      const now = Date.now();
      const cacheAge = now - (cached.timestamp || 0);
      
      if (cacheAge < fiveMinutes) {
        return; // Skip background refresh
      }
    }

    // Run in background without blocking
    setTimeout(async () => {
      try {
        await fetchFn();
        console.log('Background refresh completed');
      } catch (error) {
        console.warn('Background refresh failed:', error);
      }
    }, 100);
  }

  /**
   * Get image URL (pass through to API client)
   */
  getProductImageUrl(productId: number): string {
    return this.api.getProductImageUrl(productId);
  }
}

// Export singleton instance
export const cachedAPI = new CachedAPI();