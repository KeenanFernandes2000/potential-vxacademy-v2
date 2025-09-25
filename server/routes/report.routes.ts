import { createAsyncRouter } from "../utils/asyncErrorHandling";
import { reportController } from "../controller/report.controller";

const router = createAsyncRouter();

// Overall Analytics Dashboard - Single comprehensive endpoint
router.get("/overall-analytics", reportController.getOverallAnalytics);

export default router;
