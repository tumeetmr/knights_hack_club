import { EVENT_DATE, EXPERIENCE, INTERESTS, labelFor } from "@/lib/hackathon/config";

export type Summary = {
  program: string;
  year: string;
  experience: string;
  interests: string[];
  dietary: string;
  notes: string;
};

/** Read-only recap of what a student submitted. Safe to render from server or client components. */
export function RegistrationSummary({ data }: { data: Summary }) {
  const rows: [string, string][] = [
    ["Program", data.program],
    ["Year", data.year],
    ["Coding experience", labelFor(EXPERIENCE, data.experience)],
    ["Interests", data.interests.length ? data.interests.map((i) => labelFor(INTERESTS, i)).join(", ") : "None picked"],
    ["Dietary needs", data.dietary || "None"],
    ["Notes", data.notes || "None"],
  ];
  return (
    <div className="rounded-3xl bg-mist p-5 ring-1 ring-ink/10 sm:p-7">
      <p className="font-mono text-xs font-medium uppercase tracking-wider text-knight-600">Your registration · {EVENT_DATE}</p>
      <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wider text-ink/50">{k}</dt>
            <dd className="mt-1 break-words font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
