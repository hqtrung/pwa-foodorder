'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  categoryName?: string;
  productName?: string;
  orderNumber?: string;
  className?: string;
  onClearFilters?: () => void;
  simplified?: boolean;
}

export function Breadcrumb({ items, categoryName, productName, orderNumber, className = '', onClearFilters, simplified = false }: BreadcrumbProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbItems = items || generateBreadcrumbs(pathname, t, categoryName, productName, orderNumber, simplified);

  const handleNavigation = (href: string) => {
    // If navigating to menu and we have onClearFilters, use it to clear filters
    if (href === '/menu' && onClearFilters) {
      onClearFilters();
    } else {
      router.push(href);
    }
  };

  return (
    <nav 
      className={`flex items-center space-x-1 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            
            {item.current || !item.href ? (
              <span className="text-gray-900 font-medium flex items-center" aria-current="page">
                {index === 0 ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                ) : (
                  item.label
                )}
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(item.href!)}
                className="text-gray-600 hover:text-gray-900 p-1 h-auto font-normal flex items-center"
              >
                {index === 0 ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                ) : (
                  item.label
                )}
              </Button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function generateBreadcrumbs(pathname: string, t: (key: string) => string, categoryName?: string, productName?: string, orderNumber?: string, simplified = false): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with Home
  breadcrumbs.push({
    label: t('common.navigation.home'),
    href: '/',
  });

  // Generate breadcrumbs based on path segments
  let currentPath = '';
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    const isLast = i === segments.length - 1;
    
    switch (segment) {
      case 'menu':
        // In simplified mode, don't add "Menu" breadcrumb - just home icon
        if (!simplified) {
          breadcrumbs.push({
            label: t('common.navigation.menu'),
            href: isLast && !categoryName && !productName ? undefined : '/menu',
            current: isLast && !categoryName && !productName,
          });
        }
        
        // Skip category name to save space - only add if we have a product
        if (categoryName && productName && !simplified) {
          breadcrumbs.push({
            label: categoryName,
            href: '/menu',
            current: false,
          });
        }
        
        // Add product if specified
        if (productName && !simplified) {
          breadcrumbs.push({
            label: productName,
            current: true,
          });
        }
        break;
        
      case 'cart':
        breadcrumbs.push({
          label: t('common.navigation.cart'),
          href: isLast ? undefined : '/cart',
          current: isLast,
        });
        break;
        
      case 'checkout':
        breadcrumbs.push({
          label: t('checkout.title'),
          href: isLast ? undefined : '/checkout',
          current: isLast,
        });
        break;
        
      case 'order':
        // Check if next segment is order ID
        if (i + 1 < segments.length) {
          const orderId = segments[i + 1];
          breadcrumbs.push({
            label: t('common.navigation.orders'),
            href: '/order',
          });
          breadcrumbs.push({
            label: t('order.title', { number: orderNumber || orderId }),
            current: true,
          });
          i++; // Skip next iteration since we handled the order ID
        } else {
          breadcrumbs.push({
            label: t('common.navigation.orders'),
            href: isLast ? undefined : '/order',
            current: isLast,
          });
        }
        break;
        
      case 'staff':
        breadcrumbs.push({
          label: t('common.navigation.staff'),
          href: isLast ? undefined : '/staff',
          current: isLast,
        });
        break;
        
      default:
        // For dynamic segments like order IDs
        if (segment.match(/^\d+$/)) {
          // This is likely an order ID, handled in order case above
          continue;
        } else {
          // Generic segment
          breadcrumbs.push({
            label: segment.charAt(0).toUpperCase() + segment.slice(1),
            href: isLast ? undefined : currentPath,
            current: isLast,
          });
        }
        break;
    }
  }

  return breadcrumbs;
}