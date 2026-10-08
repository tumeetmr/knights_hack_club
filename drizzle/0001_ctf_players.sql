CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "solves" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"challenge_id" integer NOT NULL,
	"points" integer NOT NULL,
	"solved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "solves" ADD CONSTRAINT "solves_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solves" ADD CONSTRAINT "solves_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "players_email_idx" ON "players" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "solves_player_challenge_idx" ON "solves" USING btree ("player_id","challenge_id");--> statement-breakpoint
CREATE INDEX "solves_challenge_idx" ON "solves" USING btree ("challenge_id");