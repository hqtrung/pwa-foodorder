'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { CacheStatusIndicator } from '@/components/ui/CacheStatus';
import { OrderTypeSwitcher } from '@/components/ui/OrderTypeSwitcher';
import { useCartStore } from '@/stores';
import { cn } from '@/lib/common-utils';
import { storeConfig } from '@/config/store';

export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showLanguageSelector?: boolean;
  showOrderInfo?: boolean;
  showBackButton?: boolean;
  showCacheStatus?: boolean;
  showBranding?: boolean;
  showStoreStatus?: boolean;
  rightActions?: React.ReactNode;
  onBack?: () => void;
  className?: string;
  // Order specific props
  orderNumber?: string;
  simplified?: boolean;
}

export function AppHeader({
  title,
  subtitle,
  showLanguageSelector = true,
  showOrderInfo = false,
  showBackButton = false,
  showCacheStatus = false,
  showBranding = false,
  showStoreStatus = false,
  rightActions,
  onBack,
  className,
  // Order props
  orderNumber,
  simplified = false
}: AppHeaderProps) {
  const t = useTranslations();
  const router = useRouter();
  
  const orderType = useCartStore(state => state.orderType);
  const tableNumber = useCartStore(state => state.tableNumber);
  
  // Store status logic (similar to LandingPage)
  const getCurrentTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const isOpen = currentHour >= 10 && currentHour < 22;
    return {
      isOpen,
      status: isOpen ? 'open' : 'closed'
    };
  };
  
  const timeInfo = getCurrentTime();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header className={cn(
      "bg-white shadow-sm sticky top-0 z-40",
      className
    )}>
      <div className="container-responsive">
        
        {/* Main Header Row */}
        <div className="flex items-center justify-between py-2 h-12 md:h-14">
          {/* Left Side */}
          <div className="flex items-center space-x-2 flex-1">
            {/* Back Button */}
            {showBackButton && (
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="p-1.5 -ml-1.5 md:-ml-0"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
            )}
            
            {/* Brand Logo and Status (when showBranding is true) */}
            {showBranding && (
              <div className="flex items-center space-x-2 md:space-x-3">
                <img 
                  src="/icon.png" 
                  alt="Bánh Mì PateDeli Logo" 
                  className="w-8 h-8 md:w-10 md:h-10 object-contain"
                />
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm md:text-base font-bold text-gray-900 truncate">
                    {storeConfig.name}
                  </h1>
                  {showStoreStatus && (
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        timeInfo.isOpen 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {timeInfo.isOpen ? '🟢' : '🔴'} {t(`landing.status.${timeInfo.status}`)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Title and Subtitle (when not showing branding) */}
            {!showBranding && (title || subtitle) && (
              <div className="flex-1 min-w-0">
                {title && (
                  <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                    {title}
                  </h1>
                )}
                {subtitle && !title && (
                  <p className="text-sm md:text-base text-gray-600 truncate">
                    {subtitle}
                  </p>
                )}
                {subtitle && title && (
                  <p className="text-xs md:text-sm text-gray-500 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Order Type Switcher */}
            {showOrderInfo && orderType && (
              <OrderTypeSwitcher />
            )}
            
            {/* Cache Status */}
            {showCacheStatus && (
              <div className="hidden sm:block">
                <CacheStatusIndicator />
              </div>
            )}
            
            {/* Language Selector - Always visible */}
            {showLanguageSelector && (
              <LanguageSelector variant="dropdown" />
            )}
            
            {/* Custom Right Actions */}
            {rightActions}
          </div>
        </div>
      </div>
    </header>
  );
}