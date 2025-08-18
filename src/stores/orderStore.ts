import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { CartItem, CartSummary } from './cartStore';

export type OrderStatus = 
  | 'pending'     // Order is being prepared
  | 'confirmed'   // Order confirmed by restaurant
  | 'preparing'   // Kitchen is preparing the order
  | 'ready'       // Order is ready for pickup/delivery
  | 'delivering'  // Order is out for delivery (delivery only)
  | 'delivered'   // Order has been delivered/picked up
  | 'cancelled'   // Order was cancelled

export interface OrderTimestamp {
  status: OrderStatus;
  timestamp: number;
  message?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface DeliveryInfo {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  deliveryInstructions?: string;
  contactPhone?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // Human-readable order number
  status: OrderStatus;
  orderType: 'delivery' | 'table';
  
  // Items and pricing
  items: CartItem[];
  summary: CartSummary;
  
  // Customer information
  customer: CustomerInfo;
  
  // Order-specific information
  tableNumber?: string; // For table orders
  deliveryInfo?: DeliveryInfo; // For delivery orders
  specialInstructions?: string;
  
  // Timing
  orderTime: number;
  estimatedReadyTime?: number;
  estimatedDeliveryTime?: number;
  actualDeliveryTime?: number;
  
  // Status tracking
  statusHistory: OrderTimestamp[];
  
  // Payment (mock for now)
  paymentMethod: 'cash' | 'card' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  
  // Additional metadata
  createdAt: number;
  updatedAt: number;
}

interface OrderState {
  // Current order being placed
  currentOrder: Partial<Order> | null;
  
  // Order history
  orders: Order[];
  
  // Active order tracking (for session-based monitoring)
  activeOrderId: string | null;
  
  // Session tracking - order ID that should show floating status
  sessionOrderId: string | null;
  
  // Loading states
  isPlacingOrder: boolean;
  isLoadingOrder: boolean;
  isLoadingOrders: boolean;
}

interface OrderActions {
  // Order creation
  initializeOrder: (orderType: 'delivery' | 'table') => void;
  updateCustomerInfo: (customer: CustomerInfo) => void;
  updateDeliveryInfo: (delivery: DeliveryInfo) => void;
  updateTableNumber: (tableNumber: string) => void;
  updateSpecialInstructions: (instructions: string) => void;
  updatePaymentMethod: (method: 'cash' | 'card' | 'online') => void;
  
  // Order submission
  submitOrder: (items: CartItem[], summary: CartSummary) => Promise<string>;
  
  // Order tracking
  setActiveOrder: (orderId: string | null) => void;
  setSessionOrder: (orderId: string | null) => void;
  clearSessionOrder: () => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, message?: string) => void;
  updateOrderTiming: (orderId: string, estimatedTime?: number, actualTime?: number) => void;
  
  // Order history
  addOrder: (order: Order) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getRecentOrders: (limit?: number) => Order[];
  
  // Utilities
  clearCurrentOrder: () => void;
  generateOrderNumber: () => string;
  calculateEstimatedTime: (orderType: 'delivery' | 'table', itemCount: number) => number;
  
  // Loading states
  setPlacingOrder: (loading: boolean) => void;
  setLoadingOrder: (loading: boolean) => void;
  setLoadingOrders: (loading: boolean) => void;
}

type OrderStore = OrderState & OrderActions;

export const useOrderStore = create<OrderStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      currentOrder: null,
      orders: [],
      activeOrderId: null,
      sessionOrderId: null,
      isPlacingOrder: false,
      isLoadingOrder: false,
      isLoadingOrders: false,

      // Actions
      initializeOrder: (orderType) => {
        set((state) => {
          state.currentOrder = {
            id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            orderType,
            status: 'pending',
            orderTime: Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            statusHistory: [],
            paymentMethod: 'cash',
            paymentStatus: 'pending'
          };
        });
      },

      updateCustomerInfo: (customer) => {
        set((state) => {
          if (state.currentOrder) {
            state.currentOrder.customer = customer;
            state.currentOrder.updatedAt = Date.now();
          }
        });
      },

      updateDeliveryInfo: (delivery) => {
        set((state) => {
          if (state.currentOrder) {
            state.currentOrder.deliveryInfo = delivery;
            state.currentOrder.updatedAt = Date.now();
          }
        });
      },

      updateTableNumber: (tableNumber) => {
        set((state) => {
          if (state.currentOrder) {
            state.currentOrder.tableNumber = tableNumber;
            state.currentOrder.updatedAt = Date.now();
          }
        });
      },

      updateSpecialInstructions: (instructions) => {
        set((state) => {
          if (state.currentOrder) {
            state.currentOrder.specialInstructions = instructions;
            state.currentOrder.updatedAt = Date.now();
          }
        });
      },

      updatePaymentMethod: (method) => {
        set((state) => {
          if (state.currentOrder) {
            state.currentOrder.paymentMethod = method;
            state.currentOrder.updatedAt = Date.now();
          }
        });
      },

      submitOrder: async (items, summary) => {
        const { currentOrder, generateOrderNumber, calculateEstimatedTime } = get();
        
        if (!currentOrder || !currentOrder.customer) {
          throw new Error('Order information is incomplete');
        }

        set((state) => {
          state.isPlacingOrder = true;
        });

        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1500));

          const orderNumber = generateOrderNumber();
          const estimatedTime = calculateEstimatedTime(
            currentOrder.orderType!,
            items.reduce((sum, item) => sum + item.quantity, 0)
          );

          const completedOrder: Order = {
            ...currentOrder,
            id: currentOrder.id!,
            orderNumber,
            items,
            summary,
            status: 'confirmed',
            estimatedReadyTime: Date.now() + (estimatedTime * 60 * 1000),
            estimatedDeliveryTime: currentOrder.orderType === 'delivery' 
              ? Date.now() + ((estimatedTime + 20) * 60 * 1000)
              : undefined,
            statusHistory: [
              {
                status: 'pending',
                timestamp: currentOrder.orderTime!,
                message: 'Order received'
              },
              {
                status: 'confirmed',
                timestamp: Date.now(),
                message: 'Order confirmed by restaurant'
              }
            ],
            updatedAt: Date.now()
          } as Order;

          set((state) => {
            state.orders.unshift(completedOrder);
            state.activeOrderId = completedOrder.id;
            state.sessionOrderId = completedOrder.id; // Set session tracking
            state.currentOrder = null;
            state.isPlacingOrder = false;
          });

          return completedOrder.id;
        } catch (error) {
          set((state) => {
            state.isPlacingOrder = false;
          });
          throw error;
        }
      },

      setActiveOrder: (orderId) => {
        set((state) => {
          state.activeOrderId = orderId;
        });
      },

      setSessionOrder: (orderId) => {
        set((state) => {
          state.sessionOrderId = orderId;
        });
      },

      clearSessionOrder: () => {
        set((state) => {
          state.sessionOrderId = null;
        });
      },

      updateOrderStatus: (orderId, status, message) => {
        set((state) => {
          const order = state.orders.find(o => o.id === orderId);
          if (order) {
            order.status = status;
            order.statusHistory.push({
              status,
              timestamp: Date.now(),
              message
            });
            order.updatedAt = Date.now();

            // Update actual delivery time if delivered and clear session tracking
            if (status === 'delivered') {
              order.actualDeliveryTime = Date.now();
              // Clear session order tracking when delivered
              if (state.sessionOrderId === orderId) {
                state.sessionOrderId = null;
              }
            }
            
            // Also clear session tracking if cancelled
            if (status === 'cancelled' && state.sessionOrderId === orderId) {
              state.sessionOrderId = null;
            }
          }
        });
      },

      updateOrderTiming: (orderId, estimatedTime, actualTime) => {
        set((state) => {
          const order = state.orders.find(o => o.id === orderId);
          if (order) {
            if (estimatedTime !== undefined) {
              order.estimatedReadyTime = Date.now() + (estimatedTime * 60 * 1000);
              if (order.orderType === 'delivery') {
                order.estimatedDeliveryTime = Date.now() + ((estimatedTime + 20) * 60 * 1000);
              }
            }
            if (actualTime !== undefined) {
              order.actualDeliveryTime = actualTime;
            }
            order.updatedAt = Date.now();
          }
        });
      },

      addOrder: (order) => {
        set((state) => {
          const existingIndex = state.orders.findIndex(o => o.id === order.id);
          if (existingIndex >= 0) {
            state.orders[existingIndex] = order;
          } else {
            state.orders.unshift(order);
          }
        });
      },

      getOrderById: (orderId) => {
        return get().orders.find(order => order.id === orderId);
      },

      getOrdersByStatus: (status) => {
        return get().orders.filter(order => order.status === status);
      },

      getRecentOrders: (limit = 10) => {
        return get().orders
          .sort((a, b) => b.orderTime - a.orderTime)
          .slice(0, limit);
      },

      clearCurrentOrder: () => {
        set((state) => {
          state.currentOrder = null;
        });
      },

      generateOrderNumber: () => {
        const now = new Date();
        const dateStr = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
        const timeStr = now.toTimeString().slice(0, 5).replace(':', ''); // HHMM
        const randomStr = Math.random().toString(36).substr(2, 3).toUpperCase();
        return `${dateStr}${timeStr}${randomStr}`;
      },

      calculateEstimatedTime: (orderType, itemCount) => {
        // Base preparation time
        let baseTime = 15; // 15 minutes base
        
        // Add time based on item count
        baseTime += Math.ceil(itemCount / 3) * 5; // 5 minutes per 3 items
        
        // Add delivery time if needed
        if (orderType === 'delivery') {
          baseTime += 20; // 20 minutes for delivery
        }
        
        // Add some random variation (±5 minutes)
        const variation = Math.floor(Math.random() * 11) - 5;
        
        return Math.max(10, baseTime + variation);
      },

      setPlacingOrder: (loading) => {
        set((state) => {
          state.isPlacingOrder = loading;
        });
      },

      setLoadingOrder: (loading) => {
        set((state) => {
          state.isLoadingOrder = loading;
        });
      },

      setLoadingOrders: (loading) => {
        set((state) => {
          state.isLoadingOrders = loading;
        });
      }
    })),
    {
      name: 'order-storage',
      // Persist all order data except loading states
      partialize: (state) => ({
        currentOrder: state.currentOrder,
        orders: state.orders,
        activeOrderId: state.activeOrderId,
        sessionOrderId: state.sessionOrderId
      })
    }
  )
);