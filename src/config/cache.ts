import { Request, Response, NextFunction } from 'express';

interface CacheItem<T = any> {
  data: T;
  expiresAt: number;
}

export class CacheService {
  private static store = new Map<string, CacheItem>();

  /**
   * Sets a value in cache with TTL in seconds (default 5 minutes)
   */
  static set(key: string, data: any, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { data, expiresAt });
  }

  /**
   * Gets a value from cache if valid
   */
  static get<T = any>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Deletes a specific cache key or keys matching prefix
   */
  static delete(keyOrPrefix: string): void {
    for (const key of this.store.keys()) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Flushes the entire cache
   */
  static flush(): void {
    this.store.clear();
  }
}

/**
 * Express Middleware for caching GET requests
 */
export const cacheMiddleware = (ttlSeconds: number = 300) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `cache:${req.originalUrl || req.url}`;
    const cachedData = CacheService.get(cacheKey);

    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      res.status(200).json(cachedData);
      return;
    }

    res.setHeader('X-Cache', 'MISS');

    // Intercept res.json to store result in cache
    const originalJson = res.json.bind(res);
    res.json = (body: any): Response => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        CacheService.set(cacheKey, body, ttlSeconds);
      }
      return originalJson(body);
    };

    next();
  };
};

export default CacheService;
