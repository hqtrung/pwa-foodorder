'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { CheckoutPageLayout } from '@/components/layout/PageLayout';
import { CollapsibleSection } from '@/components/checkout/CollapsibleSection';
import { CheckoutProgress, useCheckoutProgress } from '@/components/checkout/CheckoutProgress';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { CartSummary } from '@/components/cart/CartSummary';
import { OrderInfoModal } from '@/components/modals/OrderInfoModal';
import { useCartStore, useUIStore } from '@/stores';
import { orderFirestoreService } from '@/services/orderFirestoreService';
import { CreateOrderData, OrderItem } from '@/types/order';
import { formatPrice, getLocalizedProductName } from '@/lib/common-utils';
import { cn } from '@/lib/common-utils';

interface UnifiedCheckoutFormData {
  tableNumber?: string;
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  deliveryInstructions?: string;
  paymentMethod?: 'cash' | 'card' | 'momo' | 'zalopay';
  specialInstructions?: string;
}

export function UnifiedCheckoutPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  // State
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [showOrderInfoModal, setShowOrderInfoModal] = useState(false);
  const [showCartDetails, setShowCartDetails] = useState(false);
  const [formData, setFormData] = useState<UnifiedCheckoutFormData>({});
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

  // Progress tracking
  const progressSections = useCheckoutProgress(formData, orderType || '');

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

  const handleFormDataChange = (updates: Partial<UnifiedCheckoutFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
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

      // Validate payment method
      if (!formData.paymentMethod) {
        showErrorToast(t('checkout.errors.paymentMethodRequired'));
        return;
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

      if (!orderType) {
        showErrorToast(t('checkout.errors.orderTypeRequired'));
        return;
      }

      // Create order data
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
      
      setOrderSubmitted(true);
      clearCart();
      showSuccessToast(t('checkout.success.orderPlaced', { orderId: orderId.slice(-6).toUpperCase() }));
      router.push(`/order-completed?orderId=${orderId}`);
      
    } catch (error) {
      console.error('Order submission error:', error);
      showErrorToast(t('checkout.errors.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate if order can be submitted
  const canSubmitOrder = (() => {
    if (!formData.customerName?.trim()) return false;
    if (orderType === 'delivery' && (!formData.phone?.trim() || !formData.address?.trim())) return false;
    return true;
  })();

  return (
    <CheckoutPageLayout className="pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto">
        
        {/* Mobile Layout */}
        <div className="lg:hidden space-y-4">
          
          {/* Progress Header */}
          <Card className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm">
            <CheckoutProgress 
              sections={progressSections} 
              showLabels 
              variant="bar"
            />
          </Card>

          {/* Order Type Info */}
          <CollapsibleSection
            title={t('checkout.orderInfo.title')}
            completed={true}
            icon={orderType === 'table' ? 
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg> :
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
              </svg>
            }
            description={orderType === 'table' 
              ? t('checkout.orderInfo.table', { number: tableNumber || '1' })
              : t('checkout.orderInfo.delivery')
            }
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOrderInfoModal(true)}
                className="text-xs px-2 py-1 h-7"
              >
                {t('checkout.orderInfo.change')}
              </Button>
            }
          />

          {/* Cart Items */}
          <CollapsibleSection
            title={`${t('cart.items.title')} (${itemCount})`}
            completed={true}
            defaultExpanded={showCartDetails}
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            }
            description={`${formatPrice(summary.total, locale)} • ${t('cart.reviewItems')}`}
          >
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {getLocalizedProductName(item.product, locale)}
                    </h4>
                    {item.toppings.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        + {item.toppings.map(t => t.name).join(', ')}
                      </p>
                    )}
                    {item.specialInstructions && (
                      <p className="text-xs text-gray-600 mt-1 italic">
                        "{item.specialInstructions}"
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">×{item.quantity}</p>
                    <p className="text-sm text-gray-900">{formatPrice(item.totalPrice, locale)}</p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3">
                <CartSummary showCheckoutButton={false} />
              </div>
            </div>
          </CollapsibleSection>

          {/* Customer Information */}
          <CollapsibleSection
            title={t('checkout.customerInfo.title')}
            completed={progressSections.customer.completed}
            required={progressSections.customer.required}
            defaultExpanded={!progressSections.customer.completed}
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            }
          >
            <div className="space-y-4">
              <Input
                label={`${t('checkout.form.customerName')} *`}
                type="text"
                inputMode="text"
                autoComplete="name"
                value={formData.customerName || ''}
                onChange={(e) => handleFormDataChange({ customerName: e.target.value })}
                placeholder={t('checkout.form.customerNamePlaceholder')}
                className="touch-manipulation"
                required
              />

              <Input
                label={orderType === 'delivery' 
                  ? `${t('checkout.form.phone')} *`
                  : t('checkout.form.phone')
                }
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={formData.phone || ''}
                onChange={(e) => handleFormDataChange({ phone: e.target.value })}
                placeholder={t('checkout.form.phonePlaceholder')}
                className="touch-manipulation"
                required={orderType === 'delivery'}
              />

              <Input
                label={t('checkout.form.email')}
                type="email"
                inputMode="email"
                autoComplete="email"
                value={formData.email || ''}
                onChange={(e) => handleFormDataChange({ email: e.target.value })}
                placeholder={t('checkout.form.emailPlaceholder')}
                className="touch-manipulation"
              />
            </div>
          </CollapsibleSection>

          {/* Delivery Details (conditional) */}
          {orderType === 'delivery' && (
            <CollapsibleSection
              title={t('checkout.deliveryAddress.title')}
              completed={progressSections.delivery.completed}
              required={progressSections.delivery.required}
              defaultExpanded={!progressSections.delivery.completed}
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              }
            >
              <div className="space-y-4">
                <Input
                  label={`${t('checkout.form.address')} *`}
                  as="textarea"
                  autoComplete="street-address"
                  value={formData.address || ''}
                  onChange={(e) => handleFormDataChange({ address: e.target.value })}
                  placeholder={t('checkout.form.addressPlaceholder')}
                  rows={3}
                  className="touch-manipulation"
                  required
                />

                <Input
                  label={t('checkout.form.deliveryInstructions')}
                  type="text"
                  value={formData.deliveryInstructions || ''}
                  onChange={(e) => handleFormDataChange({ deliveryInstructions: e.target.value })}
                  placeholder={t('checkout.form.deliveryInstructionsPlaceholder')}
                  className="touch-manipulation"
                />
              </div>
            </CollapsibleSection>
          )}

          {/* Payment Method */}
          <CollapsibleSection
            title={t('checkout.paymentMethod.title')}
            completed={progressSections.payment.completed}
            required={progressSections.payment.required}
            defaultExpanded={!progressSections.payment.completed}
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            }
          >
            <PaymentMethodSelector
              selected={formData.paymentMethod}
              onChange={(method) => handleFormDataChange({ paymentMethod: method })}
              orderType={orderType || undefined}
            />
          </CollapsibleSection>

          {/* Special Instructions */}
          <CollapsibleSection
            title={t('checkout.specialInstructions.title')}
            completed={progressSections.instructions.completed}
            required={false}
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            }
          >
            <Input
              as="textarea"
              placeholder={t('checkout.specialInstructions.placeholder')}
              value={formData.specialInstructions || ''}
              onChange={(e) => handleFormDataChange({ specialInstructions: e.target.value })}
              helperText={t('checkout.specialInstructions.hint')}
              rows={3}
              className="touch-manipulation"
            />
          </CollapsibleSection>

          {/* Sticky Bottom Action */}
          <div className="sticky-bottom-mobile bg-white border-t border-gray-200 shadow-lg safe-area-padding-bottom">
            <div className="padding-responsive">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(summary.total, locale)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {itemCount} {t(itemCount === 1 ? 'common.item' : 'common.items')}
                    {summary.deliveryFee > 0 && (
                      <span> • +{formatPrice(summary.deliveryFee, locale)} delivery</span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmitOrder}
                disabled={isSubmitting || !canSubmitOrder}
                className="w-full min-h-[44px] text-base font-semibold"
                loading={isSubmitting}
              >
                {isSubmitting 
                  ? t('checkout.placingOrder')
                  : `${t('checkout.placeOrder')} • ${formatPrice(summary.total, locale)}`
                }
              </Button>
              
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-3 gap-8">
            {/* Main Form Content */}
            <div className="col-span-2 space-y-6">
              
              {/* Progress Header */}
              <Card>
                <CheckoutProgress 
                  sections={progressSections} 
                  showLabels 
                  variant="bar"
                />
              </Card>

              {/* Order Type */}
              <CollapsibleSection
                title={t('checkout.orderInfo.title')}
                completed={true}
                defaultExpanded={false}
                icon={orderType === 'table' ? 
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg> :
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                  </svg>
                }
                description={orderType === 'table' 
                  ? t('checkout.orderInfo.table', { number: tableNumber || '1' })
                  : t('checkout.orderInfo.delivery')
                }
                actions={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOrderInfoModal(true)}
                    className="text-sm px-3 py-1"
                  >
                    {t('checkout.orderInfo.change')}
                  </Button>
                }
              >
                <div className="text-sm text-gray-600">
                  {orderType === 'table' 
                    ? t('checkout.tableInfo.instructions.description')
                    : t('checkout.deliveryInfo.notice.description')
                  }
                </div>
              </CollapsibleSection>

              {/* Customer Information */}
              <CollapsibleSection
                title={t('checkout.customerInfo.title')}
                completed={progressSections.customer.completed}
                required={progressSections.customer.required}
                defaultExpanded={!progressSections.customer.completed}
                icon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                }
              >
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={`${t('checkout.form.customerName')} *`}
                    type="text"
                    inputMode="text"
                    autoComplete="name"
                    value={formData.customerName || ''}
                    onChange={(e) => handleFormDataChange({ customerName: e.target.value })}
                    placeholder={t('checkout.form.customerNamePlaceholder')}
                    required
                  />

                  <Input
                    label={orderType === 'delivery' 
                      ? `${t('checkout.form.phone')} *`
                      : t('checkout.form.phone')
                    }
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleFormDataChange({ phone: e.target.value })}
                    placeholder={t('checkout.form.phonePlaceholder')}
                    required={orderType === 'delivery'}
                  />

                  <div className="col-span-2">
                    <Input
                      label={t('checkout.form.email')}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={formData.email || ''}
                      onChange={(e) => handleFormDataChange({ email: e.target.value })}
                      placeholder={t('checkout.form.emailPlaceholder')}
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* Delivery Details */}
              {orderType === 'delivery' && (
                <CollapsibleSection
                  title={t('checkout.deliveryAddress.title')}
                  completed={progressSections.delivery.completed}
                  required={progressSections.delivery.required}
                  defaultExpanded={!progressSections.delivery.completed}
                  icon={
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  <div className="space-y-4">
                    <Input
                      label={`${t('checkout.form.address')} *`}
                      as="textarea"
                      autoComplete="street-address"
                      value={formData.address || ''}
                      onChange={(e) => handleFormDataChange({ address: e.target.value })}
                      placeholder={t('checkout.form.addressPlaceholder')}
                      rows={3}
                      required
                    />

                    <Input
                      label={t('checkout.form.deliveryInstructions')}
                      type="text"
                      value={formData.deliveryInstructions || ''}
                      onChange={(e) => handleFormDataChange({ deliveryInstructions: e.target.value })}
                      placeholder={t('checkout.form.deliveryInstructionsPlaceholder')}
                    />
                  </div>
                </CollapsibleSection>
              )}

              {/* Payment Method */}
              <CollapsibleSection
                title={t('checkout.paymentMethod.title')}
                completed={progressSections.payment.completed}
                required={progressSections.payment.required}
                defaultExpanded={!progressSections.payment.completed}
                icon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                }
              >
                <PaymentMethodSelector
                  selected={formData.paymentMethod}
                  onChange={(method) => handleFormDataChange({ paymentMethod: method })}
                  orderType={orderType || undefined}
                />
              </CollapsibleSection>

              {/* Special Instructions */}
              <CollapsibleSection
                title={t('checkout.specialInstructions.title')}
                completed={progressSections.instructions.completed}
                required={false}
                icon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                }
              >
                <Input
                  as="textarea"
                  placeholder={t('checkout.specialInstructions.placeholder')}
                  value={formData.specialInstructions || ''}
                  onChange={(e) => handleFormDataChange({ specialInstructions: e.target.value })}
                  helperText={t('checkout.specialInstructions.hint')}
                  rows={3}
                />
              </CollapsibleSection>
            </div>

            {/* Sidebar */}
            <div className="col-span-1">
              <div className="sticky top-24 space-y-6">
                
                {/* Order Summary */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('cart.summary.title')}
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{itemCount} {t(itemCount === 1 ? 'common.item' : 'common.items')}</span>
                      <button 
                        onClick={() => setShowCartDetails(!showCartDetails)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {showCartDetails ? t('cart.hideDetails') : t('cart.showDetails')}
                      </button>
                    </div>
                    
                    {showCartDetails && (
                      <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.quantity}× {getLocalizedProductName(item.product, locale)}</span>
                            <span>{formatPrice(item.totalPrice, locale)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <CartSummary showCheckoutButton={false} />
                </Card>

                {/* Place Order Button */}
                <Button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || !canSubmitOrder}
                  className="w-full text-lg font-semibold py-4"
                  loading={isSubmitting}
                >
                  {isSubmitting 
                    ? t('checkout.placingOrder')
                    : `${t('checkout.placeOrder')} • ${formatPrice(summary.total, locale)}`
                  }
                </Button>

              </div>
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