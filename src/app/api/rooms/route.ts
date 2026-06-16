import { NextResponse } from "next/server";
import { container } from "@/lib/container";
import { createRoom } from "@/core/application/create-room";
import { fail, readJson } from "../_lib";

export const dynamic = "force-dynamic";

const ALLOWED_TIMERS = [1, 3, 5];

export async function POST(req: Request) {
  try {
    const b = await readJson(req);
    const timerMinutes = Number(b.timerMinutes);
    const result = await createRoom(container, {
      title: String(b.title ?? "점심 모임"),
      location: String(b.location ?? "강남역"),
      headcount: Number(b.headcount) || 4,
      budget: String(b.budget ?? "1만원대"),
      timerMinutes: ALLOWED_TIMERS.includes(timerMinutes) ? timerMinutes : 3,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
