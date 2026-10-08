/** Shown while the game server is unreachable. A free Render instance can take ~1 min to wake. */
export function ConnectionBanner({ connected }: { connected: boolean }) {
  if (connected) return null;
  return (
    <p
      role="status"
      className="fixed inset-x-3 bottom-3 z-50 rounded-2xl bg-amber-300 px-4 py-3 text-center text-sm font-semibold text-ink shadow-lg"
    >
      Connecting to the game server… this can take up to a minute the first time.
    </p>
  );
}
