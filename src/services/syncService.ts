'use client';

import { cachedAPI } from '@/lib/cachedApi';

export interface SyncStatus {
  isRunning: boolean;
  lastSync: Date | null;
  lastError: string | null;
  syncCount: number;
}

export class SyncService {
  private timer: NodeJS.Timer | null = null;
  private isRunning = false;
  private listeners: ((status: SyncStatus) => void)[] = [];
  
  // Sync configuration
  private readonly config = {
    intervalMs: 5 * 60 * 1000,  // 5 minutes
    retryDelayMs: 30 * 1000,    // 30 seconds
    maxRetries: 3
  };

  // Sync status
  private status: SyncStatus = {
    isRunning: false,
    lastSync: null,
    lastError: null,
    syncCount: 0
  };

  constructor() {
    // Skip sync service when using Firestore as primary data source
    if (this.isFirestoreMode()) {
      console.log('Sync service disabled - using Firestore mode');
      return;
    }

    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
      
      // Check if we're starting online
      if (navigator.onLine) {
        this.handleOnline();
      }
    }
  }

  /**
   * Start the sync service
   */
  start(): void {
    if (this.timer) {
      console.log('Sync service already running');
      return;
    }

    console.log('Starting sync service...');
    this.isRunning = true;
    this.updateStatus({ isRunning: true });

    // Start periodic sync
    this.timer = setInterval(() => {
      this.performSync();
    }, this.config.intervalMs);

    // Perform initial sync
    this.performSync();
  }

  /**
   * Stop the sync service
   */
  stop(): void {
    console.log('Stopping sync service...');
    
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    this.isRunning = false;
    this.updateStatus({ isRunning: false });
  }

  /**
   * Force an immediate sync
   */
  async forceSync(): Promise<void> {
    console.log('Force sync requested');
    return this.performSync(true);
  }

  /**
   * Add a listener for sync status changes
   */
  addListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * Check if we're in Firestore mode (no need for API sync)
   */
  private isFirestoreMode(): boolean {
    return process.env.NEXT_PUBLIC_USE_FIRESTORE === 'true';
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
  }

  /**
   * Perform the actual sync operation
   */
  private async performSync(force = false): Promise<void> {
    // Skip if in Firestore mode
    if (this.isFirestoreMode()) {
      console.log('Skipping sync - Firestore mode enabled');
      return;
    }

    // Skip if offline (unless force is true)
    if (!force && !this.isOnline()) {
      console.log('Skipping sync - device is offline');
      return;
    }

    console.log('Starting data sync...');
    
    try {
      // Refresh all cached data
      await cachedAPI.refreshAll();
      
      // Update success status
      this.updateStatus({
        lastSync: new Date(),
        lastError: null,
        syncCount: this.status.syncCount + 1
      });
      
      console.log('Sync completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      console.error('Sync failed:', errorMessage);
      
      this.updateStatus({
        lastError: errorMessage
      });

      // If this is a force sync, re-throw the error
      if (force) {
        throw error;
      }
    }
  }

  /**
   * Handle coming back online
   */
  private handleOnline(): void {
    console.log('Device came online - performing sync');
    
    // Start sync service if not already running
    if (!this.isRunning) {
      this.start();
    } else {
      // Perform immediate sync
      this.performSync();
    }
  }

  /**
   * Handle going offline
   */
  private handleOffline(): void {
    console.log('Device went offline');
    
    this.updateStatus({
      lastError: 'Device is offline'
    });
  }

  /**
   * Update sync status and notify listeners
   */
  private updateStatus(updates: Partial<SyncStatus>): void {
    this.status = { ...this.status, ...updates };
    
    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(this.getStatus());
      } catch (error) {
        console.error('Error in sync status listener:', error);
      }
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cachedAPI.getCacheStats();
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    cachedAPI.clearCache();
    this.updateStatus({
      lastSync: null,
      syncCount: 0,
      lastError: null
    });
  }

  /**
   * Get configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Update sync interval (in minutes)
   */
  setSyncInterval(minutes: number): void {
    this.config.intervalMs = minutes * 60 * 1000;
    
    // Restart timer with new interval if running
    if (this.timer) {
      this.stop();
      this.start();
    }
    
    console.log(`Sync interval updated to ${minutes} minutes`);
  }

  /**
   * Check if we have any cached data available
   */
  hasCachedData(): boolean {
    const cached = cachedAPI.hasCachedData();
    return cached.categories || cached.products;
  }

  /**
   * Check if we have fresh (non-expired) cached data
   */
  hasFreshData(): boolean {
    const fresh = cachedAPI.hasFreshData();
    return fresh.categories || fresh.products;
  }

  /**
   * Destroy the service and clean up resources
   */
  destroy(): void {
    this.stop();
    this.listeners = [];
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }
}

// Export singleton instance
export const syncService = new SyncService();