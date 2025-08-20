'use client';

import { useTranslations } from 'next-intl';
import { storeConfig } from '@/config/store';
import { cn } from '@/lib/common-utils';

export interface AppFooterProps {
  className?: string;
  compact?: boolean;
}

export function AppFooter({ className, compact = false }: AppFooterProps) {
  const t = useTranslations();

  if (compact) {
    return (
      <footer className={cn(
        "bg-white border-t border-gray-200 py-4 mobile-only",
        className
      )}>
        <div className="container-responsive text-center">
          <p className="text-xs text-gray-500">
            {t('landing.footer.copyright')}
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn(
      "bg-gray-900 text-white py-8 md:py-12",
      className
    )}>
      <div className="container-responsive">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Store Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🍜</span>
              </div>
              <h3 className="text-lg font-semibold">{storeConfig.name}</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              {t('landing.welcome.description')}
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">{t('landing.info.address')}</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                <span className="inline-block w-5">📍</span>
                {storeConfig.address}
              </p>
              <p>
                <span className="inline-block w-5">📞</span>
                {storeConfig.phone}
              </p>
              <p>
                <span className="inline-block w-5">🕒</span>
                {t('landing.info.dailyHours')}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('common.navigation.menu')}</h4>
            <div className="space-y-2 text-sm">
              <a 
                href="/menu" 
                className="block text-gray-300 hover:text-white transition-colors"
              >
                {t('common.navigation.menu')}
              </a>
              <a 
                href="/cart" 
                className="block text-gray-300 hover:text-white transition-colors"
              >
                {t('common.navigation.cart')}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-xs text-gray-400 mb-2">
            {t('landing.footer.copyright')}
          </p>
          <p className="text-xs text-gray-500">
            {t('landing.footer.poweredBy')}
          </p>
        </div>
      </div>
    </footer>
  );
}