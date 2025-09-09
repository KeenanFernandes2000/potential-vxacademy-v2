import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/connection";
import {
  assessments,
  questions,
  assessmentAttempts,
} from "../db/schema/assessments";
import type {
  Assessment,
  NewAssessment,
  UpdateAssessment,
  Question,
  NewQuestion,
  UpdateQuestion,
  AssessmentAttempt,
  NewAssessmentAttempt,
  UpdateAssessmentAttempt,
} from "../db/types";

// ==================== ASSESSMENTS SERVICE ====================
export class AssessmentService {
  /**
   * Create a new assessment
   */
  static async createAssessment(data: NewAssessment): Promise<Assessment> {
    const result = await db
      .insert(assessments)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();

    if (!result[0]) {
      throw new Error("Failed to create assessment");
    }

    return result[0];
  }

  /**
   * Get assessment by ID
   */
  static async getAssessmentById(id: number): Promise<Assessment | null> {
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, id))
      .limit(1);

    return assessment || null;
  }

  /**
   * Get all assessments with optional pagination
   */
  static async getAllAssessments(
    limit?: number,
    offset?: number
  ): Promise<Assessment[]> {
    const query = db
      .select()
      .from(assessments)
      .orderBy(desc(assessments.createdAt));

    if (limit !== undefined) {
      query.limit(limit);
    }

    if (offset !== undefined) {
      query.offset(offset);
    }

    return await query;
  }

  /**
   * Get assessments by training area ID
   */
  static async getAssessmentsByTrainingArea(
    trainingAreaId: number
  ): Promise<Assessment[]> {
    return await db
      .select()
      .from(assessments)
      .where(eq(assessments.trainingAreaId, trainingAreaId))
      .orderBy(desc(assessments.createdAt));
  }

  /**
   * Get assessments by module ID
   */
  static async getAssessmentsByModule(moduleId: number): Promise<Assessment[]> {
    return await db
      .select()
      .from(assessments)
      .where(eq(assessments.moduleId, moduleId))
      .orderBy(desc(assessments.createdAt));
  }

  /**
   * Get assessments by course ID
   */
  static async getAssessmentsByCourse(courseId: number): Promise<Assessment[]> {
    return await db
      .select()
      .from(assessments)
      .where(eq(assessments.courseId, courseId))
      .orderBy(desc(assessments.createdAt));
  }

  /**
   * Get assessments by unit ID
   */
  static async getAssessmentsByUnit(unitId: number): Promise<Assessment[]> {
    return await db
      .select()
      .from(assessments)
      .where(eq(assessments.unitId, unitId))
      .orderBy(desc(assessments.createdAt));
  }

  /**
   * Update assessment by ID
   */
  static async updateAssessment(
    id: number,
    updateData: UpdateAssessment
  ): Promise<Assessment | null> {
    const [updatedAssessment] = await db
      .update(assessments)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(assessments.id, id))
      .returning();

    return updatedAssessment || null;
  }

  /**
   * Delete assessment by ID
   */
  static async deleteAssessment(id: number): Promise<boolean> {
    const result = await db
      .delete(assessments)
      .where(eq(assessments.id, id))
      .returning({ id: assessments.id });

    return result.length > 0;
  }

  /**
   * Check if assessment exists by ID
   */
  static async assessmentExists(id: number): Promise<Assessment | null> {
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, id))
      .limit(1);

    return assessment || null;
  }
}

// ==================== QUESTIONS SERVICE ====================
export class QuestionService {
  /**
   * Create a new question
   */
  static async createQuestion(data: NewQuestion): Promise<Question> {
    const result = await db
      .insert(questions)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();

    if (!result[0]) {
      throw new Error("Failed to create question");
    }

    return result[0];
  }

  /**
   * Get question by ID
   */
  static async getQuestionById(id: number): Promise<Question | null> {
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id))
      .limit(1);

    return question || null;
  }

  /**
   * Get all questions with optional pagination
   */
  static async getAllQuestions(
    limit?: number,
    offset?: number
  ): Promise<Question[]> {
    const query = db
      .select()
      .from(questions)
      .orderBy(desc(questions.createdAt));

    if (limit !== undefined) {
      query.limit(limit);
    }

    if (offset !== undefined) {
      query.offset(offset);
    }

    return await query;
  }

  /**
   * Get questions by assessment ID
   */
  static async getQuestionsByAssessment(
    assessmentId: number
  ): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.assessmentId, assessmentId))
      .orderBy(questions.order);
  }

  /**
   * Update question by ID
   */
  static async updateQuestion(
    id: number,
    updateData: UpdateQuestion
  ): Promise<Question | null> {
    const [updatedQuestion] = await db
      .update(questions)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, id))
      .returning();

    return updatedQuestion || null;
  }

  /**
   * Delete question by ID
   */
  static async deleteQuestion(id: number): Promise<boolean> {
    const result = await db
      .delete(questions)
      .where(eq(questions.id, id))
      .returning({ id: questions.id });

    return result.length > 0;
  }

  /**
   * Check if question exists by ID
   */
  static async questionExists(id: number): Promise<Question | null> {
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id))
      .limit(1);

    return question || null;
  }

  /**
   * Get questions count by assessment ID
   */
  static async getQuestionsCountByAssessment(
    assessmentId: number
  ): Promise<number> {
    const result = await db
      .select()
      .from(questions)
      .where(eq(questions.assessmentId, assessmentId));

    return result.length;
  }
}

// ==================== ASSESSMENT ATTEMPTS SERVICE ====================
export class AssessmentAttemptService {
  /**
   * Create a new assessment attempt
   */
  static async createAssessmentAttempt(
    data: NewAssessmentAttempt
  ): Promise<AssessmentAttempt> {
    const result = await db
      .insert(assessmentAttempts)
      .values({
        ...data,
        startedAt: new Date(),
        completedAt: new Date(),
      })
      .returning();

    if (!result[0]) {
      throw new Error("Failed to create assessment attempt");
    }

    return result[0];
  }

  /**
   * Get assessment attempt by ID
   */
  static async getAssessmentAttemptById(
    id: number
  ): Promise<AssessmentAttempt | null> {
    const [attempt] = await db
      .select()
      .from(assessmentAttempts)
      .where(eq(assessmentAttempts.id, id))
      .limit(1);

    return attempt || null;
  }

  /**
   * Get all assessment attempts with optional pagination
   */
  static async getAllAssessmentAttempts(
    limit?: number,
    offset?: number
  ): Promise<AssessmentAttempt[]> {
    const query = db
      .select()
      .from(assessmentAttempts)
      .orderBy(desc(assessmentAttempts.startedAt));

    if (limit !== undefined) {
      query.limit(limit);
    }

    if (offset !== undefined) {
      query.offset(offset);
    }

    return await query;
  }

  /**
   * Get assessment attempts by user ID
   */
  static async getAssessmentAttemptsByUser(
    userId: number
  ): Promise<AssessmentAttempt[]> {
    return await db
      .select()
      .from(assessmentAttempts)
      .where(eq(assessmentAttempts.userId, userId))
      .orderBy(desc(assessmentAttempts.startedAt));
  }

  /**
   * Get assessment attempts by assessment ID
   */
  static async getAssessmentAttemptsByAssessment(
    assessmentId: number
  ): Promise<AssessmentAttempt[]> {
    return await db
      .select()
      .from(assessmentAttempts)
      .where(eq(assessmentAttempts.assessmentId, assessmentId))
      .orderBy(desc(assessmentAttempts.startedAt));
  }

  /**
   * Get assessment attempts by user and assessment
   */
  static async getAssessmentAttemptsByUserAndAssessment(
    userId: number,
    assessmentId: number
  ): Promise<AssessmentAttempt[]> {
    return await db
      .select()
      .from(assessmentAttempts)
      .where(
        and(
          eq(assessmentAttempts.userId, userId),
          eq(assessmentAttempts.assessmentId, assessmentId)
        )
      )
      .orderBy(desc(assessmentAttempts.startedAt));
  }

  /**
   * Get latest assessment attempt by user and assessment
   */
  static async getLatestAssessmentAttemptByUserAndAssessment(
    userId: number,
    assessmentId: number
  ): Promise<AssessmentAttempt | null> {
    const [attempt] = await db
      .select()
      .from(assessmentAttempts)
      .where(
        and(
          eq(assessmentAttempts.userId, userId),
          eq(assessmentAttempts.assessmentId, assessmentId)
        )
      )
      .orderBy(desc(assessmentAttempts.startedAt))
      .limit(1);

    return attempt || null;
  }

  /**
   * Get assessment attempts count by user and assessment
   */
  static async getAssessmentAttemptsCountByUserAndAssessment(
    userId: number,
    assessmentId: number
  ): Promise<number> {
    const result = await db
      .select()
      .from(assessmentAttempts)
      .where(
        and(
          eq(assessmentAttempts.userId, userId),
          eq(assessmentAttempts.assessmentId, assessmentId)
        )
      );

    return result.length;
  }

  /**
   * Update assessment attempt by ID
   */
  static async updateAssessmentAttempt(
    id: number,
    updateData: UpdateAssessmentAttempt
  ): Promise<AssessmentAttempt | null> {
    const [updatedAttempt] = await db
      .update(assessmentAttempts)
      .set({
        ...updateData,
        completedAt: new Date(),
      })
      .where(eq(assessmentAttempts.id, id))
      .returning();

    return updatedAttempt || null;
  }

  /**
   * Delete assessment attempt by ID
   */
  static async deleteAssessmentAttempt(id: number): Promise<boolean> {
    const result = await db
      .delete(assessmentAttempts)
      .where(eq(assessmentAttempts.id, id))
      .returning({ id: assessmentAttempts.id });

    return result.length > 0;
  }

  /**
   * Check if assessment attempt exists by ID
   */
  static async assessmentAttemptExists(
    id: number
  ): Promise<AssessmentAttempt | null> {
    const [attempt] = await db
      .select()
      .from(assessmentAttempts)
      .where(eq(assessmentAttempts.id, id))
      .limit(1);

    return attempt || null;
  }

  /**
   * Get best score by user and assessment
   */
  static async getBestScoreByUserAndAssessment(
    userId: number,
    assessmentId: number
  ): Promise<AssessmentAttempt | null> {
    const attempts = await db
      .select()
      .from(assessmentAttempts)
      .where(
        and(
          eq(assessmentAttempts.userId, userId),
          eq(assessmentAttempts.assessmentId, assessmentId)
        )
      );

    if (attempts.length === 0) {
      return null;
    }

    // Find the attempt with the highest score
    return attempts.reduce((best, current) =>
      current.score > best.score ? current : best
    );
  }

  /**
   * Check if user passed assessment
   */
  static async hasUserPassedAssessment(
    userId: number,
    assessmentId: number
  ): Promise<boolean> {
    const [attempt] = await db
      .select()
      .from(assessmentAttempts)
      .where(
        and(
          eq(assessmentAttempts.userId, userId),
          eq(assessmentAttempts.assessmentId, assessmentId),
          eq(assessmentAttempts.passed, true)
        )
      )
      .limit(1);

    return !!attempt;
  }
}
