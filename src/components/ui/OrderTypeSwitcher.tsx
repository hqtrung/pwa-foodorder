'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { OrderInfoModal } from '@/components/modals/OrderInfoModal';
import { useCartStore } from '@/stores';
import { useMenuHashState } from '@/hooks/useUrlState';

export function OrderTypeSwitcher() {
  const t = useTranslations();
  const [modalOpen, setModalOpen] = useState(false);
  const { orderType, tableNumber } = useCartStore();
  const { setOrderInfo } = useMenuHashState();

  const handleSave = (newOrderType: 'table' | 'delivery', newTableNumber?: string) => {
    // Update cart store
    useCartStore.getState().setOrderType(newOrderType);
    if (newOrderType === 'table' && newTableNumber) {
      useCartStore.getState().setTableNumber(newTableNumber);
    }
    
    // Update URL hash
    setOrderInfo(newOrderType, newTableNumber);
    
    // Close modal
    setModalOpen(false);
  };

  if (!orderType) {
    return null;
  }

  return (
    <>
      <Button 
        variant="ghost" 
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-1.5 text-sm px-2 py-1 h-8"
      >
        {orderType === 'table' ? (
          <>
            <span className="text-base">🍽️</span>
            <span className="hidden sm:inline">{t('menu.orderInfo.table', { number: tableNumber || '1' })}</span>
            <span className="sm:hidden">#{tableNumber || '1'}</span>
          </>
        ) : (
          <>
            <span className="text-base">🚚</span>
            <span className="hidden sm:inline">{t('menu.orderInfo.delivery')}</span>
            <span className="sm:hidden">{t('common.delivery')}</span>
          </>
        )}
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>
      
      <OrderInfoModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}