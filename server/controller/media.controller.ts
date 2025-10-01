import type { Request, Response } from "express";
import { MediaService } from "../services/media.services";
import type { CustomError } from "../middleware/errorHandling";
import { cleanupFile } from "../middleware/upload";
import { db } from "../db/connection";
import { roles, roleCategories } from "../db/schema/users";
import { eq } from "drizzle-orm";

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

export class MediaController {
  /**
   * Upload a new media file via multer
   * POST /media/upload
   */
  static async uploadMediaFile(req: Request, res: Response): Promise<void> {
    // Check if file was uploaded
    if (!req.file) {
      throw createError("No file uploaded", 400);
    }

    // Get uploadedBy from authenticated user
    const uploadedBy = (req as any).user?.id;
    if (!uploadedBy) {
      // Clean up the uploaded file
      cleanupFile(req.file.path);
      throw createError("User not authenticated", 401);
    }

    try {
      const newMediaFile = await MediaService.uploadMediaFile(
        req.file,
        uploadedBy
      );

      res.status(201).json({
        success: true,
        message: "Media file uploaded successfully",
        data: newMediaFile,
      });
    } catch (error: any) {
      // Clean up the uploaded file if database operation fails
      cleanupFile(req.file.path);
      
      // Provide more specific error messages based on the error type
      if (error.message.includes("does not exist")) {
        throw createError(error.message, 404);
      } else if (error.message.includes("already exists")) {
        throw createError(error.message, 409);
      } else {
        throw createError(error.message || "Failed to upload media file", 500);
      }
    }
  }

  /**
   * Upload multiple media files via multer
   * POST /media/upload-multiple
   */
  static async uploadMultipleMediaFiles(
    req: Request,
    res: Response
  ): Promise<void> {
    // Check if files were uploaded
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw createError("No files uploaded", 400);
    }

    // Get uploadedBy from authenticated user
    const uploadedBy = (req as any).user?.id;
    if (!uploadedBy) {
      // Clean up all uploaded files
      req.files.forEach((file) => cleanupFile(file.path));
      throw createError("User not authenticated", 401);
    }

    try {
      const newMediaFiles = await MediaService.uploadMultipleMediaFiles(
        req.files,
        uploadedBy
      );

      res.status(201).json({
        success: true,
        message: `${newMediaFiles.length} media files uploaded successfully`,
        data: newMediaFiles,
        meta: {
          count: newMediaFiles.length,
          uploadedBy,
        },
      });
    } catch (error: any) {
      // Clean up all uploaded files if database operation fails
      req.files.forEach((file) => cleanupFile(file.path));
      
      // Provide more specific error messages based on the error type
      if (error.message.includes("does not exist")) {
        throw createError(error.message, 404);
      } else if (error.message.includes("already exists")) {
        throw createError(error.message, 409);
      } else {
        throw createError(error.message || "Failed to upload media files", 500);
      }
    }
  }

  /**
   * Get all media files with optional pagination
   * GET /media?limit=10&offset=0
   */
  static async getAllMediaFiles(req: Request, res: Response): Promise<void> {
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

    const mediaFiles = await MediaService.getAllMediaFiles(limit, offset);

    res.status(200).json({
      success: true,
      message: "Media files retrieved successfully",
      data: mediaFiles,
      meta: {
        limit: limit || null,
        offset: offset || 0,
        count: mediaFiles.length,
      },
    });
  }

  /**
   * Get media file by ID
   * GET /media/:id
   */
  static async getMediaFileById(req: Request, res: Response): Promise<void> {
    const mediaId = parseInt(req.params.id as string);

    if (isNaN(mediaId) || mediaId <= 0) {
      throw createError("Invalid media file ID", 400);
    }

    const mediaFile = await MediaService.getMediaFileById(mediaId);

    if (!mediaFile) {
      throw createError("Media file not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Media file retrieved successfully",
      data: mediaFile,
    });
  }

  /**
   * Get media files by uploader ID
   * GET /media/uploader/:uploadedBy
   */
  static async getMediaFilesByUploader(
    req: Request,
    res: Response
  ): Promise<void> {
    const uploadedBy = parseInt(req.params.uploadedBy as string);

    if (isNaN(uploadedBy) || uploadedBy <= 0) {
      throw createError("Invalid uploader ID", 400);
    }

    const mediaFiles = await MediaService.getMediaFilesByUploader(uploadedBy);

    res.status(200).json({
      success: true,
      message: "Media files retrieved successfully",
      data: mediaFiles,
      meta: {
        count: mediaFiles.length,
        uploadedBy,
      },
    });
  }

  /**
   * Get media files by MIME type
   * GET /media/type/:mimeType
   */
  static async getMediaFilesByMimeType(
    req: Request,
    res: Response
  ): Promise<void> {
    const { mimeType } = req.params;

    if (
      !mimeType ||
      typeof mimeType !== "string" ||
      mimeType.trim().length === 0
    ) {
      throw createError("Valid MIME type is required", 400);
    }

    const mediaFiles = await MediaService.getMediaFilesByMimeType(
      mimeType.trim()
    );

    res.status(200).json({
      success: true,
      message: "Media files retrieved successfully",
      data: mediaFiles,
      meta: {
        count: mediaFiles.length,
        mimeType: mimeType.trim(),
      },
    });
  }

  /**
   * Search media files by filename
   * GET /media/search?filename=searchTerm
   */
  static async searchMediaFilesByFilename(
    req: Request,
    res: Response
  ): Promise<void> {
    const { filename } = req.query;

    if (
      !filename ||
      typeof filename !== "string" ||
      filename.trim().length === 0
    ) {
      throw createError("Search term is required", 400);
    }

    const mediaFiles = await MediaService.searchMediaFilesByFilename(
      filename.trim()
    );

    res.status(200).json({
      success: true,
      message: "Media files retrieved successfully",
      data: mediaFiles,
      meta: {
        count: mediaFiles.length,
        searchTerm: filename.trim(),
      },
    });
  }

  /**
   * Delete media file by ID
   * DELETE /media/:id
   */
  static async deleteMediaFile(req: Request, res: Response): Promise<void> {
    const mediaId = parseInt(req.params.id as string);

    if (isNaN(mediaId) || mediaId <= 0) {
      throw createError("Invalid media file ID", 400);
    }

    // Check if media file exists
    const existingMediaFile = await MediaService.mediaFileExists(mediaId);
    if (!existingMediaFile) {
      throw createError("Media file not found", 404);
    }

    const deleted = await MediaService.deleteMediaFile(mediaId);

    if (!deleted) {
      throw createError("Failed to delete media file", 500);
    }

    res.status(200).json({
      success: true,
      message: "Media file deleted successfully",
    });
  }

  // ==================== BULK ROLES FUNCTIONS ====================

  /**
   * Bulk create roles for a specific category
   * POST /media/bulk-roles
   */
  static async bulkCreateRoles(req: Request, res: Response): Promise<void> {
    const { categoryId, roleNames } = req.body;

    // Validate categoryId
    if (!categoryId || typeof categoryId !== "number" || categoryId <= 0) {
      throw createError("Valid category ID is required", 400);
    }

    // Validate roleNames array
    if (!Array.isArray(roleNames) || roleNames.length === 0) {
      throw createError("Role names array is required and must not be empty", 400);
    }

    // Validate each role name
    const errors: string[] = [];
    roleNames.forEach((roleName: any, index: number) => {
      if (!roleName || typeof roleName !== "string" || roleName.trim().length === 0) {
        errors.push(`Role name at index ${index} is required and must be a non-empty string`);
      }
    });

    if (errors.length > 0) {
      throw createError("Validation failed", 400, errors);
    }

    // Check if category exists
    const [existingCategory] = await db
      .select()
      .from(roleCategories)
      .where(eq(roleCategories.id, categoryId))
      .limit(1);

    if (!existingCategory) {
      throw createError("Role category not found", 404);
    }

    // Check for duplicate role names in the request
    const trimmedRoleNames = roleNames.map((name: string) => name.trim());
    const uniqueRoleNames = [...new Set(trimmedRoleNames)];
    if (uniqueRoleNames.length !== trimmedRoleNames.length) {
      throw createError("Duplicate role names found in the request", 400);
    }

    // Check for existing roles with the same names in this category
    const existingRoles = await db
      .select()
      .from(roles)
      .where(eq(roles.categoryId, categoryId));

    const existingRoleNames = existingRoles.map(role => role.name);
    const conflictingRoles = trimmedRoleNames.filter(name => existingRoleNames.includes(name));

    if (conflictingRoles.length > 0) {
      throw createError(
        `The following role names already exist in this category: ${conflictingRoles.join(", ")}`,
        409
      );
    }

    try {
      // Prepare bulk insert data
      const bulkInsertData = trimmedRoleNames.map(roleName => ({
        categoryId: categoryId,
        name: roleName,
      }));

      // Bulk insert roles
      const newRoles = await db
        .insert(roles)
        .values(bulkInsertData)
        .returning();

      res.status(201).json({
        success: true,
        message: `${newRoles.length} roles created successfully for category "${existingCategory.name}"`,
        data: {
          category: existingCategory,
          roles: newRoles,
        },
        meta: {
          categoryId,
          rolesCreated: newRoles.length,
          totalRequested: roleNames.length,
        },
      });
    } catch (error: any) {
      console.error("Bulk create roles error:", error);
      throw createError("Failed to create roles", 500);
    }
  }
}
