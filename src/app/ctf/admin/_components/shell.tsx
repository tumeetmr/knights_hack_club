import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/lib/auth/actions";
import { isAdmin } from "@/lib/ctf/session";
import { SidebarNav, TopNav } from "./nav";
import { btnGhost, btnSmall } from "./styles";

/** Page frame for every admin screen: sidebar on desktop, tab strip on phones, then the content. */
export async function AdminShell({ children }: { children: ReactNode }) {
  const signedIn = await isAdmin();

  const brand = (
    <Link href="/ctf/admin" className="flex items-center gap-2.5">
      <Image src="/logo-light.png" alt="" width={43} height={40} className="h-9 w-auto shrink-0" />
      <span className="headline text-xl leading-none">
        Admin
        <span className="block font-mono text-[0.625rem] font-medium normal-case tracking-normal text-ink/50 [font-variation-settings:normal]">
          Knights Hack
        </span>
      </span>
    </Link>
  );

  if (!signedIn) {
    return (
      <div className="min-h-dvh bg-mist">
        <header className="border-b border-ink/10 bg-paper">
          <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">{brand}</div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    );
  }

  const account = (
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
  );

  return (
    <div className="min-h-dvh bg-mist lg:grid lg:grid-cols-[15rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-ink/10 bg-paper p-4 lg:flex">
        <div className="px-1 pt-1">{brand}</div>
        <SidebarNav />
        <div className="mt-auto flex flex-col gap-2">
          <a href="/ctf" target="_blank" className={`${btnGhost} ${btnSmall}`}>
            Player view ↗
          </a>
          <form action={logoutAction}>
            <button type="submit" className={`${btnGhost} ${btnSmall} w-full`}>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Mobile / tablet top bar */}
        <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/95 backdrop-blur lg:hidden">
          <div className="px-4 sm:px-6">
            <div className="flex h-16 items-center justify-between gap-3">
              {brand}
              {account}
            </div>
            <TopNav />
          </div>
        </header>
        <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 pb-16 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
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
        <h1 className="headline text-3xl sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-ink/60">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
