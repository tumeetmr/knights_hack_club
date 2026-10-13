"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/lib/form";
import { FormMessage, input, label } from "@/components/form-ui";
import { submitBtn } from "@/components/auth/auth-panel";
import { PasswordInput } from "@/components/auth/password-input";
import { loginAction } from "@/lib/auth/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className={label}>Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={state.values?.email} className={input} />
      </div>
      <div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="password" className={label}>Password</label>
          <Link href="/forgot-password" className="mb-1.5 text-sm font-medium text-knight-600 underline underline-offset-4 hover:text-ink">
            Forgot password?
          </Link>
        </div>
        <PasswordInput id="password" name="password" required autoComplete="current-password" />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className={submitBtn}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
