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
        trainingAreaName: string;
    }>;
    certificates: Array<{
        id: number;
        trainingAreaName: string;
        certificateNumber: string;
        issueDate: Date;
        expiryDate: Date;
        status: string;
    }>;
    overallProgress: {
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

            // Get all courses with progress and training area info
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
                    trainingAreaId: modules.trainingAreaId,
                    trainingAreaName: trainingAreas.name,
                })
                .from(courses)
                .innerJoin(modules, eq(courses.moduleId, modules.id))
                .innerJoin(trainingAreas, eq(modules.trainingAreaId, trainingAreas.id))
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

            // Get certificates with training area name
            const certificatesData = await db
                .select({
                    id: certificates.id,
                    courseId: certificates.courseId,
                    certificateNumber: certificates.certificateNumber,
                    issueDate: certificates.issueDate,
                    expiryDate: certificates.expiryDate,
                    status: certificates.status,
                    courseName: courses.name,
                    trainingAreaName: trainingAreas.name,
                })
                .from(certificates)
                .innerJoin(courses, eq(certificates.courseId, courses.id))
                .innerJoin(modules, eq(courses.moduleId, modules.id))
                .innerJoin(trainingAreas, eq(modules.trainingAreaId, trainingAreas.id))
                .where(eq(certificates.userId, userId));

            // Build flat course list with training area name
            const coursesList = coursesData.map((course) => {
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
                    trainingAreaName: course.trainingAreaName,
                };
            });

            // Calculate overall progress statistics
            const totalCourses = coursesData.length;
            const completedCourses = coursesData.filter(
                (c) => c.progressStatus === "completed"
            ).length;
            const inProgressCourses = coursesData.filter(
                (c) => c.progressStatus === "in_progress"
            ).length;

            const context: AIUserTrainingContext = {
                userId: user.id,
                frontendUrl,
                courses: coursesList,
                certificates: certificatesData.map((cert) => ({
                    id: cert.id,
                    trainingAreaName: cert.trainingAreaName,
                    certificateNumber: cert.certificateNumber,
                    issueDate: cert.issueDate,
                    expiryDate: cert.expiryDate,
                    status: cert.status,
                })),
                overallProgress: {
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

