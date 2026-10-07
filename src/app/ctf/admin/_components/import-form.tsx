"use client";

import { useActionState, useState } from "react";
import { importChallengesAction, type FormState } from "@/lib/ctf/actions";
import { FormMessage } from "./form-message";
import { btnGhost, btnPrimary, btnSmall, input, label } from "./styles";

const EXAMPLE = `[
  {
    "title": "View the source",
    "category": "Web",
    "points": 50,
    "description": "Something's hiding on our homepage.",
    "hint": "Right-click is your friend.",
    "location": "HTML comment in the footer",
    "flag": "KH{view_source_ok}",
    "published": true
  },
  {
    "title": "Robots only",
    "category": "Web",
    "points": 100,
    "description": "Some pages aren't meant for search engines."
  }
]`;

export function ImportForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(importChallengesAction, {});
  const [json, setJson] = useState(state.values?.json ?? "");

  return (
    <form action={action} className="grid gap-4">
      <div>
        <label htmlFor="json" className={label}>Challenges (JSON list)</label>
        <textarea
          id="json"
          name="json"
          rows={14}
          value={json}
          onChange={(e) => setJson(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder={EXAMPLE}
          className={`${input} font-mono text-sm`}
        />
      </div>
      <FormMessage state={state} />
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="submit" disabled={pending || !json.trim()} className={btnPrimary}>
          {pending ? "Importing…" : "Import challenges"}
        </button>
        <button type="button" onClick={() => setJson(EXAMPLE)} className={`${btnGhost} ${btnSmall} !min-h-12`}>
          Fill in an example
        </button>
      </div>
    </form>
  );
}
