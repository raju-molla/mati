import { SingletonForm } from "@/components/admin/SingletonForm";
import { adminSingleton } from "@/services/admin";

export const metadata = { title: "About page" };

export default async function Page() {
  const initial = await adminSingleton("about");
  return <SingletonForm configKey="about" initial={initial} />;
}
