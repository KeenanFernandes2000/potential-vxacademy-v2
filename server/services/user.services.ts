import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { users, subAdmins, normalUsers } from "../db/schema/users";
import type { User, NewUser, UpdateUser } from "../db/types";

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
}
