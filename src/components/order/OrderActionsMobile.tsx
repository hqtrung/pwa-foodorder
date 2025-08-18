'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores';
import { Order } from '@/stores/orderStore';
import { OrderQRModal } from './OrderQRCode';

interface OrderActionsMobileProps {
  order: Order;
  onRefresh: () => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
}

export function OrderActionsMobile({ 
  order, 
  onRefresh, 
  autoRefresh, 
  onToggleAutoRefresh 
}: OrderActionsMobileProps) {
  const t = useTranslations();
  const router = useRouter();
  const { showSuccessToast, showErrorToast } = useUIStore();
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const handleCallRestaurant = () => {
    const phoneNumber = '+84987654321'; // Mock restaurant phone
    window.open(`tel:${phoneNumber}`);
    showSuccessToast('Calling restaurant...');
  };

  const handleReorderItems = () => {
    showSuccessToast('Items added to cart');
    router.push('/cart');
  };

  const handleOrderAgain = () => {
    router.push('/menu');
  };

  const handleCancelOrder = () => {
    if (order.status === 'pending' || order.status === 'confirmed') {
      showSuccessToast('Order cancelled successfully');
    } else {
      showErrorToast('Cannot cancel order at this stage');
    }
  };

  const handleContactSupport = () => {
    showSuccessToast('Support team contacted');
  };

  const canCancel = order.status === 'pending' || order.status === 'confirmed';
  const isCompleted = order.status === 'completed';

  return (
    <>
      {/* More Actions Overlay */}
      {showMoreActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowMoreActions(false)}>
          <div className="absolute bottom-20 left-4 right-4 bg-white rounded-lg shadow-lg p-4">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full text-left justify-start"
                onClick={() => {
                  setShowQRModal(true);
                  setShowMoreActions(false);
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M12 12h0.01m-4.01 0h4.01M8 16h0.01m0-4h0.01M8 12h4.01M12 8h0.01m-4.01 0h4.01M8 8h0.01" />
                </svg>
                Show QR Code
              </Button>

              <Button
                variant="outline"
                className="w-full text-left justify-start"
                onClick={() => {
                  onRefresh();
                  setShowMoreActions(false);
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Order
              </Button>

              {isCompleted && (
                <Button
                  variant="outline"
                  className="w-full text-left justify-start"
                  onClick={() => {
                    handleReorderItems();
                    setShowMoreActions(false);
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L17 18" />
                  </svg>
                  Reorder Items
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full text-left justify-start"
                onClick={() => {
                  handleOrderAgain();
                  setShowMoreActions(false);
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Order Again
              </Button>

              {canCancel && (
                <Button
                  variant="outline"
                  className="w-full text-left justify-start text-red-600 border-red-200"
                  onClick={() => {
                    handleCancelOrder();
                    setShowMoreActions(false);
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Order
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full text-left justify-start"
                onClick={() => {
                  handleContactSupport();
                  setShowMoreActions(false);
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact Support
              </Button>

              {/* Auto Refresh Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  Auto Refresh
                </span>
                <button
                  onClick={() => {
                    onToggleAutoRefresh();
                    setShowMoreActions(false);
                  }}
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
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
        <div className="px-4 py-3">
          <div className="flex space-x-3">
            {/* Primary Action - Call Restaurant */}
            <Button 
              className="flex-1"
              onClick={handleCallRestaurant}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Restaurant
            </Button>

            {/* Secondary Action - Track/More */}
            <Button 
              variant="outline"
              className="px-4"
              onClick={() => setShowMoreActions(true)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>
          </div>
          
          {/* Order Summary Footer */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${
                autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
              }`}></span>
              <span className="text-xs text-gray-500">
                {autoRefresh ? 'Live updates' : 'Manual refresh'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Order placed {new Date(order.createdAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <OrderQRModal 
        order={order}
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />
    </>
  );
}