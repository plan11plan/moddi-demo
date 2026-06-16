export type RoomStore = "redis" | "memory";

/** 기본은 redis(데모·개발 모두). ROOM_STORE=memory 면 인메모리(주로 테스트용). */
export function getRoomStore(): RoomStore {
  return process.env.ROOM_STORE === "memory" ? "memory" : "redis";
}

export function getRedisEnv(): { url: string; token: string } {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN 가 설정되지 않았습니다 (.env.local).",
    );
  }
  return { url, token };
}
