import type { AppDeps } from "./deps";
import { toRoomView, type RoomView } from "./views";
import { autoCloseIfDue } from "@/core/domain/room";

/** 폴링 진입점 — 타이머가 지났으면 lazy 자동 마감 후 현재 상태 반환. */
export async function getRoomState(
  deps: AppDeps,
  roomId: string,
): Promise<RoomView> {
  const now = deps.clock.now();
  const room = await deps.roomRepo.update(roomId, (r) => autoCloseIfDue(r, now));
  return toRoomView(room, now);
}
