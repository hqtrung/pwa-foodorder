'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useCartStore, useUIStore } from '@/stores';
import { formatPrice } from '@/lib/common-utils';
import { Product, Topping } from '@/types';
import { CartItem } from '@/stores/cartStore';
import { ExpandableText } from '@/components/ui/ExpandableText';

interface ProductCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  cartItem?: CartItem; // Optional: if provided, we're editing an existing item
}

export function ProductCustomizationModal({ 
  isOpen, 
  onClose, 
  product, 
  cartItem 
}: ProductCustomizationModalProps) {
  const t = useTranslations();
  const locale = useLocale();
  
  // State for customization
  const [selectedToppings, setSelectedToppings] = useState<{ [attributeId: number]: string[] }>({});
  const [quantity, setQuantity] = useState(1);
  
  // Store actions
  const addItem = useCartStore(state => state.addItem);
  const updateItem = useCartStore(state => state.updateItem);
  const { showSuccessToast, showErrorToast } = useUIStore();
  
  const isEditing = !!cartItem;

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEditing && cartItem) {
        // Pre-populate form with existing cart item data
        setQuantity(cartItem.quantity);
        
        // Convert cart item toppings to selected toppings format
        const toppingsMap: { [attributeId: number]: string[] } = {};
        if (cartItem.toppings && cartItem.toppings.length > 0 && product.attributeLines) {
          // Group toppings by attribute ID - we need to match them to product attributes
          cartItem.toppings.forEach(topping => {
            // Find which attribute this topping belongs to
            product.attributeLines.forEach(attributeLine => {
              const matchingValue = attributeLine.values.find(value => 
                value.id.toString() === topping.id || 
                value.name === topping.name
              );
              if (matchingValue) {
                if (!toppingsMap[attributeLine.attribute_id]) {
                  toppingsMap[attributeLine.attribute_id] = [];
                }
                toppingsMap[attributeLine.attribute_id].push(matchingValue.id.toString());
              }
            });
          });
        }
        setSelectedToppings(toppingsMap);
      } else {
        // Reset for new item
        setSelectedToppings({});
        setQuantity(1);
      }
    }
  }, [isOpen, product, cartItem, isEditing]);

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
    const basePrice = product.price;
    let toppingPrice = 0;
    
    // Calculate topping prices from attributeLines
    if (product.attributeLines) {
      Object.values(selectedToppings).flat().forEach(toppingId => {
        // Find the topping value in attributeLines
        product.attributeLines.forEach(attributeLine => {
          const toppingValue = attributeLine.values.find(value => value.id.toString() === toppingId);
          if (toppingValue && toppingValue.price_extra > 0) {
            toppingPrice += toppingValue.price_extra;
          }
        });
      });
    }
    
    return (basePrice + toppingPrice) * quantity;
  };

  // Handle add to cart or update cart item
  const handleSubmit = async () => {
    try {
      // Collect selected toppings as Topping objects from attributeLines
      const selectedToppingsArray: Topping[] = [];
      if (product.attributeLines) {
        Object.values(selectedToppings).flat().forEach(toppingId => {
          product.attributeLines.forEach(attributeLine => {
            const toppingValue = attributeLine.values.find(value => value.id.toString() === toppingId);
            if (toppingValue) {
              selectedToppingsArray.push({
                id: toppingValue.id.toString(),
                name: toppingValue.name,
                price: toppingValue.price_extra,
                isAvailable: true
              });
            }
          });
        });
      }
      
      if (isEditing && cartItem) {
        // Update existing cart item
        await updateItem(cartItem.id, {
          quantity,
          toppings: selectedToppingsArray,
          specialInstructions: cartItem.specialInstructions
        });
        showSuccessToast(
          t('cart.item.updated', { 
            name: product.name
          })
        );
      } else {
        // Add new item to cart
        addItem(product, quantity, selectedToppingsArray);
        const totalPrice = calculateTotalPrice();
        showSuccessToast(
          `Added ${product.name} to cart (${formatPrice(totalPrice, locale)})`
        );
      }
      onClose();
    } catch (error) {
      console.error('Error handling product customization:', error);
      showErrorToast(
        isEditing 
          ? t('cart.item.updateFailed')
          : t('product.errors.addToCartFailed')
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col relative shadow-xl">
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto smooth-scroll p-6">
          {/* Product Name */}
          <h2 className="text-xl font-bold text-gray-900 mb-4 pr-8">{product.name}</h2>

          {/* Product Image - Square */}
          <div className="aspect-square w-full max-w-xs mx-auto rounded-lg mb-6 relative overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder-food.svg';
              }}
            />
            {/* Badge overlay */}
            {product.badge && (
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-responsive-sm font-medium text-white ${
                  product.badge.type === 'promotion' ? 'bg-red-500' :
                  product.badge.type === 'new' ? 'bg-green-500' :
                  'bg-yellow-500'
                }`}>
                  {product.badge.text}
                </span>
              </div>
            )}
          </div>

          {/* Product Price */}
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-2xl font-bold text-primary-600">
              {formatPrice(product.price, locale)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice, locale)}
              </span>
            )}
          </div>

          {/* Product Description */}
          {product.description && product.description.trim() !== '' && (
            <div className="mb-6">
              <ExpandableText
                text={product.description}
                maxLength={150}
                className="text-sm text-gray-600 leading-relaxed"
                expandLabel="Read more"
                collapseLabel="Show less"
              />
            </div>
          )}

          {/* Divider before customization options */}
          {product.description && product.description.trim() !== '' && product.hasToppings && product.attributeLines && product.attributeLines.length > 0 && (
            <hr className="my-6 border-gray-200" />
          )}

          {/* Toppings/Attributes Section */}
          {product.hasToppings && product.attributeLines && product.attributeLines.length > 0 && (
            <div className="mb-20">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Customize Your Order</h3>
              {product.attributeLines.map(attributeLine => (
                <div key={attributeLine.attribute_id} className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">{attributeLine.attribute_name}</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {attributeLine.values.map(value => {
                      const isSelected = selectedToppings[attributeLine.attribute_id]?.includes(value.id.toString()) || false;
                      return (
                        <label 
                          key={value.id} 
                          className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all touch-manipulation min-h-[44px] ${
                            isSelected 
                              ? 'border-primary-500 bg-primary-50 shadow-sm' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center flex-1">
                            <div className={`relative w-5 h-5 mr-3 flex-shrink-0 ${
                              attributeLine.display_type === 'radio' ? 'rounded-full' : 'rounded'
                            } border-2 transition-colors ${
                              isSelected 
                                ? 'border-primary-500 bg-primary-500' 
                                : 'border-gray-300 bg-white'
                            }`}>
                              {isSelected && (
                                <svg 
                                  className="absolute inset-0 w-full h-full p-0.5 text-white" 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                </svg>
                              )}
                            </div>
                            <input
                              type={attributeLine.display_type === 'radio' ? 'radio' : 'checkbox'}
                              name={`attribute_${attributeLine.attribute_id}`}
                              checked={isSelected}
                              onChange={() => handleToppingSelect(attributeLine.attribute_id, value.id.toString(), attributeLine.display_type)}
                              className="sr-only"
                            />
                            <span className={`text-sm ${
                              isSelected ? 'font-medium text-gray-900' : 'text-gray-700'
                            }`}>
                              {value.name}
                            </span>
                          </div>
                          {value.price_extra > 0 && (
                            <span className={`text-sm font-semibold ml-2 ${
                              isSelected ? 'text-primary-600' : 'text-gray-600'
                            }`}>
                              +{formatPrice(value.price_extra, locale)}
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
          <div className="responsive-flex-center justify-between gap-responsive">
            {/* Quantity Controls */}
            <div className="flex items-center space-responsive">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 touch-manipulation"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-lg font-semibold w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 touch-manipulation"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            {/* Add to Cart / Update Button */}
            <Button
              onClick={handleSubmit}
              className="responsive-button flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white"
            >
              {isEditing ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('common.actions.save')} {formatPrice(product.hasToppings ? calculateTotalPrice() : product.price * quantity, locale)}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5 1.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  {formatPrice(product.hasToppings ? calculateTotalPrice() : product.price * quantity, locale)}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}