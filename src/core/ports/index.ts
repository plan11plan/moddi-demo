import type { Room } from "../domain/types";
import type { Conditions, Candidate } from "../domain/types";

/** 방 저장소. RMW(update)로 동시성 단순 처리. 어댑터: Redis / InMemory. */
export interface RoomRepository {
  create(room: Room): Promise<void>;
  get(id: string): Promise<Room | null>;
  /** id의 방을 읽어 mutate를 적용하고 저장한 뒤 새 방을 반환. 없으면 throw. */
  update(id: string, mutate: (room: Room) => Room): Promise<Room>;
}

/** 조건 기반 후보 생성. 어댑터: mock(데모) / (미래) LLM. */
export interface CandidateProvider {
  generate(conditions: Conditions): Promise<Candidate[]>;
}

/** 시간 주입 — deadline 계산·테스트 결정성. */
export interface Clock {
  now(): number;
}
