'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { OrderInfoModal } from '@/components/modals/OrderInfoModal';
import { useCartStore, useUIStore } from '@/stores';

export function CartPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  // State
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showOrderInfoModal, setShowOrderInfoModal] = useState(false);
  
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleContinueToCheckout = () => {
    if (!isMinimumOrderMet()) {
      showErrorToast(
        t('cart.errors.minimumOrder', {
          minimum: formatPrice(50000) // TODO: Get from store settings
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

  if (!hasItems) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Simplified Mobile Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4">
          {/* Mobile: Simple header with back button and title */}
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="p-2 -ml-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {t('cart.title')}
                </h1>
                <p className="text-xs text-gray-600 md:text-sm">
                  {t('cart.itemCount', { count: itemCount })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="hidden sm:block">
                <LanguageSelector variant="dropdown" />
              </div>
              {hasItems && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 text-xs px-2 md:px-3"
                >
                  {t('cart.actions.clear')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {/* Mobile-first single column layout */}
        <div className="space-y-4">
          {/* Order Info - Compact mobile version */}
          <Card padding="sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  {t('cart.orderInfo.title')}
                </h3>
                <p className="text-xs text-gray-600">
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
                className="text-xs px-2 py-1 h-7"
              >
                {t('cart.actions.change')}
              </Button>
            </div>
          </Card>

          {/* Cart Items List - Mobile optimized */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-900 px-1">
              {t('cart.items.title')}
            </h3>
            
            <div className="space-y-2">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Special Instructions - Collapsible on mobile */}
          <Card padding="sm">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                {t('cart.specialInstructions.title')}
              </h3>
              <Input
                as="textarea"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder={t('cart.specialInstructions.placeholder')}
                rows={2}
                className="w-full text-sm"
              />
            </div>
          </Card>

          {/* Continue Shopping - Mobile button */}
          <div className="text-center py-2">
            <Button
              variant="outline"
              onClick={handleContinueShopping}
              className="w-full text-sm"
              size="sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('cart.actions.continueShopping')}
            </Button>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="px-4 py-3">
          {/* Order Summary - Compact */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-baseline space-x-2">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(summary.total)}₫
                </span>
                <span className="text-xs text-gray-500">
                  {itemCount} {t(itemCount === 1 ? 'common.item' : 'common.items')}
                </span>
              </div>
              {summary.deliveryFee > 0 && (
                <p className="text-xs text-gray-600">
                  + {formatPrice(summary.deliveryFee)}₫ {t('cart.summary.deliveryFee')}
                </p>
              )}
            </div>
            
            {/* Minimum Order Warning */}
            {!isMinimumOrderMet() && orderType === 'delivery' && (
              <div className="flex items-center text-yellow-600 mr-3">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">
                  {formatPrice(50000 - summary.subtotal)}₫ more needed
                </span>
              </div>
            )}
          </div>

          {/* Checkout Button */}
          <Button
            onClick={handleContinueToCheckout}
            disabled={!isMinimumOrderMet()}
            className="w-full"
            size="lg"
          >
{t('checkout.button')} {formatPrice(summary.total)}₫
          </Button>
          
          {/* Estimated Time */}
          <div className="flex items-center justify-center mt-2">
            <svg className="w-3 h-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-gray-600">
              {orderType === 'delivery' 
                ? t('cart.estimatedTime.delivery')
                : t('cart.estimatedTime.pickup')
              }
            </span>
          </div>
        </div>
      </div>

      {/* Order Info Modal */}
      <OrderInfoModal
        isOpen={showOrderInfoModal}
        onClose={() => setShowOrderInfoModal(false)}
      />

    </div>
  );
}