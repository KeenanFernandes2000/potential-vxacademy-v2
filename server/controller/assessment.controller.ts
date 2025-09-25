import type { Request, Response } from "express";
import {
  AssessmentService,
  QuestionService,
  AssessmentAttemptService,
} from "../services/assessment.services";
import { UserService } from "../services/user.services";
import {
  TrainingAreaService,
  ModuleService,
  CourseService,
  UnitService,
} from "../services/training.services";
import type {
  NewAssessment,
  UpdateAssessment,
  NewQuestion,
  UpdateQuestion,
  NewAssessmentAttempt,
  UpdateAssessmentAttempt,
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

const validateAssessmentInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (
    !data.title ||
    typeof data.title !== "string" ||
    data.title.trim().length === 0
  ) {
    errors.push("Title is required and must be a non-empty string");
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

  if (
    data.placement !== undefined &&
    !["start", "middle", "end"].includes(data.placement)
  ) {
    errors.push("Placement must be one of: start, middle, end");
  }

  if (data.isGraded !== undefined && typeof data.isGraded !== "boolean") {
    errors.push("Is graded must be a boolean if provided");
  }

  if (
    data.showCorrectAnswers !== undefined &&
    typeof data.showCorrectAnswers !== "boolean"
  ) {
    errors.push("Show correct answers must be a boolean if provided");
  }

  if (
    data.passingScore !== undefined &&
    (typeof data.passingScore !== "number" ||
      data.passingScore < 0 ||
      data.passingScore > 100)
  ) {
    errors.push("Passing score must be a number between 0 and 100 if provided");
  }

  if (
    data.hasTimeLimit !== undefined &&
    typeof data.hasTimeLimit !== "boolean"
  ) {
    errors.push("Has time limit must be a boolean if provided");
  }

  if (
    data.timeLimit !== undefined &&
    (typeof data.timeLimit !== "number" || data.timeLimit <= 0)
  ) {
    errors.push("Time limit must be a positive number if provided");
  }

  if (
    data.maxRetakes !== undefined &&
    (typeof data.maxRetakes !== "number" || data.maxRetakes < 0)
  ) {
    errors.push("Max retakes must be a non-negative number if provided");
  }

  if (
    data.hasCertificate !== undefined &&
    typeof data.hasCertificate !== "boolean"
  ) {
    errors.push("Has certificate must be a boolean if provided");
  }

  if (
    data.certificateTemplate !== undefined &&
    typeof data.certificateTemplate !== "string"
  ) {
    errors.push("Certificate template must be a string if provided");
  }

  if (
    data.xpPoints !== undefined &&
    (typeof data.xpPoints !== "number" || data.xpPoints < 0)
  ) {
    errors.push("XP points must be a non-negative number if provided");
  }

  return { isValid: errors.length === 0, errors };
};

const validateQuestionInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (
    !data.assessmentId ||
    typeof data.assessmentId !== "number" ||
    data.assessmentId <= 0
  ) {
    errors.push("Valid assessment ID is required");
  }

  if (
    !data.questionText ||
    typeof data.questionText !== "string" ||
    data.questionText.trim().length === 0
  ) {
    errors.push("Question text is required and must be a non-empty string");
  }

  if (
    data.questionType !== undefined &&
    !["mcq", "true_false", "short_answer", "essay"].includes(data.questionType)
  ) {
    errors.push(
      "Question type must be one of: mcq, true_false, short_answer, essay"
    );
  }

  if (!data.order || typeof data.order !== "number" || data.order < 1) {
    errors.push("Order is required and must be a positive number");
  }

  if (
    data.correctAnswer !== undefined &&
    typeof data.correctAnswer !== "string"
  ) {
    errors.push("Correct answer must be a string if provided");
  }

  return { isValid: errors.length === 0, errors };
};

const validateAssessmentAttemptInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.userId || typeof data.userId !== "number" || data.userId <= 0) {
    errors.push("Valid user ID is required");
  }

  if (
    !data.assessmentId ||
    typeof data.assessmentId !== "number" ||
    data.assessmentId <= 0
  ) {
    errors.push("Valid assessment ID is required");
  }

  if (
    data.score === undefined ||
    typeof data.score !== "number" ||
    data.score < 0 ||
    data.score > 100
  ) {
    errors.push("Score is required and must be a number between 0 and 100");
  }

  if (data.passed === undefined || typeof data.passed !== "boolean") {
    errors.push("Passed is required and must be a boolean");
  }

  return { isValid: errors.length === 0, errors };
};

// ==================== ASSESSMENT CONTROLLERS ====================
export class AssessmentController {
  /**
   * Create a new assessment
   * POST /assessments
   */
  static async createAssessment(req: Request, res: Response): Promise<void> {
    const validation = validateAssessmentInput(req.body);

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

    // Verify optional related entities exist
    if (req.body.moduleId) {
      const moduleExists = await ModuleService.moduleExists(req.body.moduleId);
      if (!moduleExists) {
        throw createError("Module not found", 404);
      }
    }

    if (req.body.courseId) {
      const courseExists = await CourseService.courseExists(req.body.courseId);
      if (!courseExists) {
        throw createError("Course not found", 404);
      }
    }

    if (req.body.unitId) {
      const unitExists = await UnitService.unitExists(req.body.unitId);
      if (!unitExists) {
        throw createError("Unit not found", 404);
      }
    }

    const assessmentData: NewAssessment = {
      title: req.body.title.trim(),
      trainingAreaId: req.body.trainingAreaId,
      moduleId: req.body.moduleId || null,
      courseId: req.body.courseId || null,
      unitId: req.body.unitId || null,
      description: req.body.description?.trim() || null,
      placement: req.body.placement || "end",
      isGraded: req.body.isGraded ?? true,
      showCorrectAnswers: req.body.showCorrectAnswers ?? false,
      passingScore: req.body.passingScore || null,
      hasTimeLimit: req.body.hasTimeLimit ?? false,
      timeLimit: req.body.timeLimit || null,
      maxRetakes: req.body.maxRetakes ?? 3,
      hasCertificate: req.body.hasCertificate ?? false,
      certificateTemplate: req.body.certificateTemplate?.trim() || null,
      xpPoints: req.body.xpPoints ?? 50,
    };

    const newAssessment = await AssessmentService.createAssessment(
      assessmentData
    );

    res.status(201).json({
      success: true,
      message: "Assessment created successfully",
      data: newAssessment,
    });
  }

  /**
   * Get all assessments
   * GET /assessments?limit=10&offset=0
   */
  static async getAllAssessments(req: Request, res: Response): Promise<void> {
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

    const assessments = await AssessmentService.getAllAssessments(
      limit,
      offset
    );

    res.status(200).json({
      success: true,
      message: "Assessments retrieved successfully",
      data: assessments,
      meta: {
        limit: limit || null,
        offset: offset || 0,
        count: assessments.length,
      },
    });
  }

  /**
   * Get assessment by ID
   * GET /assessments/:id
   */
  static async getAssessmentById(req: Request, res: Response): Promise<void> {
    const assessmentId = parseInt(req.params.id as string);

    if (isNaN(assessmentId) || assessmentId <= 0) {
      throw createError("Invalid assessment ID", 400);
    }

    const assessment = await AssessmentService.getAssessmentById(assessmentId);

    if (!assessment) {
      throw createError("Assessment not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Assessment retrieved successfully",
      data: assessment,
    });
  }

  /**
   * Get assessments by training area ID
   * GET /training-areas/:trainingAreaId/assessments
   */
  static async getAssessmentsByTrainingArea(
    req: Request,
    res: Response
  ): Promise<void> {
    const trainingAreaId = parseInt(req.params.trainingAreaId as string);

    if (isNaN(trainingAreaId) || trainingAreaId <= 0) {
      throw createError("Invalid training area ID", 400);
    }

    const assessments = await AssessmentService.getAssessmentsByTrainingArea(
      trainingAreaId
    );

    res.status(200).json({
      success: true,
      message: "Assessments retrieved successfully",
      data: assessments,
      meta: {
        trainingAreaId,
        count: assessments.length,
      },
    });
  }

  /**
   * Get assessments by module ID
   * GET /modules/:moduleId/assessments
   */
  static async getAssessmentsByModule(
    req: Request,
    res: Response
  ): Promise<void> {
    const moduleId = parseInt(req.params.moduleId as string);

    if (isNaN(moduleId) || moduleId <= 0) {
      throw createError("Invalid module ID", 400);
    }

    const assessments = await AssessmentService.getAssessmentsByModule(
      moduleId
    );

    res.status(200).json({
      success: true,
      message: "Assessments retrieved successfully",
      data: assessments,
      meta: {
        moduleId,
        count: assessments.length,
      },
    });
  }

  /**
   * Get assessments by course ID
   * GET /courses/:courseId/assessments
   */
  static async getAssessmentsByCourse(
    req: Request,
    res: Response
  ): Promise<void> {
    const courseId = parseInt(req.params.courseId as string);

    if (isNaN(courseId) || courseId <= 0) {
      throw createError("Invalid course ID", 400);
    }

    const assessments = await AssessmentService.getAssessmentsByCourse(
      courseId
    );

    res.status(200).json({
      success: true,
      message: "Assessments retrieved successfully",
      data: assessments,
      meta: {
        courseId,
        count: assessments.length,
      },
    });
  }

  /**
   * Get assessments by unit ID
   * GET /units/:unitId/assessments
   */
  static async getAssessmentsByUnit(
    req: Request,
    res: Response
  ): Promise<void> {
    const unitId = parseInt(req.params.unitId as string);

    if (isNaN(unitId) || unitId <= 0) {
      throw createError("Invalid unit ID", 400);
    }

    const assessments = await AssessmentService.getAssessmentsByUnit(unitId);

    res.status(200).json({
      success: true,
      message: "Assessments retrieved successfully",
      data: assessments,
      meta: {
        unitId,
        count: assessments.length,
      },
    });
  }

  /**
   * Update assessment by ID
   * PUT /assessments/:id
   */
  static async updateAssessment(req: Request, res: Response): Promise<void> {
    const assessmentId = parseInt(req.params.id as string);

    if (isNaN(assessmentId) || assessmentId <= 0) {
      throw createError("Invalid assessment ID", 400);
    }

    const existingAssessment = await AssessmentService.assessmentExists(
      assessmentId
    );
    if (!existingAssessment) {
      throw createError("Assessment not found", 404);
    }

    const validation = validateAssessmentInput(req.body);
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    // Verify related entities exist if being updated
    if (
      req.body.trainingAreaId &&
      req.body.trainingAreaId !== existingAssessment.trainingAreaId
    ) {
      const trainingAreaExists = await TrainingAreaService.trainingAreaExists(
        req.body.trainingAreaId
      );
      if (!trainingAreaExists) {
        throw createError("Training area not found", 404);
      }
    }

    if (
      req.body.moduleId &&
      req.body.moduleId !== existingAssessment.moduleId
    ) {
      const moduleExists = await ModuleService.moduleExists(req.body.moduleId);
      if (!moduleExists) {
        throw createError("Module not found", 404);
      }
    }

    if (
      req.body.courseId &&
      req.body.courseId !== existingAssessment.courseId
    ) {
      const courseExists = await CourseService.courseExists(req.body.courseId);
      if (!courseExists) {
        throw createError("Course not found", 404);
      }
    }

    if (req.body.unitId && req.body.unitId !== existingAssessment.unitId) {
      const unitExists = await UnitService.unitExists(req.body.unitId);
      if (!unitExists) {
        throw createError("Unit not found", 404);
      }
    }

    const updateData: UpdateAssessment = {};
    if (req.body.title) updateData.title = req.body.title.trim();
    if (req.body.trainingAreaId)
      updateData.trainingAreaId = req.body.trainingAreaId;
    if (req.body.moduleId !== undefined)
      updateData.moduleId = req.body.moduleId;
    if (req.body.courseId !== undefined)
      updateData.courseId = req.body.courseId;
    if (req.body.unitId !== undefined) updateData.unitId = req.body.unitId;
    if (req.body.description !== undefined)
      updateData.description = req.body.description?.trim() || null;
    if (req.body.placement) updateData.placement = req.body.placement;
    if (req.body.isGraded !== undefined)
      updateData.isGraded = req.body.isGraded;
    if (req.body.showCorrectAnswers !== undefined)
      updateData.showCorrectAnswers = req.body.showCorrectAnswers;
    if (req.body.passingScore !== undefined)
      updateData.passingScore = req.body.passingScore;
    if (req.body.hasTimeLimit !== undefined)
      updateData.hasTimeLimit = req.body.hasTimeLimit;
    if (req.body.timeLimit !== undefined)
      updateData.timeLimit = req.body.timeLimit;
    if (req.body.maxRetakes !== undefined)
      updateData.maxRetakes = req.body.maxRetakes;
    if (req.body.hasCertificate !== undefined)
      updateData.hasCertificate = req.body.hasCertificate;
    if (req.body.certificateTemplate !== undefined)
      updateData.certificateTemplate =
        req.body.certificateTemplate?.trim() || null;
    if (req.body.xpPoints !== undefined)
      updateData.xpPoints = req.body.xpPoints;

    const updatedAssessment = await AssessmentService.updateAssessment(
      assessmentId,
      updateData
    );

    res.status(200).json({
      success: true,
      message: "Assessment updated successfully",
      data: updatedAssessment,
    });
  }

  /**
   * Delete assessment by ID
   * DELETE /assessments/:id
   */
  static async deleteAssessment(req: Request, res: Response): Promise<void> {
    const assessmentId = parseInt(req.params.id as string);

    if (isNaN(assessmentId) || assessmentId <= 0) {
      throw createError("Invalid assessment ID", 400);
    }

    const existingAssessment = await AssessmentService.assessmentExists(
      assessmentId
    );
    if (!existingAssessment) {
      throw createError("Assessment not found", 404);
    }

    const deleted = await AssessmentService.deleteAssessment(assessmentId);

    if (!deleted) {
      throw createError("Failed to delete assessment", 500);
    }

    res.status(200).json({
      success: true,
      message: "Assessment deleted successfully",
    });
  }
}

// ==================== QUESTION CONTROLLERS ====================
export class QuestionController {
  /**
   * Create a new question
   * POST /questions
   */
  static async createQuestion(req: Request, res: Response): Promise<void> {
    const validation = validateQuestionInput(req.body);

    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    // Verify assessment exists
    const assessmentExists = await AssessmentService.assessmentExists(
      req.body.assessmentId
    );
    if (!assessmentExists) {
      throw createError("Assessment not found", 404);
    }

    const questionData: NewQuestion = {
      assessmentId: req.body.assessmentId,
      questionText: req.body.questionText.trim(),
      questionType: req.body.questionType || "mcq",
      options: req.body.options || null,
      correctAnswer: req.body.correctAnswer?.trim() || null,
      order: req.body.order,
    };

    const newQuestion = await QuestionService.createQuestion(questionData);

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: newQuestion,
    });
  }

  /**
   * Get all questions
   * GET /questions?limit=10&offset=0
   */
  static async getAllQuestions(req: Request, res: Response): Promise<void> {
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

    const questions = await QuestionService.getAllQuestions(limit, offset);

    res.status(200).json({
      success: true,
      message: "Questions retrieved successfully",
      data: questions,
      meta: {
        limit: limit || null,
        offset: offset || 0,
        count: questions.length,
      },
    });
  }

  /**
   * Get question by ID
   * GET /questions/:id
   */
  static async getQuestionById(req: Request, res: Response): Promise<void> {
    const questionId = parseInt(req.params.id as string);

    if (isNaN(questionId) || questionId <= 0) {
      throw createError("Invalid question ID", 400);
    }

    const question = await QuestionService.getQuestionById(questionId);

    if (!question) {
      throw createError("Question not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Question retrieved successfully",
      data: question,
    });
  }

  /**
   * Get questions by assessment ID
   * GET /assessments/:assessmentId/questions
   */
  static async getQuestionsByAssessment(
    req: Request,
    res: Response
  ): Promise<void> {
    const assessmentId = parseInt(req.params.assessmentId as string);

    if (isNaN(assessmentId) || assessmentId <= 0) {
      throw createError("Invalid assessment ID", 400);
    }

    const questions = await QuestionService.getQuestionsByAssessment(
      assessmentId
    );

    res.status(200).json({
      success: true,
      message: "Questions retrieved successfully",
      data: questions,
      meta: {
        assessmentId,
        count: questions.length,
      },
    });
  }

  /**
   * Update question by ID
   * PUT /questions/:id
   */
  static async updateQuestion(req: Request, res: Response): Promise<void> {
    const questionId = parseInt(req.params.id as string);

    if (isNaN(questionId) || questionId <= 0) {
      throw createError("Invalid question ID", 400);
    }

    const existingQuestion = await QuestionService.questionExists(questionId);
    if (!existingQuestion) {
      throw createError("Question not found", 404);
    }

    const validation = validateQuestionInput(req.body);
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    // Verify assessment exists if being updated
    if (
      req.body.assessmentId &&
      req.body.assessmentId !== existingQuestion.assessmentId
    ) {
      const assessmentExists = await AssessmentService.assessmentExists(
        req.body.assessmentId
      );
      if (!assessmentExists) {
        throw createError("Assessment not found", 404);
      }
    }

    const updateData: UpdateQuestion = {};
    if (req.body.assessmentId) updateData.assessmentId = req.body.assessmentId;
    if (req.body.questionText)
      updateData.questionText = req.body.questionText.trim();
    if (req.body.questionType) updateData.questionType = req.body.questionType;
    if (req.body.options !== undefined) updateData.options = req.body.options;
    if (req.body.correctAnswer !== undefined)
      updateData.correctAnswer = req.body.correctAnswer?.trim() || null;
    if (req.body.order) updateData.order = req.body.order;

    const updatedQuestion = await QuestionService.updateQuestion(
      questionId,
      updateData
    );

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: updatedQuestion,
    });
  }

  /**
   * Delete question by ID
   * DELETE /questions/:id
   */
  static async deleteQuestion(req: Request, res: Response): Promise<void> {
    const questionId = parseInt(req.params.id as string);

    if (isNaN(questionId) || questionId <= 0) {
      throw createError("Invalid question ID", 400);
    }

    const existingQuestion = await QuestionService.questionExists(questionId);
    if (!existingQuestion) {
      throw createError("Question not found", 404);
    }

    const deleted = await QuestionService.deleteQuestion(questionId);

    if (!deleted) {
      throw createError("Failed to delete question", 500);
    }

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  }
}

// ==================== ASSESSMENT ATTEMPT CONTROLLERS ====================
export class AssessmentAttemptController {
  /**
   * Create a new assessment attempt
   * POST /assessment-attempts
   */
  static async createAssessmentAttempt(
    req: Request,
    res: Response
  ): Promise<void> {
    const validation = validateAssessmentAttemptInput(req.body);

    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    // Verify user exists
    const userExists = await UserService.userExists(req.body.userId);
    if (!userExists) {
      throw createError("User not found", 404);
    }

    // Verify assessment exists
    const assessmentExists = await AssessmentService.assessmentExists(
      req.body.assessmentId
    );
    if (!assessmentExists) {
      throw createError("Assessment not found", 404);
    }

    // Check if user has exceeded max retakes
    const attemptCount =
      await AssessmentAttemptService.getAssessmentAttemptsCountByUserAndAssessment(
        req.body.userId,
        req.body.assessmentId
      );

    if (attemptCount >= assessmentExists.maxRetakes) {
      throw createError("Maximum number of attempts exceeded", 409);
    }

    const attemptData: NewAssessmentAttempt = {
      userId: req.body.userId,
      assessmentId: req.body.assessmentId,
      score: req.body.score,
      passed: req.body.passed,
      answers: req.body.answers || null,
    };

    const newAttempt = await AssessmentAttemptService.createAssessmentAttempt(
      attemptData
    );

    res.status(201).json({
      success: true,
      message: "Assessment attempt created successfully",
      data: newAttempt,
    });
  }

  /**
   * Get all assessment attempts
   * GET /assessment-attempts?limit=10&offset=0
   */
  static async getAllAssessmentAttempts(
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

    const attempts = await AssessmentAttemptService.getAllAssessmentAttempts(
      limit,
      offset
    );

    res.status(200).json({
      success: true,
      message: "Assessment attempts retrieved successfully",
      data: attempts,
      meta: {
        limit: limit || null,
        offset: offset || 0,
        count: attempts.length,
      },
    });
  }

  /**
   * Get assessment attempt by ID
   * GET /assessment-attempts/:id
   */
  static async getAssessmentAttemptById(
    req: Request,
    res: Response
  ): Promise<void> {
    const attemptId = parseInt(req.params.id as string);

    if (isNaN(attemptId) || attemptId <= 0) {
      throw createError("Invalid assessment attempt ID", 400);
    }

    const attempt = await AssessmentAttemptService.getAssessmentAttemptById(
      attemptId
    );

    if (!attempt) {
      throw createError("Assessment attempt not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Assessment attempt retrieved successfully",
      data: attempt,
    });
  }

  /**
   * Get assessment attempts by user ID
   * GET /users/:userId/assessment-attempts
   */
  static async getAssessmentAttemptsByUser(
    req: Request,
    res: Response
  ): Promise<void> {
    const userId = parseInt(req.params.userId as string);

    if (isNaN(userId) || userId <= 0) {
      throw createError("Invalid user ID", 400);
    }

    const attempts = await AssessmentAttemptService.getAssessmentAttemptsByUser(
      userId
    );

    res.status(200).json({
      success: true,
      message: "Assessment attempts retrieved successfully",
      data: attempts,
      meta: {
        userId,
        count: attempts.length,
      },
    });
  }

  /**
   * Get assessment attempts by assessment ID
   * GET /assessments/:assessmentId/attempts
   */
  static async getAssessmentAttemptsByAssessment(
    req: Request,
    res: Response
  ): Promise<void> {
    const assessmentId = parseInt(req.params.assessmentId as string);

    if (isNaN(assessmentId) || assessmentId <= 0) {
      throw createError("Invalid assessment ID", 400);
    }

    const attempts =
      await AssessmentAttemptService.getAssessmentAttemptsByAssessment(
        assessmentId
      );

    res.status(200).json({
      success: true,
      message: "Assessment attempts retrieved successfully",
      data: attempts,
      meta: {
        assessmentId,
        count: attempts.length,
      },
    });
  }

  /**
   * Get assessment attempts by user and assessment
   * GET /users/:userId/assessments/:assessmentId/attempts
   */
  static async getAssessmentAttemptsByUserAndAssessment(
    req: Request,
    res: Response
  ): Promise<void> {
    const userId = parseInt(req.params.userId as string);
    const assessmentId = parseInt(req.params.assessmentId as string);

    if (isNaN(userId) || userId <= 0) {
      throw createError("Invalid user ID", 400);
    }

    if (isNaN(assessmentId) || assessmentId <= 0) {
      throw createError("Invalid assessment ID", 400);
    }

    const attempts =
      await AssessmentAttemptService.getAssessmentAttemptsByUserAndAssessment(
        userId,
        assessmentId
      );

    res.status(200).json({
      success: true,
      message: "Assessment attempts retrieved successfully",
      data: attempts,
      meta: {
        userId,
        assessmentId,
        count: attempts.length,
      },
    });
  }

  /**
   * Get best score by user and assessment
   * GET /users/:userId/assessments/:assessmentId/best-score
   */
  static async getBestScoreByUserAndAssessment(
    req: Request,
    res: Response
  ): Promise<void> {
    const userId = parseInt(req.params.userId as string);
    const assessmentId = parseInt(req.params.assessmentId as string);

    if (isNaN(userId) || userId <= 0) {
      throw createError("Invalid user ID", 400);
    }

    if (isNaN(assessmentId) || assessmentId <= 0) {
      throw createError("Invalid assessment ID", 400);
    }

    const bestAttempt =
      await AssessmentAttemptService.getBestScoreByUserAndAssessment(
        userId,
        assessmentId
      );

    if (!bestAttempt) {
      throw createError("No attempts found for this user and assessment", 404);
    }

    res.status(200).json({
      success: true,
      message: "Best score retrieved successfully",
      data: bestAttempt,
    });
  }

  /**
   * Update assessment attempt by ID
   * PUT /assessment-attempts/:id
   */
  static async updateAssessmentAttempt(
    req: Request,
    res: Response
  ): Promise<void> {
    const attemptId = parseInt(req.params.id as string);

    if (isNaN(attemptId) || attemptId <= 0) {
      throw createError("Invalid assessment attempt ID", 400);
    }

    const existingAttempt =
      await AssessmentAttemptService.assessmentAttemptExists(attemptId);
    if (!existingAttempt) {
      throw createError("Assessment attempt not found", 404);
    }

    const validation = validateAssessmentAttemptInput(req.body);
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    const updateData: UpdateAssessmentAttempt = {};
    if (req.body.score !== undefined) updateData.score = req.body.score;
    if (req.body.passed !== undefined) updateData.passed = req.body.passed;
    if (req.body.answers !== undefined) updateData.answers = req.body.answers;

    const updatedAttempt =
      await AssessmentAttemptService.updateAssessmentAttempt(
        attemptId,
        updateData
      );

    res.status(200).json({
      success: true,
      message: "Assessment attempt updated successfully",
      data: updatedAttempt,
    });
  }

  /**
   * Delete assessment attempt by ID
   * DELETE /assessment-attempts/:id
   */
  static async deleteAssessmentAttempt(
    req: Request,
    res: Response
  ): Promise<void> {
    const attemptId = parseInt(req.params.id as string);

    if (isNaN(attemptId) || attemptId <= 0) {
      throw createError("Invalid assessment attempt ID", 400);
    }

    const existingAttempt =
      await AssessmentAttemptService.assessmentAttemptExists(attemptId);
    if (!existingAttempt) {
      throw createError("Assessment attempt not found", 404);
    }

    const deleted = await AssessmentAttemptService.deleteAssessmentAttempt(
      attemptId
    );

    if (!deleted) {
      throw createError("Failed to delete assessment attempt", 500);
    }

    res.status(200).json({
      success: true,
      message: "Assessment attempt deleted successfully",
    });
  }
}
