"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/ctf/actions";
import type { FormState } from "@/lib/form";
import { FormMessage, input, label } from "@/components/form-ui";
import { btnPrimary } from "../_components/styles";

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
