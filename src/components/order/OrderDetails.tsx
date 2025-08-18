'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Order } from '@/stores/orderStore';
import { OrderQRCode } from './OrderQRCode';

interface OrderDetailsProps {
  order: Order;
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const t = useTranslations();
  const locale = useLocale();

  console.log('🔍 OrderDetails received order:', order);
  console.log('🔍 OrderDetails order items:', order.items);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <Card padding="md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('order.details.customerInfo')}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">{t('order.details.name')}</span>
            <p className="font-medium">{order.customer.name}</p>
          </div>
          
          {order.customer.phone && (
            <div>
              <span className="text-gray-600">{t('order.details.phone')}</span>
              <p className="font-medium">{order.customer.phone}</p>
            </div>
          )}
          
          {order.customer.email && (
            <div className="sm:col-span-2">
              <span className="text-gray-600">{t('order.details.email')}</span>
              <p className="font-medium">{order.customer.email}</p>
            </div>
          )}
          
          {order.orderType === 'table' && order.tableNumber && (
            <div>
              <span className="text-gray-600">{t('order.details.table')}</span>
              <p className="font-medium">{t('order.details.tableNumber', { number: order.tableNumber })}</p>
            </div>
          )}
          
          {order.orderType === 'delivery' && order.deliveryInfo?.address && (
            <div className="sm:col-span-2">
              <span className="text-gray-600">{t('order.details.deliveryAddress')}</span>
              <p className="font-medium">{order.deliveryInfo?.address}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Order Items */}
      <Card padding="md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('order.details.items')} ({order.items.length})
        </h3>
        
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div 
              key={item.id}
              className={`border-b border-gray-200 pb-4 ${index === order.items.length - 1 ? 'border-b-0 pb-0' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center text-xs font-medium">
                      {item.quantity}
                    </span>
                    <h4 className="font-medium text-gray-900">
                      {item.product?.name || 'Unknown Product'}
                    </h4>
                  </div>
                  
                  {/* Toppings */}
                  {item.toppings.length > 0 && (
                    <div className="mt-2 ml-8">
                      <p className="text-xs text-gray-500 mb-1">{t('order.details.toppings')}:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.toppings.map((topping) => (
                          <span
                            key={topping.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                          >
                            {topping.name || topping.name?.[locale as keyof typeof topping.name] || 'Unknown Topping'}
                            <span className="ml-1 font-medium">
                              +{formatPrice(topping.price)}₫
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Special Instructions */}
                  {item.specialInstructions && (
                    <div className="mt-2 ml-8">
                      <p className="text-xs text-gray-500">{t('order.details.specialInstructions')}:</p>
                      <p className="text-xs text-gray-700 bg-yellow-50 rounded px-2 py-1 mt-1">
                        {item.specialInstructions}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="text-right ml-4">
                  <p className="font-medium text-gray-900">
                    {formatPrice(item.totalPrice || item.price || 0)}₫
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-gray-500">
                      {formatPrice((item.totalPrice || item.price || 0) / item.quantity)}₫ {t('order.details.each')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Order Summary */}
      <Card padding="md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('order.details.summary')}
        </h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('order.details.subtotal')}</span>
            <span>{formatPrice(order.summary.subtotal)}₫</span>
          </div>
          
          {order.summary.deliveryFee > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">{t('order.details.deliveryFee')}</span>
              <span>{formatPrice(order.summary.deliveryFee)}₫</span>
            </div>
          )}
          
          {order.summary.tax > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">{t('order.details.tax')}</span>
              <span>{formatPrice(order.summary.tax)}₫</span>
            </div>
          )}
          
          {order.summary.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>{t('order.details.discount')}</span>
              <span>-{formatPrice(order.summary.discount)}₫</span>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-base font-semibold">
              <span>{t('order.details.total')}</span>
              <span className="text-primary-600">{formatPrice(order.summary.total)}₫</span>
            </div>
          </div>
        </div>
      </Card>

      {/* QR Code */}
      <Card padding="md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Share Order
        </h3>
        <div className="text-center">
          <OrderQRCode 
            order={order} 
            size={150} 
            showOrderInfo={true}
          />
        </div>
      </Card>

      {/* Special Instructions */}
      {order.specialInstructions && (
        <Card padding="md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('order.details.orderInstructions')}
          </h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">{order.specialInstructions}</p>
          </div>
        </Card>
      )}
    </div>
  );
}