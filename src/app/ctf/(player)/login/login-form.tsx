"use client";

import { useActionState } from "react";
import { loginPlayerAction } from "@/lib/ctf/player-actions";
import type { FormState } from "@/lib/ctf/form";
import { FormMessage, input, label } from "../../_components/form-ui";
import { submitBtn } from "../_components/auth-card";
import { PasswordInput } from "../_components/password-input";

export function PlayerLoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(loginPlayerAction, {});
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className={label}>Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={state.values?.email} className={input} />
      </div>
      <div>
        <label htmlFor="password" className={label}>Password</label>
        <PasswordInput id="password" name="password" required autoComplete="current-password" />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className={submitBtn}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-ink/60">
        Forgot your password? Ask an organizer and they&apos;ll reset it for you.
      </p>
    </form>
  );
}
