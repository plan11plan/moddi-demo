import type { AppDeps } from "./deps";
import { toRoomView, type RoomView } from "./views";
import { autoCloseIfDue } from "@/core/domain/room";

/**
 * 폴링 진입점. 1초마다 호출되므로 기본은 **읽기 전용**이다.
 * 타이머가 지난 순간에만 write(자동 마감)한다.
 * (매 폴링마다 write하면 동시 입장/투표를 RMW로 덮어써 유실시킨다 — 실측으로 확인된 버그.)
 */
export async function getRoomState(
  deps: AppDeps,
  roomId: string,
): Promise<RoomView> {
  const now = deps.clock.now();
  const room = await deps.roomRepo.get(roomId);
  if (!room) throw new Error("방을 찾을 수 없습니다.");

  const due =
    room.status === "voting" &&
    room.deadlineAt !== null &&
    now >= room.deadlineAt;

  if (!due) return toRoomView(room, now);

  const closed = await deps.roomRepo.update(roomId, (r) => autoCloseIfDue(r, now));
  return toRoomView(closed, now);
}
