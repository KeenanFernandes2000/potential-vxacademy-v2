CREATE TABLE "unit_role_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit_id" integer NOT NULL,
	"role_category_id" integer,
	"role_id" integer,
	"seniority_level_id" integer,
	"asset_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_unit_role_assignment" UNIQUE("unit_id","role_category_id","role_id","seniority_level_id","asset_id")
);
--> statement-breakpoint
ALTER TABLE "unit_role_assignments" ADD CONSTRAINT "unit_role_assignments_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_role_assignments" ADD CONSTRAINT "unit_role_assignments_role_category_id_role_categories_id_fk" FOREIGN KEY ("role_category_id") REFERENCES "public"."role_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_role_assignments" ADD CONSTRAINT "unit_role_assignments_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_role_assignments" ADD CONSTRAINT "unit_role_assignments_seniority_level_id_seniority_levels_id_fk" FOREIGN KEY ("seniority_level_id") REFERENCES "public"."seniority_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_role_assignments" ADD CONSTRAINT "unit_role_assignments_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;