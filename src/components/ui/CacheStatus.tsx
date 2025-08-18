'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSyncStatus, useNetworkStatus } from '@/hooks/useOnlineStatus';
import { useCacheManagement } from '@/hooks/useApi';

interface CacheStatusProps {
  variant?: 'minimal' | 'detailed';
  className?: string;
}

export function CacheStatus({ variant = 'minimal', className = '' }: CacheStatusProps) {
  const t = useTranslations();
  const { 
    isOnline, 
    lastSync, 
    lastError, 
    isRunning,
    forceSync, 
    clearCache,
    cacheStats,
    hasCachedData,
    hasFreshData
  } = useSyncStatus();
  
  const { quality, connectionType, effectiveType } = useNetworkStatus();
  const { stats, isClearing, clearCache: clearLocalCache, forceRefresh } = useCacheManagement();
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Format cache size
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format last sync time
  const formatLastSync = (date: Date | null): string => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (isOnline) {
        await forceSync();
        await forceRefresh();
      }
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle cache clear
  const handleClearCache = async () => {
    try {
      clearCache();
      await clearLocalCache();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-2 text-sm ${className}`}>
        {/* Online/Offline Status */}
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Cache Status */}
        {hasCachedData && (
          <div className="flex items-center space-x-1 text-gray-600">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z" />
            </svg>
            <span>{hasFreshData ? 'Fresh' : 'Cached'}</span>
          </div>
        )}

        {/* Sync Status */}
        {isRunning && (
          <div className="flex items-center space-x-1 text-blue-600">
            <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full" />
            <span>Syncing</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Cache Status</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || !isOnline}
              className="text-primary-600"
            >
              {isRefreshing ? (
                <>
                  <div className="animate-spin w-4 h-4 border border-primary-500 border-t-transparent rounded-full mr-2" />
                  Refreshing
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              disabled={isClearing}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {isClearing ? 'Clearing...' : 'Clear Cache'}
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Connection</h4>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className={`text-sm font-medium ${
                isOnline ? 'text-green-600' : 'text-red-600'
              }`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            {isOnline && (
              <div className="space-y-1 text-xs text-gray-500">
                <div>Quality: <span className="capitalize">{quality}</span></div>
                {connectionType !== 'unknown' && (
                  <div>Type: {connectionType}</div>
                )}
                {effectiveType !== 'unknown' && (
                  <div>Speed: {effectiveType}</div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Sync Status</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2">
                {isRunning ? (
                  <>
                    <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full" />
                    <span className="text-blue-600">Active</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span className="text-gray-600">Inactive</span>
                  </>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Last sync: {formatLastSync(lastSync)}
              </div>
              {lastError && (
                <div className="text-xs text-red-500">
                  Error: {lastError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cache Statistics */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Cache Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Memory entries:</span>
                <span className="font-medium">{stats.memoryEntries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Storage entries:</span>
                <span className="font-medium">{stats.localStorageEntries}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Total size:</span>
                <span className="font-medium">{formatSize(stats.totalSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Has data:</span>
                <span className={`font-medium ${hasCachedData ? 'text-green-600' : 'text-gray-400'}`}>
                  {hasCachedData ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Freshness */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Data Status</h4>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                hasFreshData ? 'bg-green-500' : 
                hasCachedData ? 'bg-yellow-500' : 'bg-gray-400'
              }`} />
              <span className="text-sm">
                {hasFreshData ? 'Fresh data available' :
                 hasCachedData ? 'Using cached data' : 'No data cached'}
              </span>
            </div>
            
            {!isOnline && hasCachedData && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                App is running in offline mode using cached data
              </div>
            )}
            
            {!hasCachedData && !isOnline && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                No cached data available. Please connect to internet to load data.
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Simple status indicator for header/toolbar - now only shows critical states
 */
export function CacheStatusIndicator({ className = '' }: { className?: string }) {
  const { isOnline, hasCachedData, hasFreshData } = useSyncStatus();

  // Only show indicator for critical states to save header space
  if (!isOnline && !hasCachedData) {
    return (
      <div className={`flex items-center space-x-1 text-red-600 ${className}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs">No Data</span>
      </div>
    );
  }

  // If offline but has cached data, show minimal indicator
  if (!isOnline && hasCachedData) {
    return (
      <div className={`flex items-center space-x-1 text-amber-600 ${className}`}>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728" />
        </svg>
      </div>
    );
  }

  // Don't show anything for normal online states to save space
  return null;
}