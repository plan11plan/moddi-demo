import { describe, it, expect, beforeEach } from "vitest";
import type { AppDeps } from "./deps";
import type { Clock } from "@/core/ports";
import { InMemoryRoomRepository } from "@/adapters/persistence/in-memory-room-repository";
import { MockCandidateProvider } from "@/adapters/candidate/mock-candidate-provider";
import { createRoom } from "./create-room";
import { getRoomState } from "./get-room-state";
import { joinRoom } from "./join-room";
import { startVoting } from "./start-voting";
import { castVote } from "./cast-vote";
import { addCandidate } from "./add-candidate";
import { closeRoom } from "./close-room";

class FakeClock implements Clock {
  t = 1000;
  now() {
    return this.t;
  }
}

let deps: AppDeps;
let clock: FakeClock;

beforeEach(() => {
  clock = new FakeClock();
  deps = {
    roomRepo: new InMemoryRoomRepository(),
    candidateProvider: new MockCandidateProvider(),
    clock,
  };
});

async function makeRoom(timerMinutes = 1) {
  return createRoom(deps, {
    title: "점심 모임",
    location: "강남역",
    headcount: 4,
    budget: "1만원대",
    timerMinutes,
  });
}

describe("full flow", () => {
  it("create → 5 mock candidates, waiting", async () => {
    const { roomId, hostToken } = await makeRoom();
    expect(roomId).toBeTruthy();
    expect(hostToken).toBeTruthy();
    const view = await getRoomState(deps, roomId);
    expect(view.status).toBe("waiting");
    expect(view.candidates).toHaveLength(5);
    expect(view.remainingMs).toBeNull();
    // hostToken must not leak in the public view
    expect((view as unknown as Record<string, unknown>).hostToken).toBeUndefined();
  });

  it("join → start → vote → tallies reflect votes", async () => {
    const { roomId, hostToken } = await makeRoom();
    const { participantId: p1 } = await joinRoom(deps, roomId, "진수");
    const { participantId: p2 } = await joinRoom(deps, roomId, "병필");
    await startVoting(deps, roomId, hostToken);

    let view = await getRoomState(deps, roomId);
    expect(view.status).toBe("voting");
    expect(view.remainingMs).toBe(60_000);
    const target = view.candidates[0].id;

    await castVote(deps, roomId, { participantId: p1, candidateId: target, value: "like" });
    await castVote(deps, roomId, { participantId: p2, candidateId: target, value: "like" });

    view = await getRoomState(deps, roomId);
    const t = view.tallies.find((x) => x.candidateId === target)!;
    expect(t.likes).toBe(2);
    expect(t.score).toBe(2);
  });

  it("add candidate appears in view", async () => {
    const { roomId } = await makeRoom();
    await joinRoom(deps, roomId, "진수");
    await addCandidate(deps, roomId, { name: "동네 분식", description: "떡볶이" });
    const view = await getRoomState(deps, roomId);
    expect(view.candidates.some((c) => c.name === "동네 분식" && c.addedBy === "user")).toBe(true);
  });

  it("host close → decided with a winner", async () => {
    const { roomId, hostToken } = await makeRoom();
    const { participantId: p1 } = await joinRoom(deps, roomId, "진수");
    await startVoting(deps, roomId, hostToken);
    const target = (await getRoomState(deps, roomId)).candidates[1].id;
    await castVote(deps, roomId, { participantId: p1, candidateId: target, value: "like" });

    await closeRoom(deps, roomId, hostToken);
    const view = await getRoomState(deps, roomId);
    expect(view.status).toBe("decided");
    expect(view.decidedCandidateId).toBe(target);
  });

  it("timer expiry auto-closes on next poll (lazy)", async () => {
    const { roomId, hostToken } = await makeRoom(1);
    const { participantId: p1 } = await joinRoom(deps, roomId, "진수");
    await startVoting(deps, roomId, hostToken); // deadline = 1000 + 60000
    const target = (await getRoomState(deps, roomId)).candidates[0].id;
    await castVote(deps, roomId, { participantId: p1, candidateId: target, value: "like" });

    clock.t = 61_001; // past deadline
    const view = await getRoomState(deps, roomId);
    expect(view.status).toBe("decided");
    expect(view.decidedCandidateId).toBe(target);
    expect(view.remainingMs).toBe(0);
  });

  it("rejects vote before voting starts", async () => {
    const { roomId } = await makeRoom();
    const { participantId } = await joinRoom(deps, roomId, "진수");
    const target = (await getRoomState(deps, roomId)).candidates[0].id;
    await expect(
      castVote(deps, roomId, { participantId, candidateId: target, value: "like" }),
    ).rejects.toThrow();
  });

  it("non-host cannot start", async () => {
    const { roomId } = await makeRoom();
    await expect(startVoting(deps, roomId, "wrong-token")).rejects.toThrow();
  });
});
