import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** One row (id = 1) holding the contest window and kill switch. */
export const contest = pgTable("contest", {
  id: integer("id").primaryKey().default(1),
  title: text("title").notNull().default("Knights Hack CTF"),
  startAt: timestamp("start_at", { withTimezone: true }),
  endAt: timestamp("end_at", { withTimezone: true }),
  paused: boolean("paused").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull().default("Misc"),
  description: text("description").notNull().default(""),
  hint: text("hint").notNull().default(""),
  points: integer("points").notNull().default(100),
  flag: text("flag").notNull(),
  /** Admin-only note: where the flag is hidden on the site. */
  location: text("location").notNull().default(""),
  published: boolean("published").notNull().default(false),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Contest = typeof contest.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
