import { describe, it, expect } from "vitest";
import type { Room } from "./types";
import {
  createRoom,
  joinRoom,
  startVoting,
  castVote,
  addCandidate,
  closeRoom,
  autoCloseIfDue,
} from "./room";
import { DomainError } from "./errors";

function baseRoom(): Room {
  return createRoom({
    id: "r1",
    hostToken: "host-token",
    title: "점심",
    conditions: { location: "강남역", headcount: 4, budget: "1만원대" },
    timerMinutes: 1,
    candidates: [
      { id: "a", name: "칼국수", description: "", tags: [], addedBy: "ai" },
      { id: "b", name: "초밥", description: "", tags: [], addedBy: "ai" },
    ],
    now: 1000,
  });
}

function withParticipants(room: Room, ids: string[]): Room {
  return ids.reduce(
    (r, id) => joinRoom(r, { participantId: id, nickname: id, now: 0 }),
    room,
  );
}

describe("createRoom", () => {
  it("starts in waiting with no timer running", () => {
    const r = baseRoom();
    expect(r.status).toBe("waiting");
    expect(r.deadlineAt).toBeNull();
    expect(r.candidates).toHaveLength(2);
  });
});

describe("joinRoom", () => {
  it("appends a participant", () => {
    const r = joinRoom(baseRoom(), { participantId: "p1", nickname: " 진수 ", now: 5 });
    expect(r.participants).toEqual([{ id: "p1", nickname: "진수", joinedAt: 5 }]);
  });
  it("rejects empty nickname", () => {
    expect(() => joinRoom(baseRoom(), { participantId: "p1", nickname: "  ", now: 5 })).toThrow(
      DomainError,
    );
  });
});

describe("startVoting", () => {
  it("host starts → voting with deadline now + timer", () => {
    const r = startVoting(baseRoom(), { hostToken: "host-token", now: 2000 });
    expect(r.status).toBe("voting");
    expect(r.deadlineAt).toBe(2000 + 60_000);
  });
  it("non-host forbidden", () => {
    expect(() => startVoting(baseRoom(), { hostToken: "nope", now: 2000 })).toThrow(/방장/);
  });
  it("cannot start twice", () => {
    const r = startVoting(baseRoom(), { hostToken: "host-token", now: 2000 });
    expect(() => startVoting(r, { hostToken: "host-token", now: 3000 })).toThrow(DomainError);
  });
});

describe("castVote", () => {
  function votingRoom(): Room {
    return startVoting(withParticipants(baseRoom(), ["p1", "p2"]), {
      hostToken: "host-token",
      now: 2000,
    });
  }
  it("adds a vote", () => {
    const r = castVote(votingRoom(), { participantId: "p1", candidateId: "a", value: "like", now: 3000 });
    expect(r.votes).toHaveLength(1);
    expect(r.votes[0]).toMatchObject({ participantId: "p1", candidateId: "a", value: "like", seq: 1 });
  });
  it("same value again toggles off", () => {
    let r = castVote(votingRoom(), { participantId: "p1", candidateId: "a", value: "like", now: 3000 });
    r = castVote(r, { participantId: "p1", candidateId: "a", value: "like", now: 3100 });
    expect(r.votes).toHaveLength(0);
  });
  it("opposite value switches", () => {
    let r = castVote(votingRoom(), { participantId: "p1", candidateId: "a", value: "like", now: 3000 });
    r = castVote(r, { participantId: "p1", candidateId: "a", value: "dislike", now: 3100 });
    expect(r.votes).toHaveLength(1);
    expect(r.votes[0].value).toBe("dislike");
  });
  it("one vote per (participant, candidate) — independent across candidates", () => {
    let r = castVote(votingRoom(), { participantId: "p1", candidateId: "a", value: "like", now: 3000 });
    r = castVote(r, { participantId: "p1", candidateId: "b", value: "like", now: 3100 });
    expect(r.votes).toHaveLength(2);
  });
  it("rejects voting before start", () => {
    const r = withParticipants(baseRoom(), ["p1"]);
    expect(() => castVote(r, { participantId: "p1", candidateId: "a", value: "like", now: 1 })).toThrow(
      /투표할 수 없/,
    );
  });
  it("rejects unknown participant / candidate", () => {
    expect(() => castVote(votingRoom(), { participantId: "ghost", candidateId: "a", value: "like", now: 1 })).toThrow(
      DomainError,
    );
    expect(() => castVote(votingRoom(), { participantId: "p1", candidateId: "zzz", value: "like", now: 1 })).toThrow(
      DomainError,
    );
  });
});

describe("addCandidate", () => {
  it("appends a user candidate", () => {
    const r = addCandidate(baseRoom(), { candidateId: "c", name: "라멘", description: "진한 돈코츠" });
    expect(r.candidates.at(-1)).toMatchObject({ id: "c", name: "라멘", addedBy: "user" });
  });
  it("blocked when decided", () => {
    const decided = closeRoom(startVoting(baseRoom(), { hostToken: "host-token", now: 2000 }), {
      hostToken: "host-token",
    });
    expect(() => addCandidate(decided, { candidateId: "c", name: "라멘" })).toThrow(DomainError);
  });
});

describe("closeRoom / autoCloseIfDue", () => {
  function voting(): Room {
    let r = startVoting(withParticipants(baseRoom(), ["p1", "p2"]), { hostToken: "host-token", now: 2000 });
    r = castVote(r, { participantId: "p1", candidateId: "b", value: "like", now: 2500 });
    r = castVote(r, { participantId: "p2", candidateId: "b", value: "like", now: 2600 });
    return r;
  }
  it("host close → decided with winner", () => {
    const r = closeRoom(voting(), { hostToken: "host-token" });
    expect(r.status).toBe("decided");
    expect(r.decidedCandidateId).toBe("b");
  });
  it("non-host cannot close", () => {
    expect(() => closeRoom(voting(), { hostToken: "nope" })).toThrow(/방장/);
  });
  it("autoClose triggers only after deadline", () => {
    const r = voting(); // deadline = 2000 + 60000 = 62000
    expect(autoCloseIfDue(r, 61_999).status).toBe("voting");
    const closed = autoCloseIfDue(r, 62_000);
    expect(closed.status).toBe("decided");
    expect(closed.decidedCandidateId).toBe("b");
  });
});
