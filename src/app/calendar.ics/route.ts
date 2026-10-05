import { calStamp, eventLocation, scheduled } from "../events";

export const dynamic = "force-static";

// Escape text per RFC 5545: backslash, semicolon, comma and newlines.
const esc = (text: string) => text.replace(/[\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

export function GET() {
  const now = calStamp(new Date().toISOString());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Knights Hack Club//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Knights Hack Club",
    ...scheduled.flatMap((e) => [
      "BEGIN:VEVENT",
      `UID:${calStamp(e.start)}-${e.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}@knightshack`,
      `DTSTAMP:${now}`,
      `DTSTART:${calStamp(e.start)}`,
      `DTEND:${calStamp(e.end)}`,
      `SUMMARY:${esc(`Knights Hack: ${e.title}`)}`,
      `DESCRIPTION:${esc(e.body)}`,
      `LOCATION:${esc(eventLocation(e))}`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="knights-hack.ics"',
    },
  });
}
