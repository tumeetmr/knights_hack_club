import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPlayer } from "@/lib/ctf/player-session";
import { AuthPanel } from "../_components/auth-card";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Register | Knights Hack CTF" };

export default async function RegisterPage() {
  if (await getPlayer()) redirect("/ctf");
  return (
    <AuthPanel
      eyebrow="> ctf --register"
      title="Join the hunt."
      footer={
        <>
          Already registered?{" "}
          <Link href="/ctf/login" className="font-medium text-white underline underline-offset-4 hover:text-knight-300">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthPanel>
  );
}
