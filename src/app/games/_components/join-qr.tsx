"use client";

import { QRCodeSVG } from "qrcode.react";
import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/** QR code pointing phones at `path` on whatever host this screen was opened from. */
export function JoinQr({ path, size = 280 }: { path: string; size?: number }) {
  const origin = useSyncExternalStore(
    noSubscribe,
    () => window.location.origin,
    () => "",
  );
  const url = origin + path;
  const local = /\/\/(localhost|127\.0\.0\.1)\b/.test(origin);

  return (
    <div className="flex flex-col items-center rounded-[2rem] bg-white p-5 text-center text-ink sm:p-6">
      {origin ? (
        <QRCodeSVG value={url} size={size} marginSize={1} className="h-auto w-full" style={{ maxWidth: size }} />
      ) : (
        <div className="aspect-square w-full max-w-[280px] animate-pulse rounded-xl bg-mist" />
      )}
      <p className="mt-4 text-lg font-bold">Scan to play</p>
      <p className="mt-1 break-all font-mono text-sm text-ink/60">{url.replace(/^https?:\/\//, "")}</p>
      {local && (
        <p className="mt-3 rounded-xl bg-amber-100 px-3 py-2 text-xs text-amber-900">
          Phones can&apos;t open localhost. Open this screen via your laptop&apos;s Wi-Fi IP instead.
        </p>
      )}
    </div>
  );
}
