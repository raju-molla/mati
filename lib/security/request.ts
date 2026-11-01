import "server-only";
import { createHash } from "node:crypto";

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** One-way hash of an IP so abuse can be correlated without storing raw addresses. */
export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(`${process.env.AUTH_SECRET ?? ""}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}
