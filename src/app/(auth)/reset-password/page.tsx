import type { Metadata } from "next";
import Link from "next/link";
import { AuthPanel, submitBtn } from "@/components/auth/auth-panel";
import { isResetTokenValid } from "@/lib/auth/password-reset";
import { ResetForm } from "./reset-form";

// The token is in the URL; don't hand it to other sites in the Referer header.
export const metadata: Metadata = { title: "Choose a new password | Knights Hack Club", referrer: "no-referrer" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  const value = typeof token === "string" ? token : "";
  // Only checks the link; it's used up when the form is submitted, so mail scanners opening it don't break it.
  const valid = await isResetTokenValid(value);

  return (
    <AuthPanel
      eyebrow="> knights --reset"
      title={valid ? "New password." : "Link expired."}
      intro={
        <p className="text-center text-white/75">
          {valid
            ? "Choose a new password. You'll be signed in, and any other devices will be signed out."
            : "Reset links work once, for 30 minutes. Ask for a new one and use the newest email."}
        </p>
      }
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-white underline underline-offset-4 hover:text-knight-300">
            Back to sign in
          </Link>
        </>
      }
    >
      {valid ? (
        <ResetForm token={value} />
      ) : (
        <Link href="/forgot-password" className={submitBtn}>
          Send a new link
        </Link>
      )}
    </AuthPanel>
  );
}
