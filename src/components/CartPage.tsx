'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { PageLayout } from '@/components/layout/PageLayout';
import { CartItem } from '@/components/cart/CartItem';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { OrderInfoModal } from '@/components/modals/OrderInfoModal';
import { ProductCustomizationModal } from '@/components/modals/ProductCustomizationModal';
import { useCartStore, useUIStore } from '@/stores';
import { formatPrice } from '@/lib/common-utils';
import { Product } from '@/types';
import { CartItem as CartItemType } from '@/stores/cartStore';

export function CartPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  // State
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showOrderInfoModal, setShowOrderInfoModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCartItem, setEditingCartItem] = useState<CartItemType | null>(null);
  
  // Store state
  const {
    items,
    summary,
    orderType,
    tableNumber,
    isMinimumOrderMet,
    getItemCount,
    clearCart
  } = useCartStore();
  
  const { showErrorToast, showSuccessToast } = useUIStore();
  
  const itemCount = getItemCount();
  const hasItems = items.length > 0;

  const handleContinueToCheckout = () => {
    if (!isMinimumOrderMet()) {
      showErrorToast(
        t('cart.errors.minimumOrder', {
          minimum: formatPrice(50000, locale) // TODO: Get from store settings
        })
      );
      return;
    }

    if (!orderType) {
      showErrorToast(t('cart.errors.noOrderType'));
      router.push('/');
      return;
    }

    router.push('/checkout');
  };

  const handleClearCart = () => {
    clearCart();
    showSuccessToast(t('cart.success.cleared'));
  };

  const handleContinueShopping = () => {
    router.push('/menu');
  };

  const handleEditCartItem = (product: Product, cartItem: CartItemType) => {
    setEditingProduct(product);
    setEditingCartItem(cartItem);
  };

  const handleCloseEditModal = () => {
    setEditingProduct(null);
    setEditingCartItem(null);
  };

  if (!hasItems) {
    return <EmptyCart />;
  }

  return (
    <PageLayout 
      header={{
        showBreadcrumb: true,
        showBackButton: true,
        title: t('cart.title'),
        subtitle: t('cart.itemCount', { count: itemCount })
      }}
      bottomPadding="mobile"
      className="pb-20 md:pb-0"
    >
      <div className="container-responsive">
        {/* Responsive Layout */}
        <div className="form-group-responsive">
          {/* Order Info - Responsive */}
          <Card className="responsive-card">
            <div className="responsive-flex-center justify-between">
              <div className="flex-1">
                <h3 className="text-responsive-sm font-semibold text-gray-900">
                  {t('cart.orderInfo.title')}
                </h3>
                <p className="text-responsive-xs text-gray-600">
                  {orderType === 'table' 
                    ? t('cart.orderInfo.table', { number: tableNumber || '1' })
                    : t('cart.orderInfo.delivery')
                  }
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOrderInfoModal(true)}
                className="responsive-button text-xs px-2 py-1 h-7 touch-manipulation"
              >
                {t('cart.actions.change')}
              </Button>
            </div>
          </Card>

          {/* Cart Content - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column - Cart Items */}
            <div className="form-group-responsive">
              <h3 className="text-responsive-base font-semibold text-gray-900 px-1">
                {t('cart.items.title')}
              </h3>
              
              <div className="space-y-2">
                {items.map((item) => (
                  <CartItem 
                    key={item.id} 
                    item={item} 
                    onEdit={(product, cartItem) => handleEditCartItem(product, cartItem)}
                  />
                ))}
              </div>
            </div>

            {/* Right Column - Special Instructions */}
            <div className="form-group-responsive">
              <h3 className="text-responsive-sm font-semibold text-gray-900">
                {t('cart.specialInstructions.title')}
              </h3>
              <Input
                as="textarea"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder={t('cart.specialInstructions.placeholder')}
                rows={4}
                className="responsive-input focus-mobile"
              />
            </div>
          </div>


          {/* Continue Shopping - Responsive button */}
          <div className="text-center padding-responsive-y">
            <Button
              variant="outline"
              onClick={handleContinueShopping}
              className="responsive-button w-full touch-manipulation"
              size="sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('cart.actions.continueShopping')}
            </Button>
          </div>
          
        </div>
      </div>

      {/* Sticky Bottom Checkout Bar */}
      <div className="sticky-bottom-mobile bg-white border-t border-gray-200 shadow-lg">
        <div className="padding-responsive">
          {/* Order Summary - Compact */}
          <div className="responsive-flex-center justify-between mb-3">
            <div className="flex-1">
              {summary.deliveryFee > 0 && (
                <p className="text-responsive-xs text-gray-600">
                  + {formatPrice(summary.deliveryFee, locale)} {t('cart.summary.deliveryFee')}
                </p>
              )}
            </div>
            
            {/* Minimum Order Warning */}
            {!isMinimumOrderMet() && orderType === 'delivery' && (
              <div className="responsive-flex-center text-yellow-600 mr-3">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-responsive-xs">
                  {formatPrice(50000 - summary.subtotal, locale)} more needed
                </span>
              </div>
            )}
          </div>

          {/* Checkout Button */}
          <Button
            onClick={handleContinueToCheckout}
            disabled={!isMinimumOrderMet()}
            className="responsive-button-lg w-full touch-manipulation mb-4"
          >
            {t('checkout.button')} {formatPrice(summary.total, locale)}
          </Button>
          
        </div>
      </div>

      {/* Order Info Modal */}
      <OrderInfoModal
        isOpen={showOrderInfoModal}
        onClose={() => setShowOrderInfoModal(false)}
      />

      {/* Product Customization Modal */}
      {editingProduct && (
        <ProductCustomizationModal
          isOpen={true}
          onClose={handleCloseEditModal}
          product={editingProduct}
          cartItem={editingCartItem || undefined}
        />
      )}
    </PageLayout>
  );
}