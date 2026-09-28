/**
 * In-Memory LRU Cache Service (Redis Simulation)
 * Acts as a drop-in mock for Redis to cache driver availability,
 * pricing tiers, and other frequently-read data.
 */

const Redis = require('ioredis');

const DEFAULT_TTL_MS = 60 * 1000;
const MAX_CACHE_SIZE = 100;

const KEY_PREFIX = 'eminence:';

let redisClient = null;
const memoryCache = new Map();

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) return null; // stop retrying
      return Math.min(times * 50, 2000);
    }
  });
  redisClient.on('error', (err) => {
    console.error('Redis connection error:', err.message);
    redisClient = null; // fallback to memory on error
  });
}

const set = async (key, value, ttl = DEFAULT_TTL_MS) => {
  try {
    if (redisClient) {
      await redisClient.set(`${KEY_PREFIX}${key}`, JSON.stringify(value), 'PX', ttl);
      return;
    }
  } catch (err) {
    console.error('Redis set error:', err.message);
  }

  // Fallback: True LRU behavior
  if (memoryCache.has(key)) {
    memoryCache.delete(key);
  } else if (memoryCache.size >= MAX_CACHE_SIZE) {
    // Purge expired keys first
    const now = Date.now();
    for (const [k, v] of memoryCache.entries()) {
      if (now > v.expiresAt) {
        memoryCache.delete(k);
      }
    }
    // If still at capacity, evict least recently used (first inserted/accessed)
    if (memoryCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = memoryCache.keys().next().value;
      if (oldestKey !== undefined) {
        memoryCache.delete(oldestKey);
      }
    }
  }

  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttl
  });
};

const get = async (key) => {
  try {
    if (redisClient) {
      const val = await redisClient.get(`${KEY_PREFIX}${key}`);
      if (val) return JSON.parse(val);
      return null;
    }
  } catch (err) {
    console.error('Redis get error:', err.message);
  }

  // Fallback
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  // True LRU: move accessed entry to the most-recently-used position
  memoryCache.delete(key);
  memoryCache.set(key, entry);
  return entry.value;
};

const del = async (key) => {
  try {
    if (redisClient) {
      await redisClient.del(`${KEY_PREFIX}${key}`);
      return;
    }
  } catch (err) {
    console.error('Redis del error:', err.message);
  }
  memoryCache.delete(key);
};

const flush = async () => {
  try {
    if (redisClient) {
      const stream = redisClient.scanStream({
        match: `${KEY_PREFIX}*`,
        count: 100
      });
      for await (const resultKeys of stream) {
        if (resultKeys.length > 0) {
          await redisClient.del(...resultKeys);
        }
      }
    }
  } catch (err) {
    console.error('Redis flush error:', err.message);
  }
  memoryCache.clear();
};

const stats = async () => {
  let size = memoryCache.size;
  if (redisClient) {
    try {
      let count = 0;
      const stream = redisClient.scanStream({ match: `${KEY_PREFIX}*`, count: 100 });
      for await (const resultKeys of stream) {
        count += resultKeys.length;
      }
      size = count;
    } catch (err) {
      console.error('Redis stats error:', err.message);
    }
  }
  return {
    size,
    maxSize: MAX_CACHE_SIZE,
    type: redisClient ? 'redis' : 'memory'
  };
};

module.exports = { set, get, del, flush, stats };
