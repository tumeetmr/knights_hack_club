import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPlayer } from "@/lib/ctf/player-session";
import { AuthPanel } from "../_components/auth-card";
import { PlayerLoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in | Knights Hack CTF" };

export default async function PlayerLoginPage() {
  if (await getPlayer()) redirect("/ctf");
  return (
    <AuthPanel
      eyebrow="> ctf --login"
      title="Welcome back."
      footer={
        <>
          New here?{" "}
          <Link href="/ctf/register" className="font-medium text-white underline underline-offset-4 hover:text-knight-300">
            Register for the CTF
          </Link>
        </>
      }
    >
      <PlayerLoginForm />
    </AuthPanel>
  );
}
