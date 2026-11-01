import "server-only";
import { connectDB } from "@/lib/db/connect";
import { RateLimit } from "@/models";

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Fixed-window limiter backed by MongoDB (works across serverless instances).
 * `key` should already include the scope, e.g. `login:<ip>`.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  await connectDB();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowSeconds * 1000);

  // Reset an expired window (TTL cleanup can lag up to ~60s).
  await RateLimit.updateOne({ key, expiresAt: { $lte: now } }, { $set: { count: 0, expiresAt: windowEnd } });

  const increment = () =>
    RateLimit.findOneAndUpdate(
      { key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: windowEnd } },
      { upsert: true, new: true }
    ).lean();

  let doc;
  try {
    doc = await increment();
  } catch (err) {
    // Two concurrent upserts can race on the unique key; the retry hits the existing doc.
    if ((err as { code?: number }).code !== 11000) throw err;
    doc = await increment();
  }

  const count = doc?.count ?? 1;
  const expiresAt = doc?.expiresAt ? new Date(doc.expiresAt) : windowEnd;
  const retryAfterSeconds = Math.max(1, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000));
  return { ok: count <= limit, remaining: Math.max(0, limit - count), retryAfterSeconds };
}

export async function resetRateLimit(key: string) {
  await connectDB();
  await RateLimit.deleteOne({ key });
}
