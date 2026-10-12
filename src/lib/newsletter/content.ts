import { z } from "zod";
import { DISCORD_URL } from "@/lib/links";

const text = (max: number) => z.string().trim().max(max);

const item = z.object({
  tag: text(30).min(1, "Every item needs a tag"),
  title: text(100).min(1, "Every item needs a title"),
  body: text(500).min(1, "Every item needs a description"),
  /** A site path ("/ctf") or a full https:// link; empty for no link. */
  href: text(300)
    .refine((v) => v === "" || v.startsWith("/") || /^https:\/\//.test(v), "Links must start with / or https://")
    .optional(),
  cta: text(40).optional(),
});

export const newsletterSchema = z.object({
  subject: text(120).min(1, "Add a subject line"),
  issue: text(40).min(1, "Add an issue name, e.g. October 2026"),
  intro: text(1000).min(1, "Add an intro"),
  now: z.array(item).min(1, "Add at least one Happening now item").max(8),
  soon: z.array(item).max(8),
});

export type NewsletterContent = z.infer<typeof newsletterSchema>;
export type NewsletterItem = NewsletterContent["now"][number];

/** First issue, used to prefill the admin form before anything has been sent. */
export const sampleNewsletter: NewsletterContent = {
  subject: "Knights Hack: Halloween CTF is live + what's coming this fall",
  issue: "October 2026",
  intro:
    "Thanks to everyone who came out to the Club Launch last Thursday outside the Core! Here's a quick look at what's live right now and what we've got lined up for the rest of the fall.",
  now: [
    {
      tag: "Recap",
      title: "Club Launch was a hit",
      body: "We met a crowd of new faces, kicked off the CTF and cracked code puzzles together in Vault Crackers. Missed it? Every event this term is beginner-friendly, so jump in at the next one.",
    },
    {
      tag: "CTF · Live",
      title: "Halloween challenges are haunting the CTF 🎃",
      body: "A spooky batch of new beginner-friendly flags just dropped: a haunted house, a graveyard, a ghost API and more, with a creepy soundtrack to match. New challenges land every week and the top 3 at the end of term win a prize.",
      href: "/ctf",
      cta: "Start hunting",
    },
    {
      tag: "Games",
      title: "Vault Crackers is open any time",
      body: "Grab a friend, open it on your phone and crack code puzzles as a team. No experience needed.",
      href: "/games",
      cta: "Play now",
    },
  ],
  soon: [
    {
      tag: "Workshop dates",
      title: "Scratch & Vibe Coding dates drop next",
      body: "Rooms and times for our first two workshops are being locked in. Watch Discord for the announcement.",
      href: DISCORD_URL,
      cta: "Get notified on Discord",
    },
    {
      tag: "Showcase",
      title: "Showcase sign-ups open in November",
      body: "Building something, or sitting on a startup idea? You'll get a few minutes to show it off and get feedback from fellow students.",
    },
  ],
};
