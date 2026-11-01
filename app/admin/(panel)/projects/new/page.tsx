import { ProjectEditor } from "@/components/admin/ProjectEditor";

export const metadata = { title: "New project" };

export default function NewProjectPage() {
  return <ProjectEditor project={null} />;
}
