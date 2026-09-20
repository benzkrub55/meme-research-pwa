"use client";

import { INTERVALS, type IntervalId } from "@/lib/types";

export function IntervalFilter({
  value,
  onChange,
}: {
  value: IntervalId;
  onChange: (i: IntervalId) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="ช่วงเวลา">
      {INTERVALS.map((i) => {
        const active = i.id === value;
        return (
          <button
            key={i.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(i.id)}
            className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
              active
                ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/50"
                : "bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800 hover:text-zinc-200"
            }`}
          >
            {i.label}
          </button>
        );
      })}
    </div>
  );
}
