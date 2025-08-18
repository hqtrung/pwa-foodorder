'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  compact?: boolean;
}

export function CartSummary({ showCheckoutButton = true, compact = false }: CartSummaryProps) {
  const t = useTranslations();
  const router = useRouter();
  
  const { summary, getItemCount, calculateSummary } = useCartStore();
  const itemCount = getItemCount();

  // Ensure summary is calculated when component mounts (handles hydration issues)
  useEffect(() => {
    calculateSummary();
  }, [calculateSummary]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  if (itemCount === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-900">
            {t('cart.summary.title')} ({itemCount} {t('cart.summary.items')})
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/cart')}
            className="text-primary-600"
          >
            {t('cart.summary.view')}
          </Button>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>{t('cart.summary.subtotal')}</span>
            <span>{formatPrice(summary.subtotal)}₫</span>
          </div>
          
          {summary.deliveryFee > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>{t('cart.summary.delivery')}</span>
              <span>{formatPrice(summary.deliveryFee)}₫</span>
            </div>
          )}
          
          <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
            <span>{t('cart.summary.total')}</span>
            <span>{formatPrice(summary.total)}₫</span>
          </div>
        </div>
        
        {showCheckoutButton && (
          <Button
            onClick={() => router.push('/cart')}
            className="w-full mt-4"
          >
            {t('cart.summary.checkout')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('cart.summary.subtotal')}</span>
          <span className="font-medium">{formatPrice(summary.subtotal)}₫</span>
        </div>
        
        {summary.deliveryFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('cart.summary.deliveryFee')}</span>
            <span className="font-medium">{formatPrice(summary.deliveryFee)}₫</span>
          </div>
        )}
        
        {/* Tax is already included in item prices, so no separate tax line needed */}
        
        {summary.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>{t('cart.summary.discount')}</span>
            <span className="font-medium">-{formatPrice(summary.discount)}₫</span>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between">
            <span className="text-base font-semibold text-gray-900">
              {t('cart.summary.total')}
            </span>
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(summary.total)}₫
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}