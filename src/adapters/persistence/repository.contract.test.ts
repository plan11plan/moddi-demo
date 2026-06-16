import { describe, it, expect } from "vitest";
import { InMemoryRoomRepository } from "./in-memory-room-repository";
import type { Room } from "@/core/domain/types";

function makeRoom(overrides?: Partial<Room>): Room {
  return {
    id: "room-1",
    title: "Test Room",
    conditions: { location: "Seoul", headcount: 4, budget: "10000" },
    hostToken: "host-token-abc",
    status: "waiting",
    timerMinutes: 5,
    deadlineAt: null,
    candidates: [],
    participants: [],
    votes: [],
    decidedCandidateId: null,
    createdAt: 1700000000000,
    ...overrides,
  };
}

describe("RoomRepository contract — InMemoryRoomRepository", () => {
  it("create + get roundtrip returns equal data", async () => {
    const repo = new InMemoryRoomRepository();
    const room = makeRoom();
    await repo.create(room);
    const fetched = await repo.get(room.id);
    expect(fetched).toEqual(room);
  });

  it("get on missing id returns null", async () => {
    const repo = new InMemoryRoomRepository();
    const result = await repo.get("does-not-exist");
    expect(result).toBeNull();
  });

  it("update applies the mutation and persists it", async () => {
    const repo = new InMemoryRoomRepository();
    const room = makeRoom();
    await repo.create(room);
    const updated = await repo.update(room.id, (r) => ({ ...r, title: "Updated Title" }));
    expect(updated.title).toBe("Updated Title");
    const fetched = await repo.get(room.id);
    expect(fetched?.title).toBe("Updated Title");
  });

  it("update on missing id throws", async () => {
    const repo = new InMemoryRoomRepository();
    await expect(
      repo.update("no-such-room", (r) => r)
    ).rejects.toThrow("방을 찾을 수 없습니다.");
  });

  it("mutating a room returned by get does not affect subsequent gets", async () => {
    const repo = new InMemoryRoomRepository();
    const room = makeRoom();
    await repo.create(room);
    const first = await repo.get(room.id);
    // Mutate the returned object
    first!.title = "mutated externally";
    first!.participants.push({ id: "p1", nickname: "Alice", joinedAt: 0 });
    const second = await repo.get(room.id);
    expect(second?.title).toBe("Test Room");
    expect(second?.participants).toHaveLength(0);
  });
});
