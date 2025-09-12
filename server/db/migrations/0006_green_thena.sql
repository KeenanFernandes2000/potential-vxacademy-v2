ALTER TABLE "courses" ALTER COLUMN "duration" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "estimated_duration";--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "difficulty_level";