CREATE TABLE "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text DEFAULT 'Misc' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"hint" text DEFAULT '' NOT NULL,
	"points" integer DEFAULT 100 NOT NULL,
	"flag" text NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contest" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"title" text DEFAULT 'Knights Hack CTF' NOT NULL,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"paused" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
