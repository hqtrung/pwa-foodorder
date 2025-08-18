'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Category } from '@/types';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showAvailableOnly: boolean;
  setShowAvailableOnly: (available: boolean) => void;
  clearFilters: () => void;
  selectedCategoryId?: string | null;
  categories?: Category[] | null;
  onCategorySelect?: (categoryId: string | null) => void;
}

export function FilterBar({ 
  searchQuery, 
  setSearchQuery, 
  showAvailableOnly, 
  setShowAvailableOnly, 
  clearFilters,
  selectedCategoryId,
  categories,
  onCategorySelect
}: FilterBarProps) {
  const t = useTranslations();
  const [showSearchInput, setShowSearchInput] = useState(false);

  // In category view, show category dropdown instead of search input
  const inCategoryView = selectedCategoryId && !searchQuery.trim();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left side - Search or Category Dropdown */}
        <div className="flex-1">
          {inCategoryView && !showSearchInput ? (
            // Category Dropdown
            <div className="flex items-center space-x-2">
              <select
                value={selectedCategoryId || ''}
                onChange={(e) => onCategorySelect?.(e.target.value || null)}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors bg-white text-gray-900"
              >
                <option value="">{t('menu.categories.all')}</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearchInput(true)}
                className="p-2"
                title={t('menu.search.placeholder')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Button>
            </div>
          ) : (
            // Search Input
            <div className="flex items-center space-x-2">
              <Input
                type="search"
                placeholder={t('menu.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                icon={
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
              {inCategoryView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSearchInput(false)}
                  className="p-2"
                  title="Show categories"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Right side - Reset filter only (desktop only) */}
        <div className="hidden md:flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearFilters();
              setSearchQuery('');
              setShowSearchInput(false);
            }}
            className="text-primary-600 hover:text-primary-700 p-2"
            title={t('menu.filters.reset')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="ml-1">{t('menu.filters.reset')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}