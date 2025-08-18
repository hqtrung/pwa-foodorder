import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  icon?: React.ReactNode;
  as?: 'input' | 'textarea';
  rows?: number;
}

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ 
    className, 
    label,
    error,
    helperText,
    startIcon,
    endIcon,
    icon,
    id,
    type = 'text',
    as = 'input',
    rows = 3,
    ...props 
  }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="space-y-1">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && <span className="text-secondary-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {(startIcon || icon) && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">
                {startIcon || icon}
              </div>
            </div>
          )}
          
          {as === 'textarea' ? (
            <textarea
              id={inputId}
              ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
              rows={rows}
              className={clsx(
                // Base styles
                'block w-full rounded-lg border px-3 py-2.5 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors resize-vertical',
                
                // Default state
                'border-gray-300 bg-white text-gray-900 focus:border-primary-500 focus:ring-primary-500',
                
                // Error state
                {
                  'border-secondary-500 focus:border-secondary-500 focus:ring-secondary-500': error,
                },
                
                // Icon padding
                {
                  'pl-10': startIcon || icon,
                  'pr-10': endIcon,
                },
                
                className
              )}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              id={inputId}
              ref={ref as React.ForwardedRef<HTMLInputElement>}
              type={type}
              className={clsx(
                // Base styles
                'block w-full rounded-lg border px-3 py-2.5 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors touch-target',
                
                // Default state
                'border-gray-300 bg-white text-gray-900 focus:border-primary-500 focus:ring-primary-500',
                
                // Error state
                {
                  'border-secondary-500 focus:border-secondary-500 focus:ring-secondary-500': error,
                },
                
                // Icon padding
                {
                  'pl-10': startIcon || icon,
                  'pr-10': endIcon,
                },
              
                className
              )}
              {...props}
            />
          )}
          
          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">
                {endIcon}
              </div>
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p className={clsx(
            'text-sm',
            error ? 'text-secondary-600' : 'text-gray-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };