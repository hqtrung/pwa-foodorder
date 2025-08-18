'use client';

import { ProductCard } from './ProductCard';
import { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  onProductClick?: (productId: string) => void;
}

export function ProductGrid({ products, columns = 3, onProductClick }: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  const gridClass = {
    2: 'grid-cols-2 lg:grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4'
  }[columns];

  return (
    <div className={`grid ${gridClass} gap-3 md:gap-6 animate-fade-in`}>
      {products.map((product, index) => (
        <div 
          key={product.id}
          className="animate-slide-up"
          style={{ 
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'both'
          }}
        >
          <ProductCard 
            product={product}
            onViewDetails={onProductClick ? () => onProductClick(product.id) : undefined}
          />
        </div>
      ))}
    </div>
  );
}