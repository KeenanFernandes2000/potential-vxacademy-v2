import { createAsyncRouter } from "../utils/asyncErrorHandling";
import { reportController } from "../controller/report.controller";

const router = createAsyncRouter();

// Overall Analytics Dashboard - Single comprehensive endpoint
router.get("/overall-analytics", reportController.getOverallAnalytics);

// Training Area Report - Single endpoint for specific training area
router.get("/training-area/:trainingAreaId", reportController.getTrainingAreaReport);

export default router;
