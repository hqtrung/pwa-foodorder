'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useFormState, ValidationRule } from '@/hooks/useFormState';

interface TableFormData {
  customerName: string;
  phone: string;
  email: string;
  specialInstructions: string;
}

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
        validate: (value: string) => !value || /^[0-9+\-\s()]{10,}$/.test(value),
        message: t('checkout.validation.phone.invalid')
      } as ValidationRule<string>
    ],
    email: [
      {
        validate: (value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: t('checkout.validation.email.invalid')
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
  } = useFormState<TableFormData>({
    initialValues: {
      customerName: data.customerName || '',
      phone: data.phone || '',
      email: data.email || '',
      specialInstructions: data.specialInstructions || ''
    },
    validation
  });

  // Sync form state with parent
  useEffect(() => {
    onChange(values);
  }, [values, onChange]);

  // Handle field changes with validation
  const handleFieldChange = (field: keyof TableFormData, value: string) => {
    setValue(field, value);
  };

  // Handle field blur for validation
  const handleFieldBlur = (field: keyof TableFormData) => {
    markAsTouched(field);
    validateField(field);
  };

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

          <div>
            <Input
              label={t('checkout.form.phone')}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={t('checkout.form.phonePlaceholder')}
              value={values.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              onBlur={() => handleFieldBlur('phone')}
              error={touched.phone ? errors.phone : undefined}
              helperText={t('checkout.form.phoneHint')}
              className="touch-manipulation"
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
              helperText={t('checkout.form.emailHint')}
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