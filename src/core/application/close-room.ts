import type { AppDeps } from "./deps";
import { closeRoom as closeRoomDomain } from "@/core/domain/room";

/** 방장이 "지금 마감" — 우승 확정. */
export async function closeRoom(
  deps: AppDeps,
  roomId: string,
  hostToken: string,
): Promise<void> {
  await deps.roomRepo.update(roomId, (r) =>
    closeRoomDomain(r, { hostToken }),
  );
}
