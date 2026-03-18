import { Redis } from "@upstash/redis";
import { MahjongEvent } from "./types";

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

const EVENT_PREFIX = "event:";

export async function getEvent(id: string): Promise<MahjongEvent | null> {
  return getRedis().get<MahjongEvent>(`${EVENT_PREFIX}${id}`);
}

export async function saveEvent(event: MahjongEvent): Promise<void> {
  await getRedis().set(`${EVENT_PREFIX}${event.id}`, JSON.stringify(event));
}

export async function deleteEvent(id: string): Promise<void> {
  await getRedis().del(`${EVENT_PREFIX}${id}`);
}

const TABLE_CODE_PREFIX = "tablecode:";

export async function mapTableCodeToEvent(tableCode: string, eventId: string): Promise<void> {
  await getRedis().set(`${TABLE_CODE_PREFIX}${tableCode}`, eventId);
}

export async function getEventIdByTableCode(tableCode: string): Promise<string | null> {
  return getRedis().get<string>(`${TABLE_CODE_PREFIX}${tableCode}`);
}
