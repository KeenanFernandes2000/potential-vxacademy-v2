import { createAsyncRouter } from "../utils/asyncErrorHandling";
const router = createAsyncRouter();
import {
  LearningBlockProgressController,
  ProgressController,
} from "../controller/progress.controllers";
import { authorizeRoles } from "../middleware/userTypeAuth";
import passport from "../middleware/passport";

// JWT Authentication Middleware
const authenticateJWT = passport.authenticate("jwt", { session: false });

// ==================== LEARNING BLOCK PROGRESS ROUTES ====================

/**
 * @route   POST /api/progress/learning-blocks/complete
 * @desc    Mark a learning block as completed and cascade progress updates
 * @access  Private (User, Sub-admin, Admin)
 */
router.post(
  "/learning-blocks/complete",
  authenticateJWT,
  authorizeRoles("user", "sub_admin", "admin"),
  LearningBlockProgressController.completeLearningBlock
);

/**
 * @route   GET /api/progress/learning-blocks/:userId
 * @desc    Get all learning block progress for a user
 * @access  Private (User [own data], Sub-admin, Admin)
 */
router.get(
  "/learning-blocks/:userId",
  authenticateJWT,
  authorizeRoles("user", "sub_admin", "admin"),
  LearningBlockProgressController.getUserLearningBlockProgress
);

/**
 * @route   GET /api/progress/learning-blocks/:userId/:learningBlockId
 * @desc    Get specific learning block progress for a user
 * @access  Private (User [own data], Sub-admin, Admin)
 */
router.get(
  "/learning-blocks/:userId/:learningBlockId",
  authenticateJWT,
  authorizeRoles("user", "sub_admin", "admin"),
  LearningBlockProgressController.getUserLearningBlockProgress
);

// ==================== GENERAL PROGRESS ROUTES ====================

/**
 * @route   GET /api/progress/user/:userId
 * @desc    Get all progress for a user across all levels
 * @access  Private (User [own data], Sub-admin, Admin)
 */
router.get(
  "/user/:userId",
  authenticateJWT,
  authorizeRoles("user", "sub_admin", "admin"),
  ProgressController.getUserProgress
);

/**
 * @route   GET /api/progress/user/:userId/detailed
 * @desc    Get detailed progress with hierarchy information
 * @access  Private (User [own data], Sub-admin, Admin)
 */
router.get(
  "/user/:userId/detailed",
  authenticateJWT,
  authorizeRoles("user", "sub_admin", "admin"),
  ProgressController.getDetailedUserProgress
);

// ==================== TRAINING AREA PROGRESS ROUTES ====================

/**
 * @route   GET /api/progress/training-areas/:userId
 * @desc    Get all training area progress for a user
 * @access  Private (User [own data], Sub-admin, Admin)
 */
router.get(
  "/training-areas/:userId",
  authenticateJWT,
  authorizeRoles("user", "sub_admin", "admin"),
  ProgressController.getUserTrainingAreaProgress
);

/**
 * @route   GET /api/progress/training-areas/:userId/:trainingAreaId
 * @desc    Get specific training area progress for a user
 * @access  Private (User [own data], Sub-admin, Admin)
 */
router.get(
  "/training-areas/:userId/:trainingAreaId",
  authenticateJWT,
  authorizeRoles("user", "sub_admin", "admin"),
  ProgressController.getUserTrainingAreaProgress
);

// ==================== MODULE PROGRESS ROUTES ====================

/**
 * @route   GET /api/progress/modules/:userId
 * @desc    Get all module progress for a user
 * @access  Private (User [own data], Sub-admin, Admin)
 */
router.get(
  "/modules/:userId",
  authenticateJWT,
  authorizeRoles("user", "sub_admin", "admin"),
  ProgressController.getUserModuleProgress
);

/**
 * @route   GET /api/progress/modules/:userId/:moduleId
 * @desc    Get specific module progress for a user
 * @access  Private (User [own data], Sub-admin, Admin)
 */
router.get(
  "/modules/:userId/:moduleId",
  authenticateJWT,
  authorizeRoles("user", "sub_admin", "admin"),
  ProgressController.getUserModuleProgress
);

// ==================== COURSE PROGRESS ROUTES ====================

/**
 * @route   GET /api/progress/courses/:userId
 * @desc    Get all course progress for a user
 * @access  Private (User [own data], Sub-admin, Admin)
 */
router.get(
  "/courses/:userId",
  authenticateJWT,
  authorizeRoles("user", "sub_admin", "admin"),
  ProgressController.getUserCourseProgress
);

/**
 * @route   GET /api/progress/courses/:userId/:courseId
 * @desc    Get specific course progress for a user
 * @access  Private (User [own data], Sub-admin, Admin)
 */
router.get(
  "/courses/:userId/:courseId",
  authenticateJWT,
  authorizeRoles("user", "sub_admin", "admin"),
  ProgressController.getUserCourseProgress
);

// ==================== COURSE-UNIT PROGRESS ROUTES ====================

/**
 * @route   GET /api/progress/course-units/:userId
 * @desc    Get all course-unit progress for a user
 * @access  Private (User [own data], Sub-admin, Admin)
 */
router.get(
  "/course-units/:userId",
  authenticateJWT,
  authorizeRoles("user", "sub_admin", "admin"),
  ProgressController.getUserCourseUnitProgress
);

/**
 * @route   GET /api/progress/course-units/:userId/:courseUnitId
 * @desc    Get specific course-unit progress for a user
 * @access  Private (User [own data], Sub-admin, Admin)
 */
router.get(
  "/course-units/:userId/:courseUnitId",
  authenticateJWT,
  authorizeRoles("user", "sub_admin", "admin"),
  ProgressController.getUserCourseUnitProgress
);

// ==================== LEARNING PATH COMPLETION ROUTES ====================

/**
 * @route   POST /api/progress/learning-path-completion
 * @desc    Get learning path completion status based on asset, role category, units, and seniority
 * @access  Private (User [own data], Sub-admin, Admin)
 */
router.post(
  "/learning-path-completion",
  authenticateJWT,
  authorizeRoles("user", "sub_admin", "admin"),
  ProgressController.getLearningPathCompletion
);

// ==================== ADMIN ROUTES ====================

/**
 * @route   DELETE /api/progress/user/:userId/reset
 * @desc    Reset all progress for a user (admin function)
 * @access  Private (Admin only)
 */
router.delete(
  "/user/:userId/reset",
  authenticateJWT,
  authorizeRoles("admin"),
  ProgressController.resetUserProgress
);

/**
 * @route   POST /api/progress/user/:userId/recalculate
 * @desc    Recalculate all progress for a user based on completed learning blocks and assessments
 * @access  Private (Sub-admin, Admin)
 */
router.post(
  "/user/:userId/recalculate",
  authenticateJWT,
  // authorizeRoles("sub_admin", "admin"),
  ProgressController.recalculateUserProgress
);

export default router;
