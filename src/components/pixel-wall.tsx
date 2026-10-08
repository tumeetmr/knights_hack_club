"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { logoutAction } from "@/lib/auth/actions";
import { loginHref, registerHref } from "@/lib/auth/next";
import { placePixelAction } from "@/lib/pixels/actions";
import {
  BLANK_COLOR,
  COOLDOWN_MS,
  GRID_SIZE,
  PALETTE,
  POLL_MS,
  type PixelMe,
  type PixelTuple,
  type WallResponse,
} from "@/lib/pixels/config";

/** Diffs are cheap but a commit can land out of id order, so re-fetch the whole wall now and then. */
const RESYNC_MS = 60_000;
const HERE = "/#pixel-wall";
const ZOOMS = [1, 2, 4];

type Cell = { x: number; y: number; name?: string };
/** Local clock time the next pixel unlocks, derived from the server's "ms left". */
type Me = { name: string | null; readyAt: number };

const key = (x: number, y: number) => y * GRID_SIZE + x;
const pct = (n: number) => `${(n * 100) / GRID_SIZE}%`;

async function fetchWall(since: number) {
  const res = await fetch(since ? `/api/pixels?since=${since}` : "/api/pixels");
  if (!res.ok) throw new Error(`pixels ${res.status}`);
  return (await res.json()) as WallResponse;
}

export function PixelWall() {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Who painted each cell. Lives outside state: the canvas is the source of truth for colors.
  const owners = useRef(new Map<number, string>());
  const cursor = useRef(0);

  const [status, setStatus] = useState<"loading" | "live" | "offline">("loading");
  const [me, setMe] = useState<Me | null>(null);
  const [now, setNow] = useState(0);
  const [color, setColor] = useState<string>(PALETTE[11].hex);
  const [selected, setSelected] = useState<Cell | null>(null);
  const [hover, setHover] = useState<Cell | null>(null);
  const [zoom, setZoom] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const paint = (list: PixelTuple[]) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    for (const [x, y, c, name] of list) {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, 1, 1);
      owners.current.set(key(x, y), name);
    }
  };

  // Poll for changes while the wall is on screen and the tab is visible.
  useEffect(() => {
    let onScreen = false;
    let busy = false;
    let stopped = false;
    let lastFull = 0;

    const tick = async () => {
      if (busy || !onScreen || document.hidden) return;
      busy = true;
      try {
        let full = !cursor.current || Date.now() - lastFull > RESYNC_MS;
        let data = await fetchWall(full ? 0 : cursor.current);
        if (data.reset) {
          full = true;
          data = await fetchWall(0);
        }
        if (stopped) return;
        if (full) {
          const ctx = canvasRef.current?.getContext("2d");
          if (ctx) {
            ctx.fillStyle = BLANK_COLOR;
            ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
          }
          owners.current.clear();
          lastFull = Date.now();
        }
        paint(data.pixels);
        cursor.current = data.cursor;
        setStatus("live");
      } catch {
        if (!stopped) setStatus("offline");
      } finally {
        busy = false;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        void tick();
      },
      { rootMargin: "200px" },
    );
    if (rootRef.current) io.observe(rootRef.current);
    const timer = setInterval(tick, POLL_MS);
    const onVisible = () => void tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      io.disconnect();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Who's signed in, fetched separately so the homepage itself can stay static.
  useEffect(() => {
    fetch("/api/pixels/me")
      .then((res) => (res.ok ? (res.json() as Promise<PixelMe>) : { name: null, waitMs: 0 }))
      .catch(() => ({ name: null, waitMs: 0 }))
      .then((data) => {
        setNow(Date.now());
        setMe({ name: data.name, readyAt: Date.now() + data.waitMs });
      });
  }, []);

  // Tick the cooldown countdown until the next pixel is ready.
  useEffect(() => {
    if (!me || me.readyAt <= Date.now()) return;
    const timer = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= me.readyAt) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [me]);

  const waitMs = me ? Math.max(0, me.readyAt - now) : 0;
  const canPlace = !!me?.name && !!selected && waitMs === 0 && !placing && status === "live";

  const cellAt = (e: MouseEvent<HTMLCanvasElement>): Cell => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clamp = (n: number) => Math.min(GRID_SIZE - 1, Math.max(0, Math.floor(n)));
    const x = clamp(((e.clientX - rect.left) / rect.width) * GRID_SIZE);
    const y = clamp(((e.clientY - rect.top) / rect.height) * GRID_SIZE);
    return { x, y, name: owners.current.get(key(x, y)) };
  };

  const select = (x: number, y: number) => {
    setSelected({ x, y, name: owners.current.get(key(x, y)) });
    setMessage(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      void place();
      return;
    }
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    const from = selected ?? { x: GRID_SIZE / 2, y: GRID_SIZE / 2 };
    const clamp = (n: number) => Math.min(GRID_SIZE - 1, Math.max(0, n));
    select(clamp(from.x + move[0]), clamp(from.y + move[1]));
  };

  const changeZoom = (next: number) => {
    setZoom(next);
    // Keep the picked square in view after the canvas grows.
    requestAnimationFrame(() => {
      const box = scrollRef.current;
      if (!box || !selected) return;
      const size = box.scrollWidth / GRID_SIZE;
      box.scrollTo({
        left: (selected.x + 0.5) * size - box.clientWidth / 2,
        top: (selected.y + 0.5) * size - box.clientHeight / 2,
      });
    });
  };

  async function place() {
    if (!canPlace || !selected || !me) return;
    setPlacing(true);
    setMessage(null);
    const { x, y } = selected;
    const res = await placePixelAction(x, y, color);
    setPlacing(false);
    setNow(Date.now());
    if (res.ok) {
      paint([[x, y, color, me.name ?? ""]]);
      setSelected({ x, y, name: me.name ?? "" });
      setMe({ ...me, readyAt: Date.now() + res.waitMs });
      return;
    }
    setMessage(res.error);
    if (res.signIn) setMe({ name: null, readyAt: 0 });
    else if (res.waitMs) setMe({ ...me, readyAt: Date.now() + res.waitMs });
  }

  const info = hover ?? selected;
  const colorName = PALETTE.find((c) => c.hex === color)?.name;

  return (
    <div ref={rootRef} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div className="grid gap-2">
        <div
          ref={scrollRef}
          className="relative aspect-square w-full overflow-auto overscroll-contain rounded-2xl bg-white shadow-2xl shadow-black/30 ring-1 ring-white/15"
        >
          <div className="relative" style={{ width: `${zoom * 100}%` }}>
            <canvas
              ref={canvasRef}
              width={GRID_SIZE}
              height={GRID_SIZE}
              tabIndex={0}
              aria-label={`Pixel Wall, ${GRID_SIZE} by ${GRID_SIZE} squares. Use the arrow keys to pick a square and Enter to paint it.`}
              className="block aspect-square w-full cursor-crosshair touch-manipulation [image-rendering:pixelated] focus:outline-none focus-visible:ring-4 focus-visible:ring-knight-300"
              onPointerMove={(e) => e.pointerType === "mouse" && setHover(cellAt(e))}
              onPointerLeave={() => setHover(null)}
              onClick={(e) => {
                const cell = cellAt(e);
                select(cell.x, cell.y);
              }}
              onKeyDown={onKeyDown}
            />
            {selected && (
              <div
                aria-hidden
                className="pointer-events-none absolute outline-2 outline-offset-0 outline-ink [box-shadow:0_0_0_2px_white]"
                style={{ left: pct(selected.x), top: pct(selected.y), width: pct(1), height: pct(1), backgroundColor: color }}
              />
            )}
          </div>
          {status !== "live" && (
            <div className="absolute inset-0 grid place-items-center bg-white/80 p-6 text-center font-mono text-sm text-ink/70">
              {status === "loading" ? "Loading the wall…" : "The wall is offline right now. Try again in a bit."}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-white/60">
          <p aria-live="polite" className="min-h-4">
            {info ? (
              <>
                ({info.x}, {info.y}) · {info.name ? <>painted by <span className="text-white">{info.name}</span></> : info.name === "" ? "painted" : "blank"}
              </>
            ) : (
              "Tap a square to pick it"
            )}
          </p>
          <div className="flex gap-1" role="group" aria-label="Zoom">
            {ZOOMS.map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => changeZoom(z)}
                aria-pressed={zoom === z}
                className={`rounded-full px-3 py-1.5 font-bold transition ${zoom === z ? "bg-white text-ink" : "bg-white/10 text-white hover:bg-white/20"}`}
              >
                {z}×
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl bg-white/5 p-5 ring-1 ring-white/15">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-white/55">
            Color · <span className="text-white">{colorName}</span>
          </p>
          <div role="radiogroup" aria-label="Color" className="mt-3 grid grid-cols-8 gap-1.5">
            {PALETTE.map((c) => (
              <button
                key={c.hex}
                type="button"
                role="radio"
                aria-checked={color === c.hex}
                aria-label={c.name}
                title={c.name}
                onClick={() => setColor(c.hex)}
                className={`aspect-square rounded-md ring-1 ring-white/20 transition active:scale-90 ${
                  color === c.hex ? "scale-110 outline-2 outline-offset-2 outline-white" : "hover:scale-105"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {me === null ? (
          <p className="font-mono text-sm text-white/55">Checking sign-in…</p>
        ) : me.name ? (
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => void place()}
              disabled={!canPlace}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 font-bold text-ink transition hover:bg-knight-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {placing
                ? "Placing…"
                : waitMs > 0
                  ? `Next pixel in ${Math.ceil(waitMs / 1000)}s`
                  : selected
                    ? `Place at (${selected.x}, ${selected.y})`
                    : "Pick a square first"}
            </button>
            {waitMs > 0 && (
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
                <div className="h-full rounded-full bg-knight-300" style={{ width: `${100 - (waitMs / COOLDOWN_MS) * 100}%` }} />
              </div>
            )}
            <form action={logoutAction} className="text-sm text-white/55">
              <input type="hidden" name="next" value={HERE} />
              Painting as <span className="font-bold text-white">{me.name}</span>.{" "}
              <button type="submit" className="underline underline-offset-4 hover:text-white">
                Not you?
              </button>
            </form>
          </div>
        ) : (
          <div className="grid gap-2">
            <p className="text-sm text-white/70">Sign in with your student account to paint. Same one as the CTF.</p>
            <Link
              href={registerHref(HERE)}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 font-bold text-ink transition hover:bg-knight-300 active:scale-[0.98]"
            >
              Create an account
            </Link>
            <Link href={loginHref(HERE)} className="text-center text-sm text-white/60 underline underline-offset-4 hover:text-white">
              I already have one
            </Link>
          </div>
        )}

        {message && (
          <p role="alert" className="rounded-xl bg-red-500/15 px-4 py-3 text-sm font-medium text-red-100 ring-1 ring-red-400/30">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
