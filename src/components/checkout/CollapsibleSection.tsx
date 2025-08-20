'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/common-utils';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  completed?: boolean;
  required?: boolean;
  className?: string;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
}

export function CollapsibleSection({
  title,
  children,
  completed = false,
  required = false,
  className,
  defaultExpanded = false,
  icon,
  description,
  actions
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(
    defaultExpanded || (!completed && required)
  );

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card 
      padding="lg"
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        completed && 'border-accent-500 bg-accent-50',
        required && !completed && 'border-primary-500',
        className
      )}
    >
      {/* Section Header */}
      <div 
        onClick={toggleExpanded}
        className="flex items-center justify-between cursor-pointer py-2 -my-2 touch-manipulation"
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Icon */}
          {icon && (
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
              completed 
                ? 'bg-accent-100 text-accent-600' 
                : required 
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-600'
            )}>
              {completed ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                icon
              )}
            </div>
          )}

          {/* Title and Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className={cn(
                'text-base font-semibold truncate',
                completed ? 'text-accent-800' : 'text-gray-900'
              )}>
                {title}
              </h3>
              {required && !completed && (
                <span className="text-xs text-secondary-500 font-medium">*</span>
              )}
              {completed && (
                <span className="text-xs text-accent-600 font-medium bg-accent-100 px-2 py-0.5 rounded-full">
                  Complete
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-500 truncate mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions and Expand Icon */}
        <div className="flex items-center space-x-2 ml-2">
          {actions && !isExpanded && (
            <div className="flex items-center space-x-1">
              {actions}
            </div>
          )}
          
          {/* Expand/Collapse Icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 touch-manipulation',
              'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
              isExpanded && 'rotate-180'
            )}
            aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
          >
            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className={cn(
          'mt-4 pt-4 border-t border-gray-100 animate-slide-up',
          completed && 'border-accent-200'
        )}>
          {children}
        </div>
      )}
    </Card>
  );
}