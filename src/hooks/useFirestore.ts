'use client';

import { useState, useEffect } from 'react';
import { firestoreAPI } from '@/lib/firestoreApi';
import { ApiCategory, ApiProduct } from '@/lib/api';
import { transformCategory, transformProduct } from '@/lib/data-transformers';
import { Category, Product } from '@/types';

interface FirestoreState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fromFirestore: boolean;
  lastUpdated: Date | null;
}

/**
 * Hook for Firestore categories with real-time updates
 */
export function useFirestoreCategories(): FirestoreState<Category[]> & {
  refetch: () => Promise<void>;
} {
  const [state, setState] = useState<FirestoreState<Category[]>>({
    data: null,
    loading: true,
    error: null,
    fromFirestore: false,
    lastUpdated: null
  });

  const fetchCategories = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const apiCategories = await firestoreAPI.getCategories();
      const categories = apiCategories.map(transformCategory);
      
      setState(prev => ({
        ...prev,
        data: categories,
        loading: false,
        fromFirestore: firestoreAPI.isUsingFirestore(),
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load categories',
        loading: false
      }));
    }
  };

  useEffect(() => {
    fetchCategories();

    // Subscribe to real-time updates if using Firestore
    const unsubscribe = firestoreAPI.subscribeToCategories((apiCategories) => {
      const categories = apiCategories.map(transformCategory);
      setState(prev => ({
        ...prev,
        data: categories,
        fromFirestore: true,
        lastUpdated: new Date()
      }));
    });

    return unsubscribe;
  }, []);

  return {
    ...state,
    refetch: fetchCategories
  };
}

/**
 * Hook for Firestore products with real-time updates
 */
export function useFirestoreProducts(categoryId?: number): FirestoreState<Product[]> & {
  refetch: () => Promise<void>;
} {
  const [state, setState] = useState<FirestoreState<Product[]>>({
    data: null,
    loading: true,
    error: null,
    fromFirestore: false,
    lastUpdated: null
  });

  const fetchProducts = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const apiProducts = await firestoreAPI.getProducts(categoryId);
      const products = apiProducts.map(transformProduct);
      
      setState(prev => ({
        ...prev,
        data: products,
        loading: false,
        fromFirestore: firestoreAPI.isUsingFirestore(),
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load products',
        loading: false
      }));
    }
  };

  useEffect(() => {
    fetchProducts();

    // Subscribe to real-time updates if using Firestore
    const unsubscribe = firestoreAPI.subscribeToProducts((apiProducts) => {
      const products = apiProducts.map(transformProduct);
      setState(prev => ({
        ...prev,
        data: products,
        fromFirestore: true,
        lastUpdated: new Date()
      }));
    }, categoryId);

    return unsubscribe;
  }, [categoryId]);

  return {
    ...state,
    refetch: fetchProducts
  };
}

/**
 * Hook for single product from Firestore
 */
export function useFirestoreProduct(productId: number): FirestoreState<Product> & {
  refetch: () => Promise<void>;
} {
  const [state, setState] = useState<FirestoreState<Product>>({
    data: null,
    loading: true,
    error: null,
    fromFirestore: false,
    lastUpdated: null
  });

  const fetchProduct = async () => {
    if (!productId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const apiProduct = await firestoreAPI.getProduct(productId);
      const product = transformProduct(apiProduct);
      
      setState(prev => ({
        ...prev,
        data: product,
        loading: false,
        fromFirestore: firestoreAPI.isUsingFirestore(),
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load product',
        loading: false
      }));
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  return {
    ...state,
    refetch: fetchProduct
  };
}

/**
 * Hook for Firestore health and configuration
 */
export function useFirestoreStatus() {
  const [status, setStatus] = useState({
    firestoreAvailable: false,
    apiAvailable: false,
    usingFirestore: false,
    error: null as string | null,
    lastCheck: null as Date | null
  });

  const checkHealth = async () => {
    try {
      const health = await firestoreAPI.healthCheck();
      const config = firestoreAPI.getConfig();
      
      setStatus({
        firestoreAvailable: health.firestore.available,
        apiAvailable: health.api.available,
        usingFirestore: firestoreAPI.isUsingFirestore(),
        error: health.firestore.error || health.api.error || null,
        lastCheck: new Date()
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Health check failed',
        lastCheck: new Date()
      }));
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const toggleFirestore = (enabled: boolean) => {
    firestoreAPI.setFirestoreMode(enabled);
    checkHealth();
  };

  const toggleApiFallback = (enabled: boolean) => {
    firestoreAPI.setApiFallback(enabled);
    checkHealth();
  };

  const clearCache = () => {
    firestoreAPI.clearFirestoreCache();
  };

  return {
    ...status,
    checkHealth,
    toggleFirestore,
    toggleApiFallback,
    clearCache,
    cacheStats: firestoreAPI.getFirestoreCacheStats()
  };
}

/**
 * Hook for combined menu data (categories + products) from Firestore
 */
export function useFirestoreMenuData() {
  const { 
    data: categories, 
    loading: categoriesLoading, 
    error: categoriesError,
    fromFirestore: categoriesFromFirestore
  } = useFirestoreCategories();
  
  const { 
    data: allProducts, 
    loading: productsLoading, 
    error: productsError,
    fromFirestore: productsFromFirestore
  } = useFirestoreProducts();

  return {
    categories,
    products: allProducts,
    loading: categoriesLoading || productsLoading,
    error: categoriesError || productsError,
    fromFirestore: categoriesFromFirestore && productsFromFirestore,
    isUsingFirestore: firestoreAPI.isUsingFirestore()
  };
}

/**
 * Hook for category-specific data with product counts
 */
export function useFirestoreCategoryData() {
  const { data: categories, loading, error, fromFirestore } = useFirestoreCategories();
  const [enrichedCategories, setEnrichedCategories] = useState<Category[] | null>(null);

  useEffect(() => {
    if (!categories) return;

    const enrichCategories = async () => {
      const enriched = await Promise.all(
        categories.map(async (category) => {
          try {
            const products = await firestoreAPI.getProducts(parseInt(category.id));
            return {
              ...category,
              productCount: products.length,
              availableCount: products.filter(p => p.is_available).length
            };
          } catch (error) {
            console.warn(`Failed to load products for category ${category.id}:`, error);
            return {
              ...category,
              productCount: 0,
              availableCount: 0
            };
          }
        })
      );
      
      setEnrichedCategories(enriched);
    };

    enrichCategories();
  }, [categories]);

  return {
    data: enrichedCategories,
    loading: loading || (categories && !enrichedCategories),
    error,
    fromFirestore
  };
}