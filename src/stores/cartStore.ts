import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Product, Topping } from '@/types';

export interface CartItem {
  id: string; // Unique identifier for the cart item
  productId: string;
  product: Product;
  quantity: number;
  toppings: Topping[];
  specialInstructions?: string;
  totalPrice: number; // Product price + toppings price * quantity
}

export interface CartSummary {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
}

interface CartState {
  items: CartItem[];
  summary: CartSummary;
  orderType: 'delivery' | 'table' | null;
  tableNumber?: string;
  deliveryAddress?: string;
  deliveryFee: number;
  minimumOrder: number;
}

interface CartActions {
  // Basic cart operations
  addItem: (product: Product, quantity: number, toppings?: Topping[], specialInstructions?: string) => void;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, updates: { quantity?: number; toppings?: Topping[]; specialInstructions?: string }) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  updateItemToppings: (itemId: string, toppings: Topping[]) => void;
  updateItemInstructions: (itemId: string, instructions: string) => void;
  clearCart: () => void;
  
  // Order configuration
  setOrderType: (type: 'delivery' | 'table') => void;
  setTableNumber: (tableNumber: string) => void;
  setDeliveryAddress: (address: string) => void;
  setDeliveryFee: (fee: number) => void;
  setMinimumOrder: (amount: number) => void;
  
  // Cart calculations
  calculateItemPrice: (product: Product, toppings: Topping[], quantity: number) => number;
  calculateSummary: () => void;
  
  // Validation
  isMinimumOrderMet: () => boolean;
  getItemCount: () => number;
  getUniqueProductCount: () => number;
}

type CartStore = CartState & CartActions;

// Tax is already included in prices, so no additional tax calculation needed

export const useCartStore = create<CartStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      items: [],
      summary: {
        subtotal: 0,
        deliveryFee: 0,
        tax: 0,
        discount: 0,
        total: 0,
        itemCount: 0
      },
      orderType: null,
      deliveryFee: 0,
      minimumOrder: 50000,

      // Actions
      addItem: (product, quantity, toppings = [], specialInstructions = '') => {
        set((state) => {
          const itemTotalPrice = get().calculateItemPrice(product, toppings, quantity);
          
          // Check if same product with same toppings already exists
          const existingItemIndex = state.items.findIndex(item => 
            item.productId === product.id &&
            item.toppings.length === toppings.length &&
            item.toppings.every(topping => 
              toppings.some(t => t.id === topping.id)
            ) &&
            item.specialInstructions === specialInstructions
          );

          if (existingItemIndex >= 0) {
            // Update existing item quantity
            state.items[existingItemIndex].quantity += quantity;
            state.items[existingItemIndex].totalPrice = get().calculateItemPrice(
              product, 
              toppings, 
              state.items[existingItemIndex].quantity
            );
          } else {
            // Add new item
            const newItem: CartItem = {
              id: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              productId: product.id,
              product,
              quantity,
              toppings,
              specialInstructions,
              totalPrice: itemTotalPrice
            };
            state.items.push(newItem);
          }
        });
        
        // Call calculateSummary after the state update is complete
        setTimeout(() => get().calculateSummary(), 0);
      },

      removeItem: (itemId) => {
        set((state) => {
          state.items = state.items.filter(item => item.id !== itemId);
        });
        setTimeout(() => get().calculateSummary(), 0);
      },

      updateItem: (itemId, updates) => {
        set((state) => {
          const item = state.items.find(item => item.id === itemId);
          if (item) {
            if (updates.quantity !== undefined) {
              if (updates.quantity <= 0) {
                state.items = state.items.filter(item => item.id !== itemId);
                return;
              }
              item.quantity = updates.quantity;
            }
            if (updates.toppings !== undefined) {
              item.toppings = updates.toppings;
            }
            if (updates.specialInstructions !== undefined) {
              item.specialInstructions = updates.specialInstructions;
            }
            // Recalculate total price based on updated values
            item.totalPrice = get().calculateItemPrice(item.product, item.toppings, item.quantity);
          }
        });
        setTimeout(() => get().calculateSummary(), 0);
      },

      updateItemQuantity: (itemId, quantity) => {
        set((state) => {
          const item = state.items.find(item => item.id === itemId);
          if (item) {
            if (quantity <= 0) {
              state.items = state.items.filter(item => item.id !== itemId);
            } else {
              item.quantity = quantity;
              item.totalPrice = get().calculateItemPrice(item.product, item.toppings, quantity);
            }
          }
        });
        setTimeout(() => get().calculateSummary(), 0);
      },

      updateItemToppings: (itemId, toppings) => {
        set((state) => {
          const item = state.items.find(item => item.id === itemId);
          if (item) {
            item.toppings = toppings;
            item.totalPrice = get().calculateItemPrice(item.product, toppings, item.quantity);
          }
        });
        setTimeout(() => get().calculateSummary(), 0);
      },

      updateItemInstructions: (itemId, instructions) => {
        set((state) => {
          const item = state.items.find(item => item.id === itemId);
          if (item) {
            item.specialInstructions = instructions;
          }
        });
      },

      clearCart: () => {
        set((state) => {
          state.items = [];
          state.summary = {
            subtotal: 0,
            deliveryFee: 0,
            tax: 0,
            discount: 0,
            total: 0,
            itemCount: 0
          };
        });
      },

      setOrderType: (type) => {
        set((state) => {
          state.orderType = type;
          if (type === 'table') {
            state.deliveryAddress = undefined;
            state.deliveryFee = 0;
          }
        });
        setTimeout(() => get().calculateSummary(), 0);
      },

      setTableNumber: (tableNumber) => {
        set((state) => {
          state.tableNumber = tableNumber;
        });
      },

      setDeliveryAddress: (address) => {
        set((state) => {
          state.deliveryAddress = address;
        });
      },

      setDeliveryFee: (fee) => {
        set((state) => {
          state.deliveryFee = fee;
        });
        setTimeout(() => get().calculateSummary(), 0);
      },

      setMinimumOrder: (amount) => {
        set((state) => {
          state.minimumOrder = amount;
        });
      },

      calculateItemPrice: (product, toppings, quantity) => {
        if (!product || typeof product.price !== 'number') {
          console.error('Invalid product or price:', product);
          return 0;
        }
        
        const basePrice = product.price;
        const toppingsPrice = toppings.reduce((sum, topping) => sum + (topping.price || 0), 0);
        return (basePrice + toppingsPrice) * quantity;
      },

      calculateSummary: () => {
        set((state) => {
          const subtotal = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
          const deliveryFee = state.orderType === 'delivery' ? state.deliveryFee : 0;
          const tax = 0; // Tax already included in item prices
          const discount = 0; // Can be implemented later for promotions
          const total = subtotal + deliveryFee - discount;
          const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

          state.summary = {
            subtotal,
            deliveryFee,
            tax,
            discount,
            total,
            itemCount
          };
        });
      },

      isMinimumOrderMet: () => {
        const { summary, minimumOrder, orderType } = get();
        if (orderType === 'table') return true; // No minimum for table orders
        return summary.subtotal >= minimumOrder;
      },

      getItemCount: () => {
        return get().summary.itemCount;
      },

      getUniqueProductCount: () => {
        return get().items.length;
      }
    }),),
    {
      name: 'cart-storage',
      // Only persist essential data, recalculate summary on hydration
      partialize: (state) => ({
        items: state.items,
        orderType: state.orderType,
        tableNumber: state.tableNumber,
        deliveryAddress: state.deliveryAddress,
        deliveryFee: state.deliveryFee,
        minimumOrder: state.minimumOrder
      }),
      onRehydrateStorage: () => (state) => {
        // Recalculate summary after hydration with delay to ensure all data is loaded
        if (state) {
          setTimeout(() => {
            state.calculateSummary();
          }, 100);
        }
      }
    }
  )
);