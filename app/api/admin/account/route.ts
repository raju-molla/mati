import { connectDB } from "@/lib/db/connect";
import { requireAdmin, setSessionCookie } from "@/lib/auth/session";
import { fail, handleError, ok, readJson } from "@/lib/api";
import { accountSchema } from "@/lib/validation";
import { hashPassword, passwordProblems, verifyPassword } from "@/lib/auth/password";
import { User } from "@/models";

export async function PATCH(req: Request) {
  try {
    const session = await requireAdmin();
    const data = accountSchema.parse(await readJson(req));
    await connectDB();
    const user = await User.findById(session.id).select("+passwordHash");
    if (!user) return fail("Account not found", 404);

    if (data.name) user.name = data.name;
    if (data.email && data.email !== user.email) {
      if (!data.currentPassword || !(await verifyPassword(data.currentPassword, user.passwordHash))) {
        return fail("Enter your current password to change your e-mail.", 400);
      }
      user.email = data.email;
    }
    let passwordChanged = false;
    if (data.newPassword) {
      if (!(await verifyPassword(data.currentPassword ?? "", user.passwordHash))) {
        return fail("Your current password is incorrect.", 400);
      }
      const problem = passwordProblems(data.newPassword);
      if (problem) return fail(problem, 422);
      user.passwordHash = await hashPassword(data.newPassword);
      // Invalidate every other session.
      user.tokenVersion = (user.tokenVersion ?? 0) + 1;
      passwordChanged = true;
    }
    await user.save();
    if (passwordChanged) await setSessionCookie(String(user._id), user.tokenVersion);
    return ok({ name: user.name, email: user.email, passwordChanged });
  } catch (err) {
    return handleError(err);
  }
}
