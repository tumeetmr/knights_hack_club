import { z } from "zod";
import { FLAG_PATTERN, generateFlag } from "./flag";

const text = (max: number, label: string) =>
  z.string().max(max, `${label} is too long (${max} characters max)`).optional().transform((v) => v?.trim() ?? "");

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(80, "Title is too long (80 characters max)"),
  category: text(30, "Category").transform((v) => v || "Misc"),
  description: text(2000, "Description"),
  hint: text(500, "Hint"),
  location: text(500, "Hiding-spot note"),
  points: z.coerce
    .number("Points must be a number")
    .int("Points must be a whole number")
    .min(1, "Points must be at least 1")
    .max(10000, "Points can't exceed 10000"),
  flag: text(120, "Flag"),
  published: z.boolean(),
});

export type ChallengeInput = Omit<z.infer<typeof schema>, "flag"> & { flag: string };

/**
 * Validates one challenge from a form or an import file. A blank flag becomes
 * `blankFlag` (pass the current flag when editing, omit to auto-generate).
 */
export function parseChallenge(
  raw: Record<string, unknown>,
  blankFlag?: string,
): { data: ChallengeInput } | { error: string } {
  const result = schema.safeParse({
    ...raw,
    points: raw.points === undefined || raw.points === "" ? 100 : raw.points,
    published: raw.published === true || raw.published === "on" || raw.published === "true",
  });
  if (!result.success) return { error: result.error.issues[0].message };

  const flag = result.data.flag || blankFlag || generateFlag();
  if (!FLAG_PATTERN.test(flag)) {
    return { error: "Flag must look like KH{something} with no spaces or extra braces" };
  }
  return { data: { ...result.data, flag } };
}
