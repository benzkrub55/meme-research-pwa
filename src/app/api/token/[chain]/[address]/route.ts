import { NextRequest, NextResponse } from "next/server";
import { fetchTokenFromHotCache, fetchTokenInfo } from "@/lib/gmgn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ chain: string; address: string }> }
) {
  const { chain, address } = await ctx.params;
  if (!chain || !address) {
    return NextResponse.json({ error: "ต้องระบุ chain และ address" }, { status: 400 });
  }

  try {
    // Prefer hot-search cache (often warm) before a fresh token/info call
    let token = await fetchTokenFromHotCache({ chain, address });
    if (!token) {
      token = await fetchTokenInfo(chain, address);
    }
    if (!token) {
      return NextResponse.json({ error: "ไม่พบโทเคน" }, { status: 404 });
    }
    return NextResponse.json({ token });
  } catch (err) {
    const message = err instanceof Error ? err.message : "เรียก GMGN ไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
