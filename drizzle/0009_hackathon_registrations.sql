CREATE TABLE "hackathon_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"program" text NOT NULL,
	"year" text NOT NULL,
	"experience" text NOT NULL,
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dietary" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hackathon_registrations" ADD CONSTRAINT "hackathon_registrations_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hackathon_registrations_player_idx" ON "hackathon_registrations" USING btree ("player_id");