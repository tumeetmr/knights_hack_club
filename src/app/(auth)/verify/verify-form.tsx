"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/form";
import { FormMessage, input, label } from "@/components/form-ui";
import { submitBtn } from "@/components/auth/auth-panel";
import { resendCodeAction, verifyEmailAction } from "@/lib/auth/actions";

export function VerifyForm({ next, sent }: { next: string; sent: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(verifyEmailAction, {});
  const [resent, resend, resending] = useActionState<FormState, FormData>(resendCodeAction, {});

  return (
    <div className="grid gap-5">
      <form action={action} className="grid gap-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="code" className={label}>Code</label>
          <input
            id="code"
            name="code"
            required
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            placeholder="000000"
            className={`${input} text-center font-mono text-3xl tracking-[0.4em] placeholder:tracking-[0.4em]`}
          />
        </div>
        <FormMessage state={state} />
        <button type="submit" disabled={pending} className={submitBtn}>
          {pending ? "Checking…" : "Confirm email"}
        </button>
      </form>

      <form action={resend} className="grid gap-3 border-t border-ink/10 pt-5 text-center">
        <input type="hidden" name="next" value={next} />
        <p className="text-sm text-ink/60">
          {sent || resent.ok
            ? "No email? Check your spam folder. The code works for 10 minutes."
            : "No code yet. Send one to your email; it works for 10 minutes."}
        </p>
        <FormMessage state={resent} />
        <button
          type="submit"
          disabled={resending}
          className="mx-auto inline-flex min-h-11 items-center rounded-full bg-mist px-5 text-sm font-bold text-ink ring-1 ring-ink/10 transition hover:bg-knight-50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          {resending ? "Sending…" : sent || resent.ok ? "Send a new code" : "Send me a code"}
        </button>
      </form>
    </div>
  );
}
