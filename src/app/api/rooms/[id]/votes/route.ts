import { NextResponse } from "next/server";
import { container } from "@/lib/container";
import { castVote } from "@/core/application/cast-vote";
import { fail, readJson, type RouteCtx } from "../../../_lib";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: RouteCtx) {
  try {
    const { id } = await ctx.params;
    const b = await readJson(req);
    const value = b.value === "dislike" ? "dislike" : "like";
    await castVote(container, id, {
      participantId: String(b.participantId ?? ""),
      candidateId: String(b.candidateId ?? ""),
      value,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
