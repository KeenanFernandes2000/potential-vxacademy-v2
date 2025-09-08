import { createAsyncRouter } from "../utils/asyncErrorHandling";
const router = createAsyncRouter();
import { MediaController } from "../controller/media.controller";
import { authorizeRoles } from "../middleware/userTypeAuth";
import passport from "../middleware/passport";
import {
  uploadSingle,
  uploadMultiple,
  validateUploadedFile,
  validateUploadedFiles,
} from "../middleware/upload";

// JWT Authentication Middleware
const authenticateJWT = passport.authenticate("jwt", { session: false });
// authenticateJWT,authorizeRoles("admin"), -> add this to the routes that you want to protect

// ==================== MEDIA FILE UPLOAD FUNCTIONS ====================
router.post(
  "/upload",
  authenticateJWT,
  uploadSingle("file"),
  validateUploadedFile,
  MediaController.uploadMediaFile
);

router.post(
  "/upload-multiple",
  authenticateJWT,
  uploadMultiple("files", 10), // Max 10 files per request
  validateUploadedFiles,
  MediaController.uploadMultipleMediaFiles
);
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  MediaController.deleteMediaFile
);

// ==================== MEDIA FILE READ FUNCTIONS ====================
router.get("/:id", MediaController.getMediaFileById);
router.get("/", authenticateJWT, MediaController.getAllMediaFiles);
router.get(
  "/uploader/:uploadedBy",
  authenticateJWT,
  MediaController.getMediaFilesByUploader
);
router.get(
  "/type/:mimeType",
  authenticateJWT,
  MediaController.getMediaFilesByMimeType
);
router.get(
  "/search",
  authenticateJWT,
  MediaController.searchMediaFilesByFilename
);

export default router;
