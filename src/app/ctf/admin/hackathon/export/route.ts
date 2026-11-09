import { isAdmin } from "@/lib/ctf/session";
import { listRegistrations } from "@/lib/hackathon/queries";

// Quote every cell, and defuse leading = + - @ so spreadsheets don't run them as formulas.
const cell = (v: string) => `"${(/^[=+\-@\t\r]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const rows = await listRegistrations();
  const header = ["name", "email", "program", "year", "experience", "interests", "dietary", "notes", "registered_at"];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [r.name, r.email, r.program, r.year, r.experience, r.interests.join("; "), r.dietary, r.notes, r.createdAt.toISOString()]
        .map(cell)
        .join(","),
    ),
  ];
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="hackathon-registrations-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
