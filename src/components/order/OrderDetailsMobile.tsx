'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { Order } from '@/stores/orderStore';
import { OrderQRCode } from './OrderQRCode';

interface OrderDetailsMobileProps {
  order: Order;
}

export function OrderDetailsMobile({ order }: OrderDetailsMobileProps) {
  const t = useTranslations();
  const locale = useLocale();
  
  const [expandedSections, setExpandedSections] = useState({
    customer: false,
    items: true, // Items expanded by default
    delivery: false,
    qrCode: false
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-3">
      {/* Order Items - Expanded by default */}
      <div className="bg-white rounded-lg shadow-sm">
        <button
          onClick={() => toggleSection('items')}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-gray-900">
              Order Items
            </h3>
            <span className="bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full text-xs font-medium">
              {order.items.length}
            </span>
          </div>
          <svg 
            className={`w-4 h-4 text-gray-500 transition-transform ${
              expandedSections.items ? 'rotate-180' : ''
            }`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.items && (
          <div className="px-4 pb-4">
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={item.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <h4 className="text-sm font-medium text-gray-900 flex-1">
                          {item.product?.name || 'Unknown Product'}
                        </h4>
                      </div>
                      
                      {/* Toppings */}
                      {item.toppings.length > 0 && (
                        <div className="mt-1 ml-7">
                          <div className="flex flex-wrap gap-1">
                            {item.toppings.map((topping) => (
                              <span
                                key={topping.id}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                              >
                                +{topping.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Special Instructions */}
                      {item.specialInstructions && (
                        <div className="mt-1 ml-7">
                          <p className="text-xs text-gray-600 italic">
                            Note: {item.specialInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Price */}
                    <div className="text-right ml-2">
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(item.totalPrice)}₫
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Total */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-primary-600">
                  {formatPrice(order.summary.total)}₫
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Information */}
      <div className="bg-white rounded-lg shadow-sm">
        <button
          onClick={() => toggleSection('customer')}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <h3 className="text-sm font-semibold text-gray-900">
            Customer Info
          </h3>
          <svg 
            className={`w-4 h-4 text-gray-500 transition-transform ${
              expandedSections.customer ? 'rotate-180' : ''
            }`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.customer && (
          <div className="px-4 pb-4 space-y-2">
            <div>
              <span className="text-xs text-gray-500">Name</span>
              <p className="text-sm font-medium">{order.customer.name}</p>
            </div>
            
            {order.customer.phone && (
              <div>
                <span className="text-xs text-gray-500">Phone</span>
                <p className="text-sm font-medium">{order.customer.phone}</p>
              </div>
            )}
            
            {order.customer.email && (
              <div>
                <span className="text-xs text-gray-500">Email</span>
                <p className="text-sm font-medium">{order.customer.email}</p>
              </div>
            )}
            
            {order.orderType === 'table' && order.tableNumber && (
              <div>
                <span className="text-xs text-gray-500">Table</span>
                <p className="text-sm font-medium">Table {order.tableNumber}</p>
              </div>
            )}
            
            <div>
              <span className="text-xs text-gray-500">Order Type</span>
              <p className="text-sm font-medium">
                {order.orderType === 'delivery' ? 'Home Delivery' : 'Table Service'}
              </p>
            </div>
            
            <div>
              <span className="text-xs text-gray-500">Payment Method</span>
              <p className="text-sm font-medium capitalize">
                {order.paymentMethod}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Information - Only show for delivery orders */}
      {order.orderType === 'delivery' && order.deliveryInfo?.address && (
        <div className="bg-white rounded-lg shadow-sm">
          <button
            onClick={() => toggleSection('delivery')}
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <h3 className="text-sm font-semibold text-gray-900">
              Delivery Info
            </h3>
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform ${
                expandedSections.delivery ? 'rotate-180' : ''
              }`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.delivery && (
            <div className="px-4 pb-4 space-y-2">
              <div>
                <span className="text-xs text-gray-500">Address</span>
                <p className="text-sm font-medium">{order.deliveryInfo.address}</p>
              </div>
              
              {order.deliveryInfo.deliveryInstructions && (
                <div>
                  <span className="text-xs text-gray-500">Instructions</span>
                  <p className="text-sm font-medium">{order.deliveryInfo.deliveryInstructions}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* QR Code */}
      <div className="bg-white rounded-lg shadow-sm">
        <button
          onClick={() => toggleSection('qrCode')}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <h3 className="text-sm font-semibold text-gray-900">
            Share Order
          </h3>
          <svg 
            className={`w-4 h-4 text-gray-500 transition-transform ${
              expandedSections.qrCode ? 'rotate-180' : ''
            }`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.qrCode && (
          <div className="px-4 pb-4">
            <OrderQRCode 
              order={order} 
              size={120} 
              showOrderInfo={false}
              className="mb-2"
            />
            <p className="text-xs text-gray-600 text-center">
              Scan QR code to track this order
            </p>
          </div>
        )}
      </div>

      {/* Special Instructions */}
      {order.specialInstructions && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Special Instructions
          </h3>
          <p className="text-sm text-gray-700 italic">
            {order.specialInstructions}
          </p>
        </div>
      )}
    </div>
  );
}