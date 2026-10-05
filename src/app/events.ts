export const CAMPUS = "Niagara College Welland Campus";
export const CAMPUS_ADDRESS = "300 Woodlawn Rd, Welland, ON L3C 7L3";

export type ClubEvent = {
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
    body: "Meet students into coding and tech, pitch ideas for future activities and find your people. Members and non-members welcome.",
    kind: "Social",
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
