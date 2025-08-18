'use client';

import { syncService } from '@/services/syncService';

/**
 * Initialize the cache system when the app starts
 */
export function initializeCache() {
  if (typeof window === 'undefined') return;

  // Start the sync service
  syncService.start();

  console.log('Cache system initialized');
}

/**
 * Cleanup cache system on app unmount
 */
export function cleanupCache() {
  if (typeof window === 'undefined') return;

  syncService.destroy();
  console.log('Cache system cleaned up');
}