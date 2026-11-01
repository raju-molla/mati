import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Studio", template: "%s · Studio" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root min-h-screen bg-zinc-50 font-sans text-zinc-900 [color-scheme:light]">{children}</div>;
}
