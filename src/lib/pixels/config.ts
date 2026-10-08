// Shared by the Pixel Wall server code and the browser.

/** Cells per side. The DB check constraint (drizzle/0004_pixel_wall.sql) uses the same 64. */
export const GRID_SIZE = 64;
export const COOLDOWN_MS = 30_000;
export const POLL_MS = 2_000;

/** Unpainted cells. */
export const BLANK_COLOR = "#ffffff";

export const PALETTE = [
  { hex: "#ffffff", name: "White" },
  { hex: "#c8ced8", name: "Light gray" },
  { hex: "#7b8494", name: "Gray" },
  { hex: "#0b1220", name: "Black" },
  { hex: "#e5484d", name: "Red" },
  { hex: "#ff8a3d", name: "Orange" },
  { hex: "#ffd23f", name: "Yellow" },
  { hex: "#8a5a2b", name: "Brown" },
  { hex: "#3fbf6b", name: "Green" },
  { hex: "#0e7a4a", name: "Dark green" },
  { hex: "#3ec7e0", name: "Cyan" },
  { hex: "#2563eb", name: "Blue" },
  { hex: "#1e3a8a", name: "Navy" },
  { hex: "#8b5cf6", name: "Purple" },
  { hex: "#ec4899", name: "Magenta" },
  { hex: "#ffb3c7", name: "Pink" },
] as const;

export const PIXEL_COLORS: readonly string[] = PALETTE.map((c) => c.hex);

/** [x, y, color, name of whoever placed it] */
export type PixelTuple = [number, number, string, string];

export type WallResponse = {
  /** Highest placement id included; pass it back as ?since= to get only newer pixels. */
  cursor: number;
  pixels: PixelTuple[];
  /** Too many changes to send as a diff; fetch the whole wall again. */
  reset?: boolean;
};

// Cooldowns travel as "ms left" rather than a timestamp, so a phone with a wrong clock still counts down right.
export type PlaceResult =
  | { ok: true; waitMs: number }
  | { ok: false; error: string; waitMs?: number; signIn?: boolean };

export type PixelMe = { name: string | null; waitMs: number };
