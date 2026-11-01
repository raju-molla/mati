import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { FeedbackProvider } from "@/components/admin/Feedback";
import { requireAdminPage } from "@/lib/auth/session";
import { unreadCount } from "@/services/admin";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminPage();
  const unread = await unreadCount();
  return (
    <FeedbackProvider>
      <AdminSidebar userName={user.name} unread={unread} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">{children}</main>
      </div>
    </FeedbackProvider>
  );
}
