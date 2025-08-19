'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { CategoryGrid } from '@/components/menu/CategoryGrid';
import { ProductGrid } from '@/components/menu/ProductGrid';
import { SearchResults } from '@/components/menu/SearchResults';
import { FilterBar } from '@/components/menu/FilterBar';
import { CartSummary } from '@/components/cart/CartSummary';
import { FloatingCartButton } from '@/components/ui/FloatingCartButton';
import { ProductDetailModal } from '@/components/modals/ProductDetailModal';
import { CacheStatusIndicator } from '@/components/ui/CacheStatus';
import { useCartStore, useUIStore } from '@/stores';
import { useCategories, useProducts } from '@/hooks/useApi';
import { useMenuHashState, useProductModalUrl } from '@/hooks/useUrlState';
import { filterExcludedCategories, filterExcludedProducts } from '@/lib/exclusions';
import { vietnameseIncludes } from '@/lib/vietnamese-utils';
import { Category, Product, Topping } from '@/types';

export function MenuPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  // Hash state management
  const {
    categoryId: selectedCategoryId,
    showAvailableOnly,
    setCategoryId,
    setShowAvailableOnly,
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
  const [selectedToppings, setSelectedToppings] = useState<{ [attributeId: number]: string[] }>({});
  const [quantity, setQuantity] = useState(1);
  
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


  // Filter products based on search, availability, and exclusions
  useEffect(() => {
    if (!products || !categories) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    // Apply search filter first (searches all products with Vietnamese accent-insensitive matching)
    if (searchQuery.trim().length >= 2) {
      const query = searchQuery.trim();
      filtered = filtered.filter(product => 
        vietnameseIncludes(product.name, query) ||
        vietnameseIncludes(product.description, query)
      );
    }

    // Apply category filter ONLY when not searching (to allow global search)
    if (selectedCategoryId && searchQuery.trim().length < 2) {
      filtered = filtered.filter(product => product.category === selectedCategoryId);
    }

    // Filter by availability
    if (showAvailableOnly) {
      filtered = filtered.filter(product => product.isAvailable);
    }

    // Sort by category order when showing all products (not searching or in a specific category)
    if (!selectedCategoryId && searchQuery.trim().length < 2) {
      // Create a map of category ID to sequence for sorting
      const categorySequenceMap = new Map();
      categories.forEach(category => {
        categorySequenceMap.set(category.id, category.sequence || 0);
      });

      filtered.sort((a, b) => {
        const aSequence = categorySequenceMap.get(a.category) || 999;
        const bSequence = categorySequenceMap.get(b.category) || 999;
        return aSequence - bSequence;
      });
    }

    setFilteredProducts(filtered);
    // Reset show all products when filters change
    setShowAllProducts(false);
  }, [products, categories, searchQuery, showAvailableOnly, selectedCategoryId]);

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
    setSelectedToppings({});
    setQuantity(1);
  };

  // Handle topping selection for different display types
  const handleToppingSelect = (attributeId: number, toppingId: string, displayType: 'check_box' | 'radio') => {
    setSelectedToppings(prev => {
      if (displayType === 'radio') {
        // Radio: only one selection per attribute
        return { ...prev, [attributeId]: [toppingId] };
      } else {
        // Checkbox: multiple selections per attribute
        const currentSelections = prev[attributeId] || [];
        const isSelected = currentSelections.includes(toppingId);
        
        if (isSelected) {
          return { ...prev, [attributeId]: currentSelections.filter(id => id !== toppingId) };
        } else {
          return { ...prev, [attributeId]: [...currentSelections, toppingId] };
        }
      }
    });
  };

  // Calculate total price including selected toppings
  const calculateTotalPrice = () => {
    if (!modalProduct) return 0;
    
    const basePrice = modalProduct.price;
    let toppingPrice = 0;
    
    // Calculate topping prices
    Object.values(selectedToppings).flat().forEach(toppingId => {
      const topping = modalProduct.toppings.find(t => t.id === toppingId);
      if (topping) {
        toppingPrice += topping.price;
      }
    });
    
    return (basePrice + toppingPrice) * quantity;
  };

  // Check if user needs to select order type (after all hooks)
  const needsOrderType = !orderType;

  if (needsOrderType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto p-6 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('menu.orderTypeRequired.title')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('menu.orderTypeRequired.description')}
          </p>
          <Button onClick={() => router.push('/')} className="w-full">
            {t('menu.orderTypeRequired.backToHome')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          {/* Header with breadcrumb and controls */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            {/* Left side - Breadcrumb (only Home icon) */}
            <div className="flex-1">
              <Breadcrumb 
                categoryName={selectedCategoryName || undefined}
                productName={modalProduct?.name}
                onClearFilters={clearFilters}
                simplified={true}
              />
            </div>

            {/* Right side - Table number, Language selector (no cart button) */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {orderType && (
                <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 px-2 sm:px-3 py-1 rounded-full">
                  {orderType === 'table' 
                    ? t('menu.orderInfo.table', { number: tableNumber || '1' })
                    : t('menu.orderInfo.delivery')
                  }
                </div>
              )}
              <div className="hidden sm:block">
                <CacheStatusIndicator />
              </div>
              <LanguageSelector variant="dropdown" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('common.loading')}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            <FilterBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showAvailableOnly={showAvailableOnly}
              setShowAvailableOnly={setShowAvailableOnly}
              clearFilters={clearFilters}
              selectedCategoryId={selectedCategoryId}
              categories={categories}
              onCategorySelect={handleCategorySelect}
            />

            {/* Categories Grid - Hide when searching, no title */}
            {!selectedCategoryId && searchQuery.trim().length < 2 && categories && (
              <div className="mb-4">
                <CategoryGrid 
                  categories={categories}
                  onCategorySelect={handleCategorySelect}
                  selectedCategoryId={selectedCategoryId}
                />
              </div>
            )}

            {/* Products Section */}
            <div>
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
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedCategoryName}
                    </h2>
                    <Button 
                      variant="ghost"
                      onClick={() => handleCategorySelect(null)}
                      className="text-primary-600"
                    >
                      {t('menu.categories.viewAll')}
                    </Button>
                  </div>
                  <ProductGrid 
                    products={currentProducts} 
                    columns={4}
                    onProductClick={setProductIdInHash}
                  />
                </>
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
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('menu.empty.title')}
                </h3>
                <p className="text-gray-600">
                  {t('menu.empty.description')}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Cart Summary - Hidden on mobile, use FloatingCartButton instead */}
      {cartItemCount > 0 && (
        <div className="hidden">
          <CartSummary compact />
        </div>
      )}

      {/* Floating Cart Button */}
      <FloatingCartButton />

      {/* Product Modal */}
      {modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col relative">
            {/* Sticky Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Product Name */}
              <h2 className="text-xl font-bold text-gray-900 mb-4 pr-8">{modalProduct.name}</h2>

              {/* Product Image - Square */}
              <div className="w-full max-w-xs mx-auto aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                <img
                  src={modalProduct.image}
                  alt={modalProduct.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder-food.svg';
                  }}
                />
                {/* Badge overlay */}
                {modalProduct.badge && (
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${
                      modalProduct.badge.type === 'promotion' ? 'bg-red-500' :
                      modalProduct.badge.type === 'new' ? 'bg-green-500' :
                      'bg-yellow-500'
                    }`}>
                      {modalProduct.badge.text}
                    </span>
                  </div>
                )}
              </div>

              {/* Toppings/Attributes Section */}
              {modalProduct.hasToppings && modalProduct.attributeLines.length > 0 && (
                <div className="mb-20">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize Your Order</h3>
                  {modalProduct.attributeLines.map(attributeLine => (
                    <div key={attributeLine.attribute_id} className="mb-4">
                      <h4 className="text-md font-medium text-gray-700 mb-2">{attributeLine.attribute_name}</h4>
                      <div className="space-y-2">
                        {attributeLine.values.map(value => {
                          const isSelected = selectedToppings[attributeLine.attribute_id]?.includes(value.id.toString()) || false;
                          return (
                            <label key={value.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <div className="flex items-center">
                                <input
                                  type={attributeLine.display_type === 'radio' ? 'radio' : 'checkbox'}
                                  name={`attribute_${attributeLine.attribute_id}`}
                                  checked={isSelected}
                                  onChange={() => handleToppingSelect(attributeLine.attribute_id, value.id.toString(), attributeLine.display_type)}
                                  className="mr-3"
                                />
                                <span className="text-gray-900">{value.name}</span>
                              </div>
                              {value.price_extra > 0 && (
                                <span className="text-green-600 font-medium">
                                  +{new Intl.NumberFormat('vi-VN').format(value.price_extra)}₫
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky Footer with Quantity and Add to Cart */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-lg font-semibold w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={() => {
                    // Collect selected toppings as Topping objects
                    const selectedToppingsArray = Object.values(selectedToppings)
                      .flat()
                      .map(toppingId => modalProduct.toppings.find(t => t.id === toppingId))
                      .filter(Boolean) as Topping[];
                    
                    useCartStore.getState().addItem(modalProduct, quantity, selectedToppingsArray);
                    
                    const totalPrice = calculateTotalPrice();
                    useUIStore.getState().showSuccessToast(
                      `Added ${modalProduct.name} to cart (${new Intl.NumberFormat('vi-VN').format(totalPrice)}₫)`
                    );
                    handleCloseModal();
                  }}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5 1.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  {new Intl.NumberFormat('vi-VN').format(modalProduct.hasToppings ? calculateTotalPrice() : modalProduct.price * quantity)}₫
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}