'use client';

import { useState, useEffect } from 'react';
import { syncService, SyncStatus } from '@/services/syncService';

/**
 * Hook to track online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Initialize with current online status
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => {
      console.log('Device came online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('Device went offline');
      setIsOnline(false);
    };

    // Add event listeners for online/offline detection
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Also listen for focus events (user might have fixed connection)
      const handleFocus = () => {
        // Check if we're actually online when window regains focus
        if (navigator.onLine !== isOnline) {
          setIsOnline(navigator.onLine);
        }
      };

      window.addEventListener('focus', handleFocus);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [isOnline]);

  return isOnline;
}

/**
 * Hook to get sync service status and control
 */
export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>(syncService.getStatus());
  const isOnline = useOnlineStatus();

  useEffect(() => {
    // Subscribe to sync status updates
    const unsubscribe = syncService.addListener(setStatus);

    // Start sync service if online
    if (isOnline && !syncService.getStatus().isRunning) {
      syncService.start();
    }

    return unsubscribe;
  }, [isOnline]);

  const forceSync = async () => {
    if (!isOnline) {
      throw new Error('Cannot sync while offline');
    }
    return syncService.forceSync();
  };

  const clearCache = () => {
    syncService.clearCache();
  };

  return {
    ...status,
    isOnline,
    forceSync,
    clearCache,
    cacheStats: syncService.getCacheStats(),
    hasCachedData: syncService.hasCachedData(),
    hasFreshData: syncService.hasFreshData()
  };
}

/**
 * Hook for network status with additional connection quality detection
 */
export function useNetworkStatus() {
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [downlink, setDownlink] = useState<number | undefined>(undefined);
  const [effectiveType, setEffectiveType] = useState<string>('unknown');
  const isOnline = useOnlineStatus();

  useEffect(() => {
    // Check if the NetworkInformation API is available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateConnectionInfo = () => {
        setConnectionType(connection.type || 'unknown');
        setDownlink(connection.downlink);
        setEffectiveType(connection.effectiveType || 'unknown');
      };

      // Initial update
      updateConnectionInfo();

      // Listen for changes
      connection.addEventListener('change', updateConnectionInfo);

      return () => {
        connection.removeEventListener('change', updateConnectionInfo);
      };
    }
  }, []);

  // Determine connection quality
  const getConnectionQuality = (): 'poor' | 'good' | 'excellent' | 'unknown' => {
    if (!isOnline) return 'poor';
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'poor';
    if (effectiveType === '3g') return 'good';
    if (effectiveType === '4g') return 'excellent';
    
    // Fallback to downlink if available
    if (downlink !== undefined) {
      if (downlink < 1) return 'poor';
      if (downlink < 5) return 'good';
      return 'excellent';
    }

    return 'unknown';
  };

  const quality = getConnectionQuality();

  return {
    isOnline,
    connectionType,
    downlink,
    effectiveType,
    quality,
    isSlowConnection: quality === 'poor',
    isFastConnection: quality === 'excellent'
  };
}

/**
 * Hook for cache-first data loading strategy based on network conditions
 */
export function useCacheStrategy() {
  const { isOnline, quality, isSlowConnection } = useNetworkStatus();
  const { hasCachedData, hasFreshData } = useSyncStatus();

  // Determine the best loading strategy based on network conditions
  const getStrategy = () => {
    if (!isOnline) {
      return 'cache-only';
    }

    if (isSlowConnection && hasCachedData) {
      return 'cache-first';
    }

    if (hasFreshData) {
      return 'cache-with-background-update';
    }

    return 'network-first';
  };

  const strategy = getStrategy();

  return {
    strategy,
    shouldPreferCache: strategy === 'cache-only' || strategy === 'cache-first',
    shouldAllowStale: !isOnline || isSlowConnection,
    shouldSkipCache: strategy === 'network-first' && !isSlowConnection,
    networkInfo: {
      isOnline,
      quality,
      isSlowConnection
    }
  };
}

/**
 * Hook for managing offline queue functionality
 */
export function useOfflineQueue() {
  const [queuedActions, setQueuedActions] = useState<any[]>([]);
  const isOnline = useOnlineStatus();

  const addToQueue = (action: any) => {
    setQueuedActions(prev => [...prev, { ...action, timestamp: Date.now() }]);
  };

  const clearQueue = () => {
    setQueuedActions([]);
  };

  const processQueue = async () => {
    if (!isOnline || queuedActions.length === 0) return;

    console.log(`Processing ${queuedActions.length} queued actions...`);
    
    // Process actions one by one
    for (const action of queuedActions) {
      try {
        // Here you would implement the actual action processing
        // For now, just log the action
        console.log('Processing queued action:', action);
      } catch (error) {
        console.error('Failed to process queued action:', error);
      }
    }

    clearQueue();
  };

  // Auto-process queue when coming online
  useEffect(() => {
    if (isOnline && queuedActions.length > 0) {
      processQueue();
    }
  }, [isOnline, queuedActions.length]);

  return {
    queuedActions,
    addToQueue,
    clearQueue,
    processQueue,
    hasQueuedActions: queuedActions.length > 0
  };
}