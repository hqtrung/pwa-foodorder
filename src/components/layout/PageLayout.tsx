'use client';

import { ReactNode } from 'react';
import { AppHeader, AppHeaderProps } from './AppHeader';
import { AppFooter } from './AppFooter';
import { FloatingCartButton } from '@/components/ui/FloatingCartButton';
import { FloatingOrderStatus } from '@/components/ui/FloatingOrderStatus';
import { cn } from '@/lib/common-utils';

export interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  
  // Header configuration
  header?: boolean | AppHeaderProps;
  
  // Footer configuration  
  footer?: boolean | { compact?: boolean };
  
  // Floating elements
  floatingCart?: boolean;
  floatingOrderStatus?: boolean;
  
  // Padding configuration
  bottomPadding?: 'none' | 'mobile' | 'both';
  
  // Layout variants
  variant?: 'default' | 'fullscreen' | 'centered';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
}

export function PageLayout({
  children,
  className,
  header = true,
  footer = false,
  floatingCart = false,
  floatingOrderStatus = false,
  bottomPadding = 'mobile',
  variant = 'default',
  maxWidth = '7xl'
}: PageLayoutProps) {
  
  // Determine if we should show header
  const showHeader = header !== false;
  const headerProps = typeof header === 'object' ? header : {};
  
  // Determine footer settings
  const showFooter = footer !== false;
  const footerProps = typeof footer === 'object' ? footer : {};

  // Container class based on variant and maxWidth
  const containerClass = cn(
    'min-h-screen bg-gray-50',
    variant === 'fullscreen' && 'h-screen overflow-hidden',
    variant === 'centered' && 'flex items-center justify-center',
    className
  );

  const mainClass = cn(
    // Base padding
    variant !== 'fullscreen' && 'padding-responsive',
    
    // Max width container
    maxWidth !== 'full' && `max-w-${maxWidth} mx-auto`,
    
    // Bottom padding for mobile floating elements
    bottomPadding === 'mobile' && 'pb-20 md:pb-0',
    bottomPadding === 'both' && 'pb-20',
    
    // Additional spacing
    variant === 'default' && 'py-3 md:py-6'
  );

  return (
    <div className={containerClass}>
      {/* Header */}
      {showHeader && (
        <AppHeader {...headerProps} />
      )}

      {/* Main Content */}
      <main className={mainClass}>
        {children}
      </main>

      {/* Footer */}
      {showFooter && (
        <AppFooter {...footerProps} />
      )}

      {/* Floating Elements */}
      {floatingCart && <FloatingCartButton />}
      {floatingOrderStatus && <FloatingOrderStatus />}
    </div>
  );
}

// Convenience components for common layouts
export function MenuPageLayout({ children, ...props }: Omit<PageLayoutProps, 'header' | 'floatingCart'>) {
  return (
    <PageLayout
      header={{
        showBreadcrumb: false,
        showOrderInfo: true,
        showCacheStatus: true,
        showBranding: true,
        simplified: true
      }}
      floatingCart
      {...props}
    >
      {children}
    </PageLayout>
  );
}

export function CheckoutPageLayout({ children, ...props }: Omit<PageLayoutProps, 'header' | 'bottomPadding'>) {
  return (
    <PageLayout
      header={{
        showBreadcrumb: false,
        showBackButton: true,
        showBranding: true,
        title: undefined // Let each page set its own title
      }}
      bottomPadding="mobile"
      {...props}
    >
      {children}
    </PageLayout>
  );
}

export function OrderPageLayout({ children, orderNumber, ...props }: Omit<PageLayoutProps, 'header'> & { orderNumber?: string }) {
  return (
    <PageLayout
      header={{
        showBreadcrumb: false,
        showBackButton: true,
        showBranding: true,
        orderNumber
      }}
      floatingOrderStatus
      {...props}
    >
      {children}
    </PageLayout>
  );
}