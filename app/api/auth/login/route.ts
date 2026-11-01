import { connectDB } from "@/lib/db/connect";
import { User } from "@/models";
import { loginSchema } from "@/lib/validation";
import { fail, handleError, ok, readJson } from "@/lib/api";
import { getDummyHash, verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { rateLimit, resetRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request";

export async function POST(req: Request) {
  try {
    const { email, password } = loginSchema.parse(await readJson(req));
    const ip = getClientIp(req);

    // Two limits: per IP (stops spraying) and per account (stops targeted guessing).
    const [byIp, byAccount] = await Promise.all([
      rateLimit(`login-ip:${ip}`, 20, 15 * 60),
      rateLimit(`login-acct:${email}`, 6, 15 * 60),
    ]);
    if (!byIp.ok || !byAccount.ok) {
      const wait = Math.max(byIp.retryAfterSeconds, byAccount.retryAfterSeconds);
      return fail(`Too many sign-in attempts. Try again in ${Math.ceil(wait / 60)} minute(s).`, 429, {
        retryAfter: wait,
      });
    }

    await connectDB();
    const user = await User.findOne({ email }).select("+passwordHash");
    // Always run bcrypt so response time doesn't reveal whether the e-mail exists.
    const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
    if (!user || !valid) return fail("Incorrect e-mail or password.", 401);

    user.lastLoginAt = new Date();
    await user.save();
    await resetRateLimit(`login-acct:${email}`);
    await setSessionCookie(String(user._id), user.tokenVersion ?? 0);
    return ok({ name: user.name });
  } catch (err) {
    return handleError(err);
  }
}
