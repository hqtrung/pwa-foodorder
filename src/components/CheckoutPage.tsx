'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { OrderInfoModal } from '@/components/modals/OrderInfoModal';
import { TableCheckoutForm } from '@/components/checkout/TableCheckoutForm';
import { DeliveryCheckoutForm } from '@/components/checkout/DeliveryCheckoutForm';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { CartSummary } from '@/components/cart/CartSummary';
import { useCartStore, useUIStore } from '@/stores';
import { orderFirestoreService } from '@/services/orderFirestoreService';
import { CreateOrderData, OrderItem } from '@/types/order';

interface CheckoutFormData {
  tableNumber?: string;
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

export function CheckoutPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
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
    isMinimumOrderMet,
    getItemCount,
    clearCart
  } = useCartStore();
  
  const { showErrorToast, showSuccessToast } = useUIStore();
  
  const itemCount = getItemCount();
  const hasItems = items.length > 0;

  // Handle redirects in useEffect to avoid render-time navigation
  useEffect(() => {
    // Don't redirect if order was already submitted
    if (orderSubmitted) {
      return;
    }
    
    // Redirect if no items or order type
    if (!hasItems || !orderType) {
      router.push('/cart');
      return;
    }
    
    // Check minimum order for delivery
    if (orderType === 'delivery' && !isMinimumOrderMet()) {
      router.push('/cart');
      return;
    }
  }, [hasItems, orderType, isMinimumOrderMet, router, orderSubmitted]);

  // Early return to prevent rendering while redirecting (but not if order was submitted)
  if (!orderSubmitted && (!hasItems || !orderType || (orderType === 'delivery' && !isMinimumOrderMet()))) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleFormDataChange = (updates: Partial<CheckoutFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Step navigation
  const handleNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmitOrder = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate form data
      if (orderType === 'table') {
        if (!formData.customerName?.trim()) {
          showErrorToast(t('checkout.errors.customerNameRequired'));
          return;
        }
      } else {
        if (!formData.customerName?.trim() || !formData.phone?.trim() || !formData.address?.trim()) {
          showErrorToast(t('checkout.errors.deliveryInfoRequired'));
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

      // Validate orderType is not null
      if (!orderType) {
        showErrorToast(t('checkout.errors.orderTypeRequired'));
        return;
      }

      // Create order data for Firestore
      const orderData: CreateOrderData = {
        type: orderType,
        customer: {
          name: formData.customerName!,
          phone: formData.phone,
          email: formData.email
        },
        tableNumber: orderType === 'table' ? tableNumber : undefined,
        delivery: orderType === 'delivery' ? {
          address: formData.address!,
          instructions: formData.deliveryInstructions
        } : undefined,
        items: orderItems,
        summary,
        paymentMethod: formData.paymentMethod,
        specialInstructions: formData.specialInstructions
      };

      // Save order to Firestore
      const orderId = await orderFirestoreService.createOrder(orderData);
      console.log('✅ Order created successfully with ID:', orderId);
      
      // Mark order as submitted to prevent cart validation redirects
      setOrderSubmitted(true);
      
      // Clear cart and redirect to order completed page
      clearCart();
      showSuccessToast(t('checkout.success.orderPlaced', { orderId: orderId.slice(-6).toUpperCase() }));
      console.log('🔄 Redirecting to order-completed page with order ID:', orderId);
      router.push(`/order-completed?orderId=${orderId}`);
      
    } catch (error) {
      console.error('Order submission error:', error);
      showErrorToast(t('checkout.errors.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {orderType === 'table' 
                  ? t('checkout.steps.tableInfo.title')
                  : t('checkout.steps.deliveryInfo.title')
                }
              </h2>
              
              {orderType === 'table' ? (
                <TableCheckoutForm
                  data={formData}
                  onChange={handleFormDataChange}
                  tableNumber={tableNumber}
                />
              ) : (
                <DeliveryCheckoutForm
                  data={formData}
                  onChange={handleFormDataChange}
                />
              )}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('checkout.steps.payment.title')}
              </h2>
              
              <PaymentMethodSelector
                selected={formData.paymentMethod}
                onChange={(method) => handleFormDataChange({ paymentMethod: method })}
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('checkout.steps.review.title')}
              </h2>
              
              {/* Order Review */}
              <div className="space-y-4">
                {/* Customer Info */}
                <Card padding="md">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {orderType === 'table' 
                      ? t('checkout.review.tableInfo')
                      : t('checkout.review.deliveryInfo')
                    }
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    {orderType === 'table' ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('checkout.form.table')}:</span>
                          <span>{tableNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('checkout.form.customerName')}:</span>
                          <span>{formData.customerName}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('checkout.form.customerName')}:</span>
                          <span>{formData.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('checkout.form.phone')}:</span>
                          <span>{formData.phone}</span>
                        </div>
                        {formData.email && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('checkout.form.email')}:</span>
                            <span>{formData.email}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('checkout.form.address')}:</span>
                          <span className="text-right">{formData.address}</span>
                        </div>
                        {formData.deliveryInstructions && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('checkout.form.deliveryInstructions')}:</span>
                            <span className="text-right">{formData.deliveryInstructions}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Card>

                {/* Payment Method */}
                <Card padding="md">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {t('checkout.review.paymentMethod')}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      {formData.paymentMethod === 'cash' && '💵'}
                      {formData.paymentMethod === 'card' && '💳'}
                      {formData.paymentMethod === 'momo' && '📱'}
                      {formData.paymentMethod === 'zalopay' && '💰'}
                    </div>
                    <span className="font-medium">
                      {t(`checkout.payment.methods.${formData.paymentMethod}`)}
                    </span>
                  </div>
                </Card>

                {/* Order Summary */}
                <Card padding="md">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {t('checkout.review.orderSummary')}
                  </h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {getLocalizedProductName(item.product, locale)}
                        </span>
                        <span>{formatPrice(item.totalPrice)}₫</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-200 mt-3 pt-3">
                    <CartSummary showCheckoutButton={false} />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return orderType === 'table' 
          ? t('checkout.steps.tableInfo.title')
          : t('checkout.steps.deliveryInfo.title');
      case 2:
        return t('checkout.steps.payment.title');
      case 3:
        return t('checkout.steps.review.title');
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="py-2 border-b border-gray-100">
            <Breadcrumb />
          </div>
          
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button and title */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => currentStep > 1 ? handlePreviousStep() : router.back()}
                className="p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {t('checkout.title')}
                </h1>
                <p className="text-sm text-gray-600">
                  {t('checkout.stepProgress', { current: currentStep, total: 3 })}
                </p>
              </div>
            </div>

            {/* Right side - Language selector */}
            <LanguageSelector variant="dropdown" />
          </div>

          {/* Progress Bar */}
          <div className="pb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              {[1, 2, 3].map((step) => (
                <span 
                  key={step}
                  className={`${
                    step <= currentStep ? 'text-primary-600 font-medium' : 'text-gray-400'
                  }`}
                >
                  {getStepTitle(step)}
                </span>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Content */}
          <div className="lg:col-span-2">
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
              <div>
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                  >
                    {t('checkout.navigation.previous')}
                  </Button>
                )}
              </div>
              
              <div>
                {currentStep < 3 ? (
                  <Button
                    onClick={handleNextStep}
                    disabled={
                      (currentStep === 1 && orderType === 'table' && !formData.customerName) ||
                      (currentStep === 1 && orderType === 'delivery' && (!formData.customerName || !formData.phone || !formData.address))
                    }
                  >
                    {t('checkout.navigation.next')}
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                    className="min-w-32"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{t('checkout.navigation.submitting')}</span>
                      </div>
                    ) : (
                      t('checkout.navigation.placeOrder')
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card padding="md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('cart.summary.title')}
                </h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="text-gray-600">
                    {t('cart.itemCount', { count: itemCount })}
                  </div>
                  <div className="text-gray-600">
                    {orderType === 'table' 
                      ? t('cart.orderInfo.table', { number: tableNumber || '1' })
                      : t('cart.orderInfo.delivery')
                    }
                  </div>
                </div>
                <CartSummary showCheckoutButton={false} />
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}