"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { scratchProjects } from "@/db/schema";
import { getStudent } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/ctf/session";
import { rawValues, toId, type FormState } from "@/lib/form";
import { tooMany } from "@/lib/rate-limit";
import { MAX_PROJECTS_PER_STUDENT, parseScratchId } from "./link";
import { lookupScratchProject } from "./lookup";

const refreshPublic = () => {
  revalidatePath("/scratch");
  revalidatePath("/scratch/submit");
  revalidatePath("/ctf/admin/scratch");
};

export async function submitProjectAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = rawValues(fd);
  const student = await getStudent();
  if (!student) return { error: "Sign in to submit your project.", values };
  if (tooMany(`scratch:${student.id}`, 10, 600_000)) {
    return { error: "Too many tries. Wait a few minutes and try again.", values };
  }

  const scratchId = parseScratchId(values.link ?? "");
  if (!scratchId) {
    return { error: "That doesn't look like a Scratch project link. It should look like scratch.mit.edu/projects/123456789.", values };
  }

  const db = await getDb();
  const [{ mine }] = await db
    .select({ mine: count() })
    .from(scratchProjects)
    .where(eq(scratchProjects.playerId, student.id));
  if (mine >= MAX_PROJECTS_PER_STUDENT) {
    return { error: `You can submit up to ${MAX_PROJECTS_PER_STUDENT} projects. Remove one below first.`, values };
  }

  const [existing] = await db
    .select({ id: scratchProjects.id })
    .from(scratchProjects)
    .where(eq(scratchProjects.scratchId, scratchId));
  if (existing) return { error: "That project has already been submitted.", values };

  const found = await lookupScratchProject(scratchId);
  if (found.status === "missing") {
    return {
      error: "Scratch can't find that project. Open it in Scratch, click Share, then paste the link again.",
      values,
    };
  }

  const title =
    (values.title ?? "").trim().slice(0, 80) || (found.status === "ok" ? found.title.trim().slice(0, 80) : "") || "My Scratch game";
  const description = (values.description ?? "").trim().slice(0, 300);

  const inserted = await db
    .insert(scratchProjects)
    .values({
      scratchId,
      playerId: student.id,
      title,
      description,
      scratchAuthor: found.status === "ok" ? found.author : "",
    })
    .onConflictDoNothing()
    .returning({ id: scratchProjects.id });
  if (inserted.length === 0) return { error: "That project has already been submitted.", values };

  refreshPublic();
  return { ok: "Submitted! An exec member will approve it, then it shows up in the gallery." };
}

/** Students can remove their own submissions. */
export async function deleteMyProjectAction(fd: FormData) {
  const student = await getStudent();
  const id = toId(fd.get("id"));
  if (!student || !id) return;
  const db = await getDb();
  await db.delete(scratchProjects).where(and(eq(scratchProjects.id, id), eq(scratchProjects.playerId, student.id)));
  refreshPublic();
}

// --- Admin ---------------------------------------------------------------

export async function setProjectApprovedAction(fd: FormData) {
  await requireAdmin();
  const id = toId(fd.get("id"));
  if (!id) return;
  const db = await getDb();
  await db
    .update(scratchProjects)
    .set({ approved: fd.get("approved") === "true" })
    .where(eq(scratchProjects.id, id));
  refreshPublic();
}

export async function approveAllProjectsAction() {
  await requireAdmin();
  const db = await getDb();
  await db.update(scratchProjects).set({ approved: true }).where(eq(scratchProjects.approved, false));
  refreshPublic();
}

export async function deleteProjectAction(fd: FormData) {
  await requireAdmin();
  const id = toId(fd.get("id"));
  if (!id) return;
  const db = await getDb();
  await db.delete(scratchProjects).where(eq(scratchProjects.id, id));
  refreshPublic();
}
