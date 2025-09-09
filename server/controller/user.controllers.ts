import type { Request, Response, NextFunction } from "express";
import {
  UserService,
  InvitationService,
  PasswordResetService,
} from "../services/user.services";
import type { NewUser, UpdateUser, InvitationType } from "../db/types";
import type { CustomError } from "../middleware/errorHandling";
import { db } from "../db/connection";
import {
  assets,
  subAssets,
  roleCategories,
  roles,
  seniorityLevels,
  passwordResets,
  subAdmins,
  normalUsers,
} from "../db/schema/users";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import passport from "../middleware/passport";

const JWT_SECRET = process.env.JWT_SECRET as string;

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

// Validation schemas (basic validation - you can enhance with libraries like Zod or Joi)
const validateUserInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields validation
  if (
    !data.firstName ||
    typeof data.firstName !== "string" ||
    data.firstName.trim().length === 0
  ) {
    errors.push("First name is required and must be a non-empty string");
  }

  if (
    !data.lastName ||
    typeof data.lastName !== "string" ||
    data.lastName.trim().length === 0
  ) {
    errors.push("Last name is required and must be a non-empty string");
  }

  if (!data.email || typeof data.email !== "string") {
    errors.push("Email is required and must be a string");
  } else {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Email must be a valid email address");
    }
  }

  if (
    !data.organization ||
    typeof data.organization !== "string" ||
    data.organization.trim().length === 0
  ) {
    errors.push("Organization is required and must be a non-empty string");
  }

  if (
    !data.asset ||
    typeof data.asset !== "string" ||
    data.asset.trim().length === 0
  ) {
    errors.push("Asset is required and must be a non-empty string");
  }

  if (
    !data.subAsset ||
    typeof data.subAsset !== "string" ||
    data.subAsset.trim().length === 0
  ) {
    errors.push("Sub asset is required and must be a non-empty string");
  }

  if (
    !data.userType ||
    !["admin", "sub_admin", "user"].includes(data.userType)
  ) {
    errors.push(
      "User type is required and must be one of: admin, sub_admin, user"
    );
  }

  // Optional field validation
  if (data.subOrganization && typeof data.subOrganization !== "string") {
    errors.push("Sub organization must be a string if provided");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateUpdateUserInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Only validate provided fields for updates
  if (data.firstName !== undefined) {
    if (
      typeof data.firstName !== "string" ||
      data.firstName.trim().length === 0
    ) {
      errors.push("First name must be a non-empty string");
    }
  }

  if (data.lastName !== undefined) {
    if (
      typeof data.lastName !== "string" ||
      data.lastName.trim().length === 0
    ) {
      errors.push("Last name must be a non-empty string");
    }
  }

  if (data.email !== undefined) {
    if (typeof data.email !== "string") {
      errors.push("Email must be a string");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push("Email must be a valid email address");
      }
    }
  }

  if (data.organization !== undefined) {
    if (
      typeof data.organization !== "string" ||
      data.organization.trim().length === 0
    ) {
      errors.push("Organization must be a non-empty string");
    }
  }

  if (data.asset !== undefined) {
    if (typeof data.asset !== "string" || data.asset.trim().length === 0) {
      errors.push("Asset must be a non-empty string");
    }
  }

  if (data.subAsset !== undefined) {
    if (
      typeof data.subAsset !== "string" ||
      data.subAsset.trim().length === 0
    ) {
      errors.push("Sub asset must be a non-empty string");
    }
  }

  if (data.userType !== undefined) {
    if (!["admin", "sub_admin", "user"].includes(data.userType)) {
      errors.push("User type must be one of: admin, sub_admin, user");
    }
  }

  if (data.subOrganization !== undefined && data.subOrganization !== null) {
    if (typeof data.subOrganization !== "string") {
      errors.push("Sub organization must be a string if provided");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateSubAdminRegistrationInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields for sub-admin registration completion
  if (
    !data.password ||
    typeof data.password !== "string" ||
    data.password.length < 6
  ) {
    errors.push("Password is required and must be at least 6 characters long");
  }

  if (
    !data.jobTitle ||
    typeof data.jobTitle !== "string" ||
    data.jobTitle.trim().length === 0
  ) {
    errors.push("Job title is required and must be a non-empty string");
  }

  if (
    !data.eid ||
    typeof data.eid !== "string" ||
    data.eid.trim().length === 0
  ) {
    errors.push("EID is required and must be a non-empty string");
  }

  if (
    !data.phoneNumber ||
    typeof data.phoneNumber !== "string" ||
    data.phoneNumber.trim().length === 0
  ) {
    errors.push("Phone number is required and must be a non-empty string");
  }

  // Optional field validation
  if (data.totalFrontliners !== undefined && data.totalFrontliners !== null) {
    if (
      typeof data.totalFrontliners !== "number" ||
      data.totalFrontliners < 0
    ) {
      errors.push(
        "Total frontliners must be a non-negative number if provided"
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateUpdateSubAdminInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Only validate provided fields for updates
  if (data.jobTitle !== undefined) {
    if (
      typeof data.jobTitle !== "string" ||
      data.jobTitle.trim().length === 0
    ) {
      errors.push("Job title must be a non-empty string");
    }
  }

  if (data.totalFrontliners !== undefined) {
    if (
      typeof data.totalFrontliners !== "number" ||
      data.totalFrontliners < 0
    ) {
      errors.push("Total frontliners must be a non-negative number");
    }
  }

  if (data.eid !== undefined) {
    if (typeof data.eid !== "string" || data.eid.trim().length === 0) {
      errors.push("EID must be a non-empty string");
    }
  }

  if (data.phoneNumber !== undefined) {
    if (
      typeof data.phoneNumber !== "string" ||
      data.phoneNumber.trim().length === 0
    ) {
      errors.push("Phone number must be a non-empty string");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateNormalUserInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields validation
  if (
    !data.roleCategory ||
    typeof data.roleCategory !== "string" ||
    data.roleCategory.trim().length === 0
  ) {
    errors.push("Role category is required and must be a non-empty string");
  }

  if (
    !data.role ||
    typeof data.role !== "string" ||
    data.role.trim().length === 0
  ) {
    errors.push("Role is required and must be a non-empty string");
  }

  if (
    !data.seniority ||
    typeof data.seniority !== "string" ||
    data.seniority.trim().length === 0
  ) {
    errors.push("Seniority is required and must be a non-empty string");
  }

  if (
    !data.eid ||
    typeof data.eid !== "string" ||
    data.eid.trim().length === 0
  ) {
    errors.push("EID is required and must be a non-empty string");
  }

  if (
    !data.phoneNumber ||
    typeof data.phoneNumber !== "string" ||
    data.phoneNumber.trim().length === 0
  ) {
    errors.push("Phone number is required and must be a non-empty string");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateUpdateNormalUserInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Only validate provided fields for updates
  if (data.roleCategory !== undefined) {
    if (
      typeof data.roleCategory !== "string" ||
      data.roleCategory.trim().length === 0
    ) {
      errors.push("Role category must be a non-empty string");
    }
  }

  if (data.role !== undefined) {
    if (typeof data.role !== "string" || data.role.trim().length === 0) {
      errors.push("Role must be a non-empty string");
    }
  }

  if (data.seniority !== undefined) {
    if (
      typeof data.seniority !== "string" ||
      data.seniority.trim().length === 0
    ) {
      errors.push("Seniority must be a non-empty string");
    }
  }

  if (data.eid !== undefined) {
    if (typeof data.eid !== "string" || data.eid.trim().length === 0) {
      errors.push("EID must be a non-empty string");
    }
  }

  if (data.phoneNumber !== undefined) {
    if (
      typeof data.phoneNumber !== "string" ||
      data.phoneNumber.trim().length === 0
    ) {
      errors.push("Phone number must be a non-empty string");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validatePasswordResetRequestInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.email || typeof data.email !== "string") {
    errors.push("Email is required and must be a string");
  } else {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Email must be a valid email address");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validatePasswordResetInput = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (
    !data.token ||
    typeof data.token !== "string" ||
    data.token.trim().length === 0
  ) {
    errors.push("Reset token is required and must be a non-empty string");
  }

  if (
    !data.password ||
    typeof data.password !== "string" ||
    data.password.length < 6
  ) {
    errors.push("Password is required and must be at least 6 characters long");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export class userControllers {
  /**
   * Login user with email and password
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "local",
      { session: false },
      async (err: any, user: any, info: any) => {
        if (err || !user) {
          return res.status(401).json({
            success: false,
            message: info?.message || "Invalid credentials",
          });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
          expiresIn: "1h",
        });

        await UserService.updateUserLastLogin(user.id);

        return res.json({
          success: true,
          message: "Login successful",
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType,
          },
        });
      }
    )(req, res, next);
  }

  // ==================== USERS CRUD FUNCTIONS ====================
  /**
   * Create a new user
   * POST /users
   */
  static async create(req: Request, res: Response): Promise<void> {
    const validation = validateUserInput(req.body);

    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    // Check if email already exists
    const existingUser = await UserService.getUserByEmail(req.body.email);
    if (existingUser) {
      throw createError("User with this email already exists", 409);
    }

    const password = await bcrypt.hash(req.body.password, 10);

    const userData: NewUser = {
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      email: req.body.email.toLowerCase().trim(),
      organization: req.body.organization.trim(),
      subOrganization: req.body.subOrganization?.trim() || null,
      asset: req.body.asset.trim(),
      subAsset: req.body.subAsset.trim(),
      userType: req.body.userType,
      passwordHash: password,
    };

    const newUser = await UserService.createUser(userData);

    // Generate JWT token for auto-login after registration
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      success: true,
      message: "User created and logged in successfully",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        userType: newUser.userType,
      },
    });
  }

  /**
   * Get all users with optional pagination
   * GET /users?limit=10&offset=0
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;

    // Validate pagination parameters
    if (limit !== undefined && (isNaN(limit) || limit <= 0 || limit > 100)) {
      throw createError(
        "Limit must be a positive number between 1 and 100",
        400
      );
    }

    if (offset !== undefined && (isNaN(offset) || offset < 0)) {
      throw createError("Offset must be a non-negative number", 400);
    }

    const users = await UserService.getAllUsers(limit, offset);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
      meta: {
        limit: limit || null,
        offset: offset || 0,
        count: users.length,
      },
    });
  }

  /**
   * Get user by ID with all related data
   * GET /users/:id
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.id as string);

    if (isNaN(userId) || userId <= 0) {
      throw createError("Invalid user ID", 400);
    }

    const user = await UserService.getUserByIdWithDetails(userId);

    if (!user) {
      throw createError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  }

  /**
   * Update user by ID
   * PUT /users/:id
   */
  static async updateUser(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.id as string);

    if (isNaN(userId) || userId <= 0) {
      throw createError("Invalid user ID", 400);
    }

    // Check if user exists
    const existingUser = await UserService.userExists(userId);
    if (!existingUser) {
      throw createError("User not found", 404);
    }

    const validation = validateUpdateUserInput(req.body);

    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    // Check if email is being updated and if it's already taken by another user
    if (req.body.email && req.body.email !== existingUser.email) {
      const emailTaken = await UserService.emailExists(req.body.email, userId);
      if (emailTaken) {
        throw createError("Email is already taken by another user", 409);
      }
    }

    const updateData: UpdateUser = {};

    // Only update provided fields
    if (req.body.firstName) updateData.firstName = req.body.firstName.trim();
    if (req.body.lastName) updateData.lastName = req.body.lastName.trim();
    if (req.body.email) updateData.email = req.body.email.toLowerCase().trim();
    if (req.body.organization)
      updateData.organization = req.body.organization.trim();
    if (req.body.subOrganization !== undefined) {
      updateData.subOrganization = req.body.subOrganization?.trim() || null;
    }
    if (req.body.asset) updateData.asset = req.body.asset.trim();
    if (req.body.subAsset) updateData.subAsset = req.body.subAsset.trim();
    if (req.body.userType) updateData.userType = req.body.userType;

    const updatedUser = await UserService.updateUser(userId, updateData);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  }

  /**
   * Delete user by ID
   * DELETE /users/:id
   */
  static async deleteUser(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.id as string);

    if (isNaN(userId) || userId <= 0) {
      throw createError("Invalid user ID", 400);
    }

    // Check if user exists
    const existingUser = await UserService.userExists(userId);
    if (!existingUser) {
      throw createError("User not found", 404);
    }

    const deleted = await UserService.deleteUser(userId);

    if (!deleted) {
      throw createError("Failed to delete user", 500);
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  }

  // ==================== SUB-ADMIN CU FUNCTIONS ====================

  /**
   * Complete sub-admin registration (sub-admin completes their profile)
   * POST /sub-admins/register/:id
   */
  static async completeSubAdminRegistration(
    req: Request,
    res: Response
  ): Promise<void> {
    const userId = parseInt(req.params.id as string);

    if (isNaN(userId) || userId <= 0) {
      throw createError("Invalid user ID", 400);
    }

    // Validate input data
    const validation = validateSubAdminRegistrationInput(req.body);
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    const { password, jobTitle, totalFrontliners, eid, phoneNumber } = req.body;

    // Check if user exists and is a sub-admin
    const existingUser = await UserService.getUserById(userId);
    if (!existingUser) {
      throw createError("User not found", 404);
    }

    if (existingUser.userType !== "sub_admin") {
      throw createError("User is not a sub-admin", 400);
    }

    // Check if sub-admin is already registered (has sub-admin details)
    const [existingSubAdmin] = await db
      .select()
      .from(subAdmins)
      .where(eq(subAdmins.userId, userId))
      .limit(1);

    if (existingSubAdmin) {
      throw createError("Sub-admin registration is already completed", 409);
    }

    // Check if EID is already taken
    const [existingEid] = await db
      .select()
      .from(subAdmins)
      .where(eq(subAdmins.eid, eid.trim()))
      .limit(1);

    if (existingEid) {
      throw createError("EID is already taken by another sub-admin", 409);
    }

    // Update password and create sub-admin record
    const newPasswordHash = await bcrypt.hash(password, 10);

    // Update user password
    await UserService.updateSubAdminPasswordRegistration(
      userId,
      newPasswordHash
    );

    // Create sub-admin record
    const [newSubAdmin] = await db
      .insert(subAdmins)
      .values({
        userId: userId,
        jobTitle: jobTitle.trim(),
        totalFrontliners: totalFrontliners || null,
        eid: eid.trim(),
        phoneNumber: phoneNumber.trim(),
      })
      .returning();

    // Generate JWT token for auto-login after registration
    const token = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Sub-admin registration completed successfully",
      token,
      data: {
        user: {
          id: existingUser.id,
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          userType: existingUser.userType,
        },
      },
    });
  }

  /**
   * Update sub-admin details
   * PUT /users/:id/sub-admin
   */
  static async updateSubAdmin(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.id as string);

    if (isNaN(userId) || userId <= 0) {
      throw createError("Invalid user ID", 400);
    }

    // Check if sub-admin exists
    const [existingSubAdmin] = await db
      .select()
      .from(subAdmins)
      .where(eq(subAdmins.userId, userId))
      .limit(1);

    if (!existingSubAdmin) {
      throw createError("Sub-admin not found for this user", 404);
    }

    // Validate input data
    const validation = validateUpdateSubAdminInput(req.body);
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    const { jobTitle, totalFrontliners, eid, phoneNumber } = req.body;

    // Check if EID is being updated and if it's already taken by another sub-admin
    if (eid && eid !== existingSubAdmin.eid) {
      const [eidTaken] = await db
        .select()
        .from(subAdmins)
        .where(eq(subAdmins.eid, eid.trim()))
        .limit(1);

      if (eidTaken) {
        throw createError("EID is already taken by another sub-admin", 409);
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (jobTitle) updateData.jobTitle = jobTitle.trim();
    if (totalFrontliners !== undefined)
      updateData.totalFrontliners = totalFrontliners;
    if (eid) updateData.eid = eid.trim();
    if (phoneNumber) updateData.phoneNumber = phoneNumber.trim();

    const [updatedSubAdmin] = await db
      .update(subAdmins)
      .set(updateData)
      .where(eq(subAdmins.userId, userId))
      .returning();

    // Update the main users table timestamp
    await UserService.updateUserTimestamp(userId);

    res.status(200).json({
      success: true,
      message: "Sub-admin updated successfully",
      data: updatedSubAdmin,
    });
  }

  /**
   * Get sub-admin registration details by ID (for the registration form)
   * GET /sub-admins/registration/:id
   */
  static async getSubAdminRegistrationDetails(
    req: Request,
    res: Response
  ): Promise<void> {
    const userId = parseInt(req.params.id as string);

    if (isNaN(userId) || userId <= 0) {
      throw createError("Invalid user ID", 400);
    }

    // Get user details
    const user = await UserService.getUserById(userId);
    if (!user) {
      throw createError("User not found", 404);
    }

    if (user.userType !== "sub_admin") {
      throw createError("User is not a sub-admin", 400);
    }

    // Check if sub-admin is already registered
    const [existingSubAdmin] = await db
      .select()
      .from(subAdmins)
      .where(eq(subAdmins.userId, userId))
      .limit(1);

    if (existingSubAdmin) {
      throw createError("Sub-admin registration is already completed", 409);
    }

    res.status(200).json({
      success: true,
      message: "Sub-admin details retrieved successfully",
      data: {
        organization: user.organization,
        subOrganization: user.subOrganization,
        asset: user.asset,
        subAsset: user.subAsset,
      },
    });
  }

  // ==================== NORMAL USER CU FUNCTIONS ====================

  /**
   * Register a user as a normal user
   * POST /users/:id/register-normal-user
   */
  static async registerNormalUser(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.id as string);

    if (isNaN(userId) || userId <= 0) {
      throw createError("Invalid user ID", 400);
    }

    // Validate input data
    const validation = validateNormalUserInput(req.body);
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    const { roleCategory, role, seniority, eid, phoneNumber } = req.body;

    // Check if user exists
    const existingUser = await UserService.userExists(userId);
    if (!existingUser) {
      throw createError("User not found", 404);
    }

    // Check if user is already registered as normal user
    const [existingNormalUser] = await db
      .select()
      .from(normalUsers)
      .where(eq(normalUsers.userId, userId))
      .limit(1);

    if (existingNormalUser) {
      throw createError("User is already registered as a normal user", 409);
    }

    // Check if EID is already taken
    const [existingEid] = await db
      .select()
      .from(normalUsers)
      .where(eq(normalUsers.eid, eid.trim()))
      .limit(1);

    if (existingEid) {
      throw createError("EID is already taken by another normal user", 409);
    }

    // Create normal user record
    const [newNormalUser] = await db
      .insert(normalUsers)
      .values({
        userId: userId,
        roleCategory: roleCategory.trim(),
        role: role.trim(),
        seniority: seniority.trim(),
        eid: eid.trim(),
        phoneNumber: phoneNumber.trim(),
      })
      .returning();

    // Update the main users table timestamp
    await UserService.updateUserTimestamp(userId);

    res.status(201).json({
      success: true,
      message: "User registered as normal user successfully",
      data: newNormalUser,
    });
  }

  /**
   * Update normal user details
   * PUT /users/:id/normal-user
   */
  static async updateNormalUser(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.id as string);

    if (isNaN(userId) || userId <= 0) {
      throw createError("Invalid user ID", 400);
    }

    // Check if normal user exists
    const [existingNormalUser] = await db
      .select()
      .from(normalUsers)
      .where(eq(normalUsers.userId, userId))
      .limit(1);

    if (!existingNormalUser) {
      throw createError("Normal user not found for this user", 404);
    }

    // Validate input data
    const validation = validateUpdateNormalUserInput(req.body);
    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    const { roleCategory, role, seniority, eid, phoneNumber } = req.body;

    // Check if EID is being updated and if it's already taken by another normal user
    if (eid && eid !== existingNormalUser.eid) {
      const [eidTaken] = await db
        .select()
        .from(normalUsers)
        .where(eq(normalUsers.eid, eid.trim()))
        .limit(1);

      if (eidTaken) {
        throw createError("EID is already taken by another normal user", 409);
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (roleCategory) updateData.roleCategory = roleCategory.trim();
    if (role) updateData.role = role.trim();
    if (seniority) updateData.seniority = seniority.trim();
    if (eid) updateData.eid = eid.trim();
    if (phoneNumber) updateData.phoneNumber = phoneNumber.trim();

    const [updatedNormalUser] = await db
      .update(normalUsers)
      .set(updateData)
      .where(eq(normalUsers.userId, userId))
      .returning();

    // Update the main users table timestamp
    await UserService.updateUserTimestamp(userId);

    res.status(200).json({
      success: true,
      message: "Normal user updated successfully",
      data: updatedNormalUser,
    });
  }

  // ==================== ASSETS CRD FUNCTIONS ====================

  /**
   * Create a new asset
   * POST /assets
   */
  static async createAsset(req: Request, res: Response): Promise<void> {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw createError(
        "Asset name is required and must be a non-empty string",
        400
      );
    }

    // Check if asset name already exists
    const [existingAsset] = await db
      .select()
      .from(assets)
      .where(eq(assets.name, name.trim()))
      .limit(1);

    if (existingAsset) {
      throw createError("Asset with this name already exists", 409);
    }

    const [newAsset] = await db
      .insert(assets)
      .values({ name: name.trim() })
      .returning();

    res.status(201).json({
      success: true,
      message: "Asset created successfully",
      data: newAsset,
    });
  }

  /**
   * Get all assets
   * GET /assets
   */
  static async getAllAssets(req: Request, res: Response): Promise<void> {
    const allAssets = await db.select().from(assets);

    res.status(200).json({
      success: true,
      message: "Assets retrieved successfully",
      data: allAssets,
    });
  }

  /**
   * Get asset by ID
   * GET /assets/:id
   */
  static async getAssetById(req: Request, res: Response): Promise<void> {
    const assetId = parseInt(req.params.id as string);

    if (isNaN(assetId) || assetId <= 0) {
      throw createError("Invalid asset ID", 400);
    }

    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, assetId))
      .limit(1);

    if (!asset) {
      throw createError("Asset not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Asset retrieved successfully",
      data: asset,
    });
  }

  /**
   * Delete asset by ID
   * DELETE /assets/:id
   */
  static async deleteAsset(req: Request, res: Response): Promise<void> {
    const assetId = parseInt(req.params.id as string);

    if (isNaN(assetId) || assetId <= 0) {
      throw createError("Invalid asset ID", 400);
    }

    // Check if asset exists
    const [existingAsset] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, assetId))
      .limit(1);

    if (!existingAsset) {
      throw createError("Asset not found", 404);
    }

    const result = await db
      .delete(assets)
      .where(eq(assets.id, assetId))
      .returning({ id: assets.id });

    if (result.length === 0) {
      throw createError("Failed to delete asset", 500);
    }

    res.status(200).json({
      success: true,
      message: "Asset deleted successfully",
    });
  }

  // ==================== SUB ASSETS CRD FUNCTIONS ====================

  /**
   * Create a new sub asset
   * POST /sub-assets
   */
  static async createSubAsset(req: Request, res: Response): Promise<void> {
    const { name, assetId } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw createError(
        "Sub asset name is required and must be a non-empty string",
        400
      );
    }

    if (!assetId || typeof assetId !== "number" || assetId <= 0) {
      throw createError("Valid asset ID is required", 400);
    }

    // Check if parent asset exists
    const [parentAsset] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, assetId))
      .limit(1);

    if (!parentAsset) {
      throw createError("Parent asset not found", 404);
    }

    const [newSubAsset] = await db
      .insert(subAssets)
      .values({
        name: name.trim(),
        assetId: assetId,
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Sub asset created successfully",
      data: newSubAsset,
    });
  }

  /**
   * Get all sub assets
   * GET /sub-assets
   */
  static async getAllSubAssets(req: Request, res: Response): Promise<void> {
    const allSubAssets = await db.select().from(subAssets);

    res.status(200).json({
      success: true,
      message: "Sub assets retrieved successfully",
      data: allSubAssets,
    });
  }

  /**
   * Get sub asset by ID
   * GET /sub-assets/:id
   */
  static async getSubAssetById(req: Request, res: Response): Promise<void> {
    const subAssetId = parseInt(req.params.id as string);

    if (isNaN(subAssetId) || subAssetId <= 0) {
      throw createError("Invalid sub asset ID", 400);
    }

    const [subAsset] = await db
      .select()
      .from(subAssets)
      .where(eq(subAssets.id, subAssetId))
      .limit(1);

    if (!subAsset) {
      throw createError("Sub asset not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Sub asset retrieved successfully",
      data: subAsset,
    });
  }

  /**
   * Delete sub asset by ID
   * DELETE /sub-assets/:id
   */
  static async deleteSubAsset(req: Request, res: Response): Promise<void> {
    const subAssetId = parseInt(req.params.id as string);

    if (isNaN(subAssetId) || subAssetId <= 0) {
      throw createError("Invalid sub asset ID", 400);
    }

    // Check if sub asset exists
    const [existingSubAsset] = await db
      .select()
      .from(subAssets)
      .where(eq(subAssets.id, subAssetId))
      .limit(1);

    if (!existingSubAsset) {
      throw createError("Sub asset not found", 404);
    }

    const result = await db
      .delete(subAssets)
      .where(eq(subAssets.id, subAssetId))
      .returning({ id: subAssets.id });

    if (result.length === 0) {
      throw createError("Failed to delete sub asset", 500);
    }

    res.status(200).json({
      success: true,
      message: "Sub asset deleted successfully",
    });
  }

  // ==================== ROLE CATEGORIES CRD FUNCTIONS ====================

  /**
   * Create a new role category
   * POST /role-categories
   */
  static async createRoleCategory(req: Request, res: Response): Promise<void> {
    const { name } = req.body;
    console.log("Creating role category:", req.body);
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw createError(
        "Role category name is required and must be a non-empty string",
        400
      );
    }

    // Check if role category name already exists
    const [existingRoleCategory] = await db
      .select()
      .from(roleCategories)
      .where(eq(roleCategories.name, name.trim()))
      .limit(1);

    if (existingRoleCategory) {
      throw createError("Role category with this name already exists", 409);
    }

    const [newRoleCategory] = await db
      .insert(roleCategories)
      .values({ name: name.trim() })
      .returning();

    res.status(201).json({
      success: true,
      message: "Role category created successfully",
      data: newRoleCategory,
    });
  }

  /**
   * Get all role categories
   * GET /role-categories
   */
  static async getAllRoleCategories(
    req: Request,
    res: Response
  ): Promise<void> {
    const allRoleCategories = await db.select().from(roleCategories);

    res.status(200).json({
      success: true,
      message: "Role categories retrieved successfully",
      data: allRoleCategories,
    });
  }

  /**
   * Get role category by ID
   * GET /role-categories/:id
   */
  static async getRoleCategoryById(req: Request, res: Response): Promise<void> {
    const roleCategoryId = parseInt(req.params.id as string);

    if (isNaN(roleCategoryId) || roleCategoryId <= 0) {
      throw createError("Invalid role category ID", 400);
    }

    const [roleCategory] = await db
      .select()
      .from(roleCategories)
      .where(eq(roleCategories.id, roleCategoryId))
      .limit(1);

    if (!roleCategory) {
      throw createError("Role category not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Role category retrieved successfully",
      data: roleCategory,
    });
  }

  /**
   * Delete role category by ID
   * DELETE /role-categories/:id
   */
  static async deleteRoleCategory(req: Request, res: Response): Promise<void> {
    const roleCategoryId = parseInt(req.params.id as string);

    if (isNaN(roleCategoryId) || roleCategoryId <= 0) {
      throw createError("Invalid role category ID", 400);
    }

    // Check if role category exists
    const [existingRoleCategory] = await db
      .select()
      .from(roleCategories)
      .where(eq(roleCategories.id, roleCategoryId))
      .limit(1);

    if (!existingRoleCategory) {
      throw createError("Role category not found", 404);
    }

    const result = await db
      .delete(roleCategories)
      .where(eq(roleCategories.id, roleCategoryId))
      .returning({ id: roleCategories.id });

    if (result.length === 0) {
      throw createError("Failed to delete role category", 500);
    }

    res.status(200).json({
      success: true,
      message: "Role category deleted successfully",
    });
  }

  // ==================== ROLES CRD FUNCTIONS ====================

  /**
   * Create a new role
   * POST /roles
   */
  static async createRole(req: Request, res: Response): Promise<void> {
    const { name, categoryId } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw createError(
        "Role name is required and must be a non-empty string",
        400
      );
    }

    if (!categoryId || typeof categoryId !== "number" || categoryId <= 0) {
      throw createError("Valid category ID is required", 400);
    }

    // Check if parent category exists
    const [parentCategory] = await db
      .select()
      .from(roleCategories)
      .where(eq(roleCategories.id, categoryId))
      .limit(1);

    if (!parentCategory) {
      throw createError("Parent role category not found", 404);
    }

    const [newRole] = await db
      .insert(roles)
      .values({
        name: name.trim(),
        categoryId: categoryId,
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: newRole,
    });
  }

  /**
   * Get all roles
   * GET /roles
   */
  static async getAllRoles(req: Request, res: Response): Promise<void> {
    const allRoles = await db.select().from(roles);

    res.status(200).json({
      success: true,
      message: "Roles retrieved successfully",
      data: allRoles,
    });
  }

  /**
   * Get role by ID
   * GET /roles/:id
   */
  static async getRoleById(req: Request, res: Response): Promise<void> {
    const roleId = parseInt(req.params.id as string);

    if (isNaN(roleId) || roleId <= 0) {
      throw createError("Invalid role ID", 400);
    }

    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    if (!role) {
      throw createError("Role not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Role retrieved successfully",
      data: role,
    });
  }

  /**
   * Delete role by ID
   * DELETE /roles/:id
   */
  static async deleteRole(req: Request, res: Response): Promise<void> {
    const roleId = parseInt(req.params.id as string);

    if (isNaN(roleId) || roleId <= 0) {
      throw createError("Invalid role ID", 400);
    }

    // Check if role exists
    const [existingRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    if (!existingRole) {
      throw createError("Role not found", 404);
    }

    const result = await db
      .delete(roles)
      .where(eq(roles.id, roleId))
      .returning({ id: roles.id });

    if (result.length === 0) {
      throw createError("Failed to delete role", 500);
    }

    res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  }

  // ==================== SENIORITY LEVELS CRD FUNCTIONS ====================

  /**
   * Create a new seniority level
   * POST /seniority-levels
   */
  static async createSeniorityLevel(
    req: Request,
    res: Response
  ): Promise<void> {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw createError(
        "Seniority level name is required and must be a non-empty string",
        400
      );
    }

    // Check if seniority level name already exists
    const [existingSeniorityLevel] = await db
      .select()
      .from(seniorityLevels)
      .where(eq(seniorityLevels.name, name.trim()))
      .limit(1);

    if (existingSeniorityLevel) {
      throw createError("Seniority level with this name already exists", 409);
    }

    const [newSeniorityLevel] = await db
      .insert(seniorityLevels)
      .values({ name: name.trim() })
      .returning();

    res.status(201).json({
      success: true,
      message: "Seniority level created successfully",
      data: newSeniorityLevel,
    });
  }

  /**
   * Get all seniority levels
   * GET /seniority-levels
   */
  static async getAllSeniorityLevels(
    req: Request,
    res: Response
  ): Promise<void> {
    const allSeniorityLevels = await db.select().from(seniorityLevels);

    res.status(200).json({
      success: true,
      message: "Seniority levels retrieved successfully",
      data: allSeniorityLevels,
    });
  }

  /**
   * Get seniority level by ID
   * GET /seniority-levels/:id
   */
  static async getSeniorityLevelById(
    req: Request,
    res: Response
  ): Promise<void> {
    const seniorityLevelId = parseInt(req.params.id as string);

    if (isNaN(seniorityLevelId) || seniorityLevelId <= 0) {
      throw createError("Invalid seniority level ID", 400);
    }

    const [seniorityLevel] = await db
      .select()
      .from(seniorityLevels)
      .where(eq(seniorityLevels.id, seniorityLevelId))
      .limit(1);

    if (!seniorityLevel) {
      throw createError("Seniority level not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Seniority level retrieved successfully",
      data: seniorityLevel,
    });
  }

  /**
   * Delete seniority level by ID
   * DELETE /seniority-levels/:id
   */
  static async deleteSeniorityLevel(
    req: Request,
    res: Response
  ): Promise<void> {
    const seniorityLevelId = parseInt(req.params.id as string);

    if (isNaN(seniorityLevelId) || seniorityLevelId <= 0) {
      throw createError("Invalid seniority level ID", 400);
    }

    // Check if seniority level exists
    const [existingSeniorityLevel] = await db
      .select()
      .from(seniorityLevels)
      .where(eq(seniorityLevels.id, seniorityLevelId))
      .limit(1);

    if (!existingSeniorityLevel) {
      throw createError("Seniority level not found", 404);
    }

    const result = await db
      .delete(seniorityLevels)
      .where(eq(seniorityLevels.id, seniorityLevelId))
      .returning({ id: seniorityLevels.id });

    if (result.length === 0) {
      throw createError("Failed to delete seniority level", 500);
    }

    res.status(200).json({
      success: true,
      message: "Seniority level deleted successfully",
    });
  }

  // ==================== INVITATION FUNCTIONS ====================

  /**
   * Create a new invitation link
   * POST /invitations
   */
  static async createInvitation(req: Request, res: Response): Promise<void> {
    const { type } = req.body;
    const createdBy = parseInt(req.body.createdBy as string);

    // Validate invitation type
    if (!type || !["new_joiner", "existing_joiner"].includes(type)) {
      throw createError(
        "Type is required and must be either 'new_joiner' or 'existing_joiner'",
        400
      );
    }

    // Validate creator ID
    if (isNaN(createdBy) || createdBy <= 0) {
      throw createError("Valid creator ID is required", 400);
    }

    const result = await InvitationService.createInvitation(
      createdBy,
      type as InvitationType
    );

    res.status(201).json({
      success: true,
      message: "Invitation created successfully",
      data: {
        invitationLink: `${process.env.FRONTEND_URL}/join?token=${result.token}`,
      },
    });
  }

  /**
   * Get invitation by token with sub-admin details
   * GET /invitations/verify/:token
   */
  static async getInvitationByToken(
    req: Request,
    res: Response
  ): Promise<void> {
    const { token } = req.params;

    if (!token || typeof token !== "string" || token.trim().length === 0) {
      throw createError("Valid token is required", 400);
    }

    const result = await InvitationService.getInvitationByToken(token.trim());

    if (!result) {
      throw createError("Invalid or expired invitation token", 404);
    }

    res.status(200).json({
      success: true,
      message: "Invitation retrieved successfully",
      data: {
        subAdmin: {
          organization: result.subAdminDetails.user.organization,
          subOrganization: result.subAdminDetails.user.subOrganization,
          asset: result.subAdminDetails.user.asset,
          subAsset: result.subAdminDetails.user.subAsset,
        },
      },
    });
  }

  /**
   * Get all invitations created by a sub-admin
   * GET /invitations/creator/:createdBy
   */
  static async getInvitationsByCreator(
    req: Request,
    res: Response
  ): Promise<void> {
    const createdBy = parseInt(req.params.createdBy as string);

    if (isNaN(createdBy) || createdBy <= 0) {
      throw createError("Valid creator ID is required", 400);
    }

    try {
      const invitations = await InvitationService.getInvitationsByCreator(
        createdBy
      );

      res.status(200).json({
        success: true,
        message: "Invitations retrieved successfully",
        data: {
          invitations,
        },
      });
    } catch (error: any) {
      throw createError(error.message || "Failed to retrieve invitations", 500);
    }
  }

  /**
   * Delete an invitation by token
   * DELETE /invitations/token/:token
   */
  static async deleteInvitationByToken(
    req: Request,
    res: Response
  ): Promise<void> {
    const { token } = req.params;

    if (!token || typeof token !== "string" || token.trim().length === 0) {
      throw createError("Valid token is required", 400);
    }

    const deleted = await InvitationService.deleteInvitationByToken(
      token.trim()
    );

    if (!deleted) {
      throw createError("Invitation not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Invitation deleted successfully",
    });
  }

  // ==================== PASSWORD RESET FUNCTIONS ====================

  /**
   * Request password reset (send reset link to email)
   * POST /password-reset/request
   */
  static async requestPasswordReset(
    req: Request,
    res: Response
  ): Promise<void> {
    const validation = validatePasswordResetRequestInput(req.body);

    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    const { email } = req.body;

    try {
      const result = await PasswordResetService.createPasswordResetRequest(
        email
      );

      // Always return success for security (don't reveal if email exists)
      res.status(200).json({
        success: true,
        message:
          "If an account with this email exists, a password reset link has been sent.",
      });

      // In a real application, you would send an email here with the reset link
      // Example: await EmailService.sendPasswordResetEmail(email, result?.token);
      if (result?.token) {
        console.log(`Password reset token for ${email}: ${result.token}`);
        console.log(
          `Reset link: ${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/reset-password?token=${result.token}`
        );
      }
    } catch (error: any) {
      console.error("Password reset request error:", error);
      throw createError("Failed to process password reset request", 500);
    }
  }

  /**
   * Verify password reset token
   * GET /password-reset/verify/:token
   */
  static async verifyPasswordResetToken(
    req: Request,
    res: Response
  ): Promise<void> {
    const { token } = req.params;

    if (!token || typeof token !== "string" || token.trim().length === 0) {
      throw createError("Valid token is required", 400);
    }

    try {
      const result = await PasswordResetService.verifyPasswordResetToken(
        token.trim()
      );

      if (!result) {
        throw createError("Invalid or expired password reset token", 400);
      }

      res.status(200).json({
        success: true,
        message: "Password reset token is valid",
        data: {
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
        },
      });
    } catch (error: any) {
      console.error("Password reset token verification error:", error);
      if (error.statusCode) {
        throw error;
      }
      throw createError("Failed to verify password reset token", 500);
    }
  }

  /**
   * Reset password using token
   * POST /password-reset/reset
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    const validation = validatePasswordResetInput(req.body);

    if (!validation.isValid) {
      throw createError("Validation failed", 400, validation.errors);
    }

    const { token, password } = req.body;

    try {
      // Hash the new password
      const newPasswordHash = await bcrypt.hash(password, 10);

      const success = await PasswordResetService.resetPassword(
        token.trim(),
        newPasswordHash
      );

      if (!success) {
        throw createError("Invalid or expired password reset token", 400);
      }

      res.status(200).json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      if (error.statusCode) {
        throw error;
      }
      throw createError("Failed to reset password", 500);
    }
  }
}
