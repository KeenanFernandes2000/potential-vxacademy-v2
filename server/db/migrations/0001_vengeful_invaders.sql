ALTER TABLE "user_learning_block_progress" DROP CONSTRAINT "user_learning_block_progress_learning_block_id_learning_blocks_";
--> statement-breakpoint
ALTER TABLE "user_training_area_progress" DROP CONSTRAINT "user_training_area_progress_training_area_id_training_areas_id_";
--> statement-breakpoint
ALTER TABLE "normal_users" ADD COLUMN "existing" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "normal_users" ADD COLUMN "initial_assessment" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_learning_block_progress" ADD CONSTRAINT "user_learning_block_progress_learning_block_id_learning_blocks_id_fk" FOREIGN KEY ("learning_block_id") REFERENCES "public"."learning_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_training_area_progress" ADD CONSTRAINT "user_training_area_progress_training_area_id_training_areas_id_fk" FOREIGN KEY ("training_area_id") REFERENCES "public"."training_areas"("id") ON DELETE cascade ON UPDATE no action;