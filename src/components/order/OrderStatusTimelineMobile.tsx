'use client';

import { useTranslations } from 'next-intl';
import { Order } from '@/stores/orderStore';

interface OrderStatusTimelineMobileProps {
  order: Order;
  currentStatus: string;
}

export function OrderStatusTimelineMobile({ order, currentStatus }: OrderStatusTimelineMobileProps) {
  const t = useTranslations();

  if (!order) {
    return (
      <div className="text-center text-gray-500 py-4">
        {t('order.loading')}
      </div>
    );
  }

  const getStatusSteps = (orderType: 'table' | 'delivery') => {
    const baseSteps = [
      { key: 'pending', icon: '📝', color: 'blue', shortLabel: 'Placed' },
      { key: 'confirmed', icon: '✅', color: 'green', shortLabel: 'Confirmed' },
      { key: 'preparing', icon: '👨‍🍳', color: 'yellow', shortLabel: 'Cooking' },
      { key: 'ready', icon: orderType === 'delivery' ? '📦' : '🍽️', color: 'purple', shortLabel: 'Ready' }
    ];

    if (orderType === 'delivery') {
      baseSteps.push(
        { key: 'delivering', icon: '🛵', color: 'orange', shortLabel: 'Delivering' },
        { key: 'completed', icon: '🎉', color: 'green', shortLabel: 'Delivered' }
      );
    } else {
      baseSteps.push(
        { key: 'completed', icon: '🎉', color: 'green', shortLabel: 'Complete' }
      );
    }

    return baseSteps;
  };

  const statusSteps = getStatusSteps(order.orderType || 'table');
  const currentStepIndex = statusSteps.findIndex(step => step.key === currentStatus);

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      {/* Current Status Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Order Status</h3>
          <p className="text-xs text-gray-600">
            Order #{order.orderNumber}
          </p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          currentStatus === 'completed' ? 'bg-green-100 text-green-800' :
          currentStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
          currentStatus === 'ready' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {t(`order.status.${currentStatus}`)}
        </div>
      </div>

      {/* Horizontal Timeline */}
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200"></div>
        
        {/* Progress Bar Fill */}
        <div 
          className="absolute top-6 left-0 h-0.5 bg-primary-500 transition-all duration-500"
          style={{ 
            width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%` 
          }}
        ></div>

        {/* Steps */}
        <div className="flex justify-between relative">
          {statusSteps.map((step, index) => {
            const status = getStepStatus(index);
            
            return (
              <div key={step.key} className="flex flex-col items-center">
                {/* Step Icon */}
                <div 
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm relative z-10 ${
                    status === 'completed' 
                      ? 'bg-green-500 text-white border-green-500' :
                    status === 'active'
                      ? 'bg-primary-500 text-white border-primary-500' :
                      'bg-white text-gray-400 border-gray-200'
                  }`}
                >
                  {status === 'completed' ? '✓' : step.icon}
                </div>
                
                {/* Step Label */}
                <span className={`text-xs mt-2 text-center max-w-16 leading-tight ${
                  status === 'completed' ? 'text-green-600 font-medium' :
                  status === 'active' ? 'text-primary-600 font-medium' :
                  'text-gray-500'
                }`}>
                  {step.shortLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Step Info */}
      {currentStatus !== 'completed' && currentStatus !== 'cancelled' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-800 font-medium">
              {currentStatus === 'preparing' && 'Kitchen is preparing your order'}
              {currentStatus === 'ready' && order.orderType === 'table' && 'Your order is ready for pickup'}
              {currentStatus === 'ready' && order.orderType === 'delivery' && 'Order is ready for delivery'}
              {currentStatus === 'delivering' && 'Driver is on the way'}
              {currentStatus === 'pending' && 'Order received, awaiting confirmation'}
              {currentStatus === 'confirmed' && 'Order confirmed, starting preparation'}
            </span>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {currentStatus === 'completed' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
          <div className="text-green-800">
            <div className="text-2xl mb-1">🎉</div>
            <p className="text-sm font-medium">Order Complete!</p>
            <p className="text-xs">Thank you for your order</p>
          </div>
        </div>
      )}
    </div>
  );
}