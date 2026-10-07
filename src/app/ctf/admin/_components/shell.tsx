import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/lib/ctf/actions";
import { isAdmin } from "@/lib/ctf/session";
import { btnGhost, btnSmall } from "./styles";

/** Page frame for every admin screen: slim top bar plus a centered column. */
export async function AdminShell({ children }: { children: ReactNode }) {
  const signedIn = await isAdmin();

  return (
    <div className="min-h-dvh bg-mist">
      <header className="sticky top-0 z-10 border-b border-ink/10 bg-paper/95">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4">
          <Link href="/ctf/admin" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="" width={40} height={40} className="size-10 rounded-full" />
            <span className="headline text-xl leading-none">
              CTF Admin
              <span className="block font-mono text-[0.625rem] font-medium normal-case tracking-normal text-ink/50 [font-variation-settings:normal]">
                Knights Hack
              </span>
            </span>
          </Link>
          {signedIn && (
            <form action={logoutAction}>
              <button type="submit" className={`${btnGhost} ${btnSmall}`}>
                Sign out
              </button>
            </form>
          )}
        </div>
      </header>
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 pb-16">{children}</main>
    </div>
  );
}
