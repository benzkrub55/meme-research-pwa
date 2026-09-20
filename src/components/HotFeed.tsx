"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChainFilter } from "./ChainFilter";
import { IntervalFilter } from "./IntervalFilter";
import { TokenRow } from "./TokenRow";
import { PullToRefresh } from "./PullToRefresh";
import {
  DEFAULT_CHAIN,
  DEFAULT_INTERVAL,
  type ChainId,
  type HotToken,
  type IntervalId,
} from "@/lib/types";

const AUTO_MS = 60_000;

export function HotFeed() {
  const [chain, setChain] = useState<ChainId>(DEFAULT_CHAIN);
  const [interval, setIntervalId] = useState<IntervalId>(DEFAULT_INTERVAL);
  const [tokens, setTokens] = useState<HotToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        chain,
        interval,
        limit: "50",
      });
      const res = await fetch(`/api/hot-searches?${qs}`, {
        signal: ac.signal,
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "โหลดไม่สำเร็จ");
      setTokens(Array.isArray(data.tokens) ? data.tokens : []);
      setFetchedAt(data.fetchedAt || new Date().toISOString());
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }, [chain, interval]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), AUTO_MS);
    return () => {
      window.clearInterval(id);
      abortRef.current?.abort();
    };
  }, [load]);

  const fetchedLabel = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";

  return (
    <div className="mx-auto w-full max-w-lg">
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-[#0b0b12]/90 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
        <div className="mb-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400">
              GMGN · Hot Search
            </p>
            <h1 className="text-lg font-bold text-zinc-50">วิจัยมีมคอยน์</h1>
          </div>
          <div className="text-right text-[10px] text-zinc-500">
            <div>อัปเดต {fetchedLabel}</div>
            <div>รีเฟรชทุก ~60วิ</div>
          </div>
        </div>
        <div className="space-y-2">
          <ChainFilter value={chain} onChange={setChain} />
          <IntervalFilter value={interval} onChange={setIntervalId} />
        </div>
      </header>

      <PullToRefresh onRefresh={load}>
        {error && (
          <div className="m-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
            <button
              type="button"
              className="ml-2 underline"
              onClick={() => void load()}
            >
              ลองใหม่
            </button>
          </div>
        )}

        {loading && tokens.length === 0 && (
          <div className="space-y-2 p-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-zinc-900/80"
              />
            ))}
          </div>
        )}

        {!loading && !error && tokens.length === 0 && (
          <p className="p-6 text-center text-sm text-zinc-500">
            ไม่มีข้อมูลในรอบนี้
          </p>
        )}

        <div className={loading && tokens.length ? "opacity-70" : ""}>
          {tokens.map((t, idx) => (
            <TokenRow key={`${t.chain}-${t.address}`} token={t} rank={t.rank ?? idx + 1} />
          ))}
        </div>
      </PullToRefresh>

      <footer className="px-4 py-8 text-center text-[10px] text-zinc-600">
        ข้อมูลจาก GMGN OpenAPI · ไม่ใช่คำแนะนำการลงทุน
      </footer>
    </div>
  );
}
