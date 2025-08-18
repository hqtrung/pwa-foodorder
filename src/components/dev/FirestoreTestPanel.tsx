'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useFirestoreStatus } from '@/hooks/useFirestore';
import { useDataSourceStatus } from '@/hooks/useApi';
import { firestoreAPI } from '@/lib/firestoreApi';

export function FirestoreTestPanel() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const firestoreStatus = useFirestoreStatus();
  const dataSourceStatus = useDataSourceStatus();

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testFirestoreConnection = async () => {
    setIsLoading(true);
    addResult('Testing Firestore connection...');

    try {
      const health = await firestoreAPI.healthCheck();
      
      if (health.firestore.available) {
        addResult('✅ Firestore connection successful');
      } else {
        addResult(`❌ Firestore connection failed: ${health.firestore.error}`);
      }

      if (health.api.available) {
        addResult('✅ API connection successful');
      } else {
        addResult(`❌ API connection failed: ${health.api.error}`);
      }
    } catch (error) {
      addResult(`❌ Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testFirestoreData = async () => {
    setIsLoading(true);
    addResult('Testing Firestore data access...');

    try {
      // Test categories
      const categories = await firestoreAPI.getCategories();
      addResult(`✅ Categories: ${categories.length} items loaded`);

      // Test products
      const products = await firestoreAPI.getProducts();
      addResult(`✅ Products: ${products.length} items loaded`);

      // Test filtered products
      if (categories.length > 0) {
        const firstCategoryId = categories[0].id;
        const categoryProducts = await firestoreAPI.getProducts(firstCategoryId);
        addResult(`✅ Category ${firstCategoryId} products: ${categoryProducts.length} items`);
      }

    } catch (error) {
      addResult(`❌ Data test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCacheStats = () => {
    addResult('Testing cache statistics...');
    
    const stats = firestoreStatus.cacheStats;
    addResult(`Cache stats: Categories=${stats.hasCategories}, Products=${stats.hasProducts}`);
    
    const config = firestoreAPI.getConfig();
    addResult(`Config: Firestore=${config.useFirestore}, Fallback=${config.fallbackToApi}`);
  };

  const toggleFirestoreMode = () => {
    const currentMode = firestoreAPI.isUsingFirestore();
    firestoreAPI.setFirestoreMode(!currentMode);
    addResult(`Firestore mode ${!currentMode ? 'enabled' : 'disabled'}`);
    dataSourceStatus.checkStatus();
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Firestore Integration Test Panel</h2>
        <p className="text-sm text-gray-600 mt-1">Test Firestore connectivity and data access</p>
      </div>

      {/* Status Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">Current Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Using Firestore:</span>
              <span className={dataSourceStatus.usingFirestore ? 'text-green-600' : 'text-gray-600'}>
                {dataSourceStatus.usingFirestore ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Firestore Available:</span>
              <span className={firestoreStatus.firestoreAvailable ? 'text-green-600' : 'text-red-600'}>
                {firestoreStatus.firestoreAvailable ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>API Available:</span>
              <span className={firestoreStatus.apiAvailable ? 'text-green-600' : 'text-red-600'}>
                {firestoreStatus.apiAvailable ? '✅ Yes' : '❌ No'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Environment:</span>
              <span>{process.env.NEXT_PUBLIC_ENV || 'unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span>Project ID:</span>
              <span className="text-xs">{process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'not set'}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Check:</span>
              <span className="text-xs">
                {firestoreStatus.lastCheck?.toLocaleTimeString() || 'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">Test Controls</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={testFirestoreConnection}
            disabled={isLoading}
            variant="primary"
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </Button>

          <Button
            onClick={testFirestoreData}
            disabled={isLoading}
            variant="outline"
          >
            Test Data Access
          </Button>

          <Button
            onClick={testCacheStats}
            variant="outline"
          >
            Check Cache Stats
          </Button>

          <Button
            onClick={toggleFirestoreMode}
            variant="outline"
            className={dataSourceStatus.usingFirestore ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'}
          >
            {dataSourceStatus.usingFirestore ? 'Disable Firestore' : 'Enable Firestore'}
          </Button>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-800">Configuration</h3>
        <div className="text-sm space-y-1 bg-gray-50 p-3 rounded">
          <div>NEXT_PUBLIC_USE_FIRESTORE: {process.env.NEXT_PUBLIC_USE_FIRESTORE || 'not set'}</div>
          <div>NEXT_PUBLIC_FIRESTORE_FALLBACK_TO_API: {process.env.NEXT_PUBLIC_FIRESTORE_FALLBACK_TO_API || 'not set'}</div>
          <div>Firebase Project: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'not configured'}</div>
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

      {/* Environment Warning */}
      {!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Firebase Configuration Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Firebase environment variables are not configured. Please add your Firebase configuration to .env.local to test Firestore integration.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}