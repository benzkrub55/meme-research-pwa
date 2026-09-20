"use client";

import { CHAINS, type ChainId } from "@/lib/types";

export function ChainFilter({
  value,
  onChange,
}: {
  value: ChainId;
  onChange: (c: ChainId) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="เลือกเชน">
      {CHAINS.map((c) => {
        const active = c.id === value;
        return (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(c.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition ${
              active
                ? "bg-violet-500 text-white shadow-[0_0_16px_rgba(139,92,246,0.45)]"
                : "bg-zinc-800/80 text-zinc-300 ring-1 ring-zinc-700/80 hover:bg-zinc-700"
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
