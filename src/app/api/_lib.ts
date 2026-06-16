import { NextResponse } from "next/server";
import { DomainError } from "@/core/domain/errors";

const STATUS: Record<DomainError["code"], number> = {
  not_found: 404,
  forbidden: 403,
  invalid_state: 409,
  bad_input: 400,
};

/** 도메인/저장소 에러를 HTTP 응답으로 변환. */
export function fail(e: unknown): NextResponse {
  if (e instanceof DomainError) {
    return NextResponse.json(
      { error: e.message, code: e.code },
      { status: STATUS[e.code] },
    );
  }
  const msg = e instanceof Error ? e.message : "오류가 발생했습니다.";
  if (msg.includes("찾을 수 없")) {
    return NextResponse.json({ error: msg, code: "not_found" }, { status: 404 });
  }
  console.error("[api] unexpected error:", e);
  return NextResponse.json({ error: "서버 오류", code: "internal" }, { status: 500 });
}

export type RouteCtx = { params: Promise<{ id: string }> };

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}
