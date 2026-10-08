"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/** Poster-style QR card pointing phones at `path` on whatever host this screen was opened from. */
export function LinkQr({ title, path }: { title: string; path: string }) {
  const origin = useSyncExternalStore(
    noSubscribe,
    () => window.location.origin,
    () => "",
  );

  return (
    <Link
      href={path}
      className="flex min-h-0 flex-col items-center rounded-2xl bg-white px-4 py-[2vh] text-ink transition-transform hover:-translate-y-1"
    >
      <p className="text-[min(3.4vh,4.4vw,2.75rem)] text-center font-black uppercase" style={{ fontVariationSettings: '"wdth" 118' }}>
        {title}
      </p>
      <div className="my-[1.5vh] flex min-h-0 w-full flex-1 items-center justify-center">
        {origin ? (
          <QRCodeSVG
            value={origin + path}
            size={512}
            marginSize={0}
            className="aspect-square h-full max-h-full w-auto max-w-full"
          />
        ) : (
          <div className="aspect-square h-full animate-pulse rounded-xl bg-mist" />
        )}
      </div>
      <p className="font-mono text-[clamp(0.875rem,1.8vh,1.25rem)] font-medium">{path}</p>
    </Link>
  );
}

/** Wide card: QR to the club join form, with a pin-back button as the sign-up reward. */
export function JoinCard({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex min-h-0 w-full items-center gap-[3vh] rounded-2xl bg-white px-[3vh] py-[2vh] text-ink transition-transform hover:-translate-y-1"
    >
      <QRCodeSVG value={href} size={512} marginSize={0} className="aspect-square h-full w-auto shrink-0" />
      <div className="min-w-0 flex-1">
        <p
          className="text-[min(4.2vh,5vw,3.25rem)] font-black uppercase leading-[0.95]"
          style={{ fontVariationSettings: '"wdth" 118' }}
        >
          Join our club
        </p>
        <p className="mt-[1vh] text-[min(2.2vh,3.4vw,1.5rem)] font-semibold text-ink/70">
          Scan, fill out the form, show us your phone.
        </p>
      </div>
      {/* Pin-back button badge */}
      <div className="grid aspect-square h-full max-h-[18vh] shrink-0 -rotate-12 place-items-center rounded-full bg-[#e8ff4a] text-center shadow-[inset_0_-0.6vh_0_rgb(0_0_0/0.15),0_0.6vh_1.2vh_rgb(0_0_0/0.25)] ring-[0.6vh] ring-ink">
        <p
          className="text-[min(3vh,4vw,2.25rem)] font-black uppercase leading-[0.9]"
          style={{ fontVariationSettings: '"wdth" 118' }}
        >
          Get a
          <br />
          pin!
        </p>
      </div>
    </a>
  );
}
