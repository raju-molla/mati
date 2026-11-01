"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "./api";
import { useFeedback } from "./Feedback";

export function AccountForm({ name: initialName, email: initialEmail }: { name: string; email: string }) {
  const { toast } = useFeedback();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirmPw, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPw) {
      toast("The new passwords don't match.", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await api<{ passwordChanged: boolean }>("/api/admin/account", {
        method: "PATCH",
        body: {
          name,
          email,
          ...(currentPassword ? { currentPassword } : {}),
          ...(newPassword ? { newPassword } : {}),
        },
      });
      toast(res.passwordChanged ? "Password changed — other devices have been signed out" : "Account updated");
      setCurrent("");
      setNew("");
      setConfirm("");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-xl space-y-6">
      <section className="a-card space-y-5 p-6">
        <h2 className="font-semibold">Profile</h2>
        <div>
          <label htmlFor="acc-name" className="a-label">
            Name
          </label>
          <input id="acc-name" className="a-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="acc-email" className="a-label">
            Sign-in e-mail
          </label>
          <input id="acc-email" type="email" className="a-input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          <p className="a-help">Changing it requires your current password below.</p>
        </div>
      </section>
      <section className="a-card space-y-5 p-6">
        <h2 className="font-semibold">Password</h2>
        <div>
          <label htmlFor="acc-current" className="a-label">
            Current password
          </label>
          <input id="acc-current" type="password" className="a-input" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
        </div>
        <div>
          <label htmlFor="acc-new" className="a-label">
            New password
          </label>
          <input id="acc-new" type="password" className="a-input" value={newPassword} onChange={(e) => setNew(e.target.value)} autoComplete="new-password" />
          <p className="a-help">At least 12 characters, mixing upper/lower case, numbers or symbols.</p>
        </div>
        <div>
          <label htmlFor="acc-confirm" className="a-label">
            Confirm new password
          </label>
          <input id="acc-confirm" type="password" className="a-input" value={confirmPw} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        </div>
      </section>
      <button type="submit" className="a-btn-primary" disabled={saving}>
        {saving && <Loader2 className="size-4 animate-spin" />} Save account
      </button>
    </form>
  );
}
