import type { AppDeps } from "./deps";
import { addCandidate as addCandidateDomain } from "@/core/domain/room";
import { newCandidateId } from "@/core/domain/ids";

/** 참여자가 후보 직접 추가 — 대기·투표 중 모두 허용. */
export async function addCandidate(
  deps: AppDeps,
  roomId: string,
  input: { name: string; description?: string },
): Promise<{ candidateId: string }> {
  const candidateId = newCandidateId();
  await deps.roomRepo.update(roomId, (r) =>
    addCandidateDomain(r, {
      candidateId,
      name: input.name,
      description: input.description,
    }),
  );
  return { candidateId };
}
