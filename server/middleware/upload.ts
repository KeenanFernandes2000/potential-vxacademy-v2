import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import type { Request, Response, NextFunction } from "express";

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const uploadDirs = [
    "uploads/images",
    "uploads/documents",
    "uploads/videos",
    "uploads/audio",
  ];

  uploadDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize upload directories
ensureUploadDirs();

// File type validation
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    // Videos
    "video/mp4",
    "video/avi",
    "video/mov",
    "video/wmv",
    "video/flv",
    "video/webm",
    // Audio
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/mpeg",
    "audio/aac",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

// Determine upload directory based on file type
const getUploadDir = (mimetype: string): string => {
  if (mimetype.startsWith("image/")) {
    return "uploads/images";
  } else if (mimetype.startsWith("video/")) {
    return "uploads/videos";
  } else if (mimetype.startsWith("audio/")) {
    return "uploads/audio";
  } else {
    return "uploads/documents";
  }
};

// Generate unique filename with original extension
const generateFilename = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, filename: string) => void
) => {
  const uniqueId = uuidv4();
  const extension = path.extname(file.originalname);
  const filename = `${uniqueId}${extension}`;
  cb(null, filename);
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadDir = getUploadDir(file.mimetype);
    cb(null, uploadDir);
  },
  filename: generateFilename,
});

// File size limits (in bytes)
const limits = {
  fileSize: 50 * 1024 * 1024, // 50MB max file size
  files: 5, // Max 5 files per request
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits,
});

// Single file upload middleware
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Multiple files upload middleware
export const uploadMultiple = (fieldName: string, maxCount: number = 20) =>
  upload.array(fieldName, maxCount);

// Fields upload middleware (for multiple different field names)
export const uploadFields = (fields: multer.Field[]) => upload.fields(fields);

// File validation middleware
export const validateUploadedFile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  // Additional security checks
  const file = req.file;
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".csv",
    ".mp4",
    ".avi",
    ".mov",
    ".wmv",
    ".flv",
    ".webm",
    ".mp3",
    ".wav",
    ".ogg",
    ".aac",
  ];

  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    // Clean up the uploaded file
    fs.unlinkSync(file.path);
    return res.status(400).json({
      success: false,
      message: `File extension ${fileExtension} is not allowed`,
    });
  }

  next();
};

// Multiple files validation middleware
export const validateUploadedFiles = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No files uploaded",
    });
  }

  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".csv",
    ".mp4",
    ".avi",
    ".mov",
    ".wmv",
    ".flv",
    ".webm",
    ".mp3",
    ".wav",
    ".ogg",
    ".aac",
  ];

  // Validate each file
  for (const file of req.files) {
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      // Clean up all uploaded files
      req.files.forEach((f) => fs.unlinkSync(f.path));
      return res.status(400).json({
        success: false,
        message: `File extension ${fileExtension} is not allowed`,
      });
    }
  }

  next();
};

// File cleanup utility
export const cleanupFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error cleaning up file:", error);
  }
};

// Cleanup multiple files
export const cleanupFiles = (filePaths: string[]) => {
  filePaths.forEach(cleanupFile);
};
