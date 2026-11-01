"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Award,
  BookOpen,
  Briefcase,
  Camera,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  Home,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Share2,
  Sparkles,
  Tags,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV: { group: string; items: { href: string; label: string; icon: React.ElementType }[] }[] = [
  { group: "", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    group: "Portfolio",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/categories", label: "Categories", icon: Tags },
      { href: "/admin/photography", label: "Photography", icon: Camera },
      { href: "/admin/media", label: "Videos / Media", icon: ImageIcon },
    ],
  },
  {
    group: "Profile",
    items: [
      { href: "/admin/experience", label: "Experience", icon: Briefcase },
      { href: "/admin/education", label: "Education", icon: GraduationCap },
      { href: "/admin/skills", label: "Skills", icon: Award },
      { href: "/admin/services", label: "Services", icon: Sparkles },
      { href: "/admin/messages", label: "Messages", icon: Inbox },
    ],
  },
  {
    group: "Pages & settings",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: Home },
      { href: "/admin/about", label: "About", icon: BookOpen },
      { href: "/admin/seo", label: "SEO", icon: Search },
      { href: "/admin/social", label: "Social links", icon: Share2 },
      { href: "/admin/settings", label: "Site settings", icon: Settings },
      { href: "/admin/account", label: "Account", icon: User },
    ],
  },
];

export function AdminSidebar({ userName, unread }: { userName: string; unread: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/admin/login");
  };

  const nav = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-5">
        <Link href="/admin" className="flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="font-serif text-xl italic">rateusz</span>
          <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Studio</span>
        </Link>
        <button type="button" className="rounded p-1 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="size-5" />
        </button>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV.map((g) => (
          <div key={g.group || "main"}>
            {g.group && <p className="mb-1.5 px-2 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">{g.group}</p>}
            <ul className="space-y-0.5">
              {g.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm",
                      isActive(item.href) ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
                    )}
                  >
                    <item.icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="flex-1">{item.label}</span>
                    {item.href === "/admin/messages" && unread > 0 && (
                      <span className="rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">{unread}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="space-y-1 border-t border-zinc-200 p-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100">
          <ExternalLink className="size-4" aria-hidden="true" /> View website
        </a>
        <button type="button" onClick={logout} className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100">
          <LogOut className="size-4" aria-hidden="true" /> Log out
        </button>
        <p className="truncate px-2 pt-2 text-xs text-zinc-400">Signed in as {userName}</p>
      </div>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} className="rounded p-1" aria-label="Open menu" aria-expanded={open}>
          <Menu className="size-5" />
        </button>
        <span className="font-serif text-lg italic">rateusz</span>
        <span className="w-7" />
      </div>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-zinc-200 bg-white lg:block">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-zinc-900/40" onClick={() => setOpen(false)} aria-label="Close menu" />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">{nav}</aside>
        </div>
      )}
    </>
  );
}
