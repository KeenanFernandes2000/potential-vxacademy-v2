import { createAsyncRouter } from "../utils/asyncErrorHandling";
const router = createAsyncRouter();
import { EmailController } from "../controller/email.controller";

// ==================== EMAIL ROUTES ====================
router.get("/retake-ics", EmailController.generateIcsFile);

router.post(
  "/sendTrainingAreaAnnouncement",
  EmailController.sendTrainingAreaAnnouncement
);

router.post(
  "/sendInitialAssessmentFailed",
  EmailController.sendInitialAssessmentFailed
);

router.post(
  "/sendInitialAssessmentPassed",
  EmailController.sendInitialAssessmentPassed
);

export default router;
