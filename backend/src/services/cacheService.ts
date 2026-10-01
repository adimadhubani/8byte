import NodeCache from "node-cache";

// TODO: Redis use karna hai production ke liye, abhi in-memory theek hai
const cache = new NodeCache({
  stdTTL: 15,
  checkperiod: 30
});

export const priceCache = {
  get<T>(key: string): T | undefined {
    return cache.get<T>(key);
  },

  set<T>(key: string, value: T, ttlSeconds?: number): boolean {
    if (ttlSeconds !== undefined) {
      return cache.set(key, value, ttlSeconds);
    }
    return cache.set(key, value);
  },

  del(key: string): number {
    return cache.del(key);
  },

  flush(): void {
    cache.flushAll();
  }
};
