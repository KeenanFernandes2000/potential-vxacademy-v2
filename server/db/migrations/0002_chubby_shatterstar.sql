ALTER TABLE "organizations" DROP CONSTRAINT "organizations_asset_id_assets_id_fk";
--> statement-breakpoint
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_sub_asset_id_sub_assets_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "sub_organization" SET DATA TYPE text[] USING string_to_array("sub_organization", ',');--> statement-breakpoint
ALTER TABLE "sub_organizations" ADD COLUMN "asset_id" integer;--> statement-breakpoint
ALTER TABLE "sub_organizations" ADD COLUMN "sub_asset_id" integer;--> statement-breakpoint
ALTER TABLE "sub_organizations" ADD CONSTRAINT "sub_organizations_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_organizations" ADD CONSTRAINT "sub_organizations_sub_asset_id_sub_assets_id_fk" FOREIGN KEY ("sub_asset_id") REFERENCES "public"."sub_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "asset_id";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "sub_asset_id";