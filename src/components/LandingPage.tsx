'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useCartStore, useUIStore } from '@/stores';
import { storeConfig } from '@/config/store';

export function LandingPage() {
  const t = useTranslations();
  const router = useRouter();
  const [selectedOrderType, setSelectedOrderType] = useState<'delivery' | 'table' | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const setOrderType = useCartStore(state => state.setOrderType);
  const setCartTableNumber = useCartStore(state => state.setTableNumber);
  const showSuccessToast = useUIStore(state => state.showSuccessToast);
  const showErrorToast = useUIStore(state => state.showErrorToast);

  const handleOrderTypeSelect = (type: 'delivery' | 'table') => {
    setSelectedOrderType(type);
    setOrderType(type);
  };

  const handleTableNumberSubmit = () => {
    if (!tableNumber.trim()) {
      showErrorToast(t('landing.errors.tableNumberRequired'));
      return;
    }

    const tableNum = parseInt(tableNumber);
    if (isNaN(tableNum) || tableNum < 1 || tableNum > 50) {
      showErrorToast(t('landing.errors.invalidTableNumber'));
      return;
    }

    setCartTableNumber(tableNumber);
    showSuccessToast(t('landing.success.tableSet', { number: tableNumber }));
    router.push('/menu');
  };

  const handleDeliverySelect = () => {
    showSuccessToast(t('landing.success.deliverySelected'));
    router.push('/menu');
  };

  const getCurrentTime = () => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 100 + currentMinute;

    const todayHours = storeConfig.openingHours[day];
    if (!todayHours || todayHours.closed) {
      return { isOpen: false, status: 'closed' };
    }

    const openTime = parseInt(todayHours.open.replace(':', ''));
    const closeTime = parseInt(todayHours.close.replace(':', ''));

    const isOpen = currentTime >= openTime && currentTime <= closeTime;
    return {
      isOpen,
      status: isOpen ? 'open' : 'closed',
      openTime: todayHours.open,
      closeTime: todayHours.close
    };
  };

  const timeInfo = getCurrentTime();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-100">
      {/* Compact Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg lg:text-xl">🍜</span>
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-gray-900">{storeConfig.name}</h1>
                <div className="flex items-center space-x-2 text-xs lg:text-sm">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    timeInfo.isOpen 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {timeInfo.isOpen ? '🟢' : '🔴'} {t(`landing.status.${timeInfo.status}`)}
                  </span>
                  {timeInfo.isOpen && (
                    <span className="text-gray-600 hidden sm:inline">
                      {t('landing.status.until')} {timeInfo.closeTime}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:block">
              <LanguageSelector variant="dropdown" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Compact Welcome Section */}
        <div className="text-center mb-6 lg:mb-12">
          <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-4">
            {t('landing.welcome.title')}
          </h2>
          <p className="text-base lg:text-xl text-gray-600 mb-1 lg:mb-2">
            {t('landing.welcome.subtitle')}
          </p>
          <p className="text-sm lg:text-base text-gray-500 hidden lg:block">
            {t('landing.welcome.description')}
          </p>
        </div>

        {/* Mobile-First Order CTAs */}
        <div className="mb-6 lg:mb-8">
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 text-center mb-4 lg:mb-8">
            {t('landing.orderType.title')}
          </h3>
          
          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
            {/* Table Service CTA */}
            <Card 
              className={`p-4 lg:p-6 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                selectedOrderType === 'table' 
                  ? 'ring-2 ring-primary-500 border-primary-500 bg-primary-50' 
                  : 'hover:border-primary-300 border-gray-200'
              }`}
              onClick={() => handleOrderTypeSelect('table')}
            >
              <div className="flex items-center lg:flex-col lg:text-center">
                {/* Mobile: horizontal layout, Desktop: vertical */}
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4 lg:mr-0 lg:mx-auto lg:mb-4 flex-shrink-0">
                  <svg className="w-6 h-6 lg:w-8 lg:h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="flex-1 lg:flex-none">
                  <h4 className="text-lg lg:text-xl font-semibold text-gray-900 mb-1 lg:mb-2">
                    {t('landing.orderType.table.title')}
                  </h4>
                  <p className="text-sm lg:text-base text-gray-600 mb-2 lg:mb-4">
                    {t('landing.orderType.table.description')}
                  </p>
                  <div className="flex lg:justify-center items-center space-x-1 lg:space-x-2 text-xs lg:text-sm text-green-600">
                    <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{t('landing.orderType.table.benefit1')}</span>
                    <span className="hidden lg:inline">•</span>
                    <span className="hidden lg:inline">{t('landing.orderType.table.benefit2')}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Delivery Service CTA */}
            <Card 
              className={`p-4 lg:p-6 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                selectedOrderType === 'delivery' 
                  ? 'ring-2 ring-primary-500 border-primary-500 bg-primary-50' 
                  : 'hover:border-primary-300 border-gray-200'
              }`}
              onClick={() => handleOrderTypeSelect('delivery')}
            >
              <div className="flex items-center lg:flex-col lg:text-center">
                {/* Mobile: horizontal layout, Desktop: vertical */}
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4 lg:mr-0 lg:mx-auto lg:mb-4 flex-shrink-0">
                  <svg className="w-6 h-6 lg:w-8 lg:h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m-4-5v9" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.88 18.09A5 5 0 0018 9h-1.26A8 8 0 103 16.29" />
                  </svg>
                </div>
                <div className="flex-1 lg:flex-none">
                  <h4 className="text-lg lg:text-xl font-semibold text-gray-900 mb-1 lg:mb-2">
                    {t('landing.orderType.delivery.title')}
                  </h4>
                  <p className="text-sm lg:text-base text-gray-600 mb-2 lg:mb-4">
                    {t('landing.orderType.delivery.description')}
                  </p>
                  <div className="flex lg:justify-center items-center space-x-1 lg:space-x-2 text-xs lg:text-sm">
                    <div className="flex items-center space-x-1 text-blue-600">
                      <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{t('landing.orderType.delivery.benefit1')}</span>
                    </div>
                    <span className="text-orange-600">
                      <span className="text-xs">💰</span>
                      <span className="ml-1">{t('landing.orderType.delivery.fee', { fee: storeConfig.deliveryFee.toLocaleString('vi-VN') })}</span>
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>



        {/* Streamlined Action Buttons */}
        {selectedOrderType === 'table' && (
          <Card className="p-4 lg:p-6 mb-6 lg:mb-8 bg-gradient-to-r from-primary-50 to-orange-50 border-primary-200">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
                {t('landing.tableNumber.title')}
              </h4>
              <div className="max-w-sm mx-auto">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder={t('landing.tableNumber.placeholder')}
                  className="w-full px-4 py-3 text-center text-lg font-semibold border-2 border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-3"
                />
                <p className="text-sm text-gray-600 mb-4">
                  {t('landing.tableNumber.hint')}
                </p>
                <Button
                  onClick={handleTableNumberSubmit}
                  disabled={!tableNumber.trim()}
                  className="w-full shadow-lg"
                  size="xl"
                >
                  {t('landing.tableNumber.confirm')} 🍽️
                </Button>
              </div>
            </div>
          </Card>
        )}

        {selectedOrderType === 'delivery' && (
          <Card className="p-4 lg:p-6 mb-6 lg:mb-8 bg-gradient-to-r from-blue-50 to-primary-50 border-blue-200">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
                {t('landing.delivery.title')}
              </h4>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mb-4 text-sm">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">{t('landing.delivery.radius')}:</span>
                  <span className="ml-1 text-gray-600">{storeConfig.deliveryRadius}km</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">{t('landing.delivery.minimum')}:</span>
                  <span className="ml-1 text-gray-600">{storeConfig.minimumOrder.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
              <Button
                onClick={handleDeliverySelect}
                className="w-full max-w-sm shadow-lg"
                size="xl"
              >
                {t('landing.delivery.confirm')} 🛵
              </Button>
            </div>
          </Card>
        )}

        {/* Always Visible Menu Button */}
        <div className="text-center mb-6 lg:mb-8">
          <Button
            variant="secondary"
            onClick={() => router.push('/menu')}
            className="text-primary-600 hover:text-primary-700 px-8 py-3"
            size="lg"
          >
            {t('landing.actions.browseMenu')} →
          </Button>
        </div>

        {/* Collapsible Restaurant Info on Mobile */}
        <details className="lg:hidden mb-6">
          <summary className="cursor-pointer text-center text-primary-600 font-medium mb-4 list-none">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <span>📍 {storeConfig.address.vi}</span>
              <span>📞 {storeConfig.phone}</span>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              ⏰ {t('landing.info.dailyHours')}
            </div>
          </summary>
          <Card className="p-4 mt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{t('landing.info.address')}</h3>
                <p className="text-sm text-gray-600">{storeConfig.address.vi}</p>
              </div>
              
              <div className="text-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{t('landing.info.phone')}</h3>
                <a href={`tel:${storeConfig.phone}`} className="text-sm text-primary-600 hover:text-primary-700">
                  {storeConfig.phone}
                </a>
              </div>
              
              <div className="text-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{t('landing.info.hours')}</h3>
                <p className="text-sm text-gray-600">{t('landing.info.dailyHours')}</p>
              </div>
            </div>
          </Card>
        </details>

        {/* Desktop Restaurant Info Card */}
        <Card className="hidden lg:block mb-8 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t('landing.info.address')}</h3>
              <p className="text-sm text-gray-600">{storeConfig.address.vi}</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t('landing.info.phone')}</h3>
              <a href={`tel:${storeConfig.phone}`} className="text-sm text-primary-600 hover:text-primary-700">
                {storeConfig.phone}
              </a>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t('landing.info.hours')}</h3>
              <p className="text-sm text-gray-600">{t('landing.info.dailyHours')}</p>
            </div>
          </div>
        </Card>
      </main>

      {/* Compact Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8 lg:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm lg:text-base">{t('landing.footer.copyright')}</p>
            <p className="text-xs lg:text-sm mt-2">{t('landing.footer.poweredBy')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}