import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { mediaFiles } from "../db/schema/system";
import type { MediaFile, NewMediaFile } from "../db/types";
import fs from "fs";

export class MediaService {
  /**
   * Create a new media file record from uploaded file
   */
  static async uploadMediaFile(
    file: Express.Multer.File,
    uploadedBy: number
  ): Promise<MediaFile> {
    // Generate URL for the uploaded file
    const fileUrl = this.generateFileUrl(file.path);

    const mediaData: NewMediaFile = {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      filePath: file.path,
      url: fileUrl,
      uploadedBy,
    };

    const result = await db.insert(mediaFiles).values(mediaData).returning();

    if (!result[0]) {
      // Clean up the uploaded file if database insert fails
      this.cleanupFile(file.path);
      throw new Error("Failed to create media file");
    }

    return result[0];
  }

  /**
   * Create multiple media file records from uploaded files
   */
  static async uploadMultipleMediaFiles(
    files: Express.Multer.File[],
    uploadedBy: number
  ): Promise<MediaFile[]> {
    const mediaDataArray: NewMediaFile[] = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      filePath: file.path,
      url: this.generateFileUrl(file.path),
      uploadedBy,
    }));

    try {
      const results = await db
        .insert(mediaFiles)
        .values(mediaDataArray)
        .returning();
      return results;
    } catch (error) {
      // Clean up all uploaded files if database insert fails
      files.forEach((file) => this.cleanupFile(file.path));
      throw new Error("Failed to create media files");
    }
  }

  /**
   * Get media file by ID
   */
  static async getMediaFileById(id: number): Promise<MediaFile | null> {
    const [mediaFile] = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.id, id))
      .limit(1);

    return mediaFile || null;
  }

  /**
   * Get all media files with optional pagination
   */
  static async getAllMediaFiles(
    limit?: number,
    offset?: number
  ): Promise<MediaFile[]> {
    const query = db.select().from(mediaFiles);

    if (limit !== undefined) {
      query.limit(limit);
    }

    if (offset !== undefined) {
      query.offset(offset);
    }

    return await query;
  }

  /**
   * Get media files by uploader ID
   */
  static async getMediaFilesByUploader(
    uploadedBy: number
  ): Promise<MediaFile[]> {
    return await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.uploadedBy, uploadedBy));
  }

  /**
   * Get media files by MIME type
   */
  static async getMediaFilesByMimeType(mimeType: string): Promise<MediaFile[]> {
    return await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.mimeType, mimeType));
  }

  /**
   * Search media files by filename
   */
  static async searchMediaFilesByFilename(
    searchTerm: string
  ): Promise<MediaFile[]> {
    return await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.filename, searchTerm));
  }

  /**
   * Delete media file by ID (includes file cleanup)
   */
  static async deleteMediaFile(id: number): Promise<boolean> {
    // First get the file record to access file path
    const [mediaFile] = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.id, id))
      .limit(1);

    if (!mediaFile) {
      return false;
    }

    // Delete from database
    const result = await db
      .delete(mediaFiles)
      .where(eq(mediaFiles.id, id))
      .returning({ id: mediaFiles.id });

    if (result.length > 0) {
      // Clean up the physical file
      this.cleanupFile(mediaFile.filePath);
      return true;
    }

    return false;
  }

  /**
   * Generate file URL from file path
   */
  static generateFileUrl(filePath: string): string {
    // Convert file path to URL path and extract only the uploads directory and below
    const normalizedPath = filePath.replace(/\\/g, "/");
    const uploadsIndex = normalizedPath.indexOf("/uploads/");

    if (uploadsIndex !== -1) {
      // Extract everything from /uploads/ onwards
      return normalizedPath.substring(uploadsIndex);
    }

    // Fallback: if uploads not found, return the path as is with leading slash
    return `/${normalizedPath}`;
  }

  /**
   * Check if media file exists by ID
   */
  static async mediaFileExists(id: number): Promise<MediaFile | null> {
    const [mediaFile] = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.id, id))
      .limit(1);

    return mediaFile || null;
  }

  /**
   * Clean up a single file
   */
  static cleanupFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error("Error cleaning up file:", error);
    }
  }
}
