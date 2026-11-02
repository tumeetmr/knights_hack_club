CREATE TABLE "scratch_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"scratch_id" bigint NOT NULL,
	"player_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"scratch_author" text DEFAULT '' NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scratch_projects" ADD CONSTRAINT "scratch_projects_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "scratch_projects_scratch_id_idx" ON "scratch_projects" USING btree ("scratch_id");--> statement-breakpoint
CREATE INDEX "scratch_projects_player_idx" ON "scratch_projects" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "scratch_projects_approved_idx" ON "scratch_projects" USING btree ("approved","created_at");