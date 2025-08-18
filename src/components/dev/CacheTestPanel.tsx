'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CacheStatus } from '@/components/ui/CacheStatus';
import { cachedAPI } from '@/lib/cachedApi';
import { syncService } from '@/services/syncService';
import { simpleCache } from '@/services/simpleCache';
import { useSyncStatus } from '@/hooks/useOnlineStatus';

export function CacheTestPanel() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const syncStatus = useSyncStatus();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testCacheOperations = async () => {
    setIsLoading(true);
    addResult('Starting cache tests...');

    try {
      // Test 1: Basic cache operations
      addResult('Test 1: Testing basic cache operations');
      simpleCache.set('test_key', { value: 'test_data' }, 60000);
      const retrieved = simpleCache.get('test_key');
      addResult(`✓ Cache set/get: ${retrieved ? 'SUCCESS' : 'FAILED'}`);

      // Test 2: Cache stats
      addResult('Test 2: Testing cache statistics');
      const stats = simpleCache.getStats();
      addResult(`✓ Cache stats: ${stats.memoryEntries} memory entries, ${stats.localStorageEntries} storage entries`);

      // Test 3: Test cached API (if online)
      if (navigator.onLine) {
        addResult('Test 3: Testing cached API calls');
        try {
          const categories = await cachedAPI.getCategoriesWithFallback();
          addResult(`✓ Cached categories: ${categories.length} items loaded`);
          
          const products = await cachedAPI.getProductsWithFallback();
          addResult(`✓ Cached products: ${products.length} items loaded`);
        } catch (error) {
          addResult(`✗ API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        addResult('Test 3: SKIPPED (offline)');
      }

      // Test 4: Test cache availability
      addResult('Test 4: Testing cache data availability');
      const cached = cachedAPI.hasCachedData();
      const fresh = cachedAPI.hasFreshData();
      addResult(`✓ Has cached data: ${JSON.stringify(cached)}`);
      addResult(`✓ Has fresh data: ${JSON.stringify(fresh)}`);

      addResult('All tests completed!');
    } catch (error) {
      addResult(`✗ Test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testOfflineMode = () => {
    addResult('Simulating offline mode...');
    
    // Try to get data when potentially offline
    cachedAPI.getCategoriesWithFallback()
      .then(categories => {
        addResult(`✓ Offline fallback: ${categories.length} categories available`);
      })
      .catch(error => {
        addResult(`✗ Offline fallback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });
  };

  const forceClearCache = () => {
    addResult('Clearing all cache data...');
    simpleCache.clear();
    cachedAPI.clearCache();
    addResult('✓ Cache cleared');
  };

  const forceSync = async () => {
    if (!navigator.onLine) {
      addResult('✗ Cannot sync while offline');
      return;
    }

    setIsLoading(true);
    addResult('Starting manual sync...');
    
    try {
      await syncService.forceSync();
      addResult('✓ Manual sync completed');
    } catch (error) {
      addResult(`✗ Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Cache System Test Panel</h2>
        <p className="text-sm text-gray-600 mt-1">Development tool to test cache functionality</p>
      </div>

      {/* Cache Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">Cache Status</h3>
        <CacheStatus variant="detailed" />
      </div>

      {/* Test Controls */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">Test Controls</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={testCacheOperations}
            disabled={isLoading}
            variant="primary"
          >
            {isLoading ? 'Running Tests...' : 'Run Cache Tests'}
          </Button>

          <Button
            onClick={testOfflineMode}
            variant="outline"
          >
            Test Offline Mode
          </Button>

          <Button
            onClick={forceSync}
            disabled={isLoading || !navigator.onLine}
            variant="outline"
          >
            Force Sync
          </Button>

          <Button
            onClick={forceClearCache}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Current Status */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-800">Current Status</h3>
        <div className="text-sm space-y-1">
          <div>Online: {syncStatus.isOnline ? '✓ Yes' : '✗ No'}</div>
          <div>Sync Running: {syncStatus.isRunning ? '✓ Yes' : '✗ No'}</div>
          <div>Has Cached Data: {syncStatus.hasCachedData ? '✓ Yes' : '✗ No'}</div>
          <div>Has Fresh Data: {syncStatus.hasFreshData ? '✓ Yes' : '✗ No'}</div>
          <div>Last Sync: {syncStatus.lastSync ? syncStatus.lastSync.toLocaleString() : 'Never'}</div>
          {syncStatus.lastError && (
            <div className="text-red-600">Last Error: {syncStatus.lastError}</div>
          )}
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-800">Test Results</h3>
          <Button onClick={clearResults} variant="ghost" size="sm">
            Clear Results
          </Button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500 text-sm">No test results yet. Run some tests to see output here.</p>
          ) : (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}