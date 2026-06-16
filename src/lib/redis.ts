import { Redis } from "@upstash/redis";
import { getRedisEnv } from "./env";

let client: Redis | null = null;

/** Upstash Redis(REST) 클라이언트 — 서버리스 커넥션 걱정 없음. */
export function getRedis(): Redis {
  if (!client) {
    const { url, token } = getRedisEnv();
    client = new Redis({ url, token });
  }
  return client;
}
