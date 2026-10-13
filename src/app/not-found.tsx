import type { Metadata } from "next";
import Link from "next/link";
import { panel } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page not found | Knights Hack Club",
};

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col p-3 sm:p-4">
      <section className={`${panel} flex flex-1 bg-ink text-white`}>
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div className="absolute -right-32 -top-32 size-[320px] glow sm:size-[560px]" aria-hidden />

        <div className="relative mx-auto flex min-h-[calc(100svh-1.5rem)] w-full max-w-3xl flex-col items-center justify-center px-5 py-16 text-center sm:min-h-[calc(100svh-2rem)]">
          <p className="font-mono text-xs text-knight-300 sm:text-sm">{"> cd ./this-page"}</p>
          <p className="mt-1 font-mono text-xs text-white/50 sm:text-sm">no such file or directory</p>
          <h1 className="mt-6 text-[clamp(5rem,22vw,12rem)] font-black leading-none tracking-tight">404</h1>
          <p className="mt-4 max-w-md text-white/70">
            This page doesn&apos;t exist, or it moved. Head back and try again.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-knight-300"
            >
              Back home
            </Link>
            <Link
              href="/ctf"
              className="rounded-full px-5 py-3 text-sm font-bold text-white ring-1 ring-white/30 transition hover:bg-white/10"
            >
              Go to the CTF
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
