import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  json,
} from "drizzle-orm/pg-core";
import { trainingAreas } from "./training";
import { modules } from "./training";
import { courses } from "./training";
import { units } from "./training";
import { users } from "./users";

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  trainingAreaId: integer("training_area_id")
    .notNull()
    .references(() => trainingAreas.id, { onDelete: "set null" }),
  moduleId: integer("module_id").references(() => modules.id, {
    onDelete: "set null",
  }),
  unitId: integer("unit_id").references(() => units.id, {
    onDelete: "set null",
  }),
  courseId: integer("course_id").references(() => courses.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  placement: text("placement").notNull().default("end"),
  isGraded: boolean("is_graded").notNull().default(true),
  showCorrectAnswers: boolean("show_correct_answers").notNull().default(false),
  passingScore: integer("passing_score"),
  hasTimeLimit: boolean("has_time_limit").notNull().default(false),
  timeLimit: integer("time_limit"),
  maxRetakes: integer("max_retakes").notNull().default(3),
  hasCertificate: boolean("has_certificate").notNull().default(false),
  certificateTemplate: text("certificate_template"),
  xpPoints: integer("xp_points").notNull().default(50),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id")
    .notNull()
    .references(() => assessments.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull().default("mcq"),
  options: json("options"),
  correctAnswer: text("correct_answer"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const assessmentAttempts = pgTable("assessment_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assessmentId: integer("assessment_id")
    .notNull()
    .references(() => assessments.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  passed: boolean("passed").notNull(),
  answers: json("answers"),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
