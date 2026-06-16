import type { RoomView } from "@/core/application/views";
import type { VoteValue } from "@/core/domain/types";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const d = data as { error?: string; code?: string };
    throw new ApiError(d.error ?? "오류가 발생했습니다.", d.code ?? "unknown", res.status);
  }
  return data as T;
}

const post = <T>(path: string, body?: unknown): Promise<T> =>
  fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
  }).then((r) => parse<T>(r));

export interface CreateRoomBody {
  title: string;
  location: string;
  headcount: number;
  budget: string;
  timerMinutes: number;
}

export const api = {
  createRoom: (b: CreateRoomBody) =>
    post<{ roomId: string; hostToken: string }>("/api/rooms", b),
  getRoom: (id: string) =>
    fetch(`/api/rooms/${id}`, { cache: "no-store" }).then((r) => parse<RoomView>(r)),
  join: (id: string, nickname: string) =>
    post<{ participantId: string }>(`/api/rooms/${id}/join`, { nickname }),
  start: (id: string, hostToken: string) =>
    post<{ ok: true }>(`/api/rooms/${id}/start`, { hostToken }),
  vote: (id: string, body: { participantId: string; candidateId: string; value: VoteValue }) =>
    post<{ ok: true }>(`/api/rooms/${id}/votes`, body),
  addCandidate: (id: string, body: { name: string; description?: string }) =>
    post<{ candidateId: string }>(`/api/rooms/${id}/candidates`, body),
  close: (id: string, hostToken: string) =>
    post<{ ok: true }>(`/api/rooms/${id}/close`, { hostToken }),
};
