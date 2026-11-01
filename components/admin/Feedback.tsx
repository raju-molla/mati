"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/* ─────────────── Toasts ─────────────── */

type Toast = { id: number; kind: "success" | "error" | "info"; message: string };
type ConfirmOptions = {
  title: string;
  body?: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
};

interface FeedbackCtx {
  toast: (message: string, kind?: Toast["kind"]) => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const Ctx = createContext<FeedbackCtx | null>(null);

export function useFeedback(): FeedbackCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useFeedback must be used inside <FeedbackProvider>");
  return c;
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const seq = useRef(0);

  const toast = useCallback((message: string, kind: Toast["kind"] = "success") => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 7000 : 3500);
  }, []);

  const confirm = useCallback(
    (opts: ConfirmOptions) => new Promise<boolean>((resolve) => setConfirmState({ ...opts, resolve })),
    []
  );

  const close = (v: boolean) => {
    confirmState?.resolve(v);
    setConfirmState(null);
  };

  return (
    <Ctx.Provider value={{ toast, confirm }}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(92vw,380px)] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border bg-white px-4 py-3 text-sm shadow-lg",
              t.kind === "error" ? "border-red-200" : "border-zinc-200"
            )}
          >
            {t.kind === "success" && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />}
            {t.kind === "error" && <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />}
            {t.kind === "info" && <Info className="mt-0.5 size-4 shrink-0 text-zinc-600" />}
            <span className="flex-1 text-zinc-800">{t.message}</span>
            <button
              type="button"
              onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
              className="text-zinc-400 hover:text-zinc-700"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
      {confirmState && <ConfirmDialog {...confirmState} onClose={close} />}
    </Ctx.Provider>
  );
}

/* ─────────────── Confirm dialog ─────────────── */

function ConfirmDialog({
  title,
  body,
  confirmLabel = "Confirm",
  danger,
  onClose,
}: ConfirmOptions & { onClose: (v: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose(false);
      }}
      className="m-auto w-[min(92vw,440px)] rounded-xl bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-900/40"
      aria-labelledby="confirm-title"
    >
      <div className="p-6">
        <div className="flex gap-4">
          {danger && (
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="size-5" />
            </span>
          )}
          <div>
            <h2 id="confirm-title" className="text-base font-semibold">
              {title}
            </h2>
            {body && <div className="mt-2 text-sm text-zinc-600">{body}</div>}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-6 py-4">
        <button type="button" className="a-btn-secondary" onClick={() => onClose(false)} autoFocus>
          Cancel
        </button>
        <button type="button" className={danger ? "a-btn-danger" : "a-btn-primary"} onClick={() => onClose(true)}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
