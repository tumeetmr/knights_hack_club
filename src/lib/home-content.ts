// Copy for the landing page sections. Events live in events.ts.
import { CAMPUS } from "@/lib/events";

export const pillars = [
  {
    label: "Learn",
    title: "Code from zero.",
    kicker: "Workshops",
    body: "Never written a line of code? Perfect. Hands-on workshops start with Scratch and build up from there. No experience needed.",
    snippet: "when flag clicked\n  say \"Hello, NC!\"",
  },
  {
    label: "Vibe",
    title: "Vibe code with AI.",
    kicker: "AI-assisted",
    body: "Experiment with AI-assisted coding tools and turn an idea into a working personal project in a single session.",
    snippet: "> build me a campus\n  study-room finder",
  },
  {
    label: "Build",
    title: "Ship real projects.",
    kicker: "Showcase & hack",
    body: "Team up to prototype solutions to real student and campus problems, then show them off at our showcases and hackathon.",
    snippet: "git commit -m \"v1 🚀\"\ngit push origin main",
  },
];

export const team: { role: string; name: string; body: string; photo?: string }[] = [
  {
    role: "President",
    name: "Nomuun Ankhbayar",
    photo: "/profiles/nomuun.jpg",
    body: "Plans and hosts meetings and events, and is the club's main contact with NCSAC.",
  },
  {
    role: "Vice President",
    name: "Tumenbayar Enkhbat",
    photo: "/profiles/tumenbayar.jpg",
    body: "Co-hosts meetings, co-organizes events and leads club marketing.",
  },
  {
    role: "Secretary / Treasurer",
    name: "Jack Torrance",
    photo: "/profiles/jack.jpg",
    body: "Runs agendas, attendance and minutes, and keeps members updated on the budget.",
  },
];

export const tickerItems = [
  ["Build a game", "Not just homework"],
  ["Push to GitHub", "Not to next week"],
  ["Pair program", "Not solo struggle"],
  ["Vibe code", "Not boilerplate"],
  ["Meet your crew", "Not a login screen"],
  ["Ship a project", "Not an excuse"],
];

export const faqs = [
  {
    q: "Do I need any coding experience?",
    a: "None at all. Workshops start with Scratch and build up from there, and first-timers and seasoned devs build side by side.",
  },
  {
    q: "Who can join?",
    a: "Membership is open to every Niagara College student, regardless of program, background or experience.",
  },
  {
    q: "How do I become a member?",
    a: "Fill out the registration form. It takes about 2 minutes, gets you on the member list and means you'll hear about the next event.",
  },
  {
    q: "Where can I chat with other members?",
    a: "On our Discord. Hop in to ask questions, find teammates and get event reminders. You don't need to be registered to join.",
  },
  {
    q: "When and where do events happen?",
    a: `Every event is at the ${CAMPUS}. Our first one, the Club Launch, is Thursday, Oct 8 from 2:00 to 3:50 PM, outside the Core. Exact dates, times and rooms for the rest are posted here and on Discord a week before each event.`,
  },
  {
    q: "What's the CTF?",
    a: "A capture-the-flag contest for members. Register on the CTF page, solve challenges to find hidden flags, and climb the live leaderboard. No experience needed, and every challenge is beginner-friendly.",
  },
  {
    q: "Can I show off my own project or startup?",
    a: "Yes, that's what our two showcases are for. Email us to pitch it and we'll save you a spot.",
  },
  {
    q: "Who runs the club?",
    a: "Knights Hack is a student club of the Niagara College Student Administrative Council (NCSAC), run by a three-person student exec team.",
  },
];
