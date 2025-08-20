'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MenuPageLayout } from '@/components/layout/PageLayout';
import { CategoryGrid } from '@/components/menu/CategoryGrid';
import { ProductGrid } from '@/components/menu/ProductGrid';
import { SearchResults } from '@/components/menu/SearchResults';
import { StickyMenuFilter } from '@/components/menu/StickyMenuFilter';
import { ProductCustomizationModal } from '@/components/modals/ProductCustomizationModal';
import { OrderInfoModal } from '@/components/modals/OrderInfoModal';
import { useCartStore, useUIStore } from '@/stores';
import { useCategories, useProducts } from '@/hooks/useApi';
import { useMenuHashState, useProductModalUrl } from '@/hooks/useUrlState';
import { filterExcludedCategories, filterExcludedProducts } from '@/lib/exclusions';
import { vietnameseIncludes } from '@/lib/vietnamese-utils';
import { formatPrice, getLocalizedProductName, calculateProductTotal } from '@/lib/common-utils';
import { filterAndSortProducts } from '@/lib/product-utils';
import { Category, Product, Topping } from '@/types';

export function MenuPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  // Hash state management
  const {
    categoryId: selectedCategoryId,
    orderType: urlOrderType,
    tableNumber: urlTableNumber,
    setCategoryId,
    setOrderInfo,
    clearFilters,
  } = useMenuHashState();
  
  // Local search state (not in URL)
  const [searchQuery, setSearchQuery] = useState('');
  
  // Product modal state
  const { productId: modalProductId, setProductIdInHash, clearProductHash } = useProductModalUrl();
  
  // Local state
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [showOrderTypeModal, setShowOrderTypeModal] = useState(false);
  
  // API hooks
  const { data: rawCategories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: allRawProducts, loading: productsLoading, error: productsError } = useProducts();
  
  // Apply exclusion filters (memoized to prevent infinite re-renders)
  const categories = useMemo(() => {
    return rawCategories ? filterExcludedCategories(rawCategories) : null;
  }, [rawCategories]);
  
  const products = useMemo(() => {
    // Always use all products for search functionality to work globally
    return allRawProducts ? filterExcludedProducts(allRawProducts) : null;
  }, [allRawProducts]);
  
  // Combined loading state
  const loading = categoriesLoading || productsLoading;
  
  // Store state
  const orderType = useCartStore(state => state.orderType);
  const tableNumber = useCartStore(state => state.tableNumber);
  const cartItemCount = useCartStore(state => state.getItemCount());
  const { showErrorToast } = useUIStore();

  // Handle API errors
  useEffect(() => {
    if (categoriesError || productsError) {
      console.error('Error loading menu data:', categoriesError || productsError);
      showErrorToast(t('menu.errors.loadFailed'));
    }
  }, [categoriesError, productsError, showErrorToast, t]);

  // Sync URL order type with cart store
  useEffect(() => {
    const cartStore = useCartStore.getState();
    
    if (urlOrderType && urlOrderType !== cartStore.orderType) {
      // URL has order type, sync it to cart store
      cartStore.setOrderType(urlOrderType);
      
      if (urlOrderType === 'table' && urlTableNumber) {
        cartStore.setTableNumber(urlTableNumber);
      }
    } else if (!urlOrderType && !cartStore.orderType) {
      // No order type in URL or cart, show modal
      setShowOrderTypeModal(true);
    }
  }, [urlOrderType, urlTableNumber]);


  // Filter and sort products using centralized logic
  useEffect(() => {
    if (!products || !categories) {
      setFilteredProducts([]);
      return;
    }

    // Apply unified filtering and sorting
    const filtered = filterAndSortProducts(products, categories, {
      searchQuery,
      categoryId: selectedCategoryId
    });

    setFilteredProducts(filtered);
    // Reset show all products when filters change
    setShowAllProducts(false);
  }, [products, categories, searchQuery, selectedCategoryId]);

  // Handle category selection
  const handleCategorySelect = (categoryId: string | null) => {
    setCategoryId(categoryId);
  };


  // Calculate derived state (must be after all hooks)
  const currentProducts = filteredProducts;
  
  // Filter featured products (products with 'popular' tag)
  const featuredProducts = useMemo(() => {
    return currentProducts.filter(product => 
      product.tags && product.tags.includes('popular')
    );
  }, [currentProducts]);
  
  const selectedCategoryName = selectedCategoryId && categories
    ? categories.find(c => 
        c.id === selectedCategoryId || 
        c.id.toString() === selectedCategoryId
      )?.name
    : null;

  // Handle product modal
  useEffect(() => {
    if (modalProductId) {
      // Find the product in the current products array
      const product = currentProducts.find(p => p.id === modalProductId);
      setModalProduct(product || null);
    } else {
      setModalProduct(null);
    }
  }, [modalProductId, currentProducts]);

  const handleCloseModal = () => {
    clearProductHash();
    setModalProduct(null);
  };


  // Handle order type modal save
  const handleOrderTypeModalSave = (orderType: 'table' | 'delivery', tableNumber?: string) => {
    // Update cart store
    useCartStore.getState().setOrderType(orderType);
    if (orderType === 'table' && tableNumber) {
      useCartStore.getState().setTableNumber(tableNumber);
    }
    
    // Update URL hash
    setOrderInfo(orderType, tableNumber);
    
    // Close modal
    setShowOrderTypeModal(false);
  };

  return (
    <MenuPageLayout>
      {/* Sticky Filter Section */}
      <StickyMenuFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        clearFilters={clearFilters}
        selectedCategoryId={selectedCategoryId}
        categories={categories}
        onCategorySelect={handleCategorySelect}
      />

      {/* Main content area */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Products Section */}
          <div className="pt-4">
              {searchQuery.trim().length >= 2 ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {t('menu.search.results.title')} "{searchQuery}"
                    </h2>
                    <Button 
                      variant="ghost"
                      onClick={() => setSearchQuery('')}
                      className="text-primary-600"
                    >
                      {t('menu.search.results.clear')}
                    </Button>
                  </div>
                  <ProductGrid 
                    products={currentProducts} 
                    columns={4}
                    onProductClick={setProductIdInHash}
                  />
                </>
              ) : selectedCategoryId ? (
                <ProductGrid 
                  products={currentProducts} 
                  columns={4}
                  onProductClick={setProductIdInHash}
                />
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {showAllProducts ? t('menu.products.all') : t('menu.products.featured')}
                  </h2>
                  <ProductGrid 
                    products={showAllProducts ? currentProducts : featuredProducts.slice(0, 8)} 
                    columns={4}
                    onProductClick={setProductIdInHash}
                  />
                  
                  {!showAllProducts && featuredProducts.length === 0 && currentProducts.length > 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">{t('menu.products.noFeatured')}</p>
                      <Button 
                        variant="outline"
                        onClick={() => setShowAllProducts(true)}
                      >
                        {t('menu.products.viewAll', { count: currentProducts.length })}
                      </Button>
                    </div>
                  )}
                  
                  {!showAllProducts && featuredProducts.length > 0 && featuredProducts.length < currentProducts.length && (
                    <div className="text-center mt-8">
                      <Button 
                        variant="outline"
                        onClick={() => setShowAllProducts(true)}
                      >
                        {t('menu.products.viewAll', { count: currentProducts.length })}
                      </Button>
                    </div>
                  )}
                  
                  {showAllProducts && (
                    <div className="text-center mt-8">
                      <Button 
                        variant="ghost"
                        onClick={() => setShowAllProducts(false)}
                      >
                        {t('menu.products.showFeatured')}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

          {/* Empty State */}
          {!loading && currentProducts.length === 0 && (
            <div className="text-center padding-responsive-y">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-responsive-lg font-medium text-gray-900 mb-2">
                {t('menu.empty.title')}
              </h3>
              <p className="text-responsive-base text-gray-600">
                {t('menu.empty.description')}
              </p>
            </div>
          )}
        </>
      )}

      {/* Product Customization Modal */}
      {modalProduct && (
        <ProductCustomizationModal
          isOpen={true}
          onClose={handleCloseModal}
          product={modalProduct}
        />
      )}

      {/* Order Type Selection Modal */}
      <OrderInfoModal 
        isOpen={showOrderTypeModal}
        onClose={() => setShowOrderTypeModal(false)}
        requireSelection={true}
        onSave={handleOrderTypeModalSave}
      />
    </MenuPageLayout>
  );
}