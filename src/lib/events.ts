import { DISCORD_URL, JOIN_FORM_URL } from "@/lib/links";

export const CAMPUS = "Niagara College Welland Campus";
export const CAMPUS_ADDRESS = "300 Woodlawn Rd, Welland, ON L3C 7L3";

export type AgendaItem = { time: string; title: string; body?: string };

export type EventLink = { label: string; href: string; note?: string };

export type ClubEvent = {
  /** Gives the event its own detail page at /events/[slug]. */
  slug?: string;
  month: string;
  /** Set once the exact day is confirmed; otherwise the card shows the month. */
  date?: string;
  time: string;
  /** ISO start/end with UTC offset; needed for the add-to-calendar links. */
  start?: string;
  end?: string;
  /** Spot on campus; rooms, dates and times are announced a week before each event. */
  place?: string;
  title: string;
  body: string;
  kind: string;
  agenda?: AgendaItem[];
  links?: EventLink[];
};

export const events: ClubEvent[] = [
  {
    month: "Oct",
    date: "Oct 8",
    time: "Thu · 2:00 – 3:50 PM",
    start: "2026-10-08T14:00:00-04:00",
    end: "2026-10-08T15:50:00-04:00",
    place: "Outside the Core",
    title: "Club Launch & Meet-and-Greet",
    body: "Meet students into coding and tech, play coding games and find your people. Members and non-members welcome.",
    kind: "Social",
    slug: "club-launch",
    agenda: [
      {
        time: "2:00 PM",
        title: "Doors open & sign-in",
        body: "Grab a name tag, say hi to the exec team and register as a member if you haven't yet.",
      },
      {
        time: "2:15 PM",
        title: "Welcome to Knights Hack",
        body: "Who we are, what's planned for the fall and how to get involved.",
      },
      {
        time: "2:30 PM",
        title: "Meet-and-greet",
        body: "Quick icebreakers to find people with the same interests, from total beginners to seasoned devs.",
      },
      {
        time: "2:50 PM",
        title: "CTF kickoff",
        body: "Register for the Knights Hack CTF and race to capture your first flags. Bring a laptop or phone.",
      },
      {
        time: "3:25 PM",
        title: "Fun games",
        body: "Scan the QR code and play Vault Crackers with your phone. Team up with someone new and crack code puzzles together, no experience needed.",
      },
      {
        time: "3:40 PM",
        title: "Wrap-up",
        body: "CTF leaderboard check-in, next steps and where to find us on Discord.",
      },
    ],
    links: [
      { label: "Play the CTF", href: "/ctf", note: "Challenges, flags and the live leaderboard" },
      { label: "Play Vault Crackers", href: "/games", note: "Team up on your phone and crack code puzzles" },
      { label: "Register for the CTF", href: "/register?next=/ctf", note: "Takes a minute, do it before you arrive" },
      { label: "Become a member", href: JOIN_FORM_URL, note: "The 2-minute club registration form" },
      { label: "Join our Discord", href: DISCORD_URL, note: "Reminders, teammates and questions" },
    ],
  },
  {
    month: "Oct",
    time: "Date & time TBA",
    title: "Scratch: Make Your First Game",
    body: "A beginner-friendly, hands-on intro to programming concepts. Walk out with a game you built yourself.",
    kind: "Workshop",
  },
  {
    month: "Oct",
    time: "Date & time TBA",
    title: "Vibe Coding",
    body: "Try AI-assisted coding in a relaxed setting and build a small personal project from scratch.",
    kind: "Workshop",
  },
  {
    month: "Nov",
    time: "Date & time TBA",
    title: "Student Project & Startup Showcase",
    body: "Present your project, startup or idea and get questions and feedback from fellow students.",
    kind: "Showcase",
  },
  {
    month: "Nov",
    time: "Date & time TBA",
    title: "Build Something for Campus",
    body: "Brainstorm and prototype a small solution to a real student or campus problem, together.",
    kind: "Build",
  },
  {
    month: "Dec",
    time: "Date & time TBA",
    title: "GitHub & Portfolio Workshop",
    body: "Learn how to present your code and build an online portfolio that supports school and career goals.",
    kind: "Workshop",
  },
  {
    month: "Dec",
    time: "Date & time TBA",
    title: "Project & Startup Showcase #2",
    body: "Round two: share what you've built and connect with students who have different skills.",
    kind: "Showcase",
  },
  {
    month: "Dec",
    time: "Date & time TBA",
    title: "Mini Hackathon: End of Term",
    body: "Form a team, apply everything you learned and ship a small project against the clock.",
    kind: "Hackathon",
  },
];

/** Events with a confirmed start and end, ready to put on a calendar. */
export const scheduled = events.filter(
  (e): e is ClubEvent & { start: string; end: string } => Boolean(e.start && e.end),
);

export const eventPath = (e: ClubEvent) => (e.slug ? `/events/${e.slug}` : undefined);

/** The next event with its own page that hasn't finished yet, for the landing banner. */
export const upcomingEvent = (now = Date.now()) =>
  events.find((e) => e.slug && (!e.end || new Date(e.end).getTime() > now));

/** UTC timestamp in iCalendar / Google Calendar form, e.g. 20261008T180000Z. */
export const calStamp = (iso: string) =>
  new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export const eventLocation = (e: ClubEvent) =>
  [e.place, CAMPUS, CAMPUS_ADDRESS].filter(Boolean).join(", ");

export function googleCalendarUrl(e: ClubEvent & { start: string; end: string }) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Knights Hack: ${e.title}`,
    dates: `${calStamp(e.start)}/${calStamp(e.end)}`,
    details: e.body,
    location: eventLocation(e),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
