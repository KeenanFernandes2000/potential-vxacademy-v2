import { pgTable, unique, serial, text, timestamp, integer, foreignKey, boolean, json, numeric, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const invitationType = pgEnum("invitation_type", ['new_joiner', 'existing_joiner'])
export const progressStatus = pgEnum("progress_status", ['not_started', 'in_progress', 'completed'])
export const userType = pgEnum("user_type", ['admin', 'sub_admin', 'user'])


export const seniorityLevels = pgTable("seniority_levels", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
}, (table) => [
	unique("seniority_levels_name_unique").on(table.name),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	email: text().notNull(),
	organization: text().notNull(),
	subOrganization: text("sub_organization"),
	asset: text().notNull(),
	subAsset: text("sub_asset").notNull(),
	userType: userType("user_type").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	passwordHash: text("password_hash").notNull(),
	lastLogin: timestamp("last_login", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	xp: integer().default(0).notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const assessmentAttempts = pgTable("assessment_attempts", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	assessmentId: integer("assessment_id").notNull(),
	score: integer().notNull(),
	passed: boolean().notNull(),
	answers: json(),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "assessment_attempts_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.assessmentId],
			foreignColumns: [assessments.id],
			name: "assessment_attempts_assessment_id_assessments_id_fk"
		}).onDelete("cascade"),
]);

export const assessments = pgTable("assessments", {
	id: serial().primaryKey().notNull(),
	trainingAreaId: integer("training_area_id").notNull(),
	moduleId: integer("module_id"),
	unitId: integer("unit_id"),
	courseId: integer("course_id"),
	title: text().notNull(),
	description: text(),
	placement: text().default('end').notNull(),
	isGraded: boolean("is_graded").default(true).notNull(),
	showCorrectAnswers: boolean("show_correct_answers").default(false).notNull(),
	passingScore: integer("passing_score"),
	hasTimeLimit: boolean("has_time_limit").default(false).notNull(),
	timeLimit: integer("time_limit"),
	maxRetakes: integer("max_retakes").default(3).notNull(),
	hasCertificate: boolean("has_certificate").default(false).notNull(),
	certificateTemplate: text("certificate_template"),
	xpPoints: integer("xp_points").default(50).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.trainingAreaId],
			foreignColumns: [trainingAreas.id],
			name: "assessments_training_area_id_training_areas_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.moduleId],
			foreignColumns: [modules.id],
			name: "assessments_module_id_modules_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.unitId],
			foreignColumns: [units.id],
			name: "assessments_unit_id_units_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "assessments_course_id_courses_id_fk"
		}).onDelete("set null"),
]);

export const trainingAreas = pgTable("training_areas", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	imageUrl: text("image_url"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const modules = pgTable("modules", {
	id: serial().primaryKey().notNull(),
	trainingAreaId: integer("training_area_id").notNull(),
	name: text().notNull(),
	description: text(),
	imageUrl: text("image_url"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.trainingAreaId],
			foreignColumns: [trainingAreas.id],
			name: "modules_training_area_id_training_areas_id_fk"
		}).onDelete("cascade"),
]);

export const units = pgTable("units", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	internalNote: text("internal_note"),
	order: integer().default(1).notNull(),
	duration: integer().default(30).notNull(),
	showDuration: boolean("show_duration").default(true).notNull(),
	xpPoints: integer("xp_points").default(100).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const courses = pgTable("courses", {
	id: serial().primaryKey().notNull(),
	moduleId: integer("module_id").notNull(),
	name: text().notNull(),
	description: text(),
	imageUrl: text("image_url"),
	internalNote: text("internal_note"),
	duration: integer(),
	showDuration: boolean("show_duration").default(true).notNull(),
	level: text().default('beginner').notNull(),
	showLevel: boolean("show_level").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.moduleId],
			foreignColumns: [modules.id],
			name: "courses_module_id_modules_id_fk"
		}).onDelete("cascade"),
]);

export const questions = pgTable("questions", {
	id: serial().primaryKey().notNull(),
	assessmentId: integer("assessment_id").notNull(),
	questionText: text("question_text").notNull(),
	questionType: text("question_type").default('mcq').notNull(),
	options: json(),
	correctAnswer: text("correct_answer"),
	order: integer().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.assessmentId],
			foreignColumns: [assessments.id],
			name: "questions_assessment_id_assessments_id_fk"
		}).onDelete("cascade"),
]);

export const certificates = pgTable("certificates", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	courseId: integer("course_id").notNull(),
	certificateNumber: text("certificate_number").notNull(),
	issueDate: timestamp("issue_date", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	expiryDate: timestamp("expiry_date", { withTimezone: true, mode: 'string' }).notNull(),
	status: text().default('active').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "certificates_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "certificates_course_id_courses_id_fk"
		}).onDelete("cascade"),
	unique("certificates_certificate_number_unique").on(table.certificateNumber),
]);

export const userBadges = pgTable("user_badges", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	badgeId: integer("badge_id").notNull(),
	earnedAt: timestamp("earned_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_badges_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.badgeId],
			foreignColumns: [badges.id],
			name: "user_badges_badge_id_badges_id_fk"
		}).onDelete("cascade"),
]);

export const badges = pgTable("badges", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	imageUrl: text("image_url"),
	xpPoints: integer("xp_points").default(100).notNull(),
	type: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const subAdmins = pgTable("sub_admins", {
	userId: integer("user_id").primaryKey().notNull(),
	jobTitle: text("job_title").notNull(),
	totalFrontliners: integer("total_frontliners"),
	eid: text().notNull(),
	phoneNumber: text("phone_number").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sub_admins_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("sub_admins_eid_unique").on(table.eid),
]);

export const invitations = pgTable("invitations", {
	id: serial().primaryKey().notNull(),
	createdBy: integer("created_by").notNull(),
	type: invitationType().notNull(),
	tokenHash: text("token_hash").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [subAdmins.userId],
			name: "invitations_created_by_sub_admins_user_id_fk"
		}).onDelete("cascade"),
	unique("invitations_token_hash_unique").on(table.tokenHash),
]);

export const normalUsers = pgTable("normal_users", {
	userId: integer("user_id").primaryKey().notNull(),
	roleCategory: text("role_category").notNull(),
	role: text().notNull(),
	seniority: text().notNull(),
	eid: text().notNull(),
	phoneNumber: text("phone_number").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "normal_users_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("normal_users_eid_unique").on(table.eid),
]);

export const passwordResets = pgTable("password_resets", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	tokenHash: text("token_hash").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	used: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "password_resets_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("password_resets_token_hash_unique").on(table.tokenHash),
]);

export const roleCategories = pgTable("role_categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
}, (table) => [
	unique("role_categories_name_unique").on(table.name),
]);

export const roles = pgTable("roles", {
	id: serial().primaryKey().notNull(),
	categoryId: integer("category_id").notNull(),
	name: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [roleCategories.id],
			name: "roles_category_id_role_categories_id_fk"
		}).onDelete("cascade"),
]);

export const assets = pgTable("assets", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
}, (table) => [
	unique("assets_name_unique").on(table.name),
]);

export const subAssets = pgTable("sub_assets", {
	id: serial().primaryKey().notNull(),
	assetId: integer("asset_id").notNull(),
	name: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.assetId],
			foreignColumns: [assets.id],
			name: "sub_assets_asset_id_assets_id_fk"
		}).onDelete("cascade"),
]);

export const courseUnits = pgTable("course_units", {
	id: serial().primaryKey().notNull(),
	courseId: integer("course_id").notNull(),
	unitId: integer("unit_id").notNull(),
	order: integer().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "course_units_course_id_courses_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.unitId],
			foreignColumns: [units.id],
			name: "course_units_unit_id_units_id_fk"
		}).onDelete("cascade"),
]);

export const learningBlocks = pgTable("learning_blocks", {
	id: serial().primaryKey().notNull(),
	unitId: integer("unit_id").notNull(),
	type: text().notNull(),
	title: text().notNull(),
	content: text(),
	videoUrl: text("video_url"),
	imageUrl: text("image_url"),
	interactiveData: json("interactive_data"),
	order: integer().notNull(),
	xpPoints: integer("xp_points").default(10).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.unitId],
			foreignColumns: [units.id],
			name: "learning_blocks_unit_id_units_id_fk"
		}).onDelete("cascade"),
]);

export const userCourseProgress = pgTable("user_course_progress", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	courseId: integer("course_id").notNull(),
	status: progressStatus().default('not_started').notNull(),
	completionPercentage: numeric("completion_percentage").default('0'),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_course_progress_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "user_course_progress_course_id_courses_id_fk"
		}).onDelete("cascade"),
	unique("user_course_progress_user_id_course_id_unique").on(table.userId, table.courseId),
]);

export const userLearningBlockProgress = pgTable("user_learning_block_progress", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	learningBlockId: integer("learning_block_id").notNull(),
	status: progressStatus().default('not_started').notNull(),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_learning_block_progress_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.learningBlockId],
			foreignColumns: [learningBlocks.id],
			name: "user_learning_block_progress_learning_block_id_learning_blocks_"
		}).onDelete("cascade"),
	unique("user_learning_block_progress_user_id_learning_block_id_unique").on(table.userId, table.learningBlockId),
]);

export const userModuleProgress = pgTable("user_module_progress", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	moduleId: integer("module_id").notNull(),
	status: progressStatus().default('not_started').notNull(),
	completionPercentage: numeric("completion_percentage").default('0'),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_module_progress_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.moduleId],
			foreignColumns: [modules.id],
			name: "user_module_progress_module_id_modules_id_fk"
		}).onDelete("cascade"),
	unique("user_module_progress_user_id_module_id_unique").on(table.userId, table.moduleId),
]);

export const userTrainingAreaProgress = pgTable("user_training_area_progress", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	trainingAreaId: integer("training_area_id").notNull(),
	status: progressStatus().default('not_started').notNull(),
	completionPercentage: numeric("completion_percentage").default('0'),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_training_area_progress_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.trainingAreaId],
			foreignColumns: [trainingAreas.id],
			name: "user_training_area_progress_training_area_id_training_areas_id_"
		}).onDelete("cascade"),
	unique("user_training_area_progress_user_id_training_area_id_unique").on(table.userId, table.trainingAreaId),
]);

export const courseEnrollments = pgTable("course_enrollments", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	courseId: integer("course_id").notNull(),
	enrolledAt: timestamp("enrolled_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	enrollmentSource: text("enrollment_source").default('manual'),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "course_enrollments_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "course_enrollments_course_id_courses_id_fk"
		}).onDelete("cascade"),
]);

export const mediaFiles = pgTable("media_files", {
	id: serial().primaryKey().notNull(),
	filename: text().notNull(),
	originalName: text("original_name").notNull(),
	mimeType: text("mime_type").notNull(),
	fileSize: integer("file_size").notNull(),
	filePath: text("file_path").notNull(),
	url: text().notNull(),
	uploadedBy: integer("uploaded_by").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [users.id],
			name: "media_files_uploaded_by_users_id_fk"
		}).onDelete("cascade"),
]);

export const notifications = pgTable("notifications", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	type: text().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	read: boolean().default(false).notNull(),
	metadata: json(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const userCourseUnitProgress = pgTable("user_course_unit_progress", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	courseUnitId: integer("course_unit_id").notNull(),
	status: progressStatus().default('not_started').notNull(),
	completionPercentage: numeric("completion_percentage").default('0'),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_course_unit_progress_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.courseUnitId],
			foreignColumns: [courseUnits.id],
			name: "user_course_unit_progress_course_unit_id_course_units_id_fk"
		}).onDelete("cascade"),
	unique("user_course_unit_progress_user_id_course_unit_id_unique").on(table.userId, table.courseUnitId),
]);

export const subOrganizations = pgTable("sub_organizations", {
	id: serial().primaryKey().notNull(),
	organizationId: integer("organization_id").notNull(),
	name: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "sub_organizations_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
]);

export const organizations = pgTable("organizations", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	assetId: integer("asset_id"),
	subAssetId: integer("sub_asset_id"),
}, (table) => [
	foreignKey({
			columns: [table.assetId],
			foreignColumns: [assets.id],
			name: "organizations_asset_id_assets_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.subAssetId],
			foreignColumns: [subAssets.id],
			name: "organizations_sub_asset_id_sub_assets_id_fk"
		}).onDelete("cascade"),
	unique("organizations_name_unique").on(table.name),
]);

export const unitRoleAssignments = pgTable("unit_role_assignments", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	unitIds: integer("unit_ids").array().default([]).notNull(),
	roleCategoryId: integer("role_category_id"),
	seniorityLevelId: integer("seniority_level_id"),
	assetId: integer("asset_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.roleCategoryId],
			foreignColumns: [roleCategories.id],
			name: "unit_role_assignments_role_category_id_role_categories_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.seniorityLevelId],
			foreignColumns: [seniorityLevels.id],
			name: "unit_role_assignments_seniority_level_id_seniority_levels_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.assetId],
			foreignColumns: [assets.id],
			name: "unit_role_assignments_asset_id_assets_id_fk"
		}).onDelete("set null"),
	unique("unique_unit_role_assignment").on(table.name, table.roleCategoryId, table.seniorityLevelId, table.assetId),
]);
