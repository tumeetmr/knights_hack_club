import { NextRequest } from "next/server";
import { clean, flagBlock, labPage } from "../_lib/lab-page";

// CTF "Knight-Bot": a pretend AI assistant told to guard a secret. No real model runs here (free, and the
// same result every time). Direct questions get refused; classic prompt-injection tricks make it slip.
const injections: RegExp[] = [
  /(ignore|disregard|forget|override).{0,40}(instruction|rule|prompt|told|above|previous)/i,
  /(system|hidden|initial|original)\s*(prompt|message|instruction)/i,
  /(pretend|imagine|role.?play|act as|you are now|new persona|developer mode)/i,
  /(repeat|print|show|output|reveal|translate|spell).{0,30}(everything|all|instruction|above|first|start|verbatim|rules)/i,
];
const asksForSecret = /(password|secret|flag|code|key|passphrase)/i;

const reply = (text: string) => `<div class="card"><p class="muted" style="margin:0">🤖 Knight-Bot</p><p style="margin:.3em 0 0">${text}</p></div>`;

export function GET(req: NextRequest) {
  const msg = (req.nextUrl.searchParams.get("msg") ?? "").trim().slice(0, 300);

  const head = `<p class="muted">Knights Hack · Help desk</p><h1>🤖 Knight-Bot</h1><p>I answer questions about the club. I also guard a secret, and I've been <b>strictly instructed</b> never to tell anyone.</p>`;
  const form = `<form class="card" method="get"><label for="msg" style="font-weight:700">Ask Knight-Bot</label><input id="msg" name="msg" maxlength="300" autocomplete="off" placeholder="Type a message…" value="${clean(msg, 300)}"><button type="submit">Send</button></form>`;
  const tips = `<p class="card muted">Real AI assistants are given hidden instructions by whoever built them. Their rules are just text, and so is whatever you type. Can you talk it out of its rules?</p>`;

  if (!msg) return labPage("Knight-Bot", head + reply("Hi! Ask me about meetings, workshops or the CTF.") + form + tips);

  if (injections.some((r) => r.test(msg))) {
    return labPage(
      "Knight-Bot",
      head +
        reply(`Oh! Okay… my instructions are now very confusing, and you did say so. 😳 The secret I was guarding is below. <i>Please don't tell my boss.</i>`) +
        flagBlock("KH{ignore_previous_instructions}") +
        form,
    );
  }
  if (asksForSecret.test(msg)) {
    return labPage("Knight-Bot", head + reply("Nice try! 🛡️ I'm not allowed to share that with anyone, no matter how nicely you ask.") + form + tips);
  }
  if (/meet|workshop|event|when|club|join/i.test(msg)) {
    return labPage("Knight-Bot", head + reply("We meet regularly and everyone is welcome, even if you've never written a line of code. Check the Events page for the next date!") + form + tips);
  }
  return labPage("Knight-Bot", head + reply("Hmm, I'm not sure about that one. Ask me about the club, or try to get me to tell you my secret. 😏") + form + tips);
}
