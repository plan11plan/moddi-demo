import { NextResponse } from "next/server";
import { container } from "@/lib/container";
import { closeRoom } from "@/core/application/close-room";
import { fail, readJson, type RouteCtx } from "../../../_lib";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: RouteCtx) {
  try {
    const { id } = await ctx.params;
    const b = await readJson(req);
    await closeRoom(container, id, String(b.hostToken ?? ""));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
