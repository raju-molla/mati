import { AccountForm } from "@/components/admin/AccountForm";
import { requireAdminPage } from "@/lib/auth/session";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireAdminPage();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-zinc-500">Your sign-in details. Changing your password signs out every other device.</p>
      </div>
      <AccountForm name={user.name} email={user.email} />
    </div>
  );
}
