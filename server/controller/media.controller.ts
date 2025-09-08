import type { Request, Response } from "express";
import { MediaService } from "../services/media.services";
import type { CustomError } from "../middleware/errorHandling";
import { cleanupFile } from "../middleware/upload";

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
      throw createError(error.message || "Failed to upload media file", 500);
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
      throw createError(error.message || "Failed to upload media files", 500);
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
}
