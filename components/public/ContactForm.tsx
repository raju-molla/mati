"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";

/** Client-side mirror of the server schema (the server re-validates everything). */
const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.email("Please enter a valid e-mail address"),
  company: z.string().max(160).optional(),
  service: z.string().max(120).optional(),
  budget: z.string().max(60).optional(),
  timeline: z.string().max(120).optional(),
  message: z.string().trim().min(20, "Please tell me a little more (20+ characters)").max(5000),
  website: z.string().max(500).optional(),
});
type FormValues = z.infer<typeof schema>;

export function ContactForm({
  services,
  budgetOptions,
  defaultService,
  successMessage,
}: {
  services: string[];
  budgetOptions: string[];
  defaultService?: string;
  successMessage?: string;
}) {
  const startedAt = useRef<number>(0);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { service: services.includes(defaultService ?? "") ? defaultService : "" },
  });

  // Pre-select a service when arriving from a service card (?service=…).
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("service");
    if (wanted && services.includes(wanted)) setValue("service", wanted);
  }, [services, setValue]);

  const onSubmit = async (values: FormValues) => {
    setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, elapsedMs: startedAt.current ? Date.now() - startedAt.current : undefined }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setServerError(json.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      reset();
    } catch {
      setServerError("Network error — please check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className="flex flex-col items-start gap-6 border border-line p-8 md:p-12">
        <CheckCircle2 className="size-10 text-accent" aria-hidden="true" />
        <h2 className="text-3xl font-medium">Message sent.</h2>
        <p className="max-w-md text-paper-dim">
          {successMessage || "Thanks for getting in touch — I'll reply as soon as I can."}
        </p>
        <button type="button" className="btn-ghost" onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  const err = (k: keyof FormValues) =>
    errors[k] ? (
      <p id={`${String(k)}-error`} className="mt-2 text-sm text-red-300" role="alert">
        {errors[k]?.message}
      </p>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onFocus={() => {
        if (!startedAt.current) startedAt.current = Date.now();
      }}
      noValidate
      className="grid gap-x-8 gap-y-10 md:grid-cols-2"
    >
      <div>
        <label htmlFor="name" className="field-label">
          Name <span aria-hidden="true">*</span>
        </label>
        <input
          id="name"
          autoComplete="name"
          className="field"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
        />
        {err("name")}
      </div>
      <div>
        <label htmlFor="email" className="field-label">
          E-mail <span aria-hidden="true">*</span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="field"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        {err("email")}
      </div>
      <div>
        <label htmlFor="company" className="field-label">
          Company / Organisation
        </label>
        <input id="company" autoComplete="organization" className="field" {...register("company")} />
      </div>
      <div>
        <label htmlFor="service" className="field-label">
          Service
        </label>
        <select id="service" className="field [&>option]:bg-ink" {...register("service")}>
          <option value="">Not sure yet</option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value="Employment opportunity">Employment opportunity</option>
          <option value="Collaboration">Collaboration</option>
        </select>
      </div>
      <div>
        <label htmlFor="budget" className="field-label">
          Budget range <span className="normal-case tracking-normal">(optional)</span>
        </label>
        {budgetOptions.length ? (
          <select id="budget" className="field [&>option]:bg-ink" {...register("budget")}>
            <option value="">Prefer not to say</option>
            {budgetOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        ) : (
          <input id="budget" className="field" {...register("budget")} />
        )}
      </div>
      <div>
        <label htmlFor="timeline" className="field-label">
          Desired timeline <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input id="timeline" placeholder="e.g. Early next month" className="field" {...register("timeline")} />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="message" className="field-label">
          Project description <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="message"
          rows={6}
          className="field resize-y"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message")}
        />
        {err("message")}
      </div>

      {/* Honeypot: hidden from people and assistive tech, bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="flex flex-col items-start gap-4 md:col-span-2 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted">Fields marked * are required. Your details are only used to reply to you.</p>
        <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Sending…
            </>
          ) : (
            <>
              Send message <ArrowUpRight className="size-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
      {status === "error" && serverError && (
        <p role="alert" className="border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200 md:col-span-2">
          {serverError}
        </p>
      )}
    </form>
  );
}
