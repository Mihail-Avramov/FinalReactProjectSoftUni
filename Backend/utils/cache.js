/**
 * Simple in-memory cache utility
 */
class Cache {
  constructor() {
    this.store = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0
    };
  }

  /**
   * Get value from cache
   */
  get(key, ttl = 300000) {
    const item = this.store.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // Check if item is expired
    if (Date.now() - item.timestamp > ttl) {
      this.store.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return JSON.parse(JSON.stringify(item.data)); // Return a deep copy
  }

  /**
   * Set value in cache
   */
  set(key, data) {
    this.store.set(key, {
      data,
      timestamp: Date.now()
    });
    this.stats.sets++;
    return data;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidate(pattern) {
    const regex = new RegExp(pattern);
    let count = 0;
    
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        count++;
      }
    }
    
    return count;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      size: this.store.size,
      keys: Array.from(this.store.keys())
    };
  }
}

// Създаваме един глобален инстанция на кеша
const globalCache = new Cache();

module.exports = globalCache;