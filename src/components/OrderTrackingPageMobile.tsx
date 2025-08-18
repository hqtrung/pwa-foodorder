'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { OrderStatusTimelineMobile } from '@/components/order/OrderStatusTimelineMobile';
import { OrderDetailsMobile } from '@/components/order/OrderDetailsMobile';
import { OrderActionsMobile } from '@/components/order/OrderActionsMobile';
import { useUIStore } from '@/stores';
import { orderFirestoreService } from '@/services/orderFirestoreService';
import { soundService } from '@/services/soundService';
import { Order } from '@/stores/orderStore';

interface OrderTrackingPageMobileProps {
  orderId: string;
}

export function OrderTrackingPageMobile({ orderId }: OrderTrackingPageMobileProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  // State
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);
  
  const { showErrorToast, showSuccessToast } = useUIStore();

  // Load order data
  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const firestoreOrder = await orderFirestoreService.getOrder(orderId);
        
        if (!firestoreOrder) {
          setError('Order not found');
          return;
        }
        
        // Helper function to safely convert timestamps
        const safeTimestampToMillis = (timestamp: any): number => {
          if (!timestamp) return Date.now();
          
          if (typeof timestamp === 'number') return timestamp;
          
          if (timestamp && typeof timestamp.toMillis === 'function') {
            return timestamp.toMillis();
          }
          
          if (timestamp instanceof Date) {
            return timestamp.getTime();
          }
          
          if (typeof timestamp === 'string') {
            return new Date(timestamp).getTime();
          }
          
          if (timestamp && typeof timestamp.seconds === 'number') {
            return timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000;
          }
          
          return Date.now();
        };

        // Convert Firestore order to local order format
        const localOrder: Order = {
          id: firestoreOrder.id,
          orderNumber: firestoreOrder.orderNumber,
          status: firestoreOrder.status as any,
          orderType: firestoreOrder.type as 'delivery' | 'table',
          items: firestoreOrder.items.map(item => ({
            id: item.id,
            product: {
              id: item.productId,
              name: item.name,
              price: item.unitPrice,
              category: item.category
            },
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            toppings: item.toppings?.map(t => ({
              id: parseInt(t.id),
              name: t.name,
              price: t.price
            })) || [],
            specialInstructions: item.specialInstructions,
            options: {}
          })),
          summary: firestoreOrder.summary,
          customer: firestoreOrder.customer,
          tableNumber: firestoreOrder.tableNumber,
          deliveryInfo: firestoreOrder.delivery ? {
            address: firestoreOrder.delivery.address,
            deliveryInstructions: firestoreOrder.delivery.instructions
          } : undefined,
          specialInstructions: firestoreOrder.specialInstructions,
          orderTime: safeTimestampToMillis(firestoreOrder.createdAt),
          estimatedReadyTime: safeTimestampToMillis(firestoreOrder.estimatedCompletionTime),
          estimatedDeliveryTime: firestoreOrder.type === 'delivery' && firestoreOrder.estimatedCompletionTime 
            ? safeTimestampToMillis(firestoreOrder.estimatedCompletionTime) + (20 * 60 * 1000) 
            : undefined,
          estimatedTime: firestoreOrder.type === 'delivery' && firestoreOrder.estimatedCompletionTime
            ? safeTimestampToMillis(firestoreOrder.estimatedCompletionTime) + (20 * 60 * 1000)
            : safeTimestampToMillis(firestoreOrder.estimatedCompletionTime),
          statusHistory: [{
            status: firestoreOrder.status as any,
            timestamp: safeTimestampToMillis(firestoreOrder.createdAt),
            message: 'Order placed'
          }],
          paymentMethod: firestoreOrder.paymentMethod as any,
          paymentStatus: 'paid' as any,
          createdAt: safeTimestampToMillis(firestoreOrder.createdAt),
          updatedAt: safeTimestampToMillis(firestoreOrder.updatedAt)
        };
        
        setOrder(localOrder);
        setPreviousStatus(localOrder.status);
      } catch (error) {
        console.error('Error loading order:', error);
        setError('Failed to load order');
        showErrorToast('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, showErrorToast]);

  // Setup real-time order updates
  useEffect(() => {
    if (!autoRefresh || !orderId) return;

    let unsubscribe: (() => void) | null = null;

    const setupRealTimeUpdates = async () => {
      try {
        unsubscribe = orderFirestoreService.subscribeToOrder(orderId, (updatedOrder) => {
          if (updatedOrder) {
            const convertedOrder: Order = {
              id: updatedOrder.id,
              orderNumber: updatedOrder.orderNumber,
              status: updatedOrder.status as any,
              orderType: updatedOrder.type as 'delivery' | 'table',
              items: updatedOrder.items.map(item => ({
                id: item.id,
                product: {
                  id: item.productId,
                  name: item.name,
                  price: item.unitPrice,
                  category: item.category
                },
                quantity: item.quantity,
                totalPrice: item.totalPrice,
                toppings: item.toppings?.map(t => ({
                  id: parseInt(t.id),
                  name: t.name,
                  price: t.price
                })) || [],
                specialInstructions: item.specialInstructions,
                options: {}
              })),
              summary: updatedOrder.summary,
              customer: updatedOrder.customer,
              tableNumber: updatedOrder.tableNumber,
              deliveryInfo: updatedOrder.delivery ? {
                address: updatedOrder.delivery.address,
                deliveryInstructions: updatedOrder.delivery.instructions
              } : undefined,
              specialInstructions: updatedOrder.specialInstructions,
              orderTime: new Date(updatedOrder.createdAt).getTime(),
              estimatedReadyTime: updatedOrder.estimatedCompletionTime ? new Date(updatedOrder.estimatedCompletionTime).getTime() : undefined,
              estimatedDeliveryTime: updatedOrder.type === 'delivery' && updatedOrder.estimatedCompletionTime 
                ? new Date(updatedOrder.estimatedCompletionTime).getTime() + (20 * 60 * 1000)
                : undefined,
              statusHistory: [{
                status: updatedOrder.status as any,
                timestamp: new Date(updatedOrder.createdAt).getTime(),
                message: 'Order updated'
              }],
              paymentMethod: updatedOrder.paymentMethod as any,
              paymentStatus: 'paid' as any,
              createdAt: new Date(updatedOrder.createdAt).getTime(),
              updatedAt: new Date(updatedOrder.updatedAt).getTime()
            };
            
            // Check if status changed and play sound
            if (previousStatus && convertedOrder.status !== previousStatus) {
              console.log('🔊 Status changed from', previousStatus, 'to', convertedOrder.status);
              soundService.play('status_change');
              setPreviousStatus(convertedOrder.status);
            }
            
            setOrder(convertedOrder);
            showSuccessToast('Order status updated');
          }
        });
      } catch (error) {
        console.error('Error setting up real-time updates:', error);
      }
    };

    setupRealTimeUpdates();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [autoRefresh, orderId, previousStatus, showSuccessToast]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    showSuccessToast(
      autoRefresh 
        ? 'Auto refresh disabled'
        : 'Auto refresh enabled'
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 text-center max-w-sm mx-auto shadow-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'The order you\'re looking for could not be found.'}
          </p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/menu')} className="w-full">
              Back to Menu
            </Button>
            <Button variant="ghost" onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="p-2 -ml-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Order Tracking
                </h1>
                <p className="text-xs text-gray-600">
                  {order.orderType === 'delivery' ? 'Home Delivery' : `Table ${order.tableNumber}`}
                </p>
              </div>
            </div>

            {/* Estimated Time */}
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <div className="text-right">
                <div className="text-xs text-gray-500">Ready by</div>
                <div className="text-sm font-medium text-primary-600">
                  {new Date(order.estimatedReadyTime || order.estimatedDeliveryTime || Date.now()).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* Status Timeline */}
        <OrderStatusTimelineMobile 
          order={order}
          currentStatus={order.status}
        />
        
        {/* Order Details */}
        <OrderDetailsMobile order={order} />
      </main>

      {/* Mobile Actions */}
      <OrderActionsMobile 
        order={order}
        onRefresh={handleRefresh}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={handleToggleAutoRefresh}
      />
    </div>
  );
}