"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Lock } from "lucide-react";

const schema = z.object({
  email: z.email("Enter a valid e-mail"),
  password: z.string().min(1, "Enter your password"),
});
type Values = z.infer<typeof schema>;

export function LoginForm({ next }: { next?: string }) {
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Sign-in failed.");
        return;
      }
      // Only allow same-site relative redirects.
      const dest = next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
      window.location.assign(dest);
    } catch {
      setError("Network error — please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <label htmlFor="email" className="a-label">
          E-mail
        </label>
        <input id="email" type="email" autoComplete="username" className="a-input" aria-invalid={!!errors.email} {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="password" className="a-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="a-input"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>
      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className="a-btn-primary w-full !py-2.5" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
        Sign in
      </button>
    </form>
  );
}
