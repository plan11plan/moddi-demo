import type { Room, Conditions, Candidate, VoteValue } from "./types";
import { DomainError } from "./errors";
import { winnerId } from "./tally";

const MINUTE = 60_000;

function nextSeq(room: Room): number {
  let max = 0;
  for (const v of room.votes) if (v.seq > max) max = v.seq;
  return max + 1;
}

export interface CreateRoomInput {
  id: string;
  hostToken: string;
  title: string;
  conditions: Conditions;
  timerMinutes: number;
  candidates: Candidate[];
  now: number;
}

/** 방 생성 — 상태 waiting, 타이머는 아직 안 돔(deadlineAt=null). */
export function createRoom(input: CreateRoomInput): Room {
  return {
    id: input.id,
    title: input.title.trim() || "점심 모임",
    conditions: input.conditions,
    hostToken: input.hostToken,
    status: "waiting",
    timerMinutes: input.timerMinutes,
    deadlineAt: null,
    candidates: input.candidates,
    participants: [],
    votes: [],
    decidedCandidateId: null,
    createdAt: input.now,
  };
}

export function joinRoom(
  room: Room,
  args: { participantId: string; nickname: string; now: number },
): Room {
  const nickname = args.nickname.trim();
  if (!nickname) throw new DomainError("닉네임을 입력해 주세요.", "bad_input");
  return {
    ...room,
    participants: [
      ...room.participants,
      { id: args.participantId, nickname, joinedAt: args.now },
    ],
  };
}

/** 방장이 투표 시작 — 타이머 가동. */
export function startVoting(
  room: Room,
  args: { hostToken: string; now: number },
): Room {
  assertHost(room, args.hostToken);
  if (room.status !== "waiting")
    throw new DomainError("이미 시작했거나 끝난 방입니다.", "invalid_state");
  return {
    ...room,
    status: "voting",
    deadlineAt: args.now + room.timerMinutes * MINUTE,
  };
}

/** 투표 upsert — 한 명 한 후보 한 표. 같은 값 재투표=취소, 반대=전환. */
export function castVote(
  room: Room,
  args: {
    participantId: string;
    candidateId: string;
    value: VoteValue;
    now: number;
  },
): Room {
  if (room.status !== "voting")
    throw new DomainError("지금은 투표할 수 없습니다.", "invalid_state");
  if (!room.participants.some((p) => p.id === args.participantId))
    throw new DomainError("입장하지 않은 참여자입니다.", "forbidden");
  if (!room.candidates.some((c) => c.id === args.candidateId))
    throw new DomainError("없는 후보입니다.", "not_found");

  const idx = room.votes.findIndex(
    (v) =>
      v.participantId === args.participantId &&
      v.candidateId === args.candidateId,
  );

  let votes;
  if (idx === -1) {
    votes = [
      ...room.votes,
      {
        seq: nextSeq(room),
        participantId: args.participantId,
        candidateId: args.candidateId,
        value: args.value,
        at: args.now,
      },
    ];
  } else if (room.votes[idx].value === args.value) {
    // 같은 값 재클릭 = 취소(토글 오프)
    votes = room.votes.filter((_, i) => i !== idx);
  } else {
    // 반대 클릭 = 전환(새 seq)
    votes = room.votes.map((v, i) =>
      i === idx ? { ...v, value: args.value, seq: nextSeq(room), at: args.now } : v,
    );
  }
  return { ...room, votes };
}

/** 참여자가 후보 직접 추가 — 대기·투표 중 모두 허용. */
export function addCandidate(
  room: Room,
  args: { candidateId: string; name: string; description?: string },
): Room {
  if (room.status === "decided")
    throw new DomainError("이미 끝난 방입니다.", "invalid_state");
  const name = args.name.trim();
  if (!name) throw new DomainError("후보 이름을 입력해 주세요.", "bad_input");
  return {
    ...room,
    candidates: [
      ...room.candidates,
      {
        id: args.candidateId,
        name,
        description: (args.description ?? "").trim(),
        tags: [],
        addedBy: "user",
      },
    ],
  };
}

/** 방장이 "지금 마감" — 우승 확정. */
export function closeRoom(room: Room, args: { hostToken: string }): Room {
  assertHost(room, args.hostToken);
  if (room.status !== "voting")
    throw new DomainError("투표 중인 방만 마감할 수 있습니다.", "invalid_state");
  return decide(room);
}

/** 폴링 시 호출 — 타이머가 지났으면 자동 마감. 아니면 그대로. */
export function autoCloseIfDue(room: Room, now: number): Room {
  if (room.status === "voting" && room.deadlineAt !== null && now >= room.deadlineAt)
    return decide(room);
  return room;
}

function decide(room: Room): Room {
  return {
    ...room,
    status: "decided",
    decidedCandidateId: winnerId(room),
  };
}

function assertHost(room: Room, hostToken: string): void {
  if (hostToken !== room.hostToken)
    throw new DomainError("방장만 할 수 있습니다.", "forbidden");
}
