"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/form";
import { FormMessage, input, label } from "@/components/form-ui";
import { submitBtn } from "@/components/auth/auth-panel";
import { useCooldown } from "@/components/auth/use-cooldown";
import { forgotPasswordAction } from "@/lib/auth/actions";
import { RESEND_SECONDS } from "@/lib/auth/cooldown";

export function ForgotForm() {
  const [cooldown, setCooldown] = useCooldown();
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const result = await forgotPasswordAction(prev, fd);
    if (result.ok) setCooldown(RESEND_SECONDS);
    return result;
  }, {});
  return (
    <form action={action} className="grid gap-4">
      <div>
        <label htmlFor="email" className={label}>Email</label>
        <input id="email" name="email" type="email" required autoFocus autoComplete="email" defaultValue={state.values?.email} className={input} />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending || cooldown > 0} className={submitBtn}>
        {pending ? "Sending…" : cooldown > 0 ? `Send another link in ${cooldown}s` : state.ok ? "Send another link" : "Send reset link"}
      </button>
    </form>
  );
}
