'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useCartStore, useUIStore } from '@/stores';
import { CartItem as CartItemType } from '@/stores/cartStore';

interface CartItemProps {
  item: CartItemType;
}

// Helper function to get localized text
const getLocalizedText = (text: any, locale: string): string => {
  if (typeof text === 'string') {
    return text;
  }
  if (typeof text === 'object' && text) {
    return text[locale] || text.vi || text.en || Object.values(text)[0] || '';
  }
  return '';
};

export function CartItem({ item }: CartItemProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [isEditing, setIsEditing] = useState(false);
  const [tempInstructions, setTempInstructions] = useState(item.specialInstructions || '');
  
  const {
    updateItemQuantity,
    removeItem,
    updateItemInstructions
  } = useCartStore();
  
  const { showSuccessToast, openModal } = useUIStore();

  const productName = getLocalizedText(item.product.name, locale);
  const productDescription = getLocalizedText(item.product.description, locale);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemove();
    } else {
      updateItemQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    removeItem(item.id);
    showSuccessToast(t('cart.item.removed', { name: productName }));
  };

  const handleEditProduct = () => {
    openModal('product-detail', { product: item.product });
  };

  const handleSaveInstructions = () => {
    updateItemInstructions(item.id, tempInstructions);
    setIsEditing(false);
    showSuccessToast(t('cart.item.instructionsUpdated'));
  };

  const handleCancelEdit = () => {
    setTempInstructions(item.specialInstructions || '');
    setIsEditing(false);
  };

  return (
    <Card padding="sm" hover>
      <div className="flex items-start space-x-3">
        {/* Product Image - Smaller on mobile */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={item.product.image}
            alt={productName}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/placeholder-food.svg';
            }}
          />
        </div>

        {/* Product Details - Mobile optimized */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 mr-3">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {productName}
              </h3>
              
              {/* Toppings - Compact mobile version */}
              {item.toppings.length > 0 && (
                <div className="mt-1">
                  <div className="flex flex-wrap gap-1">
                    {item.toppings.map((topping) => (
                      <span
                        key={topping.id}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                      >
                        {getLocalizedText(topping.name, locale)}
                        <span className="ml-1 font-medium text-xs">
                          +{formatPrice(topping.price)}₫
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Instructions - Simplified mobile */}
              {item.specialInstructions && !isEditing && (
                <div className="mt-2">
                  <p className="text-xs text-gray-700 bg-gray-50 rounded px-2 py-1">
                    📝 {item.specialInstructions}
                  </p>
                </div>
              )}
              
              {isEditing && (
                <div className="mt-2 space-y-2">
                  <Input
                    as="textarea"
                    value={tempInstructions}
                    onChange={(e) => setTempInstructions(e.target.value)}
                    placeholder={t('cart.item.instructionsPlaceholder')}
                    rows={2}
                    className="text-xs"
                  />
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveInstructions}
                      className="text-xs px-2 py-1 h-6"
                    >
                      {t('common.actions.save')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="text-xs px-2 py-1 h-6"
                    >
                      {t('common.actions.cancel')}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Price - Mobile compact */}
            <div className="text-right flex-shrink-0">
              <div className="text-base font-bold text-gray-900">
                {formatPrice(item.totalPrice)}₫
              </div>
              {item.quantity > 1 && (
                <div className="text-xs text-gray-500">
                  {formatPrice(item.totalPrice / item.quantity)}₫ ea
                </div>
              )}
            </div>
          </div>

          {/* Mobile-optimized bottom actions row */}
          <div className="flex items-center justify-between mt-3">
            {/* Quantity Controls - Inline and compact */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="w-7 h-7 p-0 text-sm"
              >
                -
              </Button>
              <span className="w-6 text-center text-sm font-semibold">
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={item.quantity >= 10}
                className="w-7 h-7 p-0 text-sm"
              >
                +
              </Button>
            </div>

            {/* Compact Actions */}
            <div className="flex items-center space-x-1">
              {/* Add note button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-gray-600 hover:text-gray-700 p-1"
                title="Add note"
              >
                📝
              </Button>
              
              {/* Edit/Modify */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditProduct}
                className="text-primary-600 hover:text-primary-700 p-1"
                title="Modify"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
              
              {/* Remove */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-700 p-1"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}