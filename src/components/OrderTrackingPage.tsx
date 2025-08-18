'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { OrderStatusTimeline } from '@/components/order/OrderStatusTimeline';
import { OrderDetails } from '@/components/order/OrderDetails';
import { OrderActions } from '@/components/order/OrderActions';
import { OrderTrackingPageMobile } from '@/components/OrderTrackingPageMobile';
import { useUIStore } from '@/stores';
import { orderFirestoreService } from '@/services/orderFirestoreService';
import { soundService } from '@/services/soundService';
import { Order } from '@/stores/orderStore';
import { Order as FirestoreOrder } from '@/types/order';

interface OrderTrackingPageProps {
  orderId: string;
}

export function OrderTrackingPage({ orderId }: OrderTrackingPageProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  // State
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const { showErrorToast, showSuccessToast } = useUIStore();

  // Check if mobile on client side
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load order data
  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch order from Firestore
        const firestoreOrder = await orderFirestoreService.getOrder(orderId);
        
        if (!firestoreOrder) {
          setError(t('order.errors.notFound.description'));
          return;
        }
        
        // Helper function to safely convert timestamps
        const safeTimestampToMillis = (timestamp: any): number => {
          if (!timestamp) return Date.now();
          
          // If it's already a number (milliseconds)
          if (typeof timestamp === 'number') return timestamp;
          
          // If it's a Firestore Timestamp with toMillis method
          if (timestamp && typeof timestamp.toMillis === 'function') {
            return timestamp.toMillis();
          }
          
          // If it's a Date object
          if (timestamp instanceof Date) {
            return timestamp.getTime();
          }
          
          // If it's a string that can be parsed as date
          if (typeof timestamp === 'string') {
            return new Date(timestamp).getTime();
          }
          
          // If it has seconds property (Firestore timestamp format)
          if (timestamp && typeof timestamp.seconds === 'number') {
            return timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000;
          }
          
          return Date.now();
        };

        // Debug Firestore order structure
        console.log('🔍 Firestore order type:', firestoreOrder.type);
        console.log('🔍 Full firestore order:', JSON.stringify(firestoreOrder, null, 2));

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

        console.log('✅ Converted local order:', localOrder);
        console.log('✅ Local order type:', localOrder.orderType);
        
        setOrder(localOrder);
        setPreviousStatus(localOrder.status);
      } catch (error) {
        console.error('Error loading order:', error);
        setError(t('order.errors.loadFailed'));
        showErrorToast(t('order.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, t, showErrorToast]);

  // Setup real-time order updates
  useEffect(() => {
    if (!autoRefresh || !orderId) return;

    let unsubscribe: (() => void) | null = null;

    const setupRealTimeUpdates = async () => {
      try {
        unsubscribe = orderFirestoreService.subscribeToOrder(orderId, (updatedOrder) => {
          if (updatedOrder) {
            // Convert the Firestore order format to local order format
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
            showSuccessToast(t('order.notifications.statusUpdated'));
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
  }, [autoRefresh, orderId, t, showSuccessToast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    showSuccessToast(
      autoRefresh 
        ? t('order.notifications.autoRefreshDisabled')
        : t('order.notifications.autoRefreshEnabled')
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('order.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('order.errors.notFound.title')}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || t('order.errors.notFound.description')}
          </p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/menu')} className="w-full">
              {t('order.actions.backToMenu')}
            </Button>
            <Button variant="ghost" onClick={() => router.push('/')}>
              {t('order.actions.backToHome')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render mobile version on small screens
  if (isMobile) {
    return <OrderTrackingPageMobile orderId={orderId} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="py-2 border-b border-gray-100">
            <Breadcrumb orderNumber={order?.orderNumber} />
          </div>
          
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button and title */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                {t('order.tracking.title')}
              </h1>
            </div>

            {/* Right side - Language selector and actions */}
            <div className="flex items-center space-x-4">
              <LanguageSelector variant="dropdown" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="text-gray-600"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('order.actions.refresh')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status and Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status */}
            <Card padding="md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('order.status.title')}
                </h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {t(`order.status.${order.status}`)}
                </div>
              </div>
              
              <OrderStatusTimeline 
                order={order}
                currentStatus={order.status}
              />
            </Card>

            {/* Order Details */}
            <OrderDetails order={order} />
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Order Info */}
              <Card padding="md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('order.summary.title')}
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('order.summary.orderTime')}</span>
                    <span>{new Date(order.createdAt).toLocaleString(locale)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('order.summary.estimatedTime')}</span>
                    <span>{new Date(order.estimatedReadyTime || order.estimatedDeliveryTime || Date.now()).toLocaleTimeString(locale, { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('order.summary.orderType')}</span>
                    <span>{order.orderType ? t(`common.orderTypes.${order.orderType}`) : '-'}</span>
                  </div>
                  
                  {order.tableNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('order.summary.table')}</span>
                      <span>{order.tableNumber}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('order.summary.paymentMethod')}</span>
                    <span>{t(`checkout.payment.methods.${order.paymentMethod}`)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between font-semibold">
                      <span>{t('order.summary.total')}</span>
                      <span className="text-primary-600">{formatPrice(order.summary.total)}₫</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Auto Refresh Toggle */}
              <Card padding="sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t('order.settings.autoRefresh')}
                  </span>
                  <button
                    onClick={handleToggleAutoRefresh}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoRefresh ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoRefresh ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </Card>

              {/* Quick Actions */}
              <OrderActions order={order} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}