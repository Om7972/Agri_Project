import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Local in-memory cache fallback
const memoryCache = new Map<string, { value: string; expiresAt: number }>();

class MemoryRedisMock {
  public isOpen = true;
  async connect() {
    return;
  }
  async disconnect() {
    return;
  }
  async get(key: string): Promise<string | null> {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    return entry.value;
  }
  async setEx(key: string, seconds: number, value: string): Promise<string> {
    memoryCache.set(key, {
      value,
      expiresAt: Date.now() + (seconds * 1000),
    });
    return 'OK';
  }
}

let redisClient: any;
let isRedisAvailable = false;

if (process.env.NODE_ENV !== 'test') {
  try {
    const realClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 1) {
            return false; // stop trying immediately in dev/prod to avoid console spam
          }
          return 1000;
        }
      }
    });

    realClient.on('error', () => {
      isRedisAvailable = false;
    });

    realClient.on('connect', () => {
      console.log('Connected to Redis server successfully.');
      isRedisAvailable = true;
    });

    realClient.connect().catch(() => {
      // Silent catch to prevent uncaught exceptions in background connect
    });

    // We use a Proxy or a wrapper to seamlessly switch
    redisClient = new Proxy(realClient, {
      get(target, prop, receiver) {
        if (prop === 'get') {
          return async (key: string) => {
            if (isRedisAvailable) {
              try {
                return await target.get(key);
              } catch {
                return await new MemoryRedisMock().get(key);
              }
            }
            return await new MemoryRedisMock().get(key);
          };
        }
        if (prop === 'setEx') {
          return async (key: string, seconds: number, value: string) => {
            if (isRedisAvailable) {
              try {
                return await target.setEx(key, seconds, value);
              } catch {
                return await new MemoryRedisMock().setEx(key, seconds, value);
              }
            }
            return await new MemoryRedisMock().setEx(key, seconds, value);
          };
        }
        if (prop === 'isOpen') {
          return isRedisAvailable ? target.isOpen : true;
        }
        if (prop === 'disconnect') {
          return async () => {
            if (isRedisAvailable) {
              try {
                await target.disconnect();
              } catch {}
            }
          };
        }
        return Reflect.get(target, prop, receiver);
      }
    });
  } catch (err) {
    redisClient = new MemoryRedisMock();
  }
} else {
  redisClient = new MemoryRedisMock();
}

export default redisClient;
