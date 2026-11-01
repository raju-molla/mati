"use client";

import { useMemo, useState } from "react";
import { Archive, Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import type { ContactMessageItem, MessageStatus } from "@/types";
import { api } from "./api";
import { useFeedback } from "./Feedback";
import { cn } from "@/lib/utils/cn";

const STATUS_STYLE: Record<MessageStatus, string> = {
  new: "bg-blue-50 text-blue-700",
  read: "bg-zinc-100 text-zinc-600",
  replied: "bg-emerald-50 text-emerald-700",
  archived: "bg-zinc-100 text-zinc-400",
};

const TABS: { key: MessageStatus | "inbox"; label: string }[] = [
  { key: "inbox", label: "Inbox" },
  { key: "new", label: "New" },
  { key: "replied", label: "Replied" },
  { key: "archived", label: "Archived" },
];

export function MessagesInbox({ initial }: { initial: ContactMessageItem[] }) {
  const { toast, confirm } = useFeedback();
  const [messages, setMessages] = useState(initial);
  const [tab, setTab] = useState<MessageStatus | "inbox">("inbox");
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = useMemo(
    () => messages.filter((m) => (tab === "inbox" ? m.status !== "archived" : m.status === tab)),
    [messages, tab]
  );
  const current = messages.find((m) => m._id === openId) ?? null;

  const setStatus = async (m: ContactMessageItem, status: MessageStatus, quiet = false) => {
    setMessages((all) => all.map((x) => (x._id === m._id ? { ...x, status } : x)));
    try {
      await api(`/api/admin/messages/${m._id}`, { method: "PATCH", body: { status } });
      if (!quiet) toast(`Marked as ${status}`);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const open = (m: ContactMessageItem) => {
    setOpenId(m._id);
    if (m.status === "new") setStatus(m, "read", true);
  };

  const remove = async (m: ContactMessageItem) => {
    const ok = await confirm({
      title: "Delete this message?",
      body: `The enquiry from ${m.name} will be permanently deleted.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/api/admin/messages/${m._id}`, { method: "DELETE" });
      setMessages((all) => all.filter((x) => x._id !== m._id));
      setOpenId(null);
      toast("Message deleted");
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const unread = messages.filter((m) => m.status === "new").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enquiries from the contact form{unread ? ` · ${unread} unread` : ""}.
        </p>
      </div>
      <div className="mb-4 flex gap-1 overflow-x-auto" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn("rounded-md px-3 py-1.5 text-sm whitespace-nowrap", tab === t.key ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100")}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
        <ul className={cn("a-card max-h-[70vh] divide-y divide-zinc-100 overflow-y-auto", current && "hidden lg:block")}>
          {visible.length === 0 && <li className="px-4 py-12 text-center text-sm text-zinc-500">No messages here.</li>}
          {visible.map((m) => (
            <li key={m._id}>
              <button
                type="button"
                onClick={() => open(m)}
                className={cn("block w-full px-4 py-3 text-left hover:bg-zinc-50", openId === m._id && "bg-zinc-50")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("truncate text-sm", m.status === "new" ? "font-semibold" : "font-medium")}>{m.name}</span>
                  <span className="shrink-0 text-xs text-zinc-400">{new Date(m.createdAt).toLocaleDateString("en-GB")}</span>
                </div>
                <p className="truncate text-xs text-zinc-500">{m.service || m.company || m.email}</p>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-600">{m.message}</p>
              </button>
            </li>
          ))}
        </ul>

        {current ? (
          <article className="a-card p-5 sm:p-6">
            <button type="button" className="mb-4 text-sm text-zinc-500 lg:hidden" onClick={() => setOpenId(null)}>
              ← Back to list
            </button>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{current.name}</h2>
                <a href={`mailto:${current.email}`} className="text-sm text-zinc-600 underline">
                  {current.email}
                </a>
              </div>
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium capitalize", STATUS_STYLE[current.status])}>{current.status}</span>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
              {[
                ["Company", current.company],
                ["Service", current.service],
                ["Budget", current.budget],
                ["Timeline", current.timeline],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-zinc-500">{k}</dt>
                  <dd>{v || "—"}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm leading-relaxed whitespace-pre-wrap text-zinc-800">{current.message}</p>
            <p className="mt-4 text-xs text-zinc-400">Received {new Date(current.createdAt).toLocaleString("en-GB")}</p>
            <div className="mt-6 flex flex-wrap gap-2 border-t border-zinc-100 pt-5">
              <a
                href={`mailto:${current.email}?subject=${encodeURIComponent("Re: your enquiry")}`}
                className="a-btn-primary"
                onClick={() => setStatus(current, "replied", true)}
              >
                <Reply className="size-4" /> Reply by e-mail
              </a>
              {current.status !== "replied" && (
                <button type="button" className="a-btn-secondary" onClick={() => setStatus(current, "replied")}>
                  <MailOpen className="size-4" /> Mark replied
                </button>
              )}
              {current.status !== "new" && (
                <button type="button" className="a-btn-secondary" onClick={() => setStatus(current, "new")}>
                  <Mail className="size-4" /> Mark unread
                </button>
              )}
              {current.status !== "archived" ? (
                <button type="button" className="a-btn-secondary" onClick={() => setStatus(current, "archived")}>
                  <Archive className="size-4" /> Archive
                </button>
              ) : (
                <button type="button" className="a-btn-secondary" onClick={() => setStatus(current, "read")}>
                  Restore
                </button>
              )}
              <button type="button" className="a-btn ml-auto text-red-600 hover:bg-red-50" onClick={() => remove(current)}>
                <Trash2 className="size-4" /> Delete
              </button>
            </div>
          </article>
        ) : (
          <div className="a-card hidden items-center justify-center p-12 text-sm text-zinc-500 lg:flex">Select a message to read it.</div>
        )}
      </div>
    </div>
  );
}
