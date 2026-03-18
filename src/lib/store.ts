import { kv } from "@vercel/kv";
import { MahjongEvent } from "./types";

const EVENT_PREFIX = "event:";

export async function getEvent(id: string): Promise<MahjongEvent | null> {
  return kv.get<MahjongEvent>(`${EVENT_PREFIX}${id}`);
}

export async function saveEvent(event: MahjongEvent): Promise<void> {
  await kv.set(`${EVENT_PREFIX}${event.id}`, event);
}

export async function deleteEvent(id: string): Promise<void> {
  await kv.del(`${EVENT_PREFIX}${id}`);
}
