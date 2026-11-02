/** How many projects one student can have on the site. */
export const MAX_PROJECTS_PER_STUDENT = 3;

/**
 * The project id from whatever a student pastes: a share link, the editor or embed link, or the
 * bare number. Returns null for anything else (including the unsaved scratch.mit.edu/projects/editor).
 */
export function parseScratchId(input: string): number | null {
  const text = input.trim();
  const match = /^(\d{4,12})$/.exec(text) ?? /^(?:https?:\/\/)?(?:www\.)?scratch\.mit\.edu\/projects\/(\d{4,12})(?:[/?#]|$)/i.exec(text);
  return match ? Number(match[1]) : null;
}

export const scratchUrl = (id: number) => `https://scratch.mit.edu/projects/${id}/`;
export const scratchEmbedUrl = (id: number) => `https://scratch.mit.edu/projects/${id}/embed`;
export const scratchThumbUrl = (id: number) => `https://uploads.scratch.mit.edu/get_image/project/${id}_480x360.png`;
