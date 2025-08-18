'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useUIStore, useCartStore } from '@/stores';
import { Product, Topping } from '@/types';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  const t = useTranslations();
  const locale = useLocale();
  
  // State
  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [availableToppings, setAvailableToppings] = useState<Topping[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [toppingsLoading, setToppingsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Store actions
  const addItem = useCartStore(state => state.addItem);
  const showSuccessToast = useUIStore(state => state.showSuccessToast);
  const showErrorToast = useUIStore(state => state.showErrorToast);

  const productName = product.name[locale as keyof typeof product.name];
  const productDescription = product.description[locale as keyof typeof product.description];

  // Load toppings when modal opens
  useEffect(() => {
    if (isOpen && product.toppings && product.toppings.length > 0) {
      loadToppings();
    } else {
      setToppingsLoading(false);
    }
  }, [isOpen, product.id]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedToppings([]);
      setSpecialInstructions('');
      setCurrentImageIndex(0);
    }
  }, [isOpen, product.id]);

  const loadToppings = async () => {
    try {
      setToppingsLoading(true);
      if (product.toppings && product.toppings.length > 0) {
        // Toppings are already loaded with the product from the API
        setAvailableToppings(product.toppings);
      }
    } catch (error) {
      console.error('Error loading toppings:', error);
      showErrorToast(t('product.errors.toppingsLoadFailed'));
    } finally {
      setToppingsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const calculateTotalPrice = () => {
    const basePrice = product.price;
    const toppingsPrice = selectedToppings.reduce((sum, topping) => sum + topping.price, 0);
    return (basePrice + toppingsPrice) * quantity;
  };

  const handleToppingToggle = (topping: Topping) => {
    setSelectedToppings(prev => {
      const exists = prev.find(t => t.id === topping.id);
      if (exists) {
        return prev.filter(t => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      await addItem(product, quantity, selectedToppings, specialInstructions);
      showSuccessToast(
        t('product.success.addedToCart', { 
          name: productName,
          quantity 
        })
      );
      onClose();
    } catch (error) {
      console.error('Error adding to cart:', error);
      showErrorToast(t('product.errors.addToCartFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    const images = product.images || [product.image];
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const totalPrice = calculateTotalPrice();
  const images = product.images || [product.image];
  const hasMultipleImages = images.length > 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="max-h-[90vh] overflow-y-auto"
    >
      {/* Product Images */}
      <div className="relative mb-6">
        <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '1/1' }}>
          <img
            src={images[currentImageIndex]}
            alt={productName}
            className="w-full h-full object-contain"
            style={{ objectFit: 'contain' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/placeholder-food.svg';
            }}
          />
          
          {/* Image Navigation */}
          {hasMultipleImages && (
            <>
              <button
                onClick={() => handleImageNavigation('prev')}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => handleImageNavigation('next')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isPromotional && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
              {t('menu.badges.promotion')}
            </span>
          )}
          {product.isBestSeller && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white">
              {t('menu.badges.bestSeller')}
            </span>
          )}
          {product.isNew && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
              {t('menu.badges.new')}
            </span>
          )}
        </div>

        {/* Spicy Level */}
        {product.spicyLevel && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center space-x-1 bg-black bg-opacity-50 rounded-full px-2 py-1">
              {Array.from({ length: 3 }, (_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i < product.spicyLevel! ? 'text-red-500' : 'text-gray-300'
                  }`}
                >
                  🌶️
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900 flex-1 mr-4">
            {productName}
          </h2>
          <div className="text-right">
            {product.originalPrice && product.originalPrice > product.price ? (
              <div>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}₫
                </span>
                <div className="text-xl font-bold text-primary-600">
                  {formatPrice(product.price)}₫
                </div>
              </div>
            ) : (
              <div className="text-xl font-bold text-gray-900">
                {formatPrice(product.price)}₫
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-600 mb-4">
          {productDescription}
        </p>

        {/* Product Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{product.preparationTime} {t('menu.product.minutes')}</span>
          </div>
          
          {product.nutritionalInfo && (
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>{product.nutritionalInfo.calories} cal</span>
            </div>
          )}
        </div>

        {/* Allergen Information */}
        {product.allergens && product.allergens.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {t('product.allergens.title')}:
            </h4>
            <div className="flex flex-wrap gap-1">
              {product.allergens.map((allergen) => (
                <span
                  key={allergen}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800"
                >
                  {t(`product.allergens.${allergen}`, allergen)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nutritional Information */}
        {product.nutritionalInfo && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {t('product.nutrition.title')}:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-semibold text-gray-900">{product.nutritionalInfo.calories}</div>
                <div className="text-xs text-gray-600">{t('product.nutrition.calories')}</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-semibold text-gray-900">{product.nutritionalInfo.protein}g</div>
                <div className="text-xs text-gray-600">{t('product.nutrition.protein')}</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-semibold text-gray-900">{product.nutritionalInfo.carbs}g</div>
                <div className="text-xs text-gray-600">{t('product.nutrition.carbs')}</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-semibold text-gray-900">{product.nutritionalInfo.fat}g</div>
                <div className="text-xs text-gray-600">{t('product.nutrition.fat')}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toppings Selection */}
      {product.toppings && product.toppings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('product.toppings.title')}
          </h3>
          
          {toppingsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {availableToppings.map((topping) => {
                const isSelected = selectedToppings.some(t => t.id === topping.id);
                const toppingName = topping.name[locale as keyof typeof topping.name];
                
                return (
                  <Card
                    key={topping.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'ring-2 ring-primary-500 border-primary-500 bg-primary-50' 
                        : 'hover:border-primary-300'
                    }`}
                    onClick={() => handleToppingToggle(topping)}
                    padding="sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'bg-primary-500 border-primary-500' 
                              : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">
                            {toppingName}
                          </span>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">
                        +{formatPrice(topping.price)}₫
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Special Instructions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t('product.instructions.title')}
        </h3>
        <Input
          as="textarea"
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder={t('product.instructions.placeholder')}
          rows={3}
          className="w-full"
        />
      </div>

      {/* Quantity and Add to Cart */}
      <ModalFooter>
        <div className="flex items-center justify-between w-full">
          {/* Quantity Selector */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">
              {t('product.quantity.label')}:
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-8 h-8 p-0"
              >
                -
              </Button>
              <span className="w-8 text-center font-semibold">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 10}
                className="w-8 h-8 p-0"
              >
                +
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.available || loading}
            loading={loading}
            className="flex-shrink-0 ml-4"
          >
            {!product.available 
              ? t('menu.product.outOfStock')
              : t('product.addToCart.button', { price: formatPrice(totalPrice) })
            }
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}