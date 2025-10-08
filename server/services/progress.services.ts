import { eq, and, desc, count, sql, inArray } from "drizzle-orm";
import { db } from "../db/connection";
import {
  userTrainingAreaProgress,
  userModuleProgress,
  userCourseProgress,
  userCourseUnitProgress,
  userLearningBlockProgress,
} from "../db/schema/progress";
import {
  trainingAreas,
  modules,
  courses,
  units,
  courseUnits,
  learningBlocks,
  unitRoleAssignments,
} from "../db/schema/training";
import {
  roleCategories,
  seniorityLevels,
  assets,
} from "../db/schema/users";
import { assessments, assessmentAttempts } from "../db/schema/assessments";
import { courseEnrollments } from "../db/schema/system";
import { certificates } from "../db/schema/gamification";
import { users } from "../db/schema/users";
import { sendByType } from "./email.services";
import { CourseUnitService } from "./training.services";
import type {
  UserTrainingAreaProgress,
  NewUserTrainingAreaProgress,
  UserModuleProgress,
  NewUserModuleProgress,
  UserCourseProgress,
  NewUserCourseProgress,
  UserCourseUnitProgress,
  NewUserCourseUnitProgress,
  UserLearningBlockProgress,
  NewUserLearningBlockProgress,
  ProgressStatus,
} from "../db/types";

// ==================== COURSE ENROLLMENT HELPER ====================
export class CourseEnrollmentHelper {
  /**
   * Enroll user in a course if not already enrolled
   */
  static async enrollUserInCourse(
    tx: any,
    userId: number,
    courseId: number,
    enrollmentSource: string = "progress_triggered"
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user is already enrolled
      const existingEnrollment = await tx
        .select({ id: courseEnrollments.id })
        .from(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.userId, userId),
            eq(courseEnrollments.courseId, courseId)
          )
        )
        .limit(1);

      if (existingEnrollment[0]) {
        return {
          success: true,
          message: "User already enrolled in course",
        };
      }

      // Enroll user in the course
      await tx.insert(courseEnrollments).values({
        userId,
        courseId,
        enrollmentSource,
      });

      return {
        success: true,
        message: "User enrolled in course successfully",
      };
    } catch (error) {
      console.error("Error enrolling user in course:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

// ==================== CERTIFICATE HELPER ====================
export class CertificateHelper {
  /**
   * Generate certificate for user when they complete a training area
   */
  static async generateTrainingAreaCertificate(
    tx: any,
    userId: number,
    trainingAreaId: number
  ): Promise<{ success: boolean; message: string; certificateId?: number }> {
    try {
      // Check if certificate already exists for this user and training area
      const existingCertificate = await tx
        .select({ id: certificates.id })
        .from(certificates)
        .where(
          and(
            eq(certificates.userId, userId),
            eq(certificates.courseId, trainingAreaId) // Using courseId field for training area
          )
        )
        .limit(1);

      if (existingCertificate[0]) {
        return {
          success: true,
          message: "Certificate already exists for this training area",
          certificateId: existingCertificate[0].id,
        };
      }

      // Generate certificate number (you can customize this format)
      const certificateNumber = `TA-${trainingAreaId}-${userId}-${Date.now()}`;

      // Calculate expiry date (e.g., 2 years from now)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);

      // Create certificate
      const newCertificate = await tx
        .insert(certificates)
        .values({
          userId,
          courseId: trainingAreaId, // Using courseId field to store training area ID
          certificateNumber,
          expiryDate,
          status: "active",
        })
        .returning({ id: certificates.id });

      const user = await tx.select().from(users).where(eq(users.id, userId));
      const trainingArea = await tx
        .select()
        .from(trainingAreas)
        .where(eq(trainingAreas.id, trainingAreaId));

      sendByType({
        type: "certificate_available",
        to: user[0].email,
        data: {
          name: user[0].firstName,
          trainingAreaName: trainingArea.name,
          url: `${process.env.FRONTEND_URL}/certificate/${newCertificate[0].id}`,
        },
      });

      return {
        success: true,
        message: "Certificate generated successfully",
        certificateId: newCertificate[0].id,
      };
    } catch (error) {
      console.error("Error generating certificate:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

// ==================== ASSESSMENT PROGRESS HELPER ====================
export class AssessmentProgressHelper {
  /**
   * Get assessment completion status for a user in a course
   */
  static async getAssessmentCompletionStatus(
    tx: any,
    userId: number,
    courseId: number
  ): Promise<{ completed: number; total: number; percentage: number }> {
    // Get all assessments for the course
    const courseAssessments = await tx
      .select({ id: assessments.id })
      .from(assessments)
      .where(eq(assessments.courseId, courseId));

    const totalAssessments = courseAssessments.length;

    if (totalAssessments === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    // Get completed assessments (only 1 attempt per user per assessment)
    const completedAssessments = await tx
      .select({ count: sql`COUNT(DISTINCT ${assessmentAttempts.assessmentId})` })
      .from(assessmentAttempts)
      .innerJoin(
        assessments,
        eq(assessments.id, assessmentAttempts.assessmentId)
      )
      .where(
        and(
          eq(assessmentAttempts.userId, userId),
          eq(assessments.courseId, courseId)
        )
      );

    const completed = completedAssessments[0]?.count || 0;
    const percentage =
      totalAssessments > 0 ? (completed / totalAssessments) * 100 : 0;

    return { completed, total: totalAssessments, percentage };
  }
}

// ==================== LEARNING BLOCK PROGRESS SERVICE ====================
export class LearningBlockProgressService {
  /**
   * Mark a learning block as completed and cascade progress updates
   */
  static async completeLearningBlock(
    userId: number,
    learningBlockId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Start a transaction to ensure all updates happen together
      const result = await db.transaction(async (tx) => {
        // 1. Mark the learning block as completed
        const learningBlockProgress = await tx
          .insert(userLearningBlockProgress)
          .values({
            userId,
            learningBlockId,
            status: "completed",
            startedAt: new Date(),
            completedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [
              userLearningBlockProgress.userId,
              userLearningBlockProgress.learningBlockId,
            ],
            set: {
              status: "completed",
              completedAt: new Date(),
            },
          })
          .returning();

        if (!learningBlockProgress[0]) {
          throw new Error("Failed to update learning block progress");
        }

        // 2. Get all course-units this learning block belongs to
        const courseUnitsForBlock = await tx
          .select({
            courseUnitId: courseUnits.id,
            courseId: courseUnits.courseId,
          })
          .from(learningBlocks)
          .innerJoin(courseUnits, eq(courseUnits.unitId, learningBlocks.unitId))
          .where(eq(learningBlocks.id, learningBlockId));

        if (courseUnitsForBlock.length === 0) {
          throw new Error("Learning block not found in any course");
        }

        // 3. Update progress for all course-units this learning block belongs to
        for (const courseUnit of courseUnitsForBlock) {
          await this.updateCourseUnitProgress(
            tx,
            userId,
            courseUnit.courseUnitId,
            courseUnit.courseId
          );
        }

        return {
          success: true,
          message: "Learning block completed successfully",
        };
      });

      return result;
    } catch (error) {
      console.error("Error completing learning block:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get learning block progress for a user
   */
  static async getUserLearningBlockProgress(
    userId: number,
    learningBlockId?: number
  ): Promise<UserLearningBlockProgress[]> {
    const whereCondition = learningBlockId
      ? and(
        eq(userLearningBlockProgress.userId, userId),
        eq(userLearningBlockProgress.learningBlockId, learningBlockId)
      )
      : eq(userLearningBlockProgress.userId, userId);

    return await db
      .select()
      .from(userLearningBlockProgress)
      .where(whereCondition);
  }

  /**
   * Update course-unit progress based on completed learning blocks
   */
  private static async updateCourseUnitProgress(
    tx: any,
    userId: number,
    courseUnitId: number,
    courseId: number
  ) {
    // Get the unit ID for this course-unit
    const courseUnitInfo = await tx
      .select({ unitId: courseUnits.unitId })
      .from(courseUnits)
      .where(eq(courseUnits.id, courseUnitId))
      .limit(1);

    if (!courseUnitInfo[0]) {
      throw new Error("Course-unit not found");
    }

    const unitId = courseUnitInfo[0].unitId;

    // Get total learning blocks in the unit
    const totalBlocks = await tx
      .select({ count: count() })
      .from(learningBlocks)
      .where(eq(learningBlocks.unitId, unitId));

    // Get completed learning blocks for this user in this unit
    const completedBlocks = await tx
      .select({ count: count() })
      .from(userLearningBlockProgress)
      .innerJoin(
        learningBlocks,
        eq(learningBlocks.id, userLearningBlockProgress.learningBlockId)
      )
      .where(
        and(
          eq(userLearningBlockProgress.userId, userId),
          eq(learningBlocks.unitId, unitId),
          eq(userLearningBlockProgress.status, "completed")
        )
      );

    const total = totalBlocks[0]?.count || 0;
    const completed = completedBlocks[0]?.count || 0;
    const completionPercentage = total > 0 ? (completed / total) * 100 : 0;
    const status: ProgressStatus =
      completionPercentage === 100
        ? "completed"
        : completionPercentage > 0
          ? "in_progress"
          : "not_started";

    // Update or create course-unit progress
    await tx
      .insert(userCourseUnitProgress)
      .values({
        userId,
        courseUnitId,
        status: status as "not_started" | "in_progress" | "completed" as string,
        completionPercentage: completionPercentage.toString(),
        startedAt: new Date(),
        completedAt: status === "completed" ? new Date() : new Date(),
      })
      .onConflictDoUpdate({
        target: [
          userCourseUnitProgress.userId,
          userCourseUnitProgress.courseUnitId,
        ],
        set: {
          status: status as
            | "not_started"
            | "in_progress"
            | "completed" as string,
          completionPercentage: completionPercentage.toString(),
          completedAt:
            status === "completed" ? new Date() : sql`EXCLUDED.completed_at`,
        },
      });

    // Always update course progress when course-unit progress changes
    await this.updateCourseProgress(tx, userId, courseId);
  }

  /**
   * Update course progress based on completed course-units and assessments
   */
  static async updateCourseProgress(tx: any, userId: number, courseId: number) {
    // First, enroll user in the course if they're not already enrolled
    await CourseEnrollmentHelper.enrollUserInCourse(tx, userId, courseId);
    // Get all course-units in the course with their progress
    const courseUnitsWithProgress = await tx
      .select({
        courseUnitId: courseUnits.id,
        completionPercentage: userCourseUnitProgress.completionPercentage,
      })
      .from(courseUnits)
      .leftJoin(
        userCourseUnitProgress,
        and(
          eq(userCourseUnitProgress.courseUnitId, courseUnits.id),
          eq(userCourseUnitProgress.userId, userId)
        )
      )
      .where(eq(courseUnits.courseId, courseId));

    // Calculate course-unit completion percentage
    const totalCourseUnits = courseUnitsWithProgress.length;
    const courseUnitCompletionPercentage = courseUnitsWithProgress.reduce(
      (sum: number, item: any) => {
        const percentage = parseFloat(item.completionPercentage || "0");
        return sum + percentage;
      },
      0
    );

    const courseUnitPercentage =
      totalCourseUnits > 0
        ? courseUnitCompletionPercentage / totalCourseUnits
        : 0;

    // Get assessment completion status
    const assessmentStatus =
      await AssessmentProgressHelper.getAssessmentCompletionStatus(
        tx,
        userId,
        courseId
      );

    // Calculate combined completion percentage
    // If course has both course-units and assessments, average them
    // If course has only one type, use that percentage
    let completionPercentage = 0;

    if (totalCourseUnits > 0 && assessmentStatus.total > 0) {
      // Course has both course-units and assessments - average them
      completionPercentage =
        (courseUnitPercentage + assessmentStatus.percentage) / 2;
    } else if (totalCourseUnits > 0) {
      // Course has only course-units
      completionPercentage = courseUnitPercentage;
    } else if (assessmentStatus.total > 0) {
      // Course has only assessments
      completionPercentage = assessmentStatus.percentage;
    }
    const status: ProgressStatus =
      completionPercentage === 100
        ? "completed"
        : completionPercentage > 0
          ? "in_progress"
          : "not_started";

    // Update or create course progress
    await tx
      .insert(userCourseProgress)
      .values({
        userId,
        courseId,
        status: status as "not_started" | "in_progress" | "completed" as string,
        completionPercentage: completionPercentage.toString(),
        startedAt: new Date(),
        completedAt: status === "completed" ? new Date() : new Date(),
      })
      .onConflictDoUpdate({
        target: [userCourseProgress.userId, userCourseProgress.courseId],
        set: {
          status: status as
            | "not_started"
            | "in_progress"
            | "completed" as string,
          completionPercentage: completionPercentage.toString(),
          completedAt:
            status === "completed" ? new Date() : sql`EXCLUDED.completed_at`,
        },
      });

    // Always update module progress when course progress changes
    // Get the module this course belongs to
    const course = await tx
      .select({ moduleId: courses.moduleId })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (course[0]) {
      await this.updateModuleProgress(tx, userId, course[0].moduleId);
    }
  }

  /**
   * Update module progress based on completed courses
   */
  private static async updateModuleProgress(
    tx: any,
    userId: number,
    moduleId: number
  ) {
    // Get all courses in the module with their progress
    const coursesWithProgress = await tx
      .select({
        courseId: courses.id,
        completionPercentage: userCourseProgress.completionPercentage,
      })
      .from(courses)
      .leftJoin(
        userCourseProgress,
        and(
          eq(userCourseProgress.courseId, courses.id),
          eq(userCourseProgress.userId, userId)
        )
      )
      .where(eq(courses.moduleId, moduleId));

    // Calculate average completion percentage
    const totalCourses = coursesWithProgress.length;
    const totalCompletionPercentage = coursesWithProgress.reduce(
      (sum: number, item: any) => {
        const percentage = parseFloat(item.completionPercentage || "0");
        return sum + percentage;
      },
      0
    );

    const completionPercentage =
      totalCourses > 0 ? totalCompletionPercentage / totalCourses : 0;
    const status: ProgressStatus =
      completionPercentage === 100
        ? "completed"
        : completionPercentage > 0
          ? "in_progress"
          : "not_started";

    // Update or create module progress
    await tx
      .insert(userModuleProgress)
      .values({
        userId,
        moduleId,
        status: status as "not_started" | "in_progress" | "completed" as string,
        completionPercentage: completionPercentage.toString(),
        startedAt: new Date(),
        completedAt: status === "completed" ? new Date() : new Date(),
      })
      .onConflictDoUpdate({
        target: [userModuleProgress.userId, userModuleProgress.moduleId],
        set: {
          status: status as
            | "not_started"
            | "in_progress"
            | "completed" as string,
          completionPercentage: completionPercentage.toString(),
          completedAt:
            status === "completed" ? new Date() : sql`EXCLUDED.completed_at`,
        },
      });

    // Always update training area progress when module progress changes
    // Get the training area this module belongs to
    const module = await tx
      .select({ trainingAreaId: modules.trainingAreaId })
      .from(modules)
      .where(eq(modules.id, moduleId))
      .limit(1);

    if (module[0]) {
      await this.updateTrainingAreaProgress(
        tx,
        userId,
        module[0].trainingAreaId
      );
    }
  }

  /**
   * Update training area progress based on completed modules
   */
  private static async updateTrainingAreaProgress(
    tx: any,
    userId: number,
    trainingAreaId: number
  ) {
    // Get all modules in the training area with their progress
    const modulesWithProgress = await tx
      .select({
        moduleId: modules.id,
        completionPercentage: userModuleProgress.completionPercentage,
      })
      .from(modules)
      .leftJoin(
        userModuleProgress,
        and(
          eq(userModuleProgress.moduleId, modules.id),
          eq(userModuleProgress.userId, userId)
        )
      )
      .where(eq(modules.trainingAreaId, trainingAreaId));

    // Calculate average completion percentage
    const totalModules = modulesWithProgress.length;
    const totalCompletionPercentage = modulesWithProgress.reduce(
      (sum: number, item: any) => {
        const percentage = parseFloat(item.completionPercentage || "0");
        return sum + percentage;
      },
      0
    );

    const completionPercentage =
      totalModules > 0 ? totalCompletionPercentage / totalModules : 0;
    const status: ProgressStatus =
      completionPercentage === 100
        ? "completed"
        : completionPercentage > 0
          ? "in_progress"
          : "not_started";

    // Update or create training area progress
    await tx
      .insert(userTrainingAreaProgress)
      .values({
        userId,
        trainingAreaId,
        status: status as "not_started" | "in_progress" | "completed" as string,
        completionPercentage: completionPercentage.toString(),
        startedAt: new Date(),
        completedAt: status === "completed" ? new Date() : new Date(),
      })
      .onConflictDoUpdate({
        target: [
          userTrainingAreaProgress.userId,
          userTrainingAreaProgress.trainingAreaId,
        ],
        set: {
          status: status as
            | "not_started"
            | "in_progress"
            | "completed" as string,
          completionPercentage: completionPercentage.toString(),
          completedAt:
            status === "completed" ? new Date() : sql`EXCLUDED.completed_at`,
        },
      });

    // Generate certificate if training area is 100% completed
    if (status === "completed" && completionPercentage === 100) {
      await CertificateHelper.generateTrainingAreaCertificate(
        tx,
        userId,
        trainingAreaId
      );
    }
  }
}

// ==================== ASSESSMENT PROGRESS TRIGGER ====================
export class AssessmentProgressTrigger {
  /**
   * Trigger course progress update when assessment is completed
   */
  static async triggerCourseProgressUpdate(
    userId: number,
    assessmentId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await db.transaction(async (tx) => {
        // Get the course ID for this assessment
        const assessment = await tx
          .select({ courseId: assessments.courseId })
          .from(assessments)
          .where(eq(assessments.id, assessmentId))
          .limit(1);

        if (!assessment[0] || !assessment[0].courseId) {
          throw new Error("Assessment not found or not linked to a course");
        }

        const courseId = assessment[0].courseId;

        // Update course progress (this will cascade to module and training area)
        await LearningBlockProgressService.updateCourseProgress(
          tx,
          userId,
          courseId
        );

        return {
          success: true,
          message: "Course progress updated successfully",
        };
      });

      return result;
    } catch (error) {
      console.error("Error updating course progress after assessment:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

// ==================== PROGRESS RETRIEVAL SERVICES ====================
export class ProgressService {
  /**
   * Get all progress for a user across all levels
   */
  static async getUserProgress(userId: number) {
    const [
      trainingAreaProgress,
      moduleProgress,
      courseProgress,
      courseUnitProgress,
      learningBlockProgress,
    ] = await Promise.all([
      this.getUserTrainingAreaProgress(userId),
      this.getUserModuleProgress(userId),
      this.getUserCourseProgress(userId),
      this.getUserCourseUnitProgress(userId),
      this.getUserLearningBlockProgress(userId),
    ]);

    return {
      trainingAreaProgress,
      moduleProgress,
      courseProgress,
      courseUnitProgress,
      learningBlockProgress,
    };
  }

  /**
   * Get training area progress for a user
   */
  static async getUserTrainingAreaProgress(
    userId: number,
    trainingAreaId?: number
  ): Promise<UserTrainingAreaProgress[]> {
    const whereCondition = trainingAreaId
      ? and(
        eq(userTrainingAreaProgress.userId, userId),
        eq(userTrainingAreaProgress.trainingAreaId, trainingAreaId)
      )
      : eq(userTrainingAreaProgress.userId, userId);

    return await db
      .select()
      .from(userTrainingAreaProgress)
      .where(whereCondition);
  }

  /**
   * Get training area progress for multiple users and sum the progress
   */
  static async getBulkTrainingAreaProgress(userIds: number[]) {
    try {
      // Get all training area progress for the specified users
      const allProgress = await db
        .select()
        .from(userTrainingAreaProgress)
        .where(inArray(userTrainingAreaProgress.userId, userIds));

      // Group progress by training area ID and calculate sums
      const progressByTrainingArea = new Map<number, {
        trainingAreaId: number;
        totalUsers: number;
        totalProgress: number;
        averageProgress: number;
        completedUsers: number;
        inProgressUsers: number;
        notStartedUsers: number;
      }>();

      // Initialize counters for each training area
      for (const progress of allProgress) {
        if (!progressByTrainingArea.has(progress.trainingAreaId)) {
          progressByTrainingArea.set(progress.trainingAreaId, {
            trainingAreaId: progress.trainingAreaId,
            totalUsers: 0,
            totalProgress: 0,
            averageProgress: 0,
            completedUsers: 0,
            inProgressUsers: 0,
            notStartedUsers: 0,
          });
        }
      }

      // Count users per training area (including users with no progress)
      const userCountsByTrainingArea = new Map<number, number>();
      for (const userId of userIds) {
        const userProgress = allProgress.filter(p => p.userId === userId);
        const trainingAreaIds = userProgress.map(p => p.trainingAreaId);
        
        // Get all training areas that exist in the system
        const allTrainingAreas = await db.select({ id: trainingAreas.id }).from(trainingAreas);
        
        for (const ta of allTrainingAreas) {
          if (!userCountsByTrainingArea.has(ta.id)) {
            userCountsByTrainingArea.set(ta.id, 0);
          }
          userCountsByTrainingArea.set(ta.id, userCountsByTrainingArea.get(ta.id)! + 1);
        }
      }

      // Calculate progress statistics
      for (const progress of allProgress) {
        const stats = progressByTrainingArea.get(progress.trainingAreaId)!;
        const progressPercentage = parseFloat(progress.completionPercentage || "0");
        
        stats.totalUsers = userCountsByTrainingArea.get(progress.trainingAreaId) || 0;
        stats.totalProgress += progressPercentage;
        
        if (progress.status === "completed") {
          stats.completedUsers++;
        } else if (progress.status === "in_progress") {
          stats.inProgressUsers++;
        } else {
          stats.notStartedUsers++;
        }
      }

      // Calculate averages and handle users with no progress
      for (const [trainingAreaId, stats] of progressByTrainingArea) {
        const totalUsers = userCountsByTrainingArea.get(trainingAreaId) || 0;
        const usersWithProgress = allProgress.filter(p => p.trainingAreaId === trainingAreaId).length;
        const usersWithoutProgress = totalUsers - usersWithProgress;
        
        stats.totalUsers = totalUsers;
        stats.notStartedUsers += usersWithoutProgress;
        stats.averageProgress = totalUsers > 0 ? stats.totalProgress / totalUsers : 0;
      }

      // Convert map to array and get training area names
      const result = [];
      for (const [trainingAreaId, stats] of progressByTrainingArea) {
        const trainingArea = await db
          .select({ name: trainingAreas.name })
          .from(trainingAreas)
          .where(eq(trainingAreas.id, trainingAreaId))
          .limit(1);

        result.push({
          ...stats,
          trainingAreaName: trainingArea[0]?.name || "Unknown Training Area",
        });
      }

      return result;
    } catch (error) {
      console.error("Error getting bulk training area progress:", error);
      throw error;
    }
  }

  /**
   * Get module progress for a user
   */
  static async getUserModuleProgress(
    userId: number,
    moduleId?: number
  ): Promise<UserModuleProgress[]> {
    const whereCondition = moduleId
      ? and(
        eq(userModuleProgress.userId, userId),
        eq(userModuleProgress.moduleId, moduleId)
      )
      : eq(userModuleProgress.userId, userId);

    return await db.select().from(userModuleProgress).where(whereCondition);
  }

  /**
   * Get course progress for a user
   */
  static async getUserCourseProgress(
    userId: number,
    courseId?: number
  ): Promise<UserCourseProgress[]> {
    const whereCondition = courseId
      ? and(
        eq(userCourseProgress.userId, userId),
        eq(userCourseProgress.courseId, courseId)
      )
      : eq(userCourseProgress.userId, userId);

    return await db.select().from(userCourseProgress).where(whereCondition);
  }

  /**
   * Get course-unit progress for a user
   */
  static async getUserCourseUnitProgress(
    userId: number,
    courseUnitId?: number
  ): Promise<UserCourseUnitProgress[]> {
    const whereCondition = courseUnitId
      ? and(
        eq(userCourseUnitProgress.userId, userId),
        eq(userCourseUnitProgress.courseUnitId, courseUnitId)
      )
      : eq(userCourseUnitProgress.userId, userId);

    return await db.select().from(userCourseUnitProgress).where(whereCondition);
  }

  /**
   * Get learning block progress for a user
   */
  static async getUserLearningBlockProgress(
    userId: number,
    learningBlockId?: number
  ): Promise<UserLearningBlockProgress[]> {
    const whereCondition = learningBlockId
      ? and(
        eq(userLearningBlockProgress.userId, userId),
        eq(userLearningBlockProgress.learningBlockId, learningBlockId)
      )
      : eq(userLearningBlockProgress.userId, userId);

    return await db
      .select()
      .from(userLearningBlockProgress)
      .where(whereCondition);
  }

  /**
   * Reset progress for a user (admin function)
   */
  static async resetUserProgress(
    userId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      await db.transaction(async (tx) => {
        await Promise.all([
          tx
            .delete(userLearningBlockProgress)
            .where(eq(userLearningBlockProgress.userId, userId)),
          tx
            .delete(userCourseUnitProgress)
            .where(eq(userCourseUnitProgress.userId, userId)),
          tx
            .delete(userCourseProgress)
            .where(eq(userCourseProgress.userId, userId)),
          tx
            .delete(userModuleProgress)
            .where(eq(userModuleProgress.userId, userId)),
          tx
            .delete(userTrainingAreaProgress)
            .where(eq(userTrainingAreaProgress.userId, userId)),
        ]);
      });

      return { success: true, message: "User progress reset successfully" };
    } catch (error) {
      console.error("Error resetting user progress:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get detailed progress with hierarchy information
   */
  static async getDetailedUserProgress(userId: number) {
    const trainingAreasWithProgress = await db
      .select({
        trainingArea: trainingAreas,
        progress: userTrainingAreaProgress,
      })
      .from(trainingAreas)
      .leftJoin(
        userTrainingAreaProgress,
        and(
          eq(userTrainingAreaProgress.trainingAreaId, trainingAreas.id),
          eq(userTrainingAreaProgress.userId, userId)
        )
      );

    const modulesWithProgress = await db
      .select({
        module: modules,
        progress: userModuleProgress,
        trainingAreaName: trainingAreas.name,
      })
      .from(modules)
      .leftJoin(trainingAreas, eq(trainingAreas.id, modules.trainingAreaId))
      .leftJoin(
        userModuleProgress,
        and(
          eq(userModuleProgress.moduleId, modules.id),
          eq(userModuleProgress.userId, userId)
        )
      );

    const coursesWithProgress = await db
      .select({
        course: courses,
        progress: userCourseProgress,
        moduleName: modules.name,
      })
      .from(courses)
      .leftJoin(modules, eq(modules.id, courses.moduleId))
      .leftJoin(
        userCourseProgress,
        and(
          eq(userCourseProgress.courseId, courses.id),
          eq(userCourseProgress.userId, userId)
        )
      );

    return {
      trainingAreas: trainingAreasWithProgress,
      modules: modulesWithProgress,
      courses: coursesWithProgress,
    };
  }

  /**
   * Recalculate all progress for a user from scratch
   * This will recalculate course-unit, course, module, and training area progress
   * based on completed learning blocks and assessments
   */
  static async recalculateUserProgress(
    userId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await db.transaction(async (tx) => {
        // Step 1: Get all course-units that have learning blocks completed by this user
        const courseUnitsToRecalculate = await tx
          .select({
            courseUnitId: courseUnits.id,
            courseId: courseUnits.courseId,
          })
          .from(courseUnits)
          .innerJoin(
            learningBlocks,
            eq(learningBlocks.unitId, courseUnits.unitId)
          )
          .innerJoin(
            userLearningBlockProgress,
            and(
              eq(userLearningBlockProgress.learningBlockId, learningBlocks.id),
              eq(userLearningBlockProgress.userId, userId)
            )
          )
          .groupBy(courseUnits.id, courseUnits.courseId);

        // Step 2: Recalculate course-unit progress
        const uniqueCourseUnits = Array.from(
          new Map(
            courseUnitsToRecalculate.map((cu) => [cu.courseUnitId, cu])
          ).values()
        );

        for (const courseUnit of uniqueCourseUnits) {
          await this.recalculateCourseUnitProgress(
            tx,
            userId,
            courseUnit.courseUnitId,
            courseUnit.courseId
          );
        }

        // Step 3: Get all courses that need recalculation (either have course-units or assessments attempted)
        const coursesToRecalculate = await tx
          .select({ courseId: courses.id })
          .from(courses)
          .where(
            sql`${courses.id} IN (
              SELECT DISTINCT ${courseUnits.courseId}
              FROM ${courseUnits}
              INNER JOIN ${learningBlocks} ON ${learningBlocks.unitId} = ${courseUnits.unitId}
              INNER JOIN ${userLearningBlockProgress} ON ${userLearningBlockProgress.learningBlockId} = ${learningBlocks.id}
              WHERE ${userLearningBlockProgress.userId} = ${userId}
              UNION
              SELECT DISTINCT ${assessments.courseId}
              FROM ${assessments}
              INNER JOIN ${assessmentAttempts} ON ${assessmentAttempts.assessmentId} = ${assessments.id}
              WHERE ${assessmentAttempts.userId} = ${userId}
            )`
          );

        // Step 4: Recalculate course progress
        for (const course of coursesToRecalculate) {
          await LearningBlockProgressService.updateCourseProgress(
            tx,
            userId,
            course.courseId
          );
        }

        // Step 5: Get all modules that need recalculation
        const modulesToRecalculate = await tx
          .select({ moduleId: modules.id })
          .from(modules)
          .where(
            sql`${modules.id} IN (
              SELECT DISTINCT ${courses.moduleId}
              FROM ${courses}
              WHERE ${courses.id} IN (${sql.join(
              coursesToRecalculate.map((c) => sql`${c.courseId}`),
              sql`, `
            )})
            )`
          );

        // Step 6: Recalculate module progress
        for (const module of modulesToRecalculate) {
          await this.recalculateModuleProgress(tx, userId, module.moduleId);
        }

        // Step 7: Get all training areas that need recalculation
        const trainingAreasToRecalculate = await tx
          .select({ trainingAreaId: trainingAreas.id })
          .from(trainingAreas)
          .where(
            sql`${trainingAreas.id} IN (
              SELECT DISTINCT ${modules.trainingAreaId}
              FROM ${modules}
              WHERE ${modules.id} IN (${sql.join(
              modulesToRecalculate.map((m) => sql`${m.moduleId}`),
              sql`, `
            )})
            )`
          );

        // Step 8: Recalculate training area progress
        for (const trainingArea of trainingAreasToRecalculate) {
          await this.recalculateTrainingAreaProgress(
            tx,
            userId,
            trainingArea.trainingAreaId
          );
        }

        return {
          success: true,
          message: `Progress recalculated successfully for ${courseUnitsToRecalculate.length} course-units, ${coursesToRecalculate.length} courses, ${modulesToRecalculate.length} modules, and ${trainingAreasToRecalculate.length} training areas`,
        };
      });

      return result;
    } catch (error) {
      console.error("Error recalculating user progress:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Recalculate course-unit progress based on completed learning blocks
   */
  private static async recalculateCourseUnitProgress(
    tx: any,
    userId: number,
    courseUnitId: number,
    courseId: number
  ) {
    // Get the unit ID for this course-unit
    const courseUnitInfo = await tx
      .select({ unitId: courseUnits.unitId })
      .from(courseUnits)
      .where(eq(courseUnits.id, courseUnitId))
      .limit(1);

    if (!courseUnitInfo[0]) {
      throw new Error("Course-unit not found");
    }

    const unitId = courseUnitInfo[0].unitId;

    // Get total learning blocks in the unit
    const totalBlocks = await tx
      .select({ count: count() })
      .from(learningBlocks)
      .where(eq(learningBlocks.unitId, unitId));

    // Get completed learning blocks for this user in this unit
    const completedBlocks = await tx
      .select({ count: count() })
      .from(userLearningBlockProgress)
      .innerJoin(
        learningBlocks,
        eq(learningBlocks.id, userLearningBlockProgress.learningBlockId)
      )
      .where(
        and(
          eq(userLearningBlockProgress.userId, userId),
          eq(learningBlocks.unitId, unitId),
          eq(userLearningBlockProgress.status, "completed")
        )
      );

    const total = totalBlocks[0]?.count || 0;
    const completed = completedBlocks[0]?.count || 0;
    const completionPercentage = total > 0 ? (completed / total) * 100 : 0;
    const status: ProgressStatus =
      completionPercentage === 100
        ? "completed"
        : completionPercentage > 0
          ? "in_progress"
          : "not_started";

    // Update or create course-unit progress
    await tx
      .insert(userCourseUnitProgress)
      .values({
        userId,
        courseUnitId,
        status: status as "not_started" | "in_progress" | "completed" as string,
        completionPercentage: completionPercentage.toString(),
        startedAt: new Date(),
        completedAt: status === "completed" ? new Date() : new Date(),
      })
      .onConflictDoUpdate({
        target: [
          userCourseUnitProgress.userId,
          userCourseUnitProgress.courseUnitId,
        ],
        set: {
          status: status as
            | "not_started"
            | "in_progress"
            | "completed" as string,
          completionPercentage: completionPercentage.toString(),
          completedAt:
            status === "completed" ? new Date() : sql`EXCLUDED.completed_at`,
        },
      });
  }

  /**
   * Recalculate module progress based on completed courses
   */
  private static async recalculateModuleProgress(
    tx: any,
    userId: number,
    moduleId: number
  ) {
    // Get all published courses in the module with their progress (exclude drafts)
    const coursesWithProgress = await tx
      .select({
        courseId: courses.id,
        completionPercentage: userCourseProgress.completionPercentage,
      })
      .from(courses)
      .leftJoin(
        userCourseProgress,
        and(
          eq(userCourseProgress.courseId, courses.id),
          eq(userCourseProgress.userId, userId)
        )
      )
      .where(
        and(eq(courses.moduleId, moduleId), eq(courses.status, "published"))
      );

    // Calculate average completion percentage
    const totalCourses = coursesWithProgress.length;
    const totalCompletionPercentage = coursesWithProgress.reduce(
      (sum: number, item: any) => {
        const percentage = parseFloat(item.completionPercentage || "0");
        return sum + percentage;
      },
      0
    );

    const completionPercentage =
      totalCourses > 0 ? totalCompletionPercentage / totalCourses : 0;
    const status: ProgressStatus =
      completionPercentage === 100
        ? "completed"
        : completionPercentage > 0
          ? "in_progress"
          : "not_started";

    // Update or create module progress
    await tx
      .insert(userModuleProgress)
      .values({
        userId,
        moduleId,
        status: status as "not_started" | "in_progress" | "completed" as string,
        completionPercentage: completionPercentage.toString(),
        startedAt: new Date(),
        completedAt: status === "completed" ? new Date() : new Date(),
      })
      .onConflictDoUpdate({
        target: [userModuleProgress.userId, userModuleProgress.moduleId],
        set: {
          status: status as
            | "not_started"
            | "in_progress"
            | "completed" as string,
          completionPercentage: completionPercentage.toString(),
          completedAt:
            status === "completed" ? new Date() : sql`EXCLUDED.completed_at`,
        },
      });
  }

  /**
   * Recalculate training area progress based on completed modules
   */
  private static async recalculateTrainingAreaProgress(
    tx: any,
    userId: number,
    trainingAreaId: number
  ) {
    // Get all modules in the training area with their progress
    const modulesWithProgress = await tx
      .select({
        moduleId: modules.id,
        completionPercentage: userModuleProgress.completionPercentage,
      })
      .from(modules)
      .leftJoin(
        userModuleProgress,
        and(
          eq(userModuleProgress.moduleId, modules.id),
          eq(userModuleProgress.userId, userId)
        )
      )
      .where(eq(modules.trainingAreaId, trainingAreaId));

    // Calculate average completion percentage
    const totalModules = modulesWithProgress.length;
    const totalCompletionPercentage = modulesWithProgress.reduce(
      (sum: number, item: any) => {
        const percentage = parseFloat(item.completionPercentage || "0");
        return sum + percentage;
      },
      0
    );

    const completionPercentage =
      totalModules > 0 ? totalCompletionPercentage / totalModules : 0;
    const status: ProgressStatus =
      completionPercentage === 100
        ? "completed"
        : completionPercentage > 0
          ? "in_progress"
          : "not_started";

    // Update or create training area progress
    await tx
      .insert(userTrainingAreaProgress)
      .values({
        userId,
        trainingAreaId,
        status: status as "not_started" | "in_progress" | "completed" as string,
        completionPercentage: completionPercentage.toString(),
        startedAt: new Date(),
        completedAt: status === "completed" ? new Date() : new Date(),
      })
      .onConflictDoUpdate({
        target: [
          userTrainingAreaProgress.userId,
          userTrainingAreaProgress.trainingAreaId,
        ],
        set: {
          status: status as
            | "not_started"
            | "in_progress"
            | "completed" as string,
          completionPercentage: completionPercentage.toString(),
          completedAt:
            status === "completed" ? new Date() : sql`EXCLUDED.completed_at`,
        },
      });

    // Generate certificate if training area is 100% completed
    if (status === "completed" && completionPercentage === 100) {
      await CertificateHelper.generateTrainingAreaCertificate(
        tx,
        userId,
        trainingAreaId
      );
    }
  }

  /**
   * Get learning path completion status based on asset, role category, course, and seniority
   */
  static async getLearningPathCompletion(
    assetName: string,
    roleCategoryName: string,
    courseId: number,
    seniority: string,
    userId: number
  ) {
    try {
      // Query database to get IDs for the provided names
      const [roleCategoryResult, seniorityResult, assetResult] = await Promise.all([
        // Get role category ID by name
        db
          .select({ id: roleCategories.id, name: roleCategories.name })
          .from(roleCategories)
          .where(eq(roleCategories.name, roleCategoryName))
          .limit(1),
        
        // Get seniority level ID by name
        db
          .select({ id: seniorityLevels.id, name: seniorityLevels.name })
          .from(seniorityLevels)
          .where(eq(seniorityLevels.name, seniority))
          .limit(1),
        
        // Get asset ID by name
        db
          .select({ id: assets.id, name: assets.name })
          .from(assets)
          .where(eq(assets.name, assetName))
          .limit(1),
      ]);

      // Check if user is a manager or staff (apply seniority filter for both)
      const isManager = seniority.toLowerCase() === 'manager';
      const isStaff = seniority.toLowerCase() === 'staff';
      
      // Check if all required entities were found
      if (!roleCategoryResult[0]) {
        throw new Error(`Role category '${roleCategoryName}' not found`);
      }
      if (!assetResult[0]) {
        throw new Error(`Asset '${assetName}' not found`);
      }
      
      // Validate seniority for managers and staff
      if ((isManager || isStaff) && !seniorityResult[0]) {
        throw new Error(`Seniority level '${seniority}' not found`);
      }

      const roleCategoryId = roleCategoryResult[0].id;
      const seniorityId = seniorityResult[0]?.id; // Only get seniorityId if seniority exists
      const assetId = assetResult[0].id;

      // Get course details
      const courseResult = await db
        .select()
        .from(courses)
        .where(eq(courses.id, courseId))
        .limit(1);

      if (!courseResult[0]) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      // Use the existing CourseUnitService to get course units
      const courseUnitsResult = await CourseUnitService.getCourseUnitsByCourse(courseId);

      // Query unit role assignments to find matching learning paths
      
      let unitRoleAssignmentsResult: any[] = [];
      
      if (isStaff && seniorityId) {
        // For staff: try with seniority filter first
        const staffWhereConditions = [
          eq(unitRoleAssignments.roleCategoryId, roleCategoryId),
          eq(unitRoleAssignments.assetId, assetId),
          eq(unitRoleAssignments.seniorityLevelId, seniorityId)
        ];
        
        unitRoleAssignmentsResult = await db
          .select()
          .from(unitRoleAssignments)
          .where(and(...staffWhereConditions));
        
        // If no results with seniority filter, fallback to without seniority
        if (unitRoleAssignmentsResult.length === 0) {
          const fallbackWhereConditions = [
            eq(unitRoleAssignments.roleCategoryId, roleCategoryId),
            eq(unitRoleAssignments.assetId, assetId)
          ];
          
          unitRoleAssignmentsResult = await db
            .select()
            .from(unitRoleAssignments)
            .where(and(...fallbackWhereConditions));
        }
      } else {
        // For non-staff: use existing logic (only managers get seniority filter)
        const whereConditions = [
          eq(unitRoleAssignments.roleCategoryId, roleCategoryId),
          eq(unitRoleAssignments.assetId, assetId)
        ];
        
        // Add seniority filter only for managers
        if (isManager && seniorityId) {
          whereConditions.push(eq(unitRoleAssignments.seniorityLevelId, seniorityId));
        }
        
        unitRoleAssignmentsResult = await db
          .select()
          .from(unitRoleAssignments)
          .where(and(...whereConditions));
      }

      // Get unit IDs from course units
      const courseUnitIds = courseUnitsResult.map(courseUnit => courseUnit.unitId);
      
      // Get assigned units from role assignments that are also in the course
      const assignedUnitIds = unitRoleAssignmentsResult.flatMap(assignment => assignment.unitIds);
      
      const filteredUnitIds = assignedUnitIds.filter(unitId => courseUnitIds.includes(unitId));
      
      const assignedUnits = filteredUnitIds.length > 0 
        ? await db
            .select()
            .from(units)
            .where(inArray(units.id, filteredUnitIds))
        : [];

      // Calculate completion status based on course units
      const totalUnits = courseUnitsResult.length;
      const completedUnits = 0; // This would be calculated based on actual user progress
      const completionPercentage = totalUnits > 0 ? (completedUnits / totalUnits) * 100 : 0;
      const status: ProgressStatus = 
        completionPercentage === 100 ? "completed" :
        completionPercentage > 0 ? "in_progress" : "not_started";

      const learningPathCompletion = {
        
        courseUnitIds: courseUnitsResult.map(courseUnit => courseUnit.unitId),
        pathUnitIds: unitRoleAssignmentsResult.flatMap(assignment => assignment.unitIds),
        unitRoleAssignments: unitRoleAssignmentsResult.map(assignment => ({
          id: assignment.id,
          name: assignment.name,
        })),
        show: courseUnitsResult.map(courseUnit => courseUnit.unitId).filter(unitId => 
          unitRoleAssignmentsResult.flatMap(assignment => assignment.unitIds).includes(unitId)
        ),
        complete: courseUnitsResult.map(courseUnit => courseUnit.unitId).filter(unitId => 
          !unitRoleAssignmentsResult.flatMap(assignment => assignment.unitIds).includes(unitId)
        ),
        
      };
      
      // Fetch additional data for complete units
      const completeUnitIds = learningPathCompletion.complete;
      const baseUrl = process.env.VITE_API_URL;
      
      const unitData = {
        assessments: [] as number[],
        learningBlocks: [] as number[]
      };

      // Loop through complete unit IDs and fetch data
      for (const unitId of completeUnitIds) {
        try {
          // Fetch assessments for this unit
          const assessmentsUrl = `${baseUrl}/api/assessments/assessments/units/${unitId}/`;
          const assessmentsResponse = await fetch(assessmentsUrl);
          
          if (assessmentsResponse.ok) {
            const assessmentsData: any = await assessmentsResponse.json();
            const assessmentIds = (assessmentsData.data || []).map((assessment: any) => assessment.id);
            unitData.assessments.push(...assessmentIds);
          }

          // Fetch learning blocks for this unit
          const learningBlocksUrl = `${baseUrl}/api/training/learning-blocks/unit/${unitId}/`;
          const learningBlocksResponse = await fetch(learningBlocksUrl);
          
          if (learningBlocksResponse.ok) {
            const learningBlocksData: any = await learningBlocksResponse.json();
            const learningBlockIds = (learningBlocksData.data || []).map((block: any) => block.id);
            unitData.learningBlocks.push(...learningBlockIds);
          }
        } catch (error) {
          console.error(`Error fetching data for unit ${unitId}:`, error);
        }
      }
      
      // Create assessment attempts for all assessments (mark as passed with score 100)
      if (unitData.assessments.length > 0) {
        for (const assessmentId of unitData.assessments) {
          try {
            // Check if assessment attempt already exists
            const existingAttemptsUrl = `${baseUrl}/api/assessments/users/${userId}/assessments/${assessmentId}/attempts`;
            const existingAttemptsResponse = await fetch(existingAttemptsUrl);
            
            if (existingAttemptsResponse.ok) {
              const existingAttempts: any = await existingAttemptsResponse.json();
              if (existingAttempts.data && existingAttempts.data.length > 0) {
                continue;
              }
            }

            // Create assessment attempt directly using service
            try {
              // Import the assessment attempt service
              const { AssessmentAttemptService } = await import('./assessment.services');
              
              await AssessmentAttemptService.createAssessmentAttempt({
                userId: userId,
                assessmentId: assessmentId,
                score: 100,
                passed: true,
                answers: null
              });
            } catch (serviceError) {
              console.error(`Failed to create assessment attempt for assessment ${assessmentId}:`, serviceError);
            }
          } catch (error) {
            console.error(`Error creating assessment attempt for assessment ${assessmentId}:`, error);
          }
        }
      }

      // Complete learning blocks for all learning blocks (mark as completed)
      if (unitData.learningBlocks.length > 0) {
        for (const learningBlockId of unitData.learningBlocks) {
          try {
            // Check if learning block is already completed
            const existingProgressUrl = `${baseUrl}/api/progress/learning-blocks/${userId}/${learningBlockId}`;
            const existingProgressResponse = await fetch(existingProgressUrl);
            
            if (existingProgressResponse.ok) {
              const existingProgress: any = await existingProgressResponse.json();
              if (existingProgress.data && existingProgress.data.length > 0) {
                const progress = existingProgress.data[0];
                if (progress.status === 'completed') {
                  continue;
                }
              }
            }

            // Complete learning block directly using service
            try {
              await LearningBlockProgressService.completeLearningBlock(userId, learningBlockId);
            } catch (serviceError) {
              console.error(`Failed to complete learning block ${learningBlockId}:`, serviceError);
            }
          } catch (error) {
            console.error(`Error completing learning block ${learningBlockId}:`, error);
          }
        }
      }

      // Add the fetched data to the response
      (learningPathCompletion as any).unitData = unitData;

      return learningPathCompletion.show;
    } catch (error) {
      console.error("Error getting learning path completion:", error);
      throw new Error(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }
}
