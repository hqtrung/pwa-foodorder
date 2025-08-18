'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';

interface StatsProps {
  stats: {
    activeOrders: number;
    pendingConfirmation: number;
    inPreparation: number;
    readyForDelivery: number;
    averagePreparationTime: number;
    totalOrdersToday: number;
    revenue: number;
  };
}

export function StaffStats({ stats }: StatsProps) {
  const t = useTranslations();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const statCards = [
    {
      title: t('staff.stats.activeOrders'),
      value: stats.activeOrders,
      icon: '📋',
      color: 'blue',
      description: t('staff.stats.activeOrdersDesc')
    },
    {
      title: t('staff.stats.pendingConfirmation'),
      value: stats.pendingConfirmation,
      icon: '⏳',
      color: 'yellow',
      description: t('staff.stats.pendingConfirmationDesc')
    },
    {
      title: t('staff.stats.inPreparation'),
      value: stats.inPreparation,
      icon: '👨‍🍳',
      color: 'orange',
      description: t('staff.stats.inPreparationDesc')
    },
    {
      title: t('staff.stats.readyForDelivery'),
      value: stats.readyForDelivery,
      icon: '✅',
      color: 'green',
      description: t('staff.stats.readyForDeliveryDesc')
    },
    {
      title: t('staff.stats.averageTime'),
      value: `${stats.averagePreparationTime}m`,
      icon: '⏱️',
      color: 'purple',
      description: t('staff.stats.averageTimeDesc')
    },
    {
      title: t('staff.stats.todayOrders'),
      value: stats.totalOrdersToday,
      icon: '📈',
      color: 'indigo',
      description: t('staff.stats.todayOrdersDesc')
    },
    {
      title: t('staff.stats.revenue'),
      value: `${formatPrice(stats.revenue)}₫`,
      icon: '💰',
      color: 'green',
      description: t('staff.stats.revenueDesc')
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {t('staff.stats.title')}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {statCards.map((stat, index) => (
          <Card 
            key={index}
            padding="md" 
            className={`border-l-4 ${getColorClasses(stat.color)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{stat.icon}</span>
                  <h3 className="text-sm font-medium text-gray-600 truncate">
                    {stat.title}
                  </h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick insights */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Performance indicator */}
        <Card padding="sm" className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-800">
                {t('staff.insights.performance')}
              </h4>
              <p className="text-xs text-blue-600">
                {stats.averagePreparationTime <= 30 
                  ? t('staff.insights.performanceGood')
                  : t('staff.insights.performanceNeedsImprovement')
                }
              </p>
            </div>
          </div>
        </Card>

        {/* Workload indicator */}
        <Card padding="sm" className={`${
          stats.activeOrders > 10 
            ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
            : stats.activeOrders > 5
            ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
            : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              stats.activeOrders > 10 ? 'bg-red-500' :
              stats.activeOrders > 5 ? 'bg-yellow-500' : 'bg-green-500'
            }`}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className={`text-sm font-medium ${
                stats.activeOrders > 10 ? 'text-red-800' :
                stats.activeOrders > 5 ? 'text-yellow-800' : 'text-green-800'
              }`}>
                {t('staff.insights.workload')}
              </h4>
              <p className={`text-xs ${
                stats.activeOrders > 10 ? 'text-red-600' :
                stats.activeOrders > 5 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {stats.activeOrders > 10 
                  ? t('staff.insights.workloadHigh')
                  : stats.activeOrders > 5
                  ? t('staff.insights.workloadModerate')
                  : t('staff.insights.workloadLight')
                }
              </p>
            </div>
          </div>
        </Card>

        {/* Revenue trend */}
        <Card padding="sm" className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-800">
                {t('staff.insights.revenue')}
              </h4>
              <p className="text-xs text-green-600">
                {t('staff.insights.revenueToday', { 
                  amount: formatPrice(stats.revenue) 
                })}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}