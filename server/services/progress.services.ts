import { eq, and, desc, count, sql } from "drizzle-orm";
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
} from "../db/schema/training";
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
          completedAt: status === "completed" ? new Date() : sql`completed_at`,
        },
      });

    // If course-unit is completed, update course progress
    if (status === "completed") {
      await this.updateCourseProgress(tx, userId, courseId);
    }
  }

  /**
   * Update course progress based on completed course-units
   */
  private static async updateCourseProgress(
    tx: any,
    userId: number,
    courseId: number
  ) {
    // Get total course-units in the course
    const totalCourseUnits = await tx
      .select({ count: count() })
      .from(courseUnits)
      .where(eq(courseUnits.courseId, courseId));

    // Get completed course-units for this user in this course
    const completedCourseUnits = await tx
      .select({ count: count() })
      .from(userCourseUnitProgress)
      .where(
        and(
          eq(userCourseUnitProgress.userId, userId),
          eq(userCourseUnitProgress.status, "completed")
        )
      )
      .innerJoin(
        courseUnits,
        eq(courseUnits.id, userCourseUnitProgress.courseUnitId)
      )
      .where(eq(courseUnits.courseId, courseId));

    const total = totalCourseUnits[0]?.count || 0;
    const completed = completedCourseUnits[0]?.count || 0;
    const completionPercentage = total > 0 ? (completed / total) * 100 : 0;
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
          completedAt: status === "completed" ? new Date() : sql`completed_at`,
        },
      });

    // If course is completed, update module progress
    if (status === "completed") {
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
  }

  /**
   * Update module progress based on completed courses
   */
  private static async updateModuleProgress(
    tx: any,
    userId: number,
    moduleId: number
  ) {
    // Get total courses in the module
    const totalCourses = await tx
      .select({ count: count() })
      .from(courses)
      .where(eq(courses.moduleId, moduleId));

    // Get completed courses for this user in this module
    const completedCourses = await tx
      .select({ count: count() })
      .from(userCourseProgress)
      .innerJoin(courses, eq(courses.id, userCourseProgress.courseId))
      .where(
        and(
          eq(userCourseProgress.userId, userId),
          eq(courses.moduleId, moduleId),
          eq(userCourseProgress.status, "completed")
        )
      );

    const total = totalCourses[0]?.count || 0;
    const completed = completedCourses[0]?.count || 0;
    const completionPercentage = total > 0 ? (completed / total) * 100 : 0;
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
          completedAt: status === "completed" ? new Date() : sql`completed_at`,
        },
      });

    // If module is completed, update training area progress
    if (status === "completed") {
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
  }

  /**
   * Update training area progress based on completed modules
   */
  private static async updateTrainingAreaProgress(
    tx: any,
    userId: number,
    trainingAreaId: number
  ) {
    // Get total modules in the training area
    const totalModules = await tx
      .select({ count: count() })
      .from(modules)
      .where(eq(modules.trainingAreaId, trainingAreaId));

    // Get completed modules for this user in this training area
    const completedModules = await tx
      .select({ count: count() })
      .from(userModuleProgress)
      .innerJoin(modules, eq(modules.id, userModuleProgress.moduleId))
      .where(
        and(
          eq(userModuleProgress.userId, userId),
          eq(modules.trainingAreaId, trainingAreaId),
          eq(userModuleProgress.status, "completed")
        )
      );

    const total = totalModules[0]?.count || 0;
    const completed = completedModules[0]?.count || 0;
    const completionPercentage = total > 0 ? (completed / total) * 100 : 0;
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
          completedAt: status === "completed" ? new Date() : sql`completed_at`,
        },
      });
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
}
