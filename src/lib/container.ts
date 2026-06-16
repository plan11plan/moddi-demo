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

// 지연 초기화 — 모듈 import 시점이 아니라 첫 요청 때 어댑터를 만든다.
// (빌드 타임에 Redis env가 없어도 `next build`가 깨지지 않게. env는 런타임에만 필요.)
// 서버리스 인스턴스/HMR 단위 싱글톤으로 캐시.
const g = globalThis as unknown as { __moddi?: Container };

export function getContainer(): Container {
  if (!g.__moddi) g.__moddi = build();
  return g.__moddi;
}
