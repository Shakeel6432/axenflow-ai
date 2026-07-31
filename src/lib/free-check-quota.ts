/** Browser-side daily free-check quota (pairs with server IP rateLimit). */

export function todayUtcKey() {
  return new Date().toISOString().slice(0, 10);
}

export function readDailyUsage(storageKey: string): { day: string; count: number } {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { day: "", count: 0 };
    return JSON.parse(raw) as { day: string; count: number };
  } catch {
    return { day: "", count: 0 };
  }
}

export function peekDailyRemaining(storageKey: string, dailyLimit: number): number {
  const day = todayUtcKey();
  const cur = readDailyUsage(storageKey);
  const count = cur.day === day ? cur.count : 0;
  return Math.max(0, dailyLimit - count);
}

export function consumeDailyCheck(
  storageKey: string,
  dailyLimit: number
): { ok: boolean; remaining: number } {
  const day = todayUtcKey();
  const cur = readDailyUsage(storageKey);
  const count = cur.day === day ? cur.count : 0;
  if (count >= dailyLimit) return { ok: false, remaining: 0 };
  const next = count + 1;
  localStorage.setItem(storageKey, JSON.stringify({ day, count: next }));
  return { ok: true, remaining: dailyLimit - next };
}
