"use client";

import { useActionState } from "react";
import { submitBtn } from "@/components/auth/auth-panel";
import { FormMessage, input, label } from "@/components/form-ui";
import type { FormState } from "@/lib/form";
import { submitProjectAction } from "@/lib/scratch/actions";

export function SubmitForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(submitProjectAction, {});
  return (
    // Keyed on success so the fields clear after a project goes in.
    <form key={state.ok} action={action} className="grid gap-4">
      <div>
        <label htmlFor="link" className={label}>Scratch project link</label>
        <input
          id="link"
          name="link"
          required
          inputMode="url"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="https://scratch.mit.edu/projects/123456789"
          defaultValue={state.values?.link ?? ""}
          className={input}
        />
      </div>
      <div>
        <label htmlFor="title" className={label}>Game title</label>
        <input
          id="title"
          name="title"
          maxLength={80}
          placeholder="Leave blank to use your Scratch title"
          defaultValue={state.values?.title ?? ""}
          className={input}
        />
      </div>
      <div>
        <label htmlFor="description" className={label}>One-line description (optional)</label>
        <textarea
          id="description"
          name="description"
          rows={2}
          maxLength={300}
          placeholder="Dodge the pipes as a flying knight!"
          defaultValue={state.values?.description ?? ""}
          className={input}
        />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className={submitBtn}>
        {pending ? "Checking with Scratch…" : "Submit project"}
      </button>
    </form>
  );
}
