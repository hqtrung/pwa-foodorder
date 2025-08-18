'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

interface OrderFiltersProps {
  selectedFilter: 'all' | 'table' | 'delivery' | 'urgent';
  selectedStatus: string;
  onFilterChange: (filter: 'all' | 'table' | 'delivery' | 'urgent') => void;
  onStatusChange: (status: string) => void;
  orderCounts: {
    all: number;
    table: number;
    delivery: number;
    urgent: number;
  };
}

export function OrderFilters({ 
  selectedFilter, 
  selectedStatus, 
  onFilterChange, 
  onStatusChange,
  orderCounts 
}: OrderFiltersProps) {
  const t = useTranslations();

  const filterOptions = [
    { 
      key: 'all' as const, 
      label: t('staff.filters.all'), 
      count: orderCounts.all,
      icon: '📋'
    },
    { 
      key: 'table' as const, 
      label: t('staff.filters.table'), 
      count: orderCounts.table,
      icon: '🍽️'
    },
    { 
      key: 'delivery' as const, 
      label: t('staff.filters.delivery'), 
      count: orderCounts.delivery,
      icon: '🚚'
    },
    { 
      key: 'urgent' as const, 
      label: t('staff.filters.urgent'), 
      count: orderCounts.urgent,
      icon: '🚨'
    }
  ];

  const statusOptions = [
    { key: 'all', label: t('staff.filters.allStatus') },
    { key: 'pending', label: t('staff.filters.pending') },
    { key: 'confirmed', label: t('staff.filters.confirmed') },
    { key: 'preparing', label: t('staff.filters.preparing') },
    { key: 'ready', label: t('staff.filters.ready') },
    { key: 'delivering', label: t('staff.filters.delivering') }
  ];

  return (
    <div className="space-y-4">
      {/* Order Type Filters */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {t('staff.filters.orderType')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.key}
              variant={selectedFilter === option.key ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onFilterChange(option.key)}
              className="flex items-center space-x-2"
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
              <span className={`inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ${
                selectedFilter === option.key 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {option.count}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Status Filters */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {t('staff.filters.status')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.key}
              variant={selectedStatus === option.key ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onStatusChange(option.key)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {t('staff.filters.quickActions')}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onFilterChange('urgent');
              onStatusChange('all');
            }}
            className="text-red-600 hover:text-red-700"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {t('staff.filters.showUrgent')}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onFilterChange('all');
              onStatusChange('preparing');
            }}
            className="text-orange-600 hover:text-orange-700"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            {t('staff.filters.showPreparing')}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onFilterChange('all');
              onStatusChange('ready');
            }}
            className="text-green-600 hover:text-green-700"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {t('staff.filters.showReady')}
          </Button>
        </div>
      </div>
    </div>
  );
}