import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    loading = false,
    fullWidth = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const isButtonLoading = isLoading || loading;
    return (
      <button
        className={clsx(
          // Base styles
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-target',
          
          // Variant styles
          {
            // Primary button (Modern Orange)
            'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500': 
              variant === 'primary',
            
            // Secondary button (Outlined)
            'border border-primary-500 bg-transparent text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500': 
              variant === 'secondary',
            
            // Ghost button
            'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500': 
              variant === 'ghost',
            
            // Danger button
            'bg-secondary-500 text-white hover:bg-secondary-600 focus-visible:ring-secondary-500': 
              variant === 'danger',
            
            // Outline button
            'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500': 
              variant === 'outline',
          },
          
          // Size styles
          {
            'px-3 py-2 text-sm': size === 'sm',
            'px-4 py-2.5 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
            'px-8 py-4 text-xl font-bold': size === 'xl',
          },
          
          // Full width
          {
            'w-full': fullWidth,
          },
          
          className
        )}
        disabled={disabled || isButtonLoading}
        ref={ref}
        {...props}
      >
        {isButtonLoading && (
          <svg 
            className="mr-2 h-4 w-4 animate-spin" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };