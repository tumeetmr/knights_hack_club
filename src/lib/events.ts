import { CONTACT_EMAIL, DISCORD_URL, JOIN_FORM_URL } from "@/lib/links";

export const CAMPUS = "Niagara College Welland Campus";
export const CAMPUS_ADDRESS = "300 Woodlawn Rd, Welland, ON L3C 7L3";

export type AgendaItem = { time: string; title: string; body?: string };

export type EventLink = {
  label: string;
  href: string;
  note?: string;
  /** Heading the link is listed under on the event page; ungrouped links go under "Links". */
  group?: string;
};

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
      { group: "Get ready", label: "Register for the CTF", href: "/register?next=/ctf", note: "Takes a minute, do it before you arrive" },
      { group: "Play", label: "Play the CTF", href: "/ctf", note: "Challenges, flags and the live leaderboard" },
      { group: "Play", label: "Play Vault Crackers", href: "/games", note: "Team up on your phone and crack code puzzles" },
      { group: "Join the club", label: "Become a member", href: JOIN_FORM_URL, note: "The 2-minute club registration form" },
      { group: "Join the club", label: "Join our Discord", href: DISCORD_URL, note: "Reminders, teammates and questions" },
    ],
  },
  {
    month: "Nov",
    date: "Nov 2",
    time: "Mon · 1:00 – 3:00 PM",
    // Daylight saving ends Nov 1, so this one is EST (-05:00).
    start: "2026-11-02T13:00:00-05:00",
    end: "2026-11-02T15:00:00-05:00",
    place: "Room M114 (Merritt)",
    title: "Scratch: Make Your First Game",
    body: "A beginner-friendly, hands-on intro to coding with Scratch's visual blocks. Build your own game, then turn a Knights Hack button into a tap-to-open NFC link. No experience needed.",
    kind: "Workshop",
    slug: "scratch-workshop",
    agenda: [
      {
        time: "1:00 PM",
        title: "Doors open & sign-in",
        body: "Grab a seat, say hi to the exec team, then log into Scratch and the Knights Hack site on your laptop.",
      },
      {
        time: "1:05 PM",
        title: "Scratch basics",
        body: "A quick tour of the stage, sprites and coding blocks. We live-build a cat that moves, talks and repeats, covering events, motion, loops and if-blocks.",
      },
      {
        time: "1:20 PM",
        title: "Game 1: Catch the Stars",
        body: "The easiest possible game. Learn variables, random numbers and touching as you catch falling stars and keep score.",
      },
      {
        time: "1:35 PM",
        title: "Game 2: Flappy Bird",
        body: "The big build. Add gravity, flap on a key press, dodge pipes and count your score.",
      },
      {
        time: "2:05 PM",
        title: "Build your own",
        body: "Remix Catch or Flappy, or make something totally new with your own sprites, sounds and rules. The exec team walks around to help.",
      },
      {
        time: "2:30 PM",
        title: "Share to the website",
        body: "Click Share in Scratch, then paste your project link on the Knights Hack site so we can showcase it in our gallery.",
      },
      {
        time: "2:35 PM",
        title: "NFC buttons",
        body: "Stick an NFC tag on the back of your button and link it to your project. Tap it with a phone to open your game. Extra buttons available for newcomers.",
      },
      {
        time: "2:45 PM",
        title: "Demos",
        body: "Volunteers show their games on the projector. Share what you built and what was tricky. Everyone cheers.",
      },
    ],
    links: [
      { group: "Get ready", label: "Open Scratch", href: "https://scratch.mit.edu", note: "Free and web-based, make an account before you arrive" },
      { group: "Workshop", label: "Workshop package", href: "/scratch/package", note: "Download the example games and the block cheat sheet" },
      { group: "Workshop", label: "Submit your project", href: "/scratch/submit", note: "Paste your Scratch share link to join the gallery" },
      { group: "Workshop", label: "Scratch gallery", href: "/scratch", note: "Play what everyone built" },
      { group: "Join the club", label: "Become a member", href: JOIN_FORM_URL, note: "The 2-minute club registration form" },
      { group: "Join the club", label: "Join our Discord", href: DISCORD_URL, note: "Reminders, teammates and questions" },
    ],
  },
  {
    month: "Nov",
    date: "Nov 13",
    time: "Fri · 11:30 AM – 1:30 PM",
    // Still EST (-05:00); daylight saving ended Nov 1.
    start: "2026-11-13T11:30:00-05:00",
    end: "2026-11-13T13:30:00-05:00",
    place: "Room M215",
    title: "Vibe Coding, Showcase & Portfolio Day",
    body: "Three events in one afternoon. Vibe code a small project with AI, put your GitHub and portfolio online, then show off what you made to fellow students. No experience needed.",
    kind: "Workshop",
    slug: "vibe-coding",
    agenda: [
      {
        time: "11:30 AM",
        title: "Doors open & sign-in",
        body: "Grab a seat, say hi to the exec team and get your laptop online. Free AI coding tools are all you need.",
      },
      {
        time: "11:40 AM",
        title: "Vibe coding 101",
        body: "What vibe coding is, how to write a good prompt and how to steer an AI when it goes off track. Live demo from the exec team.",
      },
      {
        time: "11:55 AM",
        title: "Build your project",
        body: "Pick an idea (a personal site, a small game, a tool you wish existed) and build it with AI. The exec team walks around to help you get unstuck.",
      },
      {
        time: "12:35 PM",
        title: "GitHub & portfolio workshop",
        body: "Create a GitHub account, push your project and publish it as a simple online portfolio you can link on a resume.",
      },
      {
        time: "1:05 PM",
        title: "Project & Startup Showcase",
        body: "Volunteers present their project, startup or idea on the projector and get questions and feedback from fellow students. Everyone cheers.",
      },
      {
        time: "1:25 PM",
        title: "Wrap-up",
        body: "Next events, where to find us on Discord and how to pitch for the next showcase.",
      },
    ],
    links: [
      { group: "Get ready", label: "Create a GitHub account", href: "https://github.com/signup", note: "Free, do it before you arrive to save time" },
      { group: "Get ready", label: "Pitch your project", href: `mailto:${CONTACT_EMAIL}?subject=Knights%20Hack%20Showcase`, note: "Want to present? Email us and we'll save you a spot" },
      { group: "Free AI tools for students", label: "GitHub Student Developer Pack", href: "https://education.github.com/pack", note: "Verify with your college email. Includes free GitHub Copilot" },
      { group: "Free AI tools for students", label: "Cursor for Students", href: "https://cursor.com/students", note: "Free Pro plan for verified students" },
      { group: "Free AI tools for students", label: "Google Gemini for Students", href: "https://gemini.google/students/", note: "Free Google AI Pro plan with a student email" },
      { group: "Free AI tools for students", label: "Perplexity for Students", href: "https://www.perplexity.ai/education", note: "Free Pro access for students" },
      { group: "Free AI tools for students", label: "ChatGPT", href: "https://chatgpt.com", note: "The free plan is plenty for this workshop" },
      { group: "Free AI tools for students", label: "Claude", href: "https://claude.ai", note: "The free plan is plenty for this workshop" },
      { group: "Join the club", label: "Become a member", href: JOIN_FORM_URL, note: "The 2-minute club registration form" },
      { group: "Join the club", label: "Join our Discord", href: DISCORD_URL, note: "Reminders, teammates and questions" },
    ],
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
