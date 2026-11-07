// CTF "Blink and You'll Miss It": this page instantly redirects, and the flag is only in the headers of the
// redirect response, which browsers never show. Players need the Network tab (with "Preserve log") or curl -i.
export function GET() {
  return new Response("Redirecting you to the lobby… (nothing to see here)", {
    status: 302,
    headers: {
      location: "/ctf-lab/blink/landing",
      "x-secret-flag": "KH{redirects_hide_things}",
      "cache-control": "no-store",
    },
  });
}
