import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const user = await getSessionUser().catch(() => null);
  if (user) redirect("/admin");
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-serif text-4xl italic">rateusz</p>
          <p className="mt-1 text-sm text-zinc-500">Sign in to manage your portfolio</p>
        </div>
        <div className="a-card p-6 shadow-sm">
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
