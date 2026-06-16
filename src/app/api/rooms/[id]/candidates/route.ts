import { NextResponse } from "next/server";
import { container } from "@/lib/container";
import { addCandidate } from "@/core/application/add-candidate";
import { fail, readJson, type RouteCtx } from "../../../_lib";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: RouteCtx) {
  try {
    const { id } = await ctx.params;
    const b = await readJson(req);
    const result = await addCandidate(container, id, {
      name: String(b.name ?? ""),
      description: b.description ? String(b.description) : undefined,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
