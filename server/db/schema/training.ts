import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  json,
  unique,
} from "drizzle-orm/pg-core";
import { roleCategories, roles, seniorityLevels, assets } from "./users";

export const trainingAreas = pgTable("training_areas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  trainingAreaId: integer("training_area_id")
    .notNull()
    .references(() => trainingAreas.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  internalNote: text("internal_note"),
  duration: integer("duration"),
  showDuration: boolean("show_duration").notNull().default(true),
  level: text("level").notNull().default("beginner"),
  showLevel: boolean("show_level").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  internalNote: text("internal_note"),
  order: integer("order").notNull().default(1),
  duration: integer("duration").notNull().default(30),
  showDuration: boolean("show_duration").notNull().default(true),
  xpPoints: integer("xp_points").notNull().default(100),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const courseUnits = pgTable("course_units", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  unitId: integer("unit_id")
    .notNull()
    .references(() => units.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const learningBlocks = pgTable("learning_blocks", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id")
    .notNull()
    .references(() => units.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  videoUrl: text("video_url"),
  imageUrl: text("image_url"),
  interactiveData: json("interactive_data"),
  order: integer("order").notNull(),
  xpPoints: integer("xp_points").notNull().default(10),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const unitRoleAssignments = pgTable(
  "unit_role_assignments",
  {
    id: serial("id").primaryKey(),
    unitId: integer("unit_id")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    roleCategoryId: integer("role_category_id").references(
      () => roleCategories.id,
      { onDelete: "set null" }
    ),
    roleId: integer("role_id").references(() => roles.id, {
      onDelete: "set null",
    }),
    seniorityLevelId: integer("seniority_level_id").references(
      () => seniorityLevels.id,
      { onDelete: "set null" }
    ),
    assetId: integer("asset_id").references(() => assets.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueAssignment: unique("unique_unit_role_assignment").on(
      table.unitId,
      table.roleCategoryId,
      table.roleId,
      table.seniorityLevelId,
      table.assetId
    ),
  })
);
