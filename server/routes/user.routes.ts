import { createAsyncRouter } from "../utils/asyncErrorHandling";
const router = createAsyncRouter();
import { userControllers } from "../controller/user.controllers";
import { authorizeRoles } from "../middleware/userTypeAuth";
import passport from "../middleware/passport";

// JWT Authentication Middleware
const authenticateJWT = passport.authenticate("jwt", { session: false });
// authenticateJWT,authorizeRoles("admin"), -> add this to the routes that you want to protect

// ==================== AUTHENTICATION FUNCTIONS ====================
router.post("/login", userControllers.login); // logout function shoudl be on client side only

// ==================== PASSWORD RESET FUNCTIONS ====================
router.post("/password-reset/request", userControllers.requestPasswordReset);
router.get(
  "/password-reset/verify/:token",
  userControllers.verifyPasswordResetToken
);
router.post("/password-reset/reset", userControllers.resetPassword);

// ==================== USER CRUD FUNCTIONS ====================
router.get("/", userControllers.getAllUsers);
router.get("/:id", userControllers.getUserById);
router.post("/", userControllers.create);
router.put("/:id", userControllers.updateUser);
router.delete("/:id", userControllers.deleteUser);

// ==================== ASSETS CRD FUNCTIONS ====================
router.get("/assets", userControllers.getAllAssets);
router.post("/assets", userControllers.createAsset);
router.delete("/assets/:id", userControllers.deleteAsset);

// ==================== ROLE CATEGORIES CRD FUNCTIONS ====================
router.get("/role-categories", userControllers.getAllRoleCategories);
router.post("/role-categories", userControllers.createRoleCategory);
router.delete("/role-categories/:id", userControllers.deleteRoleCategory);

// ==================== ROLES CRD FUNCTIONS ====================
router.get("/roles", userControllers.getAllRoles);
router.post("/roles", userControllers.createRole);
router.delete("/roles/:id", userControllers.deleteRole);

// ==================== SENIORITY LEVELS CRD FUNCTIONS ====================
router.get("/seniority-levels", userControllers.getAllSeniorityLevels);
router.post("/seniority-levels", userControllers.createSeniorityLevel);
router.delete("/seniority-levels/:id", userControllers.deleteSeniorityLevel);

// ==================== SUB-ADMIN CREATION & REGISTRATION FUNCTIONS ====================
router.post(
  "/sub-admins/register/:id",
  userControllers.completeSubAdminRegistration
);
router.get(
  "/sub-admins/registration/:id",
  userControllers.getSubAdminRegistrationDetails
);

// ==================== INVITATION FUNCTIONS ====================
router.post("/invitations", userControllers.createInvitation);
router.get("/invitations/verify/:token", userControllers.getInvitationByToken);
router.get(
  "/invitations/creator/:createdBy",
  userControllers.getInvitationsByCreator
);
router.delete(
  "/invitations/token/:token",
  userControllers.deleteInvitationByToken
);

export default router;
