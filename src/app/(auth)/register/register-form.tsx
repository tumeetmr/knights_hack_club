"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/form";
import { FormMessage, input, label } from "@/components/form-ui";
import { submitBtn } from "@/components/auth/auth-panel";
import { PasswordInput } from "@/components/auth/password-input";
import { registerAction } from "@/lib/auth/actions";

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(registerAction, {});
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="name" className={label}>Display name</label>
        <input id="name" name="name" required minLength={2} maxLength={40} autoComplete="name" defaultValue={state.values?.name} placeholder="Shown on leaderboards and the Pixel Wall" className={input} />
      </div>
      <div>
        <label htmlFor="email" className={label}>Email</label>
        <input id="email" name="email" type="email" required maxLength={120} autoComplete="email" defaultValue={state.values?.email} placeholder="you@ncstudents.niagaracollege.ca" className={input} />
      </div>
      <div>
        <label htmlFor="password" className={label}>Password</label>
        <PasswordInput id="password" name="password" required minLength={8} maxLength={100} autoComplete="new-password" placeholder="8+ characters" />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className={submitBtn}>
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
