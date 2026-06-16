import type {
  Room,
  Candidate,
  Participant,
  CandidateTally,
  Conditions,
  RoomStatus,
  VoteValue,
} from "@/core/domain/types";
import { tallyAll } from "@/core/domain/tally";

/** 폴링으로 클라이언트에 내보내는 방 상태. hostToken·vote.at 은 제외(비공개/불필요). */
export interface RoomView {
  id: string;
  title: string;
  conditions: Conditions;
  status: RoomStatus;
  timerMinutes: number;
  deadlineAt: number | null;
  remainingMs: number | null;
  candidates: Candidate[];
  participants: Participant[];
  votes: {
    seq: number;
    participantId: string;
    candidateId: string;
    value: VoteValue;
  }[];
  tallies: CandidateTally[];
  decidedCandidateId: string | null;
}

export function toRoomView(room: Room, now: number): RoomView {
  return {
    id: room.id,
    title: room.title,
    conditions: room.conditions,
    status: room.status,
    timerMinutes: room.timerMinutes,
    deadlineAt: room.deadlineAt,
    remainingMs:
      room.deadlineAt === null ? null : Math.max(0, room.deadlineAt - now),
    candidates: room.candidates,
    participants: room.participants,
    votes: room.votes.map((v) => ({
      seq: v.seq,
      participantId: v.participantId,
      candidateId: v.candidateId,
      value: v.value,
    })),
    tallies: tallyAll(room),
    decidedCandidateId: room.decidedCandidateId,
  };
}
