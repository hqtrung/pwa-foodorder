'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { ProductGrid } from './ProductGrid';
import { Product } from '@/types';

interface SearchResultsProps {
  query: string;
  results: Product[];
  isLoading: boolean;
  onClearSearch: () => void;
  onProductClick?: (productId: string) => void;
}

export function SearchResults({ 
  query, 
  results, 
  isLoading, 
  onClearSearch,
  onProductClick
}: SearchResultsProps) {
  const t = useTranslations();

  return (
    <div>
      {/* Search Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {t('menu.search.results.title')}
          </h2>
          <p className="text-gray-600">
            {isLoading 
              ? t('menu.search.results.searching', { query })
              : t('menu.search.results.found', { count: results.length, query })
            }
          </p>
        </div>
        <Button 
          variant="ghost"
          onClick={onClearSearch}
          className="text-primary-600"
        >
          {t('menu.search.results.clear')}
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('menu.search.results.searching', { query })}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {!isLoading && results.length > 0 && (
        <ProductGrid 
          products={results} 
          columns={4}
          onProductClick={onProductClick}
        />
      )}

      {/* No Results */}
      {!isLoading && results.length === 0 && query.trim() && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('menu.search.noResults.title')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('menu.search.noResults.description', { query })}
          </p>
          <Button 
            variant="outline"
            onClick={onClearSearch}
          >
            {t('menu.search.noResults.browseAll')}
          </Button>
        </div>
      )}
    </div>
  );
}