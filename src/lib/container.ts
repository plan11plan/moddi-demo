import type { RoomRepository, CandidateProvider, Clock } from "@/core/ports";
import { InMemoryRoomRepository } from "@/adapters/persistence/in-memory-room-repository";
import { RedisRoomRepository } from "@/adapters/persistence/redis-room-repository";
import { MockCandidateProvider } from "@/adapters/candidate/mock-candidate-provider";
import { SystemClock } from "@/adapters/clock/system-clock";
import { getRoomStore } from "./env";
import { getRedis } from "./redis";

export interface Container {
  roomRepo: RoomRepository;
  candidateProvider: CandidateProvider;
  clock: Clock;
}

function build(): Container {
  const roomRepo: RoomRepository =
    getRoomStore() === "memory"
      ? new InMemoryRoomRepository()
      : new RedisRoomRepository(getRedis());
  return {
    roomRepo,
    candidateProvider: new MockCandidateProvider(),
    clock: new SystemClock(),
  };
}

// 서버리스 인스턴스/HMR 단위 싱글톤. (InMemory 사용 시 dev 핫리로드에도 상태 유지)
const g = globalThis as unknown as { __moddi?: Container };
export const container: Container = g.__moddi ?? (g.__moddi = build());
