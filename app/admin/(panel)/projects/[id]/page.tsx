import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { adminProject } from "@/services/admin";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  const project = await adminProject(id);
  if (!project) notFound();
  return <ProjectEditor key={project._id} project={project} />;
}
