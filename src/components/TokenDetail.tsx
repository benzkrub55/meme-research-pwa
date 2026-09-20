"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { HotToken } from "@/lib/types";
import { loadNote, saveNote } from "@/lib/notes";
import {
  formatCompact,
  formatCount,
  formatPercent,
  formatPrice,
  formatRatio,
  fomoTokenUrl,
  gmgnTokenUrl,
  percentTone,
  shortAddress,
} from "@/lib/format";

function Stat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="rounded-xl bg-zinc-900/80 p-3 ring-1 ring-zinc-800">
      <div className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={`mt-1 text-sm font-semibold tabular-nums text-zinc-100 ${className}`}>
        {value}
      </div>
    </div>
  );
}

export function TokenDetail({
  chain,
  address,
}: {
  chain: string;
  address: string;
}) {
  const [token, setToken] = useState<HotToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setNote(loadNote(address));
  }, [address]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/token/${encodeURIComponent(chain)}/${encodeURIComponent(address)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "โหลดไม่สำเร็จ");
        if (!cancelled) setToken(data.token);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chain, address]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const onNoteChange = (value: string) => {
    setNote(value);
    saveNote(address, value);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 800);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="h-8 w-24 animate-pulse rounded bg-zinc-800" />
        <div className="h-20 animate-pulse rounded-2xl bg-zinc-900" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-900" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="mx-auto max-w-lg p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Link href="/" className="text-sm text-violet-400">
          ← กลับ
        </Link>
        <p className="mt-4 text-rose-300">{error || "ไม่พบโทเคน"}</p>
      </div>
    );
  }

  const change = token.price_change_percent;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg pb-10">
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-[#0b0b12]/90 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-zinc-900 px-2.5 py-1.5 text-sm text-zinc-300 ring-1 ring-zinc-700"
          >
            ←
          </Link>
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-zinc-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={token.logo || "/icons/icon-192.png"}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/icons/icon-192.png";
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-zinc-50">
              {token.symbol}{" "}
              <span className="text-sm font-normal text-zinc-500">{token.name}</span>
            </h1>
            <p className="text-[11px] uppercase text-zinc-500">{token.chain}</p>
          </div>
        </div>
      </header>

      <div className="space-y-4 px-3 py-4">
        <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 via-zinc-900 to-cyan-600/10 p-4 ring-1 ring-violet-500/20">
          <div className="text-2xl font-bold tabular-nums text-zinc-50">
            {formatPrice(token.price)}
          </div>
          <div className={`mt-1 text-sm font-semibold tabular-nums ${percentTone(change)}`}>
            {formatPercent(change)} (ช่วงหลัก)
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-400">
            <span>1ม {formatPercent(token.price_change_percent1m)}</span>
            <span>5ม {formatPercent(token.price_change_percent5m)}</span>
            <span>1ชม {formatPercent(token.price_change_percent1h)}</span>
          </div>
        </div>

        <div className="rounded-xl bg-zinc-900/80 p-3 ring-1 ring-zinc-800">
          <div className="text-[10px] uppercase tracking-wide text-zinc-500">
            ที่อยู่สัญญา
          </div>
          <div className="mt-1 break-all font-mono text-xs text-zinc-200">
            {address}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => void copyAddress()}
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              {copied ? "คัดลอกแล้ว ✓" : "คัดลอกที่อยู่"}
            </button>
            <a
              href={gmgnTokenUrl(token.chain || chain, address)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-cyan-300 ring-1 ring-zinc-700"
            >
              เปิดบน gmgn.ai ↗
            </a>
            {fomoTokenUrl(token.chain || chain, address) && (
              <a
                href={fomoTokenUrl(token.chain || chain, address)!}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-fuchsia-600/90 px-3 py-1.5 text-xs font-semibold text-white"
              >
                เปิดใน FOMO ↗
              </a>
            )}
          </div>
          <p className="mt-1 text-[10px] text-zinc-600">{shortAddress(address, 6)}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat label="การเข้าชม" value={formatCount(token.visiting_count)} />
          <Stat label="อันดับ" value={token.rank != null ? `#${token.rank}` : "—"} />
          <Stat label="สภาพคล่อง" value={formatCompact(token.liquidity)} />
          <Stat label="มาร์เก็ตแคป" value={formatCompact(token.market_cap)} />
          <Stat label="วอลุ่ม" value={formatCompact(token.volume)} />
          <Stat label="ผู้ถือ" value={formatCount(token.holder_count)} />
          <Stat label="Smart Degen" value={formatCount(token.smart_degen_count)} />
          <Stat label="Renowned" value={formatCount(token.renowned_count)} />
          <Stat label="Bundler rate" value={formatRatio(token.bundler_rate)} />
          <Stat
            label="Rug ratio"
            value={formatRatio(token.rug_ratio)}
            className={
              (token.rug_ratio ?? 0) > 0.5 ? "text-rose-400" : "text-zinc-100"
            }
          />
          <Stat label="Snipers" value={formatCount(token.sniper_count)} />
          <Stat label="สลับ (swaps)" value={formatCount(token.swaps)} />
        </div>

        {(token.launchpad_platform || token.twitter_username || token.website) && (
          <div className="rounded-xl bg-zinc-900/80 p-3 text-sm ring-1 ring-zinc-800">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">
              ข้อมูลเพิ่มเติม
            </div>
            <ul className="mt-2 space-y-1 text-xs text-zinc-300">
              {token.launchpad_platform && (
                <li>Launchpad: {token.launchpad_platform}</li>
              )}
              {token.twitter_username && (
                <li className="truncate">
                  Twitter:{" "}
                  <a
                    className="text-cyan-400"
                    href={
                      token.twitter_username.startsWith("http")
                        ? token.twitter_username
                        : `https://x.com/${token.twitter_username}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {token.twitter_username}
                  </a>
                </li>
              )}
              {token.website && (
                <li className="truncate">
                  เว็บ:{" "}
                  <a
                    className="text-cyan-400"
                    href={token.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {token.website}
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="rounded-xl bg-zinc-900/80 p-3 ring-1 ring-zinc-800">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">
              โน้ตวิจัย (เครื่องนี้)
            </div>
            {savedFlash && (
              <span className="text-[10px] text-emerald-400">บันทึกแล้ว</span>
            )}
          </div>
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            rows={5}
            placeholder="จดเหตุผลเข้า/ออก, สัญญาณ, ความเสี่ยง…"
            className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-violet-500"
          />
          <p className="mt-1 text-[10px] text-zinc-600">
            เก็บใน localStorage ตามที่อยู่โทเคน
          </p>
        </div>
      </div>
    </div>
  );
}
