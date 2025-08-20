'use client';

import { apiClient, ApiCategory, ApiProduct, ApiCacheStatus } from './api';
import { firestoreService } from '@/services/firestoreService';

interface FirestoreApiOptions {
  useFirestore?: boolean;
  fallbackToApi?: boolean;
}

export class FirestoreAPI {
  private originalApi = apiClient;
  private options: FirestoreApiOptions;

  constructor(options: FirestoreApiOptions = {}) {
    this.options = {
      useFirestore: true,
      fallbackToApi: true,
      ...options
    };
  }

  /**
   * Get categories - preferably from Firestore, fallback to API
   */
  async getCategories(): Promise<ApiCategory[]> {
    if (this.options.useFirestore && firestoreService.isAvailable()) {
      try {
        return await firestoreService.getCategories();
      } catch (error) {
        console.error('Failed to fetch categories from Firestore:', error);
        
        if (this.options.fallbackToApi) {
          console.log('Falling back to original API for categories');
          return await this.originalApi.getCategories();
        }
        throw error;
      }
    }

    // Use original API if Firestore is disabled or unavailable
    return await this.originalApi.getCategories();
  }

  /**
   * Get single category - fallback to API (Firestore doesn't have single category endpoint)
   */
  async getCategory(id: number): Promise<ApiCategory> {
    // For single category, we could get all categories and filter,
    // but it's more efficient to use the API directly
    return await this.originalApi.getCategory(id);
  }

  /**
   * Get products - preferably from Firestore, fallback to API
   */
  async getProducts(categoryId?: number, locale?: string): Promise<ApiProduct[]> {
    if (this.options.useFirestore && firestoreService.isAvailable()) {
      try {
        // Use translation-aware method if locale is provided
        if (locale) {
          return await firestoreService.getProductsWithTranslations(categoryId, locale);
        }
        return await firestoreService.getProducts(categoryId);
      } catch (error) {
        console.error('Failed to fetch products from Firestore:', error);
        
        if (this.options.fallbackToApi) {
          console.log('Falling back to original API for products');
          return await this.originalApi.getProducts(categoryId);
        }
        throw error;
      }
    }

    // Use original API if Firestore is disabled or unavailable
    return await this.originalApi.getProducts(categoryId);
  }

  /**
   * Get single product - preferably from Firestore, fallback to API
   */
  async getProduct(id: number): Promise<ApiProduct> {
    if (this.options.useFirestore && firestoreService.isAvailable()) {
      try {
        const product = await firestoreService.getProduct(id);
        if (product) {
          return product;
        }
      } catch (error) {
        console.error('Failed to fetch product from Firestore:', error);
      }
    }

    // Fallback to API or if Firestore returned null
    return await this.originalApi.getProduct(id);
  }

  /**
   * Get cache status - this is API-specific, no Firestore equivalent
   */
  async getCacheStatus(): Promise<ApiCacheStatus> {
    return await this.originalApi.getCacheStatus();
  }

  /**
   * Get product image URL - use original method
   */
  getProductImageUrl(productId: number): string {
    return this.originalApi.getProductImageUrl(productId);
  }

  /**
   * Subscribe to real-time category updates
   */
  subscribeToCategories(callback: (categories: ApiCategory[]) => void): () => void {
    if (this.options.useFirestore && firestoreService.isAvailable()) {
      return firestoreService.subscribeToCategories(callback);
    }
    
    // No real-time support for original API, return empty unsubscribe function
    return () => {};
  }

  /**
   * Subscribe to real-time product updates
   */
  subscribeToProducts(
    callback: (products: ApiProduct[]) => void,
    categoryId?: number
  ): () => void {
    if (this.options.useFirestore && firestoreService.isAvailable()) {
      return firestoreService.subscribeToProducts(callback, categoryId);
    }
    
    // No real-time support for original API, return empty unsubscribe function
    return () => {};
  }

  /**
   * Clear Firestore cache
   */
  clearFirestoreCache(): void {
    firestoreService.clearCache();
  }

  /**
   * Check if Firestore is being used
   */
  isUsingFirestore(): boolean {
    return this.options.useFirestore === true && firestoreService.isAvailable();
  }

  /**
   * Get Firestore cache statistics
   */
  getFirestoreCacheStats() {
    return firestoreService.getCacheStats();
  }

  /**
   * Switch between Firestore and API modes
   */
  setFirestoreMode(enabled: boolean): void {
    this.options.useFirestore = enabled;
    console.log(`Firestore mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Enable/disable API fallback
   */
  setApiFallback(enabled: boolean): void {
    this.options.fallbackToApi = enabled;
    console.log(`API fallback ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get current configuration
   */
  getConfig(): FirestoreApiOptions {
    return { ...this.options };
  }

  /**
   * Health check for both Firestore and API
   */
  async healthCheck(): Promise<{
    firestore: { available: boolean; error?: string };
    api: { available: boolean; error?: string };
  }> {
    const result = {
      firestore: { available: false, error: undefined as string | undefined },
      api: { available: false, error: undefined as string | undefined }
    };

    // Check Firestore
    try {
      if (firestoreService.isAvailable()) {
        await firestoreService.getCategories();
        result.firestore.available = true;
      } else {
        result.firestore.error = 'Firestore not initialized';
      }
    } catch (error) {
      result.firestore.error = error instanceof Error ? error.message : 'Unknown Firestore error';
    }

    // Check API
    try {
      await this.originalApi.getCategories();
      result.api.available = true;
    } catch (error) {
      result.api.error = error instanceof Error ? error.message : 'Unknown API error';
    }

    return result;
  }
}

// Export configured instance
export const firestoreAPI = new FirestoreAPI({
  useFirestore: true,
  fallbackToApi: true
});

// Export class for custom configurations
export default FirestoreAPI;