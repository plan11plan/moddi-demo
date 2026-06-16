import { NextResponse } from "next/server";
import { container } from "@/lib/container";
import { joinRoom } from "@/core/application/join-room";
import { fail, readJson, type RouteCtx } from "../../../_lib";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: RouteCtx) {
  try {
    const { id } = await ctx.params;
    const b = await readJson(req);
    const result = await joinRoom(container, id, String(b.nickname ?? ""));
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
