import type { H3Event } from "h3";
import { createStorage, type Storage } from "unstorage";
import redisDriver from "unstorage/drivers/redis";

export const useRedis = (event: H3Event): Storage => {
  // No need to recreate client if exists in request context

  if (!event.context._redis) {
    event.context._redis = createStorage({
      driver: redisDriver({
        url: process.env.REDIS_URL,
      }),
    });
  }

  return event.context._redis as Storage;
};
