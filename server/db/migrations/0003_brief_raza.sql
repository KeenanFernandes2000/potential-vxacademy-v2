ALTER TABLE "user_unit_progress" RENAME TO "user_course_unit_progress";--> statement-breakpoint
ALTER TABLE "user_course_unit_progress" RENAME COLUMN "unit_id" TO "course_unit_id";--> statement-breakpoint
ALTER TABLE "user_course_unit_progress" DROP CONSTRAINT "user_unit_progress_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_course_unit_progress" DROP CONSTRAINT "user_unit_progress_unit_id_units_id_fk";
--> statement-breakpoint
ALTER TABLE "user_course_unit_progress" ADD CONSTRAINT "user_course_unit_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_course_unit_progress" ADD CONSTRAINT "user_course_unit_progress_course_unit_id_course_units_id_fk" FOREIGN KEY ("course_unit_id") REFERENCES "public"."course_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_course_progress" ADD CONSTRAINT "user_course_progress_user_id_course_id_unique" UNIQUE("user_id","course_id");--> statement-breakpoint
ALTER TABLE "user_learning_block_progress" ADD CONSTRAINT "user_learning_block_progress_user_id_learning_block_id_unique" UNIQUE("user_id","learning_block_id");--> statement-breakpoint
ALTER TABLE "user_module_progress" ADD CONSTRAINT "user_module_progress_user_id_module_id_unique" UNIQUE("user_id","module_id");--> statement-breakpoint
ALTER TABLE "user_training_area_progress" ADD CONSTRAINT "user_training_area_progress_user_id_training_area_id_unique" UNIQUE("user_id","training_area_id");--> statement-breakpoint
ALTER TABLE "user_course_unit_progress" ADD CONSTRAINT "user_course_unit_progress_user_id_course_unit_id_unique" UNIQUE("user_id","course_unit_id");