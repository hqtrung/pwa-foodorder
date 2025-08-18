'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Order } from '@/types/order';

interface OrderDetailModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onDismiss?: (orderId: string) => void;
}

export function OrderDetailModal({ order, isOpen, onClose, onDismiss }: OrderDetailModalProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [isDismissing, setIsDismissing] = useState(false);

  if (!isOpen) return null;

  const handleDismiss = async () => {
    if (onDismiss) {
      setIsDismissing(true);
      try {
        await onDismiss(order.id);
        onClose(); // Close modal after successful dismissing
      } catch (error) {
        console.error('Error dismissing order:', error);
        setIsDismissing(false); // Reset on error
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString(locale, {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLocalizedItemName = (item: any): string => {
    if (typeof item.name === 'string') {
      return item.name;
    }
    if (typeof item.name === 'object' && item.name) {
      return item.name[locale] || item.name.vi || item.name.en || Object.values(item.name)[0] || 'Unknown Item';
    }
    return 'Unknown Item';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t('order.details.title')} {order.orderNumber}
                </h2>
                <p className="text-sm text-gray-600">
                  {formatTime(order.createdAt)}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={onClose}
                className="p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Customer Information */}
            <Card padding="md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('order.details.customerInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t('order.details.name')}
                  </label>
                  <p className="text-gray-900">{order.customer.name}</p>
                </div>
                
                {order.customer.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t('order.details.phone')}
                    </label>
                    <p className="text-gray-900">
                      <a 
                        href={`tel:${order.customer.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {order.customer.phone}
                      </a>
                    </p>
                  </div>
                )}
                
                {order.customer.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t('order.details.email')}
                    </label>
                    <p className="text-gray-900">{order.customer.email}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Order Location */}
            <Card padding="md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {order.type === 'table' ? t('order.details.table') : t('order.details.deliveryAddress')}
              </h3>
              {order.type === 'table' ? (
                <p className="text-gray-900">{t('order.details.tableNumber', { number: order.tableNumber })}</p>
              ) : (
                <div>
                  <p className="text-gray-900">{order.delivery?.address}</p>
                  {order.delivery?.instructions && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800">
                        <strong>Ghi chú giao hàng:</strong> {order.delivery.instructions}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Order Items */}
            <Card padding="md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('order.details.items')} ({order.items.length})
              </h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.quantity}x {getLocalizedItemName(item)}
                        </h4>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatPrice(item.totalPrice)}₫
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatPrice(item.unitPrice)}₫ {t('order.details.each')}
                        </p>
                      </div>
                    </div>
                    
                    {item.toppings && item.toppings.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">
                          {t('order.details.toppings')}:
                        </p>
                        <ul className="text-sm text-gray-600 ml-4">
                          {item.toppings.map((topping, tIndex) => (
                            <li key={tIndex}>
                              • {topping.name} (+{formatPrice(topping.price)}₫)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {item.specialInstructions && (
                      <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                        <p className="text-sm text-orange-800">
                          <strong>{t('order.details.specialInstructions')}:</strong> {item.specialInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <Card padding="md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('order.details.specialInstructions')}
                </h3>
                <p className="text-gray-900">{order.specialInstructions}</p>
              </Card>
            )}

            {/* Order Summary */}
            <Card padding="md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('order.details.summary')}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('order.details.subtotal')}:</span>
                  <span>{formatPrice(order.summary.subtotal)}₫</span>
                </div>
                
                {order.summary.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('order.details.deliveryFee')}:</span>
                    <span>{formatPrice(order.summary.deliveryFee)}₫</span>
                  </div>
                )}
                
                {order.summary.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('order.details.tax')}:</span>
                    <span>{formatPrice(order.summary.tax)}₫</span>
                  </div>
                )}
                
                {order.summary.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t('order.details.discount')}:</span>
                    <span>-{formatPrice(order.summary.discount)}₫</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>{t('order.details.total')}:</span>
                    <span className="text-primary-600">{formatPrice(order.summary.total)}₫</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card padding="md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('order.summary.paymentMethod')}
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  {order.paymentMethod === 'cash' && '💵'}
                  {order.paymentMethod === 'card' && '💳'}
                  {order.paymentMethod === 'momo' && '📱'}
                  {order.paymentMethod === 'zalopay' && '💰'}
                </div>
                <span className="font-medium">
                  {t(`checkout.payment.methods.${order.paymentMethod}`)}
                </span>
              </div>
            </Card>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-lg">
            <div className="flex justify-between">
              <div className="flex space-x-3">
                {order.customer.phone && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`tel:${order.customer.phone}`)}
                  >
                    📞 {t('staff.orderCard.call')}
                  </Button>
                )}
                {(order.status === 'completed' || order.status === 'cancelled') && onDismiss && (
                  <Button
                    variant="outline"
                    onClick={handleDismiss}
                    disabled={isDismissing}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    {isDismissing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-400"></div>
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
              </div>
              <Button onClick={onClose}>
                {t('common.actions.close')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}