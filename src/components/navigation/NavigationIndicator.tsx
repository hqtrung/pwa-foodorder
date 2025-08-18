'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/stores';

export function NavigationIndicator() {
  const t = useTranslations();
  const pathname = usePathname();
  const cartItemCount = useCartStore(state => state.getItemCount());

  // Extract current page from pathname
  const getCurrentPage = () => {
    const segments = pathname.split('/').filter(Boolean);
    
    // Remove locale from segments if present
    const localeSegments = ['vi', 'en', 'fr', 'it', 'zh', 'ja'];
    if (localeSegments.includes(segments[0])) {
      segments.shift();
    }

    if (segments.length === 0) return 'home';
    
    const page = segments[0];
    switch (page) {
      case 'menu':
        return 'menu';
      case 'cart':
        return 'cart';
      case 'checkout':
        return 'checkout';
      case 'order':
        return 'order';
      case 'staff':
        return 'staff';
      default:
        return 'other';
    }
  };

  const currentPage = getCurrentPage();

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'home':
        return t('common.navigation.home');
      case 'menu':
        return t('common.navigation.menu');
      case 'cart':
        return `${t('common.navigation.cart')} (${cartItemCount})`;
      case 'checkout':
        return t('checkout.title');
      case 'order':
        return t('common.navigation.orders');
      case 'staff':
        return t('common.navigation.staff');
      default:
        return 'Unknown Page';
    }
  };

  const getPageIcon = (page: string) => {
    switch (page) {
      case 'home':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'menu':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'cart':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5 1.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        );
      case 'checkout':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'order':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'staff':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
    }
  };

  return (
    <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
      {getPageIcon(currentPage)}
      <span className="font-medium">
        {getPageTitle(currentPage)}
      </span>
    </div>
  );
}