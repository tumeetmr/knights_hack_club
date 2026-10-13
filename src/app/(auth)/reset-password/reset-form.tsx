"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/form";
import { FormMessage, label } from "@/components/form-ui";
import { submitBtn } from "@/components/auth/auth-panel";
import { PasswordInput } from "@/components/auth/password-input";
import { resetPasswordAction } from "@/lib/auth/actions";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(resetPasswordAction, {});
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className={label}>New password</label>
        <PasswordInput id="password" name="password" required autoFocus minLength={8} maxLength={100} autoComplete="new-password" placeholder="8+ characters" />
      </div>
      <div>
        <label htmlFor="confirm" className={label}>Repeat new password</label>
        <PasswordInput id="confirm" name="confirm" required minLength={8} maxLength={100} autoComplete="new-password" />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className={submitBtn}>
        {pending ? "Saving…" : "Save and sign in"}
      </button>
    </form>
  );
}
