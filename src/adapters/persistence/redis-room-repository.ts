import type { Redis } from "@upstash/redis";
import type { Room } from "@/core/domain/types";
import type { RoomRepository } from "@/core/ports/index";

const TTL_SECONDS = 60 * 60 * 24;

export class RedisRoomRepository implements RoomRepository {
  constructor(private readonly redis: Redis) {}

  async create(room: Room): Promise<void> {
    const key = `room:${room.id}`;
    await this.redis.set(key, room, { ex: TTL_SECONDS });
  }

  async get(id: string): Promise<Room | null> {
    const key = `room:${id}`;
    const room = await this.redis.get<Room>(key);
    return room ?? null;
  }

  async update(id: string, mutate: (room: Room) => Room): Promise<Room> {
    const key = `room:${id}`;
    const room = await this.redis.get<Room>(key);
    if (!room) throw new Error("방을 찾을 수 없습니다.");
    const next = mutate(room);
    await this.redis.set(key, next, { ex: TTL_SECONDS });
    return next;
  }
}
