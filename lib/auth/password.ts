import bcrypt from "bcryptjs";

const ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

let dummyHash: Promise<string> | null = null;
/** A real bcrypt hash of a random string, used to keep login timing constant for unknown e-mails. */
export function getDummyHash(): Promise<string> {
  return (dummyHash ??= bcrypt.hash(crypto.randomUUID(), ROUNDS));
}

export function passwordProblems(pw: string): string | null {
  if (pw.length < 12) return "Password must be at least 12 characters.";
  if (pw.length > 128) return "Password must be at most 128 characters.";
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  if (classes < 3) return "Use at least three of: lowercase, uppercase, numbers, symbols.";
  return null;
}
