import { NextResponse } from "next/server";
import { getContainer } from "@/lib/container";
import { startVoting } from "@/core/application/start-voting";
import { fail, readJson, type RouteCtx } from "../../../_lib";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: RouteCtx) {
  try {
    const { id } = await ctx.params;
    const b = await readJson(req);
    await startVoting(getContainer(), id, String(b.hostToken ?? ""));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
