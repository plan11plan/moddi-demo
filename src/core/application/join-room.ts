import type { AppDeps } from "./deps";
import { joinRoom as joinRoomDomain } from "@/core/domain/room";
import { newParticipantId } from "@/core/domain/ids";

/** 게스트 입장 — 닉네임만으로. participantId 발급. */
export async function joinRoom(
  deps: AppDeps,
  roomId: string,
  nickname: string,
): Promise<{ participantId: string }> {
  const participantId = newParticipantId();
  const now = deps.clock.now();
  await deps.roomRepo.update(roomId, (r) =>
    joinRoomDomain(r, { participantId, nickname, now }),
  );
  return { participantId };
}
