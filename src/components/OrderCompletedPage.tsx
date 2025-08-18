'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useOrderStore } from '@/stores/orderStore';
import { Order } from '@/stores/orderStore';
import { orderFirestoreService } from '@/services/orderFirestoreService';
import { useUIStore } from '@/stores';

interface OrderCompletedPageProps {
  orderId?: string;
}

export function OrderCompletedPage({ orderId }: OrderCompletedPageProps) {
  const t = useTranslations();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { addOrder, setActiveOrder, setSessionOrder } = useOrderStore();
  const { showErrorToast } = useUIStore();

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        console.log('❌ No order ID provided');
        setLoading(false);
        return;
      }

      console.log('🔍 Loading order with ID:', orderId);

      try {
        setLoading(true);
        setError(null);
        
        // Add small delay to handle Firestore eventual consistency
        console.log('⏳ Waiting 500ms for Firestore consistency...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // First try to get from Firestore
        console.log('📡 Fetching order from Firestore...');
        const firestoreOrder = await orderFirestoreService.getOrder(orderId);
        console.log('📋 Firestore response:', firestoreOrder ? 'Order found' : 'Order not found');
        
        if (firestoreOrder) {
          console.log('🔍 Raw Firestore order data:', firestoreOrder);
          console.log('📅 CreatedAt type:', typeof firestoreOrder.createdAt, firestoreOrder.createdAt);
          console.log('🛒 Items structure:', firestoreOrder.items);
          if (firestoreOrder.items && firestoreOrder.items.length > 0) {
            console.log('📦 First item details:', firestoreOrder.items[0]);
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
            
            console.warn('⚠️ Unknown timestamp format:', timestamp);
            return Date.now();
          };

          // Convert Firestore order to local order format
          const localOrder: Order = {
            id: firestoreOrder.id,
            orderNumber: firestoreOrder.orderNumber,
            status: firestoreOrder.status as any,
            type: firestoreOrder.type as 'delivery' | 'table',
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

          console.log('✅ Order converted successfully:', localOrder.orderNumber);
          setOrder(localOrder);
          
          // Add to local store for session tracking
          addOrder(localOrder);
          setActiveOrder(orderId);
          setSessionOrder(orderId);
        } else {
          console.log('🔄 First attempt failed, retrying in 1 second...');
          // Retry after 1 second
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const retryOrder = await orderFirestoreService.getOrder(orderId);
          console.log('🔄 Retry result:', retryOrder ? 'Order found on retry' : 'Order still not found');
          
          if (retryOrder) {
            // Convert and use the retry result
            const localOrder: Order = {
              id: retryOrder.id,
              orderNumber: retryOrder.orderNumber,
              status: retryOrder.status as any,
              type: retryOrder.type as 'delivery' | 'table',
              orderType: retryOrder.type as 'delivery' | 'table',
              items: retryOrder.items.map(item => ({
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
              summary: retryOrder.summary,
              customer: retryOrder.customer,
              tableNumber: retryOrder.tableNumber,
              deliveryInfo: retryOrder.delivery ? {
                address: retryOrder.delivery.address,
                deliveryInstructions: retryOrder.delivery.instructions
              } : undefined,
              specialInstructions: retryOrder.specialInstructions,
              orderTime: safeTimestampToMillis(retryOrder.createdAt),
              estimatedReadyTime: safeTimestampToMillis(retryOrder.estimatedCompletionTime),
              estimatedDeliveryTime: retryOrder.type === 'delivery' && retryOrder.estimatedCompletionTime 
                ? safeTimestampToMillis(retryOrder.estimatedCompletionTime) + (20 * 60 * 1000) 
                : undefined,
              estimatedTime: retryOrder.type === 'delivery' && retryOrder.estimatedCompletionTime
                ? safeTimestampToMillis(retryOrder.estimatedCompletionTime) + (20 * 60 * 1000)
                : safeTimestampToMillis(retryOrder.estimatedCompletionTime),
              statusHistory: [{
                status: retryOrder.status as any,
                timestamp: safeTimestampToMillis(retryOrder.createdAt),
                message: 'Order placed'
              }],
              paymentMethod: retryOrder.paymentMethod as any,
              paymentStatus: 'paid' as any,
              createdAt: safeTimestampToMillis(retryOrder.createdAt),
              updatedAt: safeTimestampToMillis(retryOrder.updatedAt)
            };

            setOrder(localOrder);
            addOrder(localOrder);
            setActiveOrder(orderId);
            setSessionOrder(orderId);
          } else {
            console.log('❌ Order not found even after retry');
            setError(t('order.errors.notFound.description'));
          }
        }
      } catch (err) {
        console.error('❌ Error loading order:', err);
        setError(t('order.errors.notFound.description'));
        showErrorToast(t('order.errors.notFound.description'));
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, addOrder, setActiveOrder, setSessionOrder, t, showErrorToast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getEstimatedTime = () => {
    if (!order?.estimatedReadyTime) return '';
    const now = Date.now();
    const estimatedTime = order.estimatedReadyTime;
    const diffMinutes = Math.ceil((estimatedTime - now) / (1000 * 60));
    
    if (diffMinutes <= 0) return t('order.ready');
    return t('order.estimatedTime', { minutes: diffMinutes });
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
    // If we have an order ID but couldn't load details, show basic success page
    if (orderId && !loading) {
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('order.completed.title')}
              </h1>
              <p className="text-lg text-gray-600">
                {t('order.completed.subtitle')}
              </p>
            </div>

            {/* Basic Order Info */}
            <Card padding="lg" className="mb-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('order.number')} #{orderId.slice(-6).toUpperCase()}
                </h2>
                <p className="text-gray-600 mb-6">
                  {t('order.loading')}
                </p>
                <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 text-sm">
                    {t('order.errors.notFound.description')}
                  </p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={() => router.push(`/order/${orderId}`)}
                className="w-full"
                size="lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {t('order.actions.trackOrder')}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => router.push('/menu')}
                className="w-full"
              >
                {t('order.actions.orderAgain')}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => router.push('/')}
                className="w-full"
              >
                {t('order.actions.backToHome')}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Show error if no order ID or loading failed
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('order.completed.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('order.completed.subtitle')}
          </p>
        </div>

        {/* Order Information */}
        <div className="space-y-6">
          {/* Order Summary Card */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('order.summary.title')}
              </h2>
              <div className="text-right">
                <p className="text-sm text-gray-600">{t('order.number')}</p>
                <p className="text-lg font-semibold text-primary-600">#{order.orderNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  {t('order.customer.info')}
                </h3>
                <p className="text-gray-600">{order.customer.name}</p>
                <p className="text-gray-600">{order.customer.phone}</p>
                {order.customer.email && (
                  <p className="text-gray-600">{order.customer.email}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  {t('order.details.title')}
                </h3>
                <p className="text-gray-600">
                  {t(`common.orderTypes.${order.orderType}`)}
                </p>
                {order.tableNumber && (
                  <p className="text-gray-600">
                    {t('order.table')} {order.tableNumber}
                  </p>
                )}
                {order.deliveryInfo && (
                  <p className="text-gray-600 text-sm">
                    {order.deliveryInfo.address}
                  </p>
                )}
              </div>
            </div>

            {/* Estimated Time */}
            <div className="bg-primary-50 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-primary-900 font-medium">
                  {getEstimatedTime()}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                {t('order.items.title')}
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={`${item.id}-${JSON.stringify(item.options)}`} className="flex justify-between">
                    <div>
                      <p className="text-gray-900">
                        {item.quantity}x {item.product.name}
                      </p>
                      {/* Display toppings if available */}
                      {item.toppings && item.toppings.length > 0 && (
                        <p className="text-sm text-gray-500">
                          {t('order.details.toppings')}: {item.toppings.map(t => t.name).join(', ')}
                        </p>
                      )}
                      {/* Display options if available */}
                      {item.options && Object.keys(item.options).length > 0 && (
                        <p className="text-sm text-gray-500">
                          {Object.entries(item.options)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </p>
                      )}
                      {/* Display special instructions if available */}
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-500 italic">
                          {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <p className="text-gray-900 font-medium">
                      {formatPrice(item.totalPrice)}₫
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Order Total */}
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>{t('order.summary.total')}</span>
                  <span className="text-primary-600">
                    {formatPrice(order.summary.total)}₫
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => router.push(`/order/${order.id}`)}
              className="w-full"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {t('order.actions.trackOrder')}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/menu')}
              className="w-full"
            >
              {t('order.actions.orderAgain')}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="w-full"
            >
              {t('order.actions.backToHome')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}