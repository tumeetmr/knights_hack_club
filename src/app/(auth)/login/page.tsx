import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth/auth-panel";
import { registerHref, safeNext, verifyHref } from "@/lib/auth/next";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in | Knights Hack Club" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const [session, params] = await Promise.all([getSession(), searchParams]);
  const next = safeNext(params.next);
  if (session) redirect(session.needsVerification ? verifyHref(next) : next);
  return (
    <AuthPanel
      eyebrow="> knights --login"
      title="Welcome back."
      footer={
        <>
          New here?{" "}
          <Link href={registerHref(next)} className="font-medium text-white underline underline-offset-4 hover:text-knight-300">
            Create a student account
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthPanel>
  );
}
