import type { Metadata } from "next";
import Link from "next/link";
import { AuthPanel } from "@/components/auth/auth-panel";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Forgot password | Knights Hack Club" };

export default function ForgotPasswordPage() {
  return (
    <AuthPanel
      eyebrow="> knights --forgot"
      title="Locked out?"
      intro={<p className="text-center text-white/75">Enter the email you signed up with and we&apos;ll send you a link to choose a new password.</p>}
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-white underline underline-offset-4 hover:text-knight-300">
            Back to sign in
          </Link>
        </>
      }
    >
      <ForgotForm />
    </AuthPanel>
  );
}
