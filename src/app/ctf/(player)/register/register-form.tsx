"use client";

import { useActionState } from "react";
import { registerAction } from "@/lib/ctf/player-actions";
import type { FormState } from "@/lib/ctf/form";
import { fieldInput, fieldLabel, Notice, submitBtn } from "../_components/auth-card";

export function RegisterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(registerAction, {});
  return (
    <form action={action} className="grid gap-4">
      <div>
        <label htmlFor="name" className={fieldLabel}>Display name</label>
        <input id="name" name="name" required minLength={2} maxLength={40} autoComplete="name" defaultValue={state.values?.name} placeholder="Shown on the leaderboard" className={fieldInput} />
      </div>
      <div>
        <label htmlFor="email" className={fieldLabel}>Email</label>
        <input id="email" name="email" type="email" required maxLength={120} autoComplete="email" defaultValue={state.values?.email} placeholder="you@ncstudents.niagaracollege.ca" className={fieldInput} />
      </div>
      <div>
        <label htmlFor="password" className={fieldLabel}>Password</label>
        <input id="password" name="password" type="password" required minLength={8} maxLength={100} autoComplete="new-password" placeholder="8+ characters" className={fieldInput} />
      </div>
      <Notice error={state.error} />
      <button type="submit" disabled={pending} className={submitBtn}>
        {pending ? "Creating account…" : "Register for the CTF"}
      </button>
    </form>
  );
}
