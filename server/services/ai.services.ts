import { db } from "../db/connection";
import { eq, and, desc } from "drizzle-orm";
import {
    users,
    normalUsers,
    trainingAreas,
    modules,
    courses,
    units,
    courseUnits,
    userTrainingAreaProgress,
    userModuleProgress,
    userCourseProgress,
    userCourseUnitProgress,
    userLearningBlockProgress,
    certificates,
    assessmentAttempts,
    assessments,
    badges,
    userBadges,
} from "../db/schema";

export interface AIUserTrainingContext {
    userId: number;
    frontendUrl: string;
    trainingAreas: Array<{
        id: number;
        name: string;
        description: string | null;
        imageUrl: string | null;
        status: string;
        completionPercentage: string;
        modules: Array<{
            id: number;
            name: string;
            description: string | null;
            imageUrl: string | null;
            status: string;
            completionPercentage: string;
            courses: Array<{
                id: number;
                name: string;
                description: string | null;
                imageUrl: string | null;
                level: string;
                duration: number | null;
                showDuration: boolean;
                showLevel: boolean;
                status: string;
                completionPercentage: string;
                unitsTotal: number;
                unitsCompleted: number;
                courseUrl: string;
            }>;
        }>;
    }>;
    certificates: Array<{
        id: number;
        trainingAreaName: string;
        certificateNumber: string;
        issueDate: Date;
        expiryDate: Date;
        status: string;
    }>;
    assessments: {
        totalAttempts: number;
        totalPassed: number;
        recentAttempts: Array<{
            assessmentTitle: string;
            score: number;
            passed: boolean;
            completedAt: Date;
        }>;
    };
    badges: Array<{
        name: string;
        description: string;
        earnedAt: Date;
    }>;
    overallProgress: {
        totalTrainingAreas: number;
        completedTrainingAreas: number;
        inProgressTrainingAreas: number;
        totalCourses: number;
        completedCourses: number;
        inProgressCourses: number;
    };
}

export class AIService {
    /**
     * Get comprehensive training context for AI chatbot
     * This provides all relevant training information without sensitive personal data
     */
    static async getUserTrainingContext(
        userId: number
    ): Promise<{ success: boolean; message: string; data?: AIUserTrainingContext }> {
        try {
            // Get frontend URL from environment
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

            // Verify user exists
            const [user] = await db
                .select({
                    id: users.id,
                })
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                };
            }

            // Get all training areas with progress
            const trainingAreasData = await db
                .select({
                    id: trainingAreas.id,
                    name: trainingAreas.name,
                    description: trainingAreas.description,
                    imageUrl: trainingAreas.imageUrl,
                    progressStatus: userTrainingAreaProgress.status,
                    completionPercentage: userTrainingAreaProgress.completionPercentage,
                })
                .from(trainingAreas)
                .leftJoin(
                    userTrainingAreaProgress,
                    and(
                        eq(userTrainingAreaProgress.trainingAreaId, trainingAreas.id),
                        eq(userTrainingAreaProgress.userId, userId)
                    )
                );

            // Get all modules with progress
            const modulesData = await db
                .select({
                    id: modules.id,
                    name: modules.name,
                    description: modules.description,
                    imageUrl: modules.imageUrl,
                    trainingAreaId: modules.trainingAreaId,
                    progressStatus: userModuleProgress.status,
                    completionPercentage: userModuleProgress.completionPercentage,
                })
                .from(modules)
                .leftJoin(
                    userModuleProgress,
                    and(
                        eq(userModuleProgress.moduleId, modules.id),
                        eq(userModuleProgress.userId, userId)
                    )
                );

            // Get all courses with progress
            const coursesData = await db
                .select({
                    id: courses.id,
                    name: courses.name,
                    description: courses.description,
                    imageUrl: courses.imageUrl,
                    level: courses.level,
                    duration: courses.duration,
                    showDuration: courses.showDuration,
                    showLevel: courses.showLevel,
                    moduleId: courses.moduleId,
                    progressStatus: userCourseProgress.status,
                    completionPercentage: userCourseProgress.completionPercentage,
                })
                .from(courses)
                .leftJoin(
                    userCourseProgress,
                    and(
                        eq(userCourseProgress.courseId, courses.id),
                        eq(userCourseProgress.userId, userId)
                    )
                );

            // Get course units progress
            const courseUnitsData = await db
                .select({
                    courseId: courseUnits.courseId,
                    unitId: courseUnits.unitId,
                    progressStatus: userCourseUnitProgress.status,
                })
                .from(courseUnits)
                .leftJoin(
                    userCourseUnitProgress,
                    and(
                        eq(userCourseUnitProgress.courseUnitId, courseUnits.id),
                        eq(userCourseUnitProgress.userId, userId)
                    )
                );

            // Get certificates
            const certificatesData = await db
                .select({
                    id: certificates.id,
                    courseId: certificates.courseId,
                    certificateNumber: certificates.certificateNumber,
                    issueDate: certificates.issueDate,
                    expiryDate: certificates.expiryDate,
                    status: certificates.status,
                    courseName: courses.name,
                })
                .from(certificates)
                .innerJoin(courses, eq(certificates.courseId, courses.id))
                .where(eq(certificates.userId, userId));

            // Get assessment attempts (last 10)
            const assessmentAttemptsData = await db
                .select({
                    assessmentTitle: assessments.title,
                    score: assessmentAttempts.score,
                    passed: assessmentAttempts.passed,
                    completedAt: assessmentAttempts.completedAt,
                })
                .from(assessmentAttempts)
                .innerJoin(assessments, eq(assessmentAttempts.assessmentId, assessments.id))
                .where(eq(assessmentAttempts.userId, userId))
                .orderBy(desc(assessmentAttempts.completedAt))
                .limit(10);

            // Get user badges
            const badgesData = await db
                .select({
                    name: badges.name,
                    description: badges.description,
                    earnedAt: userBadges.earnedAt,
                })
                .from(userBadges)
                .innerJoin(badges, eq(userBadges.badgeId, badges.id))
                .where(eq(userBadges.userId, userId))
                .orderBy(desc(userBadges.earnedAt));

            // Build hierarchical structure
            const trainingAreasWithHierarchy = trainingAreasData.map((ta) => {
                const taModules = modulesData
                    .filter((m) => m.trainingAreaId === ta.id)
                    .map((module) => {
                        const moduleCourses = coursesData
                            .filter((c) => c.moduleId === module.id)
                            .map((course) => {
                                const courseUnits = courseUnitsData.filter(
                                    (cu) => cu.courseId === course.id
                                );
                                const unitsTotal = courseUnits.length;
                                const unitsCompleted = courseUnits.filter(
                                    (cu) => cu.progressStatus === "completed"
                                ).length;

                                return {
                                    id: course.id,
                                    name: course.name,
                                    description: course.description,
                                    imageUrl: course.imageUrl,
                                    level: course.level,
                                    duration: course.duration,
                                    showDuration: course.showDuration,
                                    showLevel: course.showLevel,
                                    status: course.progressStatus || "not_started",
                                    completionPercentage: course.completionPercentage || "0",
                                    unitsTotal,
                                    unitsCompleted,
                                    courseUrl: `${frontendUrl}/user/courses/${course.id}`,
                                };
                            });

                        return {
                            id: module.id,
                            name: module.name,
                            description: module.description,
                            imageUrl: module.imageUrl,
                            status: module.progressStatus || "not_started",
                            completionPercentage: module.completionPercentage || "0",
                            courses: moduleCourses,
                        };
                    });

                return {
                    id: ta.id,
                    name: ta.name,
                    description: ta.description,
                    imageUrl: ta.imageUrl,
                    status: ta.progressStatus || "not_started",
                    completionPercentage: ta.completionPercentage || "0",
                    modules: taModules,
                };
            });

            // Calculate overall progress statistics
            const totalTrainingAreas = trainingAreasData.length;
            const completedTrainingAreas = trainingAreasData.filter(
                (ta) => ta.progressStatus === "completed"
            ).length;
            const inProgressTrainingAreas = trainingAreasData.filter(
                (ta) => ta.progressStatus === "in_progress"
            ).length;

            const totalCourses = coursesData.length;
            const completedCourses = coursesData.filter(
                (c) => c.progressStatus === "completed"
            ).length;
            const inProgressCourses = coursesData.filter(
                (c) => c.progressStatus === "in_progress"
            ).length;

            // Build assessment summary
            const totalAttempts = assessmentAttemptsData.length;
            const totalPassed = assessmentAttemptsData.filter((a) => a.passed).length;

            const context: AIUserTrainingContext = {
                userId: user.id,
                frontendUrl,
                trainingAreas: trainingAreasWithHierarchy,
                certificates: certificatesData.map((cert) => ({
                    id: cert.id,
                    trainingAreaName: cert.courseName,
                    certificateNumber: cert.certificateNumber,
                    issueDate: cert.issueDate,
                    expiryDate: cert.expiryDate,
                    status: cert.status,
                })),
                assessments: {
                    totalAttempts,
                    totalPassed,
                    recentAttempts: assessmentAttemptsData.map((attempt) => ({
                        assessmentTitle: attempt.assessmentTitle,
                        score: attempt.score,
                        passed: attempt.passed,
                        completedAt: attempt.completedAt,
                    })),
                },
                badges: badgesData.map((badge) => ({
                    name: badge.name,
                    description: badge.description,
                    earnedAt: badge.earnedAt,
                })),
                overallProgress: {
                    totalTrainingAreas,
                    completedTrainingAreas,
                    inProgressTrainingAreas,
                    totalCourses,
                    completedCourses,
                    inProgressCourses,
                },
            };

            return {
                success: true,
                message: "User training context retrieved successfully",
                data: context,
            };
        } catch (error) {
            console.error("Error getting user training context:", error);
            return {
                success: false,
                message: "Failed to retrieve user training context",
            };
        }
    }
}

