import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { invitationTypeEnum, userTypeEnum } from "./enums";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  organization: text("organization").notNull(),
  subOrganization: text("sub_organization"),
  asset: text("asset").notNull(),
  subAsset: text("sub_asset").notNull(),
  userType: userTypeEnum("user_type").notNull(),
  passwordHash: text("password_hash").notNull(),
  lastLogin: timestamp("last_login", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const subAdmins = pgTable("sub_admins", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  jobTitle: text("job_title").notNull(),
  totalFrontliners: integer("total_frontliners"),
  eid: text("eid").notNull().unique(),
  phoneNumber: text("phone_number").notNull(),
});

export const normalUsers = pgTable("normal_users", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  roleCategory: text("role_category").notNull(),
  role: text("role").notNull(),
  seniority: text("seniority").notNull(),
  eid: text("eid").notNull().unique(),
  phoneNumber: text("phone_number").notNull(),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const subAssets = pgTable("sub_assets", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

export const roleCategories = pgTable("role_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => roleCategories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

export const seniorityLevels = pgTable("seniority_levels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const passwordResets = pgTable("password_resets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").notNull().default(false),
});

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  createdBy: integer("created_by")
    .notNull()
    .references(() => subAdmins.userId, { onDelete: "cascade" }),
  type: invitationTypeEnum("type").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
