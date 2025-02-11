import { useRedis } from "~/utils/use-redis";
import type { H3Event } from "h3";

interface SetSearchCount {
  userId: string;
  count: number;
  ttl?: number;
}

export function useSearchCount(event: H3Event) {
  const kv = useRedis(event);

  const getSearchCount = async (userId: string): Promise<number | null> => {
    return await kv.get<number | null>(`search_count:${userId}`);
  };

  const setSearchCount = async ({
    userId,
    count,
    ttl,
  }: SetSearchCount): Promise<void> => {
    await kv.set(`search_count:${userId}`, count, {
      ttl,
    });
  };

  return {
    getSearchCount,
    setSearchCount,
  };
}
