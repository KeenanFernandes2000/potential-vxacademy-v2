import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../db/connection";
import {
  trainingAreas,
  modules,
  courses,
  units,
  courseUnits,
  learningBlocks,
  unitRoleAssignments,
} from "../db/schema/training";
import type {
  TrainingArea,
  NewTrainingArea,
  UpdateTrainingArea,
  Module,
  NewModule,
  UpdateModule,
  Course,
  NewCourse,
  UpdateCourse,
  Unit,
  NewUnit,
  UpdateUnit,
  CourseUnit,
  NewCourseUnit,
  UpdateCourseUnit,
  LearningBlock,
  NewLearningBlock,
  UpdateLearningBlock,
  UnitRoleAssignment,
  NewUnitRoleAssignment,
  UpdateUnitRoleAssignment,
} from "../db/types";

// ==================== TRAINING AREAS SERVICE ====================
export class TrainingAreaService {
  /**
   * Create a new training area
   */
  static async createTrainingArea(
    data: NewTrainingArea
  ): Promise<TrainingArea> {
    const result = await db
      .insert(trainingAreas)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();

    if (!result[0]) {
      throw new Error("Failed to create training area");
    }

    return result[0];
  }

  /**
   * Get training area by ID
   */
  static async getTrainingAreaById(id: number): Promise<TrainingArea | null> {
    const [trainingArea] = await db
      .select()
      .from(trainingAreas)
      .where(eq(trainingAreas.id, id))
      .limit(1);

    return trainingArea || null;
  }

  /**
   * Get all training areas with optional pagination
   */
  static async getAllTrainingAreas(
    limit?: number,
    offset?: number
  ): Promise<TrainingArea[]> {
    const query = db
      .select()
      .from(trainingAreas)
      .orderBy(desc(trainingAreas.createdAt));

    if (limit !== undefined) {
      query.limit(limit);
    }

    if (offset !== undefined) {
      query.offset(offset);
    }

    return await query;
  }

  /**
   * Update training area by ID
   */
  static async updateTrainingArea(
    id: number,
    updateData: UpdateTrainingArea
  ): Promise<TrainingArea | null> {
    const [updatedTrainingArea] = await db
      .update(trainingAreas)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(trainingAreas.id, id))
      .returning();

    return updatedTrainingArea || null;
  }

  /**
   * Delete training area by ID
   */
  static async deleteTrainingArea(id: number): Promise<boolean> {
    const result = await db
      .delete(trainingAreas)
      .where(eq(trainingAreas.id, id))
      .returning({ id: trainingAreas.id });

    return result.length > 0;
  }

  /**
   * Check if training area exists by ID
   */
  static async trainingAreaExists(id: number): Promise<TrainingArea | null> {
    const [trainingArea] = await db
      .select()
      .from(trainingAreas)
      .where(eq(trainingAreas.id, id))
      .limit(1);

    return trainingArea || null;
  }
}

// ==================== MODULES SERVICE ====================
export class ModuleService {
  /**
   * Create a new module
   */
  static async createModule(data: NewModule): Promise<Module> {
    const result = await db
      .insert(modules)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();

    if (!result[0]) {
      throw new Error("Failed to create module");
    }

    return result[0];
  }

  /**
   * Get module by ID
   */
  static async getModuleById(id: number): Promise<Module | null> {
    const [module] = await db
      .select()
      .from(modules)
      .where(eq(modules.id, id))
      .limit(1);

    return module || null;
  }

  /**
   * Get all modules with optional pagination
   */
  static async getAllModules(
    limit?: number,
    offset?: number
  ): Promise<Module[]> {
    const query = db.select().from(modules).orderBy(desc(modules.createdAt));

    if (limit !== undefined) {
      query.limit(limit);
    }

    if (offset !== undefined) {
      query.offset(offset);
    }

    return await query;
  }

  /**
   * Get modules by training area ID
   */
  static async getModulesByTrainingArea(
    trainingAreaId: number
  ): Promise<Module[]> {
    return await db
      .select()
      .from(modules)
      .where(eq(modules.trainingAreaId, trainingAreaId))
      .orderBy(desc(modules.createdAt));
  }

  /**
   * Update module by ID
   */
  static async updateModule(
    id: number,
    updateData: UpdateModule
  ): Promise<Module | null> {
    const [updatedModule] = await db
      .update(modules)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(modules.id, id))
      .returning();

    return updatedModule || null;
  }

  /**
   * Delete module by ID
   */
  static async deleteModule(id: number): Promise<boolean> {
    const result = await db
      .delete(modules)
      .where(eq(modules.id, id))
      .returning({ id: modules.id });

    return result.length > 0;
  }

  /**
   * Check if module exists by ID
   */
  static async moduleExists(id: number): Promise<Module | null> {
    const [module] = await db
      .select()
      .from(modules)
      .where(eq(modules.id, id))
      .limit(1);

    return module || null;
  }
}

// ==================== COURSES SERVICE ====================
export class CourseService {
  /**
   * Create a new course
   */
  static async createCourse(data: NewCourse): Promise<Course> {
    const result = await db
      .insert(courses)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();

    if (!result[0]) {
      throw new Error("Failed to create course");
    }

    return result[0];
  }

  /**
   * Get course by ID
   */
  static async getCourseById(id: number): Promise<Course | null> {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);

    return course || null;
  }

  /**
   * Get all courses with optional pagination
   */
  static async getAllCourses(
    limit?: number,
    offset?: number
  ): Promise<Course[]> {
    const query = db.select().from(courses).orderBy(desc(courses.createdAt));

    if (limit !== undefined) {
      query.limit(limit);
    }

    if (offset !== undefined) {
      query.offset(offset);
    }

    return await query;
  }

  /**
   * Get courses by module ID
   */
  static async getCoursesByModule(moduleId: number): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(eq(courses.moduleId, moduleId))
      .orderBy(desc(courses.createdAt));
  }

  /**
   * Update course by ID
   */
  static async updateCourse(
    id: number,
    updateData: UpdateCourse
  ): Promise<Course | null> {
    const [updatedCourse] = await db
      .update(courses)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, id))
      .returning();

    return updatedCourse || null;
  }

  /**
   * Delete course by ID
   */
  static async deleteCourse(id: number): Promise<boolean> {
    const result = await db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning({ id: courses.id });

    return result.length > 0;
  }

  /**
   * Check if course exists by ID
   */
  static async courseExists(id: number): Promise<Course | null> {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);

    return course || null;
  }
}

// ==================== UNITS SERVICE ====================
export class UnitService {
  /**
   * Create a new unit
   */
  static async createUnit(data: NewUnit): Promise<Unit> {
    const result = await db
      .insert(units)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();

    if (!result[0]) {
      throw new Error("Failed to create unit");
    }

    return result[0];
  }

  /**
   * Get unit by ID
   */
  static async getUnitById(id: number): Promise<Unit | null> {
    const [unit] = await db
      .select()
      .from(units)
      .where(eq(units.id, id))
      .limit(1);

    return unit || null;
  }

  /**
   * Get all units with optional pagination
   */
  static async getAllUnits(limit?: number, offset?: number): Promise<Unit[]> {
    const query = db.select().from(units).orderBy(desc(units.createdAt));

    if (limit !== undefined) {
      query.limit(limit);
    }

    if (offset !== undefined) {
      query.offset(offset);
    }

    return await query;
  }

  /**
   * Update unit by ID
   */
  static async updateUnit(
    id: number,
    updateData: UpdateUnit
  ): Promise<Unit | null> {
    const [updatedUnit] = await db
      .update(units)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(units.id, id))
      .returning();

    return updatedUnit || null;
  }

  /**
   * Delete unit by ID
   */
  static async deleteUnit(id: number): Promise<boolean> {
    const result = await db
      .delete(units)
      .where(eq(units.id, id))
      .returning({ id: units.id });

    return result.length > 0;
  }

  /**
   * Check if unit exists by ID
   */
  static async unitExists(id: number): Promise<Unit | null> {
    const [unit] = await db
      .select()
      .from(units)
      .where(eq(units.id, id))
      .limit(1);

    return unit || null;
  }
}

// ==================== COURSE UNITS SERVICE ====================
export class CourseUnitService {
  /**
   * Create a new course unit relationship
   */
  static async createCourseUnit(data: NewCourseUnit): Promise<CourseUnit> {
    const result = await db
      .insert(courseUnits)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();

    if (!result[0]) {
      throw new Error("Failed to create course unit");
    }

    return result[0];
  }

  /**
   * Get course unit by ID
   */
  static async getCourseUnitById(id: number): Promise<CourseUnit | null> {
    const [courseUnit] = await db
      .select()
      .from(courseUnits)
      .where(eq(courseUnits.id, id))
      .limit(1);

    return courseUnit || null;
  }

  /**
   * Get all course units with optional pagination
   */
  static async getAllCourseUnits(
    limit?: number,
    offset?: number
  ): Promise<CourseUnit[]> {
    const query = db
      .select()
      .from(courseUnits)
      .orderBy(desc(courseUnits.createdAt));

    if (limit !== undefined) {
      query.limit(limit);
    }

    if (offset !== undefined) {
      query.offset(offset);
    }

    return await query;
  }

  /**
   * Get course units by course ID
   */
  static async getCourseUnitsByCourse(courseId: number): Promise<CourseUnit[]> {
    return await db
      .select()
      .from(courseUnits)
      .where(eq(courseUnits.courseId, courseId))
      .orderBy(courseUnits.order);
  }

  /**
   * Get course units by unit ID
   */
  static async getCourseUnitsByUnit(unitId: number): Promise<CourseUnit[]> {
    return await db
      .select()
      .from(courseUnits)
      .where(eq(courseUnits.unitId, unitId))
      .orderBy(courseUnits.order);
  }

  /**
   * Update course unit by ID
   */
  static async updateCourseUnit(
    id: number,
    updateData: UpdateCourseUnit
  ): Promise<CourseUnit | null> {
    const [updatedCourseUnit] = await db
      .update(courseUnits)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(courseUnits.id, id))
      .returning();

    return updatedCourseUnit || null;
  }

  /**
   * Delete course unit by ID
   */
  static async deleteCourseUnit(id: number): Promise<boolean> {
    const result = await db
      .delete(courseUnits)
      .where(eq(courseUnits.id, id))
      .returning({ id: courseUnits.id });

    return result.length > 0;
  }

  /**
   * Check if course unit exists by ID
   */
  static async courseUnitExists(id: number): Promise<CourseUnit | null> {
    const [courseUnit] = await db
      .select()
      .from(courseUnits)
      .where(eq(courseUnits.id, id))
      .limit(1);

    return courseUnit || null;
  }

  /**
   * Check if course unit relationship exists
   */
  static async courseUnitRelationshipExists(
    courseId: number,
    unitId: number
  ): Promise<CourseUnit | null> {
    const [courseUnit] = await db
      .select()
      .from(courseUnits)
      .where(
        and(eq(courseUnits.courseId, courseId), eq(courseUnits.unitId, unitId))
      )
      .limit(1);

    return courseUnit || null;
  }
}

// ==================== LEARNING BLOCKS SERVICE ====================
export class LearningBlockService {
  /**
   * Create a new learning block
   */
  static async createLearningBlock(
    data: NewLearningBlock
  ): Promise<LearningBlock> {
    const result = await db
      .insert(learningBlocks)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();

    if (!result[0]) {
      throw new Error("Failed to create learning block");
    }

    return result[0];
  }

  /**
   * Get learning block by ID
   */
  static async getLearningBlockById(id: number): Promise<LearningBlock | null> {
    const [learningBlock] = await db
      .select()
      .from(learningBlocks)
      .where(eq(learningBlocks.id, id))
      .limit(1);

    return learningBlock || null;
  }

  /**
   * Get all learning blocks with optional pagination
   */
  static async getAllLearningBlocks(
    limit?: number,
    offset?: number
  ): Promise<LearningBlock[]> {
    const query = db
      .select()
      .from(learningBlocks)
      .orderBy(desc(learningBlocks.createdAt));

    if (limit !== undefined) {
      query.limit(limit);
    }

    if (offset !== undefined) {
      query.offset(offset);
    }

    return await query;
  }

  /**
   * Get learning blocks by unit ID
   */
  static async getLearningBlocksByUnit(
    unitId: number
  ): Promise<LearningBlock[]> {
    return await db
      .select()
      .from(learningBlocks)
      .where(eq(learningBlocks.unitId, unitId))
      .orderBy(learningBlocks.order);
  }

  /**
   * Update learning block by ID
   */
  static async updateLearningBlock(
    id: number,
    updateData: UpdateLearningBlock
  ): Promise<LearningBlock | null> {
    const [updatedLearningBlock] = await db
      .update(learningBlocks)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(learningBlocks.id, id))
      .returning();

    return updatedLearningBlock || null;
  }

  /**
   * Delete learning block by ID
   */
  static async deleteLearningBlock(id: number): Promise<boolean> {
    const result = await db
      .delete(learningBlocks)
      .where(eq(learningBlocks.id, id))
      .returning({ id: learningBlocks.id });

    return result.length > 0;
  }

  /**
   * Check if learning block exists by ID
   */
  static async learningBlockExists(id: number): Promise<LearningBlock | null> {
    const [learningBlock] = await db
      .select()
      .from(learningBlocks)
      .where(eq(learningBlocks.id, id))
      .limit(1);

    return learningBlock || null;
  }
}

// ==================== UNIT ROLE ASSIGNMENTS SERVICE ====================
export class UnitRoleAssignmentService {
  /**
   * Create a new unit role assignment
   */
  static async createUnitRoleAssignment(
    data: NewUnitRoleAssignment
  ): Promise<UnitRoleAssignment> {
    // Ensure unitIds is properly formatted as integer array
    const processedData = {
      ...data,
      unitIds: data.unitIds || [], // Ensure it's either an array or empty array
      updatedAt: new Date(),
    };

    const result = await db
      .insert(unitRoleAssignments)
      .values(processedData)
      .returning();

    if (!result[0]) {
      throw new Error("Failed to create unit role assignment");
    }

    return result[0];
  }

  /**
   * Get all unit role assignments with optional filtering
   */
  static async getAllUnitRoleAssignments(filters?: {
    name?: string;
    unitIds?: number[];
    roleCategoryId?: number;
    seniorityLevelId?: number;
    assetId?: number;
  }): Promise<UnitRoleAssignment[]> {
    const conditions = [];

    if (filters?.name) {
      conditions.push(eq(unitRoleAssignments.name, filters.name));
    }
    if (filters?.roleCategoryId) {
      conditions.push(
        eq(unitRoleAssignments.roleCategoryId, filters.roleCategoryId)
      );
    }
    if (filters?.seniorityLevelId) {
      conditions.push(
        eq(unitRoleAssignments.seniorityLevelId, filters.seniorityLevelId)
      );
    }
    if (filters?.assetId) {
      conditions.push(eq(unitRoleAssignments.assetId, filters.assetId));
    }

    const query = db
      .select()
      .from(unitRoleAssignments)
      .orderBy(desc(unitRoleAssignments.createdAt));

    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }

    return await query;
  }

  /**
   * Get unit role assignment by ID
   */
  static async getUnitRoleAssignmentById(
    id: number
  ): Promise<UnitRoleAssignment | null> {
    const [assignment] = await db
      .select()
      .from(unitRoleAssignments)
      .where(eq(unitRoleAssignments.id, id))
      .limit(1);

    return assignment || null;
  }

  /**
   * Get unit role assignments by unit ID (searches within unitIds array)
   */
  static async getUnitRoleAssignmentsByUnitId(
    unitId: number
  ): Promise<UnitRoleAssignment[]> {
    // Since unitIds is a JSON array, we need to use a different approach
    // This will return assignments where the unitId is contained in the unitIds array
    return await db
      .select()
      .from(unitRoleAssignments)
      .where(
        // Using SQL to check if unitId exists in the JSON array
        // This is a simplified approach - you might need to adjust based on your database
        sql`${unitRoleAssignments.unitIds} @> ${JSON.stringify([unitId])}`
      )
      .orderBy(desc(unitRoleAssignments.createdAt));
  }

  /**
   * Update unit role assignment
   */
  static async updateUnitRoleAssignment(
    id: number,
    data: UpdateUnitRoleAssignment
  ): Promise<UnitRoleAssignment> {
    // Ensure unitIds is properly formatted as integer array
    const processedData = {
      ...data,
      unitIds: data.unitIds || [], // Ensure it's either an array or empty array
      updatedAt: new Date(),
    };

    const result = await db
      .update(unitRoleAssignments)
      .set(processedData)
      .where(eq(unitRoleAssignments.id, id))
      .returning();

    if (!result[0]) {
      throw new Error("Unit role assignment not found or update failed");
    }

    return result[0];
  }

  /**
   * Delete unit role assignment
   */
  static async deleteUnitRoleAssignment(id: number): Promise<boolean> {
    const result = await db
      .delete(unitRoleAssignments)
      .where(eq(unitRoleAssignments.id, id))
      .returning({ id: unitRoleAssignments.id });

    return result.length > 0;
  }

  /**
   * Check if unit role assignment exists by ID
   */
  static async unitRoleAssignmentExists(
    id: number
  ): Promise<UnitRoleAssignment | null> {
    const [assignment] = await db
      .select()
      .from(unitRoleAssignments)
      .where(eq(unitRoleAssignments.id, id))
      .limit(1);

    return assignment || null;
  }

  /**
   * Check if a specific assignment combination already exists
   */
  static async assignmentExists(
    name: string,
    roleCategoryId?: number,
    seniorityLevelId?: number,
    assetId?: number
  ): Promise<UnitRoleAssignment | null> {
    const conditions = [eq(unitRoleAssignments.name, name)];

    if (roleCategoryId !== undefined) {
      conditions.push(eq(unitRoleAssignments.roleCategoryId, roleCategoryId));
    }
    if (seniorityLevelId !== undefined) {
      conditions.push(
        eq(unitRoleAssignments.seniorityLevelId, seniorityLevelId)
      );
    }
    if (assetId !== undefined) {
      conditions.push(eq(unitRoleAssignments.assetId, assetId));
    }

    const [assignment] = await db
      .select()
      .from(unitRoleAssignments)
      .where(and(...conditions))
      .limit(1);

    return assignment || null;
  }
}
