'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCartStore, useUIStore } from '@/stores';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onViewDetails?: () => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const t = useTranslations();
  const [imageError, setImageError] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState(product.image);
  
  const addItem = useCartStore(state => state.addItem);
  const openModal = useUIStore(state => state.openModal);
  const showSuccessToast = useUIStore(state => state.showSuccessToast);

  const productName = product.name;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If product has toppings, always open modal for customization
    if (product.hasToppings) {
      handleProductClick();
      return;
    }
    
    addItem(product, 1, []);
    showSuccessToast(`Added ${productName} to cart`);
  };

  const handleProductClick = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      openModal('product-detail', { product });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
      onClick={handleProductClick}
      padding="none"
    >
      <div className="relative">
        {/* Product Image */}
        <div className="w-full aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
          {!imageError && currentImageSrc ? (
            <img
              src={currentImageSrc}
              alt={productName}
              className="w-full h-full object-cover"
              onError={() => {
                // If GCS URL fails, try to fall back to ERP URL
                if (currentImageSrc?.includes('storage.googleapis.com') && product.image?.includes('storage.googleapis.com')) {
                  // Extract product ID from GCS URL and create ERP URL
                  const productIdMatch = currentImageSrc.match(/product_(\d+)_/);
                  if (productIdMatch) {
                    const erpUrl = `https://erp.patedeli.com/web/image/product.product/${productIdMatch[1]}/image_512`;
                    setCurrentImageSrc(erpUrl);
                    return;
                  }
                }
                setImageError(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.badge && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${
              product.badge.type === 'promotion' ? 'bg-red-500' :
              product.badge.type === 'new' ? 'bg-green-500' :
              'bg-yellow-500'
            }`}>
              {product.badge.text}
            </span>
          )}
        </div>

        {/* Availability status */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-lg flex items-center justify-center">
            <span className="px-3 py-1 bg-gray-800 text-white text-sm font-medium rounded-full">
              {t('menu.product.outOfStock')}
            </span>
          </div>
        )}

      </div>

      {/* Product Info */}
      <div className="p-3 md:p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left Column: Name and Price */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-xs md:text-sm line-clamp-2 mb-1">
              {productName}
            </h3>
            <div className="text-left">
              {product.originalPrice && product.originalPrice > product.price ? (
                <div>
                  <span className="text-xs text-gray-500 line-through mr-1">
                    {formatPrice(product.originalPrice)}₫
                  </span>
                  <span className="font-bold text-primary-600 text-xs md:text-sm">
                    {formatPrice(product.price)}₫
                  </span>
                </div>
              ) : (
                <span className="font-bold text-gray-900 text-xs md:text-sm">
                  {formatPrice(product.price)}₫
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Add Button */}
          <div className="flex-shrink-0">
            {product.isAvailable ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleQuickAdd}
                className="w-8 h-8 p-0 rounded-full flex items-center justify-center"
                title={product.hasToppings ? "Customize & Add" : "Add to Cart"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
        </div>

      </div>
    </Card>
  );
}