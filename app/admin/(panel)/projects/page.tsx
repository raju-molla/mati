import { ResourceManager } from "@/components/admin/ResourceManager";
import { adminList } from "@/services/admin";

export const metadata = { title: "Projects" };

export default async function Page() {
  const items = await adminList("projects");
  return <ResourceManager configKey="projects" initialItems={items} />;
}
