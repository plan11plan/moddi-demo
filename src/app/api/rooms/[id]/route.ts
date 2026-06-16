import { NextResponse } from "next/server";
import { getContainer } from "@/lib/container";
import { getRoomState } from "@/core/application/get-room-state";
import { fail, type RouteCtx } from "../../_lib";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: RouteCtx) {
  try {
    const { id } = await ctx.params;
    const view = await getRoomState(getContainer(), id);
    return NextResponse.json(view);
  } catch (e) {
    return fail(e);
  }
}
