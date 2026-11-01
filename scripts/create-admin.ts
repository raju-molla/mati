/**
 * Create (or reset) the admin account.
 *
 *   npm run create-admin            → interactive prompts
 *   npm run create-admin -- --reset → reset the password of an existing admin
 *
 * Non-interactive (e.g. CI): set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD
 * as environment variables for a single run. Never commit them.
 */
import readline from "node:readline";
import { Writable } from "node:stream";
import mongoose from "mongoose";
import { connectDB } from "../lib/db/connect";
import { User } from "../models/User";
import { hashPassword, passwordProblems } from "../lib/auth/password";

const reset = process.argv.includes("--reset");

function ask(question: string, hidden = false): Promise<string> {
  let muted = false;
  const output = new Writable({
    write(chunk, _enc, cb) {
      if (!muted) process.stdout.write(chunk);
      cb();
    },
  });
  const rl = readline.createInterface({ input: process.stdin, output, terminal: true });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
    muted = hidden;
  });
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set. Create .env.local first (see .env.example).");
  await connectDB();

  const name = process.env.ADMIN_NAME || (reset ? "" : await ask("Name: "));
  const email = (process.env.ADMIN_EMAIL || (await ask("E-mail: "))).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid e-mail address.");

  let password = process.env.ADMIN_PASSWORD || "";
  if (!password) {
    password = await ask("Password (hidden): ", true);
    const again = await ask("Repeat password: ", true);
    if (password !== again) throw new Error("Passwords do not match.");
  }
  const problem = passwordProblems(password);
  if (problem) throw new Error(problem);

  const existing = await User.findOne({ email });
  const passwordHash = await hashPassword(password);

  if (reset) {
    if (!existing) throw new Error(`No admin found with e-mail ${email}.`);
    existing.passwordHash = passwordHash;
    existing.tokenVersion = (existing.tokenVersion ?? 0) + 1; // sign out all sessions
    await existing.save();
    console.log(`✔ Password reset for ${email}. All existing sessions have been signed out.`);
    return;
  }

  if (existing) throw new Error(`An admin with e-mail ${email} already exists. Use --reset to change the password.`);
  if (!name) throw new Error("Name is required.");

  await User.create({ name, email, passwordHash, role: "admin" });
  console.log(`✔ Admin account created for ${email}. Sign in at /admin/login`);
}

main()
  .catch((err) => {
    console.error(`✖ ${err instanceof Error ? err.message : err}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
