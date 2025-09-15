-- Add asset and sub-asset foreign keys to organizations table
-- These are nullable initially to handle existing data

-- Add nullable columns first
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "asset_id" integer;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "sub_asset_id" integer;

-- Add foreign key constraints
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_sub_asset_id_sub_assets_id_fk" FOREIGN KEY ("sub_asset_id") REFERENCES "public"."sub_assets"("id") ON DELETE cascade ON UPDATE no action;
