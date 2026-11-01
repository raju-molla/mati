import { ResourceManager } from "@/components/admin/ResourceManager";
import { adminList } from "@/services/admin";

export const metadata = { title: "Categories" };

export default async function Page() {
  const items = await adminList("categories");
  return <ResourceManager configKey="categories" initialItems={items} />;
}
