'use client';

import { Category } from '@/types';
import { getCategoryIcon } from '@/lib/data-transformers';

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  selectedCategoryId?: string | null;
}

export function CategoryGrid({ 
  categories, 
  onCategorySelect, 
  selectedCategoryId 
}: CategoryGridProps) {
  return (
    <div className="w-full animate-fade-in">
      {/* Mobile: Horizontal scroll with momentum */}
      <div 
        className="flex overflow-x-auto gap-3 pb-2 md:hidden scrollbar-hide px-1" 
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth'
        }}
      >
        {categories.map((category, index) => (
          <button
            key={category.id}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300 whitespace-nowrap animate-slide-up ${
              selectedCategoryId === category.id
                ? 'bg-primary-500 border-primary-500 text-white'
                : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
            }`}
            style={{ 
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
            onClick={() => onCategorySelect(category.id)}
          >
            <span className="text-lg">{getCategoryIcon(category.name)}</span>
            <span className="font-medium text-sm">{category.name}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              selectedCategoryId === category.id
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {category.availableCount}
            </span>
          </button>
        ))}
      </div>

      {/* Desktop: Compact grid */}
      <div className="hidden md:grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        {categories.map((category, index) => (
          <button
            key={category.id}
            className={`relative p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 animate-slide-up ${
              selectedCategoryId === category.id
                ? 'bg-primary-500 border-primary-500 text-white'
                : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
            }`}
            style={{ 
              animationDelay: `${index * 80}ms`,
              animationFillMode: 'both'
            }}
            onClick={() => onCategorySelect(category.id)}
          >
            {/* Icon and Name */}
            <div className="flex items-center justify-center gap-2 text-center">
              <span className="text-lg">{getCategoryIcon(category.name)}</span>
              <span className="font-medium text-xs leading-tight line-clamp-2">{category.name}</span>
            </div>
            
            {/* Product Count Badge */}
            <div className={`absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full ${
              selectedCategoryId === category.id
                ? 'bg-white/20 text-white'
                : 'bg-primary-100 text-primary-700'
            }`}>
              {category.availableCount}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}