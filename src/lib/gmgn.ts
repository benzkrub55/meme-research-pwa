import "server-only";
import { randomUUID } from "crypto";
import type { ChainId, HotSearchesGroup, HotToken, IntervalId } from "./types";
import { cached } from "./cache";

const HOST = "https://openapi.gmgn.ai";
const DEMO_KEY = "gmgn_solbscbaseethmonadtron";
const ALL_CHAINS = ["sol", "bsc", "base", "eth"] as const;

function getApiKey(): string {
  return process.env.GMGN_API_KEY?.trim() || DEMO_KEY;
}

interface HotSearchesParam {
  label: string;
  interval: string;
  chain: string;
  limit?: number;
}

/**
 * Thin exist-auth client matching gmgn-cli OpenApiClient.getHotSearches.
 * POST /v1/market/hot_searches with X-APIKEY + timestamp + client_id.
 */
async function authExistPost(path: string, body: unknown): Promise<unknown> {
  const timestamp = Math.floor(Date.now() / 1000);
  const client_id = randomUUID();
  const url = new URL(`${HOST}${path}`);
  url.searchParams.set("timestamp", String(timestamp));
  url.searchParams.set("client_id", client_id);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "X-APIKEY": getApiKey(),
      "Content-Type": "application/json",
      "User-Agent": "meme-research-pwa/0.1",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as {
    code?: number;
    message?: string;
    error?: string;
    data?: unknown;
    reason?: string;
  } | null;

  if (!res.ok) {
    const msg =
      json?.message || json?.error || json?.reason || `GMGN HTTP ${res.status}`;
    throw new Error(msg);
  }

  // gmgn-cli parseResponse unwraps { code, data } when present
  if (json && typeof json === "object" && "data" in json && json.data !== undefined) {
    if (json.code != null && json.code !== 0) {
      throw new Error(json.message || json.error || `GMGN code ${json.code}`);
    }
    return json.data;
  }

  return json;
}

function buildParams(
  chain: ChainId,
  interval: IntervalId,
  limit: number
): HotSearchesParam[] {
  if (chain === "all") {
    return ALL_CHAINS.map((c) => ({
      label: "hot-search",
      chain: c,
      interval,
      limit,
    }));
  }
  return [{ label: "hot-search", chain, interval, limit }];
}

function normalizeToken(raw: Record<string, unknown>, fallbackChain: string): HotToken {
  return {
    ...(raw as HotToken),
    address: String(raw.address ?? ""),
    name: String(raw.name ?? ""),
    symbol: String(raw.symbol ?? ""),
    chain: String(raw.chain ?? fallbackChain),
    logo: (raw.logo as string) ?? null,
  };
}

export async function fetchHotSearches(options: {
  chain: ChainId;
  interval: IntervalId;
  limit?: number;
}): Promise<{ tokens: HotToken[]; groups: HotSearchesGroup[]; fetchedAt: string }> {
  const limit = options.limit ?? 50;
  const cacheKey = `hot:${options.chain}:${options.interval}:${limit}`;
  return cached(cacheKey, 20_000, () => fetchHotSearchesUncached(options.chain, options.interval, limit));
}

async function fetchHotSearchesUncached(
  chain: ChainId,
  interval: IntervalId,
  limit: number
): Promise<{ tokens: HotToken[]; groups: HotSearchesGroup[]; fetchedAt: string }> {
  const params = buildParams(chain, interval, limit);
  const data = (await authExistPost("/v1/market/hot_searches", { params })) as
    | HotSearchesGroup[]
    | HotSearchesGroup
    | null;

  const groups: HotSearchesGroup[] = Array.isArray(data)
    ? data
    : data
      ? [data]
      : [];

  const seen = new Set<string>();
  const tokens: HotToken[] = [];

  for (const group of groups) {
    const list = Array.isArray(group.tokens) ? group.tokens : [];
    for (const t of list) {
      const token = normalizeToken(t as unknown as Record<string, unknown>, group.chain);
      if (!token.address) continue;
      const key = `${token.chain}:${token.address.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      tokens.push(token);
    }
  }

  // Prefer API rank; fall back to visiting_count desc
  tokens.sort((a, b) => {
    const ra = a.rank ?? Number.POSITIVE_INFINITY;
    const rb = b.rank ?? Number.POSITIVE_INFINITY;
    if (ra !== rb) return ra - rb;
    return (b.visiting_count ?? 0) - (a.visiting_count ?? 0);
  });

  const sliced = tokens.slice(0, limit);

  return {
    tokens: sliced,
    groups,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchTokenFromHotCache(options: {
  chain: string;
  address: string;
  interval?: IntervalId;
}): Promise<HotToken | null> {
  const chain = (["sol", "bsc", "base", "eth"].includes(options.chain)
    ? options.chain
    : "sol") as ChainId;
  const { tokens } = await fetchHotSearches({
    chain,
    interval: options.interval ?? "1h",
    limit: 50,
  });
  const addr = options.address.toLowerCase();
  return (
    tokens.find(
      (t) => t.address.toLowerCase() === addr && t.chain === options.chain
    ) ??
    tokens.find((t) => t.address.toLowerCase() === addr) ??
    null
  );
}

async function authExistGet(
  path: string,
  queryExtra: Record<string, string>
): Promise<unknown> {
  const timestamp = Math.floor(Date.now() / 1000);
  const client_id = randomUUID();
  const url = new URL(`${HOST}${path}`);
  for (const [k, v] of Object.entries(queryExtra)) {
    url.searchParams.set(k, v);
  }
  url.searchParams.set("timestamp", String(timestamp));
  url.searchParams.set("client_id", client_id);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "X-APIKEY": getApiKey(),
      "Content-Type": "application/json",
      "User-Agent": "meme-research-pwa/0.1",
    },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as {
    code?: number;
    message?: string;
    error?: string;
    data?: unknown;
  } | null;

  if (!res.ok) {
    throw new Error(json?.message || json?.error || `GMGN HTTP ${res.status}`);
  }
  if (json && typeof json === "object" && "data" in json && json.data !== undefined) {
    if (json.code != null && json.code !== 0) {
      throw new Error(json.message || json.error || `GMGN code ${json.code}`);
    }
    return json.data;
  }
  return json;
}

export async function fetchTokenInfo(
  chain: string,
  address: string
): Promise<HotToken | null> {
  const cacheKey = `info:${chain}:${address.toLowerCase()}`;
  return cached(cacheKey, 30_000, async () => {
    try {
      const data = (await authExistGet("/v1/token/info", { chain, address })) as
        | Record<string, unknown>
        | null;
      if (!data || typeof data !== "object") return null;
      return normalizeToken(data, chain);
    } catch {
      return null;
    }
  });
}
