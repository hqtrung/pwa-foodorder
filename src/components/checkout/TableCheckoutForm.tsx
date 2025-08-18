'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface TableCheckoutFormProps {
  data: {
    customerName?: string;
    phone?: string;
    email?: string;
    specialInstructions?: string;
  };
  onChange: (updates: Record<string, string>) => void;
  tableNumber?: string;
}

export function TableCheckoutForm({ data, onChange, tableNumber }: TableCheckoutFormProps) {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      {/* Table Information */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            {t('checkout.tableInfo.title')}
          </h3>
          <div className="text-lg font-bold text-primary-600">
            {t('checkout.tableInfo.number', { number: tableNumber || '1' })}
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-800">
                {t('checkout.tableInfo.instructions.title')}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {t('checkout.tableInfo.instructions.description')}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('checkout.form.phone')}
            </label>
            <Input
              type="tel"
              placeholder={t('checkout.form.phonePlaceholder')}
              value={data.phone || ''}
              onChange={(e) => onChange({ phone: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('checkout.form.phoneHint')}
            </p>
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
            <p className="text-xs text-gray-500 mt-1">
              {t('checkout.form.emailHint')}
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