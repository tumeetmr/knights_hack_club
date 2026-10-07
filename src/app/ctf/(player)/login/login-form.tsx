"use client";

import { useActionState } from "react";
import { loginPlayerAction } from "@/lib/ctf/player-actions";
import type { FormState } from "@/lib/ctf/form";
import { fieldInput, fieldLabel, Notice, submitBtn } from "../_components/auth-card";

export function PlayerLoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(loginPlayerAction, {});
  return (
    <form action={action} className="grid gap-4">
      <div>
        <label htmlFor="email" className={fieldLabel}>Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={state.values?.email} className={fieldInput} />
      </div>
      <div>
        <label htmlFor="password" className={fieldLabel}>Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={fieldInput} />
      </div>
      <Notice error={state.error} />
      <button type="submit" disabled={pending} className={submitBtn}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
