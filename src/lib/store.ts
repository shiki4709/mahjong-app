import { Redis } from "@upstash/redis";
import { MahjongEvent } from "./types";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const EVENT_PREFIX = "event:";

export async function getEvent(id: string): Promise<MahjongEvent | null> {
  return redis.get<MahjongEvent>(`${EVENT_PREFIX}${id}`);
}

export async function saveEvent(event: MahjongEvent): Promise<void> {
  await redis.set(`${EVENT_PREFIX}${event.id}`, JSON.stringify(event));
}

export async function deleteEvent(id: string): Promise<void> {
  await redis.del(`${EVENT_PREFIX}${id}`);
}
