"use client";

import Link from "next/link";
import type { HotToken } from "@/lib/types";
import {
  formatCompact,
  formatCount,
  formatPercent,
  formatPrice,
  percentTone,
} from "@/lib/format";

export function TokenRow({ token, rank }: { token: HotToken; rank: number }) {
  const change = token.price_change_percent;
  const href = `/token/${encodeURIComponent(token.chain)}/${encodeURIComponent(token.address)}`;

  return (
    <Link
      href={href}
      className="block border-b border-zinc-800/80 px-3 py-3 active:bg-zinc-800/60 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-6 shrink-0 text-center text-xs font-bold text-zinc-500 tabular-nums">
          {rank}
        </div>
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-zinc-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={token.logo || "/icons/icon-192.png"}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/icons/icon-192.png";
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="truncate text-sm font-semibold text-zinc-50">
              {token.symbol || "—"}
            </span>
            <span className="truncate text-[11px] text-zinc-500">{token.name}</span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-500">
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 uppercase text-zinc-400">
              {token.chain}
            </span>
            <span>👁 {formatCount(token.visiting_count)}</span>
            {token.liquidity != null && (
              <span>Liq {formatCompact(token.liquidity)}</span>
            )}
            {token.market_cap != null && (
              <span>MC {formatCompact(token.market_cap)}</span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-medium tabular-nums text-zinc-100">
            {formatPrice(token.price)}
          </div>
          <div className={`text-xs font-semibold tabular-nums ${percentTone(change)}`}>
            {formatPercent(change)}
          </div>
        </div>
      </div>
    </Link>
  );
}
