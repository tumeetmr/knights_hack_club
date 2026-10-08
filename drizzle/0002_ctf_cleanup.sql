ALTER TABLE "challenges" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "contest" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_points_positive" CHECK ("challenges"."points" > 0);--> statement-breakpoint
ALTER TABLE "contest" ADD CONSTRAINT "contest_single_row" CHECK ("contest"."id" = 1);--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_email_lowercase" CHECK ("players"."email" = lower("players"."email"));