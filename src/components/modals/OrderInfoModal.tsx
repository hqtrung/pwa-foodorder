'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useCartStore } from '@/stores';

interface OrderInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  requireSelection?: boolean;
  onSave?: (orderType: 'table' | 'delivery', tableNumber?: string) => void;
}

export function OrderInfoModal({ 
  isOpen, 
  onClose, 
  requireSelection = false,
  onSave 
}: OrderInfoModalProps) {
  const t = useTranslations();
  const { 
    orderType, 
    tableNumber, 
    setOrderType, 
    setTableNumber,
    deliveryAddress,
    setDeliveryAddress
  } = useCartStore();
  
  const [tempOrderType, setTempOrderType] = useState<'table' | 'delivery' | null>(orderType);
  const [tempTableNumber, setTempTableNumber] = useState(tableNumber || '');
  const [tempDeliveryAddress, setTempDeliveryAddress] = useState(deliveryAddress || '');

  const handleSave = () => {
    if (tempOrderType) {
      if (onSave) {
        // Use custom save callback
        onSave(tempOrderType, tempOrderType === 'table' ? tempTableNumber : undefined);
      } else {
        // Default behavior - update cart store
        setOrderType(tempOrderType);
        
        if (tempOrderType === 'table' && tempTableNumber) {
          setTableNumber(tempTableNumber);
        } else if (tempOrderType === 'delivery' && tempDeliveryAddress) {
          setDeliveryAddress(tempDeliveryAddress);
        }
      }
    }
    
    onClose();
  };

  const handleCancel = () => {
    if (requireSelection && !orderType) {
      // Don't allow closing if selection is required and no order type is set
      return;
    }
    
    // Reset to original values
    setTempOrderType(orderType);
    setTempTableNumber(tableNumber || '');
    setTempDeliveryAddress(deliveryAddress || '');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={requireSelection && !orderType ? () => {} : handleCancel} 
      title={requireSelection ? t('menu.orderTypeRequired.title') : t('cart.orderInfo.edit')}
    >
      <div className="space-y-6">
        {/* Order Type Selection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">
            {t('cart.orderInfo.orderTypeSelection.title')}
          </h3>
          
          <div className="space-y-3">
            {/* Table Service Option */}
            <Card 
              padding="sm"
              className={`cursor-pointer border-2 transition-colors ${
                tempOrderType === 'table' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setTempOrderType('table')}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🍽️</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {t('cart.orderInfo.orderTypeSelection.tableService.title')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t('cart.orderInfo.orderTypeSelection.tableService.description')}
                  </p>
                </div>
                {tempOrderType === 'table' && (
                  <div className="text-primary-600">✓</div>
                )}
              </div>
            </Card>

            {/* Delivery Option */}
            <Card 
              padding="sm"
              className={`cursor-pointer border-2 transition-colors ${
                tempOrderType === 'delivery' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setTempOrderType('delivery')}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🚀</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {t('cart.orderInfo.orderTypeSelection.delivery.title')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t('cart.orderInfo.orderTypeSelection.delivery.description')}
                  </p>
                </div>
                {tempOrderType === 'delivery' && (
                  <div className="text-primary-600">✓</div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Table Number Input */}
        {tempOrderType === 'table' && (
          <div className="space-y-3">
            <label className="block font-semibold text-gray-900">
              {t('cart.orderInfo.orderTypeSelection.tableNumber.label')}
            </label>
            <Input
              type="number"
              value={tempTableNumber}
              onChange={(e) => setTempTableNumber(e.target.value)}
              placeholder={t('cart.orderInfo.orderTypeSelection.tableNumber.placeholder')}
              min="1"
              max="50"
              className="w-full"
            />
            <p className="text-sm text-gray-600">
              {t('cart.orderInfo.orderTypeSelection.tableNumber.hint')}
            </p>
          </div>
        )}

        {/* Delivery Address Input */}
        {tempOrderType === 'delivery' && (
          <div className="space-y-3">
            <label className="block font-semibold text-gray-900">
              {t('cart.orderInfo.orderTypeSelection.deliveryAddress.label')}
            </label>
            <Input
              as="textarea"
              value={tempDeliveryAddress}
              onChange={(e) => setTempDeliveryAddress(e.target.value)}
              placeholder={t('cart.orderInfo.orderTypeSelection.deliveryAddress.placeholder')}
              rows={3}
              className="w-full"
            />
            <p className="text-sm text-gray-600">
              {t('cart.orderInfo.orderTypeSelection.deliveryAddress.hint')}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          {!requireSelection && (
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              {t('common.actions.cancel')}
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={
              !tempOrderType || 
              (tempOrderType === 'table' && !tempTableNumber) ||
              (tempOrderType === 'delivery' && !tempDeliveryAddress)
            }
            className={requireSelection ? "w-full" : "flex-1"}
          >
            {requireSelection ? t('common.actions.continue') : t('common.actions.save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}