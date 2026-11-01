import { ResourceManager } from "@/components/admin/ResourceManager";
import { adminList } from "@/services/admin";

export const metadata = { title: "Education" };

export default async function Page() {
  const items = await adminList("education");
  return <ResourceManager configKey="education" initialItems={items} />;
}
