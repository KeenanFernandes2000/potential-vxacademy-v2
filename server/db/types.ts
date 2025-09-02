import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  users,
  subAdmins,
  normalUsers,
  assets,
  subAssets,
  roleCategories,
  roles,
  seniorityLevels,
  trainingAreas,
  modules,
  courses,
  units,
  courseUnits,
  learningBlocks,
  assessments,
  questions,
  assessmentAttempts,
  badges,
  userBadges,
  certificates,
  notifications,
  mediaFiles,
  courseEnrollments,
  userTrainingAreaProgress,
  userModuleProgress,
  userCourseProgress,
  userUnitProgress,
  userLearningBlockProgress,
} from "./schema";

// User types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type SubAdmin = InferSelectModel<typeof subAdmins>;
export type NewSubAdmin = InferInsertModel<typeof subAdmins>;
export type NormalUser = InferSelectModel<typeof normalUsers>;
export type NewNormalUser = InferInsertModel<typeof normalUsers>;

// Reference types
export type Asset = InferSelectModel<typeof assets>;
export type NewAsset = InferInsertModel<typeof assets>;
export type SubAsset = InferSelectModel<typeof subAssets>;
export type NewSubAsset = InferInsertModel<typeof subAssets>;
export type RoleCategory = InferSelectModel<typeof roleCategories>;
export type NewRoleCategory = InferInsertModel<typeof roleCategories>;
export type Role = InferSelectModel<typeof roles>;
export type NewRole = InferInsertModel<typeof roles>;
export type SeniorityLevel = InferSelectModel<typeof seniorityLevels>;
export type NewSeniorityLevel = InferInsertModel<typeof seniorityLevels>;

// Training types
export type TrainingArea = InferSelectModel<typeof trainingAreas>;
export type NewTrainingArea = InferInsertModel<typeof trainingAreas>;
export type Module = InferSelectModel<typeof modules>;
export type NewModule = InferInsertModel<typeof modules>;
export type Course = InferSelectModel<typeof courses>;
export type NewCourse = InferInsertModel<typeof courses>;
export type Unit = InferSelectModel<typeof units>;
export type NewUnit = InferInsertModel<typeof units>;
export type CourseUnit = InferSelectModel<typeof courseUnits>;
export type NewCourseUnit = InferInsertModel<typeof courseUnits>;
export type LearningBlock = InferSelectModel<typeof learningBlocks>;
export type NewLearningBlock = InferInsertModel<typeof learningBlocks>;

// Assessment types
export type Assessment = InferSelectModel<typeof assessments>;
export type NewAssessment = InferInsertModel<typeof assessments>;
export type Question = InferSelectModel<typeof questions>;
export type NewQuestion = InferInsertModel<typeof questions>;
export type AssessmentAttempt = InferSelectModel<typeof assessmentAttempts>;
export type NewAssessmentAttempt = InferInsertModel<typeof assessmentAttempts>;

// Gamification types
export type Badge = InferSelectModel<typeof badges>;
export type NewBadge = InferInsertModel<typeof badges>;
export type UserBadge = InferSelectModel<typeof userBadges>;
export type NewUserBadge = InferInsertModel<typeof userBadges>;
export type Certificate = InferSelectModel<typeof certificates>;
export type NewCertificate = InferInsertModel<typeof certificates>;

// System types
export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;
export type MediaFile = InferSelectModel<typeof mediaFiles>;
export type NewMediaFile = InferInsertModel<typeof mediaFiles>;
export type CourseEnrollment = InferSelectModel<typeof courseEnrollments>;
export type NewCourseEnrollment = InferInsertModel<typeof courseEnrollments>;

// Progress types
export type UserTrainingAreaProgress = InferSelectModel<
  typeof userTrainingAreaProgress
>;
export type NewUserTrainingAreaProgress = InferInsertModel<
  typeof userTrainingAreaProgress
>;
export type UserModuleProgress = InferSelectModel<typeof userModuleProgress>;
export type NewUserModuleProgress = InferInsertModel<typeof userModuleProgress>;
export type UserCourseProgress = InferSelectModel<typeof userCourseProgress>;
export type NewUserCourseProgress = InferInsertModel<typeof userCourseProgress>;
export type UserUnitProgress = InferSelectModel<typeof userUnitProgress>;
export type NewUserUnitProgress = InferInsertModel<typeof userUnitProgress>;
export type UserLearningBlockProgress = InferSelectModel<
  typeof userLearningBlockProgress
>;
export type NewUserLearningBlockProgress = InferInsertModel<
  typeof userLearningBlockProgress
>;

// Enum types
export type ProgressStatus = "not_started" | "in_progress" | "completed";
