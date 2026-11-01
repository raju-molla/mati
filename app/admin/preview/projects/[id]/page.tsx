import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { CaseStudy } from "@/components/public/CaseStudy";
import { requireAdminPage } from "@/lib/auth/session";
import { getProjectForPreview } from "@/services/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Preview", robots: { index: false, follow: false } };

/**
 * Admin-only preview of a project (works for drafts). Rendered with the
 * public design, inside the admin area so it's protected by authentication.
 */
export default async function PreviewProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  const project = await getProjectForPreview(id);
  if (!project) notFound();
  return (
    <div className="min-h-screen bg-ink text-paper [color-scheme:dark]">
      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 bg-accent px-4 py-2 text-sm font-medium text-ink">
        Preview{project.published ? "" : " — this project is a draft and not visible to visitors"}
      </div>
      <CaseStudy project={project} />
    </div>
  );
}
