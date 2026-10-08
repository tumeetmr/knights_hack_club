import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// drizzle-kit doesn't read .env.local on its own; reuse Next's loader.
loadEnvConfig(process.cwd());

// Neon recommends a direct (non-pooled) connection for schema changes. Vercel's Neon
// integration provides it as DATABASE_URL_UNPOOLED; fall back to DATABASE_URL otherwise.
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL (or DATABASE_URL_UNPOOLED) in .env.local");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
});
