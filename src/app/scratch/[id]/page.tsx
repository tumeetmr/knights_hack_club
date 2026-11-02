import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { SiteHeader } from "@/components/site-header";
import { scratchEmbedUrl, scratchUrl } from "@/lib/scratch/link";
import { getApprovedProject } from "@/lib/scratch/queries";

const toId = (raw: string) => (/^\d{1,12}$/.test(raw) ? Number(raw) : null);

export async function generateMetadata({ params }: PageProps<"/scratch/[id]">): Promise<Metadata> {
  await connection();
  const id = toId((await params).id);
  const project = id ? await getApprovedProject(id) : null;
  if (!project) return {};
  const title = `${project.title} | Knights Hack Club`;
  return { title, description: project.description || `A Scratch game by ${project.maker}.` };
}

export default async function ScratchProjectPage({ params }: PageProps<"/scratch/[id]">) {
  await connection();
  const id = toId((await params).id);
  const project = id ? await getApprovedProject(id) : null;
  if (!id || !project) notFound();

  return (
    <>
      <SiteHeader base="/" />
      <main id="top" className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4">
        <section className="relative overflow-clip rounded-[2rem] bg-ink text-white lg:rounded-[2.5rem]">
          <div className="bg-grid absolute inset-0" aria-hidden />
          <div className="glow absolute -right-32 -top-32 size-[320px] sm:size-[520px]" aria-hidden />
          <div className="relative mx-auto max-w-5xl px-5 pb-12 pt-28 sm:px-8 sm:pb-16 sm:pt-36">
            <Link href="/scratch" className="inline-flex min-h-10 items-center font-mono text-xs text-knight-300 hover:text-white sm:text-sm">
              ← Scratch gallery
            </Link>
            <h1 className="headline mt-3 break-words text-[clamp(2.75rem,8vw,6rem)]">{project.title}</h1>
            <p className="mt-2 font-mono text-sm text-white/60">by {project.maker}</p>

            <div className="mt-8 overflow-hidden rounded-3xl bg-black ring-1 ring-white/15">
              <iframe
                src={scratchEmbedUrl(id)}
                title={project.title}
                allowFullScreen
                loading="lazy"
                className="aspect-[485/402] w-full"
              />
            </div>

            {project.description && <p className="mt-6 max-w-2xl text-lg text-white/80">{project.description}</p>}

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={scratchUrl(id)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center rounded-full bg-white px-6 font-bold text-ink transition hover:bg-knight-100"
              >
                Open on Scratch ↗
              </a>
              <Link
                href="/scratch/submit"
                className="inline-flex min-h-12 items-center rounded-full px-6 font-semibold text-white/80 ring-2 ring-white/25 transition hover:text-white hover:ring-white/60"
              >
                Submit yours
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
