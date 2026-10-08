CREATE TABLE "pixels" (
	"id" serial PRIMARY KEY NOT NULL,
	"x" smallint NOT NULL,
	"y" smallint NOT NULL,
	"color" text NOT NULL,
	"player_id" integer,
	"placed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pixels_in_grid" CHECK ("pixels"."x" >= 0 and "pixels"."y" >= 0 and "pixels"."x" < 64 and "pixels"."y" < 64)
);
--> statement-breakpoint
ALTER TABLE "pixels" ADD CONSTRAINT "pixels_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pixels_cell_idx" ON "pixels" USING btree ("x","y","id");--> statement-breakpoint
CREATE INDEX "pixels_player_idx" ON "pixels" USING btree ("player_id","id");