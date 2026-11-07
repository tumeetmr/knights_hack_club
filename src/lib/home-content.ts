// Copy for the landing page sections. Events live in events.ts.
import { CAMPUS } from "@/lib/events";

/** The club's pipeline, from never-coded to hackathon-ready. */
export const path = [
  {
    step: "01",
    title: "Learn to program",
    body: "Beginner workshops start with Scratch's visual blocks. No experience needed, and no laptop skills assumed.",
  },
  {
    step: "02",
    title: "Manage your code",
    body: "Get on GitHub, save and share your work, and publish a simple online portfolio you can link on a resume.",
  },
  {
    step: "03",
    title: "Build with AI",
    body: "Learn to vibe code: describe an idea, build it with AI coding tools and learn to steer them when they go wrong.",
  },
  {
    step: "04",
    title: "Go live",
    body: "Present your project at a showcase, then team up and ship it at our end-of-term mini hackathon.",
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

export const faqs = [
  {
    q: "When and where do events happen?",
    a: `Every event is at the ${CAMPUS}. Next up is Vibe Coding, Showcase & Portfolio Day on Friday, Nov 13 from 11:30 AM to 1:30 PM in Room M215. Exact dates, times and rooms for the rest are posted here and on Discord a week before each event.`,
  },
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
