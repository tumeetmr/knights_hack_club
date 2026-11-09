export const REGISTER_PATH = "/hackathon/register";

export const EVENT_DATE = "Nov 30";
export const DEADLINE_LABEL = "Nov 20";
/** Applications close at the end of Nov 20 (Eastern, EST = UTC-5). */
export const DEADLINE = "2026-11-20T23:59:59-05:00";
export const registrationOpen = (now = Date.now()) => now <= new Date(DEADLINE).getTime();

export const EXPERIENCE = [
  { id: "new", label: "Brand new", hint: "Never coded, and that's fine" },
  { id: "some", label: "Some experience", hint: "Classes or small projects" },
  { id: "comfortable", label: "Comfortable", hint: "I build things on my own" },
] as const;

export const YEARS = ["1st year", "2nd year", "3rd year", "Graduate / other"] as const;

export const INTERESTS = [
  { id: "web", label: "Websites & apps" },
  { id: "ai", label: "AI & vibe coding" },
  { id: "games", label: "Games" },
  { id: "security", label: "Cybersecurity" },
  { id: "data", label: "Data & automation" },
  { id: "design", label: "Design & pitching" },
] as const;

export const EXPERIENCE_IDS = EXPERIENCE.map((e) => e.id) as string[];
export const INTEREST_IDS = INTERESTS.map((i) => i.id) as string[];

export const labelFor = (list: readonly { id: string; label: string }[], id: string) =>
  list.find((x) => x.id === id)?.label ?? id;
