'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo, useState, useEffect } from 'react';

export function useUrlState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get URL parameter value
  const getParam = useCallback((key: string): string | null => {
    return searchParams.get(key);
  }, [searchParams]);

  // Get all URL parameters as object
  const getAllParams = useCallback((): Record<string, string> => {
    const params: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    return params;
  }, [searchParams]);

  // Set URL parameter
  const setParam = useCallback((key: string, value: string | number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === null || value === '' || value === undefined) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }

    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl);
  }, [searchParams, pathname, router]);

  // Set multiple URL parameters at once
  const setParams = useCallback((newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl);
  }, [searchParams, pathname, router]);

  // Clear all URL parameters
  const clearParams = useCallback(() => {
    router.replace(pathname);
  }, [pathname, router]);

  // Push new route with parameters
  const pushWithParams = useCallback((newPath: string, params?: Record<string, string | number>) => {
    if (params) {
      const urlParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        urlParams.set(key, String(value));
      });
      router.push(`${newPath}?${urlParams.toString()}`);
    } else {
      router.push(newPath);
    }
  }, [router]);

  // Get current URL with all parameters
  const currentUrl = useMemo(() => {
    const params = searchParams.toString();
    return params ? `${pathname}?${params}` : pathname;
  }, [pathname, searchParams]);

  return {
    getParam,
    getAllParams,
    setParam,
    setParams,
    clearParams,
    pushWithParams,
    currentUrl,
    pathname,
    searchParams: getAllParams(),
  };
}

// Hook specifically for menu filtering state
export function useMenuUrlState() {
  const { getParam, setParam, setParams, getAllParams } = useUrlState();

  const categoryId = getParam('category');
  const searchQuery = getParam('search') || '';
  const sortBy = getParam('sort') || 'popularity';
  const sortOrder = getParam('order') || 'desc';
  const showAvailableOnly = getParam('available') === 'true';

  const setCategoryId = useCallback((id: string | null) => {
    // Use setParams to update both category and search atomically
    if (id) {
      setParams({
        category: id,
        search: null  // Clear search when selecting category
      });
    } else {
      setParams({
        category: null
      });
    }
  }, [setParams]);

  const setSearchQuery = useCallback((query: string | null) => {
    // Use setParams to update both search and category atomically
    if (query) {
      setParams({
        search: query,
        category: null  // Clear category when searching
      });
    } else {
      setParams({
        search: null
      });
    }
  }, [setParams]);

  const setSortBy = useCallback((sort: string) => {
    setParam('sort', sort);
  }, [setParam]);

  const setSortOrder = useCallback((order: 'asc' | 'desc') => {
    setParam('order', order);
  }, [setParam]);

  const setShowAvailableOnly = useCallback((available: boolean) => {
    setParam('available', available ? 'true' : null);
  }, [setParam]);

  const clearFilters = useCallback(() => {
    setParams({
      category: null,
      search: null,
      sort: null,
      order: null,
      available: null,
    });
  }, [setParams]);

  return {
    categoryId,
    searchQuery,
    sortBy,
    sortOrder,
    showAvailableOnly,
    setCategoryId,
    setSearchQuery,
    setSortBy,
    setSortOrder,
    setShowAvailableOnly,
    clearFilters,
    allParams: getAllParams(),
  };
}

// Hook for cart state in URL
export function useCartUrlState() {
  const { getParam, setParam } = useUrlState();

  const step = getParam('step') || '1';
  const orderType = getParam('type');
  const tableNumber = getParam('table');

  const setCheckoutStep = useCallback((stepNumber: number) => {
    setParam('step', stepNumber);
  }, [setParam]);

  const setOrderTypeInUrl = useCallback((type: 'table' | 'delivery') => {
    setParam('type', type);
  }, [setParam]);

  const setTableNumberInUrl = useCallback((table: string | null) => {
    setParam('table', table);
  }, [setParam]);

  return {
    step: parseInt(step),
    orderType: orderType as 'table' | 'delivery' | null,
    tableNumber,
    setCheckoutStep,
    setOrderTypeInUrl,
    setTableNumberInUrl,
  };
}

// Hook for product modal with URL hash
export function useProductModalUrl() {
  const [productId, setProductId] = useState<string | null>(null);

  // Parse hash to get product ID
  const getProductIdFromHash = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash.substring(1); // Remove #
    const params = new URLSearchParams(hash);
    return params.get('product');
  }, []);

  // Set product ID in URL hash while preserving other hash parameters
  const setProductIdInHash = useCallback((id: string | null) => {
    if (typeof window === 'undefined') return;
    
    const hash = window.location.hash.substring(1); // Remove #
    const params = new URLSearchParams(hash);
    
    if (id) {
      params.set('product', id);
    } else {
      params.delete('product');
    }
    
    const newHash = params.toString();
    window.location.hash = newHash ? `#${newHash}` : '';
    setProductId(id);
  }, []);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const id = getProductIdFromHash();
      setProductId(id);
    };

    // Set initial state
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [getProductIdFromHash]);

  return {
    productId,
    setProductIdInHash,
    clearProductHash: () => setProductIdInHash(null),
  };
}

// Hook for menu filters with URL hash navigation
export function useMenuHashState() {
  const [categoryId, setCategoryIdState] = useState<string | null>(null);
  const [showAvailableOnly, setShowAvailableOnlyState] = useState(false);

  // Parse hash parameters
  const parseHashParams = useCallback((): URLSearchParams => {
    if (typeof window === 'undefined') return new URLSearchParams();
    const hash = window.location.hash.substring(1); // Remove #
    return new URLSearchParams(hash);
  }, []);

  // Set hash parameters
  const setHashParams = useCallback((params: { category?: string | null; available?: boolean | null }) => {
    if (typeof window === 'undefined') return;
    
    const hashParams = parseHashParams();
    
    // Update parameters
    if (params.category !== undefined) {
      if (params.category) {
        hashParams.set('category', params.category);
      } else {
        hashParams.delete('category');
      }
    }
    
    if (params.available !== undefined) {
      if (params.available) {
        hashParams.set('available', 'true');
      } else {
        hashParams.delete('available');
      }
    }
    
    // Build new hash
    const newHash = hashParams.toString();
    window.location.hash = newHash ? `#${newHash}` : '';
  }, [parseHashParams]);

  // Set category ID
  const setCategoryId = useCallback((id: string | null) => {
    setHashParams({ category: id });
    setCategoryIdState(id);
  }, [setHashParams]);

  // Set show available only
  const setShowAvailableOnly = useCallback((available: boolean) => {
    setHashParams({ available });
    setShowAvailableOnlyState(available);
  }, [setHashParams]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = '';
    }
    setCategoryIdState(null);
    setShowAvailableOnlyState(false);
  }, []);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const params = parseHashParams();
      setCategoryIdState(params.get('category') || null);
      setShowAvailableOnlyState(params.get('available') === 'true');
    };

    // Set initial state
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [parseHashParams]);

  return {
    categoryId,
    showAvailableOnly,
    setCategoryId,
    setShowAvailableOnly,
    clearFilters,
  };
}