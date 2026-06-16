import type { Room } from "@/core/domain/types";
import type { RoomRepository } from "@/core/ports/index";

export class InMemoryRoomRepository implements RoomRepository {
  private store = new Map<string, Room>();

  async create(room: Room): Promise<void> {
    this.store.set(room.id, structuredClone(room));
  }

  async get(id: string): Promise<Room | null> {
    const room = this.store.get(id);
    return room ? structuredClone(room) : null;
  }

  async update(id: string, mutate: (room: Room) => Room): Promise<Room> {
    const room = this.store.get(id);
    if (!room) throw new Error("방을 찾을 수 없습니다.");
    const next = mutate(structuredClone(room));
    this.store.set(id, structuredClone(next));
    return structuredClone(next);
  }
}
