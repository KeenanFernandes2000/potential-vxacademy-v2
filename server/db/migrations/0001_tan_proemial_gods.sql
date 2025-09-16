ALTER TABLE "unit_role_assignments" RENAME COLUMN "unit_id" TO "unit_ids";--> statement-breakpoint
ALTER TABLE "unit_role_assignments" DROP CONSTRAINT "unique_unit_role_assignment";--> statement-breakpoint
ALTER TABLE "user_learning_block_progress" DROP CONSTRAINT "user_learning_block_progress_learning_block_id_learning_blocks_";
--> statement-breakpoint
ALTER TABLE "user_training_area_progress" DROP CONSTRAINT "user_training_area_progress_training_area_id_training_areas_id_";
--> statement-breakpoint
ALTER TABLE "unit_role_assignments" DROP CONSTRAINT "unit_role_assignments_unit_id_units_id_fk";
--> statement-breakpoint
ALTER TABLE "unit_role_assignments" DROP CONSTRAINT "unit_role_assignments_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "unit_role_assignments" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_learning_block_progress" ADD CONSTRAINT "user_learning_block_progress_learning_block_id_learning_blocks_id_fk" FOREIGN KEY ("learning_block_id") REFERENCES "public"."learning_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_training_area_progress" ADD CONSTRAINT "user_training_area_progress_training_area_id_training_areas_id_fk" FOREIGN KEY ("training_area_id") REFERENCES "public"."training_areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_role_assignments" DROP COLUMN "role_id";--> statement-breakpoint
ALTER TABLE "unit_role_assignments" ADD CONSTRAINT "unique_unit_role_assignment" UNIQUE("name","role_category_id","seniority_level_id","asset_id");