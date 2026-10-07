"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "@/lib/ctf/actions";
import { FormMessage } from "../_components/form-message";
import { btnPrimary, input, label } from "../_components/styles";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});
  return (
    <form action={action} className="grid gap-4">
      <div>
        <label htmlFor="password" className={label}>Admin password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className={input}
        />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
