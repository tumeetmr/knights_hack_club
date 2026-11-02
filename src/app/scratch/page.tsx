import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { SiteHeader } from "@/components/site-header";
import { scratchThumbUrl } from "@/lib/scratch/link";
import { listApprovedProjects } from "@/lib/scratch/queries";

export const metadata: Metadata = {
  title: "Scratch Gallery | Knights Hack Club",
  description: "Games built by Knights Hack Club members at the Scratch workshop. Click one to play it.",
};

export default async function ScratchGalleryPage() {
  await connection();
  const projects = await listApprovedProjects();

  return (
    <>
      <SiteHeader base="/" />
      <main id="top" className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4">
        <section className="relative overflow-clip rounded-[2rem] bg-ink text-white lg:rounded-[2.5rem]">
          <div className="bg-grid absolute inset-0" aria-hidden />
          <div className="glow absolute -right-32 -top-32 size-[320px] sm:size-[520px]" aria-hidden />
          <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-28 sm:px-8 sm:pb-16 sm:pt-36">
            <p className="font-mono text-xs text-knight-300 sm:text-sm">{"> scratch --gallery"}</p>
            <h1 className="headline mt-4 text-[clamp(3.5rem,11vw,8.5rem)]">Scratch gallery</h1>
            <p className="mt-4 max-w-xl text-white/70">
              Games built by club members at the Scratch workshop. Click one to play it right here.
            </p>
            <Link
              href="/scratch/submit"
              className="mt-8 inline-flex min-h-12 items-center rounded-full bg-white px-7 font-bold text-ink transition hover:bg-knight-100"
            >
              Submit your project
            </Link>
          </div>
        </section>

        <section className="rounded-[2rem] bg-paper lg:rounded-[2.5rem]">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
            {projects.length === 0 ? (
              <p className="rounded-3xl bg-mist px-6 py-14 text-center text-ink/65">
                No projects yet. Built something? Submit it and be the first.
              </p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/scratch/${p.scratchId}`}
                      className="group block overflow-hidden rounded-3xl bg-mist ring-1 ring-ink/10 transition hover:-translate-y-0.5 hover:ring-knight-500"
                    >
                      <Image
                        src={scratchThumbUrl(p.scratchId)}
                        alt=""
                        width={480}
                        height={360}
                        unoptimized
                        className="aspect-[4/3] w-full bg-ink/5 object-cover"
                      />
                      <div className="p-5">
                        <h2 className="headline truncate text-3xl">{p.title}</h2>
                        <p className="mt-1 font-mono text-xs text-ink/55">by {p.maker}</p>
                        {p.description && <p className="mt-3 line-clamp-2 text-sm text-ink/70">{p.description}</p>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
