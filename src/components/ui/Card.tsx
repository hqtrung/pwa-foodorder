import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'md',
    hover = false,
    children, 
    ...props 
  }, ref) => {
    return (
      <div
        className={clsx(
          // Base styles
          'rounded-lg bg-white transition-colors',
          
          // Variant styles
          {
            // Default card
            'border border-gray-200': variant === 'default',
            
            // Elevated card with shadow
            'border border-gray-200 shadow-sm': variant === 'elevated',
            
            // Outlined card
            'border-2 border-gray-300': variant === 'outlined',
          },
          
          // Padding styles
          {
            'p-0': padding === 'none',
            'p-3': padding === 'sm',
            'p-4': padding === 'md',
            'p-6': padding === 'lg',
          },
          
          // Hover effect
          {
            'hover:shadow-md hover:border-gray-300 cursor-pointer': hover,
          },
          
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card header component
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, children, ...props }, ref) => {
    return (
      <div
        className={clsx('space-y-1.5', className)}
        ref={ref}
        {...props}
      >
        {title && (
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-600">{subtitle}</p>
        )}
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card content component
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={clsx('space-y-4', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardContent.displayName = 'CardContent';

// Card footer component
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={clsx('flex items-center justify-between', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };