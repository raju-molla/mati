import "server-only";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { UnauthorizedError } from "@/lib/auth/session";
import { DatabaseNotConfiguredError } from "@/lib/db/connect";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

/** Convert a thrown error into a safe JSON response (never leaks internals). */
export function handleError(err: unknown) {
  if (err instanceof HttpError) return fail(err.message, err.status);
  if (err instanceof UnauthorizedError) return fail("Your session has expired. Please sign in again.", 401);
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".") || "_";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    const first = err.issues[0];
    return fail(first ? `${first.path.join(".") || "Input"}: ${first.message}` : "Invalid input", 422, { fieldErrors });
  }
  if (err instanceof DatabaseNotConfiguredError) return fail("The database is not configured.", 503);
  const code = (err as { code?: number }).code;
  if (code === 11000) {
    const key = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue ?? {})[0] ?? "value";
    return fail(`That ${key} is already in use. Please choose another.`, 409);
  }
  if ((err as { name?: string }).name === "CastError") return fail("Not found", 404);
  console.error("[api]", err);
  return fail("Something went wrong. Please try again.", 500);
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export async function readJson(req: Request): Promise<unknown> {
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > 1_000_000) throw new HttpError(413, "Request too large");
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "Invalid request body");
  }
}

/** Deep-convert Mongo documents (ObjectId, Date) into plain JSON-safe values. */
export function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

/**
 * Flatten nested plain objects into Mongo dot-paths so partial updates of
 * nested groups (e.g. `hero.title`) don't wipe sibling fields.
 */
export function toSetPaths(obj: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      Object.assign(out, toSetPaths(v as Record<string, unknown>, path));
    } else {
      out[path] = v;
    }
  }
  return out;
}

/** Refresh every public page after content changes (ISR). */
export function revalidatePublic() {
  try {
    revalidatePath("/", "layout");
  } catch (err) {
    console.error("[revalidate]", err);
  }
}
