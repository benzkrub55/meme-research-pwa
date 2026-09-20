import { NextRequest, NextResponse } from "next/server";
import { fetchHotSearches } from "@/lib/gmgn";
import type { ChainId, IntervalId } from "@/lib/types";
import { DEFAULT_CHAIN, DEFAULT_INTERVAL, DEFAULT_LIMIT } from "@/lib/types";

const CHAINS = new Set(["sol", "bsc", "base", "eth", "robinhood", "arc", "all"]);
const INTERVALS = new Set(["1m", "5m", "1h", "6h", "24h"]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const chainRaw = (sp.get("chain") || DEFAULT_CHAIN).toLowerCase();
  const intervalRaw = (sp.get("interval") || DEFAULT_INTERVAL).toLowerCase();
  const limitRaw = Number(sp.get("limit") || DEFAULT_LIMIT);

  if (!CHAINS.has(chainRaw)) {
    return NextResponse.json({ error: "chain ไม่ถูกต้อง" }, { status: 400 });
  }
  if (!INTERVALS.has(intervalRaw)) {
    return NextResponse.json({ error: "interval ไม่ถูกต้อง" }, { status: 400 });
  }

  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : DEFAULT_LIMIT, 1), 100);

  try {
    const result = await fetchHotSearches({
      chain: chainRaw as ChainId,
      interval: intervalRaw as IntervalId,
      limit,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "เรียก GMGN ไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
