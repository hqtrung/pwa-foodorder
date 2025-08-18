'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { useOrderStore } from '@/stores/orderStore';
import { Order, OrderStatus } from '@/stores/orderStore';
import { orderFirestoreService } from '@/services/orderFirestoreService';

export function FloatingOrderStatus() {
  const t = useTranslations();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  
  const { sessionOrderId, getOrderById } = useOrderStore();

  useEffect(() => {
    if (sessionOrderId) {
      // First, get the order from local store
      const sessionOrder = getOrderById(sessionOrderId);
      if (sessionOrder) {
        console.log('🎯 FloatingOrderStatus: Local order found', sessionOrder.orderNumber, 'Status:', sessionOrder.status);
        setOrder(sessionOrder);
      }

      // Set up real-time subscription for updates
      let unsubscribe: (() => void) | null = null;
      
      const setupRealtimeUpdates = async () => {
        try {
          unsubscribe = orderFirestoreService.subscribeToOrder(sessionOrderId, (updatedOrder) => {
            if (updatedOrder) {
              console.log('🔄 FloatingOrderStatus: Received Firestore update', updatedOrder.orderNumber, 'Status:', updatedOrder.status);
              // Convert Firestore order to local order format
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
              
              console.log('✅ FloatingOrderStatus: Setting converted order with status:', convertedOrder.status);
              setOrder(convertedOrder);
            }
          });
        } catch (error) {
          console.error('❌ FloatingOrderStatus: Error setting up real-time updates:', error);
        }
      };

      setupRealtimeUpdates();

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } else {
      setOrder(null);
    }
  }, [sessionOrderId, getOrderById]);

  // Don't render if no active order or order is completed
  if (!order || order.status === 'delivered' || order.status === 'cancelled') {
    return null;
  }

  // Debug current status
  console.log('🎯 FloatingOrderStatus render - Order status:', order.status, 'Order number:', order.orderNumber);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
      case 'confirmed':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'preparing':
        return 'bg-gradient-to-r from-orange-500 to-orange-600';
      case 'ready':
        return 'bg-gradient-to-r from-green-500 to-green-600';
      case 'delivering':
        return 'bg-gradient-to-r from-purple-500 to-purple-600';
      case 'delivered':
        return 'bg-gradient-to-r from-green-600 to-green-700';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'confirmed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'preparing':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'ready':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'delivering':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getEstimatedTime = () => {
    if (!order.estimatedReadyTime) return '';
    const now = Date.now();
    const estimatedTime = order.estimatedReadyTime;
    const diffMinutes = Math.ceil((estimatedTime - now) / (1000 * 60));
    
    if (diffMinutes <= 0) return t('order.ready');
    return `${diffMinutes} ${t('common.minutes')}`;
  };

  const handleClick = () => {
    if (isExpanded) {
      router.push(`/order/${order.id}`);
    } else {
      setIsExpanded(true);
      // Auto-collapse after 5 seconds
      setTimeout(() => setIsExpanded(false), 5000);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 z-30 lg:bottom-6 group">
      <div
        className={`
          transition-all duration-300 ease-out
          ${isExpanded ? 'w-72' : 'w-12 hover:w-16'}
          ${getStatusColor(order.status)} 
          text-white rounded-full shadow-xl cursor-pointer
          ${isExpanded ? 'rounded-2xl p-4 shadow-2xl' : 'h-12 flex items-center justify-center'}
          hover:shadow-2xl transform hover:scale-105
        `}
        onClick={handleClick}
      >
        {isExpanded ? (
          <div className="space-y-3">
            {/* Header with close button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span className="text-lg font-bold">
                  {t(`order.status.${order.status}`)}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="text-white/80 hover:text-white rounded-full p-1 hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Order info */}
            <div className="space-y-2">
              <p className="text-sm font-medium opacity-95">
                {t('order.number')} #{order.orderNumber}
              </p>
              {getEstimatedTime() && (
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">
                    {getEstimatedTime()}
                  </span>
                </div>
              )}
            </div>

            {/* Action button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/order/${order.id}`);
              }}
              className="w-full text-sm font-medium bg-white/20 hover:bg-white/30 rounded-lg py-3 transition-colors shadow-sm"
            >
              {t('order.actions.viewDetails')}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            {getStatusIcon(order.status)}
            {/* Pulse animation for active orders */}
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
          </div>
        )}
      </div>

      {/* Tooltip for collapsed state */}
      {!isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
          <div className="font-medium">{t(`order.status.${order.status}`)}</div>
          <div className="text-gray-300">#{order.orderNumber}</div>
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}