import { useState, useEffect } from 'react';
import { apiClient, ApiCategory, ApiProduct, ApiCacheStatus } from '@/lib/api';
import { cachedAPI } from '@/lib/cachedApi';
import { firestoreAPI } from '@/lib/firestoreApi';
import { transformCategory, transformProduct } from '@/lib/data-transformers';
import { Category, Product } from '@/types';

// Generic API hook
function useApiQuery<T>(
  queryFn: () => Promise<T>,
  dependencies: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // console.error('API Query Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, dependencies);

  return { data, loading, error, refetch };
}

// Configuration for data source preference
const useFirestore = process.env.NEXT_PUBLIC_USE_FIRESTORE === 'true';

// Categories hook with caching and Firestore support
export function useCategories(locale?: string) {
  return useApiQuery(async () => {
    try {
      // Use Firestore if enabled, otherwise fall back to cached API
      const apiCategories = useFirestore 
        ? await firestoreAPI.getCategories()
        : await cachedAPI.getCategoriesWithFallback();
      
      const categories: Category[] = [];
      
      // Get product counts for each category
      for (const apiCategory of apiCategories) {
        const category = transformCategory(apiCategory, locale);
        
        try {
          const products = useFirestore
            ? await firestoreAPI.getProducts(apiCategory.id)
            : await cachedAPI.getProductsWithFallback(apiCategory.id);
          
          category.productCount = products.length;
          category.availableCount = products.filter(p => p.is_available).length;
        } catch (error) {
          console.warn(`Failed to load products for category ${apiCategory.id}:`, error);
          category.productCount = 0;
          category.availableCount = 0;
        }
        
        categories.push(category);
      }
      
      return categories;
    } catch (error) {
      console.error('Failed to load categories:', error);
      throw error;
    }
  }, [locale]);
}

// Products hook with optional category filter, caching, and Firestore support
export function useProducts(categoryId?: number, locale?: string) {
  return useApiQuery(async () => {
    try {
      // Use Firestore if enabled, otherwise fall back to cached API
      const apiProducts = useFirestore
        ? await firestoreAPI.getProducts(categoryId, locale)
        : await cachedAPI.getProductsWithFallback(categoryId);
      
      return apiProducts.map(apiProduct => {
        const product = transformProduct(apiProduct, locale);
        // Badge is set in transformProduct based on category
        return product;
      });
    } catch (error) {
      console.error('Failed to load products:', error);
      throw error;
    }
  }, [categoryId, locale]);
}

// Single product hook with Firestore support
export function useProduct(productId: number, locale?: string) {
  return useApiQuery(async () => {
    if (!productId) return null;
    
    // Use Firestore if enabled, otherwise fall back to direct API
    const apiProduct = useFirestore
      ? await firestoreAPI.getProduct(productId)
      : await apiClient.getProduct(productId);
    
    const product = transformProduct(apiProduct, locale);
    return product;
  }, [productId, locale]);
}

// Cache status hook with caching
export function useCacheStatus() {
  return useApiQuery(async () => {
    try {
      return await cachedAPI.getCacheStatus({ allowStale: true });
    } catch (error) {
      console.error('Failed to load cache status:', error);
      throw error;
    }
  });
}

// Combined data hook for dashboard/overview
export function useMenuData(locale?: string) {
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useCategories(locale);
  const { data: allProducts, loading: productsLoading, error: productsError } = useProducts(undefined, locale);
  const { data: cacheStatus, loading: cacheLoading } = useCacheStatus();

  return {
    categories,
    products: allProducts,
    cacheStatus,
    loading: categoriesLoading || productsLoading || cacheLoading,
    error: categoriesError || productsError,
  };
}

// Cache management hooks
export function useCacheManagement() {
  const [stats, setStats] = useState(cachedAPI.getCacheStats());
  const [isClearing, setIsClearing] = useState(false);

  const refreshStats = () => {
    setStats(cachedAPI.getCacheStats());
  };

  const clearCache = async () => {
    setIsClearing(true);
    try {
      cachedAPI.clearCache();
      refreshStats();
    } finally {
      setIsClearing(false);
    }
  };

  const forceRefresh = async () => {
    await cachedAPI.refreshAll();
    refreshStats();
  };

  const hasCachedData = cachedAPI.hasCachedData();
  const hasFreshData = cachedAPI.hasFreshData();

  return {
    stats,
    isClearing,
    hasCachedData,
    hasFreshData,
    clearCache,
    forceRefresh,
    refreshStats
  };
}

// Hook for cache-aware data fetching with immediate cache response
export function useCachedCategories() {
  const [data, setData] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setError(null);

        // Try to get cached data first (instant)
        const cachedCategories = cachedAPI.hasCachedData().categories;
        if (cachedCategories) {
          const cachedData = await cachedAPI.getCategories({ allowStale: true });
          if (isMounted && cachedData) {
            const transformedData = cachedData.map(category => transformCategory(category));
            setData(transformedData);
            setFromCache(true);
            setLoading(false);
          }
        }

        // Fetch fresh data (background)
        const freshData = await cachedAPI.getCategoriesWithFallback();
        if (isMounted) {
          const transformedData = freshData.map(category => transformCategory(category));
          setData(transformedData);
          setFromCache(false);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load categories');
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error, fromCache };
}

// Hook for cache-aware products fetching
export function useCachedProducts(categoryId?: number) {
  const [data, setData] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get cached data first (instant)
        const cachedProducts = cachedAPI.hasCachedData().products;
        if (cachedProducts) {
          const cachedData = await cachedAPI.getProducts(categoryId, { allowStale: true });
          if (isMounted && cachedData) {
            const transformedData = cachedData.map(product => transformProduct(product));
            setData(transformedData);
            setFromCache(true);
            setLoading(false);
          }
        }

        // Fetch fresh data (background)
        const freshData = await cachedAPI.getProductsWithFallback(categoryId);
        if (isMounted) {
          const transformedData = freshData.map(product => transformProduct(product));
          setData(transformedData);
          setFromCache(false);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load products');
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  return { data, loading, error, fromCache };
}

// Hook for data source status and configuration
export function useDataSourceStatus() {
  const [status, setStatus] = useState({
    usingFirestore: useFirestore && firestoreAPI.isUsingFirestore(),
    firestoreAvailable: false,
    apiAvailable: false,
    lastCheck: null as Date | null
  });

  const checkStatus = async () => {
    try {
      const health = await firestoreAPI.healthCheck();
      setStatus({
        usingFirestore: useFirestore && firestoreAPI.isUsingFirestore(),
        firestoreAvailable: health.firestore.available,
        apiAvailable: health.api.available,
        lastCheck: new Date()
      });
    } catch (error) {
      console.error('Failed to check data source status:', error);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return {
    ...status,
    checkStatus,
    config: {
      useFirestore,
      firestoreConfig: firestoreAPI.getConfig()
    }
  };
}