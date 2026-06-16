import { describe, it, expect } from "vitest";
import type { Room, Vote } from "./types";
import { tallyAll, rankedCandidateIds, winnerId } from "./tally";

function room(candidateIds: string[], votes: Vote[]): Room {
  return {
    id: "r1",
    title: "점심",
    conditions: { location: "강남역", headcount: 4, budget: "1만원대" },
    hostToken: "host",
    status: "voting",
    timerMinutes: 1,
    deadlineAt: null,
    candidates: candidateIds.map((id) => ({
      id,
      name: id,
      description: "",
      tags: [],
      addedBy: "ai" as const,
    })),
    participants: [],
    votes,
    decidedCandidateId: null,
    createdAt: 0,
  };
}

function v(seq: number, p: string, c: string, value: "like" | "dislike"): Vote {
  return { seq, participantId: p, candidateId: c, value, at: seq };
}

describe("tally", () => {
  it("counts likes/dislikes and score per candidate", () => {
    const r = room(["a", "b"], [
      v(1, "p1", "a", "like"),
      v(2, "p2", "a", "like"),
      v(3, "p3", "a", "dislike"),
      v(4, "p1", "b", "dislike"),
    ]);
    const t = tallyAll(r);
    expect(t.find((x) => x.candidateId === "a")).toEqual({
      candidateId: "a",
      likes: 2,
      dislikes: 1,
      score: 1,
    });
    expect(t.find((x) => x.candidateId === "b")).toEqual({
      candidateId: "b",
      likes: 0,
      dislikes: 1,
      score: -1,
    });
  });

  it("ranks by score descending", () => {
    const r = room(["a", "b", "c"], [
      v(1, "p1", "b", "like"),
      v(2, "p2", "b", "like"),
      v(3, "p1", "a", "like"),
      v(4, "p1", "c", "dislike"),
    ]);
    expect(rankedCandidateIds(r)).toEqual(["b", "a", "c"]);
    expect(winnerId(r)).toBe("b");
  });

  it("breaks score ties in favor of the candidate that reached it first (smaller like-seq)", () => {
    // a, b both score 1. a's like is seq 1 (earlier) → a wins.
    const r = room(["a", "b"], [
      v(1, "p1", "a", "like"),
      v(2, "p2", "b", "like"),
    ]);
    expect(winnerId(r)).toBe("a");
    expect(rankedCandidateIds(r)).toEqual(["a", "b"]);
  });

  it("with no votes, winner is deterministic (first candidate by order)", () => {
    const r = room(["a", "b"], []);
    expect(winnerId(r)).toBe("a");
  });

  it("returns null winner when there are no candidates", () => {
    const r = room([], []);
    expect(winnerId(r)).toBeNull();
  });
});
