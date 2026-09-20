type Entry<T> = { expires: number; value: T };

const store = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();
let lastCallAt = 0;
const MIN_GAP_MS = 1100; // ~1 rps

export async function withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const wait = lastCallAt + MIN_GAP_MS - now;
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }
  lastCallAt = Date.now();
  return fn();
}

export function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expires > Date.now()) {
    return Promise.resolve(hit.value);
  }
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const promise = withRateLimit(fn)
    .then((value) => {
      store.set(key, { expires: Date.now() + ttlMs, value });
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });
  inflight.set(key, promise);
  return promise;
}
