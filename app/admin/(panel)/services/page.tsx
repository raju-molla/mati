import { ResourceManager } from "@/components/admin/ResourceManager";
import { adminList } from "@/services/admin";

export const metadata = { title: "Services" };

export default async function Page() {
  const items = await adminList("services");
  return <ResourceManager configKey="services" initialItems={items} />;
}
