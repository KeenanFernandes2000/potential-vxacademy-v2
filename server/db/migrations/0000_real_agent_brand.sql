-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

CREATE TYPE "public"."invitation_type" AS ENUM('new_joiner', 'existing_joiner');
CREATE TYPE "public"."progress_status" AS ENUM('not_started', 'in_progress', 'completed');
CREATE TYPE "public"."user_type" AS ENUM('admin', 'sub_admin', 'user');
CREATE TABLE "seniority_levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "seniority_levels_name_unique" UNIQUE("name")
);

CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"organization" text NOT NULL,
	"sub_organization" text,
	"asset" text NOT NULL,
	"sub_asset" text NOT NULL,
	"user_type" "user_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"password_hash" text NOT NULL,
	"last_login" timestamp with time zone DEFAULT now() NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "assessment_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"assessment_id" integer NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"answers" json,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"training_area_id" integer NOT NULL,
	"module_id" integer,
	"unit_id" integer,
	"course_id" integer,
	"title" text NOT NULL,
	"description" text,
	"placement" text DEFAULT 'end' NOT NULL,
	"is_graded" boolean DEFAULT true NOT NULL,
	"show_correct_answers" boolean DEFAULT false NOT NULL,
	"passing_score" integer,
	"has_time_limit" boolean DEFAULT false NOT NULL,
	"time_limit" integer,
	"max_retakes" integer DEFAULT 3 NOT NULL,
	"has_certificate" boolean DEFAULT false NOT NULL,
	"certificate_template" text,
	"xp_points" integer DEFAULT 50 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "training_areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"training_area_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "units" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"internal_note" text,
	"order" integer DEFAULT 1 NOT NULL,
	"duration" integer DEFAULT 30 NOT NULL,
	"show_duration" boolean DEFAULT true NOT NULL,
	"xp_points" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"module_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"internal_note" text,
	"duration" integer,
	"show_duration" boolean DEFAULT true NOT NULL,
	"level" text DEFAULT 'beginner' NOT NULL,
	"show_level" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessment_id" integer NOT NULL,
	"question_text" text NOT NULL,
	"question_type" text DEFAULT 'mcq' NOT NULL,
	"options" json,
	"correct_answer" text,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"certificate_number" text NOT NULL,
	"issue_date" timestamp with time zone DEFAULT now() NOT NULL,
	"expiry_date" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	CONSTRAINT "certificates_certificate_number_unique" UNIQUE("certificate_number")
);

CREATE TABLE "user_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"badge_id" integer NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"xp_points" integer DEFAULT 100 NOT NULL,
	"type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "sub_admins" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"job_title" text NOT NULL,
	"total_frontliners" integer,
	"eid" text NOT NULL,
	"phone_number" text NOT NULL,
	CONSTRAINT "sub_admins_eid_unique" UNIQUE("eid")
);

CREATE TABLE "invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_by" integer NOT NULL,
	"type" "invitation_type" NOT NULL,
	"token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_hash_unique" UNIQUE("token_hash")
);

CREATE TABLE "normal_users" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"role_category" text NOT NULL,
	"role" text NOT NULL,
	"seniority" text NOT NULL,
	"eid" text NOT NULL,
	"phone_number" text NOT NULL,
	CONSTRAINT "normal_users_eid_unique" UNIQUE("eid")
);

CREATE TABLE "password_resets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	CONSTRAINT "password_resets_token_hash_unique" UNIQUE("token_hash")
);

CREATE TABLE "role_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "role_categories_name_unique" UNIQUE("name")
);

CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" text NOT NULL
);

CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "assets_name_unique" UNIQUE("name")
);

CREATE TABLE "sub_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"name" text NOT NULL
);

CREATE TABLE "course_units" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"unit_id" integer NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "learning_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"video_url" text,
	"image_url" text,
	"interactive_data" json,
	"order" integer NOT NULL,
	"xp_points" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "user_course_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"status" "progress_status" DEFAULT 'not_started' NOT NULL,
	"completion_percentage" numeric DEFAULT '0',
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_course_progress_user_id_course_id_unique" UNIQUE("user_id","course_id")
);

CREATE TABLE "user_learning_block_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"learning_block_id" integer NOT NULL,
	"status" "progress_status" DEFAULT 'not_started' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_learning_block_progress_user_id_learning_block_id_unique" UNIQUE("user_id","learning_block_id")
);

CREATE TABLE "user_module_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"module_id" integer NOT NULL,
	"status" "progress_status" DEFAULT 'not_started' NOT NULL,
	"completion_percentage" numeric DEFAULT '0',
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_module_progress_user_id_module_id_unique" UNIQUE("user_id","module_id")
);

CREATE TABLE "user_training_area_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"training_area_id" integer NOT NULL,
	"status" "progress_status" DEFAULT 'not_started' NOT NULL,
	"completion_percentage" numeric DEFAULT '0',
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_training_area_progress_user_id_training_area_id_unique" UNIQUE("user_id","training_area_id")
);

CREATE TABLE "course_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"enrollment_source" text DEFAULT 'manual'
);

CREATE TABLE "media_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_path" text NOT NULL,
	"url" text NOT NULL,
	"uploaded_by" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"metadata" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "user_course_unit_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_unit_id" integer NOT NULL,
	"status" "progress_status" DEFAULT 'not_started' NOT NULL,
	"completion_percentage" numeric DEFAULT '0',
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_course_unit_progress_user_id_course_unit_id_unique" UNIQUE("user_id","course_unit_id")
);

CREATE TABLE "sub_organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" text NOT NULL
);

CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"asset_id" integer,
	"sub_asset_id" integer,
	CONSTRAINT "organizations_name_unique" UNIQUE("name")
);

CREATE TABLE "unit_role_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"unit_ids" integer[] DEFAULT '{}' NOT NULL,
	"role_category_id" integer,
	"seniority_level_id" integer,
	"asset_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_unit_role_assignment" UNIQUE("name","role_category_id","seniority_level_id","asset_id")
);

ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_training_area_id_training_areas_id_fk" FOREIGN KEY ("training_area_id") REFERENCES "public"."training_areas"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "modules" ADD CONSTRAINT "modules_training_area_id_training_areas_id_fk" FOREIGN KEY ("training_area_id") REFERENCES "public"."training_areas"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "courses" ADD CONSTRAINT "courses_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "questions" ADD CONSTRAINT "questions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "sub_admins" ADD CONSTRAINT "sub_admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_created_by_sub_admins_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."sub_admins"("user_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "normal_users" ADD CONSTRAINT "normal_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "roles" ADD CONSTRAINT "roles_category_id_role_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."role_categories"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "sub_assets" ADD CONSTRAINT "sub_assets_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "course_units" ADD CONSTRAINT "course_units_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "course_units" ADD CONSTRAINT "course_units_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "learning_blocks" ADD CONSTRAINT "learning_blocks_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_course_progress" ADD CONSTRAINT "user_course_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_course_progress" ADD CONSTRAINT "user_course_progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_learning_block_progress" ADD CONSTRAINT "user_learning_block_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_learning_block_progress" ADD CONSTRAINT "user_learning_block_progress_learning_block_id_learning_blocks_" FOREIGN KEY ("learning_block_id") REFERENCES "public"."learning_blocks"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_module_progress" ADD CONSTRAINT "user_module_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_module_progress" ADD CONSTRAINT "user_module_progress_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_training_area_progress" ADD CONSTRAINT "user_training_area_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_training_area_progress" ADD CONSTRAINT "user_training_area_progress_training_area_id_training_areas_id_" FOREIGN KEY ("training_area_id") REFERENCES "public"."training_areas"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_course_unit_progress" ADD CONSTRAINT "user_course_unit_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_course_unit_progress" ADD CONSTRAINT "user_course_unit_progress_course_unit_id_course_units_id_fk" FOREIGN KEY ("course_unit_id") REFERENCES "public"."course_units"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "sub_organizations" ADD CONSTRAINT "sub_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_sub_asset_id_sub_assets_id_fk" FOREIGN KEY ("sub_asset_id") REFERENCES "public"."sub_assets"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "unit_role_assignments" ADD CONSTRAINT "unit_role_assignments_role_category_id_role_categories_id_fk" FOREIGN KEY ("role_category_id") REFERENCES "public"."role_categories"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "unit_role_assignments" ADD CONSTRAINT "unit_role_assignments_seniority_level_id_seniority_levels_id_fk" FOREIGN KEY ("seniority_level_id") REFERENCES "public"."seniority_levels"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "unit_role_assignments" ADD CONSTRAINT "unit_role_assignments_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;
