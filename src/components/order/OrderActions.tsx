'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUIStore } from '@/stores';
import { Order } from '@/stores/orderStore';

interface OrderActionsProps {
  order: Order;
}

export function OrderActions({ order }: OrderActionsProps) {
  const t = useTranslations();
  const router = useRouter();
  const { showSuccessToast, showErrorToast } = useUIStore();

  const handleCallRestaurant = () => {
    // In a real app, this would initiate a phone call
    const phoneNumber = '+84987654321'; // Mock restaurant phone
    window.open(`tel:${phoneNumber}`);
    showSuccessToast(t('order.actions.callInitiated'));
  };

  const handleReorderItems = () => {
    // Add all items from this order back to cart
    showSuccessToast(t('order.actions.itemsAddedToCart'));
    router.push('/cart');
  };

  const handleOrderAgain = () => {
    router.push('/menu');
  };

  const handleCancelOrder = () => {
    if (order.status === 'pending' || order.status === 'confirmed') {
      // Allow cancellation for early stages
      showSuccessToast(t('order.actions.orderCancelled'));
    } else {
      showErrorToast(t('order.actions.cannotCancel'));
    }
  };

  const handleContactSupport = () => {
    // Open support chat or contact form
    showSuccessToast(t('order.actions.supportContacted'));
  };

  const canCancel = order.status === 'pending' || order.status === 'confirmed';
  const canReorder = order.status === 'completed';
  const isActive = !['completed', 'cancelled'].includes(order.status);

  return (
    <Card padding="md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('order.actions.title')}
      </h3>
      
      <div className="space-y-3">
        {/* Call Restaurant */}
        <Button
          variant="outline"
          onClick={handleCallRestaurant}
          className="w-full justify-start"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {t('order.actions.callRestaurant')}
        </Button>

        {/* Cancel Order (if allowed) */}
        {canCancel && (
          <Button
            variant="outline"
            onClick={handleCancelOrder}
            className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('order.actions.cancelOrder')}
          </Button>
        )}

        {/* Reorder (for completed orders) */}
        {canReorder && (
          <Button
            variant="outline"
            onClick={handleReorderItems}
            className="w-full justify-start text-primary-600"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('order.actions.reorder')}
          </Button>
        )}

        {/* Order Again */}
        <Button
          variant="outline"
          onClick={handleOrderAgain}
          className="w-full justify-start"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('order.actions.orderAgain')}
        </Button>

        {/* Contact Support */}
        <Button
          variant="ghost"
          onClick={handleContactSupport}
          className="w-full justify-start text-gray-600"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('order.actions.contactSupport')}
        </Button>
      </div>

      {/* Order Status Help */}
      {isActive && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-1">
            {t('order.help.title')}
          </h4>
          <p className="text-xs text-blue-700">
            {order.orderType === 'delivery' 
              ? t('order.help.deliveryInstructions')
              : t('order.help.tableInstructions')
            }
          </p>
        </div>
      )}

      {/* Completed Order Actions */}
      {order.status === 'completed' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-green-800">
              {t('order.completed.title')}
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            {t('order.completed.message')}
          </p>
        </div>
      )}
    </Card>
  );
}