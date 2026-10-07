import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/ctf/session";
import { AdminShell } from "../_components/shell";
import { card } from "../_components/styles";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/ctf/admin");

  return (
    <AdminShell>
      <section className={`${card} mx-auto mt-6 w-full max-w-md`}>
        <h1 className="headline mb-1 text-5xl">Organizers only</h1>
        <p className="mb-6 text-ink/60">Sign in to manage the CTF.</p>
        <LoginForm />
      </section>
    </AdminShell>
  );
}
