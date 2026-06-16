import { describe, it, expect } from "vitest";
import type { RoomRepository, Clock } from "@/core/ports";
import type { Room } from "@/core/domain/types";
import { InMemoryRoomRepository } from "@/adapters/persistence/in-memory-room-repository";
import { MockCandidateProvider } from "@/adapters/candidate/mock-candidate-provider";
import { createRoom } from "./create-room";
import { startVoting } from "./start-voting";
import { getRoomState } from "./get-room-state";

/** update() 호출 횟수를 세는 래퍼 — 폴링이 write하는지 검증. */
class CountingRepo implements RoomRepository {
  updates = 0;
  constructor(private readonly inner: RoomRepository) {}
  create(r: Room) {
    return this.inner.create(r);
  }
  get(id: string) {
    return this.inner.get(id);
  }
  update(id: string, mutate: (r: Room) => Room) {
    this.updates++;
    return this.inner.update(id, mutate);
  }
}

class FakeClock implements Clock {
  t = 1000;
  now() {
    return this.t;
  }
}

function makeDeps() {
  const clock = new FakeClock();
  const repo = new CountingRepo(new InMemoryRoomRepository());
  return {
    clock,
    repo,
    deps: { roomRepo: repo, candidateProvider: new MockCandidateProvider(), clock },
  };
}

const cmd = {
  title: "t",
  location: "강남역",
  headcount: 4,
  budget: "1만원대",
  timerMinutes: 1,
};

describe("getRoomState write behavior", () => {
  it("does NOT write during waiting/voting polls (read-only)", async () => {
    const { repo, deps } = makeDeps();
    const { roomId, hostToken } = await createRoom(deps, cmd);
    await getRoomState(deps, roomId); // waiting poll
    await startVoting(deps, roomId, hostToken); // 1 write
    const before = repo.updates;
    await getRoomState(deps, roomId); // voting poll, not due
    await getRoomState(deps, roomId);
    expect(repo.updates).toBe(before); // polls wrote nothing
  });

  it("writes exactly once to auto-close when the timer is due", async () => {
    const { repo, clock, deps } = makeDeps();
    const { roomId, hostToken } = await createRoom(deps, cmd);
    await startVoting(deps, roomId, hostToken);
    clock.t = 61_001; // past deadline
    const before = repo.updates;
    const view = await getRoomState(deps, roomId);
    expect(view.status).toBe("decided");
    expect(repo.updates).toBe(before + 1);
    // already decided → further polls don't write
    const after = repo.updates;
    await getRoomState(deps, roomId);
    expect(repo.updates).toBe(after);
  });
});
