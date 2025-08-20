'use client';

import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ApiCategory, ApiProduct } from '@/lib/api';
import { simpleCache } from './simpleCache';
import { firestoreTranslationService } from './firestoreTranslationService';

export interface FirestoreProduct extends Omit<ApiProduct, 'id'> {
  id: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface FirestoreCategory extends Omit<ApiCategory, 'id'> {
  id: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export class FirestoreService {
  private readonly COLLECTIONS = {
    categories: 'foodorder_cache_categories',
    products: 'foodorder_cache_products'
  };

  private readonly CACHE_KEYS = {
    categories: 'firestore_categories',
    products: 'firestore_products',
    productsByCategory: (id: string) => `firestore_products_category_${id}`
  };

  private readonly TTL = {
    categories: 60 * 60 * 1000,    // 1 hour
    products: 30 * 60 * 1000,      // 30 minutes
  };

  private isClient = typeof window !== 'undefined';

  /**
   * Get all categories from Firestore
   */
  async getCategories(): Promise<ApiCategory[]> {
    if (!this.isClient || !db) {
      console.warn('Firestore not available on server side');
      return [];
    }

    try {
      // Check cache first
      const cached = simpleCache.get(this.CACHE_KEYS.categories);
      if (cached) {
        console.log('Categories loaded from cache', cached.length);
        return cached;
      }

      console.log('Fetching categories from Firestore...');
      const categoriesRef = collection(db, this.COLLECTIONS.categories);
      
      // The backend stores data as a single document with ID "all_categories"
      console.log('Checking Firestore collection:', this.COLLECTIONS.categories);
      const allCategoriesDoc = await getDoc(doc(db, this.COLLECTIONS.categories, 'all_categories'));
      
      if (!allCategoriesDoc.exists()) {
        console.warn('No all_categories document found in Firestore');
        return [];
      }

      const docData = allCategoriesDoc.data();
      console.log('Categories document exists, data keys:', Object.keys(docData || {}));
      console.log('Full categories document data:', JSON.stringify(docData, null, 2));

      // The data might be stored as an array in the document or nested
      let categoriesData = null;
      if (docData) {
        // Try different possible structures
        if (Array.isArray(docData.data)) {
          console.log('Found categories in docData.data array');
          categoriesData = docData.data;
        } else if (Array.isArray(docData.categories)) {
          console.log('Found categories in docData.categories array');
          categoriesData = docData.categories;
        } else if (Array.isArray(docData)) {
          console.log('Found categories as direct array');
          categoriesData = docData;
        } else {
          // If it's an object with keys, try to extract array values
          console.log('Searching for array values in document...');
          const values = Object.values(docData);
          const arrayValue = values.find(v => Array.isArray(v));
          if (arrayValue) {
            console.log('Found array value with length:', arrayValue.length);
            categoriesData = arrayValue;
          } else {
            console.warn('No array found in document values');
          }
        }
      }

      if (!categoriesData || !Array.isArray(categoriesData)) {
        console.warn('Categories data is not an array:', categoriesData);
        return [];
      }

      console.log(`Found ${categoriesData.length} categories in document`);
      
      const categories: ApiCategory[] = [];
      categoriesData.forEach((data: any, index: number) => {
        console.log(`Processing category ${index}:`, data);
        
        categories.push({
          id: parseInt(data.id || index),
          name: data.name,
          parent_id: data.parent_id,
          sequence: data.sequence,
          image_url: data.image_url
        });
      });

      // Cache the results
      simpleCache.set(this.CACHE_KEYS.categories, categories, this.TTL.categories);
      console.log(`Loaded ${categories.length} categories from Firestore`);
      
      return categories;
    } catch (error) {
      console.error('Error fetching categories from Firestore:', error);
      throw error;
    }
  }

  /**
   * Get products from Firestore with optional category filter
   */
  async getProducts(categoryId?: number): Promise<ApiProduct[]> {
    if (!this.isClient || !db) {
      console.warn('Firestore not available on server side');
      return [];
    }

    try {
      const cacheKey = categoryId 
        ? this.CACHE_KEYS.productsByCategory(categoryId.toString())
        : this.CACHE_KEYS.products;

      // Check cache first
      const cached = simpleCache.get(cacheKey);
      if (cached) {
        console.log(`Products${categoryId ? ` for category ${categoryId}` : ''} loaded from cache`, cached.length);
        return cached;
      }

      console.log(`Fetching products${categoryId ? ` for category ${categoryId}` : ''} from Firestore...`);
      
      // The backend stores data as a single document with ID "all_products"
      console.log('Checking Firestore collection:', this.COLLECTIONS.products);
      const allProductsDoc = await getDoc(doc(db, this.COLLECTIONS.products, 'all_products'));
      
      if (!allProductsDoc.exists()) {
        console.warn('No all_products document found in Firestore');
        return [];
      }

      const docData = allProductsDoc.data();
      console.log('Products document exists, data keys:', Object.keys(docData || {}));
      console.log('Full products document sample:', JSON.stringify(docData, null, 2).substring(0, 1000) + '...');

      // The data might be stored as an array in the document or nested
      let productsData = null;
      if (docData) {
        // Try different possible structures
        if (Array.isArray(docData.data)) {
          console.log('Found products in docData.data array');
          productsData = docData.data;
        } else if (Array.isArray(docData.products)) {
          console.log('Found products in docData.products array');
          productsData = docData.products;
        } else if (Array.isArray(docData)) {
          console.log('Found products as direct array');
          productsData = docData;
        } else {
          // If it's an object with keys, try to extract array values
          console.log('Searching for array values in products document...');
          const values = Object.values(docData);
          const arrayValue = values.find(v => Array.isArray(v));
          if (arrayValue) {
            console.log('Found array value with length:', arrayValue.length);
            productsData = arrayValue;
          } else {
            console.warn('No array found in products document values');
          }
        }
      }

      if (!productsData || !Array.isArray(productsData)) {
        console.warn('Products data is not an array:', typeof productsData);
        return [];
      }

      console.log(`Found ${productsData.length} products in document`);
      
      // Filter out products with invalid category (pos_categ_id === false)
      // These are typically service items, customization options, or internal products
      const validProducts = productsData.filter((product: any) => {
        const categoryId = Array.isArray(product.pos_categ_id) 
          ? product.pos_categ_id[0] 
          : product.pos_categ_id;
        
        // Exclude products with false, null, or undefined category
        return categoryId !== false && categoryId !== null && categoryId !== undefined;
      });
      
      // Filter by category if requested
      let filteredProducts = validProducts;
      if (categoryId) {
        filteredProducts = validProducts.filter((product: any) => {
          const productCategoryId = Array.isArray(product.pos_categ_id) 
            ? product.pos_categ_id[0] 
            : product.pos_categ_id;
          
          return productCategoryId === categoryId;
        });
        console.log(`Filtered to ${filteredProducts.length} products for category ${categoryId}`);
      }
      
      const products: ApiProduct[] = [];
      filteredProducts.forEach((data: any, index: number) => {
        products.push({
          id: parseInt(data.id || index),
          name: data.name,
          pos_categ_id: data.pos_categ_id,
          list_price: data.list_price,
          description_sale: data.description_sale,
          barcode: data.barcode,
          image_url: data.image_url,
          is_available: data.is_available,
          attribute_lines: data.attribute_lines,
          has_attributes: data.has_attributes,
          has_toppings: data.has_toppings,
          price_range: data.price_range,
          tags: data.tags,
          tags: data.tags
        });
      });

      // Cache the results
      simpleCache.set(cacheKey, products, this.TTL.products);
      console.log(`Loaded ${products.length} products${categoryId ? ` for category ${categoryId}` : ''} from Firestore`);
      
      return products;
    } catch (error) {
      console.error(`Error fetching products${categoryId ? ` for category ${categoryId}` : ''} from Firestore:`, error);
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  async getProduct(productId: number): Promise<ApiProduct | null> {
    if (!this.isClient || !db) {
      console.warn('Firestore not available on server side');
      return null;
    }

    try {
      console.log(`Fetching product ${productId} from Firestore...`);
      const productRef = doc(db, this.COLLECTIONS.products, productId.toString());
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const data = productSnap.data() as FirestoreProduct;
        return {
          id: parseInt(data.id),
          name: data.name,
          pos_categ_id: data.pos_categ_id,
          list_price: data.list_price,
          description_sale: data.description_sale,
          barcode: data.barcode,
          image_url: data.image_url,
          is_available: data.is_available,
          attribute_lines: data.attribute_lines,
          has_attributes: data.has_attributes,
          has_toppings: data.has_toppings,
          price_range: data.price_range,
          tags: data.tags
        };
      } else {
        console.log(`Product ${productId} not found in Firestore`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching product ${productId} from Firestore:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates for categories
   */
  subscribeToCategories(callback: (categories: ApiCategory[]) => void): () => void {
    if (!this.isClient || !db) {
      console.warn('Firestore not available on server side');
      return () => {};
    }

    const categoriesRef = collection(db, this.COLLECTIONS.categories);
    const q = query(categoriesRef, orderBy('sequence'));

    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const categories: ApiCategory[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreCategory;
        categories.push({
          id: parseInt(data.id),
          name: data.name,
          parent_id: data.parent_id,
          sequence: data.sequence,
          image_url: data.image_url
        });
      });

      // Update cache
      simpleCache.set(this.CACHE_KEYS.categories, categories, this.TTL.categories);
      
      console.log(`Real-time update: ${categories.length} categories`);
      callback(categories);
    }, (error) => {
      console.error('Error in categories real-time listener:', error);
    });

    return unsubscribe;
  }

  /**
   * Subscribe to real-time updates for products
   */
  subscribeToProducts(
    callback: (products: ApiProduct[]) => void,
    categoryId?: number
  ): () => void {
    if (!this.isClient || !db) {
      console.warn('Firestore not available on server side');
      return () => {};
    }

    const productsRef = collection(db, this.COLLECTIONS.products);
    let q;
    
    if (categoryId) {
      q = query(productsRef, where('pos_categ_id', 'array-contains', categoryId));
    } else {
      q = query(productsRef, orderBy('name'));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const products: ApiProduct[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreProduct;
        products.push({
          id: parseInt(data.id),
          name: data.name,
          pos_categ_id: data.pos_categ_id,
          list_price: data.list_price,
          description_sale: data.description_sale,
          barcode: data.barcode,
          image_url: data.image_url,
          is_available: data.is_available,
          attribute_lines: data.attribute_lines,
          has_attributes: data.has_attributes,
          has_toppings: data.has_toppings,
          price_range: data.price_range,
          tags: data.tags
        });
      });

      // Update cache
      const cacheKey = categoryId 
        ? this.CACHE_KEYS.productsByCategory(categoryId.toString())
        : this.CACHE_KEYS.products;
      simpleCache.set(cacheKey, products, this.TTL.products);
      
      console.log(`Real-time update: ${products.length} products${categoryId ? ` for category ${categoryId}` : ''}`);
      callback(products);
    }, (error) => {
      console.error('Error in products real-time listener:', error);
    });

    return unsubscribe;
  }

  /**
   * Clear all Firestore-related cache
   */
  clearCache(): void {
    simpleCache.remove(this.CACHE_KEYS.categories);
    simpleCache.remove(this.CACHE_KEYS.products);
    console.log('Firestore cache cleared');
  }

  /**
   * Force refresh from Firestore bypassing cache (for debugging)
   */
  async forceRefreshCategories(): Promise<ApiCategory[]> {
    simpleCache.remove(this.CACHE_KEYS.categories);
    return await this.getCategories();
  }

  /**
   * Force refresh products from Firestore bypassing cache (for debugging)
   */
  async forceRefreshProducts(categoryId?: number): Promise<ApiProduct[]> {
    const cacheKey = categoryId 
      ? this.CACHE_KEYS.productsByCategory(categoryId.toString())
      : this.CACHE_KEYS.products;
    simpleCache.remove(cacheKey);
    return await this.getProducts(categoryId);
  }

  /**
   * Check if Firestore is available
   */
  isAvailable(): boolean {
    return this.isClient && !!db;
  }

  /**
   * Get cache statistics for Firestore data
   */
  getCacheStats(): {
    hasCategories: boolean;
    hasProducts: boolean;
    categoriesAge: number | null;
    productsAge: number | null;
  } {
    return {
      hasCategories: simpleCache.has(this.CACHE_KEYS.categories),
      hasProducts: simpleCache.has(this.CACHE_KEYS.products),
      categoriesAge: null, // Could be implemented by storing timestamps
      productsAge: null
    };
  }

  /**
   * Get products with translations applied for a specific locale
   */
  async getProductsWithTranslations(categoryId?: number, locale: string = 'en'): Promise<ApiProduct[]> {
    try {
      // Get base products from Firestore
      const baseProducts = await this.getProducts(categoryId);
      
      // Get all translations (cached)
      const translations = await firestoreTranslationService.getAllProductTranslations();
      
      // Apply translations to products
      const translatedProducts = baseProducts.map(product => {
        const translation = firestoreTranslationService.getProductTranslation(product.id, locale);
        
        if (translation) {
          return {
            ...product,
            name: translation.name || product.name,
            description_sale: translation.description || product.description_sale
          };
        }
        
        return product;
      });

      console.log(`Applied ${locale} translations to ${translatedProducts.length} products`);
      
      // Debug: Show sample of translated products
      if (translatedProducts.length > 0) {
        const sample = translatedProducts[0];
        console.log(`🔍 Sample translated product:`, {
          id: sample.id,
          originalName: baseProducts.find(p => p.id === sample.id)?.name,
          translatedName: sample.name,
          locale
        });
      }
      
      return translatedProducts;
    } catch (error) {
      console.error(`Failed to get products with translations for locale ${locale}:`, error);
      // Fallback to base products without translations
      return await this.getProducts(categoryId);
    }
  }

  /**
   * Initialize translation service and setup real-time updates
   */
  async initializeTranslations(): Promise<void> {
    try {
      if (firestoreTranslationService.isAvailable()) {
        // Load initial translations
        await firestoreTranslationService.getAllProductTranslations();
        console.log('Translation service initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize translation service:', error);
    }
  }

  /**
   * Get translation service instance
   */
  getTranslationService() {
    return firestoreTranslationService;
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService();