'use client';

import { useTranslations } from 'next-intl';
import { Order } from '@/stores/orderStore';

interface OrderStatusTimelineProps {
  order: Order;
  currentStatus: string;
}

export function OrderStatusTimeline({ order, currentStatus }: OrderStatusTimelineProps) {
  const t = useTranslations();

  // Add null safety check
  if (!order) {
    return (
      <div className="text-center text-gray-500 py-8">
        {t('order.loading')}
      </div>
    );
  }

  const getStatusSteps = (orderType: 'table' | 'delivery') => {
    const baseSteps = [
      { key: 'pending', icon: '📝', color: 'blue' },
      { key: 'confirmed', icon: '✅', color: 'green' },
      { key: 'preparing', icon: '👨‍🍳', color: 'yellow' },
      { key: 'ready', icon: orderType === 'delivery' ? '🚚' : '🍽️', color: 'purple' }
    ];

    if (orderType === 'delivery') {
      baseSteps.push(
        { key: 'delivering', icon: '🛵', color: 'orange' },
        { key: 'completed', icon: '🎉', color: 'green' }
      );
    } else {
      baseSteps.push(
        { key: 'completed', icon: '🎉', color: 'green' }
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

  const getStepColor = (status: string, color: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return `bg-${color}-100 text-${color}-800 border-${color}-200`;
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getConnectorColor = (stepIndex: number) => {
    const status = getStepStatus(stepIndex + 1);
    return status === 'completed' ? 'bg-green-400' : 'bg-gray-300';
  };

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        {statusSteps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === statusSteps.length - 1;
          
          return (
            <div key={step.key} className="relative flex items-start">
              {/* Timeline connector */}
              {!isLast && (
                <div 
                  className={`absolute left-6 top-12 w-0.5 h-16 ${getConnectorColor(index)}`}
                  style={{ zIndex: 0 }}
                />
              )}
              
              {/* Step content */}
              <div className="relative flex items-center space-x-4 pb-8">
                {/* Step icon */}
                <div 
                  className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg ${
                    getStepColor(status, step.color)
                  }`}
                  style={{ zIndex: 1 }}
                >
                  {step.icon}
                </div>
                
                {/* Step details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${
                      status === 'completed' ? 'text-green-800' :
                      status === 'active' ? 'text-gray-900' :
                      'text-gray-600'
                    }`}>
                      {t(`order.status.${step.key}`)}
                    </h4>
                    
                    {/* Timestamp */}
                    {order.statusHistory?.find(h => h.status === step.key) && (
                      <span className="text-xs text-gray-500">
                        {new Date(
                          order.statusHistory.find(h => h.status === step.key)!.timestamp
                        ).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                  
                  {/* Step description */}
                  <p className={`text-sm mt-1 ${
                    status === 'completed' ? 'text-green-700' :
                    status === 'active' ? 'text-gray-700' :
                    'text-gray-500'
                  }`}>
                    {t(`order.statusDescriptions.${step.key}`, {
                      type: order.orderType || 'table'
                    })}
                  </p>
                  
                  {/* Additional info for active step */}
                  {status === 'active' && (
                    <div className="mt-2">
                      {step.key === 'preparing' && (
                        <div className="flex items-center space-x-2 text-xs text-yellow-700 bg-yellow-50 rounded-md px-2 py-1">
                          <div className="animate-pulse w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>{t('order.status.preparingActive')}</span>
                        </div>
                      )}
                      
                      {step.key === 'ready' && order.orderType === 'table' && (
                        <div className="flex items-center space-x-2 text-xs text-blue-700 bg-blue-50 rounded-md px-2 py-1">
                          <div className="animate-bounce w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>{t('order.status.readyTableActive')}</span>
                        </div>
                      )}
                      
                      {step.key === 'delivering' && (
                        <div className="flex items-center space-x-2 text-xs text-orange-700 bg-orange-50 rounded-md px-2 py-1">
                          <div className="animate-pulse w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>{t('order.status.deliveringActive')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}