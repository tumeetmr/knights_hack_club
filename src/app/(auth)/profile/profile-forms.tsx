"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/form";
import { FormMessage, input, label } from "@/components/form-ui";
import { submitBtn } from "@/components/auth/auth-panel";
import { PasswordInput } from "@/components/auth/password-input";
import { changePasswordAction, updateNameAction } from "@/lib/auth/profile-actions";

export function NameForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateNameAction, {});
  return (
    <form action={action} className="grid gap-4">
      <div>
        <label htmlFor="name" className={label}>Display name</label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={40}
          autoComplete="name"
          defaultValue={state.values?.name ?? name}
          className={input}
        />
        <p className="mt-1.5 text-sm text-ink/55">Shown on the leaderboard and the Pixel Wall.</p>
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className={submitBtn}>
        {pending ? "Saving…" : "Save name"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePasswordAction, {});
  return (
    // Keyed on success so the fields clear once the password is changed.
    <form key={state.ok} action={action} className="grid gap-4">
      <div>
        <label htmlFor="current" className={label}>Current password</label>
        <PasswordInput id="current" name="current" required autoComplete="current-password" />
      </div>
      <div>
        <label htmlFor="password" className={label}>New password</label>
        <PasswordInput id="password" name="password" required minLength={8} maxLength={100} autoComplete="new-password" />
      </div>
      <div>
        <label htmlFor="confirm" className={label}>Repeat new password</label>
        <PasswordInput id="confirm" name="confirm" required minLength={8} maxLength={100} autoComplete="new-password" />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className={submitBtn}>
        {pending ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}
