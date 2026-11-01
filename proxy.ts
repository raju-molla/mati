/**
 * Next.js 16 "proxy" (formerly middleware).
 *  1. Blocks cross-site state-changing requests to /api/* (CSRF defence in
 *     addition to SameSite=strict cookies).
 *  2. Gates /admin/* pages and /api/admin/* endpoints on a valid session JWT.
 *     Every admin route ALSO re-checks the session against the database
 *     (requireAdmin), so this is a fast first layer, not the only one.
 */
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/jwt";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isCrossSite(req: NextRequest): boolean {
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return true;
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/") && MUTATING.has(req.method) && isCrossSite(req)) {
    return NextResponse.json({ ok: false, error: "Cross-site request blocked" }, { status: 403 });
  }

  const isAdminPage = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const isAdminApi = pathname.startsWith("/api/admin");
  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  if (isAdminApi) {
    return NextResponse.json({ ok: false, error: "Your session has expired. Please sign in again." }, { status: 401 });
  }
  const login = new URL("/admin/login", req.url);
  if (pathname !== "/admin") login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
