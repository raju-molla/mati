import { SingletonForm } from "@/components/admin/SingletonForm";
import { adminSingleton } from "@/services/admin";

export const metadata = { title: "Site settings" };

export default async function Page() {
  const initial = await adminSingleton("site");
  return <SingletonForm configKey="settings" initial={initial} />;
}
