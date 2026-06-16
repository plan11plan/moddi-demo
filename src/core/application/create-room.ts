import type { AppDeps } from "./deps";
import { createRoom as buildRoom } from "@/core/domain/room";
import { newRoomId, newHostToken } from "@/core/domain/ids";

export interface CreateRoomCommand {
  title: string;
  location: string;
  headcount: number;
  budget: string;
  timerMinutes: number;
}

/** 방 생성 — 조건으로 mock 후보 5개 생성 후 저장. waiting 상태. */
export async function createRoom(
  deps: AppDeps,
  cmd: CreateRoomCommand,
): Promise<{ roomId: string; hostToken: string }> {
  const conditions = {
    location: cmd.location,
    headcount: cmd.headcount,
    budget: cmd.budget,
  };
  const candidates = await deps.candidateProvider.generate(conditions);
  const id = newRoomId();
  const hostToken = newHostToken();
  const room = buildRoom({
    id,
    hostToken,
    title: cmd.title,
    conditions,
    timerMinutes: cmd.timerMinutes,
    candidates,
    now: deps.clock.now(),
  });
  await deps.roomRepo.create(room);
  return { roomId: id, hostToken };
}
