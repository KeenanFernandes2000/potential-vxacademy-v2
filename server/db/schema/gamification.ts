import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { courses } from "./training";

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  xpPoints: integer("xp_points").notNull().default(100),
  type: text("type"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  badgeId: integer("badge_id")
    .notNull()
    .references(() => badges.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  certificateNumber: text("certificate_number").notNull().unique(),
  issueDate: timestamp("issue_date", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiryDate: timestamp("expiry_date", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("active"),
});
