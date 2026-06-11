import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.warn('Redis reconnection failed after 5 retries. Disabling cache...');
        return false; // Stop reconnecting
      }
      return Math.min(retries * 500, 2000);
    }
  }
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis server successfully.');
});

// Immediately connect to Redis in the background
if (process.env.NODE_ENV !== 'test') {
  redisClient.connect().catch((err) => {
    console.warn('Failed to connect to Redis. Caching operations will fallback to DB.', err.message);
  });
}

export default redisClient;
