import type { AppDeps } from "./deps";
import type { VoteValue } from "@/core/domain/types";
import { castVote as castVoteDomain } from "@/core/domain/room";

export interface CastVoteCommand {
  participantId: string;
  candidateId: string;
  value: VoteValue;
}

/** 투표 — upsert(한 명 한 후보 한 표). */
export async function castVote(
  deps: AppDeps,
  roomId: string,
  cmd: CastVoteCommand,
): Promise<void> {
  const now = deps.clock.now();
  await deps.roomRepo.update(roomId, (r) => castVoteDomain(r, { ...cmd, now }));
}
