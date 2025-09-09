import type { Request, Response } from "express";
import {
  TrainingAreaService,
  ModuleService,
  CourseService,
  UnitService,
  CourseUnitService,
  LearningBlockService,
} from "../services/training.services";
import type {
  NewTrainingArea,
  UpdateTrainingArea,
  NewModule,
  UpdateModule,
  NewCourse,
  UpdateCourse,
  NewUnit,
  UpdateUnit,
  NewCourseUnit,
  UpdateCourseUnit,
  NewLearningBlock,
  UpdateLearningBlock,
} from "../db/types";
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

const validateTrainingAreaInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    errors.push("Name is required and must be a non-empty string");
  }

  if (data.description !== undefined && typeof data.description !== "string") {
    errors.push("Description must be a string if provided");
  }

  if (data.imageUrl !== undefined && typeof data.imageUrl !== "string") {
    errors.push("Image URL must be a string if provided");
  }

  return { isValid: errors.length === 0, errors };
};

const validateModuleInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    errors.push("Name is required and must be a non-empty string");
  }

  if (
    !data.trainingAreaId ||
    typeof data.trainingAreaId !== "number" ||
    data.trainingAreaId <= 0
  ) {
    errors.push("Valid training area ID is required");
  }

  if (data.description !== undefined && typeof data.description !== "string") {
    errors.push("Description must be a string if provided");
  }

  if (data.imageUrl !== undefined && typeof data.imageUrl !== "string") {
    errors.push("Image URL must be a string if provided");
  }

  return { isValid: errors.length === 0, errors };
};

const validateCourseInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    errors.push("Name is required and must be a non-empty string");
  }

  if (
    !data.moduleId ||
    typeof data.moduleId !== "number" ||
    data.moduleId <= 0
  ) {
    errors.push("Valid module ID is required");
  }

  if (
    !data.duration ||
    typeof data.duration !== "number" ||
    data.duration <= 0
  ) {
    errors.push("Duration is required and must be a positive number");
  }

  if (data.description !== undefined && typeof data.description !== "string") {
    errors.push("Description must be a string if provided");
  }

  if (data.imageUrl !== undefined && typeof data.imageUrl !== "string") {
    errors.push("Image URL must be a string if provided");
  }

  if (
    data.internalNote !== undefined &&
    typeof data.internalNote !== "string"
  ) {
    errors.push("Internal note must be a string if provided");
  }

  if (
    data.courseType !== undefined &&
    !["free", "premium"].includes(data.courseType)
  ) {
    errors.push("Course type must be either 'free' or 'premium'");
  }

  if (
    data.level !== undefined &&
    !["beginner", "intermediate", "advanced"].includes(data.level)
  ) {
    errors.push("Level must be one of: beginner, intermediate, advanced");
  }

  if (
    data.showDuration !== undefined &&
    typeof data.showDuration !== "boolean"
  ) {
    errors.push("Show duration must be a boolean if provided");
  }

  if (data.showLevel !== undefined && typeof data.showLevel !== "boolean") {
    errors.push("Show level must be a boolean if provided");
  }

  return { isValid: errors.length === 0, errors };
};

const validateUnitInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    errors.push("Name is required and must be a non-empty string");
  }

  if (data.description !== undefined && typeof data.description !== "string") {
    errors.push("Description must be a string if provided");
  }

  if (
    data.internalNote !== undefined &&
    typeof data.internalNote !== "string"
  ) {
    errors.push("Internal note must be a string if provided");
  }

  if (
    data.order !== undefined &&
    (typeof data.order !== "number" || data.order < 1)
  ) {
    errors.push("Order must be a positive number if provided");
  }

  if (
    data.duration !== undefined &&
    (typeof data.duration !== "number" || data.duration <= 0)
  ) {
    errors.push("Duration must be a positive number if provided");
  }

  if (
    data.showDuration !== undefined &&
    typeof data.showDuration !== "boolean"
  ) {
    errors.push("Show duration must be a boolean if provided");
  }

  if (
    data.xpPoints !== undefined &&
    (typeof data.xpPoints !== "number" || data.xpPoints < 0)
  ) {
    errors.push("XP points must be a non-negative number if provided");
  }

  return { isValid: errors.length === 0, errors };
};

const validateCourseUnitInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (
    !data.courseId ||
    typeof data.courseId !== "number" ||
    data.courseId <= 0
  ) {
    errors.push("Valid course ID is required");
  }

  if (!data.unitId || typeof data.unitId !== "number" || data.unitId <= 0) {
    errors.push("Valid unit ID is required");
  }

  if (!data.order || typeof data.order !== "number" || data.order < 1) {
    errors.push("Order is required and must be a positive number");
  }

  return { isValid: errors.length === 0, errors };
};

const validateLearningBlockInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.unitId || typeof data.unitId !== "number" || data.unitId <= 0) {
    errors.push("Valid unit ID is required");
  }

  if (
    !data.type ||
    typeof data.type !== "string" ||
    data.type.trim().length === 0
  ) {
    errors.push("Type is required and must be a non-empty string");
  }

  if (
    !data.title ||
    typeof data.title !== "string" ||
    data.title.trim().length === 0
  ) {
    errors.push("Title is required and must be a non-empty string");
  }

  if (!data.order || typeof data.order !== "number" || data.order < 1) {
    errors.push("Order is required and must be a positive number");
  }

  if (data.content !== undefined && typeof data.content !== "string") {
    errors.push("Content must be a string if provided");
  }

  if (data.videoUrl !== undefined && typeof data.videoUrl !== "string") {
    errors.push("Video URL must be a string if provided");
  }

  if (data.imageUrl !== undefined && typeof data.imageUrl !== "string") {
    errors.push("Image URL must be a string if provided");
  }

  if (
    data.xpPoints !== undefined &&
    (typeof data.xpPoints !== "number" || data.xpPoints < 0)
  ) {
    errors.push("XP points must be a non-negative number if provided");
  }

  return { isValid: errors.length === 0, errors };
};

// ==================== TRAINING AREA CONTROLLERS ====================
export class TrainingAreaController {
  /**
   * Create a new training area
   * POST /training-areas
   */
  static async createTrainingArea(req: Request, res: Response): Promise<void> {
    const validation = validateTrainingAreaInput(req.body);

    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    const trainingAreaData: NewTrainingArea = {
      name: req.body.name.trim(),
      description: req.body.description?.trim() || null,
      imageUrl: req.body.imageUrl?.trim() || null,
    };

    const newTrainingArea = await TrainingAreaService.createTrainingArea(
      trainingAreaData
    );

    res.status(201).json({
      success: true,
      message: "Training area created successfully",
      data: newTrainingArea,
    });
  }

  /**
   * Get all training areas
   * GET /training-areas?limit=10&offset=0
   */
  static async getAllTrainingAreas(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;

    if (limit !== undefined && (isNaN(limit) || limit <= 0 || limit > 100)) {
      throw createError(
        "Limit must be a positive number between 1 and 100",
        400
      );
    }

    if (offset !== undefined && (isNaN(offset) || offset < 0)) {
      throw createError("Offset must be a non-negative number", 400);
    }

    const trainingAreas = await TrainingAreaService.getAllTrainingAreas(
      limit,
      offset
    );

    res.status(200).json({
      success: true,
      message: "Training areas retrieved successfully",
      data: trainingAreas,
      meta: {
        limit: limit || null,
        offset: offset || 0,
        count: trainingAreas.length,
      },
    });
  }

  /**
   * Get training area by ID
   * GET /training-areas/:id
   */
  static async getTrainingAreaById(req: Request, res: Response): Promise<void> {
    const trainingAreaId = parseInt(req.params.id as string);

    if (isNaN(trainingAreaId) || trainingAreaId <= 0) {
      throw createError("Invalid training area ID", 400);
    }

    const trainingArea = await TrainingAreaService.getTrainingAreaById(
      trainingAreaId
    );

    if (!trainingArea) {
      throw createError("Training area not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Training area retrieved successfully",
      data: trainingArea,
    });
  }

  /**
   * Update training area by ID
   * PUT /training-areas/:id
   */
  static async updateTrainingArea(req: Request, res: Response): Promise<void> {
    const trainingAreaId = parseInt(req.params.id as string);

    if (isNaN(trainingAreaId) || trainingAreaId <= 0) {
      throw createError("Invalid training area ID", 400);
    }

    const existingTrainingArea = await TrainingAreaService.trainingAreaExists(
      trainingAreaId
    );
    if (!existingTrainingArea) {
      throw createError("Training area not found", 404);
    }

    const validation = validateTrainingAreaInput(req.body);
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    const updateData: UpdateTrainingArea = {};
    if (req.body.name) updateData.name = req.body.name.trim();
    if (req.body.description !== undefined)
      updateData.description = req.body.description?.trim() || null;
    if (req.body.imageUrl !== undefined)
      updateData.imageUrl = req.body.imageUrl?.trim() || null;

    const updatedTrainingArea = await TrainingAreaService.updateTrainingArea(
      trainingAreaId,
      updateData
    );

    res.status(200).json({
      success: true,
      message: "Training area updated successfully",
      data: updatedTrainingArea,
    });
  }

  /**
   * Delete training area by ID
   * DELETE /training-areas/:id
   */
  static async deleteTrainingArea(req: Request, res: Response): Promise<void> {
    const trainingAreaId = parseInt(req.params.id as string);

    if (isNaN(trainingAreaId) || trainingAreaId <= 0) {
      throw createError("Invalid training area ID", 400);
    }

    const existingTrainingArea = await TrainingAreaService.trainingAreaExists(
      trainingAreaId
    );
    if (!existingTrainingArea) {
      throw createError("Training area not found", 404);
    }

    const deleted = await TrainingAreaService.deleteTrainingArea(
      trainingAreaId
    );

    if (!deleted) {
      throw createError("Failed to delete training area", 500);
    }

    res.status(200).json({
      success: true,
      message: "Training area deleted successfully",
    });
  }
}

// ==================== MODULE CONTROLLERS ====================
export class ModuleController {
  /**
   * Create a new module
   * POST /modules
   */
  static async createModule(req: Request, res: Response): Promise<void> {
    const validation = validateModuleInput(req.body);

    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    // Verify training area exists
    const trainingAreaExists = await TrainingAreaService.trainingAreaExists(
      req.body.trainingAreaId
    );
    if (!trainingAreaExists) {
      throw createError("Training area not found", 404);
    }

    const moduleData: NewModule = {
      name: req.body.name.trim(),
      trainingAreaId: req.body.trainingAreaId,
      description: req.body.description?.trim() || null,
      imageUrl: req.body.imageUrl?.trim() || null,
    };

    const newModule = await ModuleService.createModule(moduleData);

    res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: newModule,
    });
  }

  /**
   * Get all modules
   * GET /modules?limit=10&offset=0
   */
  static async getAllModules(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;

    if (limit !== undefined && (isNaN(limit) || limit <= 0 || limit > 100)) {
      throw createError(
        "Limit must be a positive number between 1 and 100",
        400
      );
    }

    if (offset !== undefined && (isNaN(offset) || offset < 0)) {
      throw createError("Offset must be a non-negative number", 400);
    }

    const modules = await ModuleService.getAllModules(limit, offset);

    res.status(200).json({
      success: true,
      message: "Modules retrieved successfully",
      data: modules,
      meta: {
        limit: limit || null,
        offset: offset || 0,
        count: modules.length,
      },
    });
  }

  /**
   * Get module by ID
   * GET /modules/:id
   */
  static async getModuleById(req: Request, res: Response): Promise<void> {
    const moduleId = parseInt(req.params.id as string);

    if (isNaN(moduleId) || moduleId <= 0) {
      throw createError("Invalid module ID", 400);
    }

    const module = await ModuleService.getModuleById(moduleId);

    if (!module) {
      throw createError("Module not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Module retrieved successfully",
      data: module,
    });
  }

  /**
   * Get modules by training area ID
   * GET /training-areas/:trainingAreaId/modules
   */
  static async getModulesByTrainingArea(
    req: Request,
    res: Response
  ): Promise<void> {
    const trainingAreaId = parseInt(req.params.trainingAreaId as string);

    if (isNaN(trainingAreaId) || trainingAreaId <= 0) {
      throw createError("Invalid training area ID", 400);
    }

    const modules = await ModuleService.getModulesByTrainingArea(
      trainingAreaId
    );

    res.status(200).json({
      success: true,
      message: "Modules retrieved successfully",
      data: modules,
      meta: {
        trainingAreaId,
        count: modules.length,
      },
    });
  }

  /**
   * Update module by ID
   * PUT /modules/:id
   */
  static async updateModule(req: Request, res: Response): Promise<void> {
    const moduleId = parseInt(req.params.id as string);

    if (isNaN(moduleId) || moduleId <= 0) {
      throw createError("Invalid module ID", 400);
    }

    const existingModule = await ModuleService.moduleExists(moduleId);
    if (!existingModule) {
      throw createError("Module not found", 404);
    }

    const validation = validateModuleInput(req.body);
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    // Verify training area exists if being updated
    if (
      req.body.trainingAreaId &&
      req.body.trainingAreaId !== existingModule.trainingAreaId
    ) {
      const trainingAreaExists = await TrainingAreaService.trainingAreaExists(
        req.body.trainingAreaId
      );
      if (!trainingAreaExists) {
        throw createError("Training area not found", 404);
      }
    }

    const updateData: UpdateModule = {};
    if (req.body.name) updateData.name = req.body.name.trim();
    if (req.body.trainingAreaId)
      updateData.trainingAreaId = req.body.trainingAreaId;
    if (req.body.description !== undefined)
      updateData.description = req.body.description?.trim() || null;
    if (req.body.imageUrl !== undefined)
      updateData.imageUrl = req.body.imageUrl?.trim() || null;

    const updatedModule = await ModuleService.updateModule(
      moduleId,
      updateData
    );

    res.status(200).json({
      success: true,
      message: "Module updated successfully",
      data: updatedModule,
    });
  }

  /**
   * Delete module by ID
   * DELETE /modules/:id
   */
  static async deleteModule(req: Request, res: Response): Promise<void> {
    const moduleId = parseInt(req.params.id as string);

    if (isNaN(moduleId) || moduleId <= 0) {
      throw createError("Invalid module ID", 400);
    }

    const existingModule = await ModuleService.moduleExists(moduleId);
    if (!existingModule) {
      throw createError("Module not found", 404);
    }

    const deleted = await ModuleService.deleteModule(moduleId);

    if (!deleted) {
      throw createError("Failed to delete module", 500);
    }

    res.status(200).json({
      success: true,
      message: "Module deleted successfully",
    });
  }
}

// ==================== COURSE CONTROLLERS ====================
export class CourseController {
  /**
   * Create a new course
   * POST /courses
   */
  static async createCourse(req: Request, res: Response): Promise<void> {
    const validation = validateCourseInput(req.body);

    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    // Verify module exists
    const moduleExists = await ModuleService.moduleExists(req.body.moduleId);
    if (!moduleExists) {
      throw createError("Module not found", 404);
    }

    const courseData: NewCourse = {
      name: req.body.name.trim(),
      moduleId: req.body.moduleId,
      duration: req.body.duration,
      description: req.body.description?.trim() || null,
      imageUrl: req.body.imageUrl?.trim() || null,
      internalNote: req.body.internalNote?.trim() || null,
      courseType: req.body.courseType || "free",
      showDuration: req.body.showDuration ?? true,
      level: req.body.level || "beginner",
      showLevel: req.body.showLevel ?? true,
      estimatedDuration: req.body.estimatedDuration?.trim() || null,
      difficultyLevel: req.body.difficultyLevel?.trim() || null,
    };

    const newCourse = await CourseService.createCourse(courseData);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  }

  /**
   * Get all courses
   * GET /courses?limit=10&offset=0
   */
  static async getAllCourses(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;

    if (limit !== undefined && (isNaN(limit) || limit <= 0 || limit > 100)) {
      throw createError(
        "Limit must be a positive number between 1 and 100",
        400
      );
    }

    if (offset !== undefined && (isNaN(offset) || offset < 0)) {
      throw createError("Offset must be a non-negative number", 400);
    }

    const courses = await CourseService.getAllCourses(limit, offset);

    res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data: courses,
      meta: {
        limit: limit || null,
        offset: offset || 0,
        count: courses.length,
      },
    });
  }

  /**
   * Get course by ID
   * GET /courses/:id
   */
  static async getCourseById(req: Request, res: Response): Promise<void> {
    const courseId = parseInt(req.params.id as string);

    if (isNaN(courseId) || courseId <= 0) {
      throw createError("Invalid course ID", 400);
    }

    const course = await CourseService.getCourseById(courseId);

    if (!course) {
      throw createError("Course not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      data: course,
    });
  }

  /**
   * Get courses by module ID
   * GET /modules/:moduleId/courses
   */
  static async getCoursesByModule(req: Request, res: Response): Promise<void> {
    const moduleId = parseInt(req.params.moduleId as string);

    if (isNaN(moduleId) || moduleId <= 0) {
      throw createError("Invalid module ID", 400);
    }

    const courses = await CourseService.getCoursesByModule(moduleId);

    res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data: courses,
      meta: {
        moduleId,
        count: courses.length,
      },
    });
  }

  /**
   * Update course by ID
   * PUT /courses/:id
   */
  static async updateCourse(req: Request, res: Response): Promise<void> {
    const courseId = parseInt(req.params.id as string);

    if (isNaN(courseId) || courseId <= 0) {
      throw createError("Invalid course ID", 400);
    }

    const existingCourse = await CourseService.courseExists(courseId);
    if (!existingCourse) {
      throw createError("Course not found", 404);
    }

    const validation = validateCourseInput(req.body);
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    // Verify module exists if being updated
    if (req.body.moduleId && req.body.moduleId !== existingCourse.moduleId) {
      const moduleExists = await ModuleService.moduleExists(req.body.moduleId);
      if (!moduleExists) {
        throw createError("Module not found", 404);
      }
    }

    const updateData: UpdateCourse = {};
    if (req.body.name) updateData.name = req.body.name.trim();
    if (req.body.moduleId) updateData.moduleId = req.body.moduleId;
    if (req.body.duration) updateData.duration = req.body.duration;
    if (req.body.description !== undefined)
      updateData.description = req.body.description?.trim() || null;
    if (req.body.imageUrl !== undefined)
      updateData.imageUrl = req.body.imageUrl?.trim() || null;
    if (req.body.internalNote !== undefined)
      updateData.internalNote = req.body.internalNote?.trim() || null;
    if (req.body.courseType) updateData.courseType = req.body.courseType;
    if (req.body.showDuration !== undefined)
      updateData.showDuration = req.body.showDuration;
    if (req.body.level) updateData.level = req.body.level;
    if (req.body.showLevel !== undefined)
      updateData.showLevel = req.body.showLevel;
    if (req.body.estimatedDuration !== undefined)
      updateData.estimatedDuration = req.body.estimatedDuration?.trim() || null;
    if (req.body.difficultyLevel !== undefined)
      updateData.difficultyLevel = req.body.difficultyLevel?.trim() || null;

    const updatedCourse = await CourseService.updateCourse(
      courseId,
      updateData
    );

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  }

  /**
   * Delete course by ID
   * DELETE /courses/:id
   */
  static async deleteCourse(req: Request, res: Response): Promise<void> {
    const courseId = parseInt(req.params.id as string);

    if (isNaN(courseId) || courseId <= 0) {
      throw createError("Invalid course ID", 400);
    }

    const existingCourse = await CourseService.courseExists(courseId);
    if (!existingCourse) {
      throw createError("Course not found", 404);
    }

    const deleted = await CourseService.deleteCourse(courseId);

    if (!deleted) {
      throw createError("Failed to delete course", 500);
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  }
}

// ==================== UNIT CONTROLLERS ====================
export class UnitController {
  /**
   * Create a new unit
   * POST /units
   */
  static async createUnit(req: Request, res: Response): Promise<void> {
    const validation = validateUnitInput(req.body);

    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    const unitData: NewUnit = {
      name: req.body.name.trim(),
      description: req.body.description?.trim() || null,
      internalNote: req.body.internalNote?.trim() || null,
      order: req.body.order || 1,
      duration: req.body.duration || 30,
      showDuration: req.body.showDuration ?? true,
      xpPoints: req.body.xpPoints || 100,
    };

    const newUnit = await UnitService.createUnit(unitData);

    res.status(201).json({
      success: true,
      message: "Unit created successfully",
      data: newUnit,
    });
  }

  /**
   * Get all units
   * GET /units?limit=10&offset=0
   */
  static async getAllUnits(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;

    if (limit !== undefined && (isNaN(limit) || limit <= 0 || limit > 100)) {
      throw createError(
        "Limit must be a positive number between 1 and 100",
        400
      );
    }

    if (offset !== undefined && (isNaN(offset) || offset < 0)) {
      throw createError("Offset must be a non-negative number", 400);
    }

    const units = await UnitService.getAllUnits(limit, offset);

    res.status(200).json({
      success: true,
      message: "Units retrieved successfully",
      data: units,
      meta: {
        limit: limit || null,
        offset: offset || 0,
        count: units.length,
      },
    });
  }

  /**
   * Get unit by ID
   * GET /units/:id
   */
  static async getUnitById(req: Request, res: Response): Promise<void> {
    const unitId = parseInt(req.params.id as string);

    if (isNaN(unitId) || unitId <= 0) {
      throw createError("Invalid unit ID", 400);
    }

    const unit = await UnitService.getUnitById(unitId);

    if (!unit) {
      throw createError("Unit not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Unit retrieved successfully",
      data: unit,
    });
  }

  /**
   * Update unit by ID
   * PUT /units/:id
   */
  static async updateUnit(req: Request, res: Response): Promise<void> {
    const unitId = parseInt(req.params.id as string);

    if (isNaN(unitId) || unitId <= 0) {
      throw createError("Invalid unit ID", 400);
    }

    const existingUnit = await UnitService.unitExists(unitId);
    if (!existingUnit) {
      throw createError("Unit not found", 404);
    }

    const validation = validateUnitInput(req.body);
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    const updateData: UpdateUnit = {};
    if (req.body.name) updateData.name = req.body.name.trim();
    if (req.body.description !== undefined)
      updateData.description = req.body.description?.trim() || null;
    if (req.body.internalNote !== undefined)
      updateData.internalNote = req.body.internalNote?.trim() || null;
    if (req.body.order !== undefined) updateData.order = req.body.order;
    if (req.body.duration !== undefined)
      updateData.duration = req.body.duration;
    if (req.body.showDuration !== undefined)
      updateData.showDuration = req.body.showDuration;
    if (req.body.xpPoints !== undefined)
      updateData.xpPoints = req.body.xpPoints;

    const updatedUnit = await UnitService.updateUnit(unitId, updateData);

    res.status(200).json({
      success: true,
      message: "Unit updated successfully",
      data: updatedUnit,
    });
  }

  /**
   * Delete unit by ID
   * DELETE /units/:id
   */
  static async deleteUnit(req: Request, res: Response): Promise<void> {
    const unitId = parseInt(req.params.id as string);

    if (isNaN(unitId) || unitId <= 0) {
      throw createError("Invalid unit ID", 400);
    }

    const existingUnit = await UnitService.unitExists(unitId);
    if (!existingUnit) {
      throw createError("Unit not found", 404);
    }

    const deleted = await UnitService.deleteUnit(unitId);

    if (!deleted) {
      throw createError("Failed to delete unit", 500);
    }

    res.status(200).json({
      success: true,
      message: "Unit deleted successfully",
    });
  }
}

// ==================== COURSE UNIT CONTROLLERS ====================
export class CourseUnitController {
  /**
   * Create a new course unit relationship
   * POST /course-units
   */
  static async createCourseUnit(req: Request, res: Response): Promise<void> {
    const validation = validateCourseUnitInput(req.body);

    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    // Verify course and unit exist
    const courseExists = await CourseService.courseExists(req.body.courseId);
    if (!courseExists) {
      throw createError("Course not found", 404);
    }

    const unitExists = await UnitService.unitExists(req.body.unitId);
    if (!unitExists) {
      throw createError("Unit not found", 404);
    }

    // Check if relationship already exists
    const relationshipExists =
      await CourseUnitService.courseUnitRelationshipExists(
        req.body.courseId,
        req.body.unitId
      );
    if (relationshipExists) {
      throw createError("Course unit relationship already exists", 409);
    }

    const courseUnitData: NewCourseUnit = {
      courseId: req.body.courseId,
      unitId: req.body.unitId,
      order: req.body.order,
    };

    const newCourseUnit = await CourseUnitService.createCourseUnit(
      courseUnitData
    );

    res.status(201).json({
      success: true,
      message: "Course unit relationship created successfully",
      data: newCourseUnit,
    });
  }

  /**
   * Get all course units
   * GET /course-units?limit=10&offset=0
   */
  static async getAllCourseUnits(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;

    if (limit !== undefined && (isNaN(limit) || limit <= 0 || limit > 100)) {
      throw createError(
        "Limit must be a positive number between 1 and 100",
        400
      );
    }

    if (offset !== undefined && (isNaN(offset) || offset < 0)) {
      throw createError("Offset must be a non-negative number", 400);
    }

    const courseUnits = await CourseUnitService.getAllCourseUnits(
      limit,
      offset
    );

    res.status(200).json({
      success: true,
      message: "Course units retrieved successfully",
      data: courseUnits,
      meta: {
        limit: limit || null,
        offset: offset || 0,
        count: courseUnits.length,
      },
    });
  }

  /**
   * Get course unit by ID
   * GET /course-units/:id
   */
  static async getCourseUnitById(req: Request, res: Response): Promise<void> {
    const courseUnitId = parseInt(req.params.id as string);

    if (isNaN(courseUnitId) || courseUnitId <= 0) {
      throw createError("Invalid course unit ID", 400);
    }

    const courseUnit = await CourseUnitService.getCourseUnitById(courseUnitId);

    if (!courseUnit) {
      throw createError("Course unit not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Course unit retrieved successfully",
      data: courseUnit,
    });
  }

  /**
   * Get course units by course ID
   * GET /courses/:courseId/units
   */
  static async getCourseUnitsByCourse(
    req: Request,
    res: Response
  ): Promise<void> {
    const courseId = parseInt(req.params.courseId as string);

    if (isNaN(courseId) || courseId <= 0) {
      throw createError("Invalid course ID", 400);
    }

    const courseUnits = await CourseUnitService.getCourseUnitsByCourse(
      courseId
    );

    res.status(200).json({
      success: true,
      message: "Course units retrieved successfully",
      data: courseUnits,
      meta: {
        courseId,
        count: courseUnits.length,
      },
    });
  }

  /**
   * Update course unit by ID
   * PUT /course-units/:id
   */
  static async updateCourseUnit(req: Request, res: Response): Promise<void> {
    const courseUnitId = parseInt(req.params.id as string);

    if (isNaN(courseUnitId) || courseUnitId <= 0) {
      throw createError("Invalid course unit ID", 400);
    }

    const existingCourseUnit = await CourseUnitService.courseUnitExists(
      courseUnitId
    );
    if (!existingCourseUnit) {
      throw createError("Course unit not found", 404);
    }

    const validation = validateCourseUnitInput(req.body);
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    // Verify course and unit exist if being updated
    if (
      req.body.courseId &&
      req.body.courseId !== existingCourseUnit.courseId
    ) {
      const courseExists = await CourseService.courseExists(req.body.courseId);
      if (!courseExists) {
        throw createError("Course not found", 404);
      }
    }

    if (req.body.unitId && req.body.unitId !== existingCourseUnit.unitId) {
      const unitExists = await UnitService.unitExists(req.body.unitId);
      if (!unitExists) {
        throw createError("Unit not found", 404);
      }
    }

    const updateData: UpdateCourseUnit = {};
    if (req.body.courseId) updateData.courseId = req.body.courseId;
    if (req.body.unitId) updateData.unitId = req.body.unitId;
    if (req.body.order) updateData.order = req.body.order;

    const updatedCourseUnit = await CourseUnitService.updateCourseUnit(
      courseUnitId,
      updateData
    );

    res.status(200).json({
      success: true,
      message: "Course unit updated successfully",
      data: updatedCourseUnit,
    });
  }

  /**
   * Delete course unit by ID
   * DELETE /course-units/:id
   */
  static async deleteCourseUnit(req: Request, res: Response): Promise<void> {
    const courseUnitId = parseInt(req.params.id as string);

    if (isNaN(courseUnitId) || courseUnitId <= 0) {
      throw createError("Invalid course unit ID", 400);
    }

    const existingCourseUnit = await CourseUnitService.courseUnitExists(
      courseUnitId
    );
    if (!existingCourseUnit) {
      throw createError("Course unit not found", 404);
    }

    const deleted = await CourseUnitService.deleteCourseUnit(courseUnitId);

    if (!deleted) {
      throw createError("Failed to delete course unit", 500);
    }

    res.status(200).json({
      success: true,
      message: "Course unit deleted successfully",
    });
  }
}

// ==================== LEARNING BLOCK CONTROLLERS ====================
export class LearningBlockController {
  /**
   * Create a new learning block
   * POST /learning-blocks
   */
  static async createLearningBlock(req: Request, res: Response): Promise<void> {
    const validation = validateLearningBlockInput(req.body);

    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    // Verify unit exists
    const unitExists = await UnitService.unitExists(req.body.unitId);
    if (!unitExists) {
      throw createError("Unit not found", 404);
    }

    const learningBlockData: NewLearningBlock = {
      unitId: req.body.unitId,
      type: req.body.type.trim(),
      title: req.body.title.trim(),
      order: req.body.order,
      content: req.body.content?.trim() || null,
      videoUrl: req.body.videoUrl?.trim() || null,
      imageUrl: req.body.imageUrl?.trim() || null,
      interactiveData: req.body.interactiveData || null,
      xpPoints: req.body.xpPoints || 10,
    };

    const newLearningBlock = await LearningBlockService.createLearningBlock(
      learningBlockData
    );

    res.status(201).json({
      success: true,
      message: "Learning block created successfully",
      data: newLearningBlock,
    });
  }

  /**
   * Get all learning blocks
   * GET /learning-blocks?limit=10&offset=0
   */
  static async getAllLearningBlocks(
    req: Request,
    res: Response
  ): Promise<void> {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;

    if (limit !== undefined && (isNaN(limit) || limit <= 0 || limit > 100)) {
      throw createError(
        "Limit must be a positive number between 1 and 100",
        400
      );
    }

    if (offset !== undefined && (isNaN(offset) || offset < 0)) {
      throw createError("Offset must be a non-negative number", 400);
    }

    const learningBlocks = await LearningBlockService.getAllLearningBlocks(
      limit,
      offset
    );

    res.status(200).json({
      success: true,
      message: "Learning blocks retrieved successfully",
      data: learningBlocks,
      meta: {
        limit: limit || null,
        offset: offset || 0,
        count: learningBlocks.length,
      },
    });
  }

  /**
   * Get learning block by ID
   * GET /learning-blocks/:id
   */
  static async getLearningBlockById(
    req: Request,
    res: Response
  ): Promise<void> {
    const learningBlockId = parseInt(req.params.id as string);

    if (isNaN(learningBlockId) || learningBlockId <= 0) {
      throw createError("Invalid learning block ID", 400);
    }

    const learningBlock = await LearningBlockService.getLearningBlockById(
      learningBlockId
    );

    if (!learningBlock) {
      throw createError("Learning block not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Learning block retrieved successfully",
      data: learningBlock,
    });
  }

  /**
   * Get learning blocks by unit ID
   * GET /units/:unitId/learning-blocks
   */
  static async getLearningBlocksByUnit(
    req: Request,
    res: Response
  ): Promise<void> {
    const unitId = parseInt(req.params.unitId as string);

    if (isNaN(unitId) || unitId <= 0) {
      throw createError("Invalid unit ID", 400);
    }

    const learningBlocks = await LearningBlockService.getLearningBlocksByUnit(
      unitId
    );

    res.status(200).json({
      success: true,
      message: "Learning blocks retrieved successfully",
      data: learningBlocks,
      meta: {
        unitId,
        count: learningBlocks.length,
      },
    });
  }

  /**
   * Update learning block by ID
   * PUT /learning-blocks/:id
   */
  static async updateLearningBlock(req: Request, res: Response): Promise<void> {
    const learningBlockId = parseInt(req.params.id as string);

    if (isNaN(learningBlockId) || learningBlockId <= 0) {
      throw createError("Invalid learning block ID", 400);
    }

    const existingLearningBlock =
      await LearningBlockService.learningBlockExists(learningBlockId);
    if (!existingLearningBlock) {
      throw createError("Learning block not found", 404);
    }

    const validation = validateLearningBlockInput(req.body);
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    // Verify unit exists if being updated
    if (req.body.unitId && req.body.unitId !== existingLearningBlock.unitId) {
      const unitExists = await UnitService.unitExists(req.body.unitId);
      if (!unitExists) {
        throw createError("Unit not found", 404);
      }
    }

    const updateData: UpdateLearningBlock = {};
    if (req.body.unitId) updateData.unitId = req.body.unitId;
    if (req.body.type) updateData.type = req.body.type.trim();
    if (req.body.title) updateData.title = req.body.title.trim();
    if (req.body.order) updateData.order = req.body.order;
    if (req.body.content !== undefined)
      updateData.content = req.body.content?.trim() || null;
    if (req.body.videoUrl !== undefined)
      updateData.videoUrl = req.body.videoUrl?.trim() || null;
    if (req.body.imageUrl !== undefined)
      updateData.imageUrl = req.body.imageUrl?.trim() || null;
    if (req.body.interactiveData !== undefined)
      updateData.interactiveData = req.body.interactiveData;
    if (req.body.xpPoints !== undefined)
      updateData.xpPoints = req.body.xpPoints;

    const updatedLearningBlock = await LearningBlockService.updateLearningBlock(
      learningBlockId,
      updateData
    );

    res.status(200).json({
      success: true,
      message: "Learning block updated successfully",
      data: updatedLearningBlock,
    });
  }

  /**
   * Delete learning block by ID
   * DELETE /learning-blocks/:id
   */
  static async deleteLearningBlock(req: Request, res: Response): Promise<void> {
    const learningBlockId = parseInt(req.params.id as string);

    if (isNaN(learningBlockId) || learningBlockId <= 0) {
      throw createError("Invalid learning block ID", 400);
    }

    const existingLearningBlock =
      await LearningBlockService.learningBlockExists(learningBlockId);
    if (!existingLearningBlock) {
      throw createError("Learning block not found", 404);
    }

    const deleted = await LearningBlockService.deleteLearningBlock(
      learningBlockId
    );

    if (!deleted) {
      throw createError("Failed to delete learning block", 500);
    }

    res.status(200).json({
      success: true,
      message: "Learning block deleted successfully",
    });
  }
}
