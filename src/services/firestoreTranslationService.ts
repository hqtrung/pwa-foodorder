'use client';

import { 
  collection, 
  getDocs, 
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { simpleCache } from './simpleCache';

export interface ProductTranslation {
  product_id: number;
  base_name: string;
  base_description: string;
  category_id: number;
  category_name: string;
  translations: {
    [locale: string]: {
      name: string;
      description: string;
    };
  };
  last_updated: string;
  version: string;
}

export interface ProductTranslationCache {
  [productId: string]: ProductTranslation;
}

export class FirestoreTranslationService {
  private readonly COLLECTION_NAME = 'foodorder_translations_products';
  private readonly CACHE_KEY = 'product_translations';
  private readonly TTL = 60 * 60 * 1000; // 1 hour cache TTL
  
  private isClient = typeof window !== 'undefined';
  private unsubscribe: Unsubscribe | null = null;
  private memoryCache: ProductTranslationCache = {};
  private lastFetchTime: number = 0;

  /**
   * Get all product translations from Firestore
   */
  async getAllProductTranslations(): Promise<ProductTranslation[]> {
    if (!this.isClient || !db) {
      console.warn('Firestore not available on server side');
      return [];
    }

    try {
      // Check memory cache first
      const cachedData = this.getCachedTranslations();
      if (cachedData && cachedData.length > 0) {
        console.log('Product translations loaded from memory cache', cachedData.length);
        return cachedData;
      }

      // Check simple cache
      const simpleCached = simpleCache.get(this.CACHE_KEY);
      if (simpleCached) {
        console.log('Product translations loaded from simple cache', simpleCached.length);
        this.updateMemoryCache(simpleCached);
        return simpleCached;
      }

      console.log('Fetching product translations from Firestore...');
      const querySnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
      const allProducts: ProductTranslation[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        allProducts.push({
          product_id: data.product_id,
          base_name: data.base_name || '',
          base_description: data.base_description || '',
          category_id: data.category_id || 1,
          category_name: data.category_name || '',
          translations: data.translations || {},
          last_updated: data.last_updated || '',
          version: data.version || '1.0'
        });
      });

      console.log(`✅ Loaded ${allProducts.length} product translations from Firestore`);
      
      if (allProducts.length > 0) {
        const sample = allProducts[0];
        const locales = Object.keys(sample.translations || {});
        console.log(`Available locales: ${locales.join(', ')}`);
      } else {
        console.warn('⚠️ No translation documents found in Firestore collection');
      }
      
      // Update caches
      this.updateMemoryCache(allProducts);
      simpleCache.set(this.CACHE_KEY, allProducts, this.TTL);
      this.lastFetchTime = Date.now();

      return allProducts;
    } catch (error) {
      if (error.code === 'permission-denied') {
        console.error('Permission denied accessing product translations. Please check Firestore security rules.', error);
      } else {
        console.error('Error fetching product translations:', error);
      }
      return [];
    }
  }

  /**
   * Get translation for a specific product and locale
   */
  getProductTranslation(productId: number | string, locale: string): { name: string; description: string } | null {
    const translations = this.getCachedTranslations();
    const productIdStr = productId.toString();
    
    const productTranslation = translations.find(t => t.product_id.toString() === productIdStr);
    
    if (!productTranslation) {
      console.log(`⚠️ No translation found for product ID: ${productIdStr} (${translations.length} translations available)`);
      return null;
    }

    // Try to get translation for the specific locale
    const localeTranslation = productTranslation.translations[locale];
    if (localeTranslation) {
      console.log(`✅ Applied ${locale} translation for product ${productIdStr}: "${localeTranslation.name}"`);
      return {
        name: localeTranslation.name || productTranslation.base_name,
        description: localeTranslation.description || productTranslation.base_description
      };
    }

    console.log(`⚠️ No ${locale} translation found for product ${productIdStr}, using base: "${productTranslation.base_name}"`);
    
    // Fallback to base name and description
    return {
      name: productTranslation.base_name,
      description: productTranslation.base_description
    };
  }

  /**
   * Get translated name for a specific product and locale
   */
  getProductName(productId: number | string, locale: string = 'en'): string {
    const translation = this.getProductTranslation(productId, locale);
    return translation?.name || '';
  }

  /**
   * Get translated description for a specific product and locale
   */
  getProductDescription(productId: number | string, locale: string = 'en'): string {
    const translation = this.getProductTranslation(productId, locale);
    return translation?.description || '';
  }

  /**
   * Get products filtered by language with translations applied
   */
  getProductsForLanguage(allProducts: ProductTranslation[], languageCode: string): Array<{
    product_id: number;
    name: string;
    description: string;
    category_id: number;
    category_name: string;
  }> {
    return allProducts.map(product => ({
      product_id: product.product_id,
      name: product.translations?.[languageCode]?.name || product.base_name,
      description: product.translations?.[languageCode]?.description || product.base_description,
      category_id: product.category_id,
      category_name: product.category_name
    }));
  }

  /**
   * Subscribe to real-time updates for product translations
   */
  subscribeToProductTranslations(callback: (translations: ProductTranslation[]) => void): Unsubscribe {
    if (!this.isClient || !db) {
      console.warn('Firestore not available for subscriptions');
      return () => {};
    }

    try {
      const unsubscribe = onSnapshot(
        collection(db, this.COLLECTION_NAME),
        (querySnapshot: QuerySnapshot<DocumentData>) => {
          const products: ProductTranslation[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            products.push({
              product_id: data.product_id,
              base_name: data.base_name || '',
              base_description: data.base_description || '',
              category_id: data.category_id || 1,
              category_name: data.category_name || '',
              translations: data.translations || {},
              last_updated: data.last_updated || '',
              version: data.version || '1.0'
            });
          });
          
          // Update caches
          this.updateMemoryCache(products);
          simpleCache.set(this.CACHE_KEY, products, this.TTL);
          this.lastFetchTime = Date.now();

          console.log(`Real-time update: ${products.length} product translations`);
          callback(products);
        },
        (error) => {
          console.error('Error listening to product translations:', error);
        }
      );

      this.unsubscribe = unsubscribe;
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up product translations subscription:', error);
      return () => {};
    }
  }

  /**
   * Stop listening to real-time updates
   */
  unsubscribeFromProductTranslations(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /**
   * Clear all cached translations
   */
  clearCache(): void {
    this.memoryCache = {};
    this.lastFetchTime = 0;
    simpleCache.remove(this.CACHE_KEY);
  }

  /**
   * Force refresh translations from Firestore bypassing cache
   */
  async forceRefresh(): Promise<ProductTranslation[]> {
    this.clearCache();
    return await this.getAllProductTranslations();
  }

  /**
   * Check if Firestore is available
   */
  isAvailable(): boolean {
    return this.isClient && !!db;
  }

  /**
   * Get cache status and statistics
   */
  getCacheInfo() {
    const memoryCount = Object.keys(this.memoryCache).length;
    const hasSimpleCache = simpleCache.has(this.CACHE_KEY);
    const cacheAge = this.lastFetchTime ? Date.now() - this.lastFetchTime : null;

    return {
      memoryCache: {
        count: memoryCount,
        age: cacheAge
      },
      simpleCache: {
        exists: hasSimpleCache,
        age: cacheAge
      },
      isSubscribed: !!this.unsubscribe
    };
  }

  /**
   * Private helper to get cached translations from memory
   */
  private getCachedTranslations(): ProductTranslation[] {
    return Object.values(this.memoryCache);
  }

  /**
   * Private helper to update memory cache
   */
  private updateMemoryCache(translations: ProductTranslation[]): void {
    this.memoryCache = {};
    translations.forEach(translation => {
      this.memoryCache[translation.product_id.toString()] = translation;
    });
  }
}

// Export singleton instance
export const firestoreTranslationService = new FirestoreTranslationService();