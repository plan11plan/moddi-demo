// 도메인 타입 — spec/data-schema.md 의 스키마와 1:1.

export type RoomStatus = "waiting" | "voting" | "decided";
export type VoteValue = "like" | "dislike";

export interface Conditions {
  location: string;
  headcount: number;
  budget: string;
}

export interface Candidate {
  id: string;
  name: string;
  description: string;
  tags: string[];
  addedBy: "ai" | "user";
}

export interface Participant {
  id: string;
  nickname: string;
  joinedAt: number;
}

export interface Vote {
  seq: number; // 방 단위 단조 증가 순번 — 동점 타이브레이크 전용
  participantId: string;
  candidateId: string;
  value: VoteValue;
  at: number;
}

export interface Room {
  id: string;
  title: string;
  conditions: Conditions;
  hostToken: string; // 공유 링크엔 노출 X
  status: RoomStatus;
  timerMinutes: number;
  deadlineAt: number | null; // voting 시작 시 now + timer
  candidates: Candidate[];
  participants: Participant[];
  votes: Vote[];
  decidedCandidateId: string | null;
  createdAt: number;
}

/** 클라이언트로 내보내는 집계 결과(후보별). 저장 안 하고 votes에서 계산. */
export interface CandidateTally {
  candidateId: string;
  likes: number;
  dislikes: number;
  score: number; // likes - dislikes
}
