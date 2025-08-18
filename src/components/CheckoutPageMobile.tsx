'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { OrderInfoModal } from '@/components/modals/OrderInfoModal';
import { useCartStore, useUIStore } from '@/stores';
import { orderFirestoreService } from '@/services/orderFirestoreService';
import { CreateOrderData, OrderItem } from '@/types/order';

interface CheckoutFormData {
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  deliveryInstructions?: string;
  paymentMethod: 'cash' | 'card' | 'momo' | 'zalopay';
  specialInstructions?: string;
}

// Helper function to get localized product name
const getLocalizedProductName = (product: any, locale: string): string => {
  if (typeof product.name === 'string') {
    return product.name;
  }
  if (typeof product.name === 'object' && product.name) {
    return product.name[locale] || product.name.vi || product.name.en || Object.values(product.name)[0] || 'Unknown Product';
  }
  return 'Unknown Product';
};

export function CheckoutPageMobile() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  // State
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [showOrderInfoModal, setShowOrderInfoModal] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    paymentMethod: 'cash'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Store state
  const {
    items,
    summary,
    orderType,
    tableNumber,
    deliveryAddress,
    isMinimumOrderMet,
    getItemCount,
    clearCart
  } = useCartStore();
  
  const { showErrorToast, showSuccessToast } = useUIStore();
  
  const itemCount = getItemCount();
  const hasItems = items.length > 0;

  // Handle redirects
  useEffect(() => {
    if (orderSubmitted) return;
    
    if (!hasItems || !orderType) {
      router.push('/cart');
      return;
    }
    
    if (orderType === 'delivery' && !isMinimumOrderMet()) {
      router.push('/cart');
      return;
    }
  }, [hasItems, orderType, isMinimumOrderMet, router, orderSubmitted]);

  // Early return while redirecting
  if (!orderSubmitted && (!hasItems || !orderType || (orderType === 'delivery' && !isMinimumOrderMet()))) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleFormDataChange = (updates: Partial<CheckoutFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmitOrder = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate form data
      if (!formData.customerName?.trim()) {
        showErrorToast('Please enter your name');
        return;
      }

      if (orderType === 'delivery') {
        if (!formData.phone?.trim() || !formData.address?.trim()) {
          showErrorToast('Please fill in all delivery information');
          return;
        }
      }

      // Convert cart items to order items
      const orderItems: OrderItem[] = items.map(item => ({
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: item.totalPrice,
        category: item.product.category || 'Unknown',
        toppings: item.toppings.map(topping => ({
          id: topping.id.toString(),
          name: topping.name,
          price: topping.price
        })),
        specialInstructions: item.specialInstructions
      }));

      // Create order data
      const orderData: CreateOrderData = {
        type: orderType,
        customer: {
          name: formData.customerName,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
        },
        tableNumber: orderType === 'table' ? tableNumber : undefined,
        delivery: orderType === 'delivery' ? {
          address: formData.address || deliveryAddress || '',
          instructions: formData.deliveryInstructions || undefined
        } : undefined,
        items: orderItems,
        summary: {
          subtotal: summary.subtotal,
          deliveryFee: summary.deliveryFee,
          total: summary.total,
          itemCount: summary.itemCount
        },
        paymentMethod: formData.paymentMethod,
        specialInstructions: formData.specialInstructions || undefined
      };

      // Submit order
      const orderId = await orderFirestoreService.createOrder(orderData);
      
      // Mark as submitted and clear cart
      setOrderSubmitted(true);
      clearCart();
      
      showSuccessToast('Order placed successfully!');
      
      // Redirect to success page or order tracking
      router.push(`/order/${orderId}`);
      
    } catch (error) {
      console.error('Failed to submit order:', error);
      showErrorToast('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Simplified Mobile Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4">
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
                  Checkout
                </h1>
                <p className="text-xs text-gray-600 md:text-sm">
                  {itemCount} items • {formatPrice(summary.total)}₫
                </p>
              </div>
            </div>

            <div className="hidden sm:block">
              <LanguageSelector variant="dropdown" />
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        <div className="space-y-4">
          {/* Order Info - Compact */}
          <Card padding="sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  Order Information
                </h3>
                <p className="text-xs text-gray-600">
                  {orderType === 'table' 
                    ? `Table ${tableNumber || '1'}`
                    : 'Home Delivery'
                  }
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOrderInfoModal(true)}
                className="text-xs px-2 py-1 h-7"
              >
                Change
              </Button>
            </div>
          </Card>

          {/* Customer Information */}
          <Card padding="sm">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Customer Information
              </h3>
              
              {/* Customer Name */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName || ''}
                  onChange={(e) => handleFormDataChange({ customerName: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Phone Number - always shown */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  Phone {orderType === 'delivery' ? '*' : '(Optional)'}
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleFormDataChange({ phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Delivery-specific fields */}
              {orderType === 'delivery' && (
                <>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      Delivery Address *
                    </label>
                    <textarea
                      value={formData.address || deliveryAddress || ''}
                      onChange={(e) => handleFormDataChange({ address: e.target.value })}
                      placeholder="Enter complete address"
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      Delivery Notes
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryInstructions || ''}
                      onChange={(e) => handleFormDataChange({ deliveryInstructions: e.target.value })}
                      placeholder="Special delivery instructions"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Payment Method */}
          <Card padding="sm">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Payment Method
              </h3>
              
              <div className="space-y-2">
                {['cash', 'card', 'momo', 'zalopay'].map((method) => (
                  <label
                    key={method}
                    className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.paymentMethod === method
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={formData.paymentMethod === method}
                      onChange={(e) => handleFormDataChange({ paymentMethod: e.target.value as any })}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium capitalize">{method}</div>
                      {method === 'cash' && (
                        <div className="text-xs text-gray-500">Pay when order is ready</div>
                      )}
                    </div>
                    {formData.paymentMethod === method && (
                      <div className="text-primary-600">✓</div>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </Card>

          {/* Special Instructions */}
          <Card padding="sm">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Special Instructions
              </h3>
              <textarea
                value={formData.specialInstructions || ''}
                onChange={(e) => handleFormDataChange({ specialInstructions: e.target.value })}
                placeholder="Any special requests for your order..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </Card>
        </div>
      </main>

      {/* Sticky Bottom Order Button */}
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
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              {summary.deliveryFee > 0 && (
                <p className="text-xs text-gray-600">
                  + {formatPrice(summary.deliveryFee)}₫ delivery
                </p>
              )}
            </div>
          </div>

          {/* Place Order Button */}
          <Button
            onClick={handleSubmitOrder}
            disabled={
              isSubmitting ||
              !formData.customerName?.trim() ||
              (orderType === 'delivery' && (!formData.phone?.trim() || !formData.address?.trim()))
            }
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Placing Order...</span>
              </div>
            ) : (
              `Place Order • ${formatPrice(summary.total)}₫`
            )}
          </Button>
          
          {/* Estimated Time */}
          <div className="flex items-center justify-center mt-2">
            <svg className="w-3 h-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-gray-600">
              {orderType === 'delivery' 
                ? 'Ready for delivery in 30-45 minutes'
                : 'Ready for pickup in 15-20 minutes'
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