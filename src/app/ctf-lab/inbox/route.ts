import { NextRequest } from "next/server";
import { flagBlock, labPage } from "../_lib/lab-page";

// CTF "Spot the Phish": four emails, one is a phish. Urgent tone is NOT the tell here (a real one is urgent too),
// the sender domain and the link target are. Reporting the right email reveals the flag.
const emails = [
  {
    from: "Library <circulation@library.northgate.edu>",
    subject: "Reminder: 'Intro to Python' is due Friday",
    body: "Hi! Your library book is due this Friday. You can renew it online if you need more time.",
    link: "https://library.northgate.edu/renew",
    why: "Real. The sender and the link both end in northgate.edu, the school's real domain.",
  },
  {
    from: "IT Helpdesk <helpdesk@northgate.edu>",
    subject: "URGENT: your password expires in 24 hours",
    body: "Your campus password expires tomorrow. Please change it from the account page so you don't lose access to email and Wi-Fi.",
    link: "https://account.northgate.edu/password",
    why: "Real, even though it sounds urgent. Scammers love urgency, but so do real deadlines. The sender and link both belong to northgate.edu.",
  },
  {
    from: "Prof. Alvarez <no-reply@northgate-edu.share-docs.com>",
    subject: "Prof. Alvarez shared \"Midterm grades.xlsx\" with you",
    body: "Prof. Alvarez shared a file with you. Sign in with your school account to view it.",
    link: "https://northgate.edu.share-docs.com/view",
    why: "PHISH! Read the domain from the RIGHT: both addresses really belong to share-docs.com. \"northgate.edu\" is just a decoy stuck on the front.",
  },
  {
    from: "Robotics Club <president@clubs.northgate.edu>",
    subject: "Meeting moved to Thursday 5 pm",
    body: "Heads up: because of the holiday we're moving this week's meeting to Thursday in room B204. Bring a friend!",
    link: "https://clubs.northgate.edu/robotics",
    why: "Real. Both the sender and the link belong to northgate.edu.",
  },
];
const PHISH = 2;

export function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("report");
  const n = raw !== null && /^\d$/.test(raw) ? Number(raw) : -1;

  let banner = "";
  if (n === PHISH) {
    banner = `<div class="card" style="border-color:#4ade80"><p style="margin:0"><b>✅ Good catch!</b> ${emails[PHISH].why}</p>${flagBlock("KH{read_domains_right_to_left}")}</div>`;
  } else if (emails[n]) {
    banner = `<div class="card" style="border-color:#fca5a5"><p style="margin:0"><b>❌ That one is legitimate.</b> ${emails[n].why} Look again at the others.</p></div>`;
  }

  const list = emails
    .map(
      (m, i) =>
        `<div class="card"><p class="muted" style="margin:0">From: ${m.from.replace(/</g, "&lt;")}</p><p style="margin:.2em 0;font-weight:800">${m.subject}</p><p style="margin:.2em 0">${m.body}</p><p class="muted" style="margin:.4em 0">🔗 Link goes to: <code>${m.link}</code></p><a class="btn ghost" href="?report=${i}">🚩 Report as phishing</a></div>`,
    )
    .join("");

  return labPage(
    "Northgate Inbox",
    `<p class="muted">Northgate College · Student mail</p><h1>📬 Spot the Phish</h1><p>Exactly one of these four emails is a phishing attempt. Report it. Reading the sender and the link carefully matters more than how the email sounds.</p>${banner}${list}`,
  );
}
