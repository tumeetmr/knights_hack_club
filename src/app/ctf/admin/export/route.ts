import { listChallenges } from "@/lib/ctf/queries";
import { isAdmin } from "@/lib/ctf/session";

/** Downloads every challenge, flags included, in the same shape the importer reads. */
export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const list = await listChallenges();
  const body = JSON.stringify(
    list.map(({ title, category, points, description, hint, url, location, flag, published }) => ({
      title, category, points, description, hint, url, location, flag, published,
    })),
    null,
    2,
  );
  return new Response(body, {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="ctf-challenges-${new Date().toISOString().slice(0, 10)}.json"`,
      "cache-control": "no-store",
    },
  });
}
