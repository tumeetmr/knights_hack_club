import "server-only";

export type ScratchLookup =
  | { status: "ok"; title: string; author: string }
  /** Scratch has no public project with this id: wrong number, or it isn't shared yet. */
  | { status: "missing" }
  /** Scratch didn't answer. We accept the project anyway; an admin checks it before it goes live. */
  | { status: "unknown" };

/** Asks Scratch whether a project exists and is shared. Their API only returns shared projects. */
export async function lookupScratchProject(id: number): Promise<ScratchLookup> {
  try {
    const res = await fetch(`https://api.scratch.mit.edu/projects/${id}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (res.status === 404) return { status: "missing" };
    if (!res.ok) return { status: "unknown" };
    const data = (await res.json()) as { title?: unknown; author?: { username?: unknown } };
    return {
      status: "ok",
      title: typeof data.title === "string" ? data.title : "",
      author: typeof data.author?.username === "string" ? data.author.username : "",
    };
  } catch {
    return { status: "unknown" };
  }
}
