import { relations } from "drizzle-orm/relations";
import { users, assessmentAttempts, assessments, trainingAreas, modules, units, courses, questions, certificates, userBadges, badges, subAdmins, invitations, normalUsers, passwordResets, roleCategories, roles, assets, subAssets, courseUnits, learningBlocks, userCourseProgress, userLearningBlockProgress, userModuleProgress, userTrainingAreaProgress, courseEnrollments, mediaFiles, notifications, userCourseUnitProgress, organizations, subOrganizations, unitRoleAssignments, seniorityLevels } from "./schema";

export const assessmentAttemptsRelations = relations(assessmentAttempts, ({one}) => ({
	user: one(users, {
		fields: [assessmentAttempts.userId],
		references: [users.id]
	}),
	assessment: one(assessments, {
		fields: [assessmentAttempts.assessmentId],
		references: [assessments.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	assessmentAttempts: many(assessmentAttempts),
	certificates: many(certificates),
	userBadges: many(userBadges),
	subAdmins: many(subAdmins),
	normalUsers: many(normalUsers),
	passwordResets: many(passwordResets),
	userCourseProgresses: many(userCourseProgress),
	userLearningBlockProgresses: many(userLearningBlockProgress),
	userModuleProgresses: many(userModuleProgress),
	userTrainingAreaProgresses: many(userTrainingAreaProgress),
	courseEnrollments: many(courseEnrollments),
	mediaFiles: many(mediaFiles),
	notifications: many(notifications),
	userCourseUnitProgresses: many(userCourseUnitProgress),
}));

export const assessmentsRelations = relations(assessments, ({one, many}) => ({
	assessmentAttempts: many(assessmentAttempts),
	trainingArea: one(trainingAreas, {
		fields: [assessments.trainingAreaId],
		references: [trainingAreas.id]
	}),
	module: one(modules, {
		fields: [assessments.moduleId],
		references: [modules.id]
	}),
	unit: one(units, {
		fields: [assessments.unitId],
		references: [units.id]
	}),
	course: one(courses, {
		fields: [assessments.courseId],
		references: [courses.id]
	}),
	questions: many(questions),
}));

export const trainingAreasRelations = relations(trainingAreas, ({many}) => ({
	assessments: many(assessments),
	modules: many(modules),
	userTrainingAreaProgresses: many(userTrainingAreaProgress),
}));

export const modulesRelations = relations(modules, ({one, many}) => ({
	assessments: many(assessments),
	trainingArea: one(trainingAreas, {
		fields: [modules.trainingAreaId],
		references: [trainingAreas.id]
	}),
	courses: many(courses),
	userModuleProgresses: many(userModuleProgress),
}));

export const unitsRelations = relations(units, ({many}) => ({
	assessments: many(assessments),
	courseUnits: many(courseUnits),
	learningBlocks: many(learningBlocks),
}));

export const coursesRelations = relations(courses, ({one, many}) => ({
	assessments: many(assessments),
	module: one(modules, {
		fields: [courses.moduleId],
		references: [modules.id]
	}),
	certificates: many(certificates),
	courseUnits: many(courseUnits),
	userCourseProgresses: many(userCourseProgress),
	courseEnrollments: many(courseEnrollments),
}));

export const questionsRelations = relations(questions, ({one}) => ({
	assessment: one(assessments, {
		fields: [questions.assessmentId],
		references: [assessments.id]
	}),
}));

export const certificatesRelations = relations(certificates, ({one}) => ({
	user: one(users, {
		fields: [certificates.userId],
		references: [users.id]
	}),
	course: one(courses, {
		fields: [certificates.courseId],
		references: [courses.id]
	}),
}));

export const userBadgesRelations = relations(userBadges, ({one}) => ({
	user: one(users, {
		fields: [userBadges.userId],
		references: [users.id]
	}),
	badge: one(badges, {
		fields: [userBadges.badgeId],
		references: [badges.id]
	}),
}));

export const badgesRelations = relations(badges, ({many}) => ({
	userBadges: many(userBadges),
}));

export const subAdminsRelations = relations(subAdmins, ({one, many}) => ({
	user: one(users, {
		fields: [subAdmins.userId],
		references: [users.id]
	}),
	invitations: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({one}) => ({
	subAdmin: one(subAdmins, {
		fields: [invitations.createdBy],
		references: [subAdmins.userId]
	}),
}));

export const normalUsersRelations = relations(normalUsers, ({one}) => ({
	user: one(users, {
		fields: [normalUsers.userId],
		references: [users.id]
	}),
}));

export const passwordResetsRelations = relations(passwordResets, ({one}) => ({
	user: one(users, {
		fields: [passwordResets.userId],
		references: [users.id]
	}),
}));

export const rolesRelations = relations(roles, ({one}) => ({
	roleCategory: one(roleCategories, {
		fields: [roles.categoryId],
		references: [roleCategories.id]
	}),
}));

export const roleCategoriesRelations = relations(roleCategories, ({many}) => ({
	roles: many(roles),
	unitRoleAssignments: many(unitRoleAssignments),
}));

export const subAssetsRelations = relations(subAssets, ({one, many}) => ({
	asset: one(assets, {
		fields: [subAssets.assetId],
		references: [assets.id]
	}),
	organizations: many(organizations),
}));

export const assetsRelations = relations(assets, ({many}) => ({
	subAssets: many(subAssets),
	organizations: many(organizations),
	unitRoleAssignments: many(unitRoleAssignments),
}));

export const courseUnitsRelations = relations(courseUnits, ({one, many}) => ({
	course: one(courses, {
		fields: [courseUnits.courseId],
		references: [courses.id]
	}),
	unit: one(units, {
		fields: [courseUnits.unitId],
		references: [units.id]
	}),
	userCourseUnitProgresses: many(userCourseUnitProgress),
}));

export const learningBlocksRelations = relations(learningBlocks, ({one, many}) => ({
	unit: one(units, {
		fields: [learningBlocks.unitId],
		references: [units.id]
	}),
	userLearningBlockProgresses: many(userLearningBlockProgress),
}));

export const userCourseProgressRelations = relations(userCourseProgress, ({one}) => ({
	user: one(users, {
		fields: [userCourseProgress.userId],
		references: [users.id]
	}),
	course: one(courses, {
		fields: [userCourseProgress.courseId],
		references: [courses.id]
	}),
}));

export const userLearningBlockProgressRelations = relations(userLearningBlockProgress, ({one}) => ({
	user: one(users, {
		fields: [userLearningBlockProgress.userId],
		references: [users.id]
	}),
	learningBlock: one(learningBlocks, {
		fields: [userLearningBlockProgress.learningBlockId],
		references: [learningBlocks.id]
	}),
}));

export const userModuleProgressRelations = relations(userModuleProgress, ({one}) => ({
	user: one(users, {
		fields: [userModuleProgress.userId],
		references: [users.id]
	}),
	module: one(modules, {
		fields: [userModuleProgress.moduleId],
		references: [modules.id]
	}),
}));

export const userTrainingAreaProgressRelations = relations(userTrainingAreaProgress, ({one}) => ({
	user: one(users, {
		fields: [userTrainingAreaProgress.userId],
		references: [users.id]
	}),
	trainingArea: one(trainingAreas, {
		fields: [userTrainingAreaProgress.trainingAreaId],
		references: [trainingAreas.id]
	}),
}));

export const courseEnrollmentsRelations = relations(courseEnrollments, ({one}) => ({
	user: one(users, {
		fields: [courseEnrollments.userId],
		references: [users.id]
	}),
	course: one(courses, {
		fields: [courseEnrollments.courseId],
		references: [courses.id]
	}),
}));

export const mediaFilesRelations = relations(mediaFiles, ({one}) => ({
	user: one(users, {
		fields: [mediaFiles.uploadedBy],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const userCourseUnitProgressRelations = relations(userCourseUnitProgress, ({one}) => ({
	user: one(users, {
		fields: [userCourseUnitProgress.userId],
		references: [users.id]
	}),
	courseUnit: one(courseUnits, {
		fields: [userCourseUnitProgress.courseUnitId],
		references: [courseUnits.id]
	}),
}));

export const subOrganizationsRelations = relations(subOrganizations, ({one}) => ({
	organization: one(organizations, {
		fields: [subOrganizations.organizationId],
		references: [organizations.id]
	}),
}));

export const organizationsRelations = relations(organizations, ({one, many}) => ({
	subOrganizations: many(subOrganizations),
	asset: one(assets, {
		fields: [organizations.assetId],
		references: [assets.id]
	}),
	subAsset: one(subAssets, {
		fields: [organizations.subAssetId],
		references: [subAssets.id]
	}),
}));

export const unitRoleAssignmentsRelations = relations(unitRoleAssignments, ({one}) => ({
	roleCategory: one(roleCategories, {
		fields: [unitRoleAssignments.roleCategoryId],
		references: [roleCategories.id]
	}),
	seniorityLevel: one(seniorityLevels, {
		fields: [unitRoleAssignments.seniorityLevelId],
		references: [seniorityLevels.id]
	}),
	asset: one(assets, {
		fields: [unitRoleAssignments.assetId],
		references: [assets.id]
	}),
}));

export const seniorityLevelsRelations = relations(seniorityLevels, ({many}) => ({
	unitRoleAssignments: many(unitRoleAssignments),
}));