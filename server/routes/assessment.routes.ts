import { createAsyncRouter } from "../utils/asyncErrorHandling";
const router = createAsyncRouter();
import {
  AssessmentController,
  QuestionController,
  AssessmentAttemptController,
} from "../controller/assessment.controller";
import { authorizeRoles } from "../middleware/userTypeAuth";
import passport from "../middleware/passport";

// JWT Authentication Middleware
const authenticateJWT = passport.authenticate("jwt", { session: false });
// authenticateJWT,authorizeRoles("admin"), -> add this to the routes that you want to protect

// ==================== ASSESSMENT ROUTES ====================
router.get("/assessments", AssessmentController.getAllAssessments);
router.get("/assessments/:id", AssessmentController.getAssessmentById);
router.get(
  "assessments/training-areas/:trainingAreaId/",
  AssessmentController.getAssessmentsByTrainingArea
);
router.get(
  "/assessments/modules/:moduleId/",
  AssessmentController.getAssessmentsByModule
);
router.get(
  "/assessments/courses/:courseId/",
  AssessmentController.getAssessmentsByCourse
);
router.get(
  "/assessments/units/:unitId/",
  AssessmentController.getAssessmentsByUnit
);
router.post(
  "/assessments",
  authenticateJWT,
  authorizeRoles("admin"),
  AssessmentController.createAssessment
);
router.put(
  "/assessments/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  AssessmentController.updateAssessment
);
router.delete(
  "/assessments/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  AssessmentController.deleteAssessment
);

// ==================== QUESTION ROUTES ====================
router.get("/questions", QuestionController.getAllQuestions);
router.get("/questions/:id", QuestionController.getQuestionById);
router.get(
  "/assessments/:assessmentId/questions",
  QuestionController.getQuestionsByAssessment
);
router.post(
  "/questions",
  authenticateJWT,
  authorizeRoles("admin"),
  QuestionController.createQuestion
);
router.put(
  "/questions/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  QuestionController.updateQuestion
);
router.delete(
  "/questions/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  QuestionController.deleteQuestion
);

// ==================== ASSESSMENT ATTEMPT ROUTES ====================
router.get(
  "/assessment-attempts",
  authenticateJWT,
  authorizeRoles("admin"),
  AssessmentAttemptController.getAllAssessmentAttempts
);
router.get(
  "/assessment-attempts/:id",
  authenticateJWT,
  AssessmentAttemptController.getAssessmentAttemptById
);
router.get(
  "/users/:userId/assessment-attempts",
  authenticateJWT,
  AssessmentAttemptController.getAssessmentAttemptsByUser
);
router.get(
  "/assessments/:assessmentId/attempts",
  authenticateJWT,
  AssessmentAttemptController.getAssessmentAttemptsByAssessment
);
router.get(
  "/users/:userId/assessments/:assessmentId/attempts",
  authenticateJWT,
  AssessmentAttemptController.getAssessmentAttemptsByUserAndAssessment
);
router.get(
  "/users/:userId/assessments/:assessmentId/best-score",
  authenticateJWT,
  AssessmentAttemptController.getBestScoreByUserAndAssessment
);
router.post(
  "/assessment-attempts",
  authenticateJWT,
  AssessmentAttemptController.createAssessmentAttempt
);
router.put(
  "/assessment-attempts/:id",
  authenticateJWT,
  AssessmentAttemptController.updateAssessmentAttempt
);
router.delete(
  "/assessment-attempts/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  AssessmentAttemptController.deleteAssessmentAttempt
);

export default router;
