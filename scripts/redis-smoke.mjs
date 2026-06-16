// Upstash 연결·객체 라운드트립·RMW 확인용 스모크. 비밀값 없음.
// 실행: node --env-file=.env.local scripts/redis-smoke.mjs
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const key = "room:__smoke__";
const room = { id: "__smoke__", title: "스모크", votes: [], n: 1 };

await redis.set(key, room, { ex: 60 });
const got = await redis.get(key);
console.log("roundtrip:", JSON.stringify(got) === JSON.stringify(room) ? "OK" : "FAIL", got);

const cur = await redis.get(key);
cur.n = 2;
cur.votes.push({ seq: 1 });
await redis.set(key, cur, { ex: 60 });
const after = await redis.get(key);
console.log("rmw update:", after.n === 2 && after.votes.length === 1 ? "OK" : "FAIL");

await redis.del(key);
console.log("cleanup: OK");
