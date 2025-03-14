const { Redis } = require('@upstash/redis');

class RedisClient {
  constructor() {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.warn('Redis environment variables are not set');
      return this.getMockClient();
    }

    try {
      this.client = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      });
    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
      throw new Error('Failed to initialize Redis client');
    }
  }

  getMockClient() {
    return {
      async get(key) { 
        console.log(`Mock get for key: ${key}`);
        return key === 'games' ? [] : null;
      },
      async set(key, value) {
        console.log(`Mock set for key: ${key}`, value);
        return true;
      },
      async exists(key) {
        return false;
      }
    };
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      if (value === null || value === undefined) {
        if (key === 'games') return [];
        return null;
      }
      return value; // Upstash Redis automatically handles JSON serialization
    } catch (error) {
      console.error(`Error getting ${key} from Redis:`, error);
      throw new Error(`Failed to get ${key} from Redis`);
    }
  }

  async set(key, value) {
    try {
      if (!key || value === undefined) {
        throw new Error('Invalid key or value');
      }
      await this.client.set(key, value); // Upstash Redis automatically handles JSON serialization
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in Redis:`, error);
      throw new Error(`Failed to set ${key} in Redis`);
    }
  }

  async exists(key) {
    try {
      if (!key) {
        throw new Error('Invalid key');
      }
      const value = await this.client.exists(key);
      return value === 1;
    } catch (error) {
      console.error(`Error checking ${key} in Redis:`, error);
      return false;
    }
  }
}

// Export a singleton instance
module.exports = new RedisClient();
