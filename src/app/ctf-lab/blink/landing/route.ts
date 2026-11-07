import { labPage } from "../../_lib/lab-page";

export function GET() {
  return labPage(
    "The Lobby",
    `<h1>🛗 The Lobby</h1><p>Welcome! There's nothing here.</p><p class="card muted">You were sent here in a split second. Did anything interesting happen on the way?</p><a class="btn ghost" href="/ctf-lab/blink">Go back and try again</a>`,
  );
}
