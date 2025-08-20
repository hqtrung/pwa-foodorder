'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';

interface PaymentMethodSelectorProps {
  selected?: 'cash' | 'card' | 'momo' | 'zalopay';
  onChange: (method: 'cash' | 'card' | 'momo' | 'zalopay') => void;
  orderType?: 'table' | 'delivery';
}

export function PaymentMethodSelector({ selected, onChange, orderType }: PaymentMethodSelectorProps) {
  const t = useTranslations();

  // Filter payment methods based on order type
  const allPaymentMethods = [
    {
      id: 'cash' as const,
      name: t('checkout.payment.methods.cash'),
      description: orderType === 'table' 
        ? 'Thanh toán bằng tiền mặt tại quầy'
        : t('checkout.payment.descriptions.cash'),
      icon: '💵',
      available: true,
      orderTypes: ['table', 'delivery'] as const
    },
    {
      id: 'card' as const,
      name: t('checkout.payment.methods.card'),
      description: orderType === 'table'
        ? 'Thanh toán bằng thẻ Visa, MasterCard tại quầy'
        : t('checkout.payment.descriptions.card'),
      icon: '💳',
      available: true,
      orderTypes: ['table'] as const
    },
    {
      id: 'momo' as const,
      name: t('checkout.payment.methods.momo'),
      description: t('checkout.payment.descriptions.momo'),
      icon: '📱',
      available: false, // QR pay - to be implemented later
      orderTypes: ['delivery'] as const
    },
    {
      id: 'zalopay' as const,
      name: t('checkout.payment.methods.zalopay'),
      description: t('checkout.payment.descriptions.zalopay'),
      icon: '💰',
      available: false, // QR pay - to be implemented later
      orderTypes: ['delivery'] as const
    }
  ];

  // Filter methods based on order type
  const paymentMethods = allPaymentMethods.filter(method => 
    !orderType || method.orderTypes.includes(orderType)
  );

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <Card padding="md">
        <h3 className="font-semibold text-gray-900 mb-4">
          {t('checkout.payment.selectMethod')}
        </h3>
        
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`block cursor-pointer ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div
                className={`border-2 rounded-lg p-4 transition-all duration-200 ${
                  selected === method.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!method.available ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selected === method.id}
                    onChange={() => method.available && onChange(method.id)}
                    disabled={!method.available}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  
                  <div className="ml-3 flex items-center flex-1">
                    <div className="text-2xl mr-3">{method.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {method.name}
                        </span>
                        {!method.available && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {t('checkout.payment.comingSoon')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </Card>

      {/* Payment Info */}
      {selected && selected === 'cash' && (
        <Card padding="md" className="bg-green-50 border-green-200">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-green-800">
                {t('checkout.payment.cashInfo.title')}
              </h4>
              <p className="text-sm text-green-700 mt-1">
                {t('checkout.payment.cashInfo.description')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {selected && selected === 'card' && (
        <Card padding="md" className="bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-800">
                {t('checkout.payment.cardInfo.title')}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {t('checkout.payment.cardInfo.description')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {selected && (selected === 'momo' || selected === 'zalopay') && (
        <Card padding="md" className="bg-purple-50 border-purple-200">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-purple-800">
                {t('checkout.payment.digitalWalletInfo.title')}
              </h4>
              <p className="text-sm text-purple-700 mt-1">
                {t('checkout.payment.digitalWalletInfo.description', {
                  method: selected === 'momo' ? 'MoMo' : 'ZaloPay'
                })}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Security Notice */}
      <Card padding="sm" className="bg-gray-50">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>{t('checkout.payment.securityNotice')}</span>
        </div>
      </Card>
    </div>
  );
}