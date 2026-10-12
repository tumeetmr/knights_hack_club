CREATE TABLE "newsletters" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject" text NOT NULL,
	"content" jsonb NOT NULL,
	"recipients" integer NOT NULL,
	"failed" integer DEFAULT 0 NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "unsubscribed_at" timestamp with time zone;