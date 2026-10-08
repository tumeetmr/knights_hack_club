import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/lib/ctf/actions";
import { isAdmin } from "@/lib/ctf/session";
import { AdminNav } from "./nav";
import { btnGhost, btnSmall } from "./styles";

/** Page frame for every admin screen: top bar with tabs, then a centered column. */
export async function AdminShell({ children }: { children: ReactNode }) {
  const signedIn = await isAdmin();

  return (
    <div className="min-h-dvh bg-mist">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-3">
            <Link href="/ctf/admin" className="flex items-center gap-2.5">
              <Image src="/logo-light.png" alt="" width={43} height={40} className="h-9 w-auto shrink-0" />
              <span className="headline text-xl leading-none">
                CTF Admin
                <span className="block font-mono text-[0.625rem] font-medium normal-case tracking-normal text-ink/50 [font-variation-settings:normal]">
                  Knights Hack
                </span>
              </span>
            </Link>
            {signedIn && (
              <div className="flex items-center gap-2">
                <a href="/ctf" target="_blank" className={`${btnGhost} ${btnSmall} max-sm:hidden`}>
                  Player view ↗
                </a>
                <form action={logoutAction}>
                  <button type="submit" className={`${btnGhost} ${btnSmall}`}>
                    Sign out
                  </button>
                </form>
              </div>
            )}
          </div>
          {signedIn && <AdminNav />}
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 pb-16 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}

/** Title row at the top of each tab: what this page is for, plus its main buttons. */
export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-2 inline-flex min-h-8 items-center text-sm font-medium text-ink/60 hover:text-ink">
            ← {back.label}
          </Link>
        )}
        <h1 className="headline text-4xl sm:text-5xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-ink/60">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
