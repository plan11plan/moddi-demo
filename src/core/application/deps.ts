import type { RoomRepository, CandidateProvider, Clock } from "@/core/ports";

/** 유스케이스가 받는 의존성 묶음. 테스트는 가짜 어댑터를 주입. */
export interface AppDeps {
  roomRepo: RoomRepository;
  candidateProvider: CandidateProvider;
  clock: Clock;
}
