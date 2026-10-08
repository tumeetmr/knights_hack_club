"use client";

import { useActionState } from "react";
import { loginPlayerAction } from "@/lib/ctf/player-actions";
import type { FormState } from "@/lib/ctf/form";
import { FormMessage, input, label } from "../../_components/form-ui";
import { submitBtn } from "../_components/auth-card";

export function PlayerLoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(loginPlayerAction, {});
  return (
    <form action={action} className="grid gap-4">
      <div>
        <label htmlFor="email" className={label}>Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={state.values?.email} className={input} />
      </div>
      <div>
        <label htmlFor="password" className={label}>Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={input} />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className={submitBtn}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
