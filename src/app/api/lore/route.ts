import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type LoreItem = {
  title: string;
  snippet: string;
  url: string;
  source: string;
  isX: boolean;
};

function decodeDuckLink(href: string): string {
  try {
    const u = new URL(href, "https://duckduckgo.com");
    const uddg = u.searchParams.get("uddg");
    if (uddg) return decodeURIComponent(uddg);
  } catch {
    // ignore
  }
  return href;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function parseJinaDuckMarkdown(md: string): LoreItem[] {
  const items: LoreItem[] = [];
  // Sections look like: ## [Title](url)\n\n...snippet...
  const blocks = md.split(/\n## /).slice(1);
  for (const block of blocks) {
    const m = block.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (!m) continue;
    const title = m[1].replace(/\*\*/g, "").trim();
    const rawUrl = m[2].trim();
    const url = decodeDuckLink(rawUrl);
    if (!url || url.includes("duckduckgo.com/html")) continue;
    const rest = block.slice(m[0].length);
    // take first meaningful paragraph-looking line
    const lines = rest
      .split("\n")
      .map((l) => l.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[[^\]]*\]\([^)]*\)/g, "").trim())
      .filter((l) => l && !l.startsWith("![") && !l.startsWith("[]") && l.length > 20);
    const snippet = (lines[0] || "").replace(/\*\*/g, "").slice(0, 280);
    const host = hostOf(url);
    if (!host) continue;
    const isX = host === "x.com" || host === "twitter.com";
    items.push({ title, snippet, url, source: host, isX });
  }
  // Prefer X posts first, then others; dedupe by url
  const seen = new Set<string>();
  const ranked = [...items.filter((i) => i.isX), ...items.filter((i) => !i.isX)];
  const out: LoreItem[] = [];
  for (const it of ranked) {
    const key = it.url.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
    if (out.length >= 12) break;
  }
  return out;
}

async function fetchLore(address: string, symbol?: string): Promise<LoreItem[]> {
  const q = symbol
    ? `"${address}" OR $${symbol.replace(/^\$/, "")}`
    : `"${address}"`;
  const target = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
  const res = await fetch(`https://r.jina.ai/${target}`, {
    headers: {
      Accept: "text/plain",
      "User-Agent": "meme-research-pwa/0.1",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) {
    throw new Error(`lore fetch failed (${res.status})`);
  }
  const md = await res.text();
  return parseJinaDuckMarkdown(md);
}

function summarize(items: LoreItem[], symbol?: string): string {
  const x = items.filter((i) => i.isX);
  const name = symbol ? `$${symbol.replace(/^\$/, "")}` : "เหรียญนี้";
  if (items.length === 0) {
    return `ยังไม่เจอการพูดถึง CA นี้บนเว็บสาธารณะมากนัก — ลองเปิดค้นหาบน X โดยตรงได้`;
  }
  const bits: string[] = [];
  bits.push(`พบ ${items.length} แหล่งที่พูดถึง CA ของ ${name}`);
  if (x.length) bits.push(`มีอย่างน้อย ${x.length} โพสต์จาก X ในผลค้นหา`);
  const first = (x[0] || items[0]).snippet || (x[0] || items[0]).title;
  if (first) bits.push(`ตัวอย่าง: ${first.slice(0, 160)}`);
  return bits.join(" · ");
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const address = (sp.get("address") || "").trim();
  const symbol = (sp.get("symbol") || "").trim() || undefined;
  if (!address || address.length < 8) {
    return NextResponse.json({ error: "ต้องระบุ address" }, { status: 400 });
  }
  try {
    const items = await fetchLore(address, symbol);
    return NextResponse.json({
      address,
      symbol: symbol || null,
      summary: summarize(items, symbol),
      items,
      xSearchUrl: `https://x.com/search?q=${encodeURIComponent(address)}&src=typed_query&f=live`,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "โหลด lore ไม่สำเร็จ",
        items: [],
        summary: null,
        xSearchUrl: `https://x.com/search?q=${encodeURIComponent(address)}&src=typed_query&f=live`,
      },
      { status: 502 }
    );
  }
}
