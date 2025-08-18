'use client';

interface CacheEntry {
  data: any;
  timestamp: number;
  expires: number | null;
  version?: string;
}

interface CacheMetadata {
  lastSync: number;
  cacheVersion: string;
}

export class SimpleCache {
  private memoryCache = new Map<string, CacheEntry>();
  private readonly CACHE_PREFIX = 'foodorder_cache_';
  private readonly METADATA_KEY = 'cache_metadata';
  private readonly isClient = typeof window !== 'undefined';

  // Default TTL values (in milliseconds)
  private readonly DEFAULT_TTL = {
    categories: 60 * 60 * 1000,    // 1 hour
    products: 30 * 60 * 1000,      // 30 minutes
    attributes: 60 * 60 * 1000,    // 1 hour
    default: 30 * 60 * 1000        // 30 minutes
  };

  /**
   * Store data in cache with optional TTL
   */
  set(key: string, data: any, ttl?: number): void {
    if (!this.isClient) return;

    const cacheKey = this.getCacheKey(key);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expires: ttl ? Date.now() + ttl : Date.now() + this.DEFAULT_TTL.default,
      version: this.generateVersion()
    };

    try {
      // Store in localStorage
      localStorage.setItem(cacheKey, JSON.stringify(entry));
      
      // Store in memory cache for faster access
      this.memoryCache.set(key, entry);
      
      // Update metadata
      this.updateMetadata();
      
      console.log(`Cache updated: ${key}`);
    } catch (error) {
      console.error('Failed to save to cache:', error);
      // If localStorage is full, try to clear old entries
      this.cleanupOldEntries();
    }
  }

  /**
   * Retrieve data from cache (memory first, then localStorage)
   */
  get(key: string): any | null {
    if (!this.isClient) return null;

    try {
      // Check memory cache first
      if (this.memoryCache.has(key)) {
        const entry = this.memoryCache.get(key)!;
        if (!this.isExpired(entry)) {
          return entry.data;
        } else {
          this.memoryCache.delete(key);
        }
      }

      // Check localStorage
      const cacheKey = this.getCacheKey(key);
      const stored = localStorage.getItem(cacheKey);
      
      if (stored) {
        const entry: CacheEntry = JSON.parse(stored);
        
        if (!this.isExpired(entry)) {
          // Add back to memory cache
          this.memoryCache.set(key, entry);
          return entry.data;
        } else {
          // Remove expired entry
          this.remove(key);
        }
      }
    } catch (error) {
      console.error('Failed to read from cache:', error);
    }

    return null;
  }

  /**
   * Get data even if expired (fallback for offline mode)
   */
  getStale(key: string): any | null {
    if (!this.isClient) return null;

    try {
      // Check memory cache first
      if (this.memoryCache.has(key)) {
        return this.memoryCache.get(key)!.data;
      }

      // Check localStorage
      const cacheKey = this.getCacheKey(key);
      const stored = localStorage.getItem(cacheKey);
      
      if (stored) {
        const entry: CacheEntry = JSON.parse(stored);
        return entry.data;
      }
    } catch (error) {
      console.error('Failed to read stale data from cache:', error);
    }

    return null;
  }

  /**
   * Check if cache entry is expired
   */
  isExpired(entry: CacheEntry): boolean {
    if (!entry.expires) return false;
    return Date.now() > entry.expires;
  }

  /**
   * Check if key exists in cache and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Check if key exists in cache (even if expired)
   */
  hasStale(key: string): boolean {
    return this.getStale(key) !== null;
  }

  /**
   * Remove item from cache
   */
  remove(key: string): void {
    if (!this.isClient) return;

    const cacheKey = this.getCacheKey(key);
    localStorage.removeItem(cacheKey);
    this.memoryCache.delete(key);
  }

  /**
   * Clear all cache data
   */
  clear(): void {
    if (!this.isClient) return;

    try {
      // Clear localStorage items
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });

      // Clear memory cache
      this.memoryCache.clear();

      // Clear metadata
      localStorage.removeItem(this.METADATA_KEY);

      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memoryEntries: number;
    localStorageEntries: number;
    totalSize: number;
    lastSync: Date | null;
  } {
    if (!this.isClient) {
      return {
        memoryEntries: 0,
        localStorageEntries: 0,
        totalSize: 0,
        lastSync: null
      };
    }

    let localStorageEntries = 0;
    let totalSize = 0;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorageEntries++;
          totalSize += localStorage.getItem(key)?.length || 0;
        }
      });

      const metadata = this.getMetadata();
      
      return {
        memoryEntries: this.memoryCache.size,
        localStorageEntries,
        totalSize,
        lastSync: metadata?.lastSync ? new Date(metadata.lastSync) : null
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        memoryEntries: this.memoryCache.size,
        localStorageEntries: 0,
        totalSize: 0,
        lastSync: null
      };
    }
  }

  /**
   * Clean up old/expired entries to free space
   */
  private cleanupOldEntries(): void {
    if (!this.isClient) return;

    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      // Remove expired entries first
      cacheKeys.forEach(cacheKey => {
        try {
          const stored = localStorage.getItem(cacheKey);
          if (stored) {
            const entry: CacheEntry = JSON.parse(stored);
            if (this.isExpired(entry)) {
              localStorage.removeItem(cacheKey);
            }
          }
        } catch (error) {
          // Remove corrupted entries
          localStorage.removeItem(cacheKey);
        }
      });

      console.log('Cache cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup cache:', error);
    }
  }

  /**
   * Generate cache key with prefix
   */
  private getCacheKey(key: string): string {
    return `${this.CACHE_PREFIX}${key}`;
  }

  /**
   * Generate version string for cache entry
   */
  private generateVersion(): string {
    return Date.now().toString();
  }

  /**
   * Update cache metadata
   */
  private updateMetadata(): void {
    if (!this.isClient) return;

    try {
      const metadata: CacheMetadata = {
        lastSync: Date.now(),
        cacheVersion: '1.0.0'
      };
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to update metadata:', error);
    }
  }

  /**
   * Get cache metadata
   */
  private getMetadata(): CacheMetadata | null {
    if (!this.isClient) return null;

    try {
      const stored = localStorage.getItem(this.METADATA_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get metadata:', error);
      return null;
    }
  }

  /**
   * Set TTL for specific cache types
   */
  setTTL(type: 'categories' | 'products' | 'attributes', ttl: number): void {
    this.DEFAULT_TTL[type] = ttl;
  }

  /**
   * Get TTL for specific cache type
   */
  getTTL(type: 'categories' | 'products' | 'attributes'): number {
    return this.DEFAULT_TTL[type];
  }
}

// Export singleton instance
export const simpleCache = new SimpleCache();