"use client";

import { useActionState, useState } from "react";
import { resetPlayerPasswordAction } from "@/lib/ctf/actions";
import type { FormState } from "@/lib/form";
import { FormMessage, input } from "@/components/form-ui";
import { btnGhost, btnPrimary, btnSmall } from "./styles";

const WORDS = ["knight", "castle", "shield", "falcon", "dragon", "lantern", "tower", "ember"];

/** Easy to read out loud: "falcon-4821". */
function tempPassword() {
  const [a, b] = crypto.getRandomValues(new Uint32Array(2));
  return `${WORDS[a % WORDS.length]}-${String(b % 10_000).padStart(4, "0")}`;
}

/** "Reset password" button on a player row; opens a small form underneath it. */
export function ResetPassword({ email, name }: { email: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(resetPlayerPasswordAction, {});
  const [password, setPassword] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setPassword(tempPassword());
          setOpen(true);
        }}
        className={`${btnGhost} ${btnSmall}`}
      >
        Reset password
      </button>
    );
  }

  return (
    <form action={action} className="grid basis-full gap-3 rounded-2xl bg-mist p-4 ring-1 ring-ink/10">
      <input type="hidden" name="email" value={email} />
      <label htmlFor={`pw-${email}`} className="text-sm font-medium">
        New password for <strong>{name}</strong>. Tell them in person, then they can sign in with it.
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id={`pw-${email}`}
          name="password"
          required
          minLength={8}
          maxLength={100}
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${input} !w-auto min-w-0 flex-1 bg-paper font-mono`}
        />
        <button type="button" onClick={() => setPassword(tempPassword())} className={`${btnGhost} ${btnSmall} !min-h-12 bg-paper`}>
          New one
        </button>
      </div>
      <FormMessage state={state} />
      <div className="flex flex-wrap gap-2">
        {!state.ok && (
          <button type="submit" disabled={pending} className={`${btnPrimary} ${btnSmall}`}>
            {pending ? "Saving…" : "Set password"}
          </button>
        )}
        <button type="button" onClick={() => setOpen(false)} className={`${btnGhost} ${btnSmall} bg-paper`}>
          {state.ok ? "Done" : "Cancel"}
        </button>
      </div>
    </form>
  );
}
