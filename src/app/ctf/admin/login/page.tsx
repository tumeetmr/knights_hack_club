import Link from "next/link";
import { redirect } from "next/navigation";
import { getStudent } from "@/lib/auth/session";
import { loginHref } from "@/lib/auth/next";
import { isAdmin } from "@/lib/ctf/session";
import { AdminShell } from "../_components/shell";
import { btnPrimary, card } from "../_components/styles";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/ctf/admin");
  const student = await getStudent();

  return (
    <AdminShell>
      <section className={`${card} mx-auto mt-6 w-full max-w-md`}>
        <h1 className="headline mb-1 text-5xl">Organizers only</h1>
        {student ? (
          <p className="text-ink/60">This account isn&apos;t an organizer.</p>
        ) : (
          <>
            <p className="mb-6 text-ink/60">Sign in with your organizer account.</p>
            <Link href={loginHref()} className={btnPrimary}>
              Sign in
            </Link>
          </>
        )}
      </section>
    </AdminShell>
  );
}
