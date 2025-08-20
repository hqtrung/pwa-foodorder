'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { CheckoutPageLayout } from '@/components/layout/PageLayout';
import { OrderInfoModal } from '@/components/modals/OrderInfoModal';
import { TableCheckoutForm } from '@/components/checkout/TableCheckoutForm';
import { DeliveryCheckoutForm } from '@/components/checkout/DeliveryCheckoutForm';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { CartSummary } from '@/components/cart/CartSummary';
import { useCartStore, useUIStore } from '@/stores';
import { orderFirestoreService } from '@/services/orderFirestoreService';
import { CreateOrderData, OrderItem } from '@/types/order';
import { formatPrice, getLocalizedProductName } from '@/lib/common-utils';

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
              <h2 className="text-responsive-xl font-semibold text-gray-900 mb-4">
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
              <h2 className="text-responsive-xl font-semibold text-gray-900 mb-4">
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
              <h2 className="text-responsive-xl font-semibold text-gray-900 mb-4">
                {t('checkout.steps.review.title')}
              </h2>
              
              {/* Order Review */}
              <div className="space-y-4">
                {/* Customer Info */}
                <Card className="responsive-card">
                  <h3 className="text-responsive-base font-semibold text-gray-900 mb-3">
                    {orderType === 'table' 
                      ? t('checkout.review.tableInfo')
                      : t('checkout.review.deliveryInfo')
                    }
                  </h3>
                  
                  <div className="form-group-responsive text-responsive-sm">
                    {orderType === 'table' ? (
                      <>
                        <div className="responsive-flex-center justify-between">
                          <span className="text-gray-600">{t('checkout.form.table')}:</span>
                          <span>{tableNumber}</span>
                        </div>
                        <div className="responsive-flex-center justify-between">
                          <span className="text-gray-600">{t('checkout.form.customerName')}:</span>
                          <span>{formData.customerName}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="responsive-flex-center justify-between">
                          <span className="text-gray-600">{t('checkout.form.customerName')}:</span>
                          <span>{formData.customerName}</span>
                        </div>
                        <div className="responsive-flex-center justify-between">
                          <span className="text-gray-600">{t('checkout.form.phone')}:</span>
                          <span>{formData.phone}</span>
                        </div>
                        {formData.email && (
                          <div className="responsive-flex-center justify-between">
                            <span className="text-gray-600">{t('checkout.form.email')}:</span>
                            <span>{formData.email}</span>
                          </div>
                        )}
                        <div className="responsive-flex-center justify-between">
                          <span className="text-gray-600">{t('checkout.form.address')}:</span>
                          <span className="text-right">{formData.address}</span>
                        </div>
                        {formData.deliveryInstructions && (
                          <div className="responsive-flex-center justify-between">
                            <span className="text-gray-600">{t('checkout.form.deliveryInstructions')}:</span>
                            <span className="text-right">{formData.deliveryInstructions}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Card>

                {/* Payment Method */}
                <Card className="responsive-card">
                  <h3 className="text-responsive-base font-semibold text-gray-900 mb-3">
                    {t('checkout.review.paymentMethod')}
                  </h3>
                  <div className="responsive-flex-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      {formData.paymentMethod === 'cash' && '💵'}
                      {formData.paymentMethod === 'card' && '💳'}
                      {formData.paymentMethod === 'momo' && '📱'}
                      {formData.paymentMethod === 'zalopay' && '💰'}
                    </div>
                    <span className="text-responsive-base font-medium">
                      {t(`checkout.payment.methods.${formData.paymentMethod}`)}
                    </span>
                  </div>
                </Card>

                {/* Order Summary */}
                <Card className="responsive-card">
                  <h3 className="text-responsive-base font-semibold text-gray-900 mb-3">
                    {t('checkout.review.orderSummary')}
                  </h3>
                  <div className="form-group-responsive">
                    {items.map((item) => (
                      <div key={item.id} className="responsive-flex-center justify-between text-responsive-sm">
                        <span>
                          {item.quantity}x {getLocalizedProductName(item.product, locale)}
                        </span>
                        <span>{formatPrice(item.totalPrice, locale)}</span>
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
    <CheckoutPageLayout className="pb-20 md:pb-0">
      {/* Mobile/Responsive Single Page Layout */}
      <div className="lg:hidden">
        <div className="space-y-4">
          {/* Order Info - Compact */}
          <Card className="responsive-card">
            <div className="responsive-flex-center justify-between">
              <div className="flex-1">
                <h3 className="text-responsive-sm font-semibold text-gray-900">
                  {t('checkout.orderInfo.title')}
                </h3>
                <p className="text-responsive-xs text-gray-600">
                  {orderType === 'table' 
                    ? t('checkout.orderInfo.table', { number: tableNumber || '1' })
                    : t('checkout.orderInfo.delivery')
                  }
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOrderInfoModal(true)}
                className="responsive-button text-xs px-2 py-1 h-7 touch-manipulation"
              >
                {t('checkout.orderInfo.change')}
              </Button>
            </div>
          </Card>

          {/* Customer Information */}
          <Card className="responsive-card">
            <div className="form-group-responsive">
              <h3 className="text-responsive-sm font-semibold text-gray-900">
                {t('checkout.customerInfo.title')}
              </h3>
                
              {/* Customer Name */}
              <Input
                label={t('checkout.customerInfo.nameRequired')}
                type="text"
                inputMode="text"
                autoComplete="name"
                value={formData.customerName || ''}
                onChange={(e) => handleFormDataChange({ customerName: e.target.value })}
                placeholder={t('checkout.customerInfo.namePlaceholder')}
                className="touch-manipulation"
                required
              />

              {/* Phone Number */}
              <Input
                label={orderType === 'delivery' 
                  ? t('checkout.customerInfo.phoneRequired')
                  : t('checkout.customerInfo.phoneOptional')
                }
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={formData.phone || ''}
                onChange={(e) => handleFormDataChange({ phone: e.target.value })}
                placeholder={t('checkout.customerInfo.phonePlaceholder')}
                className="touch-manipulation"
                required={orderType === 'delivery'}
              />

              {/* Delivery-specific fields */}
              {orderType === 'delivery' && (
                <>
                  <Input
                    label={t('checkout.delivery.addressRequired')}
                    as="textarea"
                    autoComplete="street-address"
                    value={formData.address || ''}
                    onChange={(e) => handleFormDataChange({ address: e.target.value })}
                    placeholder={t('checkout.delivery.addressPlaceholder')}
                    rows={2}
                    className="touch-manipulation"
                    required
                  />

                  <Input
                    label={t('checkout.delivery.notes')}
                    type="text"
                    value={formData.deliveryInstructions || ''}
                    onChange={(e) => handleFormDataChange({ deliveryInstructions: e.target.value })}
                    placeholder={t('checkout.delivery.notesPlaceholder')}
                    className="touch-manipulation"
                  />
                </>
              )}
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="responsive-card">
            <div className="form-group-responsive">
              <h3 className="text-responsive-sm font-semibold text-gray-900">
                {t('checkout.paymentMethod.title')}
              </h3>
              
              <div className="space-y-2">
                {['cash', 'card', 'momo', 'zalopay'].map((method) => (
                  <label
                    key={method}
                    className={`responsive-flex-center space-x-3 responsive-card cursor-pointer touch-manipulation transition-colors ${
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
                      onChange={(e) => handleFormDataChange({ paymentMethod: e.target.value as CheckoutFormData['paymentMethod'] })}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div className="flex-1">
                      <div className="text-responsive-sm font-medium">{t(`checkout.payment.methods.${method}`)}</div>
                      {method === 'cash' && (
                        <div className="text-responsive-xs text-gray-500">{t('checkout.paymentMethod.cashDescription')}</div>
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
          <Card className="responsive-card">
            <Input
              label={t('checkout.specialInstructions.title')}
              as="textarea"
              value={formData.specialInstructions || ''}
              onChange={(e) => handleFormDataChange({ specialInstructions: e.target.value })}
              placeholder={t('checkout.specialInstructions.placeholder')}
              rows={2}
              className="touch-manipulation"
            />
          </Card>
        </div>

        {/* Sticky Bottom Order Button - Mobile Only */}
        <div className="sticky-bottom-mobile bg-white border-t border-gray-200 shadow-lg">
          <div className="padding-responsive">
            {/* Order Summary - Compact */}
            <div className="responsive-flex-center justify-between mb-3">
              <div className="flex-1">
                <div className="responsive-flex-center space-x-2">
                  <span className="text-responsive-lg font-bold text-gray-900">
                    {formatPrice(summary.total, locale)}
                  </span>
                  <span className="text-responsive-xs text-gray-500">
                    {itemCount} {t(itemCount === 1 ? 'common.item' : 'common.items')}
                  </span>
                </div>
                {summary.deliveryFee > 0 && (
                  <p className="text-responsive-xs text-gray-600">
                    + {formatPrice(summary.deliveryFee, locale)} delivery
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
              className="responsive-button-lg w-full touch-manipulation"
            >
              {isSubmitting ? (
                <div className="responsive-flex-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t('checkout.placingOrder')}</span>
                </div>
              ) : (
                `${t('checkout.placeOrder')} • ${formatPrice(summary.total, locale)}`
              )}
            </Button>
            
          </div>
        </div>
      </div>


      {/* Desktop Multi-step Layout */}
      <div className="hidden lg:block">
        {/* Progress Bar */}
        <div className="padding-responsive-y border-b border-gray-200">
          <div className="responsive-flex-center justify-between text-responsive-sm text-gray-600 mb-2">
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

        <div className="responsive-grid-3 gap-responsive margin-responsive-y">
          {/* Form Content */}
          <div className="lg:col-span-2">
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="form-actions-responsive border-t border-gray-200 pt-6 mt-6">
              <div>
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                    className="responsive-button"
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
                    className="responsive-button"
                  >
                    {t('checkout.navigation.next')}
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                    className="responsive-button min-w-32"
                  >
                    {isSubmitting ? (
                      <div className="responsive-flex-center space-x-2">
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
              <Card className="responsive-card">
                <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">
                  {t('cart.summary.title')}
                </h3>
                <div className="form-group-responsive text-responsive-sm mb-4">
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
      </div>
      
      {/* Order Info Modal */}
      <OrderInfoModal
        isOpen={showOrderInfoModal}
        onClose={() => setShowOrderInfoModal(false)}
      />
    </CheckoutPageLayout>
  );
}