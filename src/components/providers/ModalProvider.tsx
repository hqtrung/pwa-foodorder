'use client';

import { useUIStore } from '@/stores';
import { ProductDetailModal } from '@/components/modals/ProductDetailModal';

export function ModalProvider() {
  const { modals, closeModal } = useUIStore();

  return (
    <>
      {modals.map((modal) => {
        switch (modal.type) {
          case 'product-detail':
            return (
              <ProductDetailModal
                key={modal.id}
                isOpen={modal.isOpen}
                onClose={() => closeModal(modal.id)}
                product={modal.data?.product}
                cartItem={modal.data?.cartItem}
              />
            );
          // Add other modal types here as needed
          default:
            return null;
        }
      })}
    </>
  );
}