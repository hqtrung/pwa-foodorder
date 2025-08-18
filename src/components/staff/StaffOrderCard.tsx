'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OrderDetailModal } from './OrderDetailModal';
import { Order, OrderStatus, ORDER_STATUS_TRANSITIONS } from '@/types/order';

interface StaffOrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
  onDismiss?: (orderId: string) => void;
}

export function StaffOrderCard({ order, onStatusUpdate, onDismiss }: StaffOrderCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delivering':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Order['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const possibleStatuses = ORDER_STATUS_TRANSITIONS[currentStatus];
    if (!possibleStatuses || possibleStatuses.length === 0) return null;
    
    // Default progression logic
    if (possibleStatuses.includes('confirmed') && currentStatus === 'pending') return 'confirmed';
    if (possibleStatuses.includes('preparing') && currentStatus === 'confirmed') return 'preparing';
    if (possibleStatuses.includes('ready') && currentStatus === 'preparing') return 'ready';
    if (possibleStatuses.includes('delivering') && currentStatus === 'ready' && order.type === 'delivery') return 'delivering';
    if (possibleStatuses.includes('completed') && (currentStatus === 'ready' || currentStatus === 'delivering')) return 'completed';
    
    // Return first available transition
    return possibleStatuses[0];
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDismiss = async () => {
    if (onDismiss) {
      setIsDismissing(true);
      try {
        await onDismiss(order.id);
      } catch (error) {
        console.error('Error dismissing order:', error);
        setIsDismissing(false); // Reset on error
      }
    }
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <Card 
      padding="md" 
      className={`relative border-l-4 transition-opacity duration-300 ${
        isDismissing ? 'opacity-50' : ''
      } ${
        order.priority === 'urgent' ? 'border-red-500' :
        order.priority === 'high' ? 'border-orange-500' :
        'border-gray-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-bold text-gray-900">
            {order.orderNumber}
          </h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
            {t(`staff.orderStatus.${order.status}`)}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-1">
          {order.priority !== 'normal' && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
              {t(`staff.priority.${order.priority}`)}
            </span>
          )}
          <span className="text-xs text-gray-500">
            {formatTime(order.createdAt)}
          </span>
        </div>
      </div>

      {/* Customer & Location Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            {order.customer.name}
          </span>
          {order.customer.phone && (
            <a 
              href={`tel:${order.customer.phone}`}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              📞 {order.customer.phone}
            </a>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {order.type === 'table' ? (
            <>
              <span>🍽️</span>
              <span>{t('staff.orderCard.table')} {order.tableNumber}</span>
            </>
          ) : (
            <>
              <span>🚚</span>
              <span className="truncate">{order.delivery?.address}</span>
            </>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-1 mb-3">
        <h4 className="text-sm font-medium text-gray-700">
          {t('staff.orderCard.items')} ({order.items.length}):
        </h4>
        <div className="space-y-1">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-start justify-between text-sm">
              <div className="flex-1">
                <span className="font-medium">{item.quantity}x</span>
                <span className="ml-1">{item.name}</span>
                {item.specialInstructions && (
                  <div className="text-xs text-orange-600 mt-1">
                    ⚠️ {item.specialInstructions}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500 ml-2">
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Notes */}
      {order.staffNotes && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800">
            📝 {order.staffNotes}
          </p>
        </div>
      )}
      
      {/* Special Instructions */}
      {order.specialInstructions && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800">
            💬 {order.specialInstructions}
          </p>
        </div>
      )}

      {/* Timer & Total */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${
            order.elapsedTime > 45 ? 'text-red-600' :
            order.elapsedTime > 30 ? 'text-orange-600' :
            'text-gray-600'
          }`}>
            ⏱️ {order.elapsedTime}m
          </span>
          {order.isOverdue && (
            <span className="text-xs text-red-600 font-medium">
              {t('staff.orderCard.overdue')}
            </span>
          )}
        </div>
        <span className="font-bold text-gray-900">
          {formatPrice(order.summary.total)}₫
        </span>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {nextStatus && (
          <Button
            onClick={() => handleStatusUpdate(nextStatus)}
            disabled={isUpdating}
            className="w-full"
            size="sm"
          >
            {isUpdating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>{t('staff.orderCard.updating')}</span>
              </div>
            ) : (
              t(`staff.orderCard.markAs.${nextStatus}`)
            )}
          </Button>
        )}
        
        {(order.status === 'completed' || order.status === 'cancelled') && onDismiss && (
          <Button
            onClick={handleDismiss}
            disabled={isDismissing}
            variant="outline"
            size="sm"
            className="w-full text-gray-600 hover:text-red-600 hover:border-red-300"
          >
            {isDismissing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                <span>Đang ẩn...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>🗑️</span>
                <span>Ẩn đơn hàng</span>
              </div>
            )}
          </Button>
        )}

        {/* Quick Actions */}
        <div className="flex space-x-2">
          {order.type === 'delivery' && order.customer.phone && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`tel:${order.customer.phone}`)}
              className="flex-1 text-xs"
            >
              📞 {t('staff.orderCard.call')}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetailModal(true)}
            className="flex-1 text-xs"
          >
            👁️ {t('staff.orderCard.view')}
          </Button>
          
          {(order.status === 'pending' || order.status === 'confirmed') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusUpdate('ready')}
              className="flex-1 text-xs text-green-600"
            >
              ⚡ {t('staff.orderCard.rush')}
            </Button>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={order}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onDismiss={onDismiss}
      />
    </Card>
  );
}