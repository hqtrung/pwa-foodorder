'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCartStore } from '@/stores';
import { useState, useEffect } from 'react';

export function FloatingCartButton() {
  const t = useTranslations();
  const router = useRouter();
  const cartItemCount = useCartStore(state => state.getItemCount());
  const cartSubtotal = useCartStore(state => state.summary.subtotal);
  const calculateSummary = useCartStore(state => state.calculateSummary);
  const [showBounce, setShowBounce] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted on client-side
  useEffect(() => {
    setIsMounted(true);
    calculateSummary();
  }, [calculateSummary]);

  // Animate when cart count changes
  useEffect(() => {
    if (cartItemCount > 0) {
      setShowBounce(true);
      const timer = setTimeout(() => setShowBounce(false), 600);
      return () => clearTimeout(timer);
    }
  }, [cartItemCount]);

  // Don't render if cart is empty or not mounted yet
  if (!isMounted || cartItemCount === 0) {
    return null;
  }

  const handleClick = () => {
    router.push('/cart');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={handleClick}
        className={`
          relative bg-primary-500 hover:bg-primary-600 text-white 
          w-16 h-16 rounded-full shadow-lg hover:shadow-xl
          flex items-center justify-center
          transition-all duration-300 ease-out
          animate-float
          ${showBounce ? 'animate-bounce-gentle' : ''}
        `}
        aria-label={t('cart.viewCart')}
      >
        {/* Cart Icon */}
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5 1.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" 
          />
        </svg>

        {/* Item Count Badge */}
        {cartItemCount > 0 && (
          <div 
            className="absolute -top-2 -right-2 bg-secondary-500 text-white text-xs font-bold 
                       min-w-[20px] h-5 rounded-full flex items-center justify-center px-1
                       animate-pulse-gentle"
          >
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </div>
        )}

        {/* Ripple Effect */}
        <div className="absolute inset-0 rounded-full bg-primary-400 opacity-30 animate-ping"></div>
      </button>

      {/* Subtotal Tooltip on Hover */}
      <div 
        className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-xs 
                   px-3 py-2 rounded-lg opacity-0 pointer-events-none
                   transition-opacity duration-200 whitespace-nowrap
                   hover:opacity-100"
      >
        {cartSubtotal.toLocaleString()}₫
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 
                        border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}