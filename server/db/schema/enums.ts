import { pgEnum } from "drizzle-orm/pg-core";

export const progressStatusEnum = pgEnum("progress_status", [
  "not_started",
  "in_progress",
  "completed",
]);

export const invitationTypeEnum = pgEnum("invitation_type", [
  "new_joiner",
  "existing_joiner",
]);

export const userTypeEnum = pgEnum("user_type", ["admin", "sub_admin", "user"]);
