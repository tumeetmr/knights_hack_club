import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Tables come from the SQL files in drizzle/, applied with `bun run db:migrate`.
// Don't use db:push on the live database: it skips the migration log. The app
// only seeds the single contest row (id = 1) that the admin settings update.
const g = globalThis as unknown as {
  __khDb?: ReturnType<typeof drizzle<typeof schema>>;
  __khReady?: Promise<void>;
};

export async function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  // Cached on globalThis so dev hot reloads don't leak connections.
  const db = (g.__khDb ??= drizzle(postgres(url, { prepare: false, max: 5 }), { schema }));
  g.__khReady ??= db
    .insert(schema.contest)
    .values({ id: 1 })
    .onConflictDoNothing()
    .then(
      () => undefined,
      (err) => {
        g.__khReady = undefined;
        throw err;
      },
    );
  await g.__khReady;
  return db;
}
