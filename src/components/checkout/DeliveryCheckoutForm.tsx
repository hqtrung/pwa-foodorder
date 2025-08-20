'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useFormState, ValidationRule } from '@/hooks/useFormState';

interface DeliveryFormData {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  deliveryInstructions: string;
  specialInstructions: string;
}

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

  // Validation rules
  const validation = {
    customerName: [
      {
        validate: (value: string) => value.trim().length >= 2,
        message: t('checkout.validation.customerName.minLength')
      } as ValidationRule<string>
    ],
    phone: [
      {
        validate: (value: string) => /^[0-9+\-\s()]{10,}$/.test(value),
        message: t('checkout.validation.phone.invalid')
      } as ValidationRule<string>
    ],
    email: [
      {
        validate: (value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: t('checkout.validation.email.invalid')
      } as ValidationRule<string>
    ],
    address: [
      {
        validate: (value: string) => value.trim().length >= 10,
        message: t('checkout.validation.address.minLength')
      } as ValidationRule<string>
    ]
  };

  // Form state
  const {
    values,
    errors,
    touched,
    setValue,
    markAsTouched,
    validateField
  } = useFormState<DeliveryFormData>({
    initialValues: {
      customerName: data.customerName || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      deliveryInstructions: data.deliveryInstructions || '',
      specialInstructions: data.specialInstructions || ''
    },
    validation
  });

  // Sync form state with parent
  useEffect(() => {
    onChange(values);
  }, [values, onChange]);

  // Handle field changes with validation
  const handleFieldChange = (field: keyof DeliveryFormData, value: string) => {
    setValue(field, value);
  };

  // Handle field blur for validation
  const handleFieldBlur = (field: keyof DeliveryFormData) => {
    markAsTouched(field);
    validateField(field);
  };

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
            <Input
              label={`${t('checkout.form.customerName')} *`}
              type="text"
              inputMode="text"
              autoComplete="name"
              placeholder={t('checkout.form.customerNamePlaceholder')}
              value={values.customerName}
              onChange={(e) => handleFieldChange('customerName', e.target.value)}
              onBlur={() => handleFieldBlur('customerName')}
              error={touched.customerName ? errors.customerName : undefined}
              className="touch-manipulation"
              required
            />
          </div>

          <div className="form-grid-responsive">
            <div>
              <Input
                label={`${t('checkout.form.phone')} *`}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={t('checkout.form.phonePlaceholder')}
                value={values.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                onBlur={() => handleFieldBlur('phone')}
                error={touched.phone ? errors.phone : undefined}
                className="touch-manipulation"
                required
              />
            </div>

            <div>
              <Input
                label={t('checkout.form.email')}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t('checkout.form.emailPlaceholder')}
                value={values.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={() => handleFieldBlur('email')}
                error={touched.email ? errors.email : undefined}
                className="touch-manipulation"
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
            <Input
              label={`${t('checkout.form.address')} *`}
              as="textarea"
              autoComplete="street-address"
              placeholder={t('checkout.form.addressPlaceholder')}
              value={values.address}
              onChange={(e) => handleFieldChange('address', e.target.value)}
              onBlur={() => handleFieldBlur('address')}
              error={touched.address ? errors.address : undefined}
              helperText={t('checkout.form.addressHint')}
              rows={3}
              className="touch-manipulation"
              required
            />
          </div>

          <div>
            <Input
              label={t('checkout.form.deliveryInstructions')}
              as="textarea"
              placeholder={t('checkout.form.deliveryInstructionsPlaceholder')}
              value={values.deliveryInstructions}
              onChange={(e) => handleFieldChange('deliveryInstructions', e.target.value)}
              helperText={t('checkout.form.deliveryInstructionsHint')}
              rows={2}
              className="touch-manipulation"
            />
          </div>
        </div>
      </Card>

      {/* Special Instructions */}
      <Card padding="md">        
        <div>
          <Input
            label={t('checkout.specialInstructions.title')}
            as="textarea"
            placeholder={t('checkout.specialInstructions.placeholder')}
            value={values.specialInstructions}
            onChange={(e) => handleFieldChange('specialInstructions', e.target.value)}
            helperText={t('checkout.specialInstructions.hint')}
            rows={3}
            className="touch-manipulation"
          />
        </div>
      </Card>
    </div>
  );
}