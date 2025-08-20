import { CartItem, Product, Topping, CheckoutFormData } from '@/types';
import { OrderItem } from '@/types/order';

// =====================================
// FORMATTING UTILITIES
// =====================================

/**
 * Format price with localized currency
 */
export const formatPrice = (price: number, locale: string = 'vi-VN'): string => {
  return new Intl.NumberFormat(locale).format(price);
};

/**
 * Format date and time with localization
 */
export const formatDateTime = (date: Date, locale: string): string => {
  return date.toLocaleString(locale);
};

/**
 * Format order number for display
 */
export const formatOrderNumber = (orderNumber: string): string => {
  return orderNumber.slice(-6).toUpperCase();
};

// =====================================
// PRODUCT UTILITIES
// =====================================

/**
 * Get localized product name with fallback logic
 */
export const getLocalizedProductName = (
  product: { name: string | Record<string, string> }, 
  locale: string,
  fallback?: string
): string => {
  if (typeof product.name === 'string') {
    return product.name;
  }
  if (typeof product.name === 'object' && product.name) {
    return product.name[locale] || 
           product.name.vi || 
           product.name.en || 
           Object.values(product.name)[0] || 
           fallback || 'Unknown Product';
  }
  return fallback || 'Unknown Product';
};

/**
 * Get localized description with fallback
 */
export const getLocalizedDescription = (
  text: string | Record<string, string>, 
  locale: string
): string => {
  if (typeof text === 'string') {
    return text;
  }
  if (typeof text === 'object' && text) {
    return text[locale] || text.vi || text.en || Object.values(text)[0] || '';
  }
  return '';
};

/**
 * Calculate product total including toppings
 */
export const calculateProductTotal = (
  basePrice: number, 
  toppings: Topping[], 
  quantity: number
): number => {
  const toppingPrice = toppings.reduce((total, topping) => total + topping.price, 0);
  return (basePrice + toppingPrice) * quantity;
};

// =====================================
// VALIDATION UTILITIES
// =====================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate checkout form data
 */
export const validateCheckoutForm = (
  formData: CheckoutFormData, 
  orderType: 'table' | 'delivery',
  t?: (key: string) => string
): ValidationResult => {
  const errors: string[] = [];

  // Common validations
  if (!formData.customerName?.trim()) {
    errors.push(t?.('checkout.errors.validation.customerNameRequired') || 'Customer name is required');
  }

  // Order type specific validations
  if (orderType === 'delivery') {
    if (!formData.phone?.trim()) {
      errors.push(t?.('checkout.errors.validation.phoneRequired') || 'Phone number is required for delivery');
    }
    if (!formData.address?.trim()) {
      errors.push(t?.('checkout.errors.validation.addressRequired') || 'Delivery address is required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate table number
 */
export const validateTableNumber = (tableNumber: string): boolean => {
  const num = parseInt(tableNumber);
  return !isNaN(num) && num >= 1 && num <= 50;
};

/**
 * Validate phone number (basic validation)
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]{9,15}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * Validate delivery address
 */
export const validateDeliveryAddress = (address: string): boolean => {
  return address.trim().length >= 10;
};

// =====================================
// DATA TRANSFORMATION UTILITIES
// =====================================

/**
 * Convert cart items to order items
 */
export const convertCartItemsToOrderItems = (items: CartItem[]): OrderItem[] => {
  return items.map(item => ({
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
};

/**
 * Normalize product data from API
 */
export const normalizeProductData = (product: any): Product => {
  return {
    ...product,
    name: product.name || 'Unknown Product',
    description: product.description || '',
    price: typeof product.price === 'number' ? product.price : 0,
    category: product.category || 'Unknown',
    available: product.available !== false, // Default to true
    toppings: product.toppings || []
  };
};

// =====================================
// UI UTILITIES
// =====================================

/**
 * Generate responsive grid class names
 */
export const getResponsiveGridClass = (
  columns: { mobile?: number; tablet?: number; desktop?: number; wide?: number }
): string => {
  const { mobile = 1, tablet = 2, desktop = 3, wide = 4 } = columns;
  
  return [
    `grid-cols-${mobile}`,
    tablet && `md:grid-cols-${tablet}`,
    desktop && `lg:grid-cols-${desktop}`,
    wide && `xl:grid-cols-${wide}`
  ].filter(Boolean).join(' ');
};

/**
 * Combine class names conditionally
 */
export const cn = (...classes: (string | undefined | null | boolean)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// =====================================
// ERROR HANDLING UTILITIES
// =====================================

/**
 * Handle API errors consistently
 */
export const handleApiError = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
};