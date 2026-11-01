import { SingletonForm } from "@/components/admin/SingletonForm";
import { adminSingleton } from "@/services/admin";

export const metadata = { title: "Homepage" };

export default async function Page() {
  const initial = await adminSingleton("home");
  return <SingletonForm configKey="homepage" initial={initial} />;
}
