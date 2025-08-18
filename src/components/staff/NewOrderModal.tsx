'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Order } from '@/types/order';

interface NewOrderModalProps {
  order: Order;
  isOpen: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}

export function NewOrderModal({ order, isOpen, onAccept, onDismiss }: NewOrderModalProps) {
  const t = useTranslations();
  const [timeLeft, setTimeLeft] = useState(30);

  // Auto-close countdown
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(30);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onDismiss(); // Auto-dismiss when time runs out
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onDismiss]);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getPriorityColor = (priority: Order['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white border-red-600';
      case 'high':
        return 'bg-orange-500 text-white border-orange-600';
      default:
        return 'bg-blue-500 text-white border-blue-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity animate-pulse" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full border-4 border-orange-500 animate-pulse">
          {/* Header with countdown */}
          <div className="bg-orange-500 text-white px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">🔔 ĐƠN HÀNG MỚI!</h2>
                <p className="text-orange-100 text-sm">Đơn hàng vừa được đặt</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{timeLeft}</div>
                <div className="text-xs text-orange-100">giây</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Order Info */}
            <Card padding="md" className={`border-l-4 ${
              order.priority === 'urgent' ? 'border-red-500 bg-red-50' :
              order.priority === 'high' ? 'border-orange-500 bg-orange-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="space-y-3">
                {/* Order Number and Priority */}
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {order.orderNumber}
                  </h3>
                  {order.priority !== 'normal' && (
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getPriorityColor(order.priority)}`}>
                      {order.priority === 'urgent' ? '🚨 KHẨN CẤP' : '⚡ ƯU TIÊN'}
                    </span>
                  )}
                </div>

                {/* Customer Info */}
                <div className="flex items-center space-x-3">
                  <div className="text-lg font-semibold text-gray-800">
                    👤 {order.customer.name}
                  </div>
                  {order.customer.phone && (
                    <a 
                      href={`tel:${order.customer.phone}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      📞 {order.customer.phone}
                    </a>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center space-x-2 text-lg">
                  {order.type === 'table' ? (
                    <>
                      <span>🍽️</span>
                      <span className="font-medium">Bàn {order.tableNumber}</span>
                    </>
                  ) : (
                    <>
                      <span>🚚</span>
                      <span className="font-medium truncate">{order.delivery?.address}</span>
                    </>
                  )}
                </div>

                {/* Total */}
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {formatPrice(order.summary.total)}₫
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {order.items.length} món • {order.items.reduce((sum, item) => sum + item.quantity, 0)} phần
                  </div>
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>💬 Ghi chú:</strong> {order.specialInstructions}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6">
            <div className="flex space-x-3">
              <Button
                onClick={onAccept}
                className="flex-1 py-3 text-lg font-bold bg-green-600 hover:bg-green-700"
                size="lg"
              >
                ✅ NHẬN ĐON
              </Button>
              <Button
                onClick={onDismiss}
                variant="outline"
                className="flex-1 py-3 text-lg font-bold border-gray-300 hover:bg-gray-100"
                size="lg"
              >
                ❌ BỎ QUA
              </Button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              Đơn hàng sẽ tự động bị bỏ qua sau {timeLeft} giây
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}