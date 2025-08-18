'use client';

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData,
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  FirestoreOrder, 
  Order, 
  CreateOrderData, 
  UpdateOrderData, 
  OrderFilters, 
  OrderStats,
  OrderEvent,
  OrderStatus,
  OrderPriority,
  FIRESTORE_COLLECTIONS,
  DEFAULT_PREPARATION_TIMES,
  PRIORITY_MULTIPLIERS
} from '@/types/order';

export class OrderFirestoreService {
  private isClient = typeof window !== 'undefined';

  /**
   * Create a new order in Firestore
   */
  async createOrder(orderData: CreateOrderData): Promise<string> {
    if (!this.isClient || !db) {
      throw new Error('Firestore not available on server side');
    }

    try {
      const now = Timestamp.now();
      const orderNumber = this.generateOrderNumber();
      
      // Calculate estimated completion time
      const baseTime = DEFAULT_PREPARATION_TIMES[orderData.type];
      const priorityMultiplier = PRIORITY_MULTIPLIERS.normal;
      const estimatedMinutes = Math.round(baseTime * priorityMultiplier);
      const estimatedCompletionTime = Timestamp.fromMillis(
        now.toMillis() + (estimatedMinutes * 60 * 1000)
      );

      // Clean customer data - remove undefined values
      const cleanCustomer: any = {
        name: orderData.customer?.name || 'Unknown'
      };
      if (orderData.customer?.phone !== undefined && orderData.customer.phone !== '') {
        cleanCustomer.phone = orderData.customer.phone;
      }
      if (orderData.customer?.email !== undefined && orderData.customer.email !== '') {
        cleanCustomer.email = orderData.customer.email;
      }

      // Clean delivery data - remove undefined values
      let cleanDelivery: any = undefined;
      if (orderData.delivery) {
        cleanDelivery = {
          address: orderData.delivery.address
        };
        if (orderData.delivery.instructions !== undefined && orderData.delivery.instructions !== '') {
          cleanDelivery.instructions = orderData.delivery.instructions;
        }
        if (orderData.delivery.latitude !== undefined) {
          cleanDelivery.latitude = orderData.delivery.latitude;
        }
        if (orderData.delivery.longitude !== undefined) {
          cleanDelivery.longitude = orderData.delivery.longitude;
        }
      }

      const firestoreOrder: any = {
        orderNumber,
        status: 'pending',
        type: orderData.type,
        priority: 'normal',
        
        // Timestamps
        createdAt: now,
        updatedAt: now,
        estimatedCompletionTime,
        
        // Customer & Location
        customer: cleanCustomer,
        
        // Order Details
        items: orderData.items,
        summary: orderData.summary,
        
        // Payment & Instructions
        paymentMethod: orderData.paymentMethod,
        
        // System Fields
        source: 'web',
        version: 1
      };

      // Only add optional fields if they have values
      if (orderData.tableNumber !== undefined && orderData.tableNumber !== '') {
        firestoreOrder.tableNumber = orderData.tableNumber;
      }
      if (cleanDelivery !== undefined) {
        firestoreOrder.delivery = cleanDelivery;
      }
      if (orderData.specialInstructions !== undefined && orderData.specialInstructions !== '') {
        firestoreOrder.specialInstructions = orderData.specialInstructions;
      }

      // Add order to Firestore
      const ordersRef = collection(db, FIRESTORE_COLLECTIONS.orders);
      const docRef = await addDoc(ordersRef, firestoreOrder);
      
      // Update daily stats
      await this.updateDailyStats(orderData);
      
      console.log(`Order created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Update an order's status and other fields
   */
  async updateOrder(orderId: string, updateData: UpdateOrderData): Promise<void> {
    if (!this.isClient || !db) {
      throw new Error('Firestore not available on server side');
    }

    try {
      const orderRef = doc(db, FIRESTORE_COLLECTIONS.orders, orderId);
      
      const updatePayload: any = {
        ...updateData,
        updatedAt: serverTimestamp(),
        version: increment(1)
      };

      // Add status-specific timestamps
      if (updateData.status) {
        switch (updateData.status) {
          case 'preparing':
            updatePayload.cookingStartedAt = serverTimestamp();
            break;
          case 'ready':
            updatePayload.readyAt = serverTimestamp();
            break;
          case 'completed':
            updatePayload.completedAt = serverTimestamp();
            break;
        }
      }

      await updateDoc(orderRef, updatePayload);
      console.log(`Order ${orderId} updated`);
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Get all orders with optional filters
   */
  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    if (!this.isClient || !db) {
      console.warn('Firestore not available on server side');
      return [];
    }

    try {
      const ordersRef = collection(db, FIRESTORE_COLLECTIONS.orders);
      let q = query(ordersRef, orderBy('createdAt', 'desc'));

      // Apply filters
      if (filters?.status?.length) {
        q = query(q, where('status', 'in', filters.status));
      }
      if (filters?.type?.length) {
        q = query(q, where('type', 'in', filters.type));
      }
      if (filters?.priority?.length) {
        q = query(q, where('priority', 'in', filters.priority));
      }
      if (filters?.dateFrom) {
        q = query(q, where('createdAt', '>=', Timestamp.fromDate(filters.dateFrom)));
      }
      if (filters?.dateTo) {
        q = query(q, where('createdAt', '<=', Timestamp.fromDate(filters.dateTo)));
      }

      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreOrder;
        // Filter out dismissed orders client-side
        if (!data.isDismissed) {
          orders.push(this.convertFirestoreOrder({ ...data, id: doc.id }));
        }
      });

      console.log(`Loaded ${orders.length} orders from Firestore (excluding dismissed)`);
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Get a single order by ID
   */
  async getOrder(orderId: string): Promise<Order | null> {
    if (!this.isClient || !db) {
      console.warn('Firestore not available on server side');
      return null;
    }

    try {
      const orderRef = doc(db, FIRESTORE_COLLECTIONS.orders, orderId);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        const data = orderSnap.data() as FirestoreOrder;
        return this.convertFirestoreOrder({ ...data, id: orderSnap.id });
      } else {
        console.log(`Order ${orderId} not found`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time order updates
   */
  subscribeToOrders(
    callback: (event: OrderEvent) => void,
    filters?: OrderFilters
  ): () => void {
    if (!this.isClient || !db) {
      console.warn('Firestore not available on server side');
      return () => {};
    }

    try {
      const ordersRef = collection(db, FIRESTORE_COLLECTIONS.orders);
      let q = query(ordersRef, orderBy('createdAt', 'desc'));

      // Apply filters (simplified for real-time)
      if (filters?.status?.length) {
        q = query(q, where('status', 'in', filters.status));
      }

      const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        snapshot.docChanges().forEach((change) => {
          const firestoreOrder = { 
            ...change.doc.data() as FirestoreOrder, 
            id: change.doc.id 
          };
          
          // Skip dismissed orders in real-time updates
          if (firestoreOrder.isDismissed) {
            return;
          }
          
          const order = this.convertFirestoreOrder(firestoreOrder);

          let eventType: OrderEvent['type'];
          switch (change.type) {
            case 'added':
              eventType = 'created';
              break;
            case 'modified':
              eventType = 'updated';
              // Could be more specific about status changes
              if (change.doc.data().status !== change.doc.metadata.hasPendingWrites) {
                eventType = 'status_changed';
              }
              break;
            case 'removed':
              eventType = 'deleted';
              break;
          }

          const event: OrderEvent = {
            type: eventType,
            order,
            timestamp: new Date().toISOString()
          };

          callback(event);
        });
      }, (error) => {
        console.error('Error in orders real-time listener:', error);
      });

      console.log('Subscribed to real-time order updates');
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up real-time listener:', error);
      return () => {};
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats(): Promise<OrderStats> {
    if (!this.isClient || !db) {
      console.warn('Firestore not available on server side');
      return this.getDefaultStats();
    }

    try {
      // Get orders from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const ordersRef = collection(db, FIRESTORE_COLLECTIONS.orders);
      const todayQuery = query(
        ordersRef,
        where('createdAt', '>=', Timestamp.fromDate(today)),
        where('createdAt', '<', Timestamp.fromDate(tomorrow))
      );

      const snapshot = await getDocs(todayQuery);
      const orders: Order[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data() as FirestoreOrder;
        orders.push(this.convertFirestoreOrder({ ...data, id: doc.id }));
      });

      // Calculate stats
      const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;
      const pendingConfirmation = orders.filter(o => o.status === 'pending').length;
      const inPreparation = orders.filter(o => o.status === 'preparing').length;
      const readyForDelivery = orders.filter(o => o.status === 'ready').length;
      const urgentOrders = orders.filter(o => o.priority === 'urgent').length;
      const overdueOrders = orders.filter(o => o.isOverdue).length;

      // Calculate average preparation time
      const completedOrders = orders.filter(o => o.status === 'completed' && o.cookingStartedAt && o.readyAt);
      let averagePreparationTime = 25; // default
      if (completedOrders.length > 0) {
        const totalTime = completedOrders.reduce((sum, order) => {
          const start = new Date(order.cookingStartedAt!).getTime();
          const end = new Date(order.readyAt!).getTime();
          return sum + (end - start);
        }, 0);
        averagePreparationTime = Math.round(totalTime / completedOrders.length / (1000 * 60));
      }

      // Calculate revenue
      const revenue = orders
        .filter(o => ['completed', 'ready', 'delivering'].includes(o.status))
        .reduce((sum, order) => sum + order.summary.total, 0);

      return {
        activeOrders,
        pendingConfirmation,
        inPreparation,
        readyForDelivery,
        averagePreparationTime,
        totalOrdersToday: orders.length,
        revenue,
        urgentOrders,
        overdueOrders
      };
    } catch (error) {
      console.error('Error calculating order stats:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Convert Firestore order to frontend order format
   */
  private convertFirestoreOrder(firestoreOrder: FirestoreOrder): Order {
    const now = Date.now();
    
    // Safely handle timestamp conversion with null checks
    const safeTimestampToISO = (timestamp: any): string | undefined => {
      if (!timestamp || typeof timestamp.toDate !== 'function') {
        return undefined;
      }
      try {
        return timestamp.toDate().toISOString();
      } catch (error) {
        console.warn('Failed to convert timestamp:', error);
        return undefined;
      }
    };

    const safeTimestampToMillis = (timestamp: any): number => {
      if (!timestamp || typeof timestamp.toMillis !== 'function') {
        return now; // fallback to current time
      }
      try {
        return timestamp.toMillis();
      } catch (error) {
        console.warn('Failed to convert timestamp to millis:', error);
        return now;
      }
    };

    const createdTime = safeTimestampToMillis(firestoreOrder.createdAt);
    const elapsedTime = Math.floor((now - createdTime) / (1000 * 60));
    
    let estimatedWaitTime = 0;
    let isOverdue = false;
    
    if (firestoreOrder.estimatedCompletionTime) {
      const estimatedTime = safeTimestampToMillis(firestoreOrder.estimatedCompletionTime);
      estimatedWaitTime = Math.max(0, Math.floor((estimatedTime - now) / (1000 * 60)));
      isOverdue = now > estimatedTime && !['completed', 'cancelled'].includes(firestoreOrder.status);
    }

    return {
      ...firestoreOrder,
      createdAt: safeTimestampToISO(firestoreOrder.createdAt) || new Date().toISOString(),
      updatedAt: safeTimestampToISO(firestoreOrder.updatedAt) || new Date().toISOString(),
      estimatedCompletionTime: safeTimestampToISO(firestoreOrder.estimatedCompletionTime),
      completedAt: safeTimestampToISO(firestoreOrder.completedAt),
      cookingStartedAt: safeTimestampToISO(firestoreOrder.cookingStartedAt),
      readyAt: safeTimestampToISO(firestoreOrder.readyAt),
      elapsedTime,
      estimatedWaitTime,
      isOverdue
    };
  }

  /**
   * Generate a unique order number
   */
  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    const timeStr = date.toTimeString().slice(0, 5).replace(':', ''); // HHMM
    const randomStr = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `${dateStr}${timeStr}${randomStr}`;
  }

  /**
   * Update daily statistics
   */
  private async updateDailyStats(orderData: CreateOrderData): Promise<void> {
    try {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const statsRef = doc(db, FIRESTORE_COLLECTIONS.orderStats, today);
      
      await updateDoc(statsRef, {
        totalOrders: increment(1),
        totalRevenue: increment(orderData.summary.total),
        [`ordersByType.${orderData.type}`]: increment(1),
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      // Document might not exist, create it
      try {
        const today = new Date().toISOString().slice(0, 10);
        const statsRef = doc(db, FIRESTORE_COLLECTIONS.orderStats, today);
        
        await updateDoc(statsRef, {
          date: today,
          totalOrders: 1,
          totalRevenue: orderData.summary.total,
          ordersByType: {
            [orderData.type]: 1
          },
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
      } catch (createError) {
        console.warn('Could not update daily stats:', createError);
      }
    }
  }

  /**
   * Get default stats when Firestore is unavailable
   */
  private getDefaultStats(): OrderStats {
    return {
      activeOrders: 0,
      pendingConfirmation: 0,
      inPreparation: 0,
      readyForDelivery: 0,
      averagePreparationTime: 25,
      totalOrdersToday: 0,
      revenue: 0,
      urgentOrders: 0,
      overdueOrders: 0
    };
  }

  /**
   * Check if Firestore is available
   */
  isAvailable(): boolean {
    return this.isClient && !!db;
  }

  /**
   * Batch update multiple orders (for bulk operations)
   */
  async batchUpdateOrders(updates: Array<{ orderId: string; data: UpdateOrderData }>): Promise<void> {
    if (!this.isClient || !db) {
      throw new Error('Firestore not available on server side');
    }

    try {
      const batch = writeBatch(db);

      updates.forEach(({ orderId, data }) => {
        const orderRef = doc(db, FIRESTORE_COLLECTIONS.orders, orderId);
        batch.update(orderRef, {
          ...data,
          updatedAt: serverTimestamp(),
          version: increment(1)
        });
      });

      await batch.commit();
      console.log(`Batch updated ${updates.length} orders`);
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }

  /**
   * Get orders that need attention (overdue, urgent, etc.)
   */
  async getAttentionOrders(): Promise<Order[]> {
    const now = Timestamp.now();
    const ordersRef = collection(db, FIRESTORE_COLLECTIONS.orders);
    
    // Get overdue orders
    const overdueQuery = query(
      ordersRef,
      where('estimatedCompletionTime', '<', now),
      where('status', 'in', ['pending', 'confirmed', 'preparing']),
      orderBy('estimatedCompletionTime', 'asc')
    );

    const overdueSnapshot = await getDocs(overdueQuery);
    const overdueOrders: Order[] = [];

    overdueSnapshot.forEach((doc) => {
      const data = doc.data() as FirestoreOrder;
      overdueOrders.push(this.convertFirestoreOrder({ ...data, id: doc.id }));
    });

    return overdueOrders;
  }

  /**
   * Clean object by removing undefined and empty string values
   * This prevents Firestore errors with undefined values
   */
  private cleanFirestoreData(obj: any): any {
    if (obj === null || obj === undefined) {
      return undefined;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanFirestoreData(item));
    }

    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined && value !== '') {
          const cleanedValue = this.cleanFirestoreData(value);
          if (cleanedValue !== undefined) {
            cleaned[key] = cleanedValue;
          }
        }
      }
      return Object.keys(cleaned).length > 0 ? cleaned : undefined;
    }

    return obj;
  }

  /**
   * Subscribe to real-time updates for a specific order
   */
  subscribeToOrder(orderId: string, callback: (order: Order | null) => void): () => void {
    if (!this.isClient || !db) {
      console.warn('Firestore not available on server side');
      return () => {};
    }

    try {
      const orderRef = doc(db, FIRESTORE_COLLECTIONS.orders, orderId);
      
      const unsubscribe = onSnapshot(orderRef, (doc) => {
        if (doc.exists()) {
          const firestoreOrder = { id: doc.id, ...doc.data() } as FirestoreOrder;
          const order = this.convertFirestoreOrder(firestoreOrder);
          callback(order);
        } else {
          console.warn(`Order ${orderId} not found`);
          callback(null);
        }
      }, (error) => {
        console.error('Error in order subscription:', error);
        callback(null);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up order subscription:', error);
      return () => {};
    }
  }
}

// Export singleton instance
export const orderFirestoreService = new OrderFirestoreService();