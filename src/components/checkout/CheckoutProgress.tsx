'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/common-utils';

interface CheckoutProgressProps {
  sections: {
    customer: { completed: boolean; required: boolean };
    delivery: { completed: boolean; required: boolean };
    payment: { completed: boolean; required: boolean };
    instructions: { completed: boolean; required: boolean };
  };
  className?: string;
  showLabels?: boolean;
  variant?: 'bar' | 'steps';
}

interface ProgressSection {
  key: keyof CheckoutProgressProps['sections'];
  label: string;
  completed: boolean;
  required: boolean;
}

export function CheckoutProgress({ 
  sections, 
  className, 
  showLabels = false,
  variant = 'bar'
}: CheckoutProgressProps) {
  const t = useTranslations();

  // Calculate progress metrics
  const { progress, completedCount, requiredCount, allRequiredComplete } = useMemo(() => {
    const sectionList: ProgressSection[] = [
      { key: 'customer', label: t('checkout.progress.customer'), ...sections.customer },
      { key: 'delivery', label: t('checkout.progress.delivery'), ...sections.delivery },
      { key: 'payment', label: t('checkout.progress.payment'), ...sections.payment },
      { key: 'instructions', label: t('checkout.progress.instructions'), ...sections.instructions }
    ];

    const requiredSections = sectionList.filter(s => s.required);
    const completedSections = sectionList.filter(s => s.completed);
    const completedRequired = requiredSections.filter(s => s.completed);

    const totalSections = sectionList.length;
    const progressPercent = (completedSections.length / totalSections) * 100;
    const allRequiredComplete = completedRequired.length === requiredSections.length;

    return {
      progress: Math.round(progressPercent),
      completedCount: completedSections.length,
      totalCount: totalSections,
      requiredCount: requiredSections.length,
      allRequiredComplete,
      sections: sectionList
    };
  }, [sections, t]);

  if (variant === 'steps') {
    return (
      <div className={cn('space-y-2', className)}>
        {showLabels && (
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span>{t('checkout.progress.title')}</span>
            <span>{progress}% {t('checkout.progress.complete')}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          {Array.from({ length: 4 }, (_, index) => {
            const isCompleted = index < completedCount;
            const isCurrent = index === completedCount && !allRequiredComplete;
            
            return (
              <div key={index} className="flex items-center">
                <div
                  className={cn(
                    'w-3 h-3 rounded-full transition-colors duration-200',
                    isCompleted && 'bg-accent-500',
                    isCurrent && 'bg-primary-500',
                    !isCompleted && !isCurrent && 'bg-gray-200'
                  )}
                />
                {index < 3 && (
                  <div
                    className={cn(
                      'w-8 h-0.5 transition-colors duration-200',
                      index < completedCount - 1 && 'bg-accent-500',
                      index >= completedCount - 1 && 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Bar variant (default)
  return (
    <div className={cn('space-y-2', className)}>
      {showLabels && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{t('checkout.progress.title')}</span>
          <span className="font-medium">
            {progress}% {t('checkout.progress.complete')}
          </span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            allRequiredComplete 
              ? 'bg-gradient-to-r from-accent-500 to-accent-600' 
              : 'bg-gradient-to-r from-primary-500 to-primary-600'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Detailed completion status */}
      {showLabels && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {completedCount} of 4 {t('checkout.progress.sectionsComplete')}
          </span>
          {allRequiredComplete && (
            <div className="flex items-center space-x-1 text-accent-600">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{t('checkout.progress.readyToOrder')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Hook to manage checkout progress state
export function useCheckoutProgress(formData: any, orderType: string) {
  return useMemo(() => {
    const customer = {
      completed: Boolean(formData.customerName?.trim()),
      required: true
    };

    const delivery = {
      completed: orderType === 'table' 
        ? true // Table orders don't need delivery info
        : Boolean(formData.address?.trim()),
      required: orderType === 'delivery'
    };

    const payment = {
      completed: Boolean(formData.paymentMethod),
      required: true
    };

    const instructions = {
      completed: Boolean(formData.specialInstructions?.trim()),
      required: false
    };

    return { customer, delivery, payment, instructions };
  }, [formData, orderType]);
}