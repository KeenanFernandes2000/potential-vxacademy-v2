ALTER TABLE "unit_role_assignments" ALTER COLUMN "unit_ids" SET DATA TYPE integer[];--> statement-breakpoint
ALTER TABLE "unit_role_assignments" ALTER COLUMN "unit_ids" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "unit_role_assignments" ALTER COLUMN "unit_ids" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "normal_users" ADD COLUMN "existing" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "normal_users" ADD COLUMN "initial_assessment" boolean DEFAULT false NOT NULL;