export type ChainId = "sol" | "bsc" | "base" | "eth" | "all";
export type IntervalId = "1m" | "5m" | "1h" | "6h" | "24h";

export interface HotToken {
  address: string;
  name: string;
  symbol: string;
  logo?: string | null;
  chain: string;
  rank?: number;
  price?: number | null;
  price_change_percent?: number | null;
  price_change_percent1m?: number | null;
  price_change_percent5m?: number | null;
  price_change_percent1h?: number | null;
  volume?: number | null;
  liquidity?: number | null;
  market_cap?: number | null;
  holder_count?: number | null;
  visiting_count?: number | null;
  smart_degen_count?: number | null;
  renowned_count?: number | null;
  bundler_rate?: number | null;
  rug_ratio?: number | null;
  sniper_count?: number | null;
  swaps?: number | null;
  buys?: number | null;
  sells?: number | null;
  top_10_holder_rate?: number | null;
  launchpad?: string | null;
  launchpad_platform?: string | null;
  twitter_username?: string | null;
  website?: string | null;
  telegram?: string | null;
  hot_level?: number | null;
  is_honeypot?: number | null;
  creator?: string | null;
  open_timestamp?: number | null;
  [key: string]: unknown;
}

export interface HotSearchesGroup {
  interval: string;
  chain: string;
  version?: string;
  tokens: HotToken[];
}

export const CHAINS: { id: ChainId; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "sol", label: "SOL" },
  { id: "bsc", label: "BSC" },
  { id: "base", label: "Base" },
  { id: "eth", label: "ETH" },
];

export const INTERVALS: { id: IntervalId; label: string }[] = [
  { id: "1m", label: "1น" },
  { id: "5m", label: "5น" },
  { id: "1h", label: "1ชม" },
  { id: "6h", label: "6ชม" },
  { id: "24h", label: "24ชม" },
];

export const DEFAULT_CHAIN: ChainId = "all";
export const DEFAULT_INTERVAL: IntervalId = "1h";
export const DEFAULT_LIMIT = 50;
