import { createAsyncRouter } from "../utils/asyncErrorHandling";
import { reportController } from "../controller/report.controller";

const router = createAsyncRouter();

// Overall Analytics Dashboard - Single comprehensive endpoint
router.get("/overall-analytics", reportController.getOverallAnalytics);

// Training Area Report - Single endpoint for specific training area
router.get("/training-area/:trainingAreaId", reportController.getTrainingAreaReport);

// Certificate Report - All frontliners with their certificate data
router.get("/certificates", reportController.getCertificateReport);

// Users Report - All users with normal user data and filters
router.get("/users", reportController.getUsersReport);

// Organizations Report - All organizations with frontliner statistics
router.get("/organizations", reportController.getOrganizationsReport);

// Sub-Admins Report - All sub-admins with comprehensive statistics
router.get("/sub-admins", reportController.getSubAdminsReport);

// Frontliners Report - All frontliners with comprehensive statistics
router.get("/frontliners", reportController.getFrontlinersReport);

// Dashboard Statistics - Get key metrics for admin dashboard
router.get("/dashboard-stats", reportController.getDashboardStats);

export default router;
