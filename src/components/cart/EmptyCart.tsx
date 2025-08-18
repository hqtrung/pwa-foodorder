'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

export function EmptyCart() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button and title */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <h1 className="text-lg font-semibold text-gray-900">
                {t('cart.title')}
              </h1>
            </div>

            {/* Right side - Language selector */}
            <LanguageSelector variant="dropdown" />
          </div>
        </div>
      </header>

      {/* Empty State */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card padding="lg" className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg 
              className="w-12 h-12 text-gray-400" 
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
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('cart.empty.title')}
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {t('cart.empty.description')}
          </p>

          <div className="space-y-4">
            <Button
              onClick={() => router.push('/menu')}
              className="w-full sm:w-auto"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('cart.empty.browseMenu')}
            </Button>
            
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="text-primary-600"
              >
                {t('cart.empty.backToHome')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Popular Items Suggestion */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-6">
            {t('cart.empty.suggestions.title')}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Quick suggestion cards */}
            <Card 
              padding="md" 
              hover 
              className="cursor-pointer"
              onClick={() => router.push('/menu?category=promotion')}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔥</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  {t('cart.empty.suggestions.promotions')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t('cart.empty.suggestions.promotionsDesc')}
                </p>
              </div>
            </Card>

            <Card 
              padding="md" 
              hover 
              className="cursor-pointer"
              onClick={() => router.push('/menu?category=banh-mi')}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🥖</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  {t('cart.empty.suggestions.banhMi')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t('cart.empty.suggestions.banhMiDesc')}
                </p>
              </div>
            </Card>

            <Card 
              padding="md" 
              hover 
              className="cursor-pointer"
              onClick={() => router.push('/menu?bestsellers=true')}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">⭐</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  {t('cart.empty.suggestions.bestsellers')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t('cart.empty.suggestions.bestsellersDesc')}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}