import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth/auth-panel";
import { logoutAction } from "@/lib/auth/actions";
import { loginHref, safeNext } from "@/lib/auth/next";
import { getSession } from "@/lib/auth/session";
import { VerifyForm } from "./verify-form";

export const metadata: Metadata = { title: "Confirm your email | Knights Hack Club" };

export default async function VerifyPage({ searchParams }: PageProps<"/verify">) {
  const [session, params] = await Promise.all([getSession(), searchParams]);
  const next = safeNext(params.next);
  if (!session) redirect(loginHref(next));
  if (!session.needsVerification) redirect(next);

  return (
    <AuthPanel
      eyebrow="> knights --verify"
      title="Check your email."
      intro={
        <p className="text-center text-white/75">
          We sent a 6-digit code to <strong className="break-all text-white">{session.email}</strong>. Enter it below to
          finish setting up your account.
        </p>
      }
      footer={
        <form action={logoutAction} className="inline">
          <input type="hidden" name="next" value={next} />
          Wrong email?{" "}
          <button type="submit" className="font-medium text-white underline underline-offset-4 hover:text-knight-300">
            Sign out and register again
          </button>
        </form>
      }
    >
      <VerifyForm next={next} />
    </AuthPanel>
  );
}
