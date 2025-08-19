import { Timestamp } from 'firebase/firestore';

// Order Status Types
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
export type OrderType = 'table' | 'delivery';
export type OrderPriority = 'normal' | 'high' | 'urgent';
export type PaymentMethod = 'cash' | 'card' | 'momo' | 'zalopay';

// Customer Information
export interface OrderCustomer {
  name: string;
  phone?: string;
  email?: string;
}

// Delivery Information
export interface OrderDelivery {
  address: string;
  instructions?: string;
  latitude?: number;
  longitude?: number;
}

// Order Item with Toppings
export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
  toppings: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  specialInstructions?: string;
}

// Order Summary
export interface OrderSummary {
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

// Main Order Interface (for Firestore)
export interface FirestoreOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  type: OrderType;
  priority: OrderPriority;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  estimatedCompletionTime?: Timestamp;
  completedAt?: Timestamp;
  
  // Customer & Location
  customer: OrderCustomer;
  tableNumber?: string;
  delivery?: OrderDelivery;
  
  // Order Details
  items: OrderItem[];
  summary: OrderSummary;
  
  // Payment & Special Instructions
  paymentMethod: PaymentMethod;
  specialInstructions?: string;
  staffNotes?: string;
  
  // Staff Management
  assignedStaff?: string;
  cookingStartedAt?: Timestamp;
  readyAt?: Timestamp;
  isDismissed?: boolean;
  
  // System Fields
  source: 'web' | 'app' | 'staff';
  version: number;
}

// Order for Frontend (with calculated fields)
export interface Order extends Omit<FirestoreOrder, 'createdAt' | 'updatedAt' | 'estimatedCompletionTime' | 'completedAt' | 'cookingStartedAt' | 'readyAt'> {
  createdAt: string;
  updatedAt: string;
  estimatedCompletionTime?: string;
  completedAt?: string;
  cookingStartedAt?: string;
  readyAt?: string;
  
  // Calculated fields
  elapsedTime: number; // minutes since order creation
  estimatedWaitTime: number; // minutes until completion
  isOverdue: boolean;
}

// Order Creation Data (from checkout)
export interface CreateOrderData {
  type: OrderType;
  customer: OrderCustomer;
  tableNumber?: string;
  delivery?: OrderDelivery;
  items: OrderItem[];
  summary: OrderSummary;
  paymentMethod: PaymentMethod;
  specialInstructions?: string;
}

// Order Update Data
export interface UpdateOrderData {
  status?: OrderStatus;
  priority?: OrderPriority;
  assignedStaff?: string;
  staffNotes?: string;
  estimatedCompletionTime?: Timestamp;
}

// Order Filter Options
export interface OrderFilters {
  status?: OrderStatus[];
  type?: OrderType[];
  priority?: OrderPriority[];
  dateFrom?: Date;
  dateTo?: Date;
  assignedStaff?: string;
}

// Real-time Order Event
export interface OrderEvent {
  type: 'created' | 'updated' | 'status_changed' | 'deleted';
  order: Order;
  previousOrder?: Order;
  timestamp: string;
}

// Sound Notification Settings
export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0-1
  newOrder: boolean;
  statusChange: boolean;
  urgentOrder: boolean;
  soundPack: 'default' | 'minimal' | 'modern';
}

// Staff Dashboard Stats
export interface OrderStats {
  activeOrders: number;
  pendingConfirmation: number;
  inPreparation: number;
  readyForDelivery: number;
  averagePreparationTime: number;
  totalOrdersToday: number;
  revenue: number;
  urgentOrders: number;
  overdueOrders: number;
}

// Order notification for real-time updates
export interface OrderNotification {
  id: string;
  type: 'new_order' | 'status_change' | 'urgent_order' | 'overdue_order';
  orderId: string;
  orderNumber: string;
  message: string;
  timestamp: string;
  read: boolean;
  playSound: boolean;
}

// Firestore collection structure
export const FIRESTORE_COLLECTIONS = {
  orders: 'foodorder_orders',
  orderStats: 'foodorder_order_stats',
  notifications: 'foodorder_notifications'
} as const;

// Order status transitions
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivering', 'completed'],
  delivering: ['completed'],
  completed: [],
  cancelled: []
};

// Default estimated preparation times (in minutes)
export const DEFAULT_PREPARATION_TIMES: Record<OrderType, number> = {
  table: 20,
  delivery: 45
};

// Priority multipliers for preparation time
export const PRIORITY_MULTIPLIERS: Record<OrderPriority, number> = {
  normal: 1.0,
  high: 0.8,
  urgent: 0.6
};