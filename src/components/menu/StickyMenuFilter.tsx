'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Category } from '@/types';
import { getCategoryIcon } from '@/lib/data-transformers';

interface StickyMenuFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  selectedCategoryId?: string | null;
  categories?: Category[] | null;
  onCategorySelect?: (categoryId: string | null) => void;
}

export function StickyMenuFilter({ 
  searchQuery, 
  setSearchQuery, 
  clearFilters,
  selectedCategoryId,
  categories,
  onCategorySelect
}: StickyMenuFilterProps) {
  const t = useTranslations();
  const [isSticky, setIsSticky] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when search mode is activated
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);


  const handleSearchClick = () => {
    // Ensure dropdown is closed first
    setDropdownOpen(false);
    // Then show search mode
    setTimeout(() => {
      setShowSearch(true);
      // Clear any existing category selection when entering search mode
      if (selectedCategoryId) {
        onCategorySelect?.(null);
      }
    }, 10); // Small delay to ensure dropdown closes first
  };

  const handleSearchClose = () => {
    setSearchQuery('');
    setShowSearch(false);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    onCategorySelect?.(categoryId);
    setDropdownOpen(false);
  };

  const selectedCategory = categories?.find(c => c.id === selectedCategoryId);

  return (
    <div className={`sticky top-14 md:top-16 z-30 bg-white transition-shadow duration-200 ${
      isSticky ? 'shadow-md border-b border-gray-200' : ''
    }`}>
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Category Dropdown or Search Input */}
          <div className="flex-1">
            {showSearch ? (
              /* Search Mode */
              <div className="relative z-50">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('menu.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  onClick={handleSearchClose}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              /* Category Dropdown Mode */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => !showSearch && setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <div className="flex items-center gap-2">
                    {selectedCategory ? (
                      <>
                        <span className="text-lg">{getCategoryIcon(selectedCategory.name)}</span>
                        <span className="font-medium text-gray-900">{selectedCategory.name}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          {selectedCategory.availableCount}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">📂</span>
                        <span className="text-gray-600">{t('menu.categories.all')}</span>
                      </>
                    )}
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && !showSearch && categories && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                    {/* All Categories Option */}
                    <button
                      onClick={() => handleCategorySelect(null)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                        !selectedCategoryId ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                      }`}
                    >
                      <span className="text-lg">📂</span>
                      <span className="font-medium">{t('menu.categories.all')}</span>
                    </button>
                    
                    {/* Category Options */}
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                          selectedCategoryId === category.id ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                        }`}
                      >
                        <span className="text-lg">{getCategoryIcon(category.name)}</span>
                        <span className="font-medium flex-1 text-left">{category.name}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          {category.availableCount}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Icon Button */}
          {!showSearch && (
            <button
              onClick={handleSearchClick}
              className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-gray-200 hover:border-primary-300"
              title="Search products"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

        </div>
      </div>
    </div>
  );
}