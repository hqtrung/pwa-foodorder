'use client';

import { 
  collection, 
  doc,
  getDoc,
  getDocs, 
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { simpleCache } from './simpleCache';
import { ApiProduct } from '@/lib/api';

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
  private readonly COLLECTION_BASE = 'product_translations_v2';
  private readonly CACHE_KEY_PREFIX = 'product_translations_v2';
  private readonly TTL = 60 * 60 * 1000; // 1 hour cache TTL
  
  private isClient = typeof window !== 'undefined';
  private unsubscribes: Map<string, Unsubscribe> = new Map();
  private lastFetchTimeByLocale: Map<string, number> = new Map();

  /**
   * Map app locale codes to Firestore collection locale codes
   */
  private mapLocaleToFirestoreLocale(locale: string): string {
    // Map 'zh' (Chinese in app) to 'cn' (Chinese in Firestore)
    if (locale === 'zh') {
      return 'cn';
    }
    return locale;
  }

  /**
   * Get all product translations for a specific locale from Firestore
   */
  async getProductTranslationsByLocale(locale: string = 'en'): Promise<ApiProduct[]> {
    if (!this.isClient || !db) {
      console.warn('Firestore not available on server side');
      return [];
    }

    try {
      const cacheKey = this.getLocaleCacheKey(locale);
      
      // Check simple cache first
      const simpleCached = simpleCache.get(cacheKey);
      if (simpleCached) {
        console.log(`Product translations for ${locale} loaded from cache`, simpleCached.length);
        return simpleCached;
      }

      console.log(`Fetching product translations for locale: ${locale}`);
      const firestoreLocale = this.mapLocaleToFirestoreLocale(locale);
      const collectionPath = `${this.COLLECTION_BASE}/${firestoreLocale}/products`;
      const querySnapshot = await getDocs(collection(db, collectionPath));
      const products: ApiProduct[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: parseInt(doc.id), // Document ID is the product ID
          name: data.name || '',
          description_sale: data.short_description || data.description || '',
          description: data.long_description || '', // Add long description field
          pos_categ_id: data.pos_categ_id || data.category_id,
          list_price: data.list_price || 0,
          barcode: data.barcode || '',
          image_url: data.image_url || '',
          is_available: data.is_available ?? true,
          attribute_lines: data.attributes || [],
          has_attributes: data.has_attributes || false,
          has_toppings: data.has_toppings || false,
          price_range: data.price_range || null,
          tags: data.tags || []
        });
      });

      console.log(`✅ Loaded ${products.length} product translations for locale: ${locale}`);
      
      // Cache the results
      simpleCache.set(cacheKey, products, this.TTL);
      this.lastFetchTimeByLocale.set(locale, Date.now());

      return products;
    } catch (error) {
      if (error.code === 'permission-denied') {
        console.error(`Permission denied accessing product translations for ${locale}. Please check Firestore security rules.`, error);
      } else {
        console.error(`Error fetching product translations for ${locale}:`, error);
      }
      return [];
    }
  }

  /**
   * Get a single product translation for a specific locale
   */
  async getProductTranslationByLocale(productId: number, locale: string = 'en'): Promise<ApiProduct | null> {
    if (!this.isClient || !db) {
      console.warn('Firestore not available on server side');
      return null;
    }

    try {
      console.log(`Fetching product ${productId} translation for locale: ${locale}`);
      const firestoreLocale = this.mapLocaleToFirestoreLocale(locale);
      const docPath = `${this.COLLECTION_BASE}/${firestoreLocale}/products/${productId}`;
      const docRef = doc(db, docPath);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: productId,
          name: data.name || '',
          description_sale: data.description || '',
          pos_categ_id: data.pos_categ_id || data.category_id,
          list_price: data.list_price || 0,
          barcode: data.barcode || '',
          image_url: data.image_url || '',
          is_available: data.is_available ?? true,
          attribute_lines: data.attributes || [],
          has_attributes: data.has_attributes || false,
          has_toppings: data.has_toppings || false,
          price_range: data.price_range || null,
          tags: data.tags || []
        };
      } else {
        console.log(`Product ${productId} translation not found for locale: ${locale}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching product ${productId} translation for ${locale}:`, error);
      return null;
    }
  }

  /**
   * Get cached translations for a specific locale
   */
  getCachedTranslationsByLocale(locale: string): ApiProduct[] {
    const cacheKey = this.getLocaleCacheKey(locale);
    return simpleCache.get(cacheKey) || [];
  }

  /**
   * Get cache key for a specific locale
   */
  private getLocaleCacheKey(locale: string): string {
    return `${this.CACHE_KEY_PREFIX}_${locale}`;
  }


  /**
   * Subscribe to real-time updates for product translations for a specific locale
   */
  subscribeToProductTranslationsByLocale(
    locale: string,
    callback: (products: ApiProduct[]) => void
  ): Unsubscribe {
    if (!this.isClient || !db) {
      console.warn('Firestore not available for subscriptions');
      return () => {};
    }

    try {
      const firestoreLocale = this.mapLocaleToFirestoreLocale(locale);
      const collectionPath = `${this.COLLECTION_BASE}/${firestoreLocale}/products`;
      const unsubscribe = onSnapshot(
        collection(db, collectionPath),
        (querySnapshot: QuerySnapshot<DocumentData>) => {
          const products: ApiProduct[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            products.push({
              id: parseInt(doc.id),
              name: data.name || '',
              description_sale: data.description || '',
              pos_categ_id: data.pos_categ_id || data.category_id,
              list_price: data.list_price || 0,
              barcode: data.barcode || '',
              image_url: data.image_url || '',
              is_available: data.is_available ?? true,
              attribute_lines: data.attributes || [],
              has_attributes: data.has_attributes || false,
              has_toppings: data.has_toppings || false,
              price_range: data.price_range || null,
              tags: data.tags || []
            });
          });
          
          // Update cache
          const cacheKey = this.getLocaleCacheKey(locale);
          simpleCache.set(cacheKey, products, this.TTL);
          this.lastFetchTimeByLocale.set(locale, Date.now());

          console.log(`Real-time update: ${products.length} product translations for ${locale}`);
          callback(products);
        },
        (error) => {
          console.error(`Error in product translations real-time listener for ${locale}:`, error);
        }
      );

      // Store unsubscribe function by locale
      this.unsubscribes.set(locale, unsubscribe);
      console.log(`Subscribed to real-time product translation updates for ${locale}`);
      return unsubscribe;
    } catch (error) {
      console.error(`Error setting up product translations subscription for ${locale}:`, error);
      return () => {};
    }
  }

  /**
   * Clear cache for a specific locale or all locales
   */
  clearCache(locale?: string): void {
    if (locale) {
      const cacheKey = this.getLocaleCacheKey(locale);
      simpleCache.remove(cacheKey);
      this.lastFetchTimeByLocale.delete(locale);
      console.log(`Product translation cache cleared for ${locale}`);
    } else {
      // Clear all locale caches
      this.lastFetchTimeByLocale.forEach((_, loc) => {
        const cacheKey = this.getLocaleCacheKey(loc);
        simpleCache.remove(cacheKey);
      });
      this.lastFetchTimeByLocale.clear();
      console.log('All product translation caches cleared');
    }
  }

  /**
   * Force refresh translations for a specific locale by clearing cache
   */
  async forceRefresh(locale: string = 'en'): Promise<ApiProduct[]> {
    this.clearCache(locale);
    return await this.getProductTranslationsByLocale(locale);
  }

  /**
   * Check if Firestore is available
   */
  isAvailable(): boolean {
    return this.isClient && !!db;
  }

  /**
   * Get cache statistics for a specific locale
   */
  getCacheStats(locale: string): {
    hasCachedData: boolean;
    translationsCount: number;
    lastFetchTime: number | null;
    cacheAge: number | null;
  } {
    const cacheKey = this.getLocaleCacheKey(locale);
    const hasCache = simpleCache.has(cacheKey);
    const lastFetch = this.lastFetchTimeByLocale.get(locale) || 0;
    const cacheAge = lastFetch > 0 ? Date.now() - lastFetch : null;
    const cachedData = simpleCache.get(cacheKey) || [];
    
    return {
      hasCachedData: hasCache,
      translationsCount: cachedData.length,
      lastFetchTime: lastFetch > 0 ? lastFetch : null,
      cacheAge
    };
  }

  /**
   * Cleanup subscriptions for a specific locale or all locales
   */
  cleanup(locale?: string): void {
    if (locale) {
      const unsubscribe = this.unsubscribes.get(locale);
      if (unsubscribe) {
        unsubscribe();
        this.unsubscribes.delete(locale);
      }
      this.clearCache(locale);
    } else {
      // Cleanup all subscriptions
      this.unsubscribes.forEach((unsubscribe) => unsubscribe());
      this.unsubscribes.clear();
      this.clearCache();
    }
  }
}

// Export singleton instance
export const firestoreTranslationService = new FirestoreTranslationService();