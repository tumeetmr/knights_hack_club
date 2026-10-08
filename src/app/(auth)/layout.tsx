import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";

/** Student sign-in and sign-up. One account covers the CTF, the Pixel Wall and anything added later. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader base="/" />
      <main className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4">{children}</main>
    </>
  );
}
