/**
 * JWT helpers built on `jose` — safe to import from the proxy (edge or node)
 * and from server code. Never import from client components.
 */
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "mt_session";

export interface SessionPayload {
  sub: string; // user id
  tv: number; // token version
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters long");
  }
  return new TextEncoder().encode(secret);
}

export function sessionMaxAgeSeconds(): number {
  const hours = Number(process.env.AUTH_SESSION_HOURS ?? 12);
  return Math.max(1, Math.min(hours, 24 * 30)) * 60 * 60;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ tv: payload.tv })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setIssuer("rateusz-portfolio")
    .setAudience("rateusz-admin")
    .setExpirationTime(`${sessionMaxAgeSeconds()}s`)
    .sign(getSecret());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: "rateusz-portfolio",
      audience: "rateusz-admin",
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string" || typeof payload.tv !== "number") return null;
    return { sub: payload.sub, tv: payload.tv };
  } catch {
    return null;
  }
}
