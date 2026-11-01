import Link from "next/link";
import { FolderKanban, Image as ImageIcon, Inbox, Plus } from "lucide-react";
import { dashboardData } from "@/services/admin";
import { getSessionUser } from "@/lib/auth/session";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [{ stats, recentProjects, recentMessages }, user] = await Promise.all([dashboardData(), getSessionUser()]);
  const cards = [
    { label: "Total projects", value: stats.total, href: "/admin/projects" },
    { label: "Published", value: stats.published, href: "/admin/projects" },
    { label: "Drafts", value: stats.drafts, href: "/admin/projects" },
    { label: "Media items", value: stats.media, href: "/admin/media" },
    { label: "Messages", value: stats.messages, href: "/admin/messages" },
    { label: "Unread", value: stats.unread, href: "/admin/messages", highlight: stats.unread > 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}</h1>
        <p className="mt-1 text-sm text-zinc-500">Here&apos;s what&apos;s on your site right now.</p>
      </div>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <li key={c.label}>
            <Link href={c.href} className="a-card block p-4 transition-colors hover:border-zinc-300">
              <p className="text-xs text-zinc-500">{c.label}</p>
              <p className={`mt-1 text-2xl font-semibold ${c.highlight ? "text-blue-600" : ""}`}>{c.value}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-700">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/projects/new" className="a-btn-primary">
            <Plus className="size-4" /> New project
          </Link>
          <Link href="/admin/media" className="a-btn-secondary">
            <ImageIcon className="size-4" /> Upload media
          </Link>
          <Link href="/admin/experience" className="a-btn-secondary">
            <Plus className="size-4" /> Add experience
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="a-card">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <FolderKanban className="size-4" /> Recently edited projects
            </h2>
            <Link href="/admin/projects" className="text-xs text-zinc-500 hover:text-zinc-900">
              View all
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <p className="px-5 py-8 text-sm text-zinc-500">No projects yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {recentProjects.map((p) => (
                <li key={p._id}>
                  <Link href={`/admin/projects/${p._id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-zinc-50">
                    <span className="truncate">{p.title}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${p.published ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="a-card">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Inbox className="size-4" /> Recent messages
            </h2>
            <Link href="/admin/messages" className="text-xs text-zinc-500 hover:text-zinc-900">
              Open inbox
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="px-5 py-8 text-sm text-zinc-500">No messages yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {recentMessages.map((m) => (
                <li key={m._id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <span className="min-w-0">
                    <span className={`block truncate ${m.status === "new" ? "font-semibold" : ""}`}>{m.name}</span>
                    <span className="block truncate text-xs text-zinc-500">{m.service || "General enquiry"}</span>
                  </span>
                  <span className="shrink-0 text-xs text-zinc-400">{new Date(m.createdAt).toLocaleDateString("en-GB")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
