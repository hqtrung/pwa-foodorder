import { useState, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useCartStore, useUIStore } from '@/stores';
import { orderFirestoreService } from '@/services/orderFirestoreService';
import { CreateOrderData, OrderItem } from '@/types/order';
import { 
  convertCartItemsToOrderItems, 
  validateCheckoutForm, 
  handleApiError 
} from '@/lib/common-utils';

export type CheckoutFormData = {
  tableNumber?: string;
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  deliveryInstructions?: string;
  paymentMethod: 'cash' | 'card' | 'momo' | 'zalopay';
  specialInstructions?: string;
};

export interface UseOrderFlowOptions {
  onOrderComplete?: (orderId: string) => void;
  onOrderError?: (error: string) => void;
}

export interface UseOrderFlowReturn {
  // State
  isSubmitting: boolean;
  orderSubmitted: boolean;
  
  // Actions
  submitOrder: (formData: CheckoutFormData) => Promise<void>;
  resetOrderFlow: () => void;
  
  // Validation
  validateOrder: (formData: CheckoutFormData) => { isValid: boolean; errors: string[] };
}

/**
 * Custom hook for managing order submission flow
 */
export function useOrderFlow({
  onOrderComplete,
  onOrderError
}: UseOrderFlowOptions = {}): UseOrderFlowReturn {
  const t = useTranslations();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  
  // Store state
  const {
    items,
    summary,
    orderType,
    tableNumber,
    isMinimumOrderMet,
    clearCart
  } = useCartStore();
  
  const { showErrorToast, showSuccessToast } = useUIStore();

  const validateOrder = useCallback((formData: CheckoutFormData) => {
    const errors: string[] = [];

    // Check if cart has items
    if (!items || items.length === 0) {
      errors.push(t('checkout.errors.noItems'));
    }

    // Check order type
    if (!orderType) {
      errors.push(t('checkout.errors.noOrderType'));
    }

    // Check minimum order for delivery
    if (orderType === 'delivery' && !isMinimumOrderMet()) {
      errors.push(t('checkout.errors.minimumOrder'));
    }

    // Validate form data
    const formValidation = validateCheckoutForm(formData, orderType!);
    if (!formValidation.isValid) {
      errors.push(...formValidation.errors);
    }

    // Order type specific validations
    if (orderType === 'table') {
      if (!formData.customerName?.trim()) {
        errors.push(t('checkout.errors.customerNameRequired'));
      }
    } else if (orderType === 'delivery') {
      if (!formData.customerName?.trim() || 
          !formData.phone?.trim() || 
          !formData.address?.trim()) {
        errors.push(t('checkout.errors.deliveryInfoRequired'));
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [items, orderType, isMinimumOrderMet, t]);

  const submitOrder = useCallback(async (formData: CheckoutFormData) => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Validate order
      const validation = validateOrder(formData);
      if (!validation.isValid) {
        const errorMessage = validation.errors.join(', ');
        showErrorToast(errorMessage);
        if (onOrderError) {
          onOrderError(errorMessage);
        }
        return;
      }

      // Convert cart items to order items
      const orderItems: OrderItem[] = convertCartItemsToOrderItems(items);

      // Create order data for Firestore
      const orderData: CreateOrderData = {
        type: orderType!,
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

      // Submit order to Firestore
      const orderId = await orderFirestoreService.createOrder(orderData);
      
      console.log('✅ Order created successfully with ID:', orderId);
      
      // Mark order as submitted
      setOrderSubmitted(true);
      
      // Clear cart
      clearCart();
      
      // Show success message
      showSuccessToast(t('checkout.success.orderPlaced', { 
        orderId: orderId.slice(-6).toUpperCase() 
      }));
      
      // Call completion callback
      if (onOrderComplete) {
        onOrderComplete(orderId);
      } else {
        // Default behavior: redirect to order completed page
        console.log('🔄 Redirecting to order-completed page with order ID:', orderId);
        router.push(`/order-completed?orderId=${orderId}`);
      }

    } catch (error) {
      console.error('Order submission error:', error);
      const errorMessage = handleApiError(error);
      showErrorToast(errorMessage);
      
      if (onOrderError) {
        onOrderError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    validateOrder,
    items,
    orderType,
    tableNumber,
    summary,
    clearCart,
    showErrorToast,
    showSuccessToast,
    onOrderComplete,
    onOrderError,
    router,
    t
  ]);

  const resetOrderFlow = useCallback(() => {
    setIsSubmitting(false);
    setOrderSubmitted(false);
  }, []);

  return {
    isSubmitting,
    orderSubmitted,
    submitOrder,
    resetOrderFlow,
    validateOrder
  };
}