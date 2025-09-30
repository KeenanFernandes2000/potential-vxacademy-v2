import { createAsyncRouter } from "../utils/asyncErrorHandling";
const router = createAsyncRouter();
import {
  TrainingAreaController,
  ModuleController,
  CourseController,
  UnitController,
  CourseUnitController,
  LearningBlockController,
  UnitRoleAssignmentController,
  CertificateController,
} from "../controller/training.controllers";
import { authorizeRoles } from "../middleware/userTypeAuth";
import passport from "../middleware/passport";

// JWT Authentication Middleware
const authenticateJWT = passport.authenticate("jwt", { session: false });
// authenticateJWT,authorizeRoles("admin"), -> add this to the routes that you want to protect

// ==================== TRAINING AREA ROUTES ====================
router.get("/training-areas", TrainingAreaController.getAllTrainingAreas);
router.get("/training-areas/:id", TrainingAreaController.getTrainingAreaById);
router.post(
  "/training-areas",
  authenticateJWT,
  authorizeRoles("admin"),
  TrainingAreaController.createTrainingArea
);
router.put(
  "/training-areas/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  TrainingAreaController.updateTrainingArea
);
router.delete(
  "/training-areas/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  TrainingAreaController.deleteTrainingArea
);

// ==================== MODULE ROUTES ====================
router.get("/modules", ModuleController.getAllModules);
router.get("/modules/:id", ModuleController.getModuleById);
router.get(
  "/modules/training-area/:trainingAreaId/",
  ModuleController.getModulesByTrainingArea
);
router.post(
  "/modules",
  authenticateJWT,
  authorizeRoles("admin"),
  ModuleController.createModule
);
router.put(
  "/modules/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  ModuleController.updateModule
);
router.delete(
  "/modules/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  ModuleController.deleteModule
);

// ==================== COURSE ROUTES ====================
// Public endpoint for users - only returns published courses
router.get("/courses/published", CourseController.getPublishedCourses);
// Admin endpoint - returns all courses including drafts
router.get("/courses", CourseController.getAllCourses);
router.get("/courses/:id", CourseController.getCourseById);
router.get("/courses/module/:moduleId", CourseController.getCoursesByModule);
router.post(
  "/courses",
  authenticateJWT,
  authorizeRoles("admin"),
  CourseController.createCourse
);
router.put(
  "/courses/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  CourseController.updateCourse
);
router.delete(
  "/courses/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  CourseController.deleteCourse
);

// ==================== UNIT ROUTES ====================
router.get("/units", UnitController.getAllUnits);
router.get("/units/:id", UnitController.getUnitById);
router.post(
  "/units",
  authenticateJWT,
  authorizeRoles("admin"),
  UnitController.createUnit
);
router.put(
  "/units/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  UnitController.updateUnit
);
router.delete(
  "/units/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  UnitController.deleteUnit
);

// ==================== COURSE UNIT ROUTES ====================
router.get("/course-units", CourseUnitController.getAllCourseUnits);
router.get("/course-units/:id", CourseUnitController.getCourseUnitById);
router.get(
  "/course-units/course/:courseId/",
  CourseUnitController.getCourseUnitsByCourse
);
router.post(
  "/course-units",
  authenticateJWT,
  authorizeRoles("admin"),
  CourseUnitController.createCourseUnit
);
router.put(
  "/course-units/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  CourseUnitController.updateCourseUnit
);
router.delete(
  "/course-units/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  CourseUnitController.deleteCourseUnit
);

// ==================== LEARNING BLOCK ROUTES ====================
router.get("/learning-blocks", LearningBlockController.getAllLearningBlocks);
router.get(
  "/learning-blocks/:id",
  LearningBlockController.getLearningBlockById
);
router.get(
  "/learning-blocks/unit/:unitId/",
  LearningBlockController.getLearningBlocksByUnit
);
router.post(
  "/learning-blocks",
  authenticateJWT,
  authorizeRoles("admin"),
  LearningBlockController.createLearningBlock
);
router.put(
  "/learning-blocks/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  LearningBlockController.updateLearningBlock
);
router.delete(
  "/learning-blocks/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  LearningBlockController.deleteLearningBlock
);

// ==================== UNIT ROLE ASSIGNMENT ROUTES ====================
router.get(
  "/unit-role-assignments",
  UnitRoleAssignmentController.getAllUnitRoleAssignments
);
router.get(
  "/unit-role-assignments/:id",
  UnitRoleAssignmentController.getUnitRoleAssignmentById
);
router.get(
  "/unit-role-assignments/unit/:unitId",
  UnitRoleAssignmentController.getUnitRoleAssignmentsByUnitId
);
router.post(
  "/unit-role-assignments",
  authenticateJWT,
  authorizeRoles("admin"),
  UnitRoleAssignmentController.createUnitRoleAssignment
);
router.put(
  "/unit-role-assignments/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  UnitRoleAssignmentController.updateUnitRoleAssignment
);
router.delete(
  "/unit-role-assignments/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  UnitRoleAssignmentController.deleteUnitRoleAssignment
);

// ==================== CERTIFICATE ROUTES ====================
router.get(
  "/certificates/training-area/:trainingAreaId/user/:userId",
  authenticateJWT,
  CertificateController.getCertificatesByTrainingAreaAndUser
);
router.get(
  "/certificates/:id",
  authenticateJWT,
  CertificateController.getCertificateById
);

export default router;
