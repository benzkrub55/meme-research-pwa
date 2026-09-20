export function formatPrice(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  if (abs === 0) return "$0";
  if (abs >= 1) return `$${value.toLocaleString("en-US", { maximumFractionDigits: 4 })}`;
  if (abs >= 0.01) return `$${value.toFixed(4)}`;
  if (abs >= 0.0001) return `$${value.toFixed(6)}`;
  return `$${value.toExponential(2)}`;
}

export function formatCompact(value?: number | null, prefix = "$"): string {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}${prefix}${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}${prefix}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${prefix}${(abs / 1_000).toFixed(1)}K`;
  if (abs >= 1) return `${sign}${prefix}${abs.toFixed(0)}`;
  return `${sign}${prefix}${abs.toFixed(2)}`;
}

export function formatPercent(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatCount(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

export function formatRatio(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

export function shortAddress(address: string, size = 4): string {
  if (!address || address.length < size * 2 + 2) return address || "—";
  return `${address.slice(0, size)}…${address.slice(-size)}`;
}

export function gmgnTokenUrl(chain: string, address: string): string {
  return `https://gmgn.ai/${chain}/token/${address}`;
}

/** FOMO app deep link: https://fomo.family/tokens/{slug}/{address} */
export function fomoTokenUrl(chain: string, address: string): string | null {
  const slug: Record<string, string> = {
    sol: "solana",
    solana: "solana",
    bsc: "bnb",
    bnb: "bnb",
    base: "base",
    eth: "ethereum",
    ethereum: "ethereum",
    monad: "monad",
    robinhood: "robinhood",
    arc: "arc",
  };
  const path = slug[chain.toLowerCase()];
  if (!path || !address) return null;
  return `https://fomo.family/tokens/${path}/${address}`;
}

/** X/Twitter search for token CA — Latest tab for scrolling lore */
export function xCaSearchUrl(address: string): string {
  const q = encodeURIComponent(address);
  return `https://x.com/search?q=${q}&src=typed_query&f=live`;
}

export function percentTone(value?: number | null): string {
  if (value == null || Number.isNaN(value) || value === 0) return "text-zinc-400";
  return value > 0 ? "text-emerald-400" : "text-rose-400";
}
