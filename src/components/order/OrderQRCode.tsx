'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/Button';
import { Order } from '@/stores/orderStore';

interface OrderQRCodeProps {
  order: Order;
  size?: number;
  showOrderInfo?: boolean;
  className?: string;
}

export function OrderQRCode({ 
  order, 
  size = 128, 
  showOrderInfo = true, 
  className = '' 
}: OrderQRCodeProps) {
  const locale = useLocale();
  const [orderUrl, setOrderUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate the order tracking URL
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/${locale}/order/${order.id}`;
      setOrderUrl(url);
    }
  }, [order.id, locale]);

  const handleCopyUrl = async () => {
    if (orderUrl) {
      try {
        await navigator.clipboard.writeText(orderUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy URL:', error);
      }
    }
  };

  const handleShareOrder = async () => {
    if (navigator.share && orderUrl) {
      try {
        await navigator.share({
          title: `Order #${order.orderNumber}`,
          text: `Track my food order #${order.orderNumber}`,
          url: orderUrl,
        });
      } catch (error) {
        console.error('Failed to share:', error);
        // Fallback to copy
        handleCopyUrl();
      }
    } else {
      handleCopyUrl();
    }
  };

  if (!orderUrl) {
    return (
      <div className={`text-center ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded" style={{ width: size, height: size }}>
        </div>
        <p className="text-xs text-gray-500 mt-2">Generating QR code...</p>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      {/* QR Code */}
      <div className="inline-block p-3 bg-white rounded-lg shadow-sm border">
        <QRCode
          size={size}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={orderUrl}
          viewBox={`0 0 256 256`}
        />
      </div>

      {/* Order Info */}
      {showOrderInfo && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-900">
            Order #{order.orderNumber}
          </p>
          <p className="text-xs text-gray-600">
            Scan to track order
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3 space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleShareOrder}
          className="text-xs"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          {copied ? 'Copied!' : 'Share Order'}
        </Button>

        <div className="text-xs text-gray-500 break-all">
          {orderUrl}
        </div>
      </div>
    </div>
  );
}

interface OrderQRModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderQRModal({ order, isOpen, onClose }: OrderQRModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Order QR Code
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <OrderQRCode 
          order={order} 
          size={200} 
          showOrderInfo={true}
          className="mb-4"
        />

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Share this QR code to let others track your order
          </p>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}