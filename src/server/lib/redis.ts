import "server-only";
import Redis from "ioredis";

/**
 * Redis (Upstash in prod) for slug-availability cache, view counters, OTP
 * throttling and rate limits. When REDIS_URL is unset (local dev without a
 * Redis), we fall back to an in-memory shim so the app still boots — the shim
 * is per-process and NOT for production use.
 */
type RedisLike = Pick<
  Redis,
  "get" | "set" | "del" | "incr" | "expire" | "ttl"
>;

function createMemoryRedis(): RedisLike {
  const store = new Map<string, { v: string; exp?: number }>();
  const now = () => Date.now();
  const live = (k: string) => {
    const e = store.get(k);
    if (!e) return undefined;
    if (e.exp && e.exp < now()) {
      store.delete(k);
      return undefined;
    }
    return e;
  };
  const shim = {
    async get(key: string) {
      return live(key)?.v ?? null;
    },
    async set(key: string, value: string | number, ...args: unknown[]) {
      let exp: number | undefined;
      const ex = args.findIndex((a) => a === "EX");
      if (ex >= 0 && typeof args[ex + 1] === "number") {
        exp = now() + (args[ex + 1] as number) * 1000;
      }
      store.set(key, { v: String(value), exp });
      return "OK";
    },
    async del(key: string) {
      return store.delete(key) ? 1 : 0;
    },
    async incr(key: string) {
      const cur = Number(live(key)?.v ?? 0) + 1;
      const prev = store.get(key);
      store.set(key, { v: String(cur), exp: prev?.exp });
      return cur;
    },
    async expire(key: string, seconds: number) {
      const e = store.get(key);
      if (!e) return 0;
      e.exp = now() + seconds * 1000;
      return 1;
    },
    async ttl(key: string) {
      const e = live(key);
      if (!e?.exp) return -1;
      return Math.ceil((e.exp - now()) / 1000);
    },
  };
  return shim as unknown as RedisLike;
}

const globalForRedis = globalThis as unknown as { redis?: RedisLike };

function createRedis(url: string): RedisLike {
  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
  // Don't let a bad/unreachable URL crash the process with unhandled errors.
  client.on("error", (err) => {
    console.error("[redis] connection error:", err.message);
  });
  return client;
}

export const usingMemoryRedis = !process.env.REDIS_URL;

export const redis: RedisLike =
  globalForRedis.redis ??
  (process.env.REDIS_URL ? createRedis(process.env.REDIS_URL) : createMemoryRedis());

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
