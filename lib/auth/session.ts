import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models";
import { SESSION_COOKIE, sessionMaxAgeSeconds, signSession, verifySession } from "./jwt";
import type { SessionUser } from "@/types";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export async function setSessionCookie(userId: string, tokenVersion: number) {
  const token = await signSession({ sub: userId, tv: tokenVersion });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionMaxAgeSeconds(),
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Full session check: verifies the JWT AND that the user still exists with a
 * matching token version (so password changes revoke old sessions).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const payload = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  await connectDB();
  const user = await User.findById(payload.sub).select("name email tokenVersion").lean();
  if (!user || (user.tokenVersion ?? 0) !== payload.tv) return null;
  return { id: String(user._id), name: user.name, email: user.email };
}

/** For route handlers: throws UnauthorizedError (mapped to 401). */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

/** For admin server components/layouts: redirects to the login page. */
export async function requireAdminPage(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}
