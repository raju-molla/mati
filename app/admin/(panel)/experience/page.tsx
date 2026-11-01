import { ResourceManager } from "@/components/admin/ResourceManager";
import { adminList } from "@/services/admin";

export const metadata = { title: "Experience" };

export default async function Page() {
  const items = await adminList("experience");
  return <ResourceManager configKey="experience" initialItems={items} />;
}
