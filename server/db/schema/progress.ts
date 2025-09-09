import {
  pgTable,
  serial,
  integer,
  timestamp,
  numeric,
  unique,
} from "drizzle-orm/pg-core";
import { progressStatusEnum } from "./enums";
import { users } from "./users";
import {
  trainingAreas,
  modules,
  courses,
  units,
  courseUnits,
  learningBlocks,
} from "./training";

export const userTrainingAreaProgress = pgTable(
  "user_training_area_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    trainingAreaId: integer("training_area_id")
      .notNull()
      .references(() => trainingAreas.id, { onDelete: "cascade" }),
    status: progressStatusEnum("status").notNull().default("not_started"),
    completionPercentage: numeric("completion_percentage").default("0"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userTrainingAreaUnique: unique().on(table.userId, table.trainingAreaId),
  })
);

export const userModuleProgress = pgTable(
  "user_module_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    moduleId: integer("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    status: progressStatusEnum("status").notNull().default("not_started"),
    completionPercentage: numeric("completion_percentage").default("0"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userModuleUnique: unique().on(table.userId, table.moduleId),
  })
);

export const userCourseProgress = pgTable(
  "user_course_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    status: progressStatusEnum("status").notNull().default("not_started"),
    completionPercentage: numeric("completion_percentage").default("0"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userCourseUnique: unique().on(table.userId, table.courseId),
  })
);

export const userCourseUnitProgress = pgTable(
  "user_course_unit_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseUnitId: integer("course_unit_id")
      .notNull()
      .references(() => courseUnits.id, { onDelete: "cascade" }),
    status: progressStatusEnum("status").notNull().default("not_started"),
    completionPercentage: numeric("completion_percentage").default("0"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userCourseUnitUnique: unique().on(table.userId, table.courseUnitId),
  })
);

export const userLearningBlockProgress = pgTable(
  "user_learning_block_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    learningBlockId: integer("learning_block_id")
      .notNull()
      .references(() => learningBlocks.id, { onDelete: "cascade" }),
    status: progressStatusEnum("status").notNull().default("not_started"),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userLearningBlockUnique: unique().on(table.userId, table.learningBlockId),
  })
);
