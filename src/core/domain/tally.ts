import type { Room, CandidateTally } from "./types";

/** 후보별 집계 — votes에서 계산(저장하지 않음). */
export function tallyFor(room: Room, candidateId: string): CandidateTally {
  let likes = 0;
  let dislikes = 0;
  for (const vote of room.votes) {
    if (vote.candidateId !== candidateId) continue;
    if (vote.value === "like") likes++;
    else dislikes++;
  }
  return { candidateId, likes, dislikes, score: likes - dislikes };
}

export function tallyAll(room: Room): CandidateTally[] {
  return room.candidates.map((c) => tallyFor(room, c.id));
}

/**
 * "그 점수에 먼저 도달한 후보" 타이브레이크용 지표.
 * 후보의 like 투표 중 가장 큰 seq(= 마지막 like가 들어온 시점). 작을수록 먼저 자리잡음.
 * like가 없으면 Infinity(타이브레이크에서 뒤로).
 */
function reachedSeq(room: Room, candidateId: string): number {
  let last = -1;
  for (const vote of room.votes) {
    if (vote.candidateId === candidateId && vote.value === "like") {
      if (vote.seq > last) last = vote.seq;
    }
  }
  return last === -1 ? Number.POSITIVE_INFINITY : last;
}

/** 점수 내림차순, 동점은 먼저 도달(작은 reachedSeq), 그다음 후보 등록 순. */
export function rankedCandidateIds(room: Room): string[] {
  const order = new Map(room.candidates.map((c, i) => [c.id, i]));
  const score = new Map(tallyAll(room).map((t) => [t.candidateId, t.score]));
  return [...room.candidates]
    .map((c) => c.id)
    .sort((a, b) => {
      const ds = (score.get(b) ?? 0) - (score.get(a) ?? 0);
      if (ds !== 0) return ds;
      const dr = reachedSeq(room, a) - reachedSeq(room, b);
      if (dr !== 0) return dr;
      return (order.get(a) ?? 0) - (order.get(b) ?? 0);
    });
}

export function winnerId(room: Room): string | null {
  return rankedCandidateIds(room)[0] ?? null;
}
