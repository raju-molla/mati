import { SingletonForm } from "@/components/admin/SingletonForm";
import { adminSingleton } from "@/services/admin";

export const metadata = { title: "SEO" };

export default async function Page() {
  const initial = await adminSingleton("site");
  return <SingletonForm configKey="seo" initial={initial} />;
}
