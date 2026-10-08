"use client";

import { useState, type ComponentProps } from "react";
import { input } from "../../_components/form-ui";

/** Password field with a Show/Hide toggle, so typos on a phone keyboard are easy to spot. */
export function PasswordInput(props: Omit<ComponentProps<"input">, "type" | "className">) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={shown ? "text" : "password"} className={`${input} pr-20`} />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-pressed={shown}
        aria-label={shown ? "Hide password" : "Show password"}
        className="absolute right-1.5 top-1/2 min-h-10 -translate-y-1/2 rounded-lg px-3 text-sm font-bold text-ink/70 transition hover:bg-ink/5 hover:text-ink"
      >
        {shown ? "Hide" : "Show"}
      </button>
    </div>
  );
}
