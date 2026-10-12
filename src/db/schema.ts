import { sql } from "drizzle-orm";
import { boolean, check, index, integer, jsonb, pgTable, serial, smallint, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

/** One row (id = 1) holding the contest window and kill switch. */
export const contest = pgTable(
  "contest",
  {
    id: integer("id").primaryKey().default(1),
    title: text("title").notNull().default("Knights Hack CTF"),
    startAt: timestamp("start_at", { withTimezone: true }),
    endAt: timestamp("end_at", { withTimezone: true }),
    paused: boolean("paused").notNull().default(false),
  },
  (t) => [check("contest_single_row", sql`${t.id} = 1`)],
);

export const challenges = pgTable(
  "challenges",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    category: text("category").notNull().default("Misc"),
    description: text("description").notNull().default(""),
    hint: text("hint").notNull().default(""),
    /** Where students go to hunt for the flag: a site path ("/about") or an https:// link. */
    url: text("url").notNull().default(""),
    points: integer("points").notNull().default(100),
    flag: text("flag").notNull(),
    /** Admin-only note: where the flag is hidden on the site. */
    location: text("location").notNull().default(""),
    published: boolean("published").notNull().default(false),
    position: integer("position").notNull().default(0),
  },
  (t) => [check("challenges_points_positive", sql`${t.points} > 0`)],
);

/** A registered student. Email is stored lowercase and is the login. */
export const players = pgTable(
  "players",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    /** When the student proved they own the email with a one-time code. Null = not verified. */
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    /** Set when the student opts out of club newsletters. Null = subscribed. */
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("players_email_idx").on(t.email),
    check("players_email_lowercase", sql`${t.email} = lower(${t.email})`),
  ],
);

/**
 * The one active email code per student (sending a new one replaces it). Only an HMAC of the
 * code is stored; `attempts` counts wrong guesses so a code can't be brute-forced.
 */
export const emailCodes = pgTable("email_codes", {
  playerId: integer("player_id")
    .primaryKey()
    .references(() => players.id, { onDelete: "cascade" }),
  codeHash: text("code_hash").notNull(),
  attempts: smallint("attempts").notNull().default(0),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

/**
 * One row per correct submission. `points` records what the challenge was worth right after
 * this solve, for the record only: scores use the challenge's current value (lib/ctf/scoring).
 */
export const solves = pgTable(
  "solves",
  {
    id: serial("id").primaryKey(),
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    challengeId: integer("challenge_id")
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    points: integer("points").notNull(),
    solvedAt: timestamp("solved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("solves_player_challenge_idx").on(t.playerId, t.challengeId),
    index("solves_challenge_idx").on(t.challengeId),
  ],
);

/**
 * Pixel Wall log: one row per placed pixel, newest wins. Keeping every placement gives the
 * cooldown check, the "changes since" poll cursor (id) and an end-of-term timelapse.
 */
export const pixels = pgTable(
  "pixels",
  {
    id: serial("id").primaryKey(),
    x: smallint("x").notNull(),
    y: smallint("y").notNull(),
    /** "#rrggbb", one of PIXEL_COLORS. */
    color: text("color").notNull(),
    playerId: integer("player_id").references(() => players.id, { onDelete: "set null" }),
    placedAt: timestamp("placed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("pixels_cell_idx").on(t.x, t.y, t.id),
    index("pixels_player_idx").on(t.playerId, t.id),
    check("pixels_in_grid", sql`${t.x} >= 0 and ${t.y} >= 0 and ${t.x} < 64 and ${t.y} < 64`),
  ],
);

/** Log of member newsletters sent from the admin. `content` is the issue, reused to prefill the next one. */
export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  content: jsonb("content").notNull(),
  recipients: integer("recipients").notNull(),
  failed: integer("failed").notNull().default(0),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});
