import { eq, and, lt, gt, ne, lte, sql } from "drizzle-orm";
import { db } from "../db/connection";
import {
  users,
  subAdmins,
  normalUsers,
  passwordResets,
  invitations,
  organizations,
  subOrganizations,
  assets,
  subAssets,
  roleCategories,
  seniorityLevels,
} from "../db/schema/users";
import {
  userTrainingAreaProgress,
  userCourseProgress,
} from "../db/schema/progress";
import { courses } from "../db/schema/training";
import type {
  User,
  NewUser,
  UpdateUser,
  PasswordReset,
  NewPasswordReset,
  Invitation,
  NewInvitation,
  InvitationType,
  Organization,
  NewOrganization,
  UpdateOrganization,
  SubOrganization,
  NewSubOrganization,
  UpdateSubOrganization,
} from "../db/types";
import crypto from "crypto";

// ==================== ORGANIZATION SERVICE ====================
export class OrganizationService {
  /**
   * Create a new organization
   */
  static async createOrganization(
    data: NewOrganization
  ): Promise<Organization> {
    const result = await db.insert(organizations).values(data).returning();

    if (!result[0]) {
      throw new Error("Failed to create organization");
    }

    return result[0];
  }

  /**
   * Get organization by ID
   */
  static async getOrganizationById(id: number): Promise<Organization | null> {
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    return organization || null;
  }

  /**
   * Get all organizations
   */
  static async getAllOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations);
  }

  /**
   * Update organization by ID
   */
  static async updateOrganization(
    id: number,
    updateData: UpdateOrganization
  ): Promise<Organization | null> {
    const [updatedOrganization] = await db
      .update(organizations)
      .set(updateData)
      .where(eq(organizations.id, id))
      .returning();

    return updatedOrganization || null;
  }

  /**
   * Delete organization by ID
   */
  static async deleteOrganization(id: number): Promise<boolean> {
    const result = await db
      .delete(organizations)
      .where(eq(organizations.id, id))
      .returning({ id: organizations.id });

    return result.length > 0;
  }

  /**
   * Check if organization exists by ID
   */
  static async organizationExists(id: number): Promise<Organization | null> {
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    return organization || null;
  }

  /**
   * Check if organization name already exists
   */
  static async organizationNameExists(name: string): Promise<boolean> {
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.name, name))
      .limit(1);

    return !!organization;
  }
}

// ==================== SUB-ORGANIZATION SERVICE ====================
export class SubOrganizationService {
  /**
   * Create a new sub-organization
   */
  static async createSubOrganization(
    organizationId: number,
    data: NewSubOrganization
  ): Promise<SubOrganization> {
    const result = await db
      .insert(subOrganizations)
      .values({
        ...data,
        organizationId,
      })
      .returning();

    if (!result[0]) {
      throw new Error("Failed to create sub-organization");
    }

    return result[0];
  }

  /**
   * Validate asset and sub-asset relationship
   */
  static async validateAssetSubAssetRelationship(
    assetId: number,
    subAssetId: number
  ): Promise<boolean> {
    const [subAsset] = await db
      .select()
      .from(subAssets)
      .where(and(eq(subAssets.id, subAssetId), eq(subAssets.assetId, assetId)))
      .limit(1);

    return !!subAsset;
  }

  /**
   * Get sub-organization by asset and sub-asset IDs
   */
  static async getSubOrganizationByAssetAndSubAsset(
    assetId: number,
    subAssetId: number
  ): Promise<SubOrganization | null> {
    const [subOrganization] = await db
      .select()
      .from(subOrganizations)
      .where(
        and(
          eq(subOrganizations.assetId, assetId),
          eq(subOrganizations.subAssetId, subAssetId)
        )
      )
      .limit(1);

    return subOrganization || null;
  }

  /**
   * Get sub-organization by ID
   */
  static async getSubOrganizationById(
    id: number
  ): Promise<SubOrganization | null> {
    const [subOrganization] = await db
      .select()
      .from(subOrganizations)
      .where(eq(subOrganizations.id, id))
      .limit(1);

    return subOrganization || null;
  }

  /**
   * Get all sub-organizations
   */
  static async getAllSubOrganizations(): Promise<SubOrganization[]> {
    return await db.select().from(subOrganizations);
  }

  /**
   * Get sub-organizations by organization ID
   */
  static async getSubOrganizationsByOrganizationId(
    organizationId: number
  ): Promise<SubOrganization[]> {
    return await db
      .select()
      .from(subOrganizations)
      .where(eq(subOrganizations.organizationId, organizationId));
  }

  /**
   * Update sub-organization by ID
   */
  static async updateSubOrganization(
    id: number,
    updateData: UpdateSubOrganization
  ): Promise<SubOrganization | null> {
    const [updatedSubOrganization] = await db
      .update(subOrganizations)
      .set(updateData)
      .where(eq(subOrganizations.id, id))
      .returning();

    return updatedSubOrganization || null;
  }

  /**
   * Delete sub-organization by ID
   */
  static async deleteSubOrganization(id: number): Promise<boolean> {
    const result = await db
      .delete(subOrganizations)
      .where(eq(subOrganizations.id, id))
      .returning({ id: subOrganizations.id });

    return result.length > 0;
  }

  /**
   * Check if sub-organization exists by ID
   */
  static async subOrganizationExists(
    id: number
  ): Promise<SubOrganization | null> {
    const [subOrganization] = await db
      .select()
      .from(subOrganizations)
      .where(eq(subOrganizations.id, id))
      .limit(1);

    return subOrganization || null;
  }
}

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(userData: NewUser): Promise<User> {
    const result = await db
      .insert(users)
      .values({
        ...userData,
        updatedAt: new Date(),
      })
      .returning();

    if (!result[0]) {
      throw new Error("Failed to create user");
    }

    return result[0];
  }

  /**
   * Get user by ID (basic info only)
   */
  static async getUserById(id: number): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  }

  /**
   * Get users filtered by total course progress percentage (≤ threshold)
   * Progress is calculated as: completed courses / total courses * 100
   * Progress threshold should be in increments of 10 (0, 10, 20, ..., 100)
   */
  static async getUsersByProgressThreshold(
    progressThreshold: number,
    limit?: number,
    offset?: number
  ): Promise<{
    users: Array<{
      user: User;
      normalUserDetails: any;
      totalProgress: number;
      completedCourses: number;
      totalCourses: number;
    }>;
    totalCount: number;
  }> {
    // Calculate progress based on completed courses / total courses (only published courses)
    const baseQuery = db
      .select({
        user: users,
        normalUserDetails: normalUsers,
        completedCourses: sql<number>`
            COUNT(CASE WHEN ${userCourseProgress.status} = 'completed' AND ${courses.status} = 'published' THEN 1 END)
          `,
        totalCourses: sql<number>`
            COUNT(CASE WHEN ${courses.status} = 'published' THEN ${userCourseProgress.courseId} END)
          `,
        totalProgress: sql<number>`
            CASE
              WHEN COUNT(CASE WHEN ${courses.status} = 'published' THEN ${userCourseProgress.courseId} END) = 0 THEN 0
              ELSE ROUND(
                (COUNT(CASE WHEN ${userCourseProgress.status} = 'completed' AND ${courses.status} = 'published' THEN 1 END) * 100.0) /
                COUNT(CASE WHEN ${courses.status} = 'published' THEN ${userCourseProgress.courseId} END),
                2
              )
            END
          `,
      })
      .from(users)
      .leftJoin(normalUsers, eq(users.id, normalUsers.userId))
      .leftJoin(userCourseProgress, eq(users.id, userCourseProgress.userId))
      .leftJoin(courses, eq(courses.id, userCourseProgress.courseId))
      .groupBy(users.id, normalUsers.userId)
      .having(
        lte(
          sql`CASE
              WHEN COUNT(CASE WHEN ${courses.status} = 'published' THEN ${userCourseProgress.courseId} END) = 0 THEN 0
              ELSE ROUND(
                (COUNT(CASE WHEN ${userCourseProgress.status} = 'completed' AND ${courses.status} = 'published' THEN 1 END) * 100.0) /
                COUNT(CASE WHEN ${courses.status} = 'published' THEN ${userCourseProgress.courseId} END),
                2
              )
            END`,
          progressThreshold
        )
      )
      .orderBy(users.createdAt);

    // Get total count (only published courses)
    const countQuery = db.select({ count: sql<number>`COUNT(*)` }).from(
      db
        .select({
          userId: users.id,
          courseProgress: sql<number>`
              CASE
                WHEN COUNT(CASE WHEN ${courses.status} = 'published' THEN ${userCourseProgress.courseId} END) = 0 THEN 0
                ELSE ROUND(
                  (COUNT(CASE WHEN ${userCourseProgress.status} = 'completed' AND ${courses.status} = 'published' THEN 1 END) * 100.0) /
                  COUNT(CASE WHEN ${courses.status} = 'published' THEN ${userCourseProgress.courseId} END),
                  2
                )
              END
            `,
        })
        .from(users)
        .leftJoin(userCourseProgress, eq(users.id, userCourseProgress.userId))
        .leftJoin(courses, eq(courses.id, userCourseProgress.courseId))
        .groupBy(users.id)
        .having(
          lte(
            sql`CASE
                WHEN COUNT(CASE WHEN ${courses.status} = 'published' THEN ${userCourseProgress.courseId} END) = 0 THEN 0
                ELSE ROUND(
                  (COUNT(CASE WHEN ${userCourseProgress.status} = 'completed' AND ${courses.status} = 'published' THEN 1 END) * 100.0) /
                  COUNT(CASE WHEN ${courses.status} = 'published' THEN ${userCourseProgress.courseId} END),
                  2
                )
              END`,
            progressThreshold
          )
        )
        .as("filtered_users")
    );

    // Apply pagination if provided
    if (limit !== undefined) {
      baseQuery.limit(limit);
    }
    if (offset !== undefined) {
      baseQuery.offset(offset);
    }

    const [usersResult, countResult] = await Promise.all([
      baseQuery,
      countQuery,
    ]);

    return {
      users: usersResult,
      totalCount: countResult[0]?.count || 0,
    };
  }

  /**
   * Get user by ID with all related data (sub-admin or normal user details)
   */
  static async getUserByIdWithDetails(id: number): Promise<any | null> {
    // First get the main user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return null;
    }

    // Check if user is a sub-admin
    if (user.userType === "sub_admin") {
      const [subAdmin] = await db
        .select()
        .from(subAdmins)
        .where(eq(subAdmins.userId, id))
        .limit(1);

      return {
        ...user,
        subAdminDetails: subAdmin || null,
      };
    }

    // Check if user is a normal user
    if (user.userType === "user") {
      const [normalUser] = await db
        .select()
        .from(normalUsers)
        .where(eq(normalUsers.userId, id))
        .limit(1);

      return {
        ...user,
        normalUserDetails: normalUser || null,
      };
    }

    // For admin users, just return the main user data
    return user;
  }

  /**
   * Get user by ID with extended details including IDs for login response
   */
  static async getUserByIdWithExtendedDetails(id: number): Promise<any | null> {
    // First get the main user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return null;
    }

    // Get asset ID by asset name
    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.name, user.asset))
      .limit(1);

    const assetId = asset?.id || null;

    // Check if user is a normal user and get additional details
    if (user.userType === "user") {
      const [normalUser] = await db
        .select()
        .from(normalUsers)
        .where(eq(normalUsers.userId, id))
        .limit(1);

      if (normalUser) {
        // Get role category ID by role category name
        const [roleCategory] = await db
          .select()
          .from(roleCategories)
          .where(eq(roleCategories.name, normalUser.roleCategory))
          .limit(1);

        // Get seniority level ID by seniority name
        const [seniorityLevel] = await db
          .select()
          .from(seniorityLevels)
          .where(eq(seniorityLevels.name, normalUser.seniority))
          .limit(1);

        return {
          ...user,
          assetId,
          normalUserDetails: {
            ...normalUser,
            roleCategoryId: roleCategory?.id || null,
            seniorityId: seniorityLevel?.id || null,
          },
        };
      }
    }

    // For admin and sub-admin users, return with assetId
    return {
      ...user,
      assetId,
    };
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user || null;
  }

  /**
   * Get all users with optional pagination
   */
  static async getAllUsers(limit?: number, offset?: number): Promise<User[]> {
    const query = db.select().from(users);

    if (limit !== undefined) {
      query.limit(limit);
    }

    if (offset !== undefined) {
      query.offset(offset);
    }

    return await query;
  }

  /**
   * Update user by ID
   */
  static async updateUser(
    id: number,
    updateData: UpdateUser
  ): Promise<User | null> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updatedUser || null;
  }

  /**
   * Delete user by ID
   */
  static async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    return result.length > 0;
  }

  /**
   * Check if user exists by ID
   */
  static async userExists(id: number): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  }

  /**
   * Check if email is already taken
   */
  static async emailExists(
    email: string,
    excludeUserId?: number
  ): Promise<boolean> {
    const query = db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));

    const result = await query.limit(1);

    if (excludeUserId && result.length > 0 && result[0]) {
      // If we found a user with this email and we're excluding a specific user,
      // return true only if the found user is NOT the excluded user
      return result[0].id !== excludeUserId;
    }

    return result.length > 0;
  }

  /**
   * Update user's updatedAt timestamp
   */
  static async updateUserTimestamp(id: number): Promise<void> {
    await db
      .update(users)
      .set({ updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  /**
   * Update user's last login timestamp
   */
  static async updateUserLastLogin(id: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  /**
   * Update user's password
   */
  static async updateSubAdminPasswordRegistration(
    id: number,
    passwordHash: string
  ): Promise<void> {
    await db
      .update(users)
      .set({
        passwordHash: passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  // ==================== ORGANIZATION CRUD FUNCTIONS ====================

  /**
   * Create a new organization
   */
  static async createOrganization(
    organizationData: NewOrganization
  ): Promise<Organization> {
    const result = await db
      .insert(organizations)
      .values(organizationData)
      .returning();

    if (!result[0]) {
      throw new Error("Failed to create organization");
    }

    return result[0];
  }

  /**
   * Get all organizations
   */
  static async getAllOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations);
  }

  /**
   * Get organization by ID
   */
  static async getOrganizationById(id: number): Promise<Organization | null> {
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    return organization || null;
  }

  /**
   * Update organization
   */
  static async updateOrganization(
    id: number,
    updateData: UpdateOrganization
  ): Promise<Organization | null> {
    const [updatedOrganization] = await db
      .update(organizations)
      .set(updateData)
      .where(eq(organizations.id, id))
      .returning();

    return updatedOrganization || null;
  }

  /**
   * Delete organization
   */
  static async deleteOrganization(id: number): Promise<boolean> {
    const result = await db
      .delete(organizations)
      .where(eq(organizations.id, id))
      .returning({ id: organizations.id });

    return result.length > 0;
  }

  /**
   * Check if organization name exists
   */
  static async organizationNameExists(
    name: string,
    excludeId?: number
  ): Promise<boolean> {
    const whereCondition = excludeId
      ? and(eq(organizations.name, name), ne(organizations.id, excludeId))
      : eq(organizations.name, name);

    const result = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(whereCondition)
      .limit(1);

    return result.length > 0;
  }
}

export class InvitationService {
  /**
   * Hash a token for database storage
   */
  private static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Create a new invitation link
   */
  static async createInvitation(
    createdBy: number,
    type: InvitationType
  ): Promise<{ token: string }> {
    // Generate a unique token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(token);

    // Verify that the creator is a sub-admin
    const [subAdmin] = await db
      .select()
      .from(subAdmins)
      .where(eq(subAdmins.userId, createdBy))
      .limit(1);

    if (!subAdmin) {
      throw new Error("Only sub-admins can create invitations");
    }

    const invitationData: NewInvitation = {
      createdBy,
      type,
      tokenHash,
    };

    const [newInvitation] = await db
      .insert(invitations)
      .values(invitationData)
      .returning();

    if (!newInvitation) {
      throw new Error("Failed to create invitation");
    }

    return {
      token, // Return the unhashed token for the link
    };
  }

  /**
   * Get invitation by token and return with sub-admin details
   */
  static async getInvitationByToken(token: string): Promise<{
    invitation: Invitation;
    subAdminDetails: {
      user: User;
      subAdmin: any;
    };
  } | null> {
    // Get invitation with sub-admin details
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.tokenHash, token))
      .limit(1);

    if (!invitation) {
      return null;
    }

    // Get sub-admin details
    const [subAdminUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, invitation.createdBy))
      .limit(1);

    const [subAdminDetails] = await db
      .select()
      .from(subAdmins)
      .where(eq(subAdmins.userId, invitation.createdBy))
      .limit(1);

    if (!subAdminUser || !subAdminDetails) {
      throw new Error("Sub-admin details not found");
    }

    return {
      invitation,
      subAdminDetails: {
        user: subAdminUser,
        subAdmin: subAdminDetails,
      },
    };
  }

  /**
   * Get all invitations created by a sub-admin
   */
  static async getInvitationsByCreator(
    createdBy: number
  ): Promise<Invitation[]> {
    return await db
      .select()
      .from(invitations)
      .where(eq(invitations.createdBy, createdBy));
  }

  /**
   * Delete an invitation by token
   */
  static async deleteInvitationByToken(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);

    const result = await db
      .delete(invitations)
      .where(eq(invitations.tokenHash, tokenHash))
      .returning({ id: invitations.id });

    return result.length > 0;
  }
}

export class PasswordResetService {
  /**
   * Hash a token for database storage
   */
  private static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Create a new password reset request
   */
  static async createPasswordResetRequest(
    email: string
  ): Promise<{ token: string } | null> {
    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      // For security, we don't reveal if email exists or not
      return null;
    }

    // Generate a unique token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(token);

    // Set expiration to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Clean up any existing unused password reset tokens for this user
    await db
      .delete(passwordResets)
      .where(
        and(eq(passwordResets.userId, user.id), eq(passwordResets.used, false))
      );

    // Create new password reset record
    const passwordResetData: NewPasswordReset = {
      userId: user.id,
      tokenHash,
      expiresAt,
      used: false,
    };

    const [newPasswordReset] = await db
      .insert(passwordResets)
      .values(passwordResetData)
      .returning();

    if (!newPasswordReset) {
      throw new Error("Failed to create password reset request");
    }

    return {
      token, // Return the unhashed token for the email link
    };
  }

  /**
   * Verify password reset token and return user info
   */
  static async verifyPasswordResetToken(token: string): Promise<{
    passwordReset: PasswordReset;
    user: User;
  } | null> {
    const tokenHash = this.hashToken(token);

    // Get password reset record with user details
    const [passwordReset] = await db
      .select()
      .from(passwordResets)
      .where(
        and(
          eq(passwordResets.tokenHash, tokenHash),
          eq(passwordResets.used, false),
          gt(passwordResets.expiresAt, new Date()) // Token not expired
        )
      )
      .limit(1);

    if (!passwordReset) {
      return null;
    }

    // Get user details
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, passwordReset.userId))
      .limit(1);

    if (!user) {
      throw new Error("User not found for password reset");
    }

    return {
      passwordReset,
      user,
    };
  }

  /**
   * Reset password using token
   */
  static async resetPassword(
    token: string,
    newPasswordHash: string
  ): Promise<boolean> {
    // First verify the token is valid
    const verification = await this.verifyPasswordResetToken(token);
    if (!verification) {
      return false;
    }

    const { passwordReset, user } = verification;

    try {
      // Start transaction - update password and mark token as used
      await db.transaction(async (tx) => {
        // Update user password
        await tx
          .update(users)
          .set({
            passwordHash: newPasswordHash,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));

        // Mark password reset token as used
        await tx
          .update(passwordResets)
          .set({ used: true })
          .where(eq(passwordResets.id, passwordReset.id));
      });

      return true;
    } catch (error) {
      console.error("Error resetting password:", error);
      return false;
    }
  }

  /**
   * Clean up expired password reset tokens
   */
  static async cleanupExpiredTokens(): Promise<number> {
    const result = await db
      .delete(passwordResets)
      .where(lt(passwordResets.expiresAt, new Date()))
      .returning({ id: passwordResets.id });

    return result.length;
  }

  /**
   * Get password reset request by user ID (for admin purposes)
   */
  static async getPasswordResetsByUserId(
    userId: number
  ): Promise<PasswordReset[]> {
    return await db
      .select()
      .from(passwordResets)
      .where(eq(passwordResets.userId, userId));
  }
}
