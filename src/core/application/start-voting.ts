import type { AppDeps } from "./deps";
import { startVoting as startVotingDomain } from "@/core/domain/room";

/** 방장이 투표 시작 — 타이머 가동. */
export async function startVoting(
  deps: AppDeps,
  roomId: string,
  hostToken: string,
): Promise<void> {
  const now = deps.clock.now();
  await deps.roomRepo.update(roomId, (r) =>
    startVotingDomain(r, { hostToken, now }),
  );
}
