import type { Request, Response } from "express";
import {
  LearningBlockProgressService,
  ProgressService,
} from "../services/progress.services";
import type { CustomError } from "../middleware/errorHandling";

// Helper function to create custom errors
const createError = (
  message: string,
  statusCode: number,
  errors?: string[]
): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  if (errors) {
    error.errors = errors;
  }
  return error;
};

// ==================== VALIDATION FUNCTIONS ====================

const validateCompleteLearningBlockInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.userId || typeof data.userId !== "number" || data.userId <= 0) {
    errors.push("Valid user ID is required");
  }

  if (
    !data.learningBlockId ||
    typeof data.learningBlockId !== "number" ||
    data.learningBlockId <= 0
  ) {
    errors.push("Valid learning block ID is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateGetProgressInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.userId || typeof data.userId !== "number" || data.userId <= 0) {
    errors.push("Valid user ID is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateLearningPathCompletionInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.assetName || typeof data.assetName !== "string" || data.assetName.trim() === "") {
    errors.push("Valid asset name is required");
  }

  if (!data.roleCategoryName || typeof data.roleCategoryName !== "string" || data.roleCategoryName.trim() === "") {
    errors.push("Valid role category name is required");
  }

  if (!data.courseId || typeof data.courseId !== "number" || data.courseId <= 0) {
    errors.push("Valid course ID is required");
  }

  if (!data.seniority || typeof data.seniority !== "string" || data.seniority.trim() === "") {
    errors.push("Valid seniority is required");
  }

  if (!data.userId || typeof data.userId !== "number" || data.userId <= 0) {
    errors.push("Valid user ID is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ==================== LEARNING BLOCK PROGRESS CONTROLLER ====================
export class LearningBlockProgressController {
  /**
   * Complete a learning block and cascade progress updates
   * POST /api/progress/learning-blocks/complete
   */
  static async completeLearningBlock(req: Request, res: Response) {
    const { userId, learningBlockId } = req.body;

    // Validate input
    const validation = validateCompleteLearningBlockInput({
      userId,
      learningBlockId,
    });
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    try {
      const result = await LearningBlockProgressService.completeLearningBlock(
        userId,
        learningBlockId
      );

      if (!result.success) {
        throw createError(result.message, 400);
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
      });
    } catch (error) {
      console.error("Error completing learning block:", error);
      throw createError(
        "Failed to complete learning block",
        500,
        error instanceof Error ? [error.message] : ["Unknown error occurred"]
      );
    }
  }

  /**
   * Get learning block progress for a user
   * GET /api/progress/learning-blocks/:userId
   * GET /api/progress/learning-blocks/:userId/:learningBlockId
   */
  static async getUserLearningBlockProgress(req: Request, res: Response) {
    const userId = parseInt(req.params.userId || "0");
    const learningBlockId = req.params.learningBlockId
      ? parseInt(req.params.learningBlockId)
      : undefined;

    // Validate input
    const validation = validateGetProgressInput({ userId });
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    if (learningBlockId && (isNaN(learningBlockId) || learningBlockId <= 0)) {
      throw createError("Valid learning block ID is required", 400);
    }

    try {
      const progress =
        await LearningBlockProgressService.getUserLearningBlockProgress(
          userId,
          learningBlockId
        );

      res.status(200).json({
        success: true,
        message: "Learning block progress retrieved successfully",
        data: progress,
      });
    } catch (error) {
      console.error("Error getting learning block progress:", error);
      throw createError(
        "Failed to retrieve learning block progress",
        500,
        error instanceof Error ? [error.message] : ["Unknown error occurred"]
      );
    }
  }
}

// ==================== PROGRESS CONTROLLER ====================
export class ProgressController {
  /**
   * Get all progress for a user across all levels
   * GET /api/progress/user/:userId
   */
  static async getUserProgress(req: Request, res: Response) {
    const userId = parseInt(req.params.userId || "0");

    // Validate input
    const validation = validateGetProgressInput({ userId });
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    try {
      const progress = await ProgressService.getUserProgress(userId);

      res.status(200).json({
        success: true,
        message: "User progress retrieved successfully",
        data: progress,
      });
    } catch (error) {
      console.error("Error getting user progress:", error);
      throw createError(
        "Failed to retrieve user progress",
        500,
        error instanceof Error ? [error.message] : ["Unknown error occurred"]
      );
    }
  }

  /**
   * Get detailed progress with hierarchy information
   * GET /api/progress/user/:userId/detailed
   */
  static async getDetailedUserProgress(req: Request, res: Response) {
    const userId = parseInt(req.params.userId || "0");

    // Validate input
    const validation = validateGetProgressInput({ userId });
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    try {
      const progress = await ProgressService.getDetailedUserProgress(userId);

      res.status(200).json({
        success: true,
        message: "Detailed user progress retrieved successfully",
        data: progress,
      });
    } catch (error) {
      console.error("Error getting detailed user progress:", error);
      throw createError(
        "Failed to retrieve detailed user progress",
        500,
        error instanceof Error ? [error.message] : ["Unknown error occurred"]
      );
    }
  }

  /**
   * Get training area progress for a user
   * GET /api/progress/training-areas/:userId
   * GET /api/progress/training-areas/:userId/:trainingAreaId
   */
  static async getUserTrainingAreaProgress(req: Request, res: Response) {
    const userId = parseInt(req.params.userId || "0");
    const trainingAreaId = req.params.trainingAreaId
      ? parseInt(req.params.trainingAreaId)
      : undefined;

    // Validate input
    const validation = validateGetProgressInput({ userId });
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    if (trainingAreaId && (isNaN(trainingAreaId) || trainingAreaId <= 0)) {
      throw createError("Valid training area ID is required", 400);
    }

    try {
      const progress = await ProgressService.getUserTrainingAreaProgress(
        userId,
        trainingAreaId
      );

      res.status(200).json({
        success: true,
        message: "Training area progress retrieved successfully",
        data: progress,
      });
    } catch (error) {
      console.error("Error getting training area progress:", error);
      throw createError(
        "Failed to retrieve training area progress",
        500,
        error instanceof Error ? [error.message] : ["Unknown error occurred"]
      );
    }
  }

  /**
   * Get training area progress for multiple users and sum the progress
   * POST /api/progress/training-areas/bulk
   */
  static async getBulkTrainingAreaProgress(req: Request, res: Response) {
    const { userIds } = req.body;

    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw createError("Valid array of user IDs is required", 400);
    }

    // Validate each user ID
    for (const userId of userIds) {
      if (typeof userId !== "number" || userId <= 0) {
        throw createError("All user IDs must be valid positive numbers", 400);
      }
    }

    try {
      const progress = await ProgressService.getBulkTrainingAreaProgress(userIds);

      res.status(200).json({
        success: true,
        message: "Bulk training area progress retrieved successfully",
        data: progress,
      });
    } catch (error) {
      console.error("Error getting bulk training area progress:", error);
      throw createError(
        "Failed to retrieve bulk training area progress",
        500,
        error instanceof Error ? [error.message] : ["Unknown error occurred"]
      );
    }
  }

  /**
   * Get module progress for a user
   * GET /api/progress/modules/:userId
   * GET /api/progress/modules/:userId/:moduleId
   */
  static async getUserModuleProgress(req: Request, res: Response) {
    const userId = parseInt(req.params.userId || "0");
    const moduleId = req.params.moduleId
      ? parseInt(req.params.moduleId)
      : undefined;

    // Validate input
    const validation = validateGetProgressInput({ userId });
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    if (moduleId && (isNaN(moduleId) || moduleId <= 0)) {
      throw createError("Valid module ID is required", 400);
    }

    try {
      const progress = await ProgressService.getUserModuleProgress(
        userId,
        moduleId
      );

      res.status(200).json({
        success: true,
        message: "Module progress retrieved successfully",
        data: progress,
      });
    } catch (error) {
      console.error("Error getting module progress:", error);
      throw createError(
        "Failed to retrieve module progress",
        500,
        error instanceof Error ? [error.message] : ["Unknown error occurred"]
      );
    }
  }

  /**
   * Get course progress for a user
   * GET /api/progress/courses/:userId
   * GET /api/progress/courses/:userId/:courseId
   */
  static async getUserCourseProgress(req: Request, res: Response) {
    const userId = parseInt(req.params.userId || "0");
    const courseId = req.params.courseId
      ? parseInt(req.params.courseId)
      : undefined;

    // Validate input
    const validation = validateGetProgressInput({ userId });
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    if (courseId && (isNaN(courseId) || courseId <= 0)) {
      throw createError("Valid course ID is required", 400);
    }

    try {
      const progress = await ProgressService.getUserCourseProgress(
        userId,
        courseId
      );

      res.status(200).json({
        success: true,
        message: "Course progress retrieved successfully",
        data: progress,
      });
    } catch (error) {
      console.error("Error getting course progress:", error);
      throw createError(
        "Failed to retrieve course progress",
        500,
        error instanceof Error ? [error.message] : ["Unknown error occurred"]
      );
    }
  }

  /**
   * Get course-unit progress for a user
   * GET /api/progress/course-units/:userId
   * GET /api/progress/course-units/:userId/:courseUnitId
   */
  static async getUserCourseUnitProgress(req: Request, res: Response) {
    const userId = parseInt(req.params.userId || "0");
    const courseUnitId = req.params.courseUnitId
      ? parseInt(req.params.courseUnitId)
      : undefined;

    // Validate input
    const validation = validateGetProgressInput({ userId });
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    if (courseUnitId && (isNaN(courseUnitId) || courseUnitId <= 0)) {
      throw createError("Valid course-unit ID is required", 400);
    }

    try {
      const progress = await ProgressService.getUserCourseUnitProgress(
        userId,
        courseUnitId
      );

      res.status(200).json({
        success: true,
        message: "Course-unit progress retrieved successfully",
        data: progress,
      });
    } catch (error) {
      console.error("Error getting course-unit progress:", error);
      throw createError(
        "Failed to retrieve course-unit progress",
        500,
        error instanceof Error ? [error.message] : ["Unknown error occurred"]
      );
    }
  }

  /**
   * Reset progress for a user (admin function)
   * DELETE /api/progress/user/:userId/reset
   */
  static async resetUserProgress(req: Request, res: Response) {
    const userId = parseInt(req.params.userId || "0");

    // Validate input
    const validation = validateGetProgressInput({ userId });
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    try {
      const result = await ProgressService.resetUserProgress(userId);

      if (!result.success) {
        throw createError(result.message, 400);
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
      });
    } catch (error) {
      console.error("Error resetting user progress:", error);
      throw createError(
        "Failed to reset user progress",
        500,
        error instanceof Error ? [error.message] : ["Unknown error occurred"]
      );
    }
  }

  /**
   * Recalculate progress for a user (admin/sub-admin function)
   * POST /api/progress/user/:userId/recalculate
   */
  static async recalculateUserProgress(req: Request, res: Response) {
    const userId = parseInt(req.params.userId || "0");

    // Validate input
    const validation = validateGetProgressInput({ userId });
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    try {
      const result = await ProgressService.recalculateUserProgress(userId);

      if (!result.success) {
        throw createError(result.message, 400);
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
      });
    } catch (error) {
      console.error("Error recalculating user progress:", error);
      throw createError(
        "Failed to recalculate user progress",
        500,
        error instanceof Error ? [error.message] : ["Unknown error occurred"]
      );
    }
  }

  /**
   * Get learning path completion status based on asset, role category, units, and seniority
   * POST /api/progress/learning-path-completion
   */
  static async getLearningPathCompletion(req: Request, res: Response) {
    const { assetName, roleCategoryName, courseId, seniority, userId } = req.body;

    // Validate input
    const validation = validateLearningPathCompletionInput({
      assetName,
      roleCategoryName,
      courseId,
      seniority,
      userId,
    });
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    try {
      const result = await ProgressService.getLearningPathCompletion(
        assetName,
        roleCategoryName,
        courseId,
        seniority,
        userId 
      );

      res.status(200).json({
        success: true,
        message: "Learning path completion retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error getting learning path completion:", error);
      throw createError(
        "Failed to retrieve learning path completion",
        500,
        error instanceof Error ? [error.message] : ["Unknown error occurred"]
      );
    }
  }
}
