'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface DeliveryCheckoutFormProps {
  data: {
    customerName?: string;
    phone?: string;
    email?: string;
    address?: string;
    deliveryInstructions?: string;
    specialInstructions?: string;
  };
  onChange: (updates: Record<string, string>) => void;
}

export function DeliveryCheckoutForm({ data, onChange }: DeliveryCheckoutFormProps) {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      {/* Delivery Information */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            {t('checkout.deliveryInfo.title')}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
            </svg>
            <span>{t('checkout.deliveryInfo.badge')}</span>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                {t('checkout.deliveryInfo.notice.title')}
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                {t('checkout.deliveryInfo.notice.description')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Customer Information */}
      <Card padding="md">
        <h3 className="font-semibold text-gray-900 mb-4">
          {t('checkout.customerInfo.title')}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('checkout.form.customerName')} *
            </label>
            <Input
              type="text"
              placeholder={t('checkout.form.customerNamePlaceholder')}
              value={data.customerName || ''}
              onChange={(e) => onChange({ customerName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('checkout.form.phone')} *
              </label>
              <Input
                type="tel"
                placeholder={t('checkout.form.phonePlaceholder')}
                value={data.phone || ''}
                onChange={(e) => onChange({ phone: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('checkout.form.email')}
              </label>
              <Input
                type="email"
                placeholder={t('checkout.form.emailPlaceholder')}
                value={data.email || ''}
                onChange={(e) => onChange({ email: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Delivery Address */}
      <Card padding="md">
        <h3 className="font-semibold text-gray-900 mb-4">
          {t('checkout.deliveryAddress.title')}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('checkout.form.address')} *
            </label>
            <Input
              as="textarea"
              placeholder={t('checkout.form.addressPlaceholder')}
              value={data.address || ''}
              onChange={(e) => onChange({ address: e.target.value })}
              rows={3}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('checkout.form.addressHint')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('checkout.form.deliveryInstructions')}
            </label>
            <Input
              as="textarea"
              placeholder={t('checkout.form.deliveryInstructionsPlaceholder')}
              value={data.deliveryInstructions || ''}
              onChange={(e) => onChange({ deliveryInstructions: e.target.value })}
              rows={2}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('checkout.form.deliveryInstructionsHint')}
            </p>
          </div>
        </div>
      </Card>

      {/* Special Instructions */}
      <Card padding="md">
        <h3 className="font-semibold text-gray-900 mb-4">
          {t('checkout.specialInstructions.title')}
        </h3>
        
        <div>
          <Input
            as="textarea"
            placeholder={t('checkout.specialInstructions.placeholder')}
            value={data.specialInstructions || ''}
            onChange={(e) => onChange({ specialInstructions: e.target.value })}
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-2">
            {t('checkout.specialInstructions.hint')}
          </p>
        </div>
      </Card>
    </div>
  );
}