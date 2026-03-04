type CacheEntry<T> = {
  ts: number;
  ttl: number;
  data: T;
};

export function getCache<T = any>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (!entry || typeof entry.ts !== 'number' || typeof entry.ttl !== 'number') return null;
    if (Date.now() - entry.ts > entry.ttl * 1000) return null;
    return entry.data;
  } catch {
    return null;
  }
}

export function setCache<T = any>(key: string, data: T, ttlSeconds: number): void {
  try {
    const entry: CacheEntry<T> = { ts: Date.now(), ttl: ttlSeconds, data };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
  }
}
