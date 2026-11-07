import { NextRequest } from "next/server";
import { clean, flagBlock, labPage } from "../_lib/lab-page";

// CTF "Knight Login": a simulated SQL-injection login. Nothing touches a database. We show the query the
// "server" would build, then work out whether the typed text would turn the WHERE clause into something always true.
const form = (u: string) =>
  `<form class="card" method="get"><label for="username" style="font-weight:700">Username</label><input id="username" name="username" autocomplete="off" autocapitalize="off" spellcheck="false" value="${clean(u, 80)}"><label for="password" style="font-weight:700;display:block;margin-top:12px">Password</label><input id="password" name="password" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="submit">Log in</button></form>`;

/** True when the text, dropped into the query, makes the password check pass or disappear. */
function breaksOut(username: string, password: string) {
  const comment = /'\s*(--|#|\/\*)/;
  const alwaysTrue = /'\s*or\s+(?:'?(\w+)'?\s*=\s*'?\1'?|true|1)\s*(?:--|#|\/\*|$|'?\s*$)/i;
  // `admin'--` comments out the password check, but only for an account that exists.
  if (/^admin\s*'\s*(--|#|\/\*)/i.test(username) && comment.test(username)) return true;
  return alwaysTrue.test(username) || alwaysTrue.test(password) || /'\s*or\s+'?1'?\s*=\s*'?1/i.test(password);
}

export function GET(req: NextRequest) {
  const username = (req.nextUrl.searchParams.get("username") ?? "").slice(0, 80);
  const password = (req.nextUrl.searchParams.get("password") ?? "").slice(0, 80);

  const intro = `<p class="muted">Knights Hack · Staff portal</p><h1>🔐 Knight Login</h1><p>Staff only. The portal checks your name and password against its database.</p>`;
  if (!username && !password) return labPage("Knight Login", intro + form(""));

  const query = `SELECT * FROM staff\nWHERE username = '${clean(username, 80)}'\n  AND password = '${clean(password, 80)}';`;
  const shown = `<div class="card"><p class="muted" style="margin:0 0 8px">The server ran:</p><pre>${query.replace(/&#39;/g, "'")}</pre></div>`;

  if (breaksOut(username, password)) {
    return labPage(
      "Welcome, admin",
      `<h1>🔓 Logged in as admin</h1><p>The database found a matching row. Nobody checked what you typed.</p>${shown}${flagBlock("KH{quotes_break_queries}")}`,
    );
  }
  return labPage(
    "Knight Login",
    intro +
      `<p style="color:#fca5a5">No staff member matches that name and password.</p>${shown}` +
      form(username) +
      `<p class="card muted">Notice that what you type goes straight into the query, quotes and all. What if your text could change the question being asked?</p>`,
  );
}
