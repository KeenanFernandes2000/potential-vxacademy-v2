import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  users,
  subAdmins,
  normalUsers,
  assets,
  subAssets,
  organizations,
  roleCategories,
  roles,
  seniorityLevels,
  passwordResets,
  invitations,
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
  userCourseUnitProgress,
  userLearningBlockProgress,
} from "./schema";

// User types
export type User = InferSelectModel<typeof users>;
export type NewUser = Omit<
  InferInsertModel<typeof users>,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateUser = Partial<Omit<NewUser, "createdAt">>;
export type SubAdmin = InferSelectModel<typeof subAdmins>;
export type NewSubAdmin = Omit<InferInsertModel<typeof subAdmins>, "userId">;
export type NormalUser = InferSelectModel<typeof normalUsers>;
export type NewNormalUser = Omit<
  InferInsertModel<typeof normalUsers>,
  "userId"
>;

// Password reset types
export type PasswordReset = InferSelectModel<typeof passwordResets>;
export type NewPasswordReset = Omit<
  InferInsertModel<typeof passwordResets>,
  "id"
>;

// Reference types
export type Asset = InferSelectModel<typeof assets>;
export type NewAsset = Omit<InferInsertModel<typeof assets>, "id">;
export type SubAsset = InferSelectModel<typeof subAssets>;
export type NewSubAsset = Omit<
  InferInsertModel<typeof subAssets>,
  "id" | "assetId"
>;
export type RoleCategory = InferSelectModel<typeof roleCategories>;
export type NewRoleCategory = Omit<
  InferInsertModel<typeof roleCategories>,
  "id"
>;
export type Role = InferSelectModel<typeof roles>;
export type NewRole = Omit<InferInsertModel<typeof roles>, "id" | "categoryId">;
export type SeniorityLevel = InferSelectModel<typeof seniorityLevels>;
export type NewSeniorityLevel = Omit<
  InferInsertModel<typeof seniorityLevels>,
  "id"
>;

// Organization types
export type Organization = InferSelectModel<typeof organizations>;
export type NewOrganization = Omit<
  InferInsertModel<typeof organizations>,
  "id"
>;
export type UpdateOrganization = Partial<NewOrganization>;

// Training types
export type TrainingArea = InferSelectModel<typeof trainingAreas>;
export type NewTrainingArea = Omit<
  InferInsertModel<typeof trainingAreas>,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateTrainingArea = Partial<Omit<NewTrainingArea, "createdAt">>;

export type Module = InferSelectModel<typeof modules>;
export type NewModule = Omit<
  InferInsertModel<typeof modules>,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateModule = Partial<Omit<NewModule, "createdAt">>;

export type Course = InferSelectModel<typeof courses>;
export type NewCourse = Omit<
  InferInsertModel<typeof courses>,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateCourse = Partial<Omit<NewCourse, "createdAt">>;

export type Unit = InferSelectModel<typeof units>;
export type NewUnit = Omit<
  InferInsertModel<typeof units>,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateUnit = Partial<Omit<NewUnit, "createdAt">>;

export type CourseUnit = InferSelectModel<typeof courseUnits>;
export type NewCourseUnit = Omit<
  InferInsertModel<typeof courseUnits>,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateCourseUnit = Partial<Omit<NewCourseUnit, "createdAt">>;

export type LearningBlock = InferSelectModel<typeof learningBlocks>;
export type NewLearningBlock = Omit<
  InferInsertModel<typeof learningBlocks>,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateLearningBlock = Partial<Omit<NewLearningBlock, "createdAt">>;

// Assessment types
export type Assessment = InferSelectModel<typeof assessments>;
export type NewAssessment = Omit<
  InferInsertModel<typeof assessments>,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateAssessment = Partial<Omit<NewAssessment, "createdAt">>;

export type Question = InferSelectModel<typeof questions>;
export type NewQuestion = Omit<
  InferInsertModel<typeof questions>,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateQuestion = Partial<Omit<NewQuestion, "createdAt">>;

export type AssessmentAttempt = InferSelectModel<typeof assessmentAttempts>;
export type NewAssessmentAttempt = Omit<
  InferInsertModel<typeof assessmentAttempts>,
  "id" | "startedAt" | "completedAt"
>;
export type UpdateAssessmentAttempt = Partial<
  Omit<NewAssessmentAttempt, "userId" | "assessmentId">
>;

// Gamification types
export type Badge = InferSelectModel<typeof badges>;
export type NewBadge = Omit<
  InferInsertModel<typeof badges>,
  "id" | "createdAt" | "updatedAt"
>;
export type UserBadge = InferSelectModel<typeof userBadges>;
export type NewUserBadge = Omit<
  InferInsertModel<typeof userBadges>,
  "id" | "earnedAt" | "userId" | "badgeId"
>;
export type Certificate = InferSelectModel<typeof certificates>;
export type NewCertificate = Omit<
  InferInsertModel<typeof certificates>,
  "id" | "issueDate" | "userId" | "courseId"
>;

// System types
export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = Omit<
  InferInsertModel<typeof notifications>,
  "id" | "createdAt" | "userId"
>;
export type MediaFile = InferSelectModel<typeof mediaFiles>;
export type NewMediaFile = Omit<
  InferInsertModel<typeof mediaFiles>,
  "id" | "createdAt"
>;
export type UpdateMediaFile = Partial<Omit<NewMediaFile, "uploadedBy">>;
export type CourseEnrollment = InferSelectModel<typeof courseEnrollments>;
export type NewCourseEnrollment = Omit<
  InferInsertModel<typeof courseEnrollments>,
  "id" | "enrolledAt" | "userId" | "courseId"
>;

// Progress types
export type UserTrainingAreaProgress = InferSelectModel<
  typeof userTrainingAreaProgress
>;
export type NewUserTrainingAreaProgress = Omit<
  InferInsertModel<typeof userTrainingAreaProgress>,
  "id" | "startedAt" | "completedAt" | "userId" | "trainingAreaId"
>;
export type UserModuleProgress = InferSelectModel<typeof userModuleProgress>;
export type NewUserModuleProgress = Omit<
  InferInsertModel<typeof userModuleProgress>,
  "id" | "startedAt" | "completedAt" | "userId" | "moduleId"
>;
export type UserCourseProgress = InferSelectModel<typeof userCourseProgress>;
export type NewUserCourseProgress = Omit<
  InferInsertModel<typeof userCourseProgress>,
  "id" | "startedAt" | "completedAt" | "userId" | "courseId"
>;
export type UserCourseUnitProgress = InferSelectModel<
  typeof userCourseUnitProgress
>;
export type NewUserCourseUnitProgress = Omit<
  InferInsertModel<typeof userCourseUnitProgress>,
  "id" | "startedAt" | "completedAt" | "userId" | "courseUnitId"
>;
export type UserLearningBlockProgress = InferSelectModel<
  typeof userLearningBlockProgress
>;
export type NewUserLearningBlockProgress = Omit<
  InferInsertModel<typeof userLearningBlockProgress>,
  "id" | "startedAt" | "completedAt" | "userId" | "learningBlockId"
>;

// Invitation types
export type Invitation = InferSelectModel<typeof invitations>;
export type NewInvitation = Omit<
  InferInsertModel<typeof invitations>,
  "id" | "createdAt"
>;

// Enum types
export type ProgressStatus = "not_started" | "in_progress" | "completed";
export type InvitationType = "new_joiner" | "existing_joiner";
