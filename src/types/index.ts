// Core data types
export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  availableCount: number;
  sequence?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  image: string;
  category: string;
  isAvailable: boolean;
  preparationTime: number;
  tags: string[];
  allergens: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  toppings: Topping[];
  attributeLines: AttributeLine[];
  hasAttributes: boolean;
  hasToppings: boolean;
  badge?: {
    type: 'promotion' | 'new' | 'bestseller';
    text: string;
  };
}

export interface AttributeLine {
  attribute_id: number;
  attribute_name: string;
  display_type: 'check_box' | 'radio';
  values: AttributeValue[];
}

export interface AttributeValue {
  id: number;
  name: string;
  price_extra: number;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  attributeId?: number;
  attributeName?: string;
  displayType?: 'check_box' | 'radio';
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  toppings: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  specialInstructions?: string;
}

export interface OrderSummary {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  summary: OrderSummary;
  orderType: 'table' | 'delivery';
  tableNumber?: number;
  customerInfo?: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    deliveryInstructions?: string;
  };
  specialInstructions?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
  createdAt: string;
  estimatedTime?: string;
}

// UI State types
export type OrderType = 'table' | 'delivery';
export type SortBy = 'popularity' | 'name' | 'price' | 'newest';
export type SortOrder = 'asc' | 'desc';

// Store types
export interface CartState {
  items: CartItem[];
  orderType: OrderType | null;
  tableNumber: number | null;
  specialInstructions: string;
  // Actions
  addItem: (product: Product, quantity: number, toppings: Topping[], instructions?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateInstructions: (itemId: string, instructions: string) => void;
  clearCart: () => void;
  setOrderType: (type: OrderType) => void;
  setTableNumber: (number: number) => void;
  setSpecialInstructions: (instructions: string) => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getSummary: () => OrderSummary;
}

export interface UIState {
  // Search
  searchQuery: string;
  searchResults: Product[];
  isSearching: boolean;
  
  // Filters
  selectedCategory: string | null;
  showAvailableOnly: boolean;
  sortBy: SortBy;
  sortOrder: SortOrder;
  
  // Modals
  isProductModalOpen: boolean;
  selectedProduct: Product | null;
  
  // Toast notifications
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Product[]) => void;
  setSearching: (searching: boolean) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setShowAvailableOnly: (show: boolean) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;
  showSuccessToast: (message: string) => void;
  showErrorToast: (message: string) => void;
  showWarningToast: (message: string) => void;
  showInfoToast: (message: string) => void;
  removeToast: (id: string) => void;
}