import type { Metadata } from "next";
import { PixelWall } from "@/components/pixel-wall";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Pixel Wall | Knights Hack Club",
  description: "One shared canvas for the whole club. Place a pixel, wait, repeat.",
};

export default function PixelWallPage() {
  return (
    <>
      <SiteHeader base="/" />
      <main id="top" className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4">
        <section className="relative overflow-clip rounded-[2rem] bg-ink text-white lg:rounded-[2.5rem]">
          <div className="bg-grid absolute inset-0" aria-hidden />
          <div className="glow absolute -right-32 -top-32 size-[320px] sm:size-[520px]" aria-hidden />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-12 pt-28 sm:px-8 sm:pb-16 sm:pt-36">
            <div className="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-end lg:gap-20">
              <div>
                <p className="font-mono text-xs text-knight-300 sm:text-sm">{"> pixel-wall"}</p>
                <h1 className="headline mt-4 text-[clamp(3.5rem,11vw,8.5rem)]">The pixel wall</h1>
              </div>
              <p className="text-white/70 sm:text-lg">
                One shared canvas for the whole club. Pick a color, place a pixel, wait 5 hours, repeat. Team up
                to draw logos, or defend your corner.
              </p>
            </div>
            <PixelWall />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
