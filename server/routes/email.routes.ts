import { createAsyncRouter } from "../utils/asyncErrorHandling";
const router = createAsyncRouter();
import { EmailController } from "../controller/email.controller";

// ==================== EMAIL ROUTES ====================
router.get("/retake-ics", EmailController.generateIcsFile);

export default router;
