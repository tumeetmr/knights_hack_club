import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { safeNext } from "@/lib/ctf/form";
import { getPlayer } from "@/lib/ctf/player-session";
import { AuthPanel } from "../_components/auth-card";
import { PlayerLoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in | Knights Hack CTF" };

export default async function PlayerLoginPage({ searchParams }: PageProps<"/ctf/login">) {
  const [player, params] = await Promise.all([getPlayer(), searchParams]);
  const next = safeNext(params.next);
  if (player) redirect(next);
  return (
    <AuthPanel
      eyebrow="> ctf --login"
      title="Welcome back."
      footer={
        <>
          New here?{" "}
          <Link
            href={next === "/ctf" ? "/ctf/register" : `/ctf/register?next=${encodeURIComponent(next)}`}
            className="font-medium text-white underline underline-offset-4 hover:text-knight-300"
          >
            Register for the CTF
          </Link>
        </>
      }
    >
      <PlayerLoginForm next={next} />
    </AuthPanel>
  );
}
